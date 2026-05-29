export interface ChatMessage {
  id: string;
  application_id: string;
  sender_id: string;
  sender_name: string;
  message_text: string;
  created_at: string;
  read_at: string | null;
}
