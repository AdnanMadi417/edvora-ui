
export interface Student {
  name: string;
  birthday: string;
  nationality: string;
  passport_number: string;
  email: string;
  phone: string;
  current_address: string;
  gender: string | null;
  emergency_contacts: {
    name: string;
    relation: string;
    phone: string;
    email: string;
  }[];
  english_proficiencies: {
    test_type: string;
    score: string;
    test_date: string;
  }[];
  previous_educations: {
    institution_name: string;
    qualification: string;
    field_of_study?: string;
    start_date: string;
    end_date: string;
    grade?: string;
  }[];
}

export interface DocumentItem {
  document_type_id: string;
  file_url: string;
  file_key?: string;
  name?: string;
  size?: string;
  raw?: File;
  uploading?: boolean;
  progress?: number;
}

export interface FormDataType {
  program_id: string;
  university_id: string;
  intake_date: string;
  student_id: string;
  student: Student;
  documents: DocumentItem[];
  is_draft: boolean;
}

export interface DocumentType {
  id: string;
  type: string;
  code: string;
  description: string;
  is_init_app_doc: boolean;
  is_required_init_app_doc: boolean;
  is_required_for_init: boolean;
  is_required_for_current_upload?: boolean;
}
