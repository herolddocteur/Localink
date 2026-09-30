import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}><Text style={styles.brand}>Localink</Text><Text style={styles.bell}>◉</Text></View>
      <View style={styles.tabs}>{["For You","Nearby","Following","Worldwide"].map((t,i)=><Text key={t} style={[styles.tab,i===0&&styles.active]}>{t}</Text>)}</View>
      <ScrollView contentContainerStyle={styles.feed}>
        <View style={styles.post}>
          <Text style={styles.name}>Welcome to Localink</Text>
          <Text style={styles.meta}>Your first feed is ready.</Text>
          <View style={styles.imagePlaceholder}><Text style={styles.imageText}>Local stories, people, events and opportunities will appear here.</Text></View>
          <View style={styles.actions}><Text>♡ 0</Text><Text>◌ 0</Text><Text>↗ Share</Text></View>
        </View>
      </ScrollView>
      <View style={styles.bottom}>{["Home","Explore","Create","Messages","Profile"].map((x,i)=><Text key={x} style={[styles.bottomText,i===0&&styles.bottomActive]}>{x}</Text>)}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#F4F7FB"},
  header:{paddingHorizontal:18,paddingTop:8,paddingBottom:10,backgroundColor:"#fff",flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  brand:{fontSize:24,fontWeight:"800",color:"#0B1830"},
  bell:{color:"#1287FF",fontSize:20},
  tabs:{flexDirection:"row",gap:18,paddingHorizontal:18,paddingVertical:12,backgroundColor:"#fff"},
  tab:{color:"#7B8794",fontWeight:"700",fontSize:13},
  active:{color:"#1287FF"},
  feed:{padding:14},
  post:{backgroundColor:"#fff",borderRadius:20,padding:16,gap:8},
  name:{fontWeight:"800",fontSize:17,color:"#0B1830"},
  meta:{color:"#7B8794"},
  imagePlaceholder:{height:260,borderRadius:18,backgroundColor:"#DCEBFF",alignItems:"center",justifyContent:"center",padding:24},
  imageText:{textAlign:"center",color:"#0F65C9",fontWeight:"700",lineHeight:22},
  actions:{flexDirection:"row",justifyContent:"space-between",paddingTop:8},
  bottom:{backgroundColor:"#fff",borderTopWidth:1,borderTopColor:"#E7ECF2",paddingVertical:14,paddingHorizontal:12,flexDirection:"row",justifyContent:"space-between"},
  bottomText:{fontSize:11,color:"#7B8794",fontWeight:"700"},
  bottomActive:{color:"#1287FF"}
});
