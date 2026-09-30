import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function CreateAccountScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);

  async function createAccount() {
    if (!fullName.trim() || !email.trim() || password.length < 8) {
      Alert.alert("Check your information", "Enter your name, a valid email, and a password with at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth.trim() || null
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

  return (
    <SafeAreaView style={styles.screen}>
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
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#72839A"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="Date of birth (YYYY-MM-DD)"
          placeholderTextColor="#72839A"
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.primary, loading && styles.disabled]}
          onPress={createAccount}
          disabled={loading}
        >
          <Text style={styles.primaryText}>{loading ? "Creating account..." : "Continue"}</Text>
        </TouchableOpacity>

        <Link href="/auth/sign-in" style={styles.link}>Already have an account? Sign in</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#071A33", justifyContent: "center", padding: 22 },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 14 },
  eyebrow: { color: "#1287FF", fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#0B1830", fontSize: 30, fontWeight: "800" },
  copy: { color: "#5E6B7A", lineHeight: 21, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#D9E1EA", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, color: "#0B1830", backgroundColor: "#F8FAFC" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  disabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  link: { color: "#1287FF", textAlign: "center", marginTop: 4 }
});
