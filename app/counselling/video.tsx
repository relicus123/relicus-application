import React from "react";
import { Redirect } from "expo-router";

export default function LegacyVideoCall() {
  return <Redirect href="/(tabs)/sessions" />;
}
