import * as Linking from "expo-linking";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendResetLink() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("Email required", "Enter the email address for your Localink account.");
      return;
    }

    setLoading(true);
    const redirectTo = Linking.createURL("/auth/reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo
    });
    setLoading(false);

    if (error) {
      Alert.alert("Could not send reset email", error.message);
      return;
    }

    setSent(true);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.copy}>
          Enter your Localink email. We will send you a secure password reset link.
        </Text>

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

        <TouchableOpacity
          style={[styles.primary, loading && styles.disabled]}
          onPress={sendResetLink}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? "Sending..." : sent ? "Send Again" : "Send Reset Link"}
          </Text>
        </TouchableOpacity>

        {sent ? (
          <Text style={styles.success}>
            Check your email for the Localink password reset link.
          </Text>
        ) : null}

        <Link href="/auth/sign-in" style={styles.link}>Back to Sign In</Link>
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
  primary: {
    backgroundColor: "#1287FF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center"
  },
  disabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  success: {
    color: "#147A43",
    backgroundColor: "#EAF8F0",
    borderRadius: 12,
    padding: 12,
    lineHeight: 19
  },
  link: { color: "#1287FF", textAlign: "center", marginTop: 4 }
});
