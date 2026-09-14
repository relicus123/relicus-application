import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "../store/auth.store";

export default function DeprecatedOTP() {
  const currentUser = useAuthStore((state) => state.currentUser);
  if (currentUser) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/landing" />;
}

