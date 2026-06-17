import type { Warranty, Claim } from '../types';

const phoneModels = [
  'iPhone 15 Pro Max',
  'iPhone 14 Pro',
  '华为Mate 60 Pro',
  '华为P60 Pro',
  '小米14 Ultra',
  '小米13 Pro',
  'OPPO Find X6 Pro',
  'OPPO Reno11 Pro',
  'vivo X100 Pro',
  'vivo S18 Pro',
  'iPhone 13',
  '华为Mate 50',
  '小米12',
  'OPPO A97',
  'vivo Y100',
];

const repairContents = [
  '屏幕更换',
  '电池更换',
  '主板维修',
  '摄像头更换',
  '尾插维修',
  '扬声器更换',
  '听筒更换',
  '指纹识别维修',
  '面容识别维修',
  '按键更换',
];

const technicians = ['王师傅', '李师傅', '张师傅', '刘师傅', '陈师傅', '赵师傅'];

const exclusions = [
  ['人为损坏', '进水', '摔落'],
  ['屏幕碎裂', '人为损坏'],
  ['进水', '私自拆机'],
  ['电池鼓包（非质量问题）'],
  ['外观磨损', '人为损坏'],
  [],
  ['摔落损坏'],
  ['私自改装'],
];

const generateImei = () => {
  return '86' + Math.random().toString().slice(2, 16);
};

const generateCardNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const prefix = 'W' + year;
  const suffix = Math.random().toString().slice(2, 8);
  return prefix + suffix;
};

