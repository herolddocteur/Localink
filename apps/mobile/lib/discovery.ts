import { supabase } from "./supabase";

export type DiscoverySection = "people" | "communities" | "events" | "marketplace";

export async function searchDiscovery(term: string, section: DiscoverySection) {
  const q = term.trim();
  if (!q) return [];

  if (section === "people") {
    const { data, error } = await supabase.from("profiles").select("id, username, display_name, bio, city, country_code, profile_type").or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).limit(25);
    if (error) throw error;
    return data ?? [];
  }

  if (section === "communities") {
    const { data, error } = await supabase.from("communities").select("id, name, description, category, access, membership_price, city, country_code").ilike("name", `%${q}%`).limit(25);
    if (error) throw error;
    return data ?? [];
  }

  if (section === "events") {
    const { data, error } = await supabase.from("events").select("id, title, description, category, starts_at, city, country_code, venue_name").ilike("title", `%${q}%`).gte("starts_at", new Date().toISOString()).order("starts_at").limit(25);
    if (error) throw error;
    return data ?? [];
  }

  const { data, error } = await supabase.from("marketplace_listings").select("id, title, description, category, price, currency, city, country_code").eq("status", "active").ilike("title", `%${q}%`).order("created_at", { ascending: false }).limit(25);
  if (error) throw error;
  return data ?? [];
}
