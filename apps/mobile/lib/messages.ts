import { supabase } from "./supabase";

async function me(){const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Not signed in");return user.id;}

export async function getConversations(){
  const id=await me();
  const {data:members,error}=await supabase.from("conversation_members").select("conversation_id,last_read_at,conversations(id,type,title,request_status,updated_at)").eq("user_id",id).order("joined_at",{ascending:false});
  if(error)throw error; return members??[];
}

export async function getMessages(conversationId:string,limit=50){
  const {data,error}=await supabase.from("messages").select("id,conversation_id,sender_id,kind,body,media_url,reply_to_id,edited_at,recalled_at,created_at").eq("conversation_id",conversationId).order("created_at",{ascending:false}).limit(limit);
  if(error)throw error; return (data??[]).reverse();
}

export async function sendMessage(conversationId:string,body:string){
  const sender=await me(); const clean=body.trim(); if(!clean)throw new Error("Message cannot be empty");
  const {data,error}=await supabase.from("messages").insert({conversation_id:conversationId,sender_id:sender,kind:"text",body:clean}).select().single();
  if(error)throw error; return data;
}

export async function editMessage(messageId:string,body:string){
  const clean=body.trim(); if(!clean)throw new Error("Message cannot be empty");
  const {data,error}=await supabase.from("messages").update({body:clean,edited_at:new Date().toISOString()}).eq("id",messageId).select().single();
  if(error)throw error; return data;
}

export async function recallMessage(messageId:string){
  const {data,error}=await supabase.from("messages").update({body:null,media_url:null,recalled_at:new Date().toISOString()}).eq("id",messageId).select().single();
  if(error)throw error; return data;
}

export async function markConversationRead(conversationId:string){
  const id=await me(); const {error}=await supabase.from("conversation_members").update({last_read_at:new Date().toISOString()}).eq("conversation_id",conversationId).eq("user_id",id); if(error)throw error;
}
