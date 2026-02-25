"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Trash2, PlusCircle, MoreVertical, ChevronLeft } from 'lucide-react';

import Loading from "../../../../../loading/Loading";

import InputField from "../../../../../form/InputField";
import ToggleInput from "../../../../../form/ToggleInput";
import MultipleDateInput from "../../../../../form/MultipleDateInput";

import UpdateProgramButton from "components/ui/buttons/Button";
import DeleteProgramsConfirmation from "components/admin/KnowledgeHub/program/popups/DeleteProgramsConfirmation";

import { useToast } from "components/context/ToastContext";

import { useProgram } from "hooks/knowledge-hub/programs/useProgram";
import { useDeleteKnowledgeHubPrograms } from "hooks/knowledge-hub/programs/useDeleteKnowledgeHubPrograms";
import { useUpdateProgram } from "hooks/knowledge-hub/programs/useUpdateKnowledgeHubProgram";
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

  /**
   * Initialize form
   */
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

      commission_amount: program.commission_amount ?? 0,
      commission_type_id: commission?.type_id ?? "",
      commission_notes: commission?.notes ?? "",

      qualification_level: Number(program.qualification_level ?? 0),

      yearly_fees: program.yearly_fees ?? [],
      one_time_fees: program.one_time_fees ?? [],
      scholarships: program.scholarships ?? [],
    });
  }, [program, commission]);

  const { fields } = useAllFields();
  const { universities } = useAllUniversities();
  const { branches } = useAllBranches(formData.uni_id);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Update Program
   */
  const handleUpdate = async () => {
    try {
      await updateProgram(id, formData);

      showToast("Program updated successfully");

      router.push("/admin/knowledge-hub/programs");
    } catch (err) {
      console.error(err);
      showToast("Update failed");
    }
  };

  /**
   * Delete Program
   */
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
        {/* Header */}
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

        {/* Form */}

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
                errors={{ }}
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

          <div className="space-y-6 px-6 border-b border-slate-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Academic Details
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Duration (Years)"
                field="duration"
                type="number"
                placeholder="e.g. 3"
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

          <div className="space-y-6 px-6 border-b border-slate-200">
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

          {/*</div>*/}

          {/*<div className="space-y-6 px-6 border-b border-slate-200">*/}
          {/*  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">*/}
          {/*    Commission Structure*/}
          {/*  </h3>*/}

          {/*  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">*/}
          {/*    <InputField*/}
          {/*      label="Commission Amount"*/}
          {/*      field="commission_amount"*/}
          {/*      type="number"*/}
          {/*      placeholder="e.g. 10"*/}
          {/*      formData={formData}*/}
          {/*      errors={errors}*/}
          {/*      updateFormData={updateFormData}*/}
          {/*    />*/}

          {/*    <SearchableSelect*/}
          {/*      label="Commission Type"*/}
          {/*      field="commission_type_id"*/}
          {/*      options={commissionTypes.map((f) => ({*/}
          {/*        value: String(f.id),*/}
          {/*        label: f.name,*/}
          {/*      }))}*/}
          {/*      formData={formData}*/}
          {/*      errors={errors}*/}
          {/*      updateFormData={updateFormData}*/}
          {/*      actions={[*/}
          {/*        {*/}
          {/*          label: "Create Commission Type",*/}
          {/*          icon: <PlusCircle className="h-4 w-4" />,*/}
          {/*          onClick: () => setShowCommissionTypePopup(true)*/}
          {/*        }*/}
          {/*      ]}*/}
          {/*    />*/}

          {/*    <InputField*/}
          {/*      label="Qualification Level"*/}
          {/*      field="qualification_level"*/}
          {/*      type="string"*/}
          {/*      placeholder="e.g. 3"*/}
          {/*      required*/}
          {/*      formData={formData}*/}
          {/*      errors={errors}*/}
          {/*      updateFormData={updateFormData}*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div className="space-y-4 px-6 border-b border-slate-200">*/}
          {/*  <ArrayObjectField*/}
          {/*    label="Yearly Fees"*/}
          {/*    subLabel="Year"*/}
          {/*    field="yearly_fees"*/}
          {/*    formData={formData}*/}
          {/*    errors={errors}*/}
          {/*    updateFormData={updateFormData}*/}
          {/*    fields={[*/}
          {/*      {*/}
          {/*        key: "year",*/}
          {/*        label: "Year",*/}
          {/*        type: "text",*/}
          {/*        placeholder: "Year",*/}
          {/*      },*/}
          {/*      {*/}
          {/*        key: "fee",*/}
          {/*        label: "Fee",*/}
          {/*        type: "number",*/}
          {/*        placeholder: "Fee",*/}
          {/*      },*/}
          {/*    ]}*/}
          {/*  />*/}

          {/*  <ArrayObjectField*/}
          {/*    label="One Time Fees"*/}
          {/*    subLabel="Fees"*/}
          {/*    field="one_time_fees"*/}
          {/*    formData={formData}*/}
          {/*    errors={errors}*/}
          {/*    updateFormData={updateFormData}*/}
          {/*    fields={[*/}
          {/*      {*/}
          {/*        key: "description",*/}
          {/*        label: "Description",*/}
          {/*        type: "text",*/}
          {/*        placeholder: "One Time Fees",*/}
          {/*      },*/}
          {/*      {*/}
          {/*        key: "fee",*/}
          {/*        label: "Fee",*/}
          {/*        type: "number",*/}
          {/*        placeholder: "Fee",*/}
          {/*      },*/}
          {/*    ]}*/}
          {/*  />*/}
          </div>

          <div className="space-y-6 px-6 ">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Scholarship
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Scholarship Type"
                field="scholarships[0].type"
                options={[
                  { value: "0", label: "Full Scholarship" },
                  { value: "1", label: "Partial Scholarship" },
                ]}
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <InputField
                label="Coverage Percent"
                field="scholarships[0].coverage_percent"
                type="number"
                placeholder="e.g. 10"
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <InputField
                label="Max Amount"
                field="scholarships[0].max_amount"
                type="number"
                placeholder="e.g. 10000"
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <InputField
                label="Scholarship Name"
                field="scholarships[0].name"
                placeholder="e.g.Scholarship"
                type="text"
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />

              <InputField
                label="Description"
                field="scholarships[0].description"
                placeholder="e.g. Description Scholarship"
                type="text"
                required
                formData={formData}
                errors={{}}
                updateFormData={updateFormData}
              />
            </div>
          </div>
        </div>


        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-5">
          <UpdateProgramButton
            icon={<PlusCircle className="h-5 w-5" />}
            text={updateProgrLoading ? "Updating..." : "Update Program"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleUpdate}
            disabled={updateProgrLoading}
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