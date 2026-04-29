import pino from "pino";

const isDevelopment = process.env["NODE_ENV"] === "development";
const LOG_DIR = "./logs";

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
        // [12:34:56.789] INFO  [CommandHandler] › Command loaded
        messageFormat: "[{prefix}] \u203A {msg}",
      },
      level: isDevelopment ? "trace" : "info",
    },
    {
      target: "pino-roll",
      options: {
        file: `${LOG_DIR}/combined.log`,
        frequency: "daily",
        mkdir: true,
        dateFormat: "yyyy-MM-dd",
        limit: { count: 14 },
      },
      level: "info",
    },
    {
      target: "pino-roll",
      options: {
        file: `${LOG_DIR}/error.log`,
        frequency: "daily",
        mkdir: true,
        dateFormat: "yyyy-MM-dd",
        limit: { count: 30 },
      },
      level: "warn",
    },
  ],
});

const base = pino(
  {
    level: isDevelopment ? "trace" : "info",
    serializers: { err: pino.stdSerializers.errWithCause },
  },
  transport,
);

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface Logger {
  trace(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(messageOrError: string | Error, context?: Record<string, unknown>): void;
  fatal(messageOrError: string | Error, context?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

const wrap = (inst: pino.Logger): Logger => {
  const emit = (
    level: LogLevel,
    messageOrError: string | Error,
    context?: Record<string, unknown>,
  ): void => {
    if (messageOrError instanceof Error) 
      inst[level]({ err: messageOrError, ...context }, messageOrError.message);
    else if (context) inst[level](context, messageOrError);
    else inst[level](messageOrError);
  };

  return {
    trace: (message, context): void => {
      emit("trace", message, context);
    },
    debug: (message, context): void => {
      emit("debug", message, context);
    },
    info: (message, context): void => {
      emit("info", message, context);
    },
    warn: (message, context): void => {
      emit("warn", message, context);
    },
    error: (messageOrError, context): void => {
      emit("error", messageOrError, context);
    },
    fatal: (messageOrError, context): void => {
      emit("fatal", messageOrError, context);
    },
    child: (bindings): Logger => wrap(inst.child(bindings)),
  };
};

export const createLogger = (prefix: string): Logger => wrap(base.child({ prefix }));

export const logger = createLogger("app");