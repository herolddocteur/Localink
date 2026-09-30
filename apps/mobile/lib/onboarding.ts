import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "localink:onboarding";

export type OnboardingDraft = {
  username?: string;
  displayName?: string;
  bio?: string;
  profileType?: "personal" | "creator" | "business";
  countryCode?: string;
  region?: string;
  city?: string;
  localArea?: string;
  interests?: string[];
  visibility?: "public" | "followers" | "friends" | "private";
  showCity?: boolean;
  messagePermission?: string;
  postVisibility?: string;
};

export async function getOnboardingDraft(): Promise<OnboardingDraft> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveOnboardingDraft(values: Partial<OnboardingDraft>) {
  const current = await getOnboardingDraft();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...values }));
}

export async function clearOnboardingDraft() {
  await AsyncStorage.removeItem(KEY);
}
