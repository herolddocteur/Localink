import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

function getUrlParam(url: string, name: string) {
  const match = url.match(new RegExp("[?&#]" + name + "=([^&#]+)"));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Verifying your reset link...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function openRecoverySession(url: string | null) {
      if (!url || !active) {
        if (active) setStatus("Open the password reset link from your email.");
        return;
      }

      try {
        const code = getUrlParam(url, "code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (active) {
            setReady(true);
            setStatus("");
          }
          return;
        }

        const accessToken = getUrlParam(url, "access_token");
        const refreshToken = getUrlParam(url, "refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) throw error;
          if (active) {
            setReady(true);
            setStatus("");
          }
          return;
        }

        if (active) setStatus("This reset link is missing recovery information. Request a new reset email.");
      } catch (error) {
        if (active) {
          setStatus(error instanceof Error ? error.message : "Could not verify the reset link.");
        }
      }
    }

    Linking.getInitialURL().then(openRecoverySession);
    const subscription = Linking.addEventListener("url", ({ url }) => openRecoverySession(url));

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  async function savePassword() {
    if (password.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Enter the same password in both fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert("Could not reset password", error.message);
      return;
    }

    await supabase.auth.signOut();
    Alert.alert("Password updated", "Sign in with your new password.");
    router.replace("/auth/sign-in");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Choose a new password</Text>

        {!ready ? (
          <Text style={styles.copy}>{status}</Text>
        ) : (
          <>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="New password"
                placeholderTextColor="#72839A"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="newPassword"
                autoComplete="new-password"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((current) => !current)}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#72839A"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.primary, loading && styles.disabled]}
              onPress={savePassword}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Updating..." : "Update Password"}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#071A33", justifyContent: "center", padding: 22 },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 14 },
  title: { color: "#0B1830", fontSize: 30, fontWeight: "800" },
  copy: { color: "#5E6B7A", lineHeight: 21 },
  input: {
    borderWidth: 1,
    borderColor: "#D9E1EA",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#0B1830",
    backgroundColor: "#F8FAFC"
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E1EA",
    borderRadius: 14,
    backgroundColor: "#F8FAFC"
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#0B1830"
  },
  passwordToggle: {
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  passwordToggleText: {
    color: "#1287FF",
    fontWeight: "800"
  },
  primary: {
    backgroundColor: "#1287FF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center"
  },
  disabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
