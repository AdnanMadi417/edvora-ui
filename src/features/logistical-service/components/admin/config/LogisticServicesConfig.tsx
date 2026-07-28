"use client";

import React, { useState } from "react";
import { Pencil, Check, X, Settings, Plus } from "lucide-react";

import { useLogisticServices, useEditLogisticService } from "features/logistical-service/hooks";
import Loading from "components/loading/Loading";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import { useToast } from "components/context/ToastContext";
import Button from "components/ui/buttons/Button";
import CreateLogisticsMarketplacePopup from "../CreateLogisticsMarketplacePopup";

const LogisticsMarketplaceServicesConfig = () => {
  const { logisticServices, loadingLogisticServices, errorLogisticServices, refetchLogisticServices } =
    useLogisticServices();
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const { editLogisticService, loadingEditLogisticService } = useEditLogisticService();
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSave = async (serviceId: string) => {
    if (!editingName.trim()) return;
    if (editingName.trim().length < 3) {
      showToast("Name must be at least 3 characters.", "error");
      return;
    }
    if (editingName.trim().length > 255) {
      showToast("Name must not exceed 255 characters.", "error");
      return;
    }
    try {
      await editLogisticService(serviceId, { name: editingName.trim() });
      showToast("Service updated successfully.", "success");
      setEditingId(null);
      setEditingName("");
      setTimeout(() => location.reload(), 1500);
    } catch {
      showToast("Failed to update service.", "error");
    }
  };

  return (
    <>
      <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
        <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-blue-200 bg-blue-50">
                  <Settings className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Logistic Services
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Manage available logistic service types
                  </p>
                </div>
              </div>
              <Button
                icon={<Plus className="h-4 w-4" />}
                text="New Service"
                bgColor="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-blue-800"
                hoverBorderColor="hover:border-blue-700"
                onClick={() => setIsCreateServiceOpen(true)}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {loadingLogisticServices && (
              <Loading text="Fetching logistic services..." />
            )}

            {!loadingLogisticServices &&
              !errorLogisticServices &&
              logisticServices.length === 0 && (
                <NoMessagesFound
                  title="No logistic services found"
                  subtitle="No services have been added yet."
                />
              )}

            {!loadingLogisticServices &&
              logisticServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between bg-white px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  {editingId === service.id ? (
                    <div className="flex flex-1 items-center gap-3">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave(service.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="flex-1 rounded-md border border-blue-400 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        onClick={() => handleSave(service.id)}
                        disabled={loadingEditLogisticService}
                        aria-label="Save"
                        className="flex items-center justify-center rounded-md border border-green-600 p-1.5 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        aria-label="Cancel"
                        className="flex items-center justify-center rounded-md border border-slate-300 p-1.5 text-slate-500 transition hover:bg-slate-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-800">
                        {service.name}
                      </span>
                      <button
                        onClick={() => startEdit(service.id, service.name)}
                        aria-label="Edit service"
                        className="flex items-center justify-center rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      <CreateLogisticsMarketplacePopup
        isOpen={isCreateServiceOpen}
        onClose={() => setIsCreateServiceOpen(false)}
        onCreated={refetchLogisticServices}
      />
    </>
  );
};

export default LogisticsMarketplaceServicesConfig;
