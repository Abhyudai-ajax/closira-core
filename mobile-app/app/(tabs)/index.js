import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import data from '../../mock/enquiries.json';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Closira Workspace</Text>
      
      {/* Summary Stat Grid */}
      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.statVal}>{data.length}</Text><Text style={styles.statLbl}>Total Active</Text></View>
        <View style={styles.card}><Text style={[styles.statVal, {color: '#B91C1C'}]}>1</Text><Text style={styles.statLbl}>Escalations</Text></View>
      </View>

      <Text style={styles.subHeader}>Recent Conversational Alerts</Text>
      {data.map(item => (
        <TouchableOpacity key={item.id} style={styles.feedItem} onPress={() => navigation.navigate('Detail', { item })}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.msgPreview} numberOfLines={1}>{item.message}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  header: { fontSize: 24, fontWeight: '800', marginVertical: 12, color: '#111827' },
  subHeader: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10, color: '#374151' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginHorizontal: 4, elevation: 2 },
  statVal: { fontSize: 22, fontWeight: 'bold', color: '#1D4ED8' },
  statLbl: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  feedItem: { backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  customerName: { fontWeight: '600', fontSize: 14, color: '#111827' },
  msgPreview: { fontSize: 13, color: '#4B5563', marginTop: 3 }
});
