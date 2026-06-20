import React, { createContext, useContext, useState } from "react";

export interface Booking {
  id: string;
  practitioner: string;
  specialty: string;
  date: string;
  time: string;
  mode: string;
  status: "Upcoming" | "Completed";
  type: "counselling" | "tuition";
}

export interface TestResult {
  testId: string;
  name: string;
  score: number;
  date: string;
}

interface AppContextType {
  name: string;
  email: string;
  phone: string;
  updateProfile: (name: string, email: string, phone: string) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "status">) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("User Name");
  const [email, setEmail] = useState("user@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  
  const [bookings, setBookings] = useState<Booking[]>([
    { id: "b1", practitioner: "Dr. Sarah Johnson", specialty: "Anxiety & Trauma", date: "Today", time: "3:00 PM", mode: "Video Session", status: "Upcoming", type: "counselling" },
    { id: "b2", practitioner: "Dr. Rajesh Kumar", specialty: "Stress Management", date: "May 28, 2026", time: "11:00 AM", mode: "Chat Session", status: "Completed", type: "counselling" },
    { id: "b3", practitioner: "Mr. John Smith", specialty: "Mathematics Tuition", date: "May 27, 2026", time: "4:00 PM", mode: "1-to-1 Tuition", status: "Completed", type: "tuition" },
    { id: "b4", practitioner: "Dr. Priya Sharma", specialty: "Family Counseling", date: "May 24, 2026", time: "5:30 PM", mode: "Video Session", status: "Completed", type: "counselling" },
  ]);

  const [testResults, setTestResults] = useState<TestResult[]>([
    { testId: "2", name: "JEE Main Practice", score: 85, date: "May 28, 2026" }
  ]);

  const updateProfile = (newName: string, newEmail: string, newPhone: string) => {
    setName(newName);
    setEmail(newEmail);
    setPhone(newPhone);
  };

  const addBooking = (booking: Omit<Booking, "id" | "status">) => {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(36).substr(2, 9),
      status: "Upcoming",
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => {
      const index = prev.findIndex((r) => r.testId === result.testId);
      if (index !== -1) {
        const next = [...prev];
        next[index] = result;
        return next;
      }
      return [result, ...prev];
    });
  };

  return (
    <AppContext.Provider
      value={{
        name,
        email,
        phone,
        updateProfile,
        bookings,
        addBooking,
        testResults,
        addTestResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
