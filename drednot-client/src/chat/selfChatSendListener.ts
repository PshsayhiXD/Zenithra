import type {
  ChatMessageSendEventConstructor,
  ChatMessageSendEventInstance,
  InterstellarEventsModule,
} from "@DClient/chat/chatTypes.js";

export const selfChatSendListener = (
  callback: (message: string) => void,
): void => {
  const interstellarEvents = window.StellarExports[
    "@interstellar/InterstellarEvents"
  ] as InterstellarEventsModule;
  const OriginalClass = interstellarEvents.ChatMessageSendEvent;
  const processedEvents = new WeakSet<object>();
  const recentMessages = new Map<string, number>();
  const DUPLICATE_WINDOW_MS = 250;

  interstellarEvents.ChatMessageSendEvent = new Proxy(
    OriginalClass,
    {
      construct: (
        target,
        arguments_,
        newTarget,
      ): ChatMessageSendEventInstance => {
        const [message] = arguments_ as ConstructorParameters<ChatMessageSendEventConstructor>;
        const instance = Reflect.construct(
          target,
          arguments_,
          newTarget,
        ) as ChatMessageSendEventInstance;

        if (processedEvents.has(instance)) return instance;
        processedEvents.add(instance);

        const now = Date.now();
        const lastTime = recentMessages.get(message);
        if (typeof lastTime === "number" && now - lastTime < DUPLICATE_WINDOW_MS) {
          return instance;
        }

        recentMessages.set(message, now);
        callback(message);
        return instance;
      },
    },
  );
};
