import { Teacher } from "../../app/tuition/types";

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: "tch-1",
    name: "Dr. Ananya Sharma",
    avatar: "https://i.pravatar.cc/150?u=ananya",
    subjects: ["Mathematics", "Physics"],
    experienceYears: 8,
    rating: 4.8,
    availability: "Mon-Fri, 4 PM - 8 PM",
  },
  {
    id: "tch-2",
    name: "Mr. Rahul Verma",
    avatar: "https://i.pravatar.cc/150?u=rahul",
    subjects: ["Chemistry", "Biology"],
    experienceYears: 12,
    rating: 4.9,
    availability: "Tue-Sat, 5 PM - 9 PM",
  },
  {
    id: "tch-3",
    name: "Ms. Priya Singh",
    avatar: "https://i.pravatar.cc/150?u=priya",
    subjects: ["English", "History"],
    experienceYears: 5,
    rating: 4.6,
    availability: "Weekends, 10 AM - 2 PM",
  },
];
