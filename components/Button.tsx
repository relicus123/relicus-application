import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from "react-native";
import { MotiView } from "moti";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  onPress,
  disabled = false,
  style,
  children,
}: ButtonProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring" }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          disabled && styles.disabled,
          style,
        ]}
      >
        <Text style={[styles.text, styles[`text_${variant}`]]}>{children}</Text>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#1C4966",
  },
  secondary: {
    backgroundColor: "#5F8B70",
  },
  outline: {
    borderWidth: 2,
    borderColor: "#1C4966",
    backgroundColor: "transparent",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  size_sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  size_md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  size_lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
  },
  text_primary: {
    color: "#FFFFF0",
  },
  text_secondary: {
    color: "#FFFFF0",
  },
  text_outline: {
    color: "#1C4966",
  },
  text_ghost: {
    color: "#1C4966",
  },
});
