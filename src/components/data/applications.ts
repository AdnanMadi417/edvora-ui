export interface TimelineEvent {

  description: string;

  by: string;

  timestamp: string;
}

export interface ApplicationHistory {
  events: TimelineEvent[];
}

export interface Document {
  id: string;
  name: string;
  fileName: string;
  type: "pdf" | "excel" | "design" | "other";
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
  version: number;
  size: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

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
  docs?: Document[];
  // New history field
  history?: ApplicationHistory; // Added the timeline here
}

export interface Partner {
  id: string;
  businessName: string;
  registrationNumber: string;
  contactPerson: string;
  businessAddress: string;
  phoneContact: string;
  emailContact: string;
  country: string;
  type: string;
  status: string;
  registeredAt: string;
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
    stage: "Application Review",
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
        email: "sarah.chen@gmail.com",
        name: "Chen wei ming",
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
    docs: [
      {
        id: "doc-1",
        name: "Passport",
        fileName: "Emma_Thompson_Passport_Copy.pdf",
        type: "pdf",
        status: "approved",
        uploadedAt: "2025-09-07 10:00am",
        version: 1,
        size: "2.3 MB",
        reviewedBy: "System Account Manager",
        reviewedAt: "2025-09-08 11:15am",
      },
      {
        id: "doc-2",
        name: "Bachelor transcript",
        fileName: "Emma_Thompson_Bachelor_Transcript.pdf",
        type: "pdf",
        status: "pending",
        uploadedAt: "2025-09-09 02:30pm",
        version: 1,
        size: "1.5 MB",
      },
    ],
    history: {
      events: [
        {
          description: "Initial Master of Computer Science application submitted",
          by: "Partner",
          timestamp: "2025-09-26 02:35:56 PM",
        },
        {
          description: "Stage 1 (Internal Review) Approved",
          by: "Account Manager",
          timestamp: "2025-09-27 09:00:00 AM",
        },
        {
          description: "Application sent to Universiti Malaya (UM)",
          by: "Account Manager",
          timestamp: "2025-09-27 10:30:00 PM",
        },
        {
          description: "University confirmed receipt, awaiting faculty review",
          by: "System",
          timestamp: "2025-09-28 11:00:00 AM",
        },
      ],
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
    stage: "Student Arrival",
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
        email: "sarah.chen@gmail.com",
        name: "Lee siew ling",
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
    docs: [
      {
        id: "doc-1",
        name: "Passport",
        fileName: "Emma_Thompson_Passport_Copy.pdf",
        type: "pdf",
        status: "approved",
        uploadedAt: "2025-09-07 10:00am",
        version: 1,
        size: "2.3 MB",
        reviewedBy: "System Account Manager",
        reviewedAt: "2025-09-08 11:15am",
      },
      {
        id: "doc-2",
        name: "Bachelor transcript",
        fileName: "Emma_Thompson_Bachelor_Transcript.pdf",
        type: "pdf",
        status: "pending",
        uploadedAt: "2025-09-09 02:30pm",
        version: 1,
        size: "1.5 MB",
      },
    ],
    history: {
      events: [
        {
          description: "Initial application submitted",
          by: "Partner",
          timestamp: "2025-09-05 09:00:00 AM",
        },
        {
          description: "Documents review completed, all approved",
          by: "Account Manager",
          timestamp: "2025-09-10 03:00:00 PM",
        },
        {
          description: "Application sent to Universiti Sains Malaysia (USM)",
          by: "Account Manager",
          timestamp: "2025-09-12 11:00:00 AM",
        },
        {
          description: "University issued Conditional Offer Letter",
          by: "University",
          timestamp: "2025-09-20 10:30:00 PM",
        },
        {
          description: "Automatic transition to Stage 3 (Offer Accepted/Pending Payment)",
          by: "System",
          timestamp: "2025-09-20 10:31:00 PM",
        },
      ],
    },
  },
  {
    id: "a1b2c3d4-e5f6-7890-ab12-cd34ef567890",
    studentName: "Lina Wong",
    studentEmail: "lina.wong@gmail.com",
    applicationID: "APP-2024-010",
    applicationName: "Data Science MSc",
    university: "Universiti Teknologi Malaysia (UTM)",
    partner: "Education Malaysia Global Services (EMGS)",
    stage: "Application Review",
    status: "pending",
    nextAction: "Submit missing documents",
    priority: "medium",
    updatedAt: "2025-09-22 09:30am",
    program: "Master of Data Science",
    intakeDate: "2024-08-01",
    tuitionFee: 36000,
    studentInfo: {
      fullName: "Lina Wong",
      dateOfBirth: "1996-12-15",
      nationality: "Malaysia",
      passportNumber: "MY7654321",
      phone: "+60-17-2223344",
      currentAddress: "45 Jalan Tun Razak, Kuala Lumpur, Malaysia",
      emergencyContact: {
        email: "lina.wong@gmail.com",
        name: "Wong teck seng",
        relation: "Father",
        phone: "+60-17-3334455",
      },
    },
    englishProficiency: {
      test: "IELTS Academic",
      score: "7.0",
      testDate: "2023-10-05",
    },
    previousEducation: {
      degree: "Bachelor of Statistics",
      institution: "Universiti Malaya (UM)",
      years: "2014-2018",
      gpa: "3.8",
    },
    docs: [
      {
        id: "doc-1",
        name: "Passport",
        fileName: "Lina_Wong_Passport_Copy.pdf",
        type: "pdf",
        status: "approved",
        uploadedAt: "2025-09-10 10:00am",
        version: 1,
        size: "2.4 MB",
        reviewedBy: "System Account Manager",
        reviewedAt: "2025-09-11 11:20am",
      },
      {
        id: "doc-2",
        name: "Bachelor transcript",
        fileName: "Lina_Wong_Bachelor_Transcript.pdf",
        type: "pdf",
        status: "pending",
        uploadedAt: "2025-09-12 02:45pm",
        version: 1,
        size: "1.8 MB",
      },
    ],
    history: {
      events: [
        {
          description: "Initial application submitted",
          by: "Partner",
          timestamp: "2025-09-08 04:00:00 PM",
        },
        {
          description: "Passport document approved",
          by: "System Account Manager",
          timestamp: "2025-09-11 11:20:00 AM",
        },
        {
          description: "Missing Bachelor Transcript. Student action required.",
          by: "Account Manager",
          timestamp: "2025-09-13 10:00:00 AM",
        },
        {
          description: "Application moved to 'Pending' (waiting on student)",
          by: "System",
          timestamp: "2025-09-22 09:30:00 AM",
        },
      ],
    },
  },
  {
    id: "b2c3d4e5-f678-9012-ab34-cd56ef789012",
    studentName: "Jason Tan",
    studentEmail: "jason.tan@hotmail.com",
    applicationID: "APP-2024-011",
    applicationName: "Artificial Intelligence MSc",
    university: "Universiti Putra Malaysia (UPM)",
    partner: "StudyMalaysia.com",
    stage: "Offer Letter",
    status: "in-progress",
    nextAction: "Interview scheduled",
    priority: "high",
    updatedAt: "2025-09-25 03:45pm",
    program: "Master of Artificial Intelligence",
    intakeDate: "2024-09-15",
    tuitionFee: 38000,
    studentInfo: {
      fullName: "Jason Tan",
      dateOfBirth: "1995-07-20",
      nationality: "Malaysia",
      passportNumber: "MY2345678",
      phone: "+60-19-5556677",
      currentAddress: "88 Jalan Kuching, Kuala Lumpur, Malaysia",
      emergencyContact: {
        email: "jason.tan@hotmail.com",
        name: "Tan lee kiat",
        relation: "Father",
        phone: "+60-19-5566778",
      },
    },
    englishProficiency: {
      test: "TOEFL",
      score: "105",
      testDate: "2023-09-15",
    },
    previousEducation: {
      degree: "Bachelor of Computer Engineering",
      institution: "Universiti Teknologi Malaysia (UTM)",
      years: "2013-2017",
      gpa: "3.7",
    },
    docs: [
      {
        id: "doc-1",
        name: "Passport",
        fileName: "Jason_Tan_Passport_Copy.pdf",
        type: "pdf",
        status: "approved",
        uploadedAt: "2025-09-15 09:30am",
        version: 1,
        size: "2.3 MB",
        reviewedBy: "System Account Manager",
        reviewedAt: "2025-09-16 10:15am",
      },
      {
        id: "doc-2",
        name: "Bachelor transcript",
        fileName: "Jason_Tan_Bachelor_Transcript.pdf",
        type: "pdf",
        status: "approved",
        uploadedAt: "2025-09-16 11:00am",
        version: 1,
        size: "1.6 MB",
        reviewedBy: "System Account Manager",
        reviewedAt: "2025-09-17 02:30pm",
      },
    ],
    history: {
      events: [
        {
          description: "Initial application submitted with all required documents",
          by: "Partner",
          timestamp: "2025-09-14 10:00:00 AM",
        },
        {
          description: "All documents successfully reviewed and approved",
          by: "Account Manager",
          timestamp: "2025-09-17 02:30:00 PM",
        },
        {
          description: "Application sent to Universiti Putra Malaysia (UPM)",
          by: "Account Manager",
          timestamp: "2025-09-18 09:00:00 AM",
        },
        {
          description: "Interview scheduled for Oct 1st",
          by: "University",
          timestamp: "2025-09-25 03:45:00 PM",
        },
      ],
    },
  },
  {
    id: "c3d4e5f6-7890-1234-ab56-cd78ef901234",
    studentName: "Aisha Rahman",
    studentEmail: "aisha.rahman@gmail.com",
    applicationID: "APP-2024-012",
    applicationName: "Cybersecurity MSc",
    university: "Universiti Kebangsaan Malaysia (UKM)",
    partner: "Education Malaysia Global Services (EMGS)",
    stage: "Visa Processing",
    status: "pending",
    nextAction: "Upload documents",
    priority: "medium",
    updatedAt: "2025-09-28 08:00am",
    program: "Master of Cybersecurity",
    intakeDate: "2024-10-01",
    tuitionFee: 34000,
    studentInfo: {
      fullName: "Aisha Rahman",
      dateOfBirth: "1996-04-10",
      nationality: "Malaysia",
      passportNumber: "MY3456789",
      phone: "+60-18-7788990",
      currentAddress: "12 Jalan Bangsar, Kuala Lumpur, Malaysia",
      emergencyContact: {
        email: "aisha.rahman@gmail.com",
        name: "Rahman bin ahmad",
        relation: "Father",
        phone: "+60-18-8899001",
      },
    },
    englishProficiency: {
      test: "IELTS Academic",
      score: "7.2",
      testDate: "2023-11-01",
    },
    previousEducation: {
      degree: "Bachelor of Information Security",
      institution: "Universiti Teknologi MARA (UiTM)",
      years: "2014-2018",
      gpa: "3.6",
    },
    docs: [
      {
        id: "doc-1",
        name: "Passport",
        fileName: "Aisha_Rahman_Passport_Copy.pdf",
        type: "pdf",
        status: "pending",
        uploadedAt: "2025-09-20 10:00am",
        version: 1,
        size: "2.4 MB",
      },
      {
        id: "doc-2",
        name: "Bachelor transcript",
        fileName: "Aisha_Rahman_Bachelor_Transcript.pdf",
        type: "pdf",
        status: "pending",
        uploadedAt: "2025-09-21 01:15pm",
        version: 1,
        size: "1.7 MB",
      },
    ],
    history: {
      events: [
        {
          description: "Initial application created",
          by: "Partner",
          timestamp: "2025-09-19 10:00:00 AM",
        },
        {
          description: "Documents uploaded by student",
          by: "Aisha Rahman",
          timestamp: "2025-09-21 01:15:00 PM",
        },
        {
          description: "Application moved to 'Pending' for document review",
          by: "System",
          timestamp: "2025-09-22 09:00:00 AM",
        },
        {
          description: "Further documents requested (Financial Proof)",
          by: "Account Manager",
          timestamp: "2025-09-28 08:00:00 AM",
        },
      ],
    },
  },
];


