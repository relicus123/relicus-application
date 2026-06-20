import React from "react";
import { useNavigate } from "react-router";
import KnowNext from "./KnowNext";

/**
 * KnowNextRoute wraps the KnowNext module for use in React Router.
 * The `onBack` prop navigates back to Home.
 */
export const KnowNextRoute: React.FC = () => {
  const navigate = useNavigate();
  return <KnowNext onBack={() => navigate("/app")} />;
};
