import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  MailCheck,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import { Typography } from "./Typography";

export type DialogType = "info" | "success" | "warning" | "error";

export interface DialogButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: "primary" | "secondary" | "danger" | "cancel";
}

export interface DialogConfig {
  title: string;
  message?: string;
  type?: DialogType;
  buttons?: DialogButton[];
  onClose?: () => void;
  icon?: React.ReactNode;
}

export function detectDialogType(title: string = "", message: string = ""): DialogType {
  const text = `${title} ${message}`.toLowerCase();
  if (
    text.includes("error") ||
    text.includes("fail") ||
    text.includes("mismatch") ||
    text.includes("weak") ||
    text.includes("invalid") ||
    text.includes("unable")
  ) {
    return "error";
  }
  if (
    text.includes("success") ||
    text.includes("registered") ||
    text.includes("updated") ||
    text.includes("submitted") ||
    text.includes("enrolled") ||
    text.includes("saved") ||
    text.includes("completed")
  ) {
    return "success";
  }
  if (
    text.includes("required") ||
    text.includes("missing") ||
    text.includes("incomplete") ||
    text.includes("warning") ||
    text.includes("short")
  ) {
    return "warning";
  }
  return "info";
}

export function getDialogIcon(type: DialogType, title: string = "", message: string = "") {
  const text = `${title} ${message}`.toLowerCase();

  // Email / OTP / Code sent
  if (text.includes("code") || text.includes("email") || text.includes("otp") || text.includes("mail")) {
    return <MailCheck size={30} color="#1C4966" strokeWidth={2.3} />;
  }

  // Password / Security
  if (text.includes("password") || text.includes("security") || text.includes("verify")) {
    if (type === "error") {
      return <KeyRound size={30} color="#C45151" strokeWidth={2.3} />;
    }
    if (type === "success") {
      return <ShieldCheck size={30} color="#287A5A" strokeWidth={2.3} />;
    }
    return <KeyRound size={30} color="#1C4966" strokeWidth={2.3} />;
  }

  switch (type) {
    case "success":
      return <CheckCircle2 size={30} color="#287A5A" strokeWidth={2.3} />;
    case "warning":
      return <AlertTriangle size={30} color="#C99545" strokeWidth={2.3} />;
    case "error":
      return <AlertCircle size={30} color="#C45151" strokeWidth={2.3} />;
    case "info":
    default:
      return <Info size={30} color="#1C4966" strokeWidth={2.3} />;
  }
}

export function getBadgeStyles(type: DialogType) {
  switch (type) {
    case "success":
      return {
        backgroundColor: "#E8F4EE",
        borderColor: "#C2E2D2",
      };
    case "warning":
      return {
        backgroundColor: "#FBF1DF",
        borderColor: "#F4DEB3",
      };
    case "error":
      return {
        backgroundColor: "#FBEAEA",
        borderColor: "#F5C7C7",
      };
    case "info":
    default:
      return {
        backgroundColor: "#EDF5F8",
        borderColor: "#C9D9E2",
      };
  }
}

/**
 * Inner Dialog Card Component (can be embedded in existing modals or overlays)
 */
