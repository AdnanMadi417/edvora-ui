import React from "react";
import { Users, CheckCircle, Globe, FolderOpen } from "lucide-react";

export default function PartnerSummaryCards() {

  const stats = [
    {
      title: "Total Applications",
      value: "5",
      icon: FolderOpen,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
    },
    {
      title: "Active Students",
      value: "5",
      icon: Users,
      iconColor: "text-green-500",
      iconBg: "bg-green-100",
    },
    {
      title: "Success Rate",
      value: "0%",
      icon: CheckCircle,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-100",
    },
    {
      title: "Countries",
      value: "5",
      icon: Globe,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <section className="">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 "
            >
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-full ${item.iconBg}`}>
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">
                  {item.title}
                </div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}