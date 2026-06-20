import { Assessment } from "../../app/tuition/types";

export const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: "ass-1",
    title: "Daily Quiz: Polynomials",
    subject: "Mathematics",
    type: "Daily Quiz",
    totalMarks: 20,
    durationMinutes: 15,
    dueDate: "2024-06-12T23:59:59Z",
    status: "Pending",
  },
  {
    id: "ass-2",
    title: "Weekly Test: Kinematics",
    subject: "Physics",
    type: "Weekly Test",
    totalMarks: 50,
    durationMinutes: 45,
    dueDate: "2024-06-15T23:59:59Z",
    status: "Pending",
  },
  {
    id: "ass-3",
    title: "Monthly Exam: Chemistry Chapters 1-3",
    subject: "Chemistry",
    type: "Monthly Exam",
    totalMarks: 100,
    durationMinutes: 120,
    dueDate: "2024-06-05T23:59:59Z",
    status: "Graded",
    score: 88,
  },
];
