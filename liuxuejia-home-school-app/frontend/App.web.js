import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>留学生家校通 App</Text>
      <Text style={styles.subtitle}>智能邮件解析与学业管理</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 课程卡片示例</Text>
        <Text style={styles.cardText}>STAT7001 统计学习</Text>
        <Text style={styles.cardText}>时间：2025-08-30 10:00</Text>
        <Text style={styles.cardText}>地点：Room A3</Text>
        <Text style={styles.cardText}>置信度：0.85</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 作业卡片示例</Text>
        <Text style={styles.cardText}>CS501 计算机网络作业</Text>
        <Text style={styles.cardText}>截止：2025-09-01 23:59</Text>
        <Text style={styles.cardText}>状态：进行中</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
});
