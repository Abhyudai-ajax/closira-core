import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import data from '../../mock/enquiries.json';

export default function FollowUpsScreen() {
  // Use a simple state map to track completed tasks locally for interactive fidelity
  const [completedTasks, setCompletedTasks] = useState({});

  const toggleComplete = (id) => {
    setCompletedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scheduled Follow-Up Tasks</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isDone = !!completedTasks[item.id];
          return (
            <View style={[styles.card, isDone && styles.cardDone]}>
              <View style={styles.headerRow}>
                <Text style={[styles.name, isDone && styles.textMuted]}>{item.customer_name}</Text>
                <Text style={styles.time}>Due: Today at 4:00 PM</Text>
              </View>
              
              <Text style={styles.label}>Scheduled Template Preview:</Text>
              <Text style={[styles.preview, isDone && styles.textMuted]}>
                "{item.suggested_response}"
              </Text>

              <TouchableOpacity 
                style={[styles.btn, isDone ? styles.btnDone : styles.btnActive]} 
                onPress={() => toggleComplete(item.id)}
              >
                <Text style={styles.btnText}>{isDone ? '✓ Completed' : 'Mark as Done'}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#111827' },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginVertical: 6, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  cardDone: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', opacity: 0.8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, fontWeight: '600', color: '#D97706' },
  label: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 2 },
  preview: { fontSize: 13, color: '#4B5563', fontStyle: 'italic', marginBottom: 12 },
  textMuted: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  btn: { paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnActive: { backgroundColor: '#1D4ED8' },
  btnDone: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#FFF', fontWeight: '600', fontSize: 13 }
});
