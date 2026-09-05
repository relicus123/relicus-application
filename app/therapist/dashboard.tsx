import React from "react";
import { Redirect } from "expo-router";

export default function LegacyTherapistDashboard() {
  return <Redirect href="/(tabs)/sessions" />;
}
