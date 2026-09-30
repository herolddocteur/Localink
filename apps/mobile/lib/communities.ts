import { supabase } from "./supabase";

export type CommunityAccess = "public" | "private" | "approval" | "paid";

async function userId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

export async function createCommunity(input: { name: string; description?: string; category?: string; access: CommunityAccess; membershipPrice?: number; countryCode?: string; region?: string; city?: string; }) {
  const ownerId = await userId();
  const price = input.access === "paid" ? Math.max(0, input.membershipPrice ?? 0) : 0;
  if (input.access === "paid" && price <= 0) throw new Error("Paid communities require a membership price.");

  const { data, error } = await supabase.from("communities").insert({
    owner_id: ownerId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    category: input.category?.trim() || null,
    access: input.access,
    membership_price: price,
    country_code: input.countryCode?.trim() || null,
    region: input.region?.trim() || null,
    city: input.city?.trim() || null
  }).select().single();
  if (error) throw error;

  const { error: memberError } = await supabase.from("community_members").insert({ community_id: data.id, user_id: ownerId, role: "owner", status: "active" });
  if (memberError) throw memberError;
  return data;
}

export async function joinCommunity(communityId: string, access: CommunityAccess) {
  const id = await userId();
  if (access === "paid") throw new Error("Paid membership requires payment checkout before activation.");
  const status = access === "approval" || access === "private" ? "pending" : "active";
  const { error } = await supabase.from("community_members").upsert({ community_id: communityId, user_id: id, role: "member", status });
  if (error) throw error;
  return status;
}

export async function requestWithdrawal(grossAmount: number) {
  const id = await userId();
  if (grossAmount <= 0) throw new Error("Withdrawal amount must be greater than zero.");
  const { data, error } = await supabase.from("creator_withdrawals").insert({ creator_id: id, gross_amount: grossAmount }).select("id, gross_amount, platform_fee, net_amount, status").single();
  if (error) throw error;
  return data;
}
