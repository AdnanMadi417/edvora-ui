"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Trash2, PlusCircle, MoreVertical, ChevronLeft, CalendarPlus } from 'lucide-react';

import Loading from "../../../../../loading/Loading";
import { DURATION,  SCHOLARSHIP_TYPE } from 'constants/lists';

import InputField from "../../../../../form/InputField";
import ToggleInput from "../../../../../form/ToggleInput";
import MultipleDateInput from "../../../../../form/MultipleDateInput";

import Button from 'components/ui/buttons/Button';
import DeleteProgramsConfirmation from "components/admin/KnowledgeHub/program/popups/DeleteProgramsConfirmation";

import { useToast } from "components/context/ToastContext";

import { useProgram } from "hooks/knowledge-hub/programs/useProgram";
import { useDeleteKnowledgeHubPrograms } from "hooks/knowledge-hub/programs/useDeleteKnowledgeHubPrograms";
import { useUpdateProgram,UpdateProgramPayload } from "../../../../../../hooks/knowledge-hub/programs/useUpdateProgram";
import { useCommissionTypes } from '../../../../../../hooks/knowledge-hub/commission/useCommissionTypes';
import SearchableSelect from '../../../../../form/SearchableSelect';
import ArrayObjectField from '../../../../../form/ArrayObjectField';
import SelectField from '../../../../../form/SelectField';
import CreateUniversity from '../../../university/popups/CreateUniversity';
import CreateCommissionType from '../../popups/CreateCommissionType';
import CreateFieldOfStudy from '../../popups/CreateFieldOfStudy';
import CreateBranch from '../../popups/CreateBranch';
import { useAllUniversities } from '../../../../../../hooks/knowledge-hub/universities/useUniversitiesList';
import { useAllBranches } from '../../../../../../hooks/knowledge-hub/universities/useBranchesList';
import { useAllFields } from '../../../../../../hooks/knowledge-hub/programs/useFieldsList';
import { useAllQualifications } from '../../../../../../hooks/knowledge-hub/qualifications/useQualificationsList';

import IconButton from '../../../../../ui/buttons/IconButton';
import NoMessagesFound from 'components/emptyData/NoMessagesFound';


interface Props {
  id: string;
}

