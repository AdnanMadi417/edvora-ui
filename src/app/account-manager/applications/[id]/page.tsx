"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import EmptyData from "components/emptyData/EmptyData";
import ApplicationDetails from "components/applications/details/account-manager/ApplicationDetails";
import ApplicationDocuments from "components/applications/details/account-manager/ApplicationDocuments";
import Loading from "components/loading/Loading";
import { MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AgentPartnerChat from "components/chat/ApplicationChat";
import { useUnreadCount } from 'hooks/chat/useUnreadCount';
import { useAccountManagerApplication } from 'hooks/applications/useAccountManagerApplication';
import { useMe } from 'hooks/useMe';

export default function ApplicationPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  const { user } = useMe();
  const [chatOpen, setChatOpen] = useState(false);

  const managerId = user?.id;

  const { data: application, loading, error, refetch } = useAccountManagerApplication({
    managerId: managerId || "",
    applicationId: applicationId || "",
  });

  const { unreadCount } = useUnreadCount({
    applicationId,
  });

  if (loading) return <Loading text="Fetching application data..." />;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!application) return <EmptyData />;

  return (
    <>
      <ApplicationDetails application={application} />
      <ApplicationDocuments application={application} />

      <button
        onClick={() => setChatOpen((v) => !v)}
        aria-label={chatOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700"
      >
        <div className="relative">
          {chatOpen ? <X size={26} /> : <MessageCircle size={28} />}

          {unreadCount > 0 && !chatOpen && (
            <span className="absolute -right-6 -top-6 flex h-5 w-5 border-3 border-slate-200  items-center justify-center rounded-md bg-red-500 text-xs font-medium">
        {unreadCount}
      </span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="application-chat"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-full overflow-hidden rounded-md border bg-card shadow-md dark:border-navy-700 dark:bg-navy-800"
          >
            <AgentPartnerChat
              applicationId={applicationId}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
