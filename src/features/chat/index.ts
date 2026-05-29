export { default as ApplicationChat } from "./components/ApplicationChat";

export type { ChatMessage } from "./types";

export { useChatMessages } from "./hooks/useChatMessages";
export { useChatPolling } from "./hooks/useChatPolling";
export { useMarkMessagesRead } from "./hooks/useMarkMessagesRead";
export { useSendMessage } from "./hooks/useSendMessage";
export { useUnreadCount } from "./hooks/useUnreadCount";
