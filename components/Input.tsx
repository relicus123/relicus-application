import React, { useState } from "react";
import { TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { Typography } from "./Typography";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerStyle?: ViewStyle;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  className,
  containerStyle,
  style,
  onFocus,
  onBlur,
  rightElement,
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

  const containerBorderClass = isFocused
    ? "border-[#1C4966]"
    : error
    ? "border-[#C45151]"
    : "border-[#DCE5EA]";

  return (
    <View style={[{ marginBottom: 14 }, containerStyle]}>
      {label && (
        <Typography
          variant="bodySecondary"
          weight="medium"
          color="secondary"
          className="mb-1.5 ml-1 text-xs text-[#5A6F7D]"
        >
          {label}
        </Typography>
      )}

      <View
        className={twMerge(
          clsx(
            "flex-row items-center bg-white border rounded-2xl px-4",
            containerBorderClass,
            className
          )
        )}
      >
        <TextInput
          className="flex-1 py-3.5 text-base text-[#172F3D]"
          placeholderTextColor="#9CA3AF"
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
          {...props}
        />
        {rightElement && (
          <View className="pl-2 justify-center">{rightElement}</View>
        )}
      </View>

      {error && (
        <View className="mt-1 ml-1">
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        </View>
      )}
    </View>
  );
}
