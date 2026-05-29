import { useEffect, useRef } from "react";

interface UseChatPollingOptions {
  enabled: boolean;
  fetchNewMessages: () => Promise<void>;
  pollIntervalMs?: number;
}

export function useChatPolling({
  enabled,
  fetchNewMessages,
  pollIntervalMs = 5000,
}: UseChatPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    fetchNewMessages();

    intervalRef.current = setInterval(() => {
      fetchNewMessages();
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, fetchNewMessages, pollIntervalMs]);
}
