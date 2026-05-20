import type { InterstellarEventsModule } from "@DClient/chat/chatTypes.js";

export const playersChatListener = (
  callback: (message: string) => void,
): void => {
  const interstellarEvents = window.StellarExports[
    "@interstellar/InterstellarEvents"
  ] as InterstellarEventsModule;
  const ChatMessageRecieveEvent = interstellarEvents.ChatMessageRecieveEvent;
  const processedEvents = new WeakSet<object>();

  ChatMessageRecieveEvent.prototype.getHTML = new Proxy(
    ChatMessageRecieveEvent.prototype.getHTML,
    {
      apply: (target, self, arguments_): string => {
        const html = Reflect.apply(target, self, arguments_);
        if (!processedEvents.has(self as object)) {
          processedEvents.add(self as object);
          callback(html);
        }
        return html;
      },
    },
  );
};
