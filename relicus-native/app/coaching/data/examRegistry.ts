/**
 * Central Exam Dataset Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the SINGLE source of truth for all exam datasets.
 * All tabs (ChaptersTab, OverviewTab, MockTestsTab, AnalyticsTab, SearchBar)
 * call `getExamDataset(examType)` instead of maintaining their own switch blocks.
 *
 * ✅ To ADD a new exam:
 *   1. Create the data file in `data/<examName>Data.ts`
 *   2. Import and add to EXAM_REGISTRY below
 *   3. Add the ExamType to `exam.types.ts`
 *   4. No dashboard/tab code changes needed
 *
 * ✅ To ADD a new subject to an existing exam:
 *   1. Add to the exam's `*_SUBJECTS` array
 *   2. Add chapters with matching `subjectId` to `*_CHAPTERS`
 *   3. No other changes needed
 */

import { ExamType } from "../types/exam.types";
import { Chapter } from "../types/chapter.types";
import { Subject } from "../types/exam.types";
import { MockTest } from "../types/test.types";

import { JEE_SUBJECTS, JEE_CHAPTERS, JEE_MOCK_TESTS } from "./jeeData";
import { NEET_SUBJECTS, NEET_CHAPTERS, NEET_MOCK_TESTS } from "./neetData";
import { CUET_SUBJECTS, CUET_CHAPTERS, CUET_MOCK_TESTS } from "./cuetData";
import { UGCNET_SUBJECTS, UGCNET_CHAPTERS, UGCNET_MOCK_TESTS } from "./ugcNetData";
import { GATE_SUBJECTS, GATE_CHAPTERS, GATE_MOCK_TESTS } from "./gateData";
import { EAMCET_SUBJECTS, EAMCET_CHAPTERS, EAMCET_MOCK_TESTS } from "./eamcetData";
import { ICET_SUBJECTS, ICET_CHAPTERS, ICET_MOCK_TESTS } from "./icetData";

export interface ExamDataset {
  subjects: Subject[];
  chapters: Chapter[];
  mockTests: MockTest[];
}

const EXAM_REGISTRY: Record<ExamType, ExamDataset> = {
  JEE:        { subjects: JEE_SUBJECTS,     chapters: JEE_CHAPTERS,     mockTests: JEE_MOCK_TESTS     },
  NEET:       { subjects: NEET_SUBJECTS,    chapters: NEET_CHAPTERS,    mockTests: NEET_MOCK_TESTS    },
  CUET:       { subjects: CUET_SUBJECTS,    chapters: CUET_CHAPTERS,    mockTests: CUET_MOCK_TESTS    },
  "UGC-NET":  { subjects: UGCNET_SUBJECTS,  chapters: UGCNET_CHAPTERS,  mockTests: UGCNET_MOCK_TESTS  },
  GATE:       { subjects: GATE_SUBJECTS,    chapters: GATE_CHAPTERS,    mockTests: GATE_MOCK_TESTS    },
  EAMCET:     { subjects: EAMCET_SUBJECTS,  chapters: EAMCET_CHAPTERS,  mockTests: EAMCET_MOCK_TESTS  },
  ICET:       { subjects: ICET_SUBJECTS,    chapters: ICET_CHAPTERS,    mockTests: ICET_MOCK_TESTS    },
};

/** Returns the full dataset for a given exam. Falls back to CUET if not found. */
export const getExamDataset = (examType: ExamType): ExamDataset =>
  EXAM_REGISTRY[examType] ?? EXAM_REGISTRY["CUET"];

/** Returns all exam datasets — used for cross-exam search. */
export const getAllExamDatasets = (): Record<ExamType, ExamDataset> => ({ ...EXAM_REGISTRY });

/** Returns all exam types that are registered. */
export const getRegisteredExamTypes = (): ExamType[] =>
  Object.keys(EXAM_REGISTRY) as ExamType[];
