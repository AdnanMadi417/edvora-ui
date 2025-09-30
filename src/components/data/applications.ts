
export interface Application {
  id: string;
  studentName: string;
  studentEmail: string;
  applicationID: string;
  applicationName: string;
  university: string;
  partner: string;
  stage: string;
  status: string;
  nextAction: string;
  priority: string;
  updatedAt: string;

  // New fields
  program?: string;
  intakeDate?: string;
  tuitionFee?: number;
  studentInfo?: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    phone: string;
    currentAddress: string;
    emergencyContact: {
      email: string;
      name: string;
      relation: string;
      phone: string;
    };
  };
  englishProficiency?: {
    test: string;
    score: string;
    testDate: string;
  };
  previousEducation?: {
    degree: string;
    institution: string;
    years: string;
    gpa: string;
  };
}

export const applications: Application[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    studentName: "Sarah Chen",
    studentEmail: "sarah.chen@gmail.com",
    applicationID: "APP-2024-005",
    applicationName: "Computer Science Masters",
    university: "Universiti Malaya (UM)",
    partner: "Education Malaysia Global Services (EMGS)",
    stage: "2",
    status: "in-progress",
    nextAction: "Schedule final interview",
    priority: "high",
    updatedAt: "2025-09-27 10:30pm",
    program: "Master of Computer Science",
    intakeDate: "2024-09-01",
    tuitionFee: 35000,
    studentInfo: {
      fullName: "Sarah Chen",
      dateOfBirth: "1998-06-12",
      nationality: "Malaysia",
      passportNumber: "MY9876543",
      phone: "+60-12-3456789",
      currentAddress: "12 Jalan Ampang, Kuala Lumpur, Malaysia",
      emergencyContact: {
        email:"sarah.chen@gmail.com",
        name: "Chen Wei Ming",
        relation: "Father",
        phone: "+60-12-9876543",
      },
    },
    englishProficiency: {
      test: "IELTS Academic",
      score: "7.5",
      testDate: "2023-11-12",
    },
    previousEducation: {
      degree: "Bachelor of Information Technology",
      institution: "Taylor's University, Malaysia",
      years: "2017-2021",
      gpa: "3.7",
    },
  },
  {
    id: "72f2d8d9-1344-4c9c-8f2b-90dbf112c671",
    studentName: "David Lee",
    studentEmail: "david.lee@hotmail.com",
    applicationID: "APP-2024-007",
    applicationName: "Software Engineering MSc",
    university: "Universiti Sains Malaysia (USM)",
    partner: "StudyMalaysia.com",
    stage: "3",
    status: "pending",
    nextAction: "Await review",
    priority: "low",
    updatedAt: "2025-09-20 10:30pm",
    program: "Master of Software Engineering",
    intakeDate: "2024-07-01",
    tuitionFee: 32000,
    studentInfo: {
      fullName: "David Lee",
      dateOfBirth: "1997-03-08",
      nationality: "Malaysia",
      passportNumber: "MY1234567",
      phone: "+60-16-8888888",
      currentAddress: "23 Jalan Sultan Azlan Shah, Penang, Malaysia",
      emergencyContact: {
        email:"sarah.chen@gmail.com",
        name: "Lee Siew Ling",
        relation: "Mother",
        phone: "+60-16-5555555",
      },
    },
    englishProficiency: {
      test: "MUET",
      score: "Band 5",
      testDate: "2023-08-10",
    },
    previousEducation: {
      degree: "Bachelor of Computer Science",
      institution: "Universiti Sains Malaysia (USM)",
      years: "2016-2020",
      gpa: "3.6",
    },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    studentName: "Sarah Chen",
    studentEmail: "sarah.chen@gmail.com",
    applicationID: "APP-2024-005",
    applicationName: "Computer Science Masters",
    university: "Universiti Malaya (UM)",
    partner: "Education Malaysia Global Services (EMGS)",
    stage: "5",
    status: "in-progress",
    nextAction: "Schedule final interview",
    priority: "high",
    updatedAt: "2025-09-17 10:30pm",
    program: "Master of Computer Science",
    intakeDate: "2024-09-01",
    tuitionFee: 35000,
    studentInfo: {
      fullName: "Sarah Chen",
      dateOfBirth: "1998-06-12",
      nationality: "Malaysia",
      passportNumber: "MY9876543",
      phone: "+60-12-3456789",
      currentAddress: "12 Jalan Ampang, Kuala Lumpur, Malaysia",
      emergencyContact: {
        email:"sarah.chen@gmail.com",
        name: "Chen Wei Ming",
        relation: "Father",
        phone: "+60-12-9876543",
      },
    },
    englishProficiency: {
      test: "IELTS Academic",
      score: "7.5",
      testDate: "2023-11-12",
    },
    previousEducation: {
      degree: "Bachelor of Information Technology",
      institution: "Taylor's University, Malaysia",
      years: "2017-2021",
      gpa: "3.7",
    },
  },
  {
    id: "72f2d8d9-1344-4c9c-8f2b-90dbf112c671",
    studentName: "David Lee",
    studentEmail: "david.lee@hotmail.com",
    applicationID: "APP-2024-007",
    applicationName: "Software Engineering MSc",
    university: "Universiti Sains Malaysia (USM)",
    partner: "StudyMalaysia.com",
    stage: "1 ",
    status: "pending",
    nextAction: "Await review",
    priority: "low",
    updatedAt: "2025-08-27 10:30pm",
    program: "Master of Software Engineering",
    intakeDate: "2024-07-01",
    tuitionFee: 32000,
    studentInfo: {
      fullName: "David Lee",
      dateOfBirth: "1997-03-08",
      nationality: "Malaysia",
      passportNumber: "MY1234567",
      phone: "+60-16-8888888",
      currentAddress: "23 Jalan Sultan Azlan Shah, Penang, Malaysia",
      emergencyContact: {
        email:"sarah.chen@gmail.com",
        name: "Lee Siew Ling",
        relation: "Mother",
        phone: "+60-16-5555555",
      },
    },
    englishProficiency: {
      test: "MUET",
      score: "Band 5",
      testDate: "2023-08-10",
    },
    previousEducation: {
      degree: "Bachelor of Computer Science",
      institution: "Universiti Sains Malaysia (USM)",
      years: "2016-2020",
      gpa: "3.6",
    },
  },
];
