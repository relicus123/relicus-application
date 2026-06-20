import { ExamInfoData } from "../types/exam.types";

/**
 * Static rich-info data for the ExamInfoScreen.
 * All dates are mock/future-facing.
 * To add a new exam: add a new entry here. No screen code changes needed.
 */
export const EXAM_INFO: Record<string, ExamInfoData> = {
  JEE: {
    examType: "JEE",
    tagline: "India's most competitive engineering entrance exam",
    overview:
      "JEE (Joint Entrance Examination) is the premier national-level exam for admission to IITs, NITs, IIITs, and other top engineering institutions. It consists of JEE Main (4 sessions per year) and JEE Advanced (for IIT aspirants). It tests Mathematics, Physics, and Chemistry at the highest level.",
    eligibility: [
      "Class 12 (PCM) with 75%+ marks (65% for SC/ST)",
      "Age: born on or after October 1, 2002",
      "Maximum 3 consecutive years of attempts",
      "Appearing / Passed 12th from recognized board",
    ],
    examPattern: [
      { section: "Mathematics", questions: 30, marks: 100, duration: "1 hr" },
      { section: "Physics", questions: 30, marks: 100, duration: "1 hr" },
      { section: "Chemistry", questions: 30, marks: 100, duration: "1 hr" },
    ],
    nextExamDate: "2027-04-13",
    syllabusTopics: [
      "Calculus",
      "Algebra",
      "Mechanics",
      "Electrodynamics",
      "Optics",
      "Organic Chemistry",
      "Inorganic Chemistry",
      "Thermodynamics",
      "Coordinate Geometry",
      "Probability",
    ],
    difficultyLevel: 5,
    careerOpportunities: [
      "IIT / NIT Graduate Engineer",
      "Software Development (FAANG)",
      "Aerospace & Defence Engineering",
      "Research Scientist (ISRO, DRDO)",
      "Entrepreneurship & Startups",
    ],
  },

  NEET: {
    examType: "NEET",
    tagline: "National gateway to MBBS, BDS & allied health programs",
    overview:
      "NEET (National Eligibility cum Entrance Test) is the single standardized entrance exam for admission to MBBS, BDS, AYUSH, Nursing, and other medical courses across India. It is conducted by NTA once a year and tests Biology, Physics, and Chemistry.",
    eligibility: [
      "Class 12 (PCB) with 50%+ marks (40% for SC/ST/OBC)",
      "Minimum age: 17 years on December 31 of admission year",
      "No upper age limit (as per Supreme Court order)",
      "Maximum 3 attempts (subject to policy changes)",
    ],
    examPattern: [
      { section: "Biology (Botany + Zoology)", questions: 90, marks: 360, duration: "1.5 hrs" },
      { section: "Physics", questions: 45, marks: 180, duration: "45 min" },
      { section: "Chemistry", questions: 45, marks: 180, duration: "45 min" },
    ],
    nextExamDate: "2027-05-04",
    syllabusTopics: [
      "Cell Biology",
      "Genetics & Evolution",
      "Human Physiology",
      "Plant Physiology",
      "Ecology",
      "Chemical Bonding",
      "Thermodynamics",
      "Laws of Motion",
      "Optics",
      "Organic Chemistry",
    ],
    difficultyLevel: 4,
    careerOpportunities: [
      "MBBS Doctor (Government / Private)",
      "BDS Dentist",
      "Medical Researcher",
      "Public Health Specialist",
      "AYUSH Practitioner",
    ],
  },

  CUET: {
    examType: "CUET",
    tagline: "Single-window admission to 261+ Central Universities",
    overview:
      "CUET (Common University Entrance Test) is NTA's unified gateway to undergraduate programs in 261+ central, state, and private universities. It includes language tests, domain-specific subjects, and a general test section, making it the broadest college admission exam in India.",
    eligibility: [
      "Class 12 from any recognized board (any stream)",
      "No minimum percentage requirement by NTA",
      "Individual universities may set own eligibility norms",
      "No age limit specified by NTA",
    ],
    examPattern: [
      { section: "Language Test", questions: 40, marks: 160, duration: "45 min" },
      { section: "Domain Specific Subject", questions: 40, marks: 160, duration: "45 min" },
      { section: "General Test", questions: 60, marks: 240, duration: "1 hr" },
    ],
    nextExamDate: "2027-05-18",
    syllabusTopics: [
      "Reading Comprehension",
      "Logical Reasoning",
      "Quantitative Aptitude",
      "General Knowledge",
      "Domain Subject (chosen)",
      "Current Affairs",
      "Data Interpretation",
      "Numerical Ability",
    ],
    difficultyLevel: 3,
    careerOpportunities: [
      "Central University Graduate",
      "Civil Services (IAS/IPS preparation pathway)",
      "MBA / Law / Research programs",
      "Teaching & Academia",
      "Government Sector Jobs",
    ],
  },

  "UGC-NET": {
    examType: "UGC-NET",
    tagline: "Qualify for Assistant Professor & Junior Research Fellowship",
    overview:
      "UGC-NET (National Eligibility Test) determines eligibility for the post of Assistant Professor and/or Junior Research Fellowship (JRF) in Indian universities and colleges. It is conducted twice a year by NTA across 83 subjects. Paper 1 is common for all; Paper 2 is subject-specific.",
    eligibility: [
      "Master's degree with minimum 55% (50% for SC/ST/PwD)",
      "Students in final year of Master's degree can also apply",
      "No upper age limit for Assistant Professor eligibility",
      "For JRF: maximum 30 years (35 for SC/ST/PwD/Female)",
    ],
    examPattern: [
      { section: "Paper 1 — General Teaching & Research Aptitude", questions: 50, marks: 100, duration: "1 hr" },
      { section: "Paper 2 — Subject Specific", questions: 100, marks: 200, duration: "2 hrs" },
    ],
    nextExamDate: "2027-06-14",
    syllabusTopics: [
      "Teaching Aptitude",
      "Research Methodology",
      "Logical Reasoning",
      "Data Interpretation",
      "ICT & Digital Literacy",
      "Higher Education System",
      "Subject-specific Paper 2",
      "Communication Skills",
    ],
    difficultyLevel: 4,
    careerOpportunities: [
      "Assistant Professor (College / University)",
      "Junior Research Fellow (JRF) — ₹37,000/month stipend",
      "PhD Admission via JRF quota",
      "Research Scientist (CSIR, ICAR, ICMR)",
      "Academic Administration & Curriculum Development",
    ],
  },

  GATE: {
    examType: "GATE",
    tagline: "Graduate Aptitude Test for M.Tech admissions & PSU jobs",
    overview:
      "GATE (Graduate Aptitude Test in Engineering) tests the comprehensive understanding of undergraduate engineering subjects for admission to IIT/IISc M.Tech programs and direct recruitment to top PSUs (BHEL, ONGC, NTPC, BARC, etc.). GATE scores are also accepted by over 900 institutes and several foreign universities.",
    eligibility: [
      "Bachelor's degree in Engineering / Technology / Architecture",
      "Master's degree in Science / Mathematics / Statistics / Computer Applications",
      "Students in final year / pre-final year can apply",
      "No age limit",
    ],
    examPattern: [
      { section: "General Aptitude", questions: 10, marks: 15, duration: "Included in 3 hrs" },
      { section: "Engineering Mathematics", questions: 13, marks: 13, duration: "Included in 3 hrs" },
      { section: "Subject-Specific Paper", questions: 42, marks: 72, duration: "3 hrs total" },
    ],
    nextExamDate: "2027-02-07",
    syllabusTopics: [
      "Data Structures & Algorithms",
      "Operating Systems",
      "Computer Networks",
      "Database Management",
      "Theory of Computation",
      "Engineering Mathematics",
      "Digital Logic",
      "General Aptitude",
      "Computer Organization",
      "Software Engineering",
    ],
    difficultyLevel: 5,
    careerOpportunities: [
      "IIT / IISc M.Tech Admission",
      "PSU Jobs (BHEL, ONGC, NTPC, BARC)",
      "Senior Engineer (Government sector)",
      "Research & Development (DRDO, ISRO)",
      "Foreign University Admissions (NUS, TU Delft)",
    ],
  },

  EAMCET: {
    examType: "EAMCET",
    tagline: "Engineering & Agriculture entrance for AP & Telangana",
    overview:
      "EAMCET (Engineering Agricultural and Medical Common Entrance Test) is the gateway to engineering, agriculture, and pharmacy programs in Andhra Pradesh and Telangana state universities. It is conducted separately by each state (AP EAMCET and TS EAMCET) and is based on the Class 12 syllabus (MPC/BiPC).",
    eligibility: [
      "Class 12 with MPC/BiPC with minimum 45% (40% for SC/ST)",
      "Domicile of Andhra Pradesh or Telangana",
      "Age: Minimum 16 years as of December 31 of admission year",
      "No upper age limit",
    ],
    examPattern: [
      { section: "Mathematics", questions: 80, marks: 80, duration: "Included in 3 hrs" },
      { section: "Physics", questions: 40, marks: 40, duration: "Included in 3 hrs" },
      { section: "Chemistry", questions: 40, marks: 40, duration: "3 hrs total" },
    ],
    nextExamDate: "2027-06-10",
    syllabusTopics: [
      "Coordinate Geometry",
      "Calculus & Integration",
      "Mechanics & Gravitation",
      "Electrostatics",
      "Chemical Equilibrium",
      "Organic Reactions",
      "Trigonometry",
      "Algebra & Matrices",
      "Optics",
      "Thermodynamics",
    ],
    difficultyLevel: 3,
    careerOpportunities: [
      "B.Tech from AP/TS State Universities (JNTUH, JNTUA, JNTUK)",
      "B.Sc Agriculture / Horticulture",
      "B.Pharmacy",
      "State Government Engineering Jobs",
      "Higher Studies (M.Tech / MBA)",
    ],
  },

  ICET: {
    examType: "ICET",
    tagline: "Integrated Common Entrance Test for MBA & MCA aspirants",
    overview:
      "ICET (Integrated Common Entrance Test) qualifies candidates for MBA and MCA admissions in universities and colleges of Andhra Pradesh and Telangana. It tests Analytical Ability, Mathematical Ability, and Communication (English) skills at the graduate level.",
    eligibility: [
      "Bachelor's degree with minimum 50% marks (45% for SC/ST)",
      "Domicile of Andhra Pradesh or Telangana",
      "No age limit",
      "Final year graduates can apply conditionally",
    ],
    examPattern: [
      { section: "Analytical Ability", questions: 75, marks: 75, duration: "75 min" },
      { section: "Mathematical Ability", questions: 75, marks: 75, duration: "75 min" },
      { section: "Communication Ability (English)", questions: 50, marks: 50, duration: "50 min" },
    ],
    nextExamDate: "2027-05-25",
    syllabusTopics: [
      "Data Sufficiency",
      "Logical Reasoning",
      "Arithmetic Operations",
      "Algebra & Geometry",
      "Statistics",
      "Vocabulary & Grammar",
      "Reading Comprehension",
      "Business Communication",
      "Sequences & Patterns",
      "Time, Speed & Distance",
    ],
    difficultyLevel: 3,
    careerOpportunities: [
      "MBA (Marketing, Finance, HR, Operations)",
      "MCA (Software Development Pathway)",
      "Business Analyst",
      "Management Trainee (Corporate)",
      "Entrepreneurship & Startups",
    ],
  },
};

/** Helper to get exam info data safely */
export const getExamInfo = (examType: string): ExamInfoData | undefined =>
  EXAM_INFO[examType];
