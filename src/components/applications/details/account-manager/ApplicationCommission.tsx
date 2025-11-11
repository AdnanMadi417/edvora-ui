"use client";

import React from "react";
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ApplicationCommissionsProps {
  application: any;
}

export default function ApplicationCommissions({ application }: ApplicationCommissionsProps) {
  const commissions = application?.commissions || [];

  const statusMap: Record<string, any> = {
    "1": { icon: <Clock className="h-5 w-5 text-yellow-500" />, text: "Pending", badge: "bg-yellow-100 text-yellow-700" },
    "2": { icon: <CheckCircle className="h-5 w-5 text-green-600" />, text: "Approved", badge: "bg-green-100 text-green-700" },
    "3": { icon: <XCircle className="h-5 w-5 text-red-600" />, text: "Rejected", badge: "bg-red-100 text-red-700" },
    default: { icon: <AlertCircle className="h-5 w-5 text-gray-500" />, text: "Unknown", badge: "bg-gray-100 text-gray-700" },
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Not provided";

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const total = commissions.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  return (
    <section className="mb-6 mt-6 rounded-lg border border-default bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <DollarSign className="text-xl text-green-700" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Commission Details
          </h3>
          <p className="text-sm text-text-muted">
            Total: {formatCurrency(total)} ({commissions.length} {commissions.length === 1 ? "record" : "records"})
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {commissions.length === 0 ? (
          <p className="text-center text-gray-500">No commission records found.</p>
        ) : (
          commissions.map((c: any, i: number) => {
            const status = statusMap[c.status] || statusMap.default;
            return (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-default p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">{status.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Commission #{i + 1}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.badge}`}>{status.text}</span>
                    </div>
                    <div className="text-green-600 font-bold">{formatCurrency(c.amount)}</div>
                    <div className="text-xs text-slate-600">Created: {formatDate(c.created_at)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
