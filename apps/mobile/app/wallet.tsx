import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { findRecipient, getWallet, getWalletTransactions, sendMoneyRequest } from "../lib/wallet";

export default function WalletScreen() {
  const [wallet,setWallet]=useState<any>(null); const [transactions,setTransactions]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const [username,setUsername]=useState(""); const [amount,setAmount]=useState(""); const [memo,setMemo]=useState(""); const [sending,setSending]=useState(false);

  async function load(){ try { setLoading(true); const [w,t]=await Promise.all([getWallet(),getWalletTransactions()]); setWallet(w); setTransactions(t); } catch(e){ Alert.alert("Wallet unavailable",e instanceof Error?e.message:"Try again."); } finally { setLoading(false); } }
  useEffect(()=>{load();},[]);

  async function send(){
    try { setSending(true); const recipient=await findRecipient(username); if(!recipient) throw new Error("Localink user not found."); await sendMoneyRequest(recipient.id,Number(amount),memo); setUsername("");setAmount("");setMemo(""); await load(); }
    catch(e){ Alert.alert("Transfer not completed",e instanceof Error?e.message:"Try again."); } finally { setSending(false); }
  }

  if(loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large"/></SafeAreaView>;
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Localink Wallet</Text>
    <View style={styles.balance}><Text style={styles.balanceLabel}>Available balance</Text><Text style={styles.balanceValue}>{wallet?.currency || "USD"} {Number(wallet?.available_balance||0).toFixed(2)}</Text><Text style={styles.pending}>Pending: {Number(wallet?.pending_balance||0).toFixed(2)}</Text></View>
    <View style={styles.card}><Text style={styles.heading}>Send money</Text><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="@username" placeholderTextColor="#7B8794" style={styles.input}/><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Amount" placeholderTextColor="#7B8794" style={styles.input}/><TextInput value={memo} onChangeText={setMemo} placeholder="Memo (optional)" placeholderTextColor="#7B8794" style={styles.input}/><TouchableOpacity onPress={send} disabled={sending} style={[styles.button,sending&&{opacity:.5}]}><Text style={styles.buttonText}>{sending?"Sending...":"Send"}</Text></TouchableOpacity></View>
    <View style={styles.actions}><TouchableOpacity style={styles.action}><Text style={styles.actionTitle}>Receive</Text><Text style={styles.actionCopy}>Share your @username</Text></TouchableOpacity><TouchableOpacity style={styles.action}><Text style={styles.actionTitle}>Cash Out</Text><Text style={styles.actionCopy}>Transfer to payout account</Text></TouchableOpacity></View>
    <Text style={styles.heading}>Activity</Text>{transactions.length===0?<Text style={styles.empty}>No transactions yet.</Text>:transactions.map(t=><View key={t.id} style={styles.tx}><View><Text style={styles.txTitle}>{String(t.transaction_type).replaceAll("_"," ")}</Text><Text style={styles.txMeta}>{t.status} · {new Date(t.created_at).toLocaleDateString()}</Text></View><Text style={styles.txAmount}>{t.currency} {Number(t.amount).toFixed(2)}</Text></View>)}
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#F4F7FB"},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#F4F7FB"},content:{padding:18,gap:14},title:{fontSize:30,fontWeight:"800",color:"#0B1830"},balance:{backgroundColor:"#071A33",borderRadius:24,padding:22},balanceLabel:{color:"#B8C8DA"},balanceValue:{color:"#fff",fontSize:34,fontWeight:"800",marginTop:6},pending:{color:"#7FC1FF",marginTop:8},card:{backgroundColor:"#fff",borderRadius:20,padding:16,gap:10},heading:{fontSize:19,fontWeight:"800",color:"#0B1830"},input:{backgroundColor:"#F5F8FB",borderWidth:1,borderColor:"#E0E7EF",borderRadius:13,padding:13,color:"#0B1830"},button:{backgroundColor:"#1287FF",borderRadius:13,padding:14,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"800"},actions:{flexDirection:"row",gap:10},action:{flex:1,backgroundColor:"#fff",borderRadius:18,padding:16},actionTitle:{fontWeight:"800",color:"#0B1830"},actionCopy:{color:"#7B8794",fontSize:12,marginTop:5},empty:{color:"#7B8794"},tx:{backgroundColor:"#fff",borderRadius:15,padding:14,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},txTitle:{fontWeight:"800",color:"#0B1830",textTransform:"capitalize"},txMeta:{color:"#7B8794",fontSize:12,marginTop:3},txAmount:{fontWeight:"800",color:"#0B1830"}});
