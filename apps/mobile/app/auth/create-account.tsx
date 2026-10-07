import { Link, router } from "expo-router";
import { useState } from "react";
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
import { startGoogleAuth } from "../../lib/google-auth";
import { supabase } from "../../lib/supabase";

function isValidBirthday(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const matchesInput =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!matchesInput) return false;

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );

  return date.getTime() <= todayUtc;
}

export default function CreateAccountScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function getRequiredBirthday() {
    const birthday = dateOfBirth.trim();

    if (!birthday) {
      Alert.alert("Birthday required", "Enter your date of birth to create a Localink account.");
      return null;
    }

    if (!isValidBirthday(birthday)) {
      Alert.alert("Check your birthday", "Enter a valid date of birth in YYYY-MM-DD format.");
      return null;
    }

    return birthday;
  }

  async function createAccount() {
    const birthday = getRequiredBirthday();
    if (!birthday) return;

    if (!fullName.trim() || !email.trim() || password.length < 8) {
      Alert.alert("Check your information", "Enter your name, a valid email, and a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Enter the same password in both password fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          date_of_birth: birthday
        }
      }
    });
    setLoading(false);

    if (error) {
      Alert.alert("Could not create account", error.message);
      return;
    }

    router.replace("/onboarding/profile");
  }

  async function continueWithGoogle() {
    const birthday = getRequiredBirthday();
    if (!birthday) return;

    try {
      setGoogleLoading(true);
      await startGoogleAuth(birthday);
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
            <Text style={styles.eyebrow}>LOCALINK</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.copy}>Join your local community and connect worldwide.</Text>

            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name"
              placeholderTextColor="#72839A"
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              returnKeyType="next"
              style={styles.input}
            />

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
              returnKeyType="next"
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
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="next"
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
              placeholder="Confirm password"
              placeholderTextColor="#72839A"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="next"
              style={styles.input}
            />

            <Text style={styles.requiredLabel}>Birthday *</Text>
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#72839A"
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              style={styles.input}
            />
            <Text style={styles.requiredHelp}>Required to create your account.</Text>

            <TouchableOpacity
              style={[styles.primary, loading && styles.disabled]}
              onPress={createAccount}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Creating account..." : "Create Account"}</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.disabled]}
              onPress={continueWithGoogle}
              disabled={googleLoading}
            >
              <Text style={styles.googleMark}>G</Text>
              <Text style={styles.googleText}>{googleLoading ? "Opening Google..." : "Continue with Google"}</Text>
            </TouchableOpacity>

            <Link href="/auth/sign-in" style={styles.link}>Already have an account? Sign in</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: "#071A33" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 22, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 14 },
  eyebrow: { color: "#1287FF", fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#0B1830", fontSize: 30, fontWeight: "800" },
  copy: { color: "#5E6B7A", lineHeight: 21, marginBottom: 4 },
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
  requiredLabel: { color: "#0B1830", fontWeight: "800", marginBottom: -8 },
  requiredHelp: { color: "#6E7B8A", fontSize: 12, marginTop: -8 },
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
