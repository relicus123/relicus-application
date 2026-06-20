# UGC-NET Architecture Audit Findings

This document summarizes the findings from the audit verifying the existence and structure of **UGC-NET** within the **Entrance Coaching** module.

---

## Executive Summary

* **UGC-NET Status**: **Missing**
* **Verification Outcome**: There is no trace of UGC-NET, GATE, or Paper 1/Paper 2 exam data, constants, types, or views in the application. Currently, the Entrance Coaching module is configured to support exactly three exams: **CUET (UG)**, **JEE Main & Advanced**, and **NEET (UG)**.

---

## Audit Evidence & Findings

### 1. Codebase Search Checks
* **Keyword Searches**: Searching for `"UGC-NET"`, `"UGC NET"`, or `"GATE"` (case-insensitive) across the `/src` directory returned **0 results**.
* **Paper 1 & Paper 2 Searches**: Searching for `"Paper 1"` or `"Paper 2"` only yielded a single reference inside the JEE previous year question sets:
  * Location: `src/app/screens/EntranceCoaching/tabs/PYQsTab.tsx` (Line 65):
    * `"JEE Main 2023 Chemistry Paper 1"`

### 2. Entrance Coaching Module Analysis
The Entrance Coaching module is structured as follows inside `src/app/screens/EntranceCoaching/`:
* **Strict Type Safety**: The `ExamType` is defined in [exam.types.ts](file:///c:/Users/MAHAJAN%20ASHOK/OneDrive/Desktop/relicus%20app/src/app/screens/EntranceCoaching/types/exam.types.ts) as:
  ```typescript
  export type ExamType = "CUET" | "JEE" | "NEET";
  ```
* **Exam List Constants**: The `EXAMS` list in [exams.ts](file:///c:/Users/MAHAJAN%20ASHOK/OneDrive/Desktop/relicus%20app/src/app/screens/EntranceCoaching/constants/exams.ts) registers only these three entries:
  ```typescript
  export const EXAMS: { type: ExamType; name: string; description: string }[] = [
    { type: "CUET", name: "CUET (UG)", description: "..." },
    { type: "JEE", name: "JEE Main & Advanced", description: "..." },
    { type: "NEET", name: "NEET (UG)", description: "..." }
  ];
  ```
* **Selection Interfaces**: [ExamSelection.tsx](file:///c:/Users/MAHAJAN%20ASHOK/OneDrive/Desktop/relicus%20app/src/app/screens/EntranceCoaching/ExamSelection.tsx) maps options exclusively to the configured constants.
* **Mock Data Layers**: Data is limited to `cuetData.ts`, `jeeData.ts`, and `neetData.ts` in the `data/` subdirectory.

---

## Recommendations & Next Steps

Since UGC-NET is currently missing, we should integrate it directly into the **Entrance Coaching** module to reuse the existing architecture (such as the persistent coaching store, search bars, mock test timers, doubts panels, and course navigation layout). 

### Proposed Integration Steps:
1. **Extend Type Signatures**:
   Update `ExamType` in `exam.types.ts` to include `"UGC-NET"`.
2. **Register Constants**:
   Add UGC-NET to the `EXAMS` array in `exams.ts`.
3. **Seed UGC-NET Mock Data**:
   Create `src/app/screens/EntranceCoaching/data/ugcNetData.ts` to define UGC-NET subjects (e.g., Paper 1 - General Paper, Paper 2 - Computer Science/History/English), modules, video lessons, and mock assessments.
4. **Wire Overview & Tabs**:
   Update `OverviewTab.tsx`, `ChaptersTab.tsx`, `MockTestsTab.tsx`, and `SearchBar.tsx` to resolve subjects and chapters when `examType === "UGC-NET"`.
