import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <SafeAreaView style={styles.screen}>
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

        <TouchableOpacity
          style={[styles.primary, loading && styles.disabled]}
          onPress={signIn}
          disabled={loading}
        >
          <Text style={styles.primaryText}>{loading ? "Signing in..." : "Sign In"}</Text>
        </TouchableOpacity>

        <Link href="/auth/create-account" style={styles.link}>Create a new account</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#071A33", justifyContent: "center", padding: 22 },
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
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  disabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  link: { color: "#1287FF", textAlign: "center", marginTop: 4 }
});
