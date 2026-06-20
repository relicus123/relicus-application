import { StudyMaterial } from "../../app/tuition/types";

export const MOCK_MATERIALS: StudyMaterial[] = [
  {
    id: "mat-1",
    title: "Quadratic Equations Complete Notes",
    subject: "Mathematics",
    type: "PDF",
    url: "https://example.com/math-notes.pdf",
    size: "2.4 MB",
    uploadDate: "2024-06-01T00:00:00Z",
  },
  {
    id: "mat-2",
    title: "Newton's Laws Explained",
    subject: "Physics",
    type: "Video",
    url: "https://example.com/physics-video.mp4",
    duration: "45 mins",
    uploadDate: "2024-06-05T00:00:00Z",
  },
  {
    id: "mat-3",
    title: "Organic Chemistry Practice Set 1",
    subject: "Chemistry",
    type: "Practice Paper",
    url: "https://example.com/chem-practice.pdf",
    size: "1.1 MB",
    uploadDate: "2024-06-08T00:00:00Z",
  },
];
