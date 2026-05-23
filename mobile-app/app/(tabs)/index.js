import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import enquiries from '../../mock/enquiries.json';
import { ChannelBadge, StatusBadge } from '../../components/Badges';

const COLORS = {
  bg: '#F5F7FA',
  card: '#FFFFFF',
  primary: '#1A6BFA',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  text: '#111827',
  sub: '#6B7280',
  border: '#E5E7EB',
};

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const totalLeads = enquiries.length;
  const escalated = enquiries.filter(e => e.status === 'Escalated').length;
  const missed = enquiries.filter(e => e.missed === true).length;
  const followupsDue = enquiries.filter(e => e.status === 'New').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.subtitle}>Here's what's happening today</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>B</Text>
          </View>
        </View>

        {/* Stats — exactly matching spec: total leads, missed, escalations, follow-ups due */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Leads" value={totalLeads} color={COLORS.primary} />
          <StatCard label="Missed Enquiries" value={missed} color={COLORS.danger} />
          <StatCard label="Open Escalations" value={escalated} color={COLORS.warning} />
          <StatCard label="Follow-ups Due" value={followupsDue} color={COLORS.success} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]}
            onPress={() => router.push('/(tabs)/escalations')}
          >
            <Text style={styles.actionIcon}>🚨</Text>
            <Text style={[styles.actionLabel, { color: COLORS.danger }]}>Escalations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FEF9EE' }]}
            onPress={() => router.push('/(tabs)/followups')}
          >
            <Text style={styles.actionIcon}>⏰</Text>
            <Text style={[styles.actionLabel, { color: COLORS.warning }]}>Follow-ups</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#EEF4FF' }]}
            onPress={() => router.push('/(tabs)/leads')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionLabel, { color: COLORS.primary }]}>All Leads</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Feed */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {enquiries.map(enq => (
          <TouchableOpacity
            key={enq.id}
            style={styles.activityCard}
            onPress={() => router.push({ pathname: '/Detail', params: { id: enq.id } })}
            activeOpacity={0.7}
          >
            <View style={styles.activityTop}>
              <View style={styles.activityNameRow}>
                <Text style={styles.activityName}>{enq.customer_name}</Text>
                {enq.missed && (
                  <View style={styles.missedPill}>
                    <Text style={styles.missedText}>Missed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.activityTime}>
                {new Date(enq.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={styles.activityMsg} numberOfLines={1}>{enq.message}</Text>
            <View style={styles.activityBadges}>
              <ChannelBadge channel={enq.channel} />
              <StatusBadge status={enq.status} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 20, paddingBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.sub, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: COLORS.card, borderRadius: 12,
    padding: 14, borderTopWidth: 3, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  actionBtn: {
    flex: 1, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 6,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  activityCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  activityTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  activityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activityName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  missedPill: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  missedText: { fontSize: 10, fontWeight: '700', color: COLORS.danger },
  activityTime: { fontSize: 12, color: COLORS.sub },
  activityMsg: { fontSize: 13, color: COLORS.sub, marginBottom: 8 },
  activityBadges: { flexDirection: 'row', gap: 6 },
});