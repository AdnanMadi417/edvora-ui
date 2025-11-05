"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import AgentPartnerChat from "components/chatbot/ChatInputBox";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import partnerRoutes from '../../routes/partnerRoutes';
import RoleGuard from "components/guard/RoleGuard";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const pathname = usePathname();

  return (
    <RoleGuard allowedRoles={["partner"]}>
      <div className="relative flex min-h-screen w-full bg-background-100 dark:bg-background-900">
        <div className="z-[60]">
          <Sidebar
            routes={partnerRoutes}
            open={open}
            setOpen={setOpen}
            variant="admin"
          />
        </div>

        <div className="relative h-full w-full font-dm dark:bg-navy-900">
          <main className="mx-2.5 flex-none transition-all md:pr-2 xl:ml-[300px]">
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(partnerRoutes, pathname)}
              secondary={getActiveNavbar(partnerRoutes, pathname)}
            />
            <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </main>

          {/*<button*/}
          {/*  onClick={() => setChatOpen(!chatOpen)}*/}
          {/*  aria-label={chatOpen ? "Close chatbot" : "Open chatbot"}*/}
          {/*  className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none"*/}
          {/*>*/}
          {/*  {chatOpen ? <X size={26} /> : <MessageCircle size={28} />}*/}
          {/*</button>*/}

          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="chat-popup"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed bottom-24 right-6 z-50 w-96 overflow-hidden rounded-md border border-gray-200 bg-card shadow-md dark:border-navy-700 dark:bg-navy-800"
              >
                <AgentPartnerChat />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </RoleGuard>
  );
}
