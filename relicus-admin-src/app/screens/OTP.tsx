import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "../components/Button";

export function OTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.every((digit) => digit !== "")) {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <button
        onClick={() => navigate("/landing")}
        className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-8"
      >
        <ArrowLeft className="w-5 h-5 text-primary" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mb-8 shadow-lg"
        >
          <ShieldCheck className="w-12 h-12 text-white" strokeWidth={2} />
        </motion.div>

        <h1 className="text-3xl font-bold text-primary mb-2">Verify OTP</h1>
        <p className="text-muted-foreground text-center mb-8">
          Enter the 6-digit code sent to your phone
        </p>

        <div className="flex gap-3 mb-8">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-12 h-14 text-center text-2xl font-bold bg-input-background border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-all"
            />
          ))}
        </div>

        <div className="text-center mb-8">
          {timer > 0 ? (
            <p className="text-muted-foreground">
              Resend OTP in <span className="font-semibold text-primary">{timer}s</span>
            </p>
          ) : (
            <button className="text-primary font-semibold hover:underline">
              Resend OTP
            </button>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={otp.some((digit) => digit === "")}
          className="w-full max-w-sm"
          size="lg"
        >
          Verify & Continue
        </Button>
      </div>
    </div>
  );
}
