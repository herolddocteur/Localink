import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.logoMark}><Text style={styles.logoGlyph}>L</Text></View>
        <Text style={styles.title}>Localink</Text>
        <Text style={styles.tagline}>People. Places. Opportunities. Connected Everywhere.</Text>
      </View>

      <View style={styles.actions}>
        <Link href="/auth/create-account" asChild>
          <TouchableOpacity style={styles.primary}>
            <Text style={styles.primaryText}>Create Account</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/auth/sign-in" asChild>
          <TouchableOpacity style={styles.secondary}>
            <Text style={styles.secondaryText}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#071A33", padding: 24, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoMark: { width: 104, height: 104, borderRadius: 30, backgroundColor: "#1287FF", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logoGlyph: { color: "#fff", fontSize: 56, fontWeight: "800" },
  title: { color: "#fff", fontSize: 42, fontWeight: "800" },
  tagline: { color: "#C8D6E5", fontSize: 16, textAlign: "center", marginTop: 12, maxWidth: 320, lineHeight: 24 },
  actions: { gap: 12, paddingBottom: 20 },
  primary: { backgroundColor: "#1287FF", paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondary: { borderWidth: 1, borderColor: "#2FA8FF", paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  secondaryText: { color: "#fff", fontSize: 17, fontWeight: "700" }
});
