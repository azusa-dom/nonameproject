// server.js - 主服务器文件
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const compromise = require('compromise');
const natural = require('natural');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB 连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-home-school', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB 连接成功')).catch(err => console.error('MongoDB 连接失败:', err));

// 数据模型
const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  userType: { type: String, enum: ['student', 'parent', 'teacher', 'admin'], required: true },
  emailProvider: { type: String, enum: ['gmail', 'outlook'] },
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  timezone: { type: String, default: 'UTC' },
  parentBindingCode: String,
  children: [{ type: String, ref: 'User' }], // 家长关联的学生
  parents: [{ type: String, ref: 'User' }], // 学生关联的家长
  createdAt: { type: Date, default: Date.now },
  lastSyncAt: Date,
  settings: {
    notifications: { type: Boolean, default: true },
    quietHours: { start: { type: String, default: '23:00' }, end: { type: String, default: '08:00' } },
  },
});

const EventSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['class_event', 'assignment_due', 'system_notice', 'activity', 'recruitment', 'grade_notification', 'school_notification', 'visa_info'],
    required: true 
  },
  title: { type: String, required: true },
  course: String,
  start_at: Date,
  end_at: Date,
  due_at: Date,
  location: String,
  link: String,
  description: String,
  source: {
    provider: String,
    message_id: String,
    thread_id: String,
    subject: String,
  },
  confidence: { type: Number, min: 0, max: 1, default: 0.5 },
  visibility: {
    parent: { type: String, enum: ['hidden', 'summary_only', 'full'], default: 'summary_only' },
    teacher: { type: String, enum: ['hidden', 'summary_only', 'full'], default: 'hidden' },
  },
  status: { type: String, enum: ['new', 'confirmed', 'completed', 'dismissed'], default: 'new' },
  feedback: {
    corrected_fields: Object,
    user_rating: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventSchema);

// Azure AD 配置
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    authority: 'https://login.microsoftonline.com/common',
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 'Info',
    },
  },
};

const msalClient = new ConfidentialClientApplication(msalConfig);

// Google OAuth 配置
const googleAuth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// JWT 中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: '未提供令牌' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: '无效令牌' });
    req.user = user;
    next();
  });
};

