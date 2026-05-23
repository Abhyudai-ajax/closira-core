import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { ChannelBadge } from '../../components/Badges';
import data from '../../mock/enquiries.json';

export default function EscalationsScreen() {
  const escalations = data.filter(i => i.status.toLowerCase() === 'escalated');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Critical Agent Escalations</Text>
      <FlatList
        data={escalations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.urgency}>⚠️ URGENCY: HIGH</Text>
            <Text style={styles.name}>{item.customer_name}</Text>
            <Text style={styles.reason}>Reason: {item.reason}</Text>
            <View style={styles.row}>
              <ChannelBadge channel={item.channel} />
              <Button title="Resolve Case" color="#15803D" onPress={() => alert('Resolved')} />
            </View>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#111827' },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginVertical: 6, borderLeftWidth: 4, borderLeftColor: '#B91C1C', borderWidth: 1, borderColor: '#E5E7EB' },
  urgency: { fontSize: 11, fontWeight: '700', color: '#B91C1C' },
  name: { fontSize: 16, fontWeight: '600', marginTop: 4, color: '#111827' },
  reason: { fontSize: 13, color: '#4B5563', marginVertical: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }
});
