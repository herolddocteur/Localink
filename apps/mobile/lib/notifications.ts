import { supabase } from "./supabase";

async function me(){const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Not signed in");return user.id;}
export async function getNotifications(limit=50){const id=await me();const {data,error}=await supabase.from("notifications").select("id,type,title,body,actor_id,post_id,comment_id,conversation_id,community_id,event_id,wallet_transaction_id,read_at,created_at").eq("user_id",id).order("created_at",{ascending:false}).limit(limit);if(error)throw error;return data??[];}
export async function markNotificationRead(id:string){const {error}=await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",id);if(error)throw error;}
export async function markAllNotificationsRead(){const id=await me();const {error}=await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("user_id",id).is("read_at",null);if(error)throw error;}
