import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { ChannelBadge } from '../../components/Badges';
import enquiries from '../../mock/enquiries.json';

const COLORS = {
  bg: '#F5F7FA', card: '#FFFFFF', primary: '#1A6BFA',
  text: '#111827', sub: '#6B7280', border: '#E5E7EB',
};

// Generate follow-up tasks from mock enquiries that have upcoming contact
const FOLLOWUP_TASKS = enquiries.map((e, i) => ({
  id: `fu_${e.id}`,
  enquiry_id: e.id,
  customer_name: e.customer_name,
  channel: e.channel,
  dueTime: new Date(Date.now() + (i + 1) * 25 * 60 * 1000).toISOString(),
  message_preview: e.suggested_response,
  status: 'pending',
}));

function FollowUpCard({ item, isDone, onDone }) {
  const due = new Date(item.dueTime);
  const isOverdue = due < new Date() && !isDone;

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={[styles.name, isDone && styles.textDone]}>{item.customer_name}</Text>
          <View style={styles.channelRow}>
            <ChannelBadge channel={item.channel} />
          </View>
        </View>
        <View style={[styles.duePill, isOverdue && styles.duePillOverdue, isDone && styles.duePillDone]}>
          <Text style={[styles.dueText, isOverdue && styles.dueTextOverdue, isDone && styles.dueTextDone]}>
            {isDone ? '✓ Done' : isOverdue ? '⚠ Overdue' : `Due ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </Text>
        </View>
      </View>

      {item.message_preview ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Message Preview</Text>
          <Text style={[styles.previewText, isDone && styles.textDone]} numberOfLines={2}>
            {item.message_preview}
          </Text>
        </View>
      ) : null}

      {!isDone && (
        <TouchableOpacity style={styles.doneBtn} onPress={() => onDone(item.id)}>
          <Text style={styles.doneBtnText}>Mark as Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🎉</Text>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySub}>No follow-ups pending right now.</Text>
    </View>
  );
}

export default function FollowUpsScreen() {
  const [done, setDone] = useState([]);

  const pending = FOLLOWUP_TASKS.filter(t => !done.includes(t.id));
  const completed = FOLLOWUP_TASKS.filter(t => done.includes(t.id));

  function handleDone(id) {
    setDone(prev => [...prev, id]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {pending.length} pending · {completed.length} completed
        </Text>
      </View>

      <FlatList
        data={[...pending, ...completed]}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FollowUpCard
            item={item}
            isDone={done.includes(item.id)}
            onDone={handleDone}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  summary: { paddingHorizontal: 16, paddingVertical: 8 },
  summaryText: { fontSize: 13, color: COLORS.sub },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  cardDone: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  textDone: { textDecorationLine: 'line-through', color: COLORS.sub },
  channelRow: {},
  duePill: {
    backgroundColor: '#EEF4FF', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  duePillOverdue: { backgroundColor: '#FEF2F2' },
  duePillDone: { backgroundColor: '#F0FDF4' },
  dueText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  dueTextOverdue: { color: '#EF4444' },
  dueTextDone: { color: '#15803D' },
  previewBox: {
    backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginBottom: 12,
  },
  previewLabel: { fontSize: 10, fontWeight: '700', color: COLORS.sub, textTransform: 'uppercase', marginBottom: 3 },
  previewText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  doneBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.sub, marginTop: 6 },
});