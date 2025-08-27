import React from 'react';
import { View, Text, FlatList } from 'react-native';

const mockEvents = [
  { id: '1', type: 'assignment_due', title: 'STAT7001 作业1', due_at: '2025-09-01 23:59', confidence: 0.9 },
  { id: '2', type: 'class_event', title: 'CS501 计算机网络', start_at: '2025-08-30 10:00', location: 'Room A3', confidence: 0.85 },
  { id: '3', type: 'system_notice', title: '系统维护公告', start_at: '2025-08-29 02:00', confidence: 0.7 }
];

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>智能卡片流</Text>
      <FlatList
        data={mockEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#f5f3ff', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
            <Text style={{ marginTop: 4, color: '#6b7280' }}>类型：{item.type}</Text>
            {item.due_at && <Text style={{ marginTop: 4 }}>截止：{item.due_at}</Text>}
            {item.start_at && <Text style={{ marginTop: 4 }}>时间：{item.start_at}</Text>}
            {item.location && <Text style={{ marginTop: 4 }}>地点：{item.location}</Text>}
            <Text style={{ marginTop: 6, fontSize: 12, color: '#9ca3af' }}>置信度：{item.confidence}</Text>
          </View>
        )}
      />
    </View>
  );
}


