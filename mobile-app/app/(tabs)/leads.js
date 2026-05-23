import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ChannelBadge, StatusBadge } from '../../components/Badges';
import data from '../../mock/enquiries.json';

export default function LeadsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbound Pipeline Leads</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Detail', { item })}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.customer_name}</Text>
              <Text style={styles.time}>10m ago</Text>
            </View>
            <View style={styles.badgeRow}>
              <ChannelBadge channel={item.channel} />
              <StatusBadge status={item.status} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#111827' },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#9CA3AF' },
  badgeRow: { flexDirection: 'row', marginTop: 8 }
});