const EditKnowledgeHubProgramDetails = ({ id }: Props) => {


  const [showUniversityPopup, setShowUniversityPopup] = useState(false);
  const [showCommissionTypePopup, setShowCommissionTypePopup] = useState(false);
  const [showFieldOfStudyPopup, setShowFieldOfStudyPopup] = useState(false);
  const [showBranchPopup, setShowBranchPopup] = useState(false);


  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { deletePrograms } =
    useDeleteKnowledgeHubPrograms();

  const { commissionTypes } =
    useCommissionTypes();
  const { qualifications } = useAllQualifications();


  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'batch' | null>(null);
  const { showToast } = useToast();

  const router = useRouter();
  const handleBack = () => {
    router.push('/admin/knowledge-hub/programs');
  };

  const { program, commission } = useProgram(id);
  const { updateProgram, updateProgrLoading } = useUpdateProgram();
  const [formData, setFormData] = useState<any>({});

  const removeScholarship = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scholarships: prev.scholarships.filter((_, i) => i !== index),
    }));
  };

  const addScholarship = () => {
    setFormData((prev) => ({
      ...prev,
      scholarships: [
        ...prev.scholarships,
        {
          type: 0,
          coverage_percent: 0,
          max_amount: 0,
          name: "",
          description: "",
        },
      ],
    }));
  };

  const isFormValid = React.useMemo(() => {
    if (!formData) return false;

    const basicValid =
      formData.name?.trim() !== "" &&
      formData.uni_id !== "" &&
      formData.branch_id !== "" &&
      formData.field_of_study_id !== "" &&
      formData.qualification_id !== "" &&
      formData.overview?.trim() !== "" &&
      formData.curriculum?.trim() !== "" &&
      formData.intake_dates?.length > 0 &&
      Number(formData.tuition_fee) > 0 &&
      Number(formData.duration) > 0 &&
      Number(formData.english_required_score) > 0 &&
      Number(formData.commission_amount) >= 0;

    // At least one delivery mode
    const deliveryValid =
      formData.is_on_campus === true ||
      formData.is_online === true;

    // Commission type required only if commission amount > 0
    const commissionValid =
      Number(formData.commission_amount) === 0 ||
      formData.commission_type_id !== "";

    const yearlyFeesValid =
      !formData.yearly_fees?.length ||
      formData.yearly_fees.every(
        (y: any) =>
          Number(y.year) > 0 &&
          Number(y.fee) > 0
      );

    const oneTimeFeesValid =
      !formData.one_time_fees?.length ||
      formData.one_time_fees.every(
        (f: any) =>
          f.description?.trim() !== "" &&
          Number(f.fee) > 0
      );

    // Scholarship validation only if enabled
    const scholarshipValid =
      !formData.has_scholarship ||
      (formData.scholarships?.length > 0 &&
        formData.scholarships.every(
          (s: any) =>
            s.name?.trim() !== "" &&
            Number(s.coverage_percent) >= 0 &&
            Number(s.max_amount) >= 0
        ));

    return (
      basicValid &&
      deliveryValid &&
      commissionValid &&
      yearlyFeesValid &&
      oneTimeFeesValid &&
      scholarshipValid
    );
  }, [formData]);

  useEffect(() => {
    if (!program) return;

    setFormData({
      uni_id: program.university?.id ?? "",
      branch_id: program.branch?.id ?? "",
      field_of_study_id: program.field_of_study?.id ?? "",

      name: program.name ?? "",
      tuition_fee: program.tuition_fee ?? 0,
      intake_dates: program.intake_dates ?? [],
      duration: program.duration ?? 0,

      english_required_score: program.english_required_score ?? "",
      overview: program.overview ?? "",
      curriculum: program.curriculum ?? "",

      is_on_campus: program.is_on_campus ?? false,
      is_online: program.is_online ?? false,
      has_scholarship: program.has_scholarship ?? false,

      commission_amount: Number(program.commission_amount) || 0,
      commission_type_id: commission?.type_id ?? "",
      commission_notes: commission?.notes ?? "Commission paid 30 days after student completes first semester of each academic year.",

      qualification_id: String((program as any).qualification_id || ""),

      yearly_fees: program.yearly_fees ?? [],
      one_time_fees: program.one_time_fees ?? [],
      scholarships: program.scholarships ?? [],
    });
  }, [program, commission]);

  const { fields } = useAllFields();
  const { universities } = useAllUniversities();
  const { branches } = useAllBranches(formData.uni_id);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => {
      const clone = structuredClone(prev);

      const path = field
        .replace(/\[(\w+)\]/g, '.$1')
        .split('.');

      let current = clone;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;

      return clone;
    });
  };

  const handleUpdate = async () => {
    try {
      const payload: UpdateProgramPayload = {
        uni_id: String(formData.uni_id),
        branch_id: String(formData.branch_id),
        field_of_study_id: String(formData.field_of_study_id),

        name: String(formData.name || "").trim(),
        overview: String(formData.overview || "").trim(),
        curriculum: String(formData.curriculum || "").trim(),

        tuition_fee: Number(formData.tuition_fee) || 0,
        duration: Number(formData.duration) || 0,
        english_required_score: String(
          formData.english_required_score || ""
        ),

        is_on_campus: Boolean(formData.is_on_campus),
        is_online: Boolean(formData.is_online),
        has_scholarship: Boolean(formData.has_scholarship),

        commission_amount: Number(formData.commission_amount) || 0,
        commission_type_id: String(formData.commission_type_id || ""),
        commission_notes: String(formData.commission_notes || ""),

        qualification_id: String(formData.qualification_id),

        intake_dates: Array.isArray(formData.intake_dates)
          ? formData.intake_dates
          : [],

        yearly_fees: Array.isArray(formData.yearly_fees)
          ? formData.yearly_fees.map((f: any) => ({
            year: Number(f.year) || 0,
            fee: Number(f.fee) || 0,
          }))
          : [],

        one_time_fees: Array.isArray(formData.one_time_fees)
          ? formData.one_time_fees.map((f: any) => ({
            description: String(f.description || ""),
            fee: Number(f.fee) || 0,
          }))
          : [],

        scholarships: formData.has_scholarship
          ? Array.isArray(formData.scholarships)
            ? formData.scholarships.map((s: any) => ({
              type: Number(s.type) || 0,
              coverage_percent: Number(s.coverage_percent) || 0,
              max_amount: Number(s.max_amount) || 0,
              name: String(s.name || ""),
              description: String(s.description || ""),
            }))
            : []
          : [],
      };

      await updateProgram(id, payload);

      showToast("Program updated successfully");

      // router.push("/admin/knowledge-hub/programs");
    } catch (err) {
      console.error(err);
      showToast("Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;

      await deletePrograms([id]);

      showToast('Deleted successfully');

      setIsDeleteOpen(false);
      setDeleteMode(null);

      router.push('/admin/knowledge-hub/programs');

    } catch (error) {
      console.error(error);
      showToast('Delete failed');
    }
  };

  if (!program) return <Loading text="Loading program..." />;

  return (
    <>
      <div className="mt-6 rounded-md border bg-card shadow-sm">
        <div className="flex justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">
                {program?.name ?? "Not Provided"}
              </h3>
              <p className="text-sm text-slate-500">
                {program?.university?.name ?? "Not Provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdownId(
                    openDropdownId === program.id ? null : program.id
                  )
                }
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Actions
                <MoreVertical className="h-4 w-4" />
              </button>

              {openDropdownId === program.id && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                  <div className="space-y-2 p-2">
                    <button
                      aria-label="Delete Program"
                      className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteOpen(true);
                        setOpenDropdownId(null);
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">
                        <Trash2 className="h-4 w-4" />
                      </div>

                      <span className="font-semibold text-red-700">
                        Delete Program
                      </span>
                    </button>

                    <button
                      aria-label="Back to Programs"
                      className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                      onClick={handleBack}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                        <ChevronLeft className="h-4 w-4" />
                      </div>

                      <span className="font-semibold text-slate-900">
                        Back to Programs
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-6 border-b border-slate-200 px-6 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Program Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SearchableSelect
                label="University"
                field="uni_id"
                options={(universities ?? [])
                  .filter((u) => u.is_active)
                  .map((u) => ({
                    value: u.id,
                    label: u.name,
                  }))}
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
                actions={[
                  {
                    label: "Create University",
                    icon: <PlusCircle className="h-4 w-4" />,
                    onClick: () => setShowUniversityPopup(true),
                  },
                ]}
              />

              <SearchableSelect
                label="Branch"
                field="branch_id"
                options={branches.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
                actions={[
                  {
                    label: "Create Branch",
                    icon: <PlusCircle className="h-4 w-4" />,
                    onClick: () => setShowBranchPopup(true),
                  },
                ]}
              />

              <InputField
                label="Program Name"
                field="name"
                placeholder="e.g. BSc Data Science"
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <SearchableSelect
                label="Field of Study"
                field="field_of_study_id"
                options={fields.map((f) => ({
                  value: String(f.id),
                  label: f.name,
                }))}
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
                actions={[
                  {
                    label: "Create Field of Study",
                    icon: <PlusCircle className="h-4 w-4" />,
                    onClick: () => setShowFieldOfStudyPopup(true),
                  },
                ]}
              />

              <InputField
                label="Tuition Fee"
                field="tuition_fee"
                type="number"
                placeholder="e.g. 20000"
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />
            </div>
          </div>

          <div className="space-y-6 border-b border-slate-200 px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Academic Details
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Duration (Years)"
                field="duration"
                options={DURATION.map((d) => ({
                  value: d.year,
                  label: d.label,
                }))}
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <InputField
                label="English Required Score"
                field="english_required_score"
                placeholder="e.g. IELTS 6.0"
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <InputField
                label="Overview"
                field="overview"
                placeholder="Program overview..."
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <InputField
                label="Curriculum"
                field="curriculum"
                placeholder="Program curriculum..."
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />
            </div>
          </div>

          <div className="space-y-6 border-b border-slate-200 px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Delivery Mode
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ToggleInput
                label="On Campus"
                field="is_on_campus"
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <ToggleInput
                label="Online Available"
                field="is_online"
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <ToggleInput
                label="Has Scholarship"
                field="has_scholarship"
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />
            </div>
          </div>

          <div className="space-y-6 px-6 pb-5 ">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Intake Schedule
            </h3>

            <MultipleDateInput
              label="Intake Dates"
              field="intake_dates"
              required
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />
          </div>

          <div className="space-y-6 border-b border-slate-200 px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Commission Structure
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Commission Amount"
                field="commission_amount"
                type="number"
                placeholder="e.g. 10"
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Commission Type"
                field="commission_type_id"
                options={commissionTypes.map((f) => ({
                  value: String(f.id),
                  label: f.name,
                }))}
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Qualification Level"
                field="qualification_id"
                options={qualifications.map((f) => ({
                  value: String(f.id),
                  label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
                }))}
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />
            </div>
          </div>

          <div className="space-y-4 border-b border-slate-200 px-6 py-5">
            <ArrayObjectField
              label="Yearly Fees"
              subLabel="Year"
              field="yearly_fees"
              formData={formData}
              errors={{ }}
              updateFormData={updateFormData}
              fields={[
                {
                  key: "year",
                  label: "Year",
                  type: "text",
                  placeholder: "Year",
                },
                {
                  key: "fee",
                  label: "Fee",
                  type: "number",
                  placeholder: "Fee",
                },
              ]}
            />

            <ArrayObjectField
              label="One Time Fees"
              subLabel="Fees"
              field="one_time_fees"
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
              fields={[
                {
                  key: "description",
                  label: "Description",
                  type: "text",
                  placeholder: "One Time Fees",
                },
                {
                  key: "fee",
                  label: "Fee",
                  type: "number",
                  placeholder: "Fee",
                },
              ]}
            />
          </div>

          <div className="flex items-center justify-between px-6 pb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Scholarships
            </h3>

            <IconButton
              icon={<CalendarPlus className="h-4 w-4" />}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={addScholarship}
            />
          </div>

          {(formData.scholarships ?? []).map((scholarship, index) => (
            <div key={index} className="space-y-6 px-6 pb-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6 transition">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Scholarship
                      </p>
                      <p className="text-xs text-slate-500">
                        Configure scholarship details
                      </p>
                    </div>
                  </div>

                  <IconButton
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => removeScholarship(index)}
                    bgColor="bg-red-50"
                    textColor="text-red-600"
                    borderColor="border-red-200"
                    hoverTextColor="hover:text-red-700"
                    hoverBorderColor="hover:border-red-300"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <SelectField
                    label="Scholarship Type"
                    field={`scholarships[${index}].type`}
                    options={SCHOLARSHIP_TYPE.map((d) => ({
                      value: d.value,
                      label: d.label,
                    }))}
                    formData={formData}
                    errors={{}}
                    updateFormData={updateFormData}
                  />

                  <InputField
                    label="Coverage Percentage"
                    field={`scholarships[${index}].coverage_percent`}
                    type="number"
                    placeholder="e.g. 50"
                    formData={formData}
                    errors={{}}
                    updateFormData={updateFormData}
                  />

                  <InputField
                    label="Maximum Amount"
                    field={`scholarships[${index}].max_amount`}
                    type="number"
                    placeholder="e.g. 10000"
                    formData={formData}
                    errors={{}}
                    updateFormData={updateFormData}
                  />

                  <InputField
                    label="Scholarship Name"
                    field={`scholarships[${index}].name`}
                    placeholder="e.g. Excellence Award"
                    type="text"
                    formData={formData}
                    errors={{}}
                    updateFormData={updateFormData}
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Description"
                      field={`scholarships[${index}].description`}
                      placeholder="Short description..."
                      type="text"
                      formData={formData}
                      errors={{}}
                      updateFormData={updateFormData}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!(formData.scholarships ?? []).length && (
            <NoMessagesFound
              title="No scholarships found"
              subtitle="There are currently no scholarships available."
            />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-5">
          <Button
            onClick={handleBack}
            disabled={updateProgrLoading}
            icon={<ChevronLeft className="h-5 w-5" />}
            text={"Back"}
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            icon={<PlusCircle className="h-5 w-5" />}
            text={updateProgrLoading ? "Updating..." : "Update Program"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleUpdate}
            disabled={updateProgrLoading || !isFormValid}
          />
        </div>
      </div>

      <DeleteProgramsConfirmation
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteMode(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        programNames={program?.name ? [program.name] : []}
      />

      <CreateUniversity
        isOpen={showUniversityPopup}
        onClose={() => setShowUniversityPopup(false)}
      />

      <CreateCommissionType
        isOpen={showCommissionTypePopup}
        onClose={() => setShowCommissionTypePopup(false)}
      />

      <CreateFieldOfStudy
        isOpen={showFieldOfStudyPopup}
        onClose={() => setShowFieldOfStudyPopup(false)}
      />

      <CreateBranch
        isOpen={showBranchPopup}
        onClose={() => setShowBranchPopup(false)}
        universityId={formData.uni_id}
      />
    </>
  );
};

export default EditKnowledgeHubProgramDetails;