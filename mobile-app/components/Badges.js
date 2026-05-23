import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─── Channel Badges ────────────────────────────────────────────────────────────
// WhatsApp → green  |  Email → blue  |  Call → amber
const CHANNEL_CONFIG = {
  WhatsApp: { bg: '#DCFCE7', text: '#15803D', label: '💬 WhatsApp' },
  Email: { bg: '#DBEAFE', text: '#1D4ED8', label: '✉️ Email' },
  email: { bg: '#DBEAFE', text: '#1D4ED8', label: '✉️ Email' },
  Call: { bg: '#FEF3C7', text: '#B45309', label: '📞 Call' },
  call: { bg: '#FEF3C7', text: '#B45309', label: '📞 Call' },
};

export function ChannelBadge({ channel }) {
  const config = CHANNEL_CONFIG[channel] ?? { bg: '#F3F4F6', text: '#6B7280', label: channel };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

// ─── Status Badges ─────────────────────────────────────────────────────────────
// New → blue  |  Qualified → green  |  Escalated → red
const STATUS_CONFIG = {
  New: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  new: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  Qualified: { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  qualified: { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  Escalated: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  escalated: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' };
  const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.badgeText, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3 },
});