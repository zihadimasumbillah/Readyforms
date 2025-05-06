// Common types for the ReadyForms application

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  language?: string;
  theme?: string;
  blocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Topic type definition
export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Template type definition
export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  userId: string;
  topicId: string;
  isPublic: boolean;
  allowedUsers?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  
  // Custom field states
  customString1State: boolean;
  customString2State: boolean;
  customString3State: boolean;
  customString4State: boolean;
  customText1State: boolean;
  customText2State: boolean;
  customText3State: boolean;
  customText4State: boolean;
  customInt1State: boolean;
  customInt2State: boolean;
  customInt3State: boolean;
  customInt4State: boolean;
  customCheckbox1State: boolean;
  customCheckbox2State: boolean;
  customCheckbox3State: boolean;
  customCheckbox4State: boolean;
  
  // Custom field questions
  customString1Question: string;
  customString2Question: string;
  customString3Question: string;
  customString4Question: string;
  customText1Question: string;
  customText2Question: string;
  customText3Question: string;
  customText4Question: string;
  customInt1Question: string;
  customInt2Question: string;
  customInt3Question: string;
  customInt4Question: string;
  customCheckbox1Question: string;
  customCheckbox2Question: string;
  customCheckbox3Question: string;
  customCheckbox4Question: string;
  
  // Order of questions (JSON string)
  questionOrder: string;
  
  // Relations (optional because they might not always be included)
  user?: User;
  topic?: Topic;
  
  // Extra stats that might be included in some responses
  likesCount?: number;
  commentsCount?: number;
  responsesCount?: number;
}

// Form Response type definition
export interface FormResponse {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  
  // Custom field answers
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
  
  // Relations
  user?: User;
  template?: Template;
}

// Comment type definition
export interface Comment {
  id: string;
  content: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  
  // Relations
  user?: User;
  template?: Template;
}

// Like type definition
export interface Like {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  
  // Relations
  user?: User;
  template?: Template;
}

// Dashboard stats type
export interface DashboardStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}

// Admin dashboard stats type
export interface AdminDashboardStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
  users: number;
  activeUsers: number;
  topicsCount: number;
  adminCount: number;
}