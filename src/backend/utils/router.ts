import path from "node:path";
import { readdir } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { RouteModule } from "@backend/types/router/route.js";
import { pathToFileURL } from "node:url";
import { checkRateLimit } from "@backend/utils/ratelimit.js";

export interface RouteDiscoveryItem {
  method: string;
  path: string;
}

interface RouteDefinition {
  pattern: RegExp;
  paramNames: string[];
  module: RouteModule;
  path: string;
}

const routes: RouteDefinition[] = [];

const createRoutePattern = (pathString: string): { pattern: RegExp, paramNames: string[] } => {
  const parameterNames: string[] = [];
  const regexString = pathString.replace(/\[([^\]]+)]/g, (_, parameterName: string) => {
    parameterNames.push(parameterName);
    return "([^/]+)";
  });
  return {
    pattern: new RegExp(`^${regexString}$`),
    paramNames: parameterNames,
  };
};

export const loadRoutes = async (directory: string, basePath = ""): Promise<void> => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await loadRoutes(path.join(directory, entry.name), `${basePath}/${entry.name}`);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
      const parsed = path.parse(entry.name);
      if (parsed.name.endsWith(".d")) continue;

      const isIndex = parsed.name === "index";
      const routePath = isIndex ? (basePath || "/") : `${basePath}/${parsed.name}`;

      const fileUrl = pathToFileURL(path.join(directory, entry.name)).href;
      const module = await import(fileUrl) as RouteModule;

      const { pattern, paramNames } = createRoutePattern(routePath);
      routes.push({ pattern, paramNames, module, path: routePath });
    }
  }

  routes.sort((a, b) => {
    const aDynamic = a.paramNames.length;
    const bDynamic = b.paramNames.length;
    if (aDynamic !== bDynamic) return aDynamic - bDynamic;
    return b.path.length - a.path.length;
  });
};

export const getRouteDiscoveryItems = (): RouteDiscoveryItem[] => routes.flatMap((route) =>
  Object.keys(route.module).map((method) => ({
    method: method.toUpperCase(),
    path: route.path,
  }))
);

export const matchAndHandleRoute = async (
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string
): Promise<boolean> => {
  for (const route of routes) {
    const match = route.pattern.exec(pathname);
    if (match) {
      const method = request.method as keyof RouteModule;
      const handler = route.module[method];

      if (handler) {
        const ip = request.socket.remoteAddress ?? "unknown";
        const allowed = checkRateLimit(`${method}:${pathname}:${ip}`, 60, 60_000);
        if (!allowed) {
          response.writeHead(429, {
            "Content-Type": "application/json",
          });
          response.end(JSON.stringify({
            error: "Too many requests",
          }));
          return true;
        }
        const parameters: Record<string, string> = {};
        for (let index = 0; index < route.paramNames.length; index++) {
          const key = route.paramNames[index];
          if (key === undefined) continue;
          const matchValue = match[index + 1];
          parameters[key] = decodeURIComponent(
            typeof matchValue === "string" ? matchValue : ""
          );
        }
        await handler(request, response, parameters);
        return true;
      }
    }
  }
  return false;
};