// AI 解析函数
class EmailParser {
  constructor() {
    this.classPatterns = [
      /(?:lecture|class|seminar|tutorial|lab)\s*:?\s*([A-Z]{2,4}\d{3,4})\s*[-–]?\s*(.+?)(?:\s+at\s+(\d{1,2}:\d{2}|\d{1,2}\s*[ap]m))?/gi,
      /(?:course|subject)\s*:?\s*([A-Z]{2,4}\d{3,4})\s*[-–]?\s*(.+?)(?:\n|$)/gi,
    ];

    this.assignmentPatterns = [
      /(?:assignment|homework|coursework|essay|project)\s*:?\s*(.+?)(?:\s+due\s+(?:on\s+)?(.+?))?(?:\n|$)/gi,
      /(?:due|deadline|submit(?:ted)?)\s*:?\s*(.+?)(?:\s+(?:by|before|on)\s+(.+?))?(?:\n|$)/gi,
    ];

    this.timePatterns = [
      /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/gi,
      /\b(\d{1,2})\s*(am|pm)\b/gi,
    ];

    this.datePatterns = [
      /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/gi,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})?\b/gi,
      /\b(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})\b/g,
    ];

    this.locationPatterns = [
      /(?:room|lecture hall|building|venue|location)\s*:?\s*([A-Z]?\d+[A-Z]?\s*,?\s*.+?)(?:\n|$)/gi,
      /\bat\s+([A-Z][A-Za-z\s]+(?:Building|Hall|Room|Centre|Center))/gi,
    ];

    this.linkPatterns = [
      /(https?:\/\/[^\s<>"']+)/gi,
    ];
  }

  parseEmail(email) {
    const content = email.body?.content || email.body || '';
    const subject = email.subject || '';
    const fullText = `${subject}\n${content}`.toLowerCase();

    const doc = compromise(fullText);
    const type = this.classifyEmail(fullText);

    const extracted = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: this.extractTitle(subject, content, type),
      course: this.extractCourse(fullText),
      confidence: this.calculateConfidence(fullText, type),
      visibility: { parent: 'summary_only', teacher: 'hidden' },
      status: 'new',
      source: {
        provider: email.provider || 'unknown',
        message_id: email.id || email.messageId,
        thread_id: email.threadId || null,
        subject,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    switch (type) {
      case 'class_event':
        Object.assign(extracted, this.extractClassInfo(fullText));
        break;
      case 'assignment_due':
        Object.assign(extracted, this.extractAssignmentInfo(fullText));
        break;
      case 'system_notice':
        Object.assign(extracted, this.extractSystemInfo(fullText));
        break;
      case 'grade_notification':
        Object.assign(extracted, this.extractGradeInfo(fullText));
        break;
      case 'school_notification':
      case 'visa_info':
        Object.assign(extracted, this.extractNotificationInfo(fullText));
        break;
      case 'activity':
      case 'recruitment':
        Object.assign(extracted, this.extractActivityInfo(fullText));
        break;
    }

    extracted.location = this.extractLocation(fullText);
    extracted.link = this.extractLinks(content)[0] || null;
    extracted.description = doc.sentences().toString().substring(0, 200);

    return extracted;
  }

  classifyEmail(text) {
    const classifiers = {
      class_event: ['lecture', 'class', 'seminar', 'tutorial', 'lab', 'course'],
      assignment_due: ['assignment', 'homework', 'coursework', 'due', 'deadline', 'submit'],
      system_notice: ['maintenance', 'system', 'notice', 'announcement', 'update'],
      grade_notification: ['score', 'grade', 'result', 'mark'],
      school_notification: ['fee', 'tuition', 'payment', 'notice'],
      visa_info: ['visa', 'immigration', 'permit'],
      activity: ['event', 'workshop', 'seminar', 'conference', 'meeting'],
      recruitment: ['job', 'recruitment', 'career', 'fair'],
    };

    const scores = Object.keys(classifiers).reduce((acc, key) => {
      acc[key] = classifiers[key].filter(keyword => text.includes(keyword)).length;
      return acc;
    }, {});

    const maxScore = Math.max(...Object.values(scores));
    return maxScore === 0 ? 'system_notice' : Object.keys(scores).find(key => scores[key] === maxScore);
  }

  extractTitle(subject, content, type) {
    if (subject && subject.trim()) return subject.trim();
    const lines = content.split('\n').filter(line => line.trim());
    return lines[0]?.substring(0, 100) || `未知${type === 'class_event' ? '课程' : type === 'assignment_due' ? '作业' : '通知'}`;
  }

  extractCourse(text) { return text.match(/\b([A-Z]{2,4}\d{3,4})\b/)?.[1] || null; }

  extractClassInfo(text) {
    const info = {};
    const timeMatch = this.timePatterns[0].exec(text);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const isPM = timeMatch[3]?.toLowerCase() === 'pm';
      const date = new Date();
      date.setHours(isPM && hour !== 12 ? hour + 12 : hour);
      date.setMinutes(minute);
      info.start_at = date;
      info.end_at = new Date(date.getTime() + 2 * 60 * 60 * 1000); // 默认2小时
    }
    return info;
  }

  extractAssignmentInfo(text) {
    const info = {};
    const dueMatch = text.match(/(?:due|deadline)\s+(?:on\s+)?(.+?)(?:\n|$)/i);
    if (dueMatch) info.due_at = this.parseDate(dueMatch[1]);
    return info;
  }

  extractSystemInfo(text) {
    const info = {};
    const maintMatch = text.match(/(?:from|between)\s+(\d{1,2}:\d{2})\s*(?:to|and|-)\s*(\d{1,2}:\d{2})/i);
    if (maintMatch) {
      const start = this.parseTime(maintMatch[1], new Date());
      const end = this.parseTime(maintMatch[2], new Date());
      if (start && end) {
        info.start_at = start;
        info.end_at = end;
      }
    }
    return info;
  }

  extractGradeInfo(text) {
    const info = {};
    const scoreMatch = text.match(/score[:\s]*(\d{1,3})\/(\d{1,3})/i);
    if (scoreMatch) info.score = `${scoreMatch[1]}/${scoreMatch[2]}`;
    const feedbackMatch = text.match(/feedback[:\s]*(.+?)(?:\n|$)/i);
    if (feedbackMatch) info.feedback = feedbackMatch[1];
    return info;
  }

  extractNotificationInfo(text) {
    const info = {};
    const dueMatch = text.match(/(?:due|payment due)\s+(?:on\s+)?(.+?)(?:\n|$)/i);
    if (dueMatch) info.due_at = this.parseDate(dueMatch[1]);
    const amountMatch = text.match(/amount[:\s]*([\d,.]+)\s*(?:gbp|usd|eur)/i);
    if (amountMatch) info.amount = `${amountMatch[1]} ${amountMatch[2]?.toUpperCase() || 'GBP'}`;
    const detailsMatch = text.match(/details[:\s]*(.+?)(?:\n|$)/i);
    if (detailsMatch) info.details = detailsMatch[1];
    return info;
  }

  extractActivityInfo(text) {
    const info = {};
    const timeMatch = this.timePatterns[0].exec(text);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const isPM = timeMatch[3]?.toLowerCase() === 'pm';
      const date = new Date();
      date.setHours(isPM && hour !== 12 ? hour + 12 : hour);
      date.setMinutes(minute);
      info.start_at = date;
    }
    return info;
  }

  extractLocation(text) {
    for (let pattern of this.locationPatterns) {
      const match = pattern.exec(text);
      if (match) return match[1].trim();
    }
    return null;
  }

  extractLinks(text) { return (text.match(this.linkPatterns[0]) || []).map(link => link.trim()); }

  parseDate(dateString) { return moment(dateString, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'DD MMM YYYY', 'MMM DD, YYYY']).toDate() || null; }

  parseTime(timeString, baseDate) {
    const match = /(\d{1,2}):(\d{2})/.exec(timeString);
    if (match) {
      const date = new Date(baseDate);
      date.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
      return date;
    }
    return null;
  }

  calculateConfidence(text, type) {
    let confidence = 0.5;
    const keywords = {
      class_event: ['lecture', 'class', 'room', 'building'],
      assignment_due: ['due', 'deadline', 'submit', 'coursework'],
      system_notice: ['maintenance', 'system', 'notice'],
      grade_notification: ['score', 'grade', 'result'],
      school_notification: ['fee', 'tuition', 'payment'],
      visa_info: ['visa', 'immigration'],
      activity: ['event', 'workshop', 'seminar'],
      recruitment: ['job', 'recruitment', 'career'],
    };
    const typeKeywords = keywords[type] || [];
    confidence += (typeKeywords.filter(keyword => text.includes(keyword)).length * 0.1);
    if (this.timePatterns[0].test(text)) confidence += 0.2;
    if (/\b[A-Z]{2,4}\d{3,4}\b/.test(text)) confidence += 0.2;
    return Math.min(confidence, 1.0);
  }
}

