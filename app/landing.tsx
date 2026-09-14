import React, { useState } from "react";
import {
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  Modal,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  X,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AppScreen } from "../components/AppScreen";
import { Typography } from "../components/Typography";
import { useAuthStore } from "../store/auth.store";
import { supabase } from "../lib/supabase";
import { formatAuthError } from "../lib/errorHandler";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CustomDialog,
  CustomDialogCard,
  DialogButton,
  DialogConfig,
  DialogType,
  detectDialogType,
} from "../components/CustomDialog";

const { width } = Dimensions.get("window");

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.98 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </Svg>
  );
}

export default function Landing() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const authStore = useAuthStore();

  const currentUser = useAuthStore((state) => state.currentUser);

  // Log In first by default, as requested
  const [mode, setMode] = useState<"login" | "signup">(
    params.initialMode === "signup" ? "signup" : "login"
  );

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "otp" | "link_new_password">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Custom Dialog State
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  React.useEffect(() => {
    if (params.mode === "reset_password") {
      setShowForgotModal(true);
      setResetStep("link_new_password");
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowForgotModal(true);
        setResetStep("link_new_password");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [params.mode]);

  React.useEffect(() => {
    if (params.logout === "true" || params.mode === "reset_password" || resetStep === "link_new_password") {
      if (params.logout === "true") {
        useAuthStore.setState({ currentUser: null });
      }
      return;
    }
    if (currentUser) {
      router.replace("/(tabs)/home");
    }
  }, [currentUser, params.logout, params.mode, resetStep]);

  const showAlert = (
    title: string,
    message?: string,
    buttons?: DialogButton[],
    type?: DialogType
  ) => {
    setDialogConfig({
      title,
      message,
      type: type || detectDialogType(title, message),
      buttons:
        buttons && buttons.length > 0
          ? buttons.map((b) => ({
              ...b,
              onPress: () => {
                setDialogConfig(null);
                if (b.onPress) b.onPress();
              },
            }))
          : [
              {
                text: "OK",
                style: "primary",
                onPress: () => setDialogConfig(null),
              },
            ],
      onClose: () => setDialogConfig(null),
    });
  };

  const handleContinue = async () => {
    if (!email.trim() || !password) {
      showAlert(
        "Missing Details",
        "Please provide both your email address and password.",
        undefined,
        "warning"
      );
      return;
    }

    if (!agreed) {
      showAlert(
        "Terms & Privacy Required",
        "Please agree to the Terms & Conditions and Privacy Policy before continuing.",
        undefined,
        "warning"
      );
      return;
    }

    if (mode === "signup") {
      if (!username.trim()) {
        showAlert("Username Required", "Please choose a username for your profile.", undefined, "warning");
        return;
      }
      if (password.length < 6) {
        showAlert("Weak Password", "Password must be at least 6 characters long.", undefined, "warning");
        return;
      }
      if (password !== confirmPassword) {
        showAlert("Password Mismatch", "Passwords do not match. Please re-enter.", undefined, "warning");
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await authStore.signup(email.trim(), password, username.trim());
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          showAlert(
            "Account Registered!",
            "Your account was created. Please switch to Log In to enter the app.",
            [
              {
                text: "Go to Log In",
                style: "primary",
                onPress: () => setMode("login"),
              },
            ],
            "success"
          );
          return;
        }

        router.replace("/(tabs)/home");
      } catch (err: any) {
        showAlert("Sign Up Failed", formatAuthError(err), undefined, "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await authStore.login(email.trim(), password);
        router.replace("/(tabs)/home");
      } catch (err: any) {
        const errorMsg = formatAuthError(err);
        if (errorMsg.includes("Google") || errorMsg.includes("Forgot Password")) {
          showAlert(
            "Account Notice",
            errorMsg,
            [
              {
                text: "Continue with Google",
                style: "primary",
                onPress: () => handleGoogleSignIn(),
              },
              {
                text: "Forgot Password",
                style: "secondary",
                onPress: () => {
                  setResetEmail(email.trim());
                  setShowForgotModal(true);
                },
              },
              { text: "Try Again", style: "cancel" },
            ],
            "info"
          );
        } else {
          showAlert("Login Failed", errorMsg, undefined, "error");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!agreed) {
      showAlert(
        "Terms & Privacy Required",
        "Please agree to the Terms & Conditions and Privacy Policy before continuing with Google.",
        undefined,
        "warning"
      );
      return;
    }

    setIsGoogleLoading(true);
    try {
      const user = await authStore.loginWithGoogle();
      if (user) {
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      const msg = formatAuthError(err);
      if (msg && msg !== "Sign-in was cancelled.") {
        showAlert("Notice", msg, undefined, "info");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!resetEmail.trim()) {
      showAlert("Email Required", "Please enter your registered email address.", undefined, "warning");
      return;
    }

    setIsResetLoading(true);
    try {
      await authStore.sendPasswordResetEmail(resetEmail.trim());
      setResetStep("otp");
      showAlert(
        "Code Sent",
        `We have sent a password reset OTP code to ${resetEmail.trim()}. Please enter the code below.`,
        [
          {
            text: "Enter Code",
            style: "primary",
            onPress: () => setDialogConfig(null),
          },
        ],
        "info"
      );
    } catch (err: any) {
      showAlert("Reset Error", formatAuthError(err), undefined, "error");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async () => {
    if (!resetOtp.trim()) {
      showAlert("OTP Required", "Please enter the OTP verification code from your email.", undefined, "warning");
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 6) {
      showAlert("Password Too Short", "New password must be at least 6 characters.", undefined, "warning");
      return;
    }

    setIsResetLoading(true);
    try {
      await authStore.verifyOtpAndResetPassword(
        resetEmail.trim(),
        resetOtp.trim(),
        resetNewPassword
      );
      showAlert(
        "Password Updated",
        "Your password has been successfully reset! You can now log in.",
        [
          {
            text: "Log In Now",
            style: "primary",
            onPress: () => {
              setPassword(resetNewPassword);
              setShowForgotModal(false);
              setResetOtp("");
              setResetNewPassword("");
              setResetStep("email");
            },
          },
        ],
        "success"
      );
    } catch (err: any) {
      showAlert("Verification Failed", formatAuthError(err), undefined, "error");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleDirectPasswordReset = async () => {
    if (!resetNewPassword || resetNewPassword.length < 6) {
      showAlert("Password Too Short", "New password must be at least 6 characters.", undefined, "warning");
      return;
    }

    setIsResetLoading(true);
    try {
      await authStore.updateUserPassword(resetNewPassword);
      showAlert(
        "Password Updated",
        "Your password has been successfully updated! You can now use your new password.",
        [
          {
            text: "Continue to App",
            style: "primary",
            onPress: () => {
              setShowForgotModal(false);
              setResetNewPassword("");
              setResetStep("email");
              router.replace("/(tabs)/home");
            },
          },
        ],
        "success"
      );
    } catch (err: any) {
      showAlert("Update Failed", formatAuthError(err), undefined, "error");
    } finally {
      setIsResetLoading(false);
    }
  };

  const openExternalLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Linking.openURL(url).catch(() => {
        showAlert("Notice", "Unable to open link in external browser: " + url, undefined, "info");
      });
    }
  };

  return (
    <AppScreen backgroundColor="primary">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Top Header */}
        <View className="items-center px-6 pt-5 pb-4">
          <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center border border-[#E5EDF2] mb-2.5">
            <Image
              source={require("../assets/relicus-icon.png")}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          </View>
          <Typography
            variant="heading"
            weight="bold"
            color="primary"
            className="text-2xl font-black tracking-tight text-[#1C4966]"
          >
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </Typography>
          <Typography
            variant="caption"
            color="secondary"
            className="text-xs text-[#60727F] mt-1 text-center max-w-[280px]"
          >
            {mode === "login"
              ? "Sign in to continue your courses, mock tests & sessions"
              : "Join Relicus to begin your learning & growth journey"}
          </Typography>
        </View>

        {/* Auth Box */}
        <View className="px-6 gap-5">
          {/* Sleek Segmented Switch: Log In first, Sign Up second */}
          <View className="bg-primary/5 p-1 rounded-2xl border border-primary/10 flex-row">
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={0.85}
              onPress={() => setMode("login")}
            >
              <View
                className={twMerge(
                  clsx(
                    "py-3 items-center rounded-xl",
                    mode === "login" ? "bg-primary" : "bg-transparent"
                  )
                )}
              >
                <Typography
                  weight="bold"
                  className={clsx(
                    "text-sm",
                    mode === "login" ? "text-white" : "text-secondary"
                  )}
                >
                  Log In
                </Typography>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={0.85}
              onPress={() => setMode("signup")}
            >
              <View
                className={twMerge(
                  clsx(
                    "py-3 items-center rounded-xl",
                    mode === "signup" ? "bg-primary" : "bg-transparent"
                  )
                )}
              >
                <Typography
                  weight="bold"
                  className={clsx(
                    "text-sm",
                    mode === "signup" ? "text-white" : "text-secondary"
                  )}
                >
                  Sign Up
                </Typography>
              </View>
            </TouchableOpacity>
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="flex-row items-center justify-center bg-white border border-border-subtle py-3.5 px-4 rounded-2xl"
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#1C4966" />
            ) : (
              <View className="flex-row items-center justify-center gap-3">
                <GoogleIcon size={20} />
                <Typography weight="semibold" color="primary" className="text-sm">
                  Continue with Google
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center">
            <View className="flex-1 h-[1px] bg-primary/10" />
            <Typography
              variant="caption"
              color="secondary"
              className="mx-3 text-[11px] uppercase tracking-wider font-semibold opacity-70"
            >
              or continue with email
            </Typography>
            <View className="flex-1 h-[1px] bg-primary/10" />
          </View>

          {/* Dynamic Inputs */}
          <View className="gap-3.5">
            {mode === "signup" && (
              <Input
                label="Full Name / Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            )}

            <Input
              label="Email Address"
              keyboardType="email-address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <Input
              label="Password"
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="p-1"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#71818B" strokeWidth={2} />
                  ) : (
                    <Eye size={20} color="#71818B" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              }
            />

            {/* Forgot Password Link in Log In Mode */}
            {mode === "login" && (
              <View className="flex-row justify-end -mt-1 mb-0.5">
                <TouchableOpacity
                  onPress={() => {
                    setResetEmail(email.trim());
                    setShowForgotModal(true);
                    setResetStep("email");
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Typography
                    variant="caption"
                    weight="bold"
                    className="text-xs text-[#1C4966]"
                  >
                    Forgot Password?
                  </Typography>
                </TouchableOpacity>
              </View>
            )}

            {mode === "signup" && (
              <Input
                label="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#71818B" strokeWidth={2} />
                    ) : (
                      <Eye size={20} color="#71818B" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                }
              />
            )}
          </View>

          {/* Checkbox agreement with clickable Terms & Privacy links */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
            className="flex-row items-start gap-3 mt-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View
              className={twMerge(
                clsx(
                  "w-5 h-5 rounded-md border-2 border-primary mt-0.5 items-center justify-center",
                  agreed ? "bg-primary" : "bg-white"
                )
              )}
            >
              {agreed && <View className="w-2 h-2 rounded-sm bg-white" />}
            </View>
            <View className="flex-1 flex-row flex-wrap items-center">
              <Typography
                variant="bodySecondary"
                color="secondary"
                className="text-xs leading-4 text-[#5A6F7D]"
              >
                I agree to the{" "}
              </Typography>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openExternalLink("https://www.relicus.in/terms-conditions")}
              >
                <Typography
                  variant="bodySecondary"
                  color="primary"
                  className="text-xs leading-4 font-bold underline text-primary"
                >
                  Terms & Conditions
                </Typography>
              </TouchableOpacity>
              <Typography
                variant="bodySecondary"
                color="secondary"
                className="text-xs leading-4 text-[#5A6F7D]"
              >
                {" "}and{" "}
              </Typography>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openExternalLink("https://www.relicus.in/privacy-policy")}
              >
                <Typography
                  variant="bodySecondary"
                  color="primary"
                  className="text-xs leading-4 font-bold underline text-primary"
                >
                  Privacy Policy
                </Typography>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Submit Button */}
          <Button
            onPress={handleContinue}
            disabled={isSubmitting}
            size="lg"
            className="w-full mt-2 rounded-2xl py-4"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <View className="flex-row items-center justify-center gap-2">
                <Typography weight="bold" color="white" className="text-base">
                  {mode === "login" ? "Log In" : "Create Account"}
                </Typography>
                <ArrowRight color="#ffffff" size={18} strokeWidth={2.5} />
              </View>
            )}
          </Button>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-white rounded-3xl p-6 border border-[#E5EDF2] shadow-xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2.5">
                <View className="w-10 h-10 rounded-xl bg-[#EDF5F8] items-center justify-center">
                  <KeyRound size={20} color="#1C4966" strokeWidth={2.2} />
                </View>
                <View>
                  <Typography variant="heading" weight="bold" className="text-lg text-[#172F3D]">
                    {resetStep === "email"
                      ? "Reset Password"
                      : resetStep === "link_new_password"
                      ? "Choose New Password"
                      : "Enter Verification Code"}
                  </Typography>
                  <Typography variant="caption" className="text-[11px] text-[#71818B]">
                    {resetStep === "email"
                      ? "Step 1 of 2"
                      : resetStep === "link_new_password"
                      ? "Email Link Verified"
                      : "Step 2 of 2"}
                  </Typography>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowForgotModal(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="w-8 h-8 rounded-full bg-black/5 items-center justify-center"
              >
                <X size={16} color="#71818B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {resetStep === "email" ? (
              <View className="gap-3">
                <Typography variant="bodySecondary" className="text-xs text-[#5A6F7D] leading-5">
                  Enter your registered email address. We will send an OTP verification code or reset link to securely reset your password.
                </Typography>

                <Input
                  label="Registered Email Address"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                />

                <Button
                  variant="primary"
                  size="md"
                  onPress={handleSendResetEmail}
                  disabled={isResetLoading}
                  className="w-full mt-2 py-3.5"
                >
                  {isResetLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View className="flex-row items-center justify-center gap-2">
                      <Typography weight="bold" color="white" className="text-sm">
                        Send Reset Code
                      </Typography>
                      <ArrowRight color="#ffffff" size={16} />
                    </View>
                  )}
                </Button>
              </View>
            ) : resetStep === "link_new_password" ? (
              <View className="gap-3">
                <Typography variant="bodySecondary" className="text-xs text-[#5A6F7D] leading-5">
                  Your email reset link has been verified! Enter your new password below to secure your account.
                </Typography>

                <Input
                  label="New Password"
                  placeholder="Enter new password (min. 6 chars)"
                  secureTextEntry={!showResetNewPassword}
                  value={resetNewPassword}
                  onChangeText={setResetNewPassword}
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowResetNewPassword(!showResetNewPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="p-1"
                    >
                      {showResetNewPassword ? (
                        <EyeOff size={18} color="#71818B" />
                      ) : (
                        <Eye size={18} color="#71818B" />
                      )}
                    </TouchableOpacity>
                  }
                />

                <Button
                  variant="primary"
                  size="md"
                  onPress={handleDirectPasswordReset}
                  disabled={isResetLoading}
                  className="w-full mt-2 py-3.5"
                >
                  {isResetLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View className="flex-row items-center justify-center gap-2">
                      <Typography weight="bold" color="white" className="text-sm">
                        Save New Password
                      </Typography>
                      <ShieldCheck color="#ffffff" size={16} />
                    </View>
                  )}
                </Button>
              </View>
            ) : (
              <View className="gap-3">
                <Typography variant="bodySecondary" className="text-xs text-[#5A6F7D] leading-5">
                  We've sent a verification message to <Typography weight="bold" className="text-[#172F3D]">{resetEmail}</Typography>.
                </Typography>

                <Input
                  label="6-Digit OTP Code"
                  placeholder="e.g. 123456"
                  keyboardType="number-pad"
                  value={resetOtp}
                  onChangeText={setResetOtp}
                />

                <Input
                  label="New Password"
                  placeholder="Enter new password (min. 6 chars)"
                  secureTextEntry={!showResetNewPassword}
                  value={resetNewPassword}
                  onChangeText={setResetNewPassword}
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowResetNewPassword(!showResetNewPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="p-1"
                    >
                      {showResetNewPassword ? (
                        <EyeOff size={18} color="#71818B" />
                      ) : (
                        <Eye size={18} color="#71818B" />
                      )}
                    </TouchableOpacity>
                  }
                />

                {/* Helpful note for users who received a link instead of a code */}
                <View className="bg-[#EDF5F8] p-3 rounded-2xl border border-[#DCE5EA]">
                  <Typography variant="caption" className="text-[11.5px] text-[#405563] leading-4">
                    💡 <Typography weight="bold" className="text-[#1C4966]">Got a reset link in your email?</Typography> You can click the "Reset password" button directly in your email to choose your new password!
                  </Typography>
                </View>

                <Button
                  variant="primary"
                  size="md"
                  onPress={handleVerifyOtpAndReset}
                  disabled={isResetLoading}
                  className="w-full mt-1 py-3.5"
                >
                  {isResetLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View className="flex-row items-center justify-center gap-2">
                      <Typography weight="bold" color="white" className="text-sm">
                        Verify & Reset Password
                      </Typography>
                      <ShieldCheck color="#ffffff" size={16} />
                    </View>
                  )}
                </Button>

                <TouchableOpacity
                  onPress={() => setResetStep("email")}
                  className="items-center py-1 mt-1"
                >
                  <Typography variant="caption" weight="bold" className="text-xs text-[#1C4966]">
                    Didn't receive code? Change email
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Custom Dialog inside Forgot Password Modal */}
          {dialogConfig && (
            <View
              style={StyleSheet.absoluteFill}
              className="bg-black/60 items-center justify-center px-6 z-50"
            >
              <CustomDialogCard
                title={dialogConfig.title}
                message={dialogConfig.message}
                type={dialogConfig.type}
                buttons={dialogConfig.buttons}
                onClose={() => setDialogConfig(null)}
              />
            </View>
          )}
        </View>
      </Modal>

      {/* Custom Dialog for Main Page (when Forgot Modal is closed) */}
      {!showForgotModal && (
        <CustomDialog
          visible={!!dialogConfig}
          title={dialogConfig?.title || ""}
          message={dialogConfig?.message}
          type={dialogConfig?.type}
          buttons={dialogConfig?.buttons}
          onClose={() => setDialogConfig(null)}
        />
      )}
    </AppScreen>
  );
}
