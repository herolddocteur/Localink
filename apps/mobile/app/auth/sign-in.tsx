import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignInScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.copy}>Sign in to Localink.</Text>
        <TextInput placeholder="Email or username" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput placeholder="Password" placeholderTextColor="#72839A" secureTextEntry style={styles.input} />
        <Link href="/home" asChild>
          <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Sign In</Text></TouchableOpacity>
        </Link>
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
  input: { borderWidth: 1, borderColor: "#D9E1EA", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, color: "#0B1830", backgroundColor: "#F8FAFC" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  link: { color: "#1287FF", textAlign: "center", marginTop: 4 }
});
