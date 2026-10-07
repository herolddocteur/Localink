import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { saveOnboardingDraft } from "../../lib/onboarding";

export default function LocationScreen() {
  const [countryCode, setCountryCode] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [localArea, setLocalArea] = useState("");

  async function next() {
    const country = countryCode.trim();
    const stateOrProvince = region.trim();
    const cleanCity = city.trim();
    const area = localArea.trim();

    if (!country || !stateOrProvince || !cleanCity || !area) {
      Alert.alert(
        "Location required",
        "Complete Country, State / Province, City, and Local area / Neighborhood before continuing."
      );
      return;
    }

    await saveOnboardingDraft({
      countryCode: country,
      region: stateOrProvince,
      city: cleanCity,
      localArea: area
    });
    router.push("/onboarding/interests");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.step}>2 of 4 • Required</Text>
            <Text style={styles.title}>Where are you located?</Text>
            <Text style={styles.copy}>
              All four fields are required for local discovery. Do not enter your street address.
            </Text>

            <Text style={styles.label}>Country *</Text>
            <TextInput
              value={countryCode}
              onChangeText={setCountryCode}
              placeholder="Country"
              placeholderTextColor="#72839A"
              returnKeyType="next"
              style={styles.input}
            />

            <Text style={styles.label}>State / Province *</Text>
            <TextInput
              value={region}
              onChangeText={setRegion}
              placeholder="State / Province"
              placeholderTextColor="#72839A"
              returnKeyType="next"
              style={styles.input}
            />

            <Text style={styles.label}>City *</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor="#72839A"
              returnKeyType="next"
              style={styles.input}
            />

            <Text style={styles.label}>Local area / Neighborhood *</Text>
            <TextInput
              value={localArea}
              onChangeText={setLocalArea}
              placeholder="Local area / Neighborhood"
              placeholderTextColor="#72839A"
              returnKeyType="done"
              style={styles.input}
            />

            <TouchableOpacity style={styles.primary} onPress={next}>
              <Text style={styles.primaryText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 14 },
  step: { color: "#1287FF", fontWeight: "700" },
  title: { fontSize: 30, fontWeight: "800", color: "#0B1830" },
  copy: { color: "#5E6B7A", lineHeight: 21 },
  label: { color: "#0B1830", fontWeight: "700", marginBottom: -8 },
  input: { borderWidth: 1, borderColor: "#D9E1EA", borderRadius: 14, padding: 14, color: "#0B1830", backgroundColor: "#F8FAFC" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
