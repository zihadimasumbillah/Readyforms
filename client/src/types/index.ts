export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  blocked?: boolean;
  language?: string;
  theme?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: "string" | "text" | "int" | "checkbox";
  required: boolean;
  value?: any;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Tag {
  id: number | string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

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

  isQuiz?: boolean;
  showScoreImmediately?: boolean;
  scoringCriteria?: string;

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

  questionOrder: string;
  user?: User;
  topic?: Topic;
  likesCount?: number;
  commentsCount?: number;
  responsesCount?: number;
  tags?: Array<Tag>;

  [key: string]: any;
}

export interface FormResponse {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: number;

  score?: number;
  totalPossiblePoints?: number;
  scoreViewed?: boolean;
  percentScore?: number;

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

  user?: User;
  template?: Template;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  version: number;

  user?: User;
  template?: Template;
}

export interface Like {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  version: number;

  user?: User;
  template?: Template;
}

export interface DashboardStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}

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

