import { useSkillsStore, Certificate } from "../store/skills.store";
import { progressService } from "./progress.service";

export const certificateService = {
  // Check if student is eligible for a certificate in a course
  isEligibleForCertificate: (courseId: string): boolean => {
    // 1. Completion must be 100%
    const completionPercent = progressService.getCourseCompletionPercentage(courseId);
    if (completionPercent < 100) return false;

    // 2. Must pass at least one quiz / assessment (or check if submissions are reviewed)
    const state = useSkillsStore.getState();
    const courseSubmissions = state.submissions.filter((s) => s.courseId === courseId);
    const hasSubmitted = courseSubmissions.length > 0;

    return completionPercent === 100 && hasSubmitted;
  },

  // Get certificate by course ID
  getCertificateByCourseId: (courseId: string): Certificate | undefined => {
    return useSkillsStore.getState().certificates.find((c) => c.courseId === courseId);
  },

  // Get all earned certificates
  getAllCertificates: (): Certificate[] => {
    return useSkillsStore.getState().certificates;
  },

  // Generate certificate
  generateCertificate: (courseId: string, recipientName: string): void => {
    useSkillsStore.getState().generateCertificate(courseId, recipientName);
  },

  // Download PDF mockup
  downloadCertificatePdf: (cert: Certificate): void => {
    // Simulate file download trigger
    const fileName = `${cert.courseTitle.replace(/\s+/g, "_")}_Certificate.pdf`;
    
    // Create custom download indicator
    const textContent = `
=============================================
             RELICUS ACADEMY
=============================================
This is to certify that
            ${cert.recipientName.toUpperCase()}
has successfully completed the professional course
    "${cert.courseTitle.toUpperCase()}"
on ${cert.date}.
---------------------------------------------
Credential ID: ${cert.credentialId}
Verification Link: https://relicus.edu/verify/${cert.credentialId}
=============================================
`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Share to LinkedIn mockup
  shareCertificateToLinkedIn: (cert: Certificate): string => {
    const text = encodeURIComponent(
      `I'm thrilled to share that I have completed the "${cert.courseTitle}" certification program at Relicus Academy! Credential ID: ${cert.credentialId}`
    );
    const url = encodeURIComponent(`https://relicus.edu/verify/${cert.credentialId}`);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`;
  }
};
