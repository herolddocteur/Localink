import { router } from "expo-router";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { saveOnboardingDraft } from "../../lib/onboarding";

export default function LocationScreen() {
  const [countryCode, setCountryCode] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [localArea, setLocalArea] = useState("");

  async function next() {
    await saveOnboardingDraft({
      countryCode: countryCode.trim(),
      region: region.trim(),
      city: city.trim(),
      localArea: localArea.trim()
    });
    router.push("/onboarding/interests");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.step}>2 of 4</Text>
        <Text style={styles.title}>Where are you located?</Text>
        <Text style={styles.copy}>Choose the area Localink should use for local discovery. Exact location is not required.</Text>
        <TextInput value={countryCode} onChangeText={setCountryCode} placeholder="Country" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput value={region} onChangeText={setRegion} placeholder="State / Province" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput value={localArea} onChangeText={setLocalArea} placeholder="Local area / Neighborhood" placeholderTextColor="#72839A" style={styles.input} />
        <TouchableOpacity style={styles.primary} onPress={next}><Text style={styles.primaryText}>Next</Text></TouchableOpacity>
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
