import * as Linking from "expo-linking";
import { supabase } from "./supabase";

function getUrlParam(url: string, name: string) {
  const match = url.match(new RegExp("[?&#]" + name + "=([^&#]+)"));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function startGoogleAuth() {
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

export async function completeOAuthFromUrl(url: string | null) {
  if (!url) return false;

  const code = getUrlParam(url, "code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
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
    return true;
  }

  return false;
}
