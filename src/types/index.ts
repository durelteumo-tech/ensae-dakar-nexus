export type EnsaePromo =
  | "AS1"
  | "AS2"
  | "AS3"
  | "ISEP1"
  | "ISEP2"
  | "ISE1 CL"
  | "ISE1 Math"
  | "ISE1 Eco"
  | "ISE2"
  | "ISE3";

export type ResourceCategory =
  | "Statistiques"
  | "Économétrie"
  | "Data Science"
  | "Python / R"
  | "Probabilités"
  | "Français"
  | "Anglais";

export type ResourceFileType = "PDF" | "R" | "Python" | "Notebook";

export type ValidationBadge = "100% Validé" | "Vérifié Club Info";

export interface ResourceItem {
  id: string;
  title: string;
  subject: ResourceCategory;
  fileType: ResourceFileType;
  fileSize: string;
  author: string;
  promo: string;
  badge: ValidationBadge;
  downloads: number;
  uploadedAt: string;
  downloadUrl: string;
}

export interface ActivityItem {
  id: string;
  type: "upload" | "download" | "qcm" | "match";
  title: string;
  detail: string;
  timestamp: string;
  badge?: string;
}

export interface StudentProfile {
  id: string;
  email?: string;
  name: string;
  promo: EnsaePromo;
  specialty: string;
  skills: string[];
  lookingFor: string[];
  matchScore: number;
  projectIdea: string;
  whatsappHandle: string;
  discordHandle: string;
  availability: "Disponible" | "En projet";
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  promo: EnsaePromo;
  specialty: string;
  skills: string[];
  lookingFor: string[];
  projectIdea: string;
  whatsappHandle: string;
  discordHandle: string;
  availability: "Disponible" | "En projet";
  provider: "supabase" | "server-demo";
}

export interface QcmQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DiscussionReply {
  id: string;
  author: string;
  promo: EnsaePromo;
  content: string;
  createdAt: string;
}

export interface DiscussionPost {
  id: string;
  author: string;
  promo: EnsaePromo;
  channel: "Général" | ResourceCategory;
  title: string;
  content: string;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface StudentGroup {
  id: string;
  name: string;
  subject: string;
  promo: string;
  code: string;
  members: string[];
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  author: string;
  promo: string;
  specialty?: string;
  content: string;
  createdAt: string;
  timestamp: number;
  replyTo?: {
    id: string;
    author: string;
    content: string;
  };
}
