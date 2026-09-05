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
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "status">) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([
    { id: "b3", practitioner: "Mr. John Smith", specialty: "Mathematics Tuition", date: "May 27, 2026", time: "4:00 PM", mode: "1-to-1 Tuition", status: "Completed", type: "tuition" },
  ]);

  const [testResults, setTestResults] = useState<TestResult[]>([
    { testId: "2", name: "JEE Main Practice", score: 85, date: "May 28, 2026" }
  ]);

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
