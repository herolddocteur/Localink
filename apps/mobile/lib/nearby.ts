import { supabase } from "./supabase";
export type MapFilter="all"|"post"|"event"|"marketplace"|"business"|"traffic"|"safety";
async function me(){const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Not signed in");return user.id;}
export async function getNearbyItems(filter:MapFilter="all"){
 const id=await me();const {data:profile,error:pErr}=await supabase.from("profiles").select("country_code,region,city").eq("id",id).single();if(pErr)throw pErr;
 let q=supabase.from("map_items").select("id,item_type,source_id,title,description,country_code,region,city,local_area,location_precision,verified_source,starts_at,expires_at,created_at").order("created_at",{ascending:false}).limit(100);
 if(profile?.country_code)q=q.eq("country_code",profile.country_code);if(profile?.region)q=q.eq("region",profile.region);if(profile?.city)q=q.eq("city",profile.city);if(filter!=="all")q=q.eq("item_type",filter);
 const {data,error}=await q;if(error)throw error;return data??[];
}
export async function saveLocationPreferences(input:{currentLocationEnabled:boolean;preciseLocationEnabled:boolean;backgroundLocationEnabled:boolean;publicVisibility:"only_me"|"friends"|"communities"|"everyone"|"hidden";travelModeEnabled:boolean}){const id=await me();const {error}=await supabase.from("location_preferences").upsert({user_id:id,current_location_enabled:input.currentLocationEnabled,precise_location_enabled:input.preciseLocationEnabled,background_location_enabled:input.backgroundLocationEnabled,public_visibility:input.publicVisibility,travel_mode_enabled:input.travelModeEnabled});if(error)throw error;}
