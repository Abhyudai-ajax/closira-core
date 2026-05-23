import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import enquiries from '../mock/enquiries.json';
import { ChannelBadge, StatusBadge } from '../components/Badges';

const COLORS = {
  bg: '#F5F7FA', card: '#FFFFFF', primary: '#1A6BFA',
  text: '#111827', sub: '#6B7280', border: '#E5E7EB',
  success: '#10B981', warning: '#F59E0B',
};

const TIMELINE_ICONS = {
  'Enquiry Ingested': '📥',
  'Missed Call Logged': '📞',
  'Email Received': '📧',
  default: '🔹',
};

function TimelineItem({ event, timestamp, isLast }) {
  const icon = TIMELINE_ICONS[event] || TIMELINE_ICONS.default;
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDotCol}>
        <View style={styles.timelineDot}>
          <Text style={{ fontSize: 10 }}>{icon}</Text>
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineEvent}>{event}</Text>
        <Text style={styles.timelineTime}>{time}</Text>
      </View>
    </View>
  );
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const enquiry = enquiries.find(e => e.id === id);

  if (!enquiry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Enquiry not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversation Detail</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <View style={styles.section}>
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{enquiry.customer_name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{enquiry.customer_name}</Text>
              <View style={styles.badgeRow}>
                <ChannelBadge channel={enquiry.channel} />
                <StatusBadge status={enquiry.status} />
              </View>
            </View>
            <Text style={styles.receivedTime}>
              {new Date(enquiry.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Message Thread */}
        <Text style={styles.sectionLabel}>Message</Text>
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{enquiry.message}</Text>
        </View>

        {/* SOP Match */}
        {enquiry.matched_sop && (
          <>
            <Text style={styles.sectionLabel}>SOP Match</Text>
            <View style={[styles.infoCard, { borderLeftColor: COLORS.success }]}>
              <Text style={styles.sopLabel}>{enquiry.matched_sop}</Text>
            </View>
          </>
        )}

        {/* AI Summary */}
        {enquiry.summary && (
          <>
            <Text style={styles.sectionLabel}>AI Summary</Text>
            <View style={[styles.infoCard, { borderLeftColor: COLORS.primary }]}>
              <Text style={styles.summaryText}>{enquiry.summary}</Text>
            </View>
          </>
        )}

        {/* Suggested Response */}
        {enquiry.suggested_response && (
          <>
            <Text style={styles.sectionLabel}>Suggested Response</Text>
            <View style={[styles.infoCard, { borderLeftColor: COLORS.warning, backgroundColor: '#FFFBEB' }]}>
              <Text style={styles.suggestionText}>{enquiry.suggested_response}</Text>
            </View>
          </>
        )}

        {/* Status Timeline */}
        <Text style={styles.sectionLabel}>Status Timeline</Text>
        <View style={styles.timelineCard}>
          {enquiry.timeline.map((item, index) => (
            <TimelineItem
              key={index}
              event={item.event}
              timestamp={item.timestamp}
              isLast={index === enquiry.timeline.length - 1}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.card,
  },
  backBtn: {},
  backBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1, paddingHorizontal: 16 },
  section: { marginTop: 16 },
  customerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EEF4FF', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  customerName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  receivedTime: { fontSize: 12, color: COLORS.sub },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.sub, textTransform: 'uppercase',
    letterSpacing: 0.5, marginTop: 20, marginBottom: 8,
  },
  messageBubble: {
    backgroundColor: '#EEF4FF', borderRadius: 14, padding: 14,
    borderTopLeftRadius: 4,
  },
  messageText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  infoCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    borderLeftWidth: 4,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
  },
  sopLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  summaryText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  suggestionText: { fontSize: 14, color: '#92400E', lineHeight: 20 },
  timelineCard: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineDotCol: { alignItems: 'center', width: 28 },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineEvent: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  timelineTime: { fontSize: 12, color: COLORS.sub, marginTop: 2 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.sub },
  backLink: { color: COLORS.primary, fontSize: 15, marginTop: 12, fontWeight: '600' },
});