import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ChannelBadge = ({ channel }) => {
  const getStyle = () => {
    switch(channel.toLowerCase()) {
      case 'whatsapp': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'email': return { bg: '#E3F2FD', text: '#1565C0' };
      case 'call': return { bg: '#FFF8E1', text: '#FF8F00' };
      default: return { bg: '#F5F5F5', text: '#616161' };
    }
  };
  const styles = getStyle();
  return (
    <View style={[viewStyles.badge, { backgroundColor: styles.bg }]}>
      <Text style={[viewStyles.text, { color: styles.text }]}>{channel}</Text>
    </View>
  );
};

export const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch(status.toLowerCase()) {
      case 'qualified': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'new': return { bg: '#E3F2FD', text: '#1565C0' };
      case 'escalated': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#F5F5F5', text: '#616161' };
    }
  };
  const styles = getStyle();
  return (
    <View style={[viewStyles.badge, { backgroundColor: styles.bg, borderRadius: 4 }]}>
      <Text style={[viewStyles.text, { color: styles.text, fontWeight: '700', fontSize: 11 }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const viewStyles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' }
});
