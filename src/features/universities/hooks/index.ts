export { useUniversities } from "./institutions/useUniversities";
export { useUniversityDetails } from "./institutions/useUniversityDetails";
export { useCreateUniversity } from "./institutions/useCreateUniversity";
export { useUpdateUniversity } from "./institutions/useUpdateUniversity";
export { useSetUniversityHidden } from "./institutions/useSetUniversityHidden";
export { useDeleteUniversity } from "./institutions/useDeleteUniversity";

export { useBranches } from "./branches/useBranches";
export { useCreateBranch } from "./branches/useCreateBranch";
export { useDeleteBranch } from "./branches/useDeleteBranch";

export { useUniversityPaymentMethods } from "./payment-methods/useUniversityPaymentMethods";
export { useAssignUniversityPaymentMethod } from "./payment-methods/useAssignUniversityPaymentMethod";
export { useUpdateUniversityPaymentMethod } from "./payment-methods/useUpdateUniversityPaymentMethod";
export { useDeleteUniversityPaymentMethod } from "./payment-methods/useDeleteUniversityPaymentMethod";
// Compatibility facade for university consumers.
export {
  useUpdateUniversityType,
  useCreateUniversityType,
  useUniversityTypeDetails,
  useAssignUniversityType,
  useDeleteUniversityType,
  useUniversityTypes,
  useApplicationSubmissionFields,
  useApplicationRequiredFields,
  useUpdateApplicationRequiredFields,
  useApplicationRequiredFieldById,
  useAdminUniversities,
} from "../configuration/hooks";
