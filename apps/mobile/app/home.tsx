import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FeedMode, getFeed } from "../lib/feed";
import { likePost } from "../lib/social";
import { supabase } from "../lib/supabase";

type FeedPost = Awaited<ReturnType<typeof getFeed>>[number];
const tabs: { label: string; mode: FeedMode }[] = [
  { label: "For You", mode: "for-you" },
  { label: "Nearby", mode: "nearby" },
  { label: "Following", mode: "following" },
  { label: "Worldwide", mode: "worldwide" }
];

export default function HomeScreen() {
  const [mode, setMode] = useState<FeedMode>("for-you");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try { setPosts(await getFeed(mode)); }
    catch (error) { Alert.alert("Feed unavailable", error instanceof Error ? error.message : "Try again."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  async function like(id: string) {
    try { await likePost(id); }
    catch (error) { Alert.alert("Could not like post", error instanceof Error ? error.message : "Try again."); }
  }

  async function openProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }
    router.push(`/profile/${user.id}`);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}><Text style={styles.brand}>Localink</Text><Text style={styles.bell}>●</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroller} contentContainerStyle={styles.tabs}>
        {tabs.map((tab) => <TouchableOpacity key={tab.mode} onPress={() => setMode(tab.mode)}><Text style={[styles.tab,mode===tab.mode&&styles.active]}>{tab.label}</Text></TouchableOpacity>)}
      </ScrollView>

      {loading ? <View style={styles.center}><ActivityIndicator size="large" /></View> : (
        <ScrollView contentContainerStyle={styles.feed} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
          {posts.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.meta}>Create a post or follow people to build your feed.</Text></View> : posts.map((post) => (
            <View key={post.id} style={styles.post}>
              <Text style={styles.name}>Localink member</Text>
              <Text style={styles.meta}>{post.city ? `${post.city} · ` : ""}{new Date(post.created_at).toLocaleString()}</Text>
              {!!post.body && <Text style={styles.body}>{post.body}</Text>}
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => like(post.id)}><Text style={styles.action}>♡ Like</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.action}>◌ Comment</Text></TouchableOpacity>
                <TouchableOpacity><Text style={styles.action}>↗ Share</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.bottom}>
        <TouchableOpacity onPress={() => router.replace("/home")} style={styles.navItem}>
          <Text style={styles.bottomActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/explore")} style={styles.navItem}>
          <Text style={styles.bottomText}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/create-post")}>
          <Text style={styles.create}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/messages")} style={styles.navItem}>
          <Text style={styles.bottomText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={openProfile} style={styles.navItem}>
          <Text style={styles.bottomText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#F4F7FB"}, header:{paddingHorizontal:18,paddingTop:8,paddingBottom:10,backgroundColor:"#fff",flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  brand:{fontSize:24,fontWeight:"800",color:"#0B1830"}, bell:{color:"#1287FF",fontSize:20}, tabScroller:{flexGrow:0,backgroundColor:"#fff"}, tabs:{gap:22,paddingHorizontal:18,paddingVertical:12},
  tab:{color:"#7B8794",fontWeight:"700",fontSize:13}, active:{color:"#1287FF"}, center:{flex:1,alignItems:"center",justifyContent:"center"}, feed:{padding:14,gap:12},
  post:{backgroundColor:"#fff",borderRadius:20,padding:16,gap:8}, name:{fontWeight:"800",fontSize:17,color:"#0B1830"}, meta:{color:"#7B8794"}, body:{color:"#17253B",fontSize:16,lineHeight:23,paddingVertical:8},
  actions:{flexDirection:"row",justifyContent:"space-between",borderTopWidth:1,borderTopColor:"#EEF2F6",paddingTop:12}, action:{color:"#526173",fontWeight:"700"}, empty:{backgroundColor:"#fff",borderRadius:20,padding:28,alignItems:"center",gap:8}, emptyTitle:{fontSize:20,fontWeight:"800",color:"#0B1830"},
  bottom:{backgroundColor:"#fff",borderTopWidth:1,borderTopColor:"#E7ECF2",paddingVertical:10,paddingHorizontal:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  navItem:{paddingHorizontal:4,paddingVertical:8},
  bottomText:{fontSize:11,color:"#7B8794",fontWeight:"700"},
  bottomActive:{fontSize:11,color:"#1287FF",fontWeight:"800"},
  create:{backgroundColor:"#1287FF",color:"#fff",fontSize:28,width:48,height:48,borderRadius:24,textAlign:"center",lineHeight:45,overflow:"hidden"}
});
