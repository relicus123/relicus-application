import { ExamType } from "../../app/coaching/types/exam.types";

export const EXAM_THEMES: Record<
  ExamType,
  {
    gradient: string;
    bg: string;
    border: string;
    text: string;
    primary: string;
    accent: string;
    arrowBg: string;
  }
> = {
  CUET: {
    gradient: "from-[#FAF5FF] to-[#F5EEFE]",
    bg: "bg-gradient-to-br from-[#FAF5FF] to-[#F5EEFE]",
    border: "border-[#E9D5FF]/60",
    text: "text-[#4C1D95]",
    primary: "#8B5CF6",
    accent: "#FAF5FF",
    arrowBg: "bg-[#8B5CF6]",
  },
  JEE: {
    gradient: "from-[#F0F7FF] to-[#EDF5FE]",
    bg: "bg-gradient-to-br from-[#F0F7FF] to-[#EDF5FE]",
    border: "border-[#BFDBFE]/60",
    text: "text-[#1E3A8A]",
    primary: "#3B82F6",
    accent: "#F0F7FF",
    arrowBg: "bg-[#3B82F6]",
  },
  NEET: {
    gradient: "from-[#ECFDF5] to-[#EBFBF2]",
    bg: "bg-gradient-to-br from-[#ECFDF5] to-[#EBFBF2]",
    border: "border-[#A7F3D0]/60",
    text: "text-[#065F46]",
    primary: "#10B981",
    accent: "#ECFDF5",
    arrowBg: "bg-[#10B981]",
  },
  "UGC-NET": {
    gradient: "from-[#FFF7ED] to-[#FFF1E5]",
    bg: "bg-gradient-to-br from-[#FFF7ED] to-[#FFF1E5]",
    border: "border-[#FED7AA]/60",
    text: "text-[#C2410C]",
    primary: "#EA580C",
    accent: "#FFF7ED",
    arrowBg: "bg-[#EA580C]",
  },
  GATE: {
    gradient: "from-[#F8FAFC] to-[#F1F5F9]",
    bg: "bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]",
    border: "border-[#E2E8F0]/60",
    text: "text-[#334155]",
    primary: "#475569",
    accent: "#F8FAFC",
    arrowBg: "bg-[#475569]",
  },
  EAMCET: {
    gradient: "from-[#ECFDF5] to-[#D1FAE5]",
    bg: "bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5]",
    border: "border-[#A7F3D0]/60",
    text: "text-[#047857]",
    primary: "#059669",
    accent: "#ECFDF5",
    arrowBg: "bg-[#059669]",
  },
  ICET: {
    gradient: "from-[#FFF1F2] to-[#FFE4E6]",
    bg: "bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6]",
    border: "border-[#FECDD3]/60",
    text: "text-[#BE123C]",
    primary: "#E11D48",
    accent: "#FFF1F2",
    arrowBg: "bg-[#E11D48]",
  },
};

export const GLOBAL_COLORS = {
  primary: "#1C4966",
  secondary: "#5F8B70",
  background: "#FFFFF0",
  danger: "#D9534F",
  success: "#5CB85C",
  warning: "#F0AD4E",
};
