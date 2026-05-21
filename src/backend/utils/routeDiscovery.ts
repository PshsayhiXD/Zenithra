import { getRouteDiscoveryItems, type RouteDiscoveryItem } from "@backend/utils/router.js";

export const discoverRoutes = (): RouteDiscoveryItem[] => getRouteDiscoveryItems();

export type { RouteDiscoveryItem };
