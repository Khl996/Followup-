import { SupervisorUser, Worker, LocationItem, Category, Observation } from '../types';

export const INITIAL_SUPERVISORS: SupervisorUser[] = [
  {
    id: 'user_khalid',
    email: 'Khalid.a.kh990@gmail.com',
    displayName: 'خالد العتيبي',
    role: 'admin',
    active: true,
  },
  {
    id: 'user_ahmed',
    email: 'ahmed.supervisor@hospital.internal',
    displayName: 'أحمد الشمري',
    role: 'supervisor',
    active: true,
  },
  {
    id: 'user_faisal',
    email: 'faisal.supervisor@hospital.internal',
    displayName: 'فيصل القحطاني',
    role: 'supervisor',
    active: true,
  },
  {
    id: 'user_mohammed',
    email: 'm.ghamdi@hospital.internal',
    displayName: 'محمد الغامدي',
    role: 'supervisor',
    active: true,
  },
  {
    id: 'user_tariq',
    email: 'tariq.m@hospital.internal',
    displayName: 'طارق المطيري',
    role: 'supervisor',
    active: true,
  },
];

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w1', name: 'سعود', department: 'صيانة كهرباء', active: true },
  { id: 'w2', name: 'كمال', department: 'صيانة تكييف وتبريد', active: true },
  { id: 'w3', name: 'فهد', department: 'صيانة سباكة', active: true },
  { id: 'w4', name: 'إبراهيم', department: 'نظافة وتعقيم', active: true },
  { id: 'w5', name: 'رضوان', department: 'مصاعد وأبواب', active: true },
  { id: 'w6', name: 'عثمان', department: 'نجارة ودهان', active: true },
  { id: 'w7', name: 'بابو', department: 'نظافة عامة', active: true },
  { id: 'w8', name: 'منصور', department: 'صيانة إلكترونية', active: true },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'صيانة كهرباء', active: true },
  { id: 'c2', name: 'صيانة تكييف وتبريد', active: true },
  { id: 'c3', name: 'صيانة سباكة', active: true },
  { id: 'c4', name: 'نظافة وتعقيم', active: true },
  { id: 'c5', name: 'صيانة عامة وأبواب', active: true },
  { id: 'c6', name: 'أخرى', active: true },
];

export const INITIAL_LOCATIONS: LocationItem[] = [
  { id: 'l1', name: 'ممر العيادات الخارجية - الدور الأرضي', active: true },
  { id: 'l2', name: 'طوارئ الكبار - صالة الانتظار', active: true },
  { id: 'l3', name: 'قسم العمليات - جناح (ب)', active: true },
  { id: 'l4', name: 'جناح التنويم 3 - الغرفة 308', active: true },
  { id: 'l5', name: 'ممر العناية المركزة (ICU)', active: true },
  { id: 'l6', name: 'المدخل الرئيسي ومواقف الإسعاف', active: true },
  { id: 'l7', name: 'المختبر وبنك الدم', active: true },
  { id: 'l8', name: 'قسم الأشعة والتصوير الطبي', active: true },
  { id: 'l9', name: 'المغسلة المركزية ومستودع المرافق', active: true },
  { id: 'l10', name: 'كافتيريا الموظفين والزوار', active: true },
];

// Helper to format ISO strings
const now = new Date();
const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 15, 0).toISOString();
const todayMidday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0).toISOString();
const yesterday = new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(now.getTime() - 52 * 60 * 60 * 1000).toISOString();

// Date strings YYYY-MM-DD
const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
const todayStr = formatDateStr(now);
const pastDateStr = formatDateStr(new Date(now.getTime() - 86400000));
const futureDateStr = formatDateStr(new Date(now.getTime() + 86400000 * 2));

