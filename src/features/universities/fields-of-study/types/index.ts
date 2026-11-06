export type FieldOfStudy = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
};

export type FieldOfStudyPayload = { name: string; is_active: boolean };