const emailParser = new EmailParser();

// 辅助函数
async function syncUserEmails(userId) {
  const user = await User.findOne({ id: userId });
  if (!user || !user.accessToken || !user.emailProvider) return [];

  let client;
  if (user.emailProvider === 'outlook') {
    client = Client.init({
      authProvider: () => ({ accessToken: user.accessToken }),
    });
    const messages = await client.api('/me/mailFolders/inbox/messages').top(50).get();
    return await processEmails(messages.value, user.id, 'outlook');
  } else if (user.emailProvider === 'gmail') {
    const gmail = google.gmail({ version: 'v1', auth: googleAuth });
    const response = await gmail.users.messages.list({ userId: 'me', maxResults: 50 });
    const messages = await Promise.all(response.data.messages.map(async msg => {
      const msgDetail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
      return msgDetail.data;
    }));
    return await processEmails(messages, user.id, 'gmail');
  }
}

async function processEmails(messages, userId, provider) {
  const events = [];
  for (const email of messages) {
    const parsed = emailParser.parseEmail({ ...email, provider });
    parsed.userId = userId;
    const existingEvent = await Event.findOne({ 'source.message_id': parsed.source.message_id, userId });
    if (!existingEvent) {
      const event = new Event(parsed);
      await event.save();
      events.push(event);
    }
  }
  return events;
}

// API 路由

