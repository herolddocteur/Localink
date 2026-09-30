import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ProfileSetupScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.step}>1 of 4</Text>
        <Text style={styles.title}>Build your profile</Text>
        <TextInput placeholder="@username" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput placeholder="Display name" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput placeholder="Bio" placeholderTextColor="#72839A" multiline style={[styles.input, styles.bio]} />
        <Text style={styles.label}>Profile type</Text>
        <View style={styles.options}>
          {["Personal", "Creator", "Business"].map((item) => <View key={item} style={styles.pill}><Text style={styles.pillText}>{item}</Text></View>)}
        </View>
        <Link href="/onboarding/location" asChild>
          <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Next</Text></TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F7FB", padding: 20, justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 14 },
  step: { color: "#1287FF", fontWeight: "700" },
  title: { fontSize: 30, fontWeight: "800", color: "#0B1830" },
  label: { color: "#0B1830", fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#D9E1EA", borderRadius: 14, padding: 14, color: "#0B1830", backgroundColor: "#F8FAFC" },
  bio: { minHeight: 90, textAlignVertical: "top" },
  options: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: { backgroundColor: "#EAF3FF", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  pillText: { color: "#0F65C9", fontWeight: "700" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
