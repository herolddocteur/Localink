import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { completeOAuthFromUrl, startGoogleAuth } from "../../lib/google-auth";
import { supabase } from "../../lib/supabase";

export default function SignInScreen() {
  const incomingUrl = Linking.useURL();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!incomingUrl) return;

    completeOAuthFromUrl(incomingUrl)
      .then((completed) => {
        if (completed) router.replace("/home");
      })
      .catch((error) => {
        Alert.alert("Google sign in failed", error instanceof Error ? error.message : "Please try again.");
      });
  }, [incomingUrl]);

  async function signIn() {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Enter your email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign in failed", error.message);
      return;
    }

    router.replace("/home");
  }

  async function signInWithGoogle() {
    try {
      setGoogleLoading(true);
      await startGoogleAuth();
    } catch (error) {
      Alert.alert("Google sign in failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.copy}>Sign in to Localink.</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#72839A"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              style={styles.input}
            />

            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#72839A"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="password"
                autoComplete="password"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((current) => !current)}
                style={styles.passwordToggle}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>

            <Link href="/auth/forgot-password" style={styles.forgotLink}>Forgot password?</Link>

            <TouchableOpacity
              style={[styles.primary, loading && styles.disabled]}
              onPress={signIn}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Signing in..." : "Sign In"}</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.disabled]}
              onPress={signInWithGoogle}
              disabled={googleLoading}
            >
              <Text style={styles.googleMark}>G</Text>
              <Text style={styles.googleText}>{googleLoading ? "Opening Google..." : "Continue with Google"}</Text>
            </TouchableOpacity>

            <Link href="/auth/create-account" style={styles.link}>Create a new account</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: "#071A33" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 22 },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 14 },
  title: { color: "#0B1830", fontSize: 30, fontWeight: "800" },
  copy: { color: "#5E6B7A" },
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
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, color: "#0B1830" },
  passwordToggle: { paddingHorizontal: 14, paddingVertical: 14 },
  passwordToggleText: { color: "#1287FF", fontWeight: "800" },
  forgotLink: { color: "#1287FF", textAlign: "right", fontWeight: "700", marginTop: -4 },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  disabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 2 },
  divider: { flex: 1, height: 1, backgroundColor: "#D9E1EA" },
  dividerText: { color: "#7A8796", fontSize: 12, fontWeight: "700" },
  googleButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#D9E1EA",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF"
  },
  googleMark: { color: "#0B1830", fontSize: 20, fontWeight: "900" },
  googleText: { color: "#0B1830", fontWeight: "800", fontSize: 15 },
  link: { color: "#1287FF", textAlign: "center", marginTop: 4 }
});