// 用户注册/登录
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, userType } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: '用户已存在' });

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const parentBindingCode = userType === 'student' ? Math.random().toString(36).substr(2, 6).toUpperCase() : null;

    const user = new User({
      id: userId,
      email,
      name,
      userType,
      parentBindingCode,
    });

    await user.save(); // 完成 save 调用
    const token = jwt.sign({ userId: user.id, userType }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        parentBindingCode: user.parentBindingCode,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 邮箱授权
app.post('/api/auth/email', authenticateToken, async (req, res) => {
  try {
    const { provider, authCode } = req.body;
    const user = await User.findOne({ id: req.user.userId });

    if (!user) return res.status(404).json({ error: '用户不存在' });

    let tokenData;
    if (provider === 'gmail') {
      const { tokens } = await googleAuth.getToken(authCode);
      tokenData = { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, tokenExpiry: new Date(tokens.expiry_date) };
    } else if (provider === 'outlook') {
      const tokenRequest = { code: authCode, scopes: ['https://graph.microsoft.com/mail.read'], redirectUri: process.env.AZURE_REDIRECT_URI };
      const response = await msalClient.acquireTokenByCode(tokenRequest);
      tokenData = { accessToken: response.accessToken, refreshToken: response.refreshToken, tokenExpiry: new Date(response.expiresOn) };
    }

    user.emailProvider = provider;
    user.accessToken = tokenData.accessToken;
    user.refreshToken = tokenData.refreshToken;
    user.tokenExpiry = tokenData.tokenExpiry;
    await user.save();

    setTimeout(() => syncUserEmails(user.id), 1000);
    res.json({ success: true, message: '邮箱授权成功' });
  } catch (error) {
    console.error('邮箱授权错误:', error);
    res.status(500).json({ error: '授权失败' });
  }
});

// 同步邮件
app.post('/api/sync-emails', authenticateToken, async (req, res) => {
  try {
    const events = await syncUserEmails(req.user.userId);
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error('同步邮件错误:', error);
    res.status(500).json({ error: '同步失败' });
  }
});

// 获取事件列表
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, visibility } = req.query;
    const query = { userId: req.user.userId };
    if (type) query.type = type;
    if (status) query.status = status;

    let events = await Event.find(query)
      .sort({ createdAt: -1, start_at: 1, due_at: 1 })
      .limit(parseInt(limit));

    if (req.user.userType === 'parent') {
      events = events.map(event => {
        const visibleFields = {
          id: event.id,
          type: event.type,
          title: event.title,
          course: event.course,
          start_at: event.start_at,
          end_at: event.end_at,
          due_at: event.due_at,
          status: event.status,
        };
        if (event.visibility.parent === 'summary_only') {
          return visibleFields;
        } else if (event.visibility.parent === 'full') {
          return event.toObject();
        }
        return null;
      }).filter(Boolean);
    }

    res.json(events);
  } catch (error) {
    console.error('获取事件错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 更新事件状态
app.put('/api/events/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    const event = await Event.findOne({ id: eventId, userId: req.user.userId });
    if (!event) return res.status(404).json({ error: '事件不存在' });

    Object.assign(event, updates);
    event.updatedAt = new Date();
    await event.save();

    res.json(event);
  } catch (error) {
    console.error('更新事件错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 家长绑定
app.post('/api/parent/bind', authenticateToken, async (req, res) => {
  try {
    const { bindingCode } = req.body;
    if (req.user.userType !== 'parent') return res.status(400).json({ error: '只有家长可以绑定孩子' });

    const student = await User.findOne({ parentBindingCode: bindingCode });
    if (!student) return res.status(404).json({ error: '无效绑定码' });

    if (!student.parents) student.parents = [];
    if (!student.parents.includes(req.user.userId)) {
      student.parents.push(req.user.userId);
      await student.save();
    }

    if (!req.user.children) req.user.children = [];
    if (!req.user.children.includes(student.id)) {
      req.user.children.push(student.id);
      await User.findOneAndUpdate({ id: req.user.userId }, req.user);
    }

    res.json({ success: true, message: '绑定成功' });
  } catch (error) {
    console.error('家长绑定错误:', error);
    res.status(500).json({ error: '绑定失败' });
  }
});

// 获取用户设置
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(404).json({ error: '用户不存在' });

    res.json({
      notifications: user.settings.notifications,
      quietHours: user.settings.quietHours,
      timezone: user.timezone,
    });
  } catch (error) {
    console.error('获取设置错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 更新用户设置
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { notifications, quietHours, timezone } = req.body;
    const user = await User.findOne({ id: req.user.userId });
    if (!user) return res.status(404).json({ error: '用户不存在' });

    if (notifications !== undefined) user.settings.notifications = notifications;
    if (quietHours) user.settings.quietHours = quietHours;
    if (timezone) user.timezone = timezone;

    await user.save();
    res.json({ success: true, message: '设置更新成功' });
  } catch (error) {
    console.error('更新设置错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 运营端 - 获取用户统计
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') return res.status(403).json({ error: '无权限' });

    const userCount = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastSyncAt: { $gte: moment().subtract(7, 'days').toDate() } });
    const eventCount = await Event.countDocuments();

    res.json({
      totalUsers: userCount,
      activeUsers,
      totalEvents: eventCount,
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});