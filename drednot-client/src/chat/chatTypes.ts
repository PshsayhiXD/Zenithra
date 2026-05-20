export interface ChatMessageSendEventInstance {
  msg: string;
}

export type ChatMessageSendEventConstructor = new (
  message: string
) => ChatMessageSendEventInstance;

export interface InterstellarEventsModule {
  ChatMessageRecieveEvent: {
    prototype: {
      getHTML: (...arguments_: unknown[]) => string;
    };
  };
  ChatMessageSendEvent: ChatMessageSendEventConstructor;
}
