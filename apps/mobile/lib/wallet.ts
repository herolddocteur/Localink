import { supabase } from "./supabase";

async function currentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

export async function getWallet() {
  const id = await currentUserId();
  const { data, error } = await supabase.from("wallet_accounts").select("user_id, currency, available_balance, pending_balance").eq("user_id", id).maybeSingle();
  if (error) throw error;
  return data ?? { user_id: id, currency: "USD", available_balance: 0, pending_balance: 0 };
}

export async function getWalletTransactions(limit = 30) {
  const id = await currentUserId();
  const { data, error } = await supabase.from("wallet_transactions").select("id, sender_id, recipient_id, transaction_type, amount, currency, status, memo, created_at").or(`sender_id.eq.${id},recipient_id.eq.${id}`).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function findRecipient(username: string) {
  const clean = username.trim().replace(/^@/, "").toLowerCase();
  const { data, error } = await supabase.from("profiles").select("id, username, display_name").eq("username", clean).maybeSingle();
  if (error) throw error;
  return data;
}

export async function sendMoneyRequest(recipientId: string, amount: number, memo?: string) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount.");
  const { data, error } = await supabase.functions.invoke("wallet-transfer", { body: { recipientId, amount, memo: memo?.trim() || null } });
  if (error) throw error;
  return data;
}
