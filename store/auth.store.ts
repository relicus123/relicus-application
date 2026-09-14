import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { formatAuthError } from "../lib/errorHandler";

WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  signup: (email: string, password: string, username: string, phone?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  getUserById: (id: string) => Promise<User | undefined>;
  hydrate: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  verifyOtpAndResetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoading: false,
      isHydrated: false,

      signup: async (email, password, username, phone) => {
        set({ isLoading: true });
        try {
          const cleanEmail = email.trim().toLowerCase();
          const cleanUsername = username.trim();

          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                username: cleanUsername,
                phone: phone?.trim() || "",
              },
            },
          });

          if (authError) {
            throw new Error(formatAuthError(authError));
          }

          const userId = authData.user?.id;
          if (!userId) {
            throw new Error("Unable to complete signup. Please verify your details.");
          }

          const profileData = {
            id: userId,
            email: cleanEmail,
            username: cleanUsername || cleanEmail.split("@")[0],
            phone: phone?.trim() || "",
            role: "student",
          };

          // Upsert into profiles table
          await supabase.from("profiles").upsert([profileData], { onConflict: "id" });

          // Also mirror into legacy users table for backwards-compatibility
          try {
            await supabase.from("users").upsert([
              {
                id: userId,
                email: cleanEmail,
                username: cleanUsername || cleanEmail.split("@")[0],
                phone: phone?.trim() || "+91 98765 43210",
              }
            ], { onConflict: "id" });
          } catch {}

          const user: User = {
            id: userId,
            email: cleanEmail,
            username: cleanUsername || cleanEmail.split("@")[0],
            phone: phone?.trim() || "",
            role: "student",
            created_at: authData.user.created_at,
          };

          set({ currentUser: user, isLoading: false });
          return user;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(formatAuthError(error));
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const cleanEmail = email.trim().toLowerCase();

          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (authError) {
            throw authError;
          }

          const userId = authData.user?.id;
          if (!userId) {
            throw new Error("Invalid login credentials.");
          }

          // Fetch profile row
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          const username =
            profile?.username ||
            authData.user.user_metadata?.username ||
            cleanEmail.split("@")[0];

          const user: User = {
            id: userId,
            email: authData.user.email || cleanEmail,
            username,
            phone: profile?.phone || authData.user.user_metadata?.phone || "",
            role: profile?.role || "student",
            avatar_url: profile?.avatar_url,
            created_at: authData.user.created_at,
          };

          set({ currentUser: user, isLoading: false });
          return user;
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          if (Platform.OS === "web") {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: window.location.origin,
              },
            });
            if (error) throw error;
            return null;
          }

          // Native Expo flow
          const redirectUrl = Linking.createURL("home");
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true,
            },
          });

          if (error) {
            if (
              error.message?.includes("provider is not enabled") ||
              error.message?.includes("Unsupported provider") ||
              (error as any)?.msg?.includes("provider is not enabled")
            ) {
              throw new Error(
                "Google provider is not enabled in your Supabase project yet.\n\nPlease go to Supabase Dashboard -> Authentication -> Providers -> Google, turn it ON, and paste your Google Client ID & Secret."
              );
            }
            throw error;
          }

          if (data?.url) {
            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (res.type === "cancel" || res.type === "dismiss") {
              // User closed or dismissed browser sheet
              set({ isLoading: false });
              return null;
            }

            if (res.type === "success" && res.url) {
              const urlStr = res.url;

              // Check if Supabase or Google returned an error param
              if (urlStr.includes("error_description=")) {
                const match = urlStr.match(/error_description=([^&]+)/);
                const desc = match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "Authentication failed";
                throw new Error(desc);
              }

              // Extract PKCE authorization code if present (?code=...)
              let code: string | null = null;
              if (urlStr.includes("?")) {
                const searchStr = urlStr.split("?")[1].split("#")[0];
                const searchParams = new URLSearchParams(searchStr);
                code = searchParams.get("code");
              }

              // Extract access & refresh tokens if returned directly (#access_token=...)
              let accessToken: string | null = null;
              let refreshToken: string | null = null;

              if (urlStr.includes("#")) {
                const hashParams = new URLSearchParams(urlStr.split("#")[1] || "");
                accessToken = hashParams.get("access_token");
                refreshToken = hashParams.get("refresh_token");
              }

              if (!accessToken && urlStr.includes("?")) {
                const searchParams = new URLSearchParams(urlStr.split("?")[1].split("#")[0] || "");
                accessToken = searchParams.get("access_token");
                refreshToken = searchParams.get("refresh_token");
              }

              // Exchange PKCE code or set explicit tokens
              if (code) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                if (exchangeError) {
                  throw new Error("Failed to exchange login token: " + exchangeError.message);
                }
              } else if (accessToken && refreshToken) {
                const { error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                if (sessionError) {
                  throw new Error("Failed to set session: " + sessionError.message);
                }
              }
            }
          }

          // Fetch current session from Supabase
          const { data: sessionData } = await supabase.auth.getSession();
          const authUser = sessionData.session?.user;

          if (authUser) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authUser.id)
              .maybeSingle();

            const username =
              profile?.username ||
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email?.split("@")[0] ||
              "Learner";

            const user: User = {
              id: authUser.id,
              email: authUser.email || "",
              username,
              phone: profile?.phone || authUser.phone || "",
              role: profile?.role || "student",
              avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
              created_at: authUser.created_at,
            };

            // Ensure profile exists in profiles table
            try {
              await supabase.from("profiles").upsert([
                {
                  id: authUser.id,
                  email: user.email,
                  username: user.username,
                  role: "student",
                }
              ], { onConflict: "id" });
            } catch {}

            set({ currentUser: user, isLoading: false });
            return user;
          }

          set({ isLoading: false });
          throw new Error("Unable to establish session. Please check your network and try again.");
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(formatAuthError(error));
        }
      },

      logout: async () => {
        // 1. Immediately reset currentUser in memory so no rebound can ever happen
        set({ currentUser: null });

        // 2. Wipe persisted auth & coaching storage
        try {
          await AsyncStorage.removeItem("relicus-auth-storage");
          await AsyncStorage.removeItem("relicus-coaching-storage");
        } catch {}

        // 3. Purge Supabase local session so getSession returns null immediately
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {}

        // 4. Invalidate server-side session in background
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn("Sign out remote note:", err);
        }
      },

      deleteAccount: async () => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          // Attempt server-side account purge via security definer RPC (Apple App Store Guideline 5.1.1(v))
          const { error: rpcError } = await supabase.rpc("delete_own_user");

          if (rpcError) {
            console.warn("RPC delete_own_user error, performing client table wipe fallback:", rpcError);
            const userId = currentUser.id;
            // Delete all associated user content
            await supabase.from("mindfulness_journals").delete().eq("user_id", userId);
            await supabase.from("mindfulness_user_activities").delete().eq("user_id", userId);
            await supabase.from("mood_entries").delete().eq("user_id", userId);
            await supabase.from("coaching_test_attempts").delete().eq("user_id", userId);
            await supabase.from("coaching_doubts").delete().eq("user_id", userId);
            await supabase.from("coaching_profiles").delete().eq("user_id", userId);
            await supabase.from("knownext_saved_items").delete().eq("user_id", userId);
            await supabase.from("knownext_profiles").delete().eq("user_id", userId);
            await supabase.from("knownext_roadmap_progress").delete().eq("user_id", userId);
            await supabase.from("skills_certificate_requests").delete().eq("user_id", userId);
            await supabase.from("tuition_completed_assignments").delete().eq("user_id", userId);
            await supabase.from("tuition_students").delete().eq("user_id", userId);
            await supabase.from("tuition_parents").delete().eq("user_id", userId);
            await supabase.from("profiles").delete().eq("id", userId);
            try {
              await supabase.from("users").delete().eq("id", userId);
            } catch {}
          }
        } catch (err) {
          console.error("Account wipe error:", err);
        } finally {
          await supabase.auth.signOut();
          set({ currentUser: null });
        }
      },

      getUserById: async (id) => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        return data as User | undefined;
      },

      hydrate: async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const authUser = data.session?.user;

          if (authUser) {
            // Verify session is still valid with Supabase Auth backend
            const { error: userError } = await supabase.auth.getUser();
            if (userError) {
              console.warn("Session user no longer exists in Supabase Auth:", userError.message);
              set({ currentUser: null, isHydrated: true });
              await AsyncStorage.removeItem("relicus-auth-storage");
              await supabase.auth.signOut();
              return;
            }

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authUser.id)
              .maybeSingle();

            const username =
              profile?.username ||
              authUser.user_metadata?.username ||
              authUser.user_metadata?.full_name ||
              authUser.email?.split("@")[0] ||
              "Learner";

            const userObj: User = {
              id: authUser.id,
              email: authUser.email || "",
              username,
              phone: profile?.phone || authUser.phone || "",
              role: profile?.role || "student",
              avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
              created_at: authUser.created_at,
            };

            // Mirror into legacy users table for backwards-compatibility
            try {
              await supabase.from("users").upsert([
                {
                  id: authUser.id,
                  email: userObj.email,
                  username: userObj.username,
                  phone: userObj.phone || "",
                }
              ], { onConflict: "id" });
            } catch {}

            set({ currentUser: userObj });
          }
        } catch (e) {
          console.warn("Hydrate session error:", e);
        } finally {
          set({ isHydrated: true });
        }
      },

      updateProfile: async (updates) => {
        const { currentUser } = get();
        if (!currentUser) return;

        // Strip protected fields
        const { role, id, created_at, ...safeUpdates } = updates;

        const { error } = await supabase
          .from("profiles")
          .update(safeUpdates)
          .eq("id", currentUser.id)
          .select()
          .single();

        if (error) {
          throw new Error("Failed to update profile: " + error.message);
        }

        set({ currentUser: { ...currentUser, ...safeUpdates } });
      },

      sendPasswordResetEmail: async (email: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const redirectUrl =
          Platform.OS === "web" && typeof window !== "undefined"
            ? `${window.location.origin}/landing?mode=reset_password`
            : Linking.createURL("landing", { queryParams: { mode: "reset_password" } });

        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });
        if (error) {
          throw new Error(error.message);
        }
      },

      updateUserPassword: async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          throw new Error("Failed to update password: " + error.message);
        }
      },

      verifyOtpAndResetPassword: async (email: string, token: string, newPassword: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanToken = token.trim();

        // 1. Verify the recovery token/OTP
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "recovery",
        });

        if (verifyError) {
          throw new Error("Invalid or expired OTP: " + verifyError.message);
        }

        // 2. Update to the new password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw new Error("Failed to update password: " + updateError.message);
        }
      },
    }),
    {
      name: "relicus-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

