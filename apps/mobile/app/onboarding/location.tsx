import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LocationScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.step}>2 of 4</Text>
        <Text style={styles.title}>Where are you located?</Text>
        <Text style={styles.copy}>Choose the area you want Localink to use for local discovery. Exact location stays private unless you explicitly share it.</Text>
        {["Country", "State / Province", "City", "Local area / Neighborhood"].map((p) => <TextInput key={p} placeholder={p} placeholderTextColor="#72839A" style={styles.input} />)}
        <Link href="/onboarding/interests" asChild>
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
  copy: { color: "#5E6B7A", lineHeight: 21 },
  input: { borderWidth: 1, borderColor: "#D9E1EA", borderRadius: 14, padding: 14, color: "#0B1830", backgroundColor: "#F8FAFC" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
