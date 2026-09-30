import { supabase } from "./supabase";
import { followUser, unfollowUser } from "./social";

export async function getProfile(userId:string){
 const {data:profile,error}=await supabase.from("profiles").select("id,username,display_name,bio,profile_type,country_code,region,city,local_area,visibility,avatar_url,cover_url,is_verified,verification_type,website").eq("id",userId).single();if(error)throw error;
 const [{count:followers},{count:following},{count:posts}]=await Promise.all([
  supabase.from("follows").select("*",{count:"exact",head:true}).eq("following_id",userId),
  supabase.from("follows").select("*",{count:"exact",head:true}).eq("follower_id",userId),
  supabase.from("posts").select("*",{count:"exact",head:true}).eq("author_id",userId)
 ]);
 return {...profile,followers:followers??0,following:following??0,post_count:posts??0};
}
export async function getProfilePosts(userId:string){const {data,error}=await supabase.from("posts").select("id,body,media_url,media_type,created_at").eq("author_id",userId).order("created_at",{ascending:false}).limit(30);if(error)throw error;return data??[];}
export async function isFollowing(userId:string){const {data:{user}}=await supabase.auth.getUser();if(!user)return false;const {data}=await supabase.from("follows").select("follower_id").eq("follower_id",user.id).eq("following_id",userId).maybeSingle();return !!data;}
export {followUser,unfollowUser};
