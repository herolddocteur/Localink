import { router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { clearOnboardingDraft, getOnboardingDraft } from "../../lib/onboarding";
import { supabase } from "../../lib/supabase";

export default function PrivacyScreen() {
  const [showCity, setShowCity] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [friendsOnlyMessages, setFriendsOnlyMessages] = useState(true);
  const [friendsOnlyPosts, setFriendsOnlyPosts] = useState(false);
  const [reviewedPrivacy, setReviewedPrivacy] = useState(false);
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (!reviewedPrivacy) {
      Alert.alert("Privacy review required", "Review your privacy choices and confirm them before finishing setup.");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      Alert.alert("Session expired", "Sign in again to finish your profile.");
      router.replace("/auth/sign-in");
      return;
    }

    const draft = await getOnboardingDraft();

    if (!draft.username || !draft.displayName || !draft.bio || !draft.profileType) {
      setSaving(false);
      Alert.alert("Step 1 incomplete", "Complete every required profile field before finishing setup.");
      router.replace("/onboarding/profile");
      return;
    }

    if (!draft.countryCode || !draft.region || !draft.city || !draft.localArea) {
      setSaving(false);
      Alert.alert("Step 2 incomplete", "Complete every required location field before finishing setup.");
      router.replace("/onboarding/location");
      return;
    }

    if (!draft.interests || draft.interests.length < 1) {
      setSaving(false);
      Alert.alert("Step 3 incomplete", "Choose at least one interest before finishing setup.");
      router.replace("/onboarding/interests");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: draft.username,
      display_name: draft.displayName,
      bio: draft.bio,
      profile_type: draft.profileType,
      country_code: draft.countryCode,
      region: draft.region,
      city: draft.city,
      local_area: draft.localArea,
      interests: draft.interests,
      visibility: privateProfile ? "private" : "public",
      show_city: showCity,
      message_permission: friendsOnlyMessages ? "friends" : "everyone",
      post_visibility: friendsOnlyPosts ? "friends" : "public",
      onboarding_complete: true
    });

    setSaving(false);
    if (error) {
      Alert.alert("Could not save profile", error.message);
      return;
    }

    await clearOnboardingDraft();
    router.replace("/home");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.step}>4 of 4 • Required</Text>
        <Text style={styles.title}>Privacy setup</Text>
        <Text style={styles.copy}>Review your settings. You must confirm them before finishing.</Text>
        <Row title="Private profile" copy="Only approved people can follow you" value={privateProfile} onChange={setPrivateProfile} />
        <Row title="Show city" copy="Never shows your exact location" value={showCity} onChange={setShowCity} />
        <Row title="Friends-only messages" copy="Reduce unwanted message requests" value={friendsOnlyMessages} onChange={setFriendsOnlyMessages} />
        <Row title="Friends-only posts" copy="Limit who can see new posts" value={friendsOnlyPosts} onChange={setFriendsOnlyPosts} />

        <TouchableOpacity
          style={[styles.confirmRow, reviewedPrivacy && styles.confirmRowSelected]}
          onPress={() => setReviewedPrivacy((value) => !value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: reviewedPrivacy }}
        >
          <View style={[styles.checkbox, reviewedPrivacy && styles.checkboxSelected]}>
            <Text style={styles.checkmark}>{reviewedPrivacy ? "✓" : ""}</Text>
          </View>
          <Text style={styles.confirmText}>I reviewed and confirm these privacy settings. *</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.primary, saving && styles.disabled]} onPress={finish} disabled={saving}>
          <Text style={styles.primaryText}>{saving ? "Saving..." : "Finish setup"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ title, copy, value, onChange }: { title: string; copy: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowCopy}>{copy}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F7FB", padding: 20, justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 28, padding: 22, gap: 12 },
  step: { color: "#1287FF", fontWeight: "700" },
  title: { fontSize: 30, fontWeight: "800", color: "#0B1830", marginBottom: 4 },
  copy: { color: "#5E6B7A", lineHeight: 21, marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEF2F6", paddingVertical: 12 },
  rowTitle: { color: "#0B1830", fontWeight: "700" },
  rowCopy: { color: "#7B8794", marginTop: 3, fontSize: 12 },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#D9E1EA",
    borderRadius: 14,
    padding: 12,
    marginTop: 4
  },
  confirmRowSelected: { borderColor: "#1287FF", backgroundColor: "#EAF3FF" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9AA8B8",
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxSelected: { backgroundColor: "#1287FF", borderColor: "#1287FF" },
  checkmark: { color: "#fff", fontWeight: "900" },
  confirmText: { flex: 1, color: "#0B1830", fontWeight: "700" },
  primary: { backgroundColor: "#1287FF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  disabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
