import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import enquiries from '../../mock/enquiries.json';
import { ChannelBadge, StatusBadge } from '../../components/Badges';

const COLORS = {
  bg: '#F5F7FA', card: '#FFFFFF', primary: '#1A6BFA',
  text: '#111827', sub: '#6B7280', border: '#E5E7EB',
};

const STATUS_FILTERS = ['All', 'New', 'Qualified', 'Escalated'];

function LeadCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTop}>
        <Text style={styles.name}>{item.customer_name}</Text>
        <Text style={styles.time}>
          {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      <View style={styles.cardBottom}>
        <ChannelBadge channel={item.channel} />
        <StatusBadge status={item.status} />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ filter }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No leads found</Text>
      <Text style={styles.emptySub}>
        {filter === 'All'
          ? 'New enquiries will appear here as they come in.'
          : `No "${filter}" leads right now.`}
      </Text>
    </View>
  );
}

export default function LeadsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = enquiries.filter(e => {
    const matchFilter = activeFilter === 'All' || e.status === activeFilter;
    const matchSearch = e.customer_name.toLowerCase().includes(search.toLowerCase())
      || e.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search leads..."
          placeholderTextColor={COLORS.sub}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <Text style={styles.count}>{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LeadCard
            item={item}
            onPress={() => router.push({ pathname: '/Detail', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={<EmptyState filter={activeFilter} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    marginHorizontal: 16, marginTop: 12, marginBottom: 10, borderRadius: 10,
    paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, color: COLORS.text, fontSize: 14 },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  filterActive: { backgroundColor: '#1A6BFA', borderColor: '#1A6BFA' },
  filterText: { fontSize: 13, color: COLORS.sub, fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  count: { fontSize: 12, color: COLORS.sub, paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  time: { fontSize: 12, color: COLORS.sub },
  message: { fontSize: 13, color: COLORS.sub, marginBottom: 10, lineHeight: 18 },
  cardBottom: { flexDirection: 'row', gap: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.sub, textAlign: 'center', marginTop: 6, paddingHorizontal: 32 },
});