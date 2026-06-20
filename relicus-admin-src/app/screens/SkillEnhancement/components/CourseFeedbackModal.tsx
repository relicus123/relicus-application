import React, { useState } from "react";
import { Star, X, Sparkles } from "lucide-react";
import { Button } from "../../../components/Button";
import { useSkillsStore } from "../store/skills.store";

interface CourseFeedbackModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

export const CourseFeedbackModal: React.FC<CourseFeedbackModalProps> = ({ courseId, courseTitle, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const submitReview = useSkillsStore((state) => state.submitReview);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview({
      courseId,
      rating,
      reviewText: review.trim(),
      completionDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    });
    
    // Add success notification
    useSkillsStore.getState().addNotification({
      category: "Course Update",
      title: "Review Submitted",
      message: `Thank you for rating "${courseTitle}"! Your feedback was registered successfully.`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden border border-neutral-100 shadow-2xl relative flex flex-col p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9px] font-extrabold text-[#8FBDD7] uppercase tracking-widest block mb-0.5">
              Course Feedback
            </span>
            <h4 className="font-extrabold text-foreground text-sm">Rate This Course</h4>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 rounded-xl transition-all border border-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-3.5 bg-neutral-50 p-5 rounded-[1.75rem] border border-neutral-100">
            <h5 className="text-xs font-bold text-foreground">How was your learning experience in:</h5>
            <p className="text-xs font-black text-[#1C4966] leading-snug px-3">{courseTitle}</p>
            
            {/* Stars Row */}
            <div className="flex justify-center items-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating ?? rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 px-1">
              Write Review Comments
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you like about this course? How can we make it better?"
              rows={4}
              className="w-full text-xs p-4 border border-neutral-100 rounded-2xl bg-neutral-50/50 focus:border-[#1C4966] focus:bg-white transition-all outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full border-neutral-200 text-neutral-500"
            >
              Skip
            </Button>
            <Button type="submit" className="flex-1 rounded-full">
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CourseFeedbackModal;
