import { useEffect,useState } from "react";
import { ActivityIndicator,Alert,SafeAreaView,ScrollView,StyleSheet,Text,TouchableOpacity,View } from "react-native";
import { router } from "expo-router";
import { getConversations } from "../lib/messages";

export default function MessagesScreen(){
 const [items,setItems]=useState<any[]>([]);const [loading,setLoading]=useState(true);
 useEffect(()=>{getConversations().then(setItems).catch(e=>Alert.alert("Messages unavailable",e.message)).finally(()=>setLoading(false));},[]);
 return <SafeAreaView style={styles.screen}><View style={styles.header}><Text style={styles.title}>Messages</Text><TouchableOpacity><Text style={styles.new}>New</Text></TouchableOpacity></View>
 {loading?<View style={styles.center}><ActivityIndicator size="large"/></View>:<ScrollView contentContainerStyle={styles.content}>{items.length===0?<View style={styles.empty}><Text style={styles.emptyTitle}>No conversations yet</Text><Text style={styles.copy}>Start a direct or group conversation from a Localink profile.</Text></View>:items.map((row:any)=>{const c=row.conversations;return <TouchableOpacity key={row.conversation_id} onPress={()=>router.push({pathname:"/chat/[id]",params:{id:row.conversation_id}})} style={styles.chat}><View style={styles.avatar}><Text style={styles.avatarText}>{c?.type==="group"?"G":"L"}</Text></View><View style={{flex:1}}><Text style={styles.chatTitle}>{c?.title||"Localink conversation"}</Text><Text style={styles.copy}>{c?.request_status==="pending"?"Message request":"Open conversation"}</Text></View></TouchableOpacity>})}</ScrollView>}
 </SafeAreaView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#F4F7FB"},header:{backgroundColor:"#fff",padding:18,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},title:{fontSize:28,fontWeight:"800",color:"#0B1830"},new:{color:"#1287FF",fontWeight:"800"},center:{flex:1,alignItems:"center",justifyContent:"center"},content:{padding:14,gap:10},empty:{backgroundColor:"#fff",padding:28,borderRadius:20,alignItems:"center"},emptyTitle:{fontSize:20,fontWeight:"800",color:"#0B1830",marginBottom:7},copy:{color:"#7B8794"},chat:{backgroundColor:"#fff",borderRadius:18,padding:14,flexDirection:"row",gap:12,alignItems:"center"},avatar:{width:48,height:48,borderRadius:24,backgroundColor:"#1287FF",alignItems:"center",justifyContent:"center"},avatarText:{color:"#fff",fontWeight:"800",fontSize:18},chatTitle:{fontWeight:"800",color:"#0B1830",fontSize:16}});
