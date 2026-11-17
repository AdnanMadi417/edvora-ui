"use client";
import { ZodError } from "zod";
import { useState } from "react";
import { Building2, UserPlus, Pencil, Ban, Power, Trash2 } from "lucide-react";
import { useSession } from "components/context/SessionContext";
import Button from "components/ub/core/buttons/Button";
import Input from "components/ub/forms/text/Input";
import Combobox from "components/ub/forms/selection/Combobox";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import { ConfirmDialog } from "components/ub/feedback/dialogs/Modal";
import DetailsSection from "components/ub/data/cards/DetailsSection";
import Loading from "components/ub/feedback/states/Loading";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import Tag from "components/ub/data/badges/Tag";
import { useUniversities } from "features/universities/hooks/institutions/useUniversities";
import { useCentreWorkspace } from "../hooks/useCentreWorkspace";
import {
  addIndependentCentre,
  inviteCentreAdmin,
  setCentreAssociation,
  updateCentreAdmin,
} from "../services/centreWorkspace";
import type { CentreAdminUser } from "../model/types";
export default function CentreAdminUsers() {
  const session = useSession();
  const { workspace, error, loading, reload } = useCentreWorkspace();
  const {
    universities,
    loading: universitiesLoading,
    error: universitiesError,
  } = useUniversities({ includeInactive: true });
  const [mode, setMode] = useState<
    "invite" | "assign" | "association" | "create" | null
  >(null);
  const [target, setTarget] = useState<CentreAdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [centreId, setCentreId] = useState("");
  const [type, setType] = useState("independent");
  const [universityId, setUniversityId] = useState("");
  const [failure, setFailure] = useState("");
  const [message, setMessage] = useState("");
  const [removing, setRemoving] = useState<CentreAdminUser | null>(null);
  if (session?.user?.role !== "admin")
    return (
      <p role="alert">Only Unibexs Admins can manage centre-admin accounts.</p>
    );
  if (loading) return <Loading text="Loading centre administrators…" />;
  if (error || !workspace)
    return (
      <div role="alert">
        <p>{error}</p>
        <Button text="Try again" onClick={reload} />
      </div>
    );
  const actor = session.user;
  const run = (action: () => void, success: string) => {
    try {
      action();
      setFailure("");
      setMessage(success);
      return true;
    } catch (error) {
      setFailure(
        error instanceof ZodError
          ? error.issues[0]?.message || "Review the form."
          : error instanceof Error
          ? error.message
          : "Unable to save."
      );
      return false;
    }
  };
  const open = (next: typeof mode, user?: CentreAdminUser) => {
    setFailure("");
    setMessage("");
    setTarget(user || null);
    setName("");
    setEmail("");
    setCentreId(user?.centreId || "");
    setType("independent");
    setUniversityId("");
    setMode(next);
  };
  const centreOptions = workspace.centres.map((centre) => ({
    value: centre.id,
    label: `${centre.configuration.name} · ${
      centre.type === "independent" ? "Independent" : "University-linked"
    }`,
  }));
  const columns: DataTableColumn<CentreAdminUser>[] = [
    {
      key: "name",
      header: "Name",
      cell: (user) => <span className="font-medium">{user.name}</span>,
    },
    { key: "email", header: "Email", cell: (user) => user.email },
    {
      key: "centreId",
      header: "Assigned centre",
      cell: (user) =>
        workspace.centres.find((centre) => centre.id === user.centreId)
          ?.configuration.name,
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <Tag hue={user.status === "active" ? "teal" : "grey"}>
          {user.status === "active"
            ? "Active"
            : user.status === "invited"
            ? "Invited"
            : "Suspended"}
        </Tag>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user) => (
        <TableActions label={user.name}>
          <TableAction
            label="Assign centre"
            icon={<Pencil className="h-4 w-4" />}
            onSelect={() => open("assign", user)}
          />
          <TableAction
            label={
              user.status === "active"
                ? "Suspend"
                : user.status === "invited"
                ? "Activate demo account"
                : "Reactivate"
            }
            icon={
              user.status === "active" ? (
                <Ban className="h-4 w-4" />
              ) : (
                <Power className="h-4 w-4" />
              )
            }
            onSelect={() =>
              run(
                () =>
                  updateCentreAdmin(actor, user.id, {
                    status: user.status === "active" ? "suspended" : "active",
                  }),
                "Account status updated."
              )
            }
          />
          <TableAction
            label="Remove"
            danger
            icon={<Trash2 className="h-4 w-4" />}
            onSelect={() => setRemoving(user)}
          />
        </TableActions>
      ),
    },
  ];
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-ub-heading-lg">Language Centre Admins</h2>
          <p className="mt-1 max-w-2xl text-ub-body-sm text-ub-text-secondary">
            Assign each user to one centre. Several users can manage the same
            centre. Invitations are saved locally for this frontend preview; no
            emails are sent.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            text="Add independent centre"
            onClick={() => open("create")}
            icon={<Building2 className="h-4 w-4" />}
          />
          <Button
            text="Centre associations"
            onClick={() => open("association")}
          />
          <Button
            text="Invite centre admin"
            variant="primary"
            onClick={() => open("invite")}
            icon={<UserPlus className="h-4 w-4" />}
          />
        </div>
      </div>
      {failure && !mode && (
        <p role="alert" className="text-ub-tone-danger-text">
          {failure}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <DetailsSection title="Centre administrators">
        <DataTable
          columns={columns}
          rows={workspace.users.filter((user) => user.status !== "removed")}
          getRowId={(user) => user.id}
          getRowLabel={(user) => user.name}
          caption="Language Centre Admin users"
          empty={{
            title: "No centre administrators",
            description: "Invite a user and assign a centre.",
          }}
        />
      </DetailsSection>
      <FormModal
        open={!!mode}
        onClose={() => setMode(null)}
        title={
          mode === "invite"
            ? "Invite Language Centre Admin"
            : mode === "assign"
            ? "Assign centre"
            : mode === "create"
            ? "Add independent centre"
            : "Centre type and university association"
        }
        submitLabel={mode === "invite" ? "Save invitation" : "Save"}
        onSubmit={(event) => {
          event.preventDefault();
          let saved = false;
          if (mode === "invite")
            saved = run(
              () => inviteCentreAdmin(actor, { name, email, centreId }),
              "Demo invitation saved. Activate it from the account actions to preview access."
            );
          if (mode === "assign" && target)
            saved = run(
              () => updateCentreAdmin(actor, target.id, { centreId }),
              "Centre assignment updated."
            );
          if (mode === "create")
            saved = run(
              () => addIndependentCentre(actor, name),
              "Independent centre created."
            );
          if (mode === "association") {
            if (
              type === "university_linked" &&
              !universities.some((university) => university.id === universityId)
            ) {
              setFailure("Choose an existing university.");
              return;
            }
            saved = run(
              () =>
                setCentreAssociation(
                  actor,
                  centreId,
                  type as "independent" | "university_linked",
                  type === "university_linked" ? universityId : null
                ),
              "Centre association updated."
            );
          }
          if (saved) setMode(null);
        }}
      >
        <div className="space-y-4">
          {failure && (
            <p role="alert" className="text-ub-tone-danger-text">
              {failure}
            </p>
          )}
          {(mode === "invite" || mode === "create") && (
            <Input
              label={mode === "create" ? "Centre name" : "Name"}
              value={name}
              onChange={setName}
              required
            />
          )}
          {mode === "invite" && (
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
          )}
          {mode !== "create" && (
            <Combobox
              label="Assigned centre"
              value={centreId}
              options={centreOptions}
              required
              onChange={(id) => {
                setCentreId(id || "");
                if (mode === "association") {
                  const centre = workspace.centres.find(
                    (centre) => centre.id === id
                  );
                  setType(centre?.type || "independent");
                  setUniversityId(centre?.universityId || "");
                }
              }}
            />
          )}
          {mode === "association" && (
            <>
              <Combobox
                label="Centre type"
                value={type}
                options={[
                  { value: "independent", label: "Independent" },
                  { value: "university_linked", label: "University-linked" },
                ]}
                onChange={(value) => setType(value || "independent")}
              />
              {type === "university_linked" && (
                <>
                  <Combobox
                    label="University"
                    value={universityId}
                    options={universities.map((university) => ({
                      value: university.id,
                      label: university.name,
                    }))}
                    required
                    disabled={universitiesLoading}
                    onChange={(value) => setUniversityId(value || "")}
                  />
                  {universitiesError && <p role="alert">{universitiesError}</p>}
                </>
              )}
            </>
          )}
        </div>
      </FormModal>
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove centre administrator?"
        tone="danger"
        consequence={`${
          removing?.name || "This user"
        } will lose access to their centre. Other centre administrators retain access.`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (
            removing &&
            run(
              () =>
                updateCentreAdmin(actor, removing.id, { status: "removed" }),
              "Centre administrator removed."
            )
          )
            setRemoving(null);
        }}
      />
    </div>
  );
}
