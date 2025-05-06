// Common types for the ReadyForms application

// User related types
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

// Template related types
export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  userId: string;
  topicId: string;
  isPublic: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  // Fields for questions
  customString1State: boolean;
  customString1Question: string;
  customString2State: boolean;
  customString2Question: string;
  customString3State: boolean;
  customString3Question: string;
  customString4State: boolean;
  customString4Question: string;
  customText1State: boolean;
  customText1Question: string;
  customText2State: boolean;
  customText2Question: string;
  customText3State: boolean;
  customText3Question: string;
  customText4State: boolean;
  customText4Question: string;
  customInt1State: boolean;
  customInt1Question: string;
  customInt2State: boolean;
  customInt2Question: string;
  customInt3State: boolean;
  customInt3Question: string;
  customInt4State: boolean;
  customInt4Question: string;
  customCheckbox1State: boolean;
  customCheckbox1Question: string;
  customCheckbox2State: boolean;
  customCheckbox2Question: string;
  customCheckbox3State: boolean;
  customCheckbox3Question: string;
  customCheckbox4State: boolean;
  customCheckbox4Question: string;
  questionOrder: string;
  // Stats fields
  likeCount?: number;
  isLiked?: boolean;
  responseCount?: number;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  version: number;
}

export interface TopicWithCount extends Topic {
  count: number;
}

export interface FormResponse {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  // Response fields
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
  template?: Template;
  user?: User;
}

export interface AggregateData {
  avg_custom_int1: number | null;
  avg_custom_int2: number | null;
  avg_custom_int3: number | null;
  avg_custom_int4: number | null;
  string1_count: number;
  string2_count: number;
  string3_count: number;
  string4_count: number;
  text1_count: number;
  text2_count: number;
  text3_count: number;
  text4_count: number;
  checkbox1_yes_count: number;
  checkbox2_yes_count: number;
  checkbox3_yes_count: number;
  checkbox4_yes_count: number;
  total_responses: number;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

// Dashboard statistics
export interface DashboardStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}