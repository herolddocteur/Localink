import { router } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createPost } from "../lib/feed";

export default function CreatePostScreen() {
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function publish() {
    if (!body.trim()) return;
    try {
      setPosting(true);
      await createPost(body);
      setBody("");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Could not publish", error instanceof Error ? error.message : "Try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity><Text style={styles.title}>Create post</Text><View style={{ width: 48 }} /></View>
      <View style={styles.card}>
        <TextInput value={body} onChangeText={setBody} placeholder="What's happening?" placeholderTextColor="#7B8794" multiline maxLength={5000} style={styles.input} />
        <Text style={styles.count}>{body.length}/5000</Text>
        <TouchableOpacity onPress={publish} disabled={posting || !body.trim()} style={[styles.button, (posting || !body.trim()) && styles.disabled]}>
          <Text style={styles.buttonText}>{posting ? "Publishing..." : "Publish"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#F4F7FB"}, header:{backgroundColor:"#fff",padding:18,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  cancel:{color:"#1287FF",fontWeight:"700"}, title:{fontSize:18,fontWeight:"800",color:"#0B1830"}, card:{margin:16,backgroundColor:"#fff",borderRadius:20,padding:16},
  input:{minHeight:180,fontSize:18,color:"#0B1830",textAlignVertical:"top"}, count:{textAlign:"right",color:"#7B8794",marginBottom:14},
  button:{backgroundColor:"#1287FF",borderRadius:14,paddingVertical:15,alignItems:"center"}, disabled:{opacity:.5}, buttonText:{color:"#fff",fontWeight:"800",fontSize:16}
});
