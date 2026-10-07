import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return Response.json({ error: "Authentication required" }, { status: 401 });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    const { recipientId, amount, memo, idempotencyKey } = await req.json();
    const numericAmount = Number(amount);
    if (!recipientId || !Number.isFinite(numericAmount) || numericAmount <= 0) return Response.json({ error: "Invalid transfer" }, { status: 400 });

    const key = typeof idempotencyKey === "string" && idempotencyKey.length >= 8 ? idempotencyKey : crypto.randomUUID();
    const { data, error } = await supabase.rpc("execute_wallet_transfer", {
      p_recipient_id: recipientId,
      p_amount: numericAmount,
      p_memo: typeof memo === "string" ? memo : null,
      p_idempotency_key: key
    });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ transactionId: data, status: "completed", idempotencyKey: key });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
});
