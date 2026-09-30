import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const rows = ["Profile visibility", "Show city (not exact location)", "Who can message me", "Who can see my posts", "Two-factor authentication", "Passkey login"];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.step}>4 of 4</Text>
        <Text style={styles.title}>Privacy setup</Text>
        {rows.map((row, index) => (
          <View key={row} style={styles.row}>
            <View style={{ flex: 1 }}><Text style={styles.rowTitle}>{row}</Text><Text style={styles.rowCopy}>{index < 4 ? "Choose your preference" : "Recommended"}</Text></View>
            <Switch value={index >= 4} />
          </View>
        ))}
        <Link href="/home" asChild>
          <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Finish setup</Text></TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F7FB", padding: 20, justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 12 },
  step: { color: "#1287FF", fontWeight: "700" },
  title: { fontSize: 30, fontWeight: "800", color: "#0B1830", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEF2F6", paddingVertical: 12 },
  rowTitle: { color: "#0B1830", fontWeight: "700" },
  rowCopy: { color: "#7B8794", marginTop: 3, fontSize: 12 },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