export const partners: Partner[] = [
  {
    id: "7b6f3c52-1a4e-4d2c-9b59-7c92a83b9e21",
    businessName: "Yayasan Harapan Malaysia",
    registrationNumber: "SDG0874328",
    contactPerson: "Dato' Ahmad Faiz",
    businessAddress: "12 Jalan Tun Razak, Kuala Lumpur, 50400 Malaysia",
    phoneContact: "+60322778899",
    emailContact: "info@yayasanharapan.org.my",
    country: "Malaysia",
    type: "NGO",
    status: "registered",
    registeredAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "f1c2a8d9-4c6b-45de-95df-8a6fbbde4a32",
    businessName: "GreenTech Malaysia",
    registrationNumber: "MY-567890",
    contactPerson: "Nurul Huda",
    businessAddress: "88 Jalan Teknologi, Cyberjaya, Selangor, 63000 Malaysia",
    phoneContact: "+60389218800",
    emailContact: "contact@greentechmalaysia.com",
    country: "Malaysia",
    type: "Company",
    status: "pending",
    registeredAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "b4f923de-7a5e-43b3-b913-1d6546d13c91",
    businessName: "MyChild Foundation",
    registrationNumber: "MY-334455",
    contactPerson: "Siti Aminah",
    businessAddress: "45 Jalan Damai, Bukit Bintang, Kuala Lumpur, 50200 Malaysia",
    phoneContact: "+60321883322",
    emailContact: "hello@mychildfoundation.org.my",
    country: "Malaysia",
    type: "Organization",
    status: "registered",
    registeredAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "e3d7f2b8-9a12-4d5a-aef1-2b91c3e7f812",
    businessName: "Your Uni Education Services",
    registrationNumber: "N/A",
    contactPerson: "University Representative",
    businessAddress: "123 University Avenue, Education City, EC 12345",
    phoneContact: "+1-555-0100",
    emailContact: "contact@youruni.com",
    country: "Malaysia",
    type: "University",
    status: "approved",
    registeredAt: "2023-01-15T18:00:00Z",
  },
];














