import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ChannelBadge({ channel }) {
  let bgColor = '#FEF3C7', textColor = '#D97706'; // Call / Default: Amber
  if (channel.toLowerCase() === 'whatsapp') { bgColor = '#DCFCE7'; textColor = '#15803D'; } // Green
  if (channel.toLowerCase() === 'email') { bgColor = '#DBEAFE'; textColor = '#1D4ED8'; } // Blue

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{channel}</Text>
    </View>
  );
}

export function StatusBadge({ status }) {
  let bgColor = '#DBEAFE', textColor = '#1D4ED8'; // New: Blue
  if (status.toLowerCase() === 'qualified') { bgColor = '#DCFCE7'; textColor = '#15803D'; } // Green
  if (status.toLowerCase() === 'escalated') { bgColor = '#FEE2E2'; textColor = '#B91C1C'; } // Red

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6 },
  text: { fontSize: 11, fontWeight: '700' }
});
