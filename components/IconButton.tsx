import React from "react";
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native";
import { MotiView } from "moti";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface IconButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass" | "flat" | "inverse";
  size?: "sm" | "md" | "lg";
  icon: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export function IconButton({
  variant = "primary",
  size = "md",
  disabled = false,
  className,
  style,
  icon,
  onPressIn,
  onPressOut,
  ...props
}: IconButtonProps & { onPressIn?: any, onPressOut?: any }) {
  const baseClasses = "items-center justify-center rounded-full overflow-hidden";
  
  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-surface-elevated border border-border-subtle",
    outline: "bg-transparent border-2 border-primary",
    ghost: "bg-transparent",
    glass: "bg-white/20 border border-white/30",
    flat: "bg-surface-primary border border-border-subtle",
    inverse: "bg-white border border-primary/20",
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const containerClasses = twMerge(
    clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabled && "opacity-50",
      className
    )
  );

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.8}
        style={style}
        onPressIn={(e) => {
          scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
          onPressOut?.(e);
        }}
        {...props}
      >
        <Animated.View className={containerClasses} style={animatedStyle}>
          {icon}
        </Animated.View>
      </TouchableOpacity>
    </MotiView>
  );
}
