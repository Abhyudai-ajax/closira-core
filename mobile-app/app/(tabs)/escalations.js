import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import enquiries from '../../mock/enquiries.json';
import { ChannelBadge } from '../../components/Badges';

const COLORS = {
  bg: '#F5F7FA', card: '#FFFFFF', danger: '#EF4444',
  warning: '#F59E0B', text: '#111827', sub: '#6B7280',
};

const URGENCY_CONFIG = {
  High: { color: '#EF4444', bg: '#FEF2F2', label: '🔴 High' },
  Medium: { color: '#F59E0B', bg: '#FFFBEB', label: '🟡 Medium' },
  Low: { color: '#6B7280', bg: '#F9FAFB', label: '⚪ Low' },
};

function EscalationCard({ item, onResolve, onPress }) {
  const urgency = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.Medium;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Urgency strip */}
      <View style={[styles.urgencyStrip, { backgroundColor: urgency.bg }]}>
        <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
        <Text style={styles.cardTime}>
          {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <View style={styles.channelRow}>
          <ChannelBadge channel={item.channel} />
        </View>
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Reason</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
        <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
      </View>

      <TouchableOpacity
        style={styles.resolveBtn}
        onPress={() => onResolve(item.id)}
      >
        <Text style={styles.resolveBtnText}>✓  Mark Resolved</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>✅</Text>
      <Text style={styles.emptyTitle}>No active escalations</Text>
      <Text style={styles.emptySub}>All enquiries are being handled. Great work!</Text>
    </View>
  );
}

export default function EscalationsScreen() {
  const router = useRouter();
  const [resolved, setResolved] = useState([]);

  const escalations = enquiries
    .filter(e => e.status === 'Escalated' && !resolved.includes(e.id))
    .sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return (order[a.urgency] ?? 1) - (order[b.urgency] ?? 1);
    });

  function handleResolve(id) {
    Alert.alert('Resolve Escalation', 'Mark this escalation as resolved?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Resolve', style: 'default',
        onPress: () => setResolved(prev => [...prev, id]),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <Text style={styles.headerCount}>
          {escalations.length} active escalation{escalations.length !== 1 ? 's' : ''}
        </Text>
        {escalations.some(e => e.urgency === 'High') && (
          <View style={styles.alertPill}>
            <Text style={styles.alertPillText}>🔴 Needs Attention</Text>
          </View>
        )}
      </View>

      <FlatList
        data={escalations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <EscalationCard
            item={item}
            onResolve={handleResolve}
            onPress={() => router.push({ pathname: '/Detail', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headerCount: { fontSize: 13, color: COLORS.sub, fontWeight: '500' },
  alertPill: {
    backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#FECACA',
  },
  alertPillText: { fontSize: 12, color: COLORS.danger, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 12,
    overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6,
  },
  urgencyStrip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  urgencyText: { fontSize: 12, fontWeight: '700' },
  cardTime: { fontSize: 12, color: COLORS.sub },
  cardBody: { padding: 14 },
  customerName: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  channelRow: { marginBottom: 10 },
  reasonBox: {
    backgroundColor: '#FFF7ED', borderRadius: 8, padding: 10, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  reasonLabel: { fontSize: 10, fontWeight: '700', color: COLORS.warning, textTransform: 'uppercase', marginBottom: 2 },
  reasonText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  summary: { fontSize: 13, color: COLORS.sub, lineHeight: 18 },
  resolveBtn: {
    backgroundColor: '#F0FDF4', paddingVertical: 12, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#DCFCE7',
  },
  resolveBtnText: { color: '#15803D', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.sub, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
});