import { router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CommunityAccess, createCommunity } from "../lib/communities";

const accessOptions: { key: CommunityAccess; label: string }[] = [
  { key: "public", label: "Public" }, { key: "private", label: "Private" }, { key: "approval", label: "Approval" }, { key: "paid", label: "Paid" }
];

export default function CreateCommunityScreen() {
  const [name,setName]=useState(""); const [description,setDescription]=useState(""); const [category,setCategory]=useState("");
  const [access,setAccess]=useState<CommunityAccess>("public"); const [price,setPrice]=useState(""); const [city,setCity]=useState(""); const [saving,setSaving]=useState(false);

  async function create() {
    if (name.trim().length < 2) return Alert.alert("Community name required");
    try {
      setSaving(true);
      await createCommunity({ name, description, category, access, membershipPrice: Number(price || 0), city });
      router.replace("/explore");
    } catch (error) { Alert.alert("Could not create community", error instanceof Error ? error.message : "Try again."); }
    finally { setSaving(false); }
  }

  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Create community</Text><Text style={styles.copy}>Build a free or paid Localink group.</Text>
    <TextInput value={name} onChangeText={setName} placeholder="Community name" placeholderTextColor="#7B8794" style={styles.input}/>
    <TextInput value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#7B8794" multiline style={[styles.input,styles.bio]}/>
    <TextInput value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor="#7B8794" style={styles.input}/>
    <TextInput value={city} onChangeText={setCity} placeholder="City (optional)" placeholderTextColor="#7B8794" style={styles.input}/>
    <Text style={styles.label}>Membership</Text><View style={styles.row}>{accessOptions.map(x=><TouchableOpacity key={x.key} onPress={()=>setAccess(x.key)} style={[styles.pill,access===x.key&&styles.active]}><Text style={[styles.pillText,access===x.key&&styles.activeText]}>{x.label}</Text></TouchableOpacity>)}</View>
    {access==="paid" && <><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="Membership price, e.g. 9.99" placeholderTextColor="#7B8794" style={styles.input}/><Text style={styles.fee}>Creators receive membership revenue. Localink charges 5% when funds are withdrawn.</Text></>}
    <TouchableOpacity onPress={create} disabled={saving} style={[styles.button,saving&&{opacity:.5}]}><Text style={styles.buttonText}>{saving?"Creating...":"Create community"}</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#F4F7FB"},content:{padding:20,gap:14},title:{fontSize:30,fontWeight:"800",color:"#0B1830"},copy:{color:"#657386",marginBottom:6},input:{backgroundColor:"#fff",borderWidth:1,borderColor:"#E0E7EF",borderRadius:14,padding:14,color:"#0B1830"},bio:{minHeight:100,textAlignVertical:"top"},label:{fontWeight:"800",color:"#0B1830"},row:{flexDirection:"row",flexWrap:"wrap",gap:8},pill:{paddingHorizontal:14,paddingVertical:10,borderRadius:999,backgroundColor:"#EAF3FF"},active:{backgroundColor:"#1287FF"},pillText:{color:"#0F65C9",fontWeight:"700"},activeText:{color:"#fff"},fee:{color:"#657386",lineHeight:20},button:{backgroundColor:"#1287FF",padding:16,borderRadius:14,alignItems:"center",marginTop:8},buttonText:{color:"#fff",fontWeight:"800",fontSize:16}});
