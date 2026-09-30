import { router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { saveOnboardingDraft } from "../../lib/onboarding";

const profileTypes = ["personal", "creator", "business"] as const;

export default function ProfileSetupScreen() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileType, setProfileType] = useState<(typeof profileTypes)[number]>("personal");

  async function next() {
    const cleanUsername = username.trim().replace(/^@/, "").toLowerCase();
    if (cleanUsername.length < 3 || displayName.trim().length < 1) {
      Alert.alert("Profile incomplete", "Choose a username with at least 3 characters and enter your display name.");
      return;
    }
    await saveOnboardingDraft({ username: cleanUsername, displayName: displayName.trim(), bio: bio.trim(), profileType });
    router.push("/onboarding/location");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.step}>1 of 4</Text>
        <Text style={styles.title}>Build your profile</Text>
        <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="@username" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#72839A" style={styles.input} />
        <TextInput value={bio} onChangeText={setBio} placeholder="Bio" placeholderTextColor="#72839A" multiline style={[styles.input, styles.bio]} />
        <Text style={styles.label}>Profile type</Text>
        <View style={styles.options}>
          {profileTypes.map((item) => (
            <TouchableOpacity key={item} onPress={() => setProfileType(item)} style={[styles.pill, profileType === item && styles.selectedPill]}>
              <Text style={[styles.pillText, profileType === item && styles.selectedPillText]}>{item[0].toUpperCase() + item.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  label: { color: "#0B1830", fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#D9E1EA", borderRadius: 14, padding: 14, color: "#0B1830", backgroundColor: "#F8FAFC" },
  bio: { minHeight: 90, textAlignVertical: "top" },
  options: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: { backgroundColor: "#EAF3FF", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  selectedPill: { backgroundColor: "#1287FF" },
  pillText: { color: "#0F65C9", fontWeight: "700" },
  selectedPillText: { color: "#fff" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
