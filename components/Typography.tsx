import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type TypographyVariant = 
  | "display" 
  | "hero" 
  | "title" 
  | "heading" 
  | "body" 
  | "bodySecondary" 
  | "caption" 
  | "button";

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  weight?: "regular" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "tertiary" | "accent" | "white" | "error" | "success";
  className?: string;
  children: React.ReactNode;
}

export function Typography({
  variant = "body",
  weight = "regular",
  color = "primary",
  className,
  style,
  children,
  ...props
}: TypographyProps) {
  
  const baseClasses = "text-text-primary";
  
  const variantClasses = {
    display: "text-5xl tracking-tight leading-tight",
    hero: "text-4xl tracking-tight leading-tight",
    title: "text-2xl tracking-tight leading-snug",
    heading: "text-xl tracking-tight leading-snug",
    body: "text-base leading-relaxed",
    bodySecondary: "text-sm leading-relaxed",
    caption: "text-xs leading-normal",
    button: "text-base leading-none",
  };

  const weightClasses = {
    regular: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const colorClasses = {
    primary: "text-text-primary",
    secondary: "text-text-secondary",
    tertiary: "text-text-tertiary",
    accent: "text-accent-primary",
    white: "text-white",
    error: "text-error",
    success: "text-success",
  };

  const classes = twMerge(
    clsx(
      baseClasses,
      variantClasses[variant],
      weightClasses[weight],
      colorClasses[color],
      className
    )
  );

  return (
    <Text className={classes} style={style} {...props}>
      {children}
    </Text>
  );
}
