import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Dimensions, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { AppScreen } from "../components/AppScreen";
import { Typography } from "../components/Typography";
import { GlassSurface } from "../components/GlassSurface";
import { useAuthStore } from "../store/auth.store";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const { width } = Dimensions.get("window");

export default function OTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const authStore = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleVerify = async () => {
    if (otp.every((digit) => digit !== "")) {
      const { mode, phone, username, email } = params;
      
      setIsVerifying(true);
      try {
        if (mode === "signup") {
          await authStore.signup(phone as string, username as string, email as string);
        } else {
          const user = await authStore.login(phone as string);
          if (!user) {
            setIsVerifying(false);
            alert("No account found with this phone number. Please sign up.");
            return;
          }
        }
        router.replace("/(tabs)/home");
      } catch (e: any) {
        setIsVerifying(false);
        alert(e.message);
      }
    }
  };

  return (
    <AppScreen backgroundColor="primary" className="px-6 py-6">
      <IconButton
        icon={<ArrowLeft color="#1d1b20" size={24} />}
        variant="ghost"
        onPress={() => router.back()}
        className="self-start -ml-2 mb-8"
      />

      <View className="flex-1 items-center justify-center">
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 600 }}
          className="mb-8"
        >
          <GlassSurface intensity={40} rounded="2xl" className="w-24 h-24 items-center justify-center border-primary/20 bg-surface-variant/50">
            <ShieldCheck color="#4f378a" size={48} strokeWidth={1.5} />
          </GlassSurface>
        </MotiView>

        <Typography variant="heading" weight="bold" color="primary" className="mb-2">Verify OTP</Typography>
        <Typography variant="body" color="secondary" className="text-center mb-10">
          Enter the 6-digit code sent to your phone
        </Typography>

        <View className="flex-row justify-center gap-3 mb-10 w-full">
          {otp.map((digit, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <TextInput
                ref={(el) => (inputRefs.current[index] = el)}
                className={twMerge(clsx(
                  "w-12 h-16 rounded-xl border-2 text-center text-2xl font-bold text-primary bg-surface",
                  activeIndex === index ? "border-primary" : "border-primary/10",
                  digit ? "border-primary/50" : ""
                ))}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onFocus={() => setActiveIndex(index)}
                onChangeText={(value) => handleChange(index, value)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyDown(index, nativeEvent.key)
                }
              />
            </MotiView>
          ))}
        </View>

        <View className="mb-10">
          {timer > 0 ? (
            <Typography variant="body" color="secondary">
              Resend OTP in <Typography weight="bold" color="primary">{timer}s</Typography>
            </Typography>
          ) : (
            <TouchableOpacity onPress={() => { setOtp(["", "", "", "", "", ""]); startTimer(); }}>
              <Typography variant="body" color="primary" weight="bold" className="underline">Resend OTP</Typography>
            </TouchableOpacity>
          )}
        </View>

        <Button 
          onPress={handleVerify} 
          size="lg" 
          className="w-full"
          disabled={isVerifying || !otp.every((digit) => digit !== "")}
        >
          {isVerifying ? "Verifying..." : "Verify & Continue"}
        </Button>
      </View>
    </AppScreen>
  );
}
