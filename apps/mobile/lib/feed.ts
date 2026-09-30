import { supabase } from "./supabase";

export type FeedMode = "for-you" | "nearby" | "following" | "worldwide";

export async function getFeed(mode: FeedMode, limit = 25) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  let query = supabase
    .from("posts")
    .select("id, body, media_url, media_type, visibility, country_code, region, city, created_at, author_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (mode === "following") {
    const { data: follows, error: followError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    if (followError) throw followError;
    const ids = (follows ?? []).map((row) => row.following_id);
    if (ids.length === 0) return [];
    query = query.in("author_id", ids);
  }

  if (mode === "nearby") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("country_code, region, city")
      .eq("id", user.id)
      .single();
    if (profileError) throw profileError;
    if (profile?.country_code) query = query.eq("country_code", profile.country_code);
    if (profile?.region) query = query.eq("region", profile.region);
    if (profile?.city) query = query.eq("city", profile.city);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createPost(body: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("country_code, region, city, local_area, post_visibility")
    .eq("id", user.id)
    .single();

  const visibility = profile?.post_visibility === "friends" ? "followers" : "public";
  const { data, error } = await supabase.from("posts").insert({
    author_id: user.id,
    body: body.trim(),
    visibility,
    country_code: profile?.country_code ?? null,
    region: profile?.region ?? null,
    city: profile?.city ?? null,
    local_area: profile?.local_area ?? null
  }).select().single();

  if (error) throw error;
  return data;
}
