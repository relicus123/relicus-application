import React, { useEffect } from "react";
import { Download, Share2, Award, ShieldCheck, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "../../../components/Button";
import { Certificate } from "../store/skills.store";
import { certificateService } from "../services/certificate.service";

interface DynamicCertificateProps {
  certificate: Certificate;
  onClose: () => void;
}

export const DynamicCertificate: React.FC<DynamicCertificateProps> = ({ certificate, onClose }) => {
  // Fire confetti upon mounting to celebrate!
  useEffect(() => {
    // Standard confetti duration bursts
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Confetti shoots from left and right sides
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    certificateService.downloadCertificatePdf(certificate);
  };

  const handleShare = () => {
    const link = certificateService.shareCertificateToLinkedIn(certificate);
    window.open(link, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden border border-neutral-100 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h4 className="font-extrabold text-foreground text-sm">Professional Certificate Hub</h4>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Display */}
        <div className="flex-1 p-6 bg-neutral-50 overflow-y-auto flex items-center justify-center">
          <div className="w-full bg-white border-[10px] border-[#1C4966] p-6 shadow-lg rounded-xl text-center space-y-6 relative overflow-hidden max-w-lg mx-auto">
            {/* Elegant Background Border Accent */}
            <div className="absolute inset-2 border-2 border-[#5F8B70]/30 rounded-lg pointer-events-none" />

            {/* Crest Icon Header */}
            <div className="flex flex-col items-center space-y-2 pt-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1C4966] to-[#5F8B70] text-white rounded-full flex items-center justify-center shadow-md">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1C4966]">
                Relicus Academy of Higher Education
              </span>
            </div>

            {/* Main Certificate Text */}
            <div className="space-y-4">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                Certificate of Completion
              </span>
              <p className="text-xs text-neutral-500 font-medium max-w-[320px] mx-auto leading-relaxed">
                This is to officially certify that our student
              </p>
              <h2 className="text-xl font-black text-foreground tracking-wide capitalize my-2 font-serif">
                {certificate.recipientName}
              </h2>
              <p className="text-xs text-neutral-500 font-medium max-w-[320px] mx-auto leading-relaxed">
                has successfully completed all requirements, projects, assessments, and lessons for the professional skill certification course
              </p>
              <h3 className="text-sm font-extrabold text-[#1C4966] tracking-wide my-1 px-4 py-1.5 bg-neutral-50 rounded-xl inline-block max-w-[365px]">
                {certificate.courseTitle}
              </h3>
            </div>

            {/* Signature & Stamp Section */}
            <div className="grid grid-cols-2 pt-6 border-t border-neutral-100 text-center items-center">
              <div className="space-y-1">
                <span className="font-serif italic text-sm text-[#1C4966] block select-none">
                  David Miller
                </span>
                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Dean of Academy
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-[#5F8B70] block">
                  {certificate.date}
                </span>
                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Date of Issue
                </span>
              </div>
            </div>

            {/* Certificate Footer Metadata */}
            <div className="pt-4 flex justify-between items-center text-[7px] text-neutral-400 font-bold border-t border-neutral-100">
              <span className="flex items-center gap-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5F8B70] shrink-0" /> SECURE DIGITAL CREDENTIAL
              </span>
              <span>ID: {certificate.credentialId}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-100 bg-white flex gap-3 shrink-0">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 rounded-full flex items-center justify-center gap-1.5 border-[#1C4966] text-[#1C4966] hover:bg-neutral-50"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 rounded-full flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" /> Share on LinkedIn
          </Button>
        </div>
      </div>
    </div>
  );
};
