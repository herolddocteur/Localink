import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

const PENDING_BIRTHDAY_KEY = "localink_pending_birthday";

function getUrlParam(url: string, name: string) {
  const match = url.match(new RegExp("[?&#]" + name + "=([^&#]+)"));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function startGoogleAuth(dateOfBirth?: string) {
  if (dateOfBirth) {
    await AsyncStorage.setItem(PENDING_BIRTHDAY_KEY, dateOfBirth);
  } else {
    await AsyncStorage.removeItem(PENDING_BIRTHDAY_KEY);
  }

  const redirectTo = Linking.createURL("/auth/sign-in");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (error) throw error;
  if (!data.url) throw new Error("Google sign-in URL was not created.");

  await Linking.openURL(data.url);
}

async function applyPendingBirthday() {
  const pendingBirthday = await AsyncStorage.getItem(PENDING_BIRTHDAY_KEY);

  if (!pendingBirthday) return;

  const { error } = await supabase.auth.updateUser({
    data: {
      date_of_birth: pendingBirthday
    }
  });

  if (error) throw error;

  await AsyncStorage.removeItem(PENDING_BIRTHDAY_KEY);
}

export async function completeOAuthFromUrl(url: string | null) {
  if (!url) return false;

  const code = getUrlParam(url, "code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    await applyPendingBirthday();
    return true;
  }

  const accessToken = getUrlParam(url, "access_token");
  const refreshToken = getUrlParam(url, "refresh_token");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (error) throw error;
    await applyPendingBirthday();
    return true;
  }

  return false;
}
