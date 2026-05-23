import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import { ChannelBadge, StatusBadge } from '../components/Badges';

export default function DetailScreen({ route }) {
  const { item } = route.params;
  const [status, setStatus] = useState(item.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.customer_name}</Text>
        <View style={styles.badgeRow}>
          <ChannelBadge channel={item.channel} />
          <StatusBadge status={status} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>AI Context Summary</Text>
        <Text style={styles.body}>{item.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Matched Business SOP Path</Text>
        <Text style={[styles.body, {fontWeight: 'bold', color: '#1D4ED8'}]}>{item.matched_sop}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Suggested Smart Auto-Reply</Text>
        <Text style={styles.replyBox}>"{item.suggested_response}"</Text>
      </View>

      {status === 'Escalated' && (
        <View style={styles.actionSection}>
          <Button title="Resolve Escalation" color="#15803D" onPress={() => setStatus('Qualified')} />
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  headerRow: { borderBottomWidth: 1, borderColor: '#E5E7EB', paddingBottom: 12, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  badgeRow: { flexDirection: 'row', marginTop: 8 },
  section: { marginVertical: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' },
  body: { fontSize: 14, color: '#111827', marginTop: 4 },
  replyBox: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 6, fontStyle: 'italic', marginTop: 4, color: '#374151' },
  actionSection: { marginTop: 24, paddingBottom: 40 }
});
