import { useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DiscoverySection, searchDiscovery } from "../lib/discovery";

const sections: { key: DiscoverySection; label: string }[] = [
  { key: "people", label: "People" }, { key: "communities", label: "Communities" }, { key: "events", label: "Events" }, { key: "marketplace", label: "Marketplace" }
];
const shortcuts = ["Nearby", "Country", "Cities", "Music", "Business", "Sports", "Gaming", "Travel"];

export default function ExploreScreen() {
  const [term, setTerm] = useState("");
  const [section, setSection] = useState<DiscoverySection>("people");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!term.trim()) return;
    try { setLoading(true); setResults(await searchDiscovery(term, section)); }
    catch (error) { Alert.alert("Search unavailable", error instanceof Error ? error.message : "Try again."); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}><Text style={styles.title}>Explore</Text><Text style={styles.subtitle}>Discover Localink</Text></View>
      <View style={styles.searchRow}>
        <TextInput value={term} onChangeText={setTerm} onSubmitEditing={search} placeholder="Search people, groups, events..." placeholderTextColor="#7B8794" style={styles.search} />
        <TouchableOpacity onPress={search} style={styles.searchButton}><Text style={styles.searchButtonText}>Search</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sections}>
        {sections.map((item) => <TouchableOpacity key={item.key} onPress={() => { setSection(item.key); setResults([]); }} style={[styles.sectionPill, section===item.key&&styles.sectionActive]}><Text style={[styles.sectionText,section===item.key&&styles.sectionTextActive]}>{item.label}</Text></TouchableOpacity>)}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Discover by category</Text>
        <View style={styles.grid}>{shortcuts.map((item)=><TouchableOpacity key={item} onPress={()=>setTerm(item)} style={styles.card}><Text style={styles.cardTitle}>{item}</Text><Text style={styles.cardCopy}>Explore {item.toLowerCase()}</Text></TouchableOpacity>)}</View>
        {loading ? <ActivityIndicator /> : results.length > 0 && <><Text style={styles.heading}>Results</Text>{results.map((item)=><View key={item.id} style={styles.result}><Text style={styles.resultTitle}>{item.display_name || item.name || item.title}</Text><Text style={styles.resultCopy}>{item.username ? `@${item.username}` : item.category || item.city || "Localink"}</Text></View>)}</>}
      </ScrollView>
      <View style={styles.bottom}><Text style={styles.bottomText}>Home</Text><Text style={styles.bottomActive}>Explore</Text><Text style={styles.create}>＋</Text><Text style={styles.bottomText}>Messages</Text><Text style={styles.bottomText}>Profile</Text></View>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:"#F4F7FB"},header:{backgroundColor:"#fff",paddingHorizontal:18,paddingTop:10,paddingBottom:8},title:{fontSize:28,fontWeight:"800",color:"#0B1830"},subtitle:{color:"#7B8794",marginTop:2},
  searchRow:{backgroundColor:"#fff",padding:14,flexDirection:"row",gap:8},search:{flex:1,backgroundColor:"#F1F5F9",borderRadius:14,paddingHorizontal:14,paddingVertical:12,color:"#0B1830"},searchButton:{backgroundColor:"#1287FF",borderRadius:14,paddingHorizontal:14,justifyContent:"center"},searchButtonText:{color:"#fff",fontWeight:"800"},
  sections:{backgroundColor:"#fff",gap:8,paddingHorizontal:14,paddingBottom:14},sectionPill:{backgroundColor:"#EAF3FF",borderRadius:999,paddingHorizontal:14,paddingVertical:9},sectionActive:{backgroundColor:"#1287FF"},sectionText:{color:"#0F65C9",fontWeight:"700"},sectionTextActive:{color:"#fff"},
  content:{padding:14,paddingBottom:30},heading:{fontSize:19,fontWeight:"800",color:"#0B1830",marginVertical:12},grid:{flexDirection:"row",flexWrap:"wrap",gap:10},card:{width:"48%",backgroundColor:"#fff",borderRadius:18,padding:16,minHeight:90},cardTitle:{fontSize:16,fontWeight:"800",color:"#0B1830"},cardCopy:{color:"#7B8794",marginTop:5},result:{backgroundColor:"#fff",borderRadius:16,padding:15,marginBottom:9},resultTitle:{fontWeight:"800",fontSize:16,color:"#0B1830"},resultCopy:{color:"#7B8794",marginTop:3},
  bottom:{backgroundColor:"#fff",borderTopWidth:1,borderTopColor:"#E7ECF2",paddingVertical:10,paddingHorizontal:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},bottomText:{fontSize:11,color:"#7B8794",fontWeight:"700"},bottomActive:{fontSize:11,color:"#1287FF",fontWeight:"800"},create:{backgroundColor:"#1287FF",color:"#fff",fontSize:28,width:48,height:48,borderRadius:24,textAlign:"center",lineHeight:45,overflow:"hidden"}
});
