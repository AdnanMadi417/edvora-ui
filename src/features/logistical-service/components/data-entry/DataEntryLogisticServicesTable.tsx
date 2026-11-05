"use client";

import React, { useState } from "react";
import { Pencil, Check, X, Settings, Plus, Tag, Truck } from "lucide-react";

import { useLogisticServices, useEditLogisticService } from "features/logistical-service/hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import CreateLogisticsMarketplacePopup from "../admin/CreateLogisticsMarketplacePopup";

const DataEntryLogisticServicesTable = () => {
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
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to update service."), "error");
    }
  };

  return (
    <>
      <div className="mt-6 overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white p-6">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-blue-200 bg-blue-50">
              <Settings className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="mt-0.5 text-sm text-slate-500">Manage available logistic service types</p>
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

        <TableWrapper>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-500" />
                    <span>Service Name</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loadingLogisticServices && <TableSkeletonRows columns={2} rows={5} />}

              {!loadingLogisticServices && errorLogisticServices && (
                <TableErrorRow colSpan={2} message={errorLogisticServices} />
              )}

              {!loadingLogisticServices && !errorLogisticServices && logisticServices.length === 0 && (
                <TableEmptyRow
                  colSpan={2}
                  title="No logistic services found"
                  subtitle="No services have been added yet."
                  icon={<Truck className="h-8 w-8 text-slate-400" />}
                />
              )}

              {!loadingLogisticServices && !errorLogisticServices && logisticServices.map((service) => (
                <tr key={service.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    {editingId === service.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave(service.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="w-full max-w-sm rounded-md border border-blue-400 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-800">{service.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === service.id ? (
                      <div className="flex items-center gap-2">
                        <IconButton
                          onClick={() => handleSave(service.id)}
                          disabled={loadingEditLogisticService}
                          aria-label="Save"
                          icon={<Check className="h-4 w-4" />}
                          bgColor="bg-transparent"
                          textColor="text-green-600"
                          borderColor="border-green-600"
                          hoverTextColor="hover:text-green-700"
                          hoverBorderColor="hover:border-green-700"
                          className="hover:bg-green-50"
                        />
                        <IconButton
                          onClick={cancelEdit}
                          aria-label="Cancel"
                          icon={<X className="h-4 w-4" />}
                          bgColor="bg-transparent"
                          textColor="text-slate-500"
                          borderColor="border-slate-300"
                          hoverTextColor="hover:text-slate-700"
                          hoverBorderColor="hover:border-slate-300"
                          className="hover:bg-slate-50"
                        />
                      </div>
                    ) : (
                      <IconButton
                        onClick={() => startEdit(service.id, service.name)}
                        aria-label="Edit service"
                        icon={<Pencil className="h-4 w-4" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-500"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-slate-700"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-slate-100"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </div>

      <CreateLogisticsMarketplacePopup
        isOpen={isCreateServiceOpen}
        onClose={() => setIsCreateServiceOpen(false)}
        onCreated={refetchLogisticServices}
      />
    </>
  );
};

export default DataEntryLogisticServicesTable;
