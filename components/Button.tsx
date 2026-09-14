import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { Typography } from "./Typography";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends TouchableOpacityProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "glass"
    | "inverse"
    | "flat";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className,
  style,
  children,
  onPress,
  ...props
}: ButtonProps) {
  const baseClasses =
    "flex-row items-center justify-center rounded-2xl overflow-hidden";

  const variantClasses = {
    primary: "bg-[#1C4966]",
    secondary: "bg-white border border-[#DCE5EA]",
    outline: "bg-transparent border-2 border-[#1C4966]",
    ghost: "bg-transparent",
    glass: "bg-white/20 border border-white/30",
    inverse: "bg-white border border-[#1C4966]/20",
    flat: "bg-[#F7F9FB] border border-[#DCE5EA]",
  };

  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3.5",
    lg: "px-8 py-4",
  };

  const textVariantClasses = {
    primary: "white",
    secondary: "primary",
    outline: "primary",
    ghost: "primary",
    glass: "white",
    inverse: "primary",
    flat: "primary",
  } as const;

  const containerClasses = twMerge(
    clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      (disabled || loading) && "opacity-50",
      className
    )
  );

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.75}
      onPress={onPress}
      className={containerClasses}
      style={style}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : "#1C4966"}
          style={{ marginRight: 8 }}
        />
      )}
      <Typography
        variant={size === "sm" ? "bodySecondary" : "button"}
        weight="semibold"
        color={textVariantClasses[variant]}
      >
        {children}
      </Typography>
    </TouchableOpacity>
  );
}