export function CustomDialogCard({
  title,
  message,
  type,
  buttons,
  onClose,
  icon,
}: {
  title: string;
  message?: string;
  type?: DialogType;
  buttons?: DialogButton[];
  onClose?: () => void;
  icon?: React.ReactNode;
}) {
  const resolvedType = type || detectDialogType(title, message);
  const badgeStyle = getBadgeStyles(resolvedType);
  const renderedIcon = icon || getDialogIcon(resolvedType, title, message);

  const actionButtons =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: "OK", style: "primary" as const }];

  const handlePress = async (btn: DialogButton) => {
    if (onClose) onClose();
    if (btn.onPress) {
      await btn.onPress();
    }
  };

  return (
    <View
      style={styles.card}
      className="w-full max-w-[380px] bg-white rounded-3xl p-6 border border-[#E5EDF2] shadow-2xl"
    >
      {/* Icon Badge */}
      <View
        style={[styles.badge, badgeStyle]}
        className="w-16 h-16 rounded-2xl items-center justify-center self-center mb-4 border"
      >
        {renderedIcon}
      </View>

      {/* Title */}
      <Typography
        variant="heading"
        weight="bold"
        className="text-center text-[#172F3D] text-lg font-bold tracking-tight mb-2 leading-snug"
      >
        {title}
      </Typography>

      {/* Message */}
      {!!message && (
        <Typography
          variant="bodySecondary"
          className="text-center text-[#5A6F7D] text-[13.5px] leading-relaxed mb-6 px-1"
        >
          {message}
        </Typography>
      )}

      {/* Actions */}
      <View className="gap-2.5 mt-1">
        {actionButtons.map((btn, index) => {
          const isPrimary = btn.style === "primary" || (!btn.style && index === 0);
          const isDanger = btn.style === "danger";
          const isCancel = btn.style === "cancel";
          const isSecondary = btn.style === "secondary";

          if (isCancel) {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
                className="py-2.5 items-center justify-center rounded-xl"
              >
                <Typography weight="medium" className="text-sm text-[#71818B]">
                  {btn.text}
                </Typography>
              </TouchableOpacity>
            );
          }

          if (isSecondary) {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(btn)}
                activeOpacity={0.8}
                className="w-full bg-[#EDF5F8] border border-[#DCE5EA] py-3.5 rounded-2xl items-center justify-center"
              >
                <Typography weight="bold" className="text-sm text-[#1C4966]">
                  {btn.text}
                </Typography>
              </TouchableOpacity>
            );
          }

          if (isDanger) {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(btn)}
                activeOpacity={0.8}
                className="w-full bg-[#FBEAEA] border border-[#F5C7C7] py-3.5 rounded-2xl items-center justify-center"
              >
                <Typography weight="bold" className="text-sm text-[#C45151]">
                  {btn.text}
                </Typography>
              </TouchableOpacity>
            );
          }

          // Primary
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(btn)}
              activeOpacity={0.85}
              className="w-full bg-[#1C4966] py-3.5 rounded-2xl items-center justify-center shadow-sm active:opacity-90"
            >
              <Typography weight="bold" color="white" className="text-sm tracking-wide">
                {btn.text}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Standalone Modal Dialog Component
 */
export function CustomDialog({
  visible,
  title,
  message,
  type,
  buttons,
  onClose,
  icon,
}: {
  visible: boolean;
  title: string;
  message?: string;
  type?: DialogType;
  buttons?: DialogButton[];
  onClose?: () => void;
  icon?: React.ReactNode;
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <CustomDialogCard
          title={title}
          message={message}
          type={type}
          buttons={buttons}
          onClose={onClose}
          icon={icon}
        />
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Global Dialog Dispatcher & Host
// ---------------------------------------------------------------------------

type DialogSubscriber = (config: DialogConfig | null) => void;
const subscribers = new Set<DialogSubscriber>();

export const dialog = {
  show(config: DialogConfig) {
    subscribers.forEach((sub) => sub(config));
  },
  hide() {
    subscribers.forEach((sub) => sub(null));
  },
  alert(
    title: string,
    message?: string,
    buttons?: DialogButton[],
    type?: DialogType
  ) {
    const resolvedType = type || detectDialogType(title, message);
    dialog.show({
      title,
      message,
      type: resolvedType,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: "OK", style: "primary" }],
      onClose: () => dialog.hide(),
    });
  },
};

/**
 * Root Dialog Host Component to mount at top level in _layout.tsx
 */
export function GlobalDialogHost() {
  const [config, setConfig] = useState<DialogConfig | null>(null);

  useEffect(() => {
    const handler: DialogSubscriber = (newConfig) => {
      setConfig(newConfig);
    };
    subscribers.add(handler);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  if (!config) return null;

  return (
    <Modal
      visible={!!config}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (config.onClose) config.onClose();
        setConfig(null);
      }}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <CustomDialogCard
          title={config.title}
          message={config.message}
          type={config.type}
          buttons={config.buttons}
          onClose={() => {
            if (config.onClose) config.onClose();
            setConfig(null);
          }}
          icon={config.icon}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 20,
  },
  badge: {
    borderWidth: 1,
  },
});
