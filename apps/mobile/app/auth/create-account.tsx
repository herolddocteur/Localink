import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CreateAccountScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>LOCALINK</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.copy}>Join your local community and connect worldwide.</Text>
        <TextInput placeholder="Full name" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput placeholder="Email or phone" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput placeholder="Password" placeholderTextColor="#72839A" secureTextEntry style={styles.input} />
        <TextInput placeholder="Date of birth" placeholderTextColor="#72839A" style={styles.input} />
        <Link href="/onboarding/profile" asChild>
          <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Continue</Text></TouchableOpacity>
        </Link>
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
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  link: { color: "#1287FF", textAlign: "center", marginTop: 4 }
});
