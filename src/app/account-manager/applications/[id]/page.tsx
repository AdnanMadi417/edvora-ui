"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "lib/useApi";
import Cookies from "js-cookie";
import EmptyData from "components/emptyData/EmptyData";
import ApplicationDetails from "components/applications/details/admin/ApplicationDetails";
import ApplicationDocuments from "components/applications/details/admin/ApplicationDocuments";
import Loading from "components/loading/Loading";
import { MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AgentPartnerChat from "components/chat/ApplicationChat";

export default function ApplicationPage() {

  const { id: applicationId } = useParams<{ id: string }>();
  const { id } = useParams();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = Cookies.get("token");

        if (!id) return;

        const res = await api.get(
          `/admin/applications/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setApplication(res.data);
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) return <Loading text="Fetching application data..." />;
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
        {chatOpen ? <X size={26} /> : <MessageCircle size={28} />}
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="application-chat"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-96 overflow-hidden rounded-md border bg-card shadow-md dark:border-navy-700 dark:bg-navy-800"
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
