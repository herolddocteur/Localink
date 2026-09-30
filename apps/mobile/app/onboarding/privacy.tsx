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
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      Alert.alert("Session expired", "Sign in again to finish your profile.");
      router.replace("/auth/sign-in");
      return;
    }

    const draft = await getOnboardingDraft();
    if (!draft.username || !draft.displayName) {
      setSaving(false);
      Alert.alert("Profile incomplete", "Return to profile setup and choose a username and display name.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: draft.username,
      display_name: draft.displayName,
      bio: draft.bio || null,
      profile_type: draft.profileType || "personal",
      country_code: draft.countryCode || null,
      region: draft.region || null,
      city: draft.city || null,
      local_area: draft.localArea || null,
      interests: draft.interests || [],
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
        <Text style={styles.step}>4 of 4</Text>
        <Text style={styles.title}>Privacy setup</Text>
        <Row title="Private profile" copy="Only approved people can follow you" value={privateProfile} onChange={setPrivateProfile} />
        <Row title="Show city" copy="Never shows your exact location" value={showCity} onChange={setShowCity} />
        <Row title="Friends-only messages" copy="Reduce unwanted message requests" value={friendsOnlyMessages} onChange={setFriendsOnlyMessages} />
        <Row title="Friends-only posts" copy="Limit who can see new posts" value={friendsOnlyPosts} onChange={setFriendsOnlyPosts} />
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
      <View style={{ flex: 1 }}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowCopy}>{copy}</Text></View>
      <Switch value={value} onValueChange={onChange} />
    </View>
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
  disabled: { opacity: 0.6 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
