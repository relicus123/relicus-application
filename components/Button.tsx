import React from "react";
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, ActivityIndicator } from "react-native";
import { MotiView } from "moti";
import { Typography } from "./Typography";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass" | "inverse" | "flat";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className,
  style,
  children,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps & { onPressIn?: any, onPressOut?: any }) {
  const baseClasses = "flex-row items-center justify-center rounded-2xl overflow-hidden";
  
  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-surface-elevated border border-border-subtle",
    outline: "bg-transparent border-2 border-primary",
    ghost: "bg-transparent",
    glass: "bg-white/20 border border-white/30",
    inverse: "bg-white border border-primary/20",
    flat: "bg-surface-primary border border-border-subtle",
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

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <TouchableOpacity
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
        onPressIn={(e) => {
          scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
          onPressOut?.(e);
        }}
        {...props}
      >
        <Animated.View className={containerClasses} style={animatedStyle}>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={variant === "primary" ? "#ffffff" : "#6750A4"} 
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
        </Animated.View>
      </TouchableOpacity>
    </MotiView>
  );
}