export const INITIAL_OBSERVATIONS: Observation[] = [
  {
    id: 'obs-001',
    description: 'لمبة الممر المؤدي للعيادات الخارجية طافية وتحتاج استبدال',
    categoryId: 'c1',
    categoryName: 'صيانة كهرباء',
    locationId: 'l1',
    locationName: 'ممر العيادات الخارجية - الدور الأرضي',
    workerId: 'w1',
    workerName: 'سعود',
    status: 'OPEN',
    createdBy: 'user_khalid',
    createdByName: 'خالد العتيبي',
    createdAt: todayMorning,
  },
  {
    id: 'obs-002',
    description: 'انسكاب سوائل على مدخل صالة الطوارئ بحاجة لتنظيف وتجفيف عاجل لمنع الانزلاق',
    categoryId: 'c4',
    categoryName: 'نظافة وتعقيم',
    locationId: 'l2',
    locationName: 'طوارئ الكبار - صالة الانتظار',
    workerId: 'w4',
    workerName: 'إبراهيم',
    status: 'OPEN',
    createdBy: 'user_khalid',
    createdByName: 'خالد العتيبي',
    createdAt: todayMidday,
  },
  {
    id: 'obs-003',
    description: 'تسريب مياه خفيف أسفل مغسلة دورة مياه المرضى',
    categoryId: 'c3',
    categoryName: 'صيانة سباكة',
    locationId: 'l4',
    locationName: 'جناح التنويم 3 - الغرفة 308',
    workerId: 'w3',
    workerName: 'فهد',
    status: 'OPEN',
    createdBy: 'user_ahmed',
    createdByName: 'أحمد الشمري',
    createdAt: twoDaysAgo, // older observation (> 24 hours) for testing visual indicator
  },
  {
    id: 'obs-004',
    description: 'صوت اهتزاز غير طبيعي في وحدة التكييف المركزية وتراجع كفاءة التبريد',
    categoryId: 'c2',
    categoryName: 'صيانة تكييف وتبريد',
    locationId: 'l3',
    locationName: 'قسم العمليات - جناح (ب)',
    workerId: 'w2',
    workerName: 'كمال',
    status: 'PAUSED',
    createdBy: 'user_faisal',
    createdByName: 'فيصل القحطاني',
    createdAt: yesterday,
    pausedBy: 'user_faisal',
    pausedByName: 'فيصل القحطاني',
    pausedAt: yesterday,
    pauseReason: 'انتظار توريد قطع غيار من الوكيل المعتمد',
    reviewDate: todayStr, // Due today! Visually highlighted
  },
  {
    id: 'obs-005',
    description: 'كسر في مسكة الباب الجانبي لقسم الأشعة يعيق إغلاقه بسلاسة',
    categoryId: 'c5',
    categoryName: 'صيانة عامة وأبواب',
    locationId: 'l8',
    locationName: 'قسم الأشعة والتصوير الطبي',
    workerId: 'w6',
    workerName: 'عثمان',
    status: 'PAUSED',
    createdBy: 'user_khalid',
    createdByName: 'خالد العتيبي',
    createdAt: twoDaysAgo,
    pausedBy: 'user_khalid',
    pausedByName: 'خالد العتيبي',
    pausedAt: yesterday,
    pauseReason: 'عدم توفر مواد في المستودع حالياً',
    reviewDate: pastDateStr, // Overdue review date! Highlighted
  },
  {
    id: 'obs-006',
    description: 'استبدال لمبة الإشارة في جهاز نداء التمريض بجوار السرير',
    categoryId: 'c1',
    categoryName: 'صيانة كهرباء',
    locationId: 'l4',
    locationName: 'جناح التنويم 3 - الغرفة 308',
    workerId: 'w1',
    workerName: 'سعود',
    status: 'CLOSED',
    createdBy: 'user_khalid',
    createdByName: 'خالد العتيبي',
    createdAt: yesterday,
    closedBy: 'user_ahmed', // Closed by another supervisor
    closedByName: 'أحمد الشمري',
    closedAt: todayMorning,
  },
];
