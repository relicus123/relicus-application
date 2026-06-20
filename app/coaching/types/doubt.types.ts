import { ExamType } from "./exam.types";

export type DoubtStatus = "open" | "in_review" | "answered" | "closed";

export interface DoubtResponse {
  id: string;
  author: string; // e.g. "Dr. Amit Sharma"
  text: string;
  audioUrl?: string; // voice response URL
  attachments?: { name: string; url: string }[];
  createdAt: string;
}

export interface Doubt {
  id: string;
  examType: ExamType;
  title: string;
  description: string;
  imageUrl?: string;
  pdfUrl?: string;
  voiceUrl?: string; // recorded voice query
  status: DoubtStatus;
  createdAt: string;
  answeredAt?: string;
  responses: DoubtResponse[];
}
