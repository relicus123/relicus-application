import React, { useState, useMemo } from "react";
import { Award, Star, Share2, Sparkles, RefreshCw, ArrowLeft, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { Button } from "../../../components/Button";
import { useSkillsStore, Course } from "../store/skills.store";
import { certificateService } from "../services/certificate.service";
import { courseService } from "../services/course.service";
import { enrollmentService } from "../services/enrollment.service";
import { CourseFeedbackModal } from "./CourseFeedbackModal";
import { DynamicCertificate } from "./DynamicCertificate";

interface CourseCompletionScreenProps {
  courseId: string;
  onBack: () => void;
}

export const CourseCompletionScreen: React.FC<CourseCompletionScreenProps> = ({ courseId, onBack }) => {
  const store = useSkillsStore();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const course = useMemo(() => {
    return courseService.getCourseById(courseId)!;
  }, [courseId, store.courses]);

  const certificate = useMemo(() => {
    return certificateService.getCertificateByCourseId(courseId);
  }, [courseId, store.certificates]);

  // Recommended next courses based on this course
  const recommendations = useMemo(() => {
    return courseService.getRecommendations(courseId).slice(0, 2);
  }, [courseId, store.enrolledCourseIds]);

  const handleGenerateCertificate = () => {
    const name = prompt("Enter student name for the certificate:", "Ashok Mahajan") || "Ashok Mahajan";
    certificateService.generateCertificate(courseId, name);
    setShowCertModal(true);
  };

  const handleRecommendClick = (recId: string) => {
    enrollmentService.selectCourse(recId);
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-6 shadow-xs space-y-6 max-w-xl mx-auto my-4 text-center">
      
      {/* Header Accent */}
      <div className="space-y-2 pt-4">
        <div className="w-20 h-20 bg-gradient-to-br from-[#1C4966] to-[#5F8B70] text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-md relative">
          <Award className="w-10 h-10" />
          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1.5 -right-1.5 animate-bounce" />
        </div>
        <span className="text-[10px] font-black text-[#5F8B70] uppercase tracking-widest block">
          Congratulations!
        </span>
        <h3 className="text-lg font-black text-foreground leading-snug">
          🎓 Course Completed
        </h3>
        <p className="text-xs font-black text-[#1C4966] max-w-[340px] mx-auto">
          {course.title}
        </p>
      </div>

      {/* Completion Dashboard Stats */}
      <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-5 rounded-[1.75rem] border border-neutral-100">
        <div className="text-left space-y-0.5">
          <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">
            Completion Date
          </span>
          <span className="text-xs font-extrabold text-foreground">
            {certificate?.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
        <div className="text-left space-y-0.5">
          <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">
            Certificate Status
          </span>
          <span className={`text-xs font-extrabold ${certificate ? "text-[#5F8B70]" : "text-[#1C4966]"}`}>
            {certificate ? "✓ Issued" : "Pending Claim"}
          </span>
        </div>
      </div>

      {/* Skills Gained Section */}
      <div className="text-left space-y-3.5 bg-white border border-neutral-100 p-5 rounded-[1.75rem]">
        <h4 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
          Skills Gained
        </h4>
        <div className="flex flex-wrap gap-2">
          {course.skillsLearned.map((skill, idx) => (
            <span key={idx} className="text-[10px] font-bold bg-[#8FBDD7]/15 text-[#1C4966] px-3 py-1.5 rounded-full">
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Certificate Actions or Generation */}
      <div className="space-y-3 pt-2">
        {certificate ? (
          <div className="flex gap-3">
            <Button
              onClick={() => certificateService.downloadCertificatePdf(certificate)}
              variant="outline"
              className="flex-1 rounded-full text-xs font-bold border-[#1C4966] text-[#1C4966] hover:bg-neutral-50"
            >
              Download PDF
            </Button>
            <Button
              onClick={() => window.open(certificateService.shareCertificateToLinkedIn(certificate), "_blank")}
              className="flex-1 rounded-full text-xs font-bold"
            >
              <Share2 className="w-3.5 h-3.5 mr-1" /> Share on LinkedIn
            </Button>
          </div>
        ) : (
          <Button onClick={handleGenerateCertificate} className="w-full rounded-full py-3 bg-[#5F8B70] hover:bg-[#5F8B70]/95 shadow-md">
            Unlock & Generate Certificate
          </Button>
        )}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowFeedbackModal(true)}
            className="flex-1 text-[10px] font-bold text-neutral-500 hover:text-foreground hover:bg-neutral-50"
          >
            ⭐⭐⭐⭐⭐ Rate & Review Course
          </Button>
          {certificate && (
            <Button
              variant="ghost"
              onClick={() => setShowCertModal(true)}
              className="flex-1 text-[10px] font-bold text-[#1C4966] hover:bg-neutral-50"
            >
              View Certificate Preview
            </Button>
          )}
        </div>
      </div>

      {/* Recommended Next Courses */}
      <div className="text-left space-y-4 border-t border-neutral-100 pt-5">
        <h4 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider px-1">
          Recommended Next Courses
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => handleRecommendClick(rec.id)}
              className="p-4 bg-neutral-50 hover:bg-[#1C4966]/5 rounded-2xl border border-neutral-100 cursor-pointer transition-all flex flex-col justify-between min-h-[110px]"
            >
              <div>
                <span className="text-[7.5px] font-black bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full uppercase">
                  {rec.category}
                </span>
                <h5 className="font-extrabold text-foreground text-[10.5px] leading-snug mt-2 truncate">
                  {rec.title}
                </h5>
              </div>
              <span className="text-[9px] font-black text-[#1C4966] uppercase tracking-wider block mt-2">
                Enroll Now →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Back button */}
      <div className="pt-2">
        <button
          onClick={onBack}
          className="text-xs font-bold text-neutral-400 hover:text-[#1C4966] uppercase tracking-widest"
        >
          ← Back to Catalog
        </button>
      </div>

      {/* Reviews Feedback modal */}
      {showFeedbackModal && (
        <CourseFeedbackModal
          courseId={courseId}
          courseTitle={course.title}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {/* Certificate modal */}
      {showCertModal && certificate && (
        <DynamicCertificate
          certificate={certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
export default CourseCompletionScreen;
