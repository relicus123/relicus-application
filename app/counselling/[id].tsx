import React from "react";
import { Redirect } from "expo-router";

export default function LegacyTherapistDetail() {
  return <Redirect href="/(tabs)/sessions" />;
}
