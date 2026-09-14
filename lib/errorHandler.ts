/**
 * Global Production Authentication Error Handler
 * Ensures only clean, user-friendly, non-technical messages are displayed to users.
 */

export function formatAuthError(error: any): string {
  if (!error) {
    return "Something went wrong. Please check your internet connection and try again.";
  }

  let raw: any = error;
  if (error instanceof Error && error.message) {
    raw = error.message;
  } else if (error.message) {
    raw = error.message;
  } else if (error.msg) {
    raw = error.msg;
  } else if (error.error_description) {
    raw = error.error_description;
  }

  // Parse stringified JSON if passed
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatAuthError(parsed);
      } catch {}
    }
  }

  const str = String(raw || "");

  // Cancelled or dismissed OAuth flow
  if (str.includes("cancelled") || str.includes("closed") || str.includes("dismiss")) {
    return "Sign-in was cancelled.";
  }

  // Incorrect credentials
  if (
    str.includes("Invalid login credentials") ||
    str.includes("invalid_grant") ||
    str.includes("invalid_credentials")
  ) {
    return "Incorrect email or password. If you signed up with Google, please tap 'Continue with Google', or use 'Forgot Password' to set a password.";
  }

  // Account exists
  if (str.includes("User already registered") || str.includes("user_already_exists")) {
    return "An account with this email already exists. Please log in.";
  }

  // Unconfirmed account
  if (str.includes("Email not confirmed") || str.includes("email_not_confirmed")) {
    return "Please confirm your email address or request a password reset.";
  }

  // Password rules
  if (str.includes("Password should be at least") || str.includes("weak_password")) {
    return "Password must be at least 6 characters long.";
  }

  // Rate limiting
  if (str.includes("rate limit") || str.includes("over_email_send_rate_limit")) {
    return "Too many attempts. Please wait a few moments and try again.";
  }

  // OTP issues
  if (str.includes("Token has expired") || str.includes("otp_expired")) {
    return "Your verification code has expired. Please request a new code.";
  }

  // Network problems
  if (str.includes("Network request failed") || str.includes("Failed to fetch")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // Server-side errors (database triggers, unexpected_failure, 500)
  if (
    str.includes("unexpected_failure") ||
    str.includes("500") ||
    str.includes("Database error") ||
    str.includes("server_error")
  ) {
    return "We could not complete your request at this moment. Please try again shortly.";
  }

  // Fallback: If it's a readable message, return it; otherwise, clean generic message
  if (
    str.length > 0 &&
    str.length < 350 &&
    !str.includes("{") &&
    !str.includes("at ") &&
    !str.includes("AuthApiError")
  ) {
    return str;
  }

  return "Something went wrong. Please try again in a moment.";
}
