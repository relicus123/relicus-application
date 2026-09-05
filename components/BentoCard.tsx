import React from "react";
import { View, ViewProps, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BentoCardBaseProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "elevated" | "accent" | "flat";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
  hasShadow?: boolean;
}

export type BentoCardProps = BentoCardBaseProps & ViewProps;
export type BentoCardPressableProps = BentoCardBaseProps & TouchableOpacityProps;

export function BentoCard({
  children,
  variant = "primary",
  rounded = "xl",
  padding = "lg",
  className,
  hasShadow = false,
  style,
  ...props
}: BentoCardProps) {
  const containerClasses = getBentoClasses({ variant, rounded, padding, className, hasShadow });

  return (
    <View className={containerClasses} style={style} {...props}>
      {children}
    </View>
  );
}

import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export function BentoCardPressable({
  children,
  variant = "primary",
  rounded = "xl",
  padding = "lg",
  className,
  hasShadow = false,
  style,
  activeOpacity = 0.8,
  onPressIn,
  onPressOut,
  ...props
}: BentoCardPressableProps) {
  const containerClasses = getBentoClasses({ variant, rounded, padding, className, hasShadow });
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      style={style}
      onPressIn={(e) => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        onPressOut?.(e);
      }}
      {...props}
    >
      <Animated.View className={containerClasses} style={animatedStyle}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

function getBentoClasses({ variant, rounded, padding, className, hasShadow }: any) {
  const variantClasses = {
    primary: "bg-surface-primary border border-border-subtle",
    secondary: "bg-bg-secondary border border-transparent",
    elevated: "bg-surface-elevated",
    accent: "bg-accent-primary border border-transparent",
    flat: "bg-surface-primary border border-border-subtle",
  };

  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  return twMerge(
    clsx(
      "overflow-hidden",
      variantClasses[variant as keyof typeof variantClasses],
      roundedClasses[rounded as keyof typeof roundedClasses],
      paddingClasses[padding as keyof typeof paddingClasses],
      hasShadow && "shadow-sm elevation-2",
      className
    )
  );
}
