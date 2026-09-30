import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const interests = ["Travel","Food","Music","Business","Technology","Sports","Health & Fitness","Education","Photography","Fashion","Cars","Nature","Community","Gaming"];

export default function InterestsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.step}>3 of 4</Text>
        <Text style={styles.title}>Choose your interests</Text>
        <View style={styles.wrap}>{interests.map((i) => <View key={i} style={styles.pill}><Text style={styles.pillText}>{i}</Text></View>)}</View>
        <Link href="/onboarding/privacy" asChild>
          <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Next</Text></TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F7FB", padding: 20, justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 16 },
  step: { color: "#1287FF", fontWeight: "700" },
  title: { fontSize: 30, fontWeight: "800", color: "#0B1830" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  pill: { backgroundColor: "#EAF3FF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  pillText: { color: "#0F65C9", fontWeight: "700" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
