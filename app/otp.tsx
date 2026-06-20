import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/auth.store";

const { width } = Dimensions.get("window");

export default function OTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const authStore = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

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

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.every((digit) => digit !== "")) {
      const { mode, phone, username, email } = params;
      
      try {
        if (mode === "signup") {
          authStore.signup(phone as string, username as string, email as string);
        } else {
          const user = authStore.login(phone as string);
          if (!user) {
            alert("No account found with this phone number. Please sign up.");
            return;
          }
        }
        router.replace("/(tabs)/home");
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1C4966" size={24} />
        </TouchableOpacity>

        <View style={styles.centerContent}>
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 600 }}
          >
            <LinearGradient
              colors={["#1C4966", "#5F8B70"]}
              style={styles.iconContainer}
            >
              <ShieldCheck color="white" size={48} strokeWidth={2} />
            </LinearGradient>
          </MotiView>

          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your phone
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100 }}
              >
                <TextInput
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyDown(index, nativeEvent.key)
                  }
                />
              </MotiView>
            ))}
          </View>

          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in <Text style={styles.timerCount}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            onPress={handleVerify}
            disabled={otp.some((digit) => digit === "")}
            style={styles.verifyButton}
            size="lg"
          >
            Verify & Continue
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(28, 73, 102, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8FBDD7",
    textAlign: "center",
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  otpInput: {
    width: (width - 48 - 40) / 6,
    height: 64,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(28, 73, 102, 0.1)",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C4966",
  },
  timerContainer: {
    marginBottom: 40,
  },
  timerText: {
    fontSize: 16,
    color: "#8FBDD7",
  },
  timerCount: {
    color: "#1C4966",
    fontWeight: "bold",
  },
  resendText: {
    fontSize: 16,
    color: "#1C4966",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  verifyButton: {
    width: "100%",
  },
});
