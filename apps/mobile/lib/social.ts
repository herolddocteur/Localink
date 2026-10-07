import { supabase } from "./supabase";

async function requireUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user;
}

export async function likePost(postId: string) {
  const user = await requireUser();
  const { error } = await supabase.from("post_likes").upsert({ post_id: postId, user_id: user.id });
  if (error) throw error;
}

export async function unlikePost(postId: string) {
  const user = await requireUser();
  const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
  if (error) throw error;
}

export async function addComment(postId: string, body: string) {
  const user = await requireUser();
  const clean = body.trim();
  if (!clean) throw new Error("Comment cannot be empty");
  const { data, error } = await supabase.from("comments").insert({ post_id: postId, author_id: user.id, body: clean }).select().single();
  if (error) throw error;
  return data;
}

export async function followUser(userId: string) {
  const user = await requireUser();
  if (user.id === userId) return;
  const { error } = await supabase.from("follows").upsert({ follower_id: user.id, following_id: userId });
  if (error) throw error;
}

export async function unfollowUser(userId: string) {
  const user = await requireUser();
  const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
  if (error) throw error;
}
