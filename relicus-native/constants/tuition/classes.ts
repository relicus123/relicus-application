import { ClassSession, SyllabusTopic } from "../../app/tuition/types";

export const MOCK_CLASSES: ClassSession[] = [
  {
    id: "cls-1",
    title: "Quadratic Equations - Part 1",
    subject: "Mathematics",
    teacherId: "tch-1",
    startTime: "2024-06-12T10:00:00Z",
    endTime: "2024-06-12T11:00:00Z",
    status: "Upcoming",
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: "cls-2",
    title: "Laws of Motion",
    subject: "Physics",
    teacherId: "tch-2",
    startTime: "2024-06-12T11:30:00Z",
    endTime: "2024-06-12T12:30:00Z",
    status: "Upcoming",
    meetingLink: "https://zoom.us/j/987654321",
  },
  {
    id: "cls-3",
    title: "Chemical Bonding",
    subject: "Chemistry",
    teacherId: "tch-3",
    startTime: "2024-06-11T10:00:00Z",
    endTime: "2024-06-11T11:00:00Z",
    status: "Completed",
  },
];

export const MOCK_SYLLABUS: SyllabusTopic[] = [
  {
    id: "syl-1",
    subject: "Mathematics",
    chapterNumber: 1,
    title: "Real Numbers",
    progressPercent: 100,
    status: "Completed",
  },
  {
    id: "syl-2",
    subject: "Mathematics",
    chapterNumber: 2,
    title: "Polynomials",
    progressPercent: 60,
    status: "In Progress",
  },
  {
    id: "syl-3",
    subject: "Mathematics",
    chapterNumber: 3,
    title: "Quadratic Equations",
    progressPercent: 0,
    status: "Not Started",
  },
];
