// Common types for the ReadyForms application

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  blocked: boolean;
  language?: string;
  theme?: string;
  createdAt: string;
  updatedAt: string;
}

// Topic type
export interface Topic {
  id: string;
  name: string;
  description?: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

// Template type
export interface Template {
  id: string;
  title: string;
  description: string;
  userId: string;
  user?: User;
  topicId: string;
  topic?: Topic;
  isPublic: boolean;
  imageUrl?: string;
  allowedUsers?: string; // JSON string of user IDs
  createdAt: string;
  updatedAt: string;
  version?: number;
  // Form fields
  customString1State: boolean;
  customString1Question?: string;
  customString2State: boolean;
  customString2Question?: string;
  customString3State: boolean;
  customString3Question?: string;
  customString4State: boolean;
  customString4Question?: string;
  customText1State: boolean;
  customText1Question?: string;
  customText2State: boolean;
  customText2Question?: string;
  customText3State: boolean;
  customText3Question?: string;
  customText4State: boolean;
  customText4Question?: string;
  customInt1State: boolean;
  customInt1Question?: string;
  customInt2State: boolean;
  customInt2Question?: string;
  customInt3State: boolean;
  customInt3Question?: string;
  customInt4State: boolean;
  customInt4Question?: string;
  customCheckbox1State: boolean;
  customCheckbox1Question?: string;
  customCheckbox2State: boolean;
  customCheckbox2Question?: string;
  customCheckbox3State: boolean;
  customCheckbox3Question?: string;
  customCheckbox4State: boolean;
  customCheckbox4Question?: string;
  questionOrder: string; // JSON string of question order
}

// Form Response type
export interface FormResponse {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Custom fields
  customString1Answer?: string;
  customString2Answer?: string;
  customString3Answer?: string;
  customString4Answer?: string;
  customText1Answer?: string;
  customText2Answer?: string;
  customText3Answer?: string;
  customText4Answer?: string;
  customInt1Answer?: number;
  customInt2Answer?: number;
  customInt3Answer?: number;
  customInt4Answer?: number;
  customCheckbox1Answer?: boolean;
  customCheckbox2Answer?: boolean;
  customCheckbox3Answer?: boolean;
  customCheckbox4Answer?: boolean;
}

// Comment type
export interface Comment {
  id: string;
  userId: string;
  templateId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

// Like type
export interface Like {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

// Auth response type
export interface AuthResponse {
  token: string;
  user: User;
}

// Dashboard stats type
export interface DashboardStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}