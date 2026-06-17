import type { BlacklistItem } from '../types';

const reasons = [
  '多次恶意申请质保核销，经检测均为人为损坏',
  '伪造维修凭证，企图骗取免费维修服务',
  '对客服人员进行言语攻击和人身威胁',
  '多次在质保期最后一天申请核销，疑似故意损坏',
  '在门店大吵大闹，影响正常经营秩序',
  '涉嫌诈骗，已报警处理',
  '多次提供虚假故障描述',
  '拒绝配合检测，强行要求免费维修',
];

const notes = [
  '该用户曾在3家不同门店申请过5次核销，均被拒保',
  '用户提供的发票经核实为伪造',
  '已有2次报警记录，建议门店注意防范',
  '每次申请时间均在质保到期前3天内',
  '需要门店经理亲自接待',
  '已加入全国连锁门店黑名单',
  '建议拒绝提供任何服务',
  '用户承认故意损坏手机以获得免费维修',
];

const generateRandomDate = (start: Date, end: Date) => {
  const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const d = new Date(time);
  return d.toISOString().split('T')[0];
};

export const blacklist: BlacklistItem[] = [
  {
    id: 'B001',
    customerName: '王建国',
    phone: '13900139001',
    reason: '多次恶意申请质保核销，经检测均为人为损坏',
    level: 'high',
    historyCount: 5,
    createDate: '2025-11-15',
    lastIncident: '2026-03-20',
    notes: '该用户曾在3家不同门店申请过5次核销，均被拒保',
  },
  {
    id: 'B002',
    customerName: '李秀英',
    phone: '13900139002',
    reason: '伪造维修凭证，企图骗取免费维修服务',
    level: 'high',
    historyCount: 3,
    createDate: '2026-01-10',
    lastIncident: '2026-04-15',
    notes: '用户提供的发票经核实为伪造',
  },
  {
    id: 'B003',
    customerName: '陈大强',
    phone: '13900139003',
    reason: '对客服人员进行言语攻击和人身威胁',
    level: 'medium',
    historyCount: 2,
    createDate: '2025-12-20',
    lastIncident: '2026-02-28',
    notes: '已有2次报警记录，建议门店注意防范',
  },
  {
    id: 'B004',
    customerName: '张美丽',
    phone: '13900139004',
    reason: '多次在质保期最后一天申请核销，疑似故意损坏',
    level: 'medium',
    historyCount: 4,
    createDate: '2026-02-05',
    lastIncident: '2026-05-10',
    notes: '每次申请时间均在质保到期前3天内',
  },
  {
    id: 'B005',
    customerName: '刘天龙',
    phone: '13900139005',
    reason: '涉嫌诈骗，已报警处理',
    level: 'high',
    historyCount: 6,
    createDate: '2025-10-01',
    lastIncident: '2026-01-15',
    notes: '已加入全国连锁门店黑名单，建议拒绝提供任何服务',
  },
  {
    id: 'B006',
    customerName: '赵小花',
    phone: '13900139006',
    reason: '多次提供虚假故障描述',
    level: 'low',
    historyCount: 2,
    createDate: '2026-03-01',
    lastIncident: '2026-05-20',
    notes: '需要门店经理亲自接待，核实故障真实性',
  },
];

export const getBlacklistById = (id: string): BlacklistItem | undefined => {
  return blacklist.find(b => b.id === id);
};

export const getBlacklistByPhone = (phone: string): BlacklistItem | undefined => {
  return blacklist.find(b => b.phone === phone);
};

export const getBlacklistByLevel = (level: string): BlacklistItem[] => {
  return blacklist.filter(b => b.level === level);
};

export const isBlacklisted = (phone: string): boolean => {
  return blacklist.some(b => b.phone === phone);
};

export const getBlacklistRiskLevel = (phone: string): string | null => {
  const item = blacklist.find(b => b.phone === phone);
  return item ? item.level : null;
};

export const addToBlacklist = (item: Omit<BlacklistItem, 'id'>) => {
  const newId = 'B' + String(blacklist.length + 1).padStart(3, '0');
  const newItem: BlacklistItem = {
    ...item,
    id: newId,
  };
  blacklist.push(newItem);
  return newItem;
};

export const removeFromBlacklist = (id: string) => {
  const index = blacklist.findIndex(b => b.id === id);
  if (index > -1) {
    blacklist.splice(index, 1);
    return true;
  }
  return false;
};
