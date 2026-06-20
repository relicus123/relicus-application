import React from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { MotiView } from "moti";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  type?: "text" | "email" | "tel" | "password";
  style?: ViewStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  type = "text",
  style,
}: InputProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={[styles.container, style]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#8FBDD7"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={type === "email" ? "none" : "sentences"}
        keyboardType={
          type === "email"
            ? "email-address"
            : type === "tel"
            ? "phone-pad"
            : "default"
        }
        secureTextEntry={type === "password"}
      />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C4966",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1C4966",
  },
});
