// App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 配置通知
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 图标组件 (使用 Expo Vector Icons)
const IconBook = () => <Text style={styles.icon}>📚</Text>;
const IconClock = () => <Text style={styles.icon}>⏰</Text>;
const IconBell = () => <Text style={styles.icon}>🔔</Text>;
const IconCalendar = () => <Text style={styles.icon}>📅</Text>;
const IconPhone = () => <Text style={styles.icon}>📞</Text>;
const IconSettings = () => <Text style={styles.icon}>⚙️</Text>;
const IconUser = () => <Text style={styles.icon}>👤</Text>;
const IconMail = () => <Text style={styles.icon}>📧</Text>;
const IconWarning = () => <Text style={styles.icon}>⚠️</Text>;
const IconCheck = () => <Text style={styles.icon}>✅</Text>;
const IconLocation = () => <Text style={styles.icon}>📍</Text>;

const App = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState('home');
  const [userType, setUserType] = useState('student'); // 'student' or 'parent'
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 初始化应用
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType');
      const storedAuth = await AsyncStorage.getItem('isAuthorized');
      
      if (storedUserType) setUserType(storedUserType);
      if (storedAuth) setIsAuthorized(JSON.parse(storedAuth));
      
      // 加载模拟数据
      loadMockData();
    } catch (error) {
      console.error('初始化失败:', error);
    }
  };

  const loadMockData = () => {
    const mockEvents = [
      {
        id: '1',
        type: 'class_event',
        title: 'Advanced Statistics Lecture',
        course: 'STAT7001',
        start_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        location: 'Room 301, Math Building',
        confidence: 0.95,
        status: 'new',
      },
      {
        id: '2',
        type: 'assignment_due',
        title: 'Machine Learning Coursework 1',
        course: 'CS7012',
        due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        link: 'https://moodle.university.edu',
        confidence: 0.92,
        status: 'new',
      },
      {
        id: '3',
        type: 'system_notice',
        title: 'Library System Maintenance',
        start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        confidence: 0.98,
        status: 'new',
      },
    ];
    setEvents(mockEvents);
  };

  // 邮箱授权
  const handleEmailAuth = async () => {
    // 这里应该集成真实的 OAuth 流程
    Alert.alert(
      '授权邮箱',
      '选择你的邮箱提供商',
      [
        {
          text: 'Gmail',
          onPress: () => authorizeEmail('gmail'),
        },
        {
          text: 'Outlook',
          onPress: () => authorizeEmail('outlook'),
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  const authorizeEmail = async (provider) => {
    try {
      // 模拟授权过程
      setTimeout(() => {
        setIsAuthorized(true);
        AsyncStorage.setItem('isAuthorized', 'true');
        AsyncStorage.setItem('emailProvider', provider);
        Alert.alert('授权成功', '正在同步邮件数据...');
      }, 1000);
    } catch (error) {
      Alert.alert('授权失败', error.message);
    }
  };

  // 格式化时间
  const formatTimeRemaining = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return '已过期';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天后`;
    if (hours > 0) return `${hours}小时后`;
    return '即将到期';
  };

  // 事件卡片组件
  const EventCard = ({ event }) => {
    const getEventIcon = (type) => {
      switch (type) {
        case 'class_event':
          return <IconBook />;
        case 'assignment_due':
          return <IconClock />;
        case 'system_notice':
          return <IconBell />;
        default:
          return <IconCalendar />;
      }
    };

    const getEventColor = (type) => {
      switch (type) {
        case 'class_event':
          return ['#8B5CF6', '#6366F1'];
        case 'assignment_due':
          return ['#EF4444', '#EC4899'];
        case 'system_notice':
          return ['#F59E0B', '#FB923C'];
        default:
          return ['#8B5CF6', '#6366F1'];
      }
    };

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventIconContainer}>
            <LinearGradient
              colors={getEventColor(event.type)}
              style={styles.eventIconGradient}
            >
              {getEventIcon(event.type)}
            </LinearGradient>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            {event.course && (
              <Text style={styles.eventCourse}>{event.course}</Text>
            )}
          </View>
          {event.confidence < 0.8 && (
            <View style={styles.confidenceBadge}>
              <IconWarning />
              <Text style={styles.confidenceText}>待确认</Text>
            </View>
          )}
        </View>

        <View style={styles.eventDetails}>
          {event.due_at && (
            <View style={styles.eventDetail}>
              <IconClock />
              <Text style={styles.eventDetailText}>
                截止: {formatTimeRemaining(event.due_at)}
              </Text>
            </View>
          )}
          
          {event.start_at && (
            <View style={styles.eventDetail}>
              <IconCalendar />
              <Text style={styles.eventDetailText}>
                {new Date(event.start_at).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
          
          {event.location && (
            <View style={styles.eventDetail}>
              <IconLocation />
              <Text style={styles.eventDetailText}>{event.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.eventActions}>
          <TouchableOpacity style={styles.primaryButton}>
            <IconCalendar />
            <Text style={styles.primaryButtonText}>加入日历</Text>
          </TouchableOpacity>
          
          {event.link && (
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>打开链接</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.successButton}>
            <IconCheck />
            <Text style={styles.successButtonText}>完成</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 引导页面
  const OnboardingScreen = () => (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        style={styles.onboardingGradient}
      >
        <View style={styles.onboardingContent}>
          <Text style={styles.onboardingTitle}>留学生家校通</Text>
          <Text style={styles.onboardingSubtitle}>
            智能解析邮件，不错过任何重要信息
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconBook />
              <Text style={styles.featureText}>自动生成课表</Text>
            </View>
            <View style={styles.featureItem}>
              <IconClock />
              <Text style={styles.featureText}>DDL 智能提醒</Text>
            </View>
            <View style={styles.featureItem}>
              <IconUser />
              <Text style={styles.featureText}>家长同步摘要</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.authButton}
            onPress={handleEmailAuth}
          >
            <Text style={styles.authButtonText}>授权邮箱开始使用</Text>
          </TouchableOpacity>

          <View style={styles.userTypeSwitch}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'student' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('student')}
            >
              <Text
                style={[
                  styles.userTypeButtonText,
                  userType === 'student' && styles.userTypeButtonTextActive,
                ]}
              >
                学生
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'parent' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('parent')}
            >
              <Text
                style={[
                  styles.userTypeButtonText,
                  userType === 'parent' && styles.userTypeButtonTextActive,
                ]}
              >
                家长
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );

  // 学生主页
  const StudentHomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* 顶部状态栏 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.avatar}
          >
            <IconUser />
          </LinearGradient>
          <View>
            <Text style={styles.userName}>张同学</Text>
            <Text style={styles.userLocation}>
              {currentTime.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              伦敦时间
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <IconBell />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <IconSettings />
          </TouchableOpacity>
        </View>
      </View>

      {/* 主内容区 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 今日概览卡片 */}
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          style={styles.overviewCard}
        >
          <Text style={styles.overviewTitle}>今日概览</Text>
          <Text style={styles.overviewSubtitle}>
            你今天有 {events.length} 个重要事项需要关注
          </Text>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <IconBook />
              <Text style={styles.overviewStatText}>2 节课</Text>
            </View>
            <View style={styles.overviewStat}>
              <IconClock />
              <Text style={styles.overviewStatText}>1 个DDL</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 事件卡片列表 */}
        <View style={styles.eventsList}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>

        {events.length === 0 && (
          <View style={styles.emptyState}>
            <IconMail />
            <Text style={styles.emptyStateTitle}>正在扫描邮件</Text>
            <Text style={styles.emptyStateSubtitle}>
              已为你扫描最近 30 天的邮件，卡片将很快出现
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 悬浮按钮 */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 底部导航栏 */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', icon: IconBook, label: '首页' },
          { id: 'calendar', icon: IconCalendar, label: '日历' },
          { id: 'inbox', icon: IconMail, label: '收件箱', badge: true },
          { id: 'emergency', icon: IconPhone, label: '紧急联系' },
          { id: 'settings', icon: IconSettings, label: '设置' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <View style={styles.tabIconContainer}>
              <tab.icon />
              {tab.badge && <View style={styles.tabBadge} />}
            </View>
            <Text
              style={[
                styles.tabLabel,
                selectedTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );

  // 家长端主页
  const ParentHomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.avatar}
          >
            <IconUser />
          </LinearGradient>
          <View>
            <Text style={styles.userName}>家长端</Text>
            <Text style={styles.userLocation}>监护人视图</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* 孩子状态卡片 */}
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          style={styles.childCard}
        >
          <View style={styles.childInfo}>
            <Text style={styles.childAvatar}>👨‍🎓</Text>
            <View>
              <Text style={styles.childName}>张小明</Text>
              <Text style={styles.childUniversity}>伦敦大学学院</Text>
            </View>
          </View>
          
          <View style={styles.childStats}>
            <View style={styles.childStat}>
              <Text style={styles.childStatLabel}>本周课程</Text>
              <Text style={styles.childStatValue}>12</Text>
            </View>
            <View style={styles.childStat}>
              <Text style={styles.childStatLabel}>待完成</Text>
              <Text style={styles.childStatValue}>3</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 可见性说明 */}
        <View style={styles.visibilityNotice}>
          <Text style={styles.visibilityTitle}>可见性说明</Text>
          <Text style={styles.visibilityText}>
            张小明 已将可见级别设置为摘要可见。你将看到课程时间与标题、DDL 标题与到期时间，但不会看到邮件正文或详细链接。
          </Text>
        </View>

        {/* 紧急联系 */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>紧急联系</Text>
          
          <TouchableOpacity style={styles.emergencyButton}>
            <View style={styles.emergencyButtonContent}>
              <View style={styles.emergencyIcon}>
                <IconPhone />
              </View>
              <View>
                <Text style={styles.emergencyLabel}>呼叫 张小明</Text>
                <Text style={styles.emergencySubLabel}>一键拨号</Text>
              </View>
            </View>
            <Text style={styles.emergencyArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // 主渲染
  if (!isAuthorized) {
    return <OnboardingScreen />;
  }

  return userType === 'student' ? <StudentHomeScreen /> : <ParentHomeScreen />;
};

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // 引导页样式
  onboardingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 48,
  },
  featureList: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
  },
  authButton: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  userTypeSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  userTypeButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  userTypeButtonActive: {
    backgroundColor: 'white',
  },
  userTypeButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  userTypeButtonTextActive: {
    color: '#8B5CF6',
  },

  // 头部样式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },

  // 内容区样式
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  overviewStats: {
    flexDirection: 'row',
    gap: 24,
  },
  overviewStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStatText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },

  // 事件卡片样式
  eventsList: {
    gap: 16,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventIconContainer: {
    marginRight: 12,
  },
  eventIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventCourse: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D97706',
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  successButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },

  // 空状态样式
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // 悬浮按钮样式
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

  // 底部导航样式
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  tabButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: 'white',
  },

  // 家长端样式
  childCard: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  childAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  childUniversity: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  childStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  childStat: {
    alignItems: 'center',
  },
  childStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  childStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

  // 可见性说明样式
  visibilityNotice: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  visibilityText: {
    fontSize: 14,
    color: '#1D4ED8',
    lineHeight: 20,
  },

  // 紧急联系样式
  emergencyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  emergencySubLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  emergencyArrow: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: 'bold',
  },

  // 图标样式
  icon: {
    fontSize: 20,
  },
});

export default App;