import React, { useState } from "react";
import { TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { MotiView } from "moti";
import { Typography } from "./Typography";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  className,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputClasses = twMerge(
    clsx(
      "bg-surface-primary border rounded-2xl px-4 py-4 text-base text-text-primary",
      isFocused ? "border-accent-primary" : "border-border-subtle",
      error && "border-error",
      className
    )
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={[{ marginBottom: 16 }, containerStyle]}
    >
      {label && (
        <Typography variant="bodySecondary" weight="medium" color="secondary" className="mb-2 ml-1">
          {label}
        </Typography>
      )}
      
      <TextInput
        className={inputClasses}
        placeholderTextColor="#9CA3AF"
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={style}
        {...props}
      />
      
      {error && (
        <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 20 }} className="mt-1 ml-1">
          <Typography variant="caption" color="error">{error}</Typography>
        </MotiView>
      )}
    </MotiView>
  );
}
