"use client";

import { useSession } from "components/context/SessionContext";
import Combobox from "components/ub/forms/selection/Combobox";
import { useCentreWorkspace } from "features/language-centre-admin/hooks/useCentreWorkspace";
import { inviteCentreAdmin } from "features/language-centre-admin/services/centreWorkspace";
import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

import { useInviteStaffUser } from "../../hooks";

import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { FEATURES } from "config/featureFlags";

interface InviteStaffUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "reviewer", label: "Reviewer" },
  { value: "data_entry", label: "Data entry" },
  ...(FEATURES.languageCentreAdmins ? [{ value: "language_centre_admin", label: "Language Centre Admin" }] : []),
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteStaffUserModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteStaffUserModalProps) {
  const { inviteStaffUser, loading } = useInviteStaffUser();
  const { showToast } = useToast();
  const session = useSession();
  const centreWorkspace = useCentreWorkspace();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    centreId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", email: "", role: "", centreId: "" });
      setErrors({});
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(formData.email.trim()))
      next.email = "Enter a valid email address";
    if (!formData.role) next.role = "Role is required";
    if (formData.role === "language_centre_admin" && !formData.centreId)
      next.centreId = "Choose a language centre.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleInvite = async () => {
    if (!validate()) return;

    try {
      if (formData.role === "language_centre_admin") {
        if (!session?.user)
          throw new Error("An Unibexs Admin session is required.");
        inviteCentreAdmin(session.user, {
          name: formData.name,
          email: formData.email,
          centreId: formData.centreId,
        });
        showToast(
          "Centre-admin invitation saved locally. Manage activation and access in Language Centre Admins.",
          "success"
        );
        onClose();
        onSuccess?.();
        return;
      }
      const res = await inviteStaffUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role as "admin" | "reviewer" | "data_entry",
      });
      showToast(res?.message || "Invitation sent successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to send invitation. ${backendMessage}`, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Invite staff user"
      description={
        formData.role === "language_centre_admin"
          ? "Assign this user to one centre. This frontend preview saves the invitation locally; it does not send email."
          : "Send an email invitation with a one-time verification code."
      }
      icon={UserPlus}
      size="md"
      submitLabel={
        loading
          ? "Sending..."
          : formData.role === "language_centre_admin"
          ? "Save invitation"
          : "Send Invitation"
      }
      submitDisabled={
        formData.role === "language_centre_admin" &&
        (centreWorkspace.loading || !!centreWorkspace.error)
      }
      submitting={loading}
      onSubmit={(event) => {
        event.preventDefault();
        if (!loading) return handleInvite();
      }}
    >
      <div className="space-y-4">
        <InputField
          label="Name"
          field="name"
          placeholder="e.g. Jordan Lee"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          disabled={loading}
        />
        <InputField
          label="Email"
          field="email"
          type="email"
          placeholder="e.g. jordan@example.com"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          disabled={loading}
        />
        <SelectField
          label="Role"
          field="role"
          options={ROLE_OPTIONS}
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          disabled={loading}
        />
        {formData.role === "language_centre_admin" && (
          <>
            <Combobox
              label="Assigned language centre"
              value={formData.centreId}
              options={(centreWorkspace.workspace?.centres || []).map(
                (centre) => ({
                  value: centre.id,
                  label: centre.configuration.name,
                })
              )}
              required
              error={errors.centreId}
              disabled={centreWorkspace.loading}
              onChange={(value) => updateFormData("centreId", value || "")}
            />
            {centreWorkspace.error && (
              <p role="alert">{centreWorkspace.error}</p>
            )}
          </>
        )}
      </div>
    </FormModal>
  );
}
