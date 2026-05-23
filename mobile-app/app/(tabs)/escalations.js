import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { MOCK_DATA } from '../../mock/mockApi';
import { ChannelBadge } from '../../components/StatusBadge';

export default function EscalationsScreen() {
  const [escalations, setEscalations] = useState(
    MOCK_DATA.enquiries.filter(e => e.status === 'escalated')
  );

  const handleResolve = (id) => {
    setEscalations(prev => prev.filter(item => item.id !== id));
    Alert.alert("Pipeline Action", "Enquiry marked as resolved. Human handoff loop safely closed.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Agent Hand-offs</Text>
      <Text style={styles.caption}>Anomalies requiring high-priority human override actions.</Text>

      <FlatList
        data={escalations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.customer_name}</Text>
              <View style={[styles.urgencyDot, { backgroundColor: item.urgency === 'high' ? '#EF4444' : '#F59E0B' }]} />
            </View>
            
            <Text style={styles.reasonLabel}>Escalation Trigger Reason:</Text>
            <Text style={styles.reasonText}>{item.escalation_reason || 'Unmapped signature breakdown'}</Text>
            
            <View style={[styles.row, { marginTop: 12 }]}>
              <ChannelBadge channel={item.channel} />
              <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
                <Text style={styles.btnText}>Mark Resolved</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 24 },
  caption: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  alertCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 12, borderColor: '#FECACA', borderWidth: 1, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  urgencyDot: { width: 10, height: 10, borderRadius: 5 },
  reasonLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: 10 },
  reasonText: { fontSize: 13, color: '#DC2626', fontWeight: '500', marginTop: 2 },
  resolveBtn: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }
});
