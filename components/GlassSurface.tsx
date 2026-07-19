import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { BlurView, BlurViewProps } from "expo-blur";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface GlassSurfaceProps extends BlurViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: "light" | "dark" | "default" | "transparent" | "regular" | "prominent" | "systemThickMaterial" | "systemMaterial" | "systemThinMaterial" | "systemUltraThinMaterial" | "systemChromeMaterial";
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "none" | "full";
  hasBorder?: boolean;
}

export function GlassSurface({
  children,
  intensity = 50,
  tint = "light",
  className,
  rounded = "xl",
  hasBorder = true,
  style,
  ...props
}: GlassSurfaceProps) {
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  };

  const containerClasses = twMerge(
    clsx(
      "overflow-hidden",
      roundedClasses[rounded],
      hasBorder && "border border-surface-glass/40",
      className
    )
  );

  return (
    <View className={containerClasses} style={style}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} {...props} />
      {/* Content wrapper to ensure it stays above blur */}
      <View className="z-10">
        {children}
      </View>
    </View>
  );
}
