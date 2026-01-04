import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: any[];
  currentUserId?: string;
  loading: boolean;
  error: string | null;
}

export default function MessageList({
                                      messages,
                                      currentUserId,
                                      loading,
                                      error,
                                    }: MessageListProps) {
  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading messages…</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isMine={msg.sender_id === currentUserId}
        />
      ))}
    </div>
  );
}
