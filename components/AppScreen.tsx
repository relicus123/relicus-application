import React from "react";
import { View, ViewProps, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface AppScreenProps extends ViewProps {
  children: React.ReactNode;
  safeArea?: "top" | "bottom" | "both" | "none";
  backgroundColor?: "primary" | "secondary" | "transparent";
  className?: string;
}

export function AppScreen({
  children,
  safeArea = "both",
  backgroundColor = "primary",
  className,
  style,
  ...props
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  
  const bgClasses = {
    primary: "bg-bg-primary",
    secondary: "bg-bg-secondary",
    transparent: "bg-transparent",
  };

  const paddingTop = safeArea === "top" || safeArea === "both" ? insets.top : 0;
  const paddingBottom = safeArea === "bottom" || safeArea === "both" ? insets.bottom : 0;

  return (
    <View
      className={twMerge(clsx("flex-1", bgClasses[backgroundColor], className))}
      style={[{ paddingTop, paddingBottom }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
