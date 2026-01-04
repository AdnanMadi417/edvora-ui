interface MessageItemProps {
  message: any;
  isMine: boolean;
}

export default function MessageItem({ message, isMine }: MessageItemProps) {
  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
          isMine
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <p>{message.message_text}</p>
        <span className="block mt-1 text-xs opacity-60">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