const generateRandomDate = (start: Date, end: Date) => {
  const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const d = new Date(time);
  return d.toISOString().split('T')[0];
};

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const calculateRemainingDays = (expireDate: string) => {
  const now = new Date();
  const expire = new Date(expireDate);
  const diff = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const warranties: Warranty[] = [
  {
    id: 'W001',
    cardNo: 'W2026123456',
    customerName: '张三',
    phone: '13800138001',
    phoneModel: 'iPhone 15 Pro Max',
    imei: generateImei(),
    repairContent: '屏幕更换',
    warrantyDays: 180,
    issueDate: '2026-03-15',
    expireDate: '2026-09-11',
    exclusions: ['人为损坏', '进水'],
    storeId: 'S001',
    storeName: '中关村旗舰店',
    technician: '王师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-03-15',
    remainingDays: calculateRemainingDays('2026-09-11'),
  },
  {
    id: 'W002',
    cardNo: 'W2026123457',
    customerName: '李四',
    phone: '13800138002',
    phoneModel: '华为Mate 60 Pro',
    imei: generateImei(),
    repairContent: '电池更换',
    warrantyDays: 90,
    issueDate: '2026-01-10',
    expireDate: '2026-04-10',
    exclusions: ['人为损坏'],
    storeId: 'S001',
    storeName: '中关村旗舰店',
    technician: '李师傅',
    status: 'expired',
    claims: [],
    signed: true,
    signDate: '2026-01-10',
    remainingDays: calculateRemainingDays('2026-04-10'),
  },
  {
    id: 'W003',
    cardNo: 'W2026123458',
    customerName: '王五',
    phone: '13800138003',
    phoneModel: '小米14 Ultra',
    imei: generateImei(),
    repairContent: '主板维修',
    warrantyDays: 180,
    issueDate: '2026-04-20',
    expireDate: '2026-10-17',
    exclusions: ['进水', '摔落'],
    storeId: 'S002',
    storeName: '朝阳路店',
    technician: '张师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-04-20',
    remainingDays: calculateRemainingDays('2026-10-17'),
  },
  {
    id: 'W004',
    cardNo: 'W2026123459',
    customerName: '赵六',
    phone: '13800138004',
    phoneModel: 'OPPO Find X6 Pro',
    imei: generateImei(),
    repairContent: '摄像头更换',
    warrantyDays: 90,
    issueDate: '2026-05-01',
    expireDate: '2026-07-30',
    exclusions: [],
    storeId: 'S003',
    storeName: '浦东中心店',
    technician: '刘师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-05-01',
    remainingDays: calculateRemainingDays('2026-07-30'),
  },
  {
    id: 'W005',
    cardNo: 'W2026123460',
    customerName: '孙七',
    phone: '13800138005',
    phoneModel: 'vivo X100 Pro',
    imei: generateImei(),
    repairContent: '尾插维修',
    warrantyDays: 180,
    issueDate: '2025-12-01',
    expireDate: '2026-05-30',
    exclusions: ['人为损坏', '私自拆机'],
    storeId: 'S004',
    storeName: '天河城店',
    technician: '陈师傅',
    status: 'expired',
    claims: [],
    signed: true,
    signDate: '2025-12-01',
    remainingDays: calculateRemainingDays('2026-05-30'),
  },
  {
    id: 'W006',
    cardNo: 'W2026123461',
    customerName: '周八',
    phone: '13800138006',
    phoneModel: 'iPhone 14 Pro',
    imei: generateImei(),
    repairContent: '扬声器更换',
    warrantyDays: 90,
    issueDate: '2026-03-20',
    expireDate: '2026-06-18',
    exclusions: ['摔落损坏'],
    storeId: 'S005',
    storeName: '南山科技园店',
    technician: '王师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-03-20',
    remainingDays: calculateRemainingDays('2026-06-18'),
  },
  {
    id: 'W007',
    cardNo: 'W2026123462',
    customerName: '吴九',
    phone: '13800138007',
    phoneModel: '华为P60 Pro',
    imei: generateImei(),
    repairContent: '听筒更换',
    warrantyDays: 180,
    issueDate: '2026-02-15',
    expireDate: '2026-08-14',
    exclusions: [],
    storeId: 'S006',
    storeName: '西湖银泰店',
    technician: '李师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-02-15',
    remainingDays: calculateRemainingDays('2026-08-14'),
  },
  {
    id: 'W008',
    cardNo: 'W2026123463',
    customerName: '郑十',
    phone: '13800138008',
    phoneModel: '小米13 Pro',
    imei: generateImei(),
    repairContent: '指纹识别维修',
    warrantyDays: 90,
    issueDate: '2025-11-01',
    expireDate: '2026-01-30',
    exclusions: ['私自改装'],
    storeId: 'S001',
    storeName: '中关村旗舰店',
    technician: '张师傅',
    status: 'expired',
    claims: [],
    signed: true,
    signDate: '2025-11-01',
    remainingDays: calculateRemainingDays('2026-01-30'),
  },
  {
    id: 'W009',
    cardNo: 'W2026123464',
    customerName: '陈晓明',
    phone: '13800138009',
    phoneModel: 'OPPO Reno11 Pro',
    imei: generateImei(),
    repairContent: '面容识别维修',
    warrantyDays: 180,
    issueDate: '2026-05-10',
    expireDate: '2026-11-06',
    exclusions: ['人为损坏'],
    storeId: 'S002',
    storeName: '朝阳路店',
    technician: '刘师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-05-10',
    remainingDays: calculateRemainingDays('2026-11-06'),
  },
  {
    id: 'W010',
    cardNo: 'W2026123465',
    customerName: '林小红',
    phone: '13800138010',
    phoneModel: 'vivo S18 Pro',
    imei: generateImei(),
    repairContent: '按键更换',
    warrantyDays: 90,
    issueDate: '2026-04-01',
    expireDate: '2026-06-30',
    exclusions: [],
    storeId: 'S003',
    storeName: '浦东中心店',
    technician: '陈师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-04-01',
    remainingDays: calculateRemainingDays('2026-06-30'),
  },
  {
    id: 'W011',
    cardNo: 'W2026123466',
    customerName: '黄大伟',
    phone: '13800138011',
    phoneModel: 'iPhone 13',
    imei: generateImei(),
    repairContent: '电池更换',
    warrantyDays: 180,
    issueDate: '2026-01-25',
    expireDate: '2026-07-24',
    exclusions: ['人为损坏', '进水'],
    storeId: 'S004',
    storeName: '天河城店',
    technician: '赵师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-01-25',
    remainingDays: calculateRemainingDays('2026-07-24'),
  },
  {
    id: 'W012',
    cardNo: 'W2026123467',
    customerName: '刘强',
    phone: '13800138012',
    phoneModel: '华为Mate 50',
    imei: generateImei(),
    repairContent: '屏幕更换',
    warrantyDays: 90,
    issueDate: '2025-10-15',
    expireDate: '2026-01-13',
    exclusions: ['摔落'],
    storeId: 'S005',
    storeName: '南山科技园店',
    technician: '王师傅',
    status: 'expired',
    claims: [],
    signed: true,
    signDate: '2025-10-15',
    remainingDays: calculateRemainingDays('2026-01-13'),
  },
  {
    id: 'W013',
    cardNo: 'W2026123468',
    customerName: '谢芳',
    phone: '13800138013',
    phoneModel: '小米12',
    imei: generateImei(),
    repairContent: '主板维修',
    warrantyDays: 180,
    issueDate: '2026-05-20',
    expireDate: '2026-11-16',
    exclusions: [],
    storeId: 'S006',
    storeName: '西湖银泰店',
    technician: '李师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-05-20',
    remainingDays: calculateRemainingDays('2026-11-16'),
  },
  {
    id: 'W014',
    cardNo: 'W2026123469',
    customerName: '马云飞',
    phone: '13800138014',
    phoneModel: 'OPPO A97',
    imei: generateImei(),
    repairContent: '尾插维修',
    warrantyDays: 90,
    issueDate: '2026-03-10',
    expireDate: '2026-06-08',
    exclusions: ['人为损坏'],
    storeId: 'S001',
    storeName: '中关村旗舰店',
    technician: '张师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-03-10',
    remainingDays: calculateRemainingDays('2026-06-08'),
  },
  {
    id: 'W015',
    cardNo: 'W2026123470',
    customerName: '杨丽',
    phone: '13800138015',
    phoneModel: 'vivo Y100',
    imei: generateImei(),
    repairContent: '摄像头更换',
    warrantyDays: 180,
    issueDate: '2026-02-28',
    expireDate: '2026-08-27',
    exclusions: ['进水', '私自拆机'],
    storeId: 'S002',
    storeName: '朝阳路店',
    technician: '刘师傅',
    status: 'active',
    claims: [],
    signed: true,
    signDate: '2026-02-28',
    remainingDays: calculateRemainingDays('2026-08-27'),
  },
  {
    id: 'W016',
    cardNo: 'W2026123471',
    customerName: '徐峰',
    phone: '13800138016',
    phoneModel: 'iPhone 15 Pro',
    imei: generateImei(),
    repairContent: '扬声器更换',
    warrantyDays: 90,
    issueDate: '2025-09-01',
    expireDate: '2025-11-30',
    exclusions: ['摔落损坏'],
    storeId: 'S003',
    storeName: '浦东中心店',
    technician: '陈师傅',
    status: 'expired',
    claims: [],
    signed: true,
    signDate: '2025-09-01',
    remainingDays: calculateRemainingDays('2025-11-30'),
  },
  {
    id: 'W017',
    cardNo: 'W2026123472',
    customerName: '高敏',
    phone: '13800138017',
    phoneModel: '华为P60 Art',
    imei: generateImei(),
    repairContent: '电池更换',
    warrantyDays: 180,
    issueDate: '2026-06-01',
    expireDate: '2026-11-28',
    exclusions: [],
    storeId: 'S004',
    storeName: '天河城店',
    technician: '赵师傅',
    status: 'active',
    claims: [],
    signed: false,
    remainingDays: calculateRemainingDays('2026-11-28'),
  },
];

export const getWarrantyById = (id: string): Warranty | undefined => {
  return warranties.find(w => w.id === id);
};

export const getWarrantyByCardNo = (cardNo: string): Warranty | undefined => {
  return warranties.find(w => w.cardNo === cardNo);
};

export const getWarrantiesByStatus = (status: string): Warranty[] => {
  return warranties.filter(w => w.status === status);
};

export const getWarrantiesByStore = (storeId: string): Warranty[] => {
  return warranties.filter(w => w.storeId === storeId);
};

export const getActiveWarranties = (): Warranty[] => {
  return warranties.filter(w => w.status === 'active');
};

export const getExpiringSoon = (days: number = 30): Warranty[] => {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + days);
  return warranties.filter(w => {
    if (w.status !== 'active') return false;
    const expire = new Date(w.expireDate);
    return expire >= now && expire <= threshold;
  });
};

export const updateWarrantyClaims = (warrantyId: string, claim: Claim) => {
  const warranty = warranties.find(w => w.id === warrantyId);
  if (warranty) {
    warranty.claims.push(claim);
  }
};
