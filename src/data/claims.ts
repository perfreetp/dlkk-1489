import type { Claim, Repair } from '../types';

const faultDescriptions = [
  '屏幕触摸失灵，无法正常操作',
  '电池不耐用，充满电只能用2小时',
  '手机无法开机，充电无反应',
  '摄像头拍照模糊，无法对焦',
  '充电插口松动，充电断断续续',
  '扬声器没有声音，来电无铃声',
  '听筒声音小，通话听不清',
  '指纹识别不灵敏，经常无法解锁',
  '面容识别失败，无法解锁手机',
  '电源键损坏，无法锁屏/开机',
  '音量键失灵，无法调节音量',
  '手机发热严重，使用时烫手',
  'WiFi信号弱，经常断连',
  '蓝牙无法配对，连接不稳定',
];

const detectionResults = [
  '经检测，屏幕触控IC损坏，非人为因素',
  '电池健康度仅35%，属于正常损耗',
  '主板电源管理芯片故障，非人为损坏',
  '摄像头模组进灰，属于密封问题',
  '尾插触点氧化，正常使用磨损',
  '扬声器线圈烧毁，质量问题',
  '听筒防尘网堵塞，需要清理',
  '指纹传感器故障，非人为损坏',
  '深感摄像头问题，需要更换',
  '按键弹性失效，质量问题',
];

const rejectReasons = [
  '检测发现手机有明显进水痕迹，属于人为损坏',
  '屏幕有明显碎裂痕迹，系外力撞击导致',
  '手机机身有明显弯曲变形，非质量问题',
  '检测发现有私自拆机痕迹，螺丝有拧动痕迹',
  '故障是由于用户安装第三方软件导致',
  '该故障不在质保范围内，属于人为损坏',
];

const partsList = [
  { name: '屏幕总成', cost: 1280 },
  { name: '电池', cost: 299 },
  { name: '主板', cost: 2500 },
  { name: '摄像头模组', cost: 899 },
  { name: '尾插小板', cost: 150 },
  { name: '扬声器', cost: 80 },
  { name: '听筒', cost: 60 },
  { name: '指纹模组', cost: 120 },
  { name: '深感摄像头', cost: 580 },
  { name: '开机排线', cost: 45 },
];

const technicians = ['王师傅', '李师傅', '张师傅', '刘师傅', '陈师傅', '赵师傅'];
const handlers = ['客服小张', '客服小李', '客服小王', '主管刘经理', '主管张经理'];

const generatePhotos = (count: number = 3) => {
  return Array.from({ length: count }, (_, i) => `https://example.com/photos/claim_${Date.now()}_${i + 1}.jpg`);
};

const createRepair = (claimId: string, solutionType: 'free' | 'discounted' | 'rejected' | 'escalated'): Repair => {
  const parts = solutionType === 'rejected' ? [] : [partsList[Math.floor(Math.random() * partsList.length)]];
  const totalCost = parts.reduce((sum, p) => sum + p.cost, 0);
  
  return {
    id: 'R' + Date.now() + Math.random().toString().slice(2, 6),
    claimId,
    solutionType,
    cost: solutionType === 'free' ? 0 : solutionType === 'discounted' ? Math.floor(totalCost * 0.5) : totalCost,
    parts,
    description: parts.map(p => `更换${p.name}`).join('、') || '无需维修',
    technician: technicians[Math.floor(Math.random() * technicians.length)],
    completeDate: generateRandomDate(new Date('2026-05-01'), new Date('2026-06-15')),
    customerSigned: solutionType !== 'rejected',
    signDate: solutionType !== 'rejected' ? generateRandomDate(new Date('2026-06-01'), new Date('2026-06-16')) : undefined,
  };
};

const generateRandomDate = (start: Date, end: Date) => {
  const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const d = new Date(time);
  return d.toISOString().split('T')[0];
};

export const claims: Claim[] = [
  {
    id: 'C001',
    warrantyId: 'W001',
    cardNo: 'W2026123456',
    customerName: '张三',
    phone: '13800138001',
    phoneModel: 'iPhone 15 Pro Max',
    faultDescription: '屏幕触摸失灵，无法正常操作',
    photos: generatePhotos(3),
    detectionResult: '经检测，屏幕触控IC损坏，非人为因素',
    isCovered: true,
    submitDate: '2026-05-10',
    status: 'approved',
    repair: createRepair('C001', 'free'),
    storeId: 'S001',
    storeName: '中关村旗舰店',
    handler: '客服小张',
  },
  {
    id: 'C002',
    warrantyId: 'W003',
    cardNo: 'W2026123458',
    customerName: '王五',
    phone: '13800138003',
    phoneModel: '小米14 Ultra',
    faultDescription: '手机无法开机，充电无反应',
    photos: generatePhotos(4),
    detectionResult: '检测发现手机有明显进水痕迹，属于人为损坏',
    isCovered: false,
    rejectReason: '检测发现手机有明显进水痕迹，属于人为损坏',
    submitDate: '2026-05-12',
    status: 'rejected',
    storeId: 'S002',
    storeName: '朝阳路店',
    handler: '客服小李',
  },
  {
    id: 'C003',
    warrantyId: 'W004',
    cardNo: 'W2026123459',
    customerName: '赵六',
    phone: '13800138004',
    phoneModel: 'OPPO Find X6 Pro',
    faultDescription: '摄像头拍照模糊，无法对焦',
    photos: generatePhotos(3),
    detectionResult: '摄像头模组进灰，属于密封问题',
    isCovered: true,
    submitDate: '2026-05-15',
    status: 'pending',
    storeId: 'S003',
    storeName: '浦东中心店',
  },
  {
    id: 'C004',
    warrantyId: 'W006',
    cardNo: 'W2026123461',
    customerName: '周八',
    phone: '13800138006',
    phoneModel: 'iPhone 14 Pro',
    faultDescription: '扬声器没有声音，来电无铃声',
    photos: generatePhotos(2),
    detectionResult: '扬声器线圈烧毁，质量问题',
    isCovered: true,
    submitDate: '2026-05-08',
    status: 'approved',
    repair: createRepair('C004', 'free'),
    storeId: 'S005',
    storeName: '南山科技园店',
    handler: '客服小王',
  },
  {
    id: 'C005',
    warrantyId: 'W007',
    cardNo: 'W2026123462',
    customerName: '吴九',
    phone: '13800138007',
    phoneModel: '华为P60 Pro',
    faultDescription: '听筒声音小，通话听不清',
    photos: generatePhotos(3),
    detectionResult: null,
    isCovered: null,
    submitDate: '2026-06-10',
    status: 'pending',
    storeId: 'S006',
    storeName: '西湖银泰店',
  },
  {
    id: 'C006',
    warrantyId: 'W009',
    cardNo: 'W2026123464',
    customerName: '陈晓明',
    phone: '13800138009',
    phoneModel: 'OPPO Reno11 Pro',
    faultDescription: '面容识别失败，无法解锁手机',
    photos: generatePhotos(4),
    detectionResult: '检测发现有私自拆机痕迹，螺丝有拧动痕迹',
    isCovered: false,
    rejectReason: '检测发现有私自拆机痕迹，螺丝有拧动痕迹',
    submitDate: '2026-05-20',
    status: 'rejected',
    storeId: 'S002',
    storeName: '朝阳路店',
    handler: '主管刘经理',
  },
  {
    id: 'C007',
    warrantyId: 'W010',
    cardNo: 'W2026123465',
    customerName: '林小红',
    phone: '13800138010',
    phoneModel: 'vivo S18 Pro',
    faultDescription: '电源键损坏，无法锁屏/开机',
    photos: generatePhotos(3),
    detectionResult: '按键弹性失效，质量问题',
    isCovered: true,
    submitDate: '2026-05-25',
    status: 'approved',
    repair: createRepair('C007', 'discounted'),
    storeId: 'S003',
    storeName: '浦东中心店',
    handler: '客服小张',
  },
  {
    id: 'C008',
    warrantyId: 'W011',
    cardNo: 'W2026123466',
    customerName: '黄大伟',
    phone: '13800138011',
    phoneModel: 'iPhone 13',
    faultDescription: '电池不耐用，充满电只能用2小时',
    photos: generatePhotos(2),
    detectionResult: '电池健康度仅35%，属于正常损耗',
    isCovered: null,
    submitDate: '2026-06-12',
    status: 'pending',
    storeId: 'S004',
    storeName: '天河城店',
  },
  {
    id: 'C009',
    warrantyId: 'W013',
    cardNo: 'W2026123468',
    customerName: '谢芳',
    phone: '13800138013',
    phoneModel: '小米12',
    faultDescription: '手机发热严重，使用时烫手',
    photos: generatePhotos(3),
    detectionResult: '主板电源管理芯片故障，非人为损坏',
    isCovered: true,
    submitDate: '2026-05-30',
    status: 'disputed',
    repair: createRepair('C009', 'free'),
    storeId: 'S006',
    storeName: '西湖银泰店',
    handler: '主管张经理',
  },
  {
    id: 'C010',
    warrantyId: 'W014',
    cardNo: 'W2026123469',
    customerName: '马云飞',
    phone: '13800138014',
    phoneModel: 'OPPO A97',
    faultDescription: '充电插口松动，充电断断续续',
    photos: generatePhotos(4),
    detectionResult: '尾插触点氧化，正常使用磨损',
    isCovered: true,
    submitDate: '2026-05-18',
    status: 'approved',
    repair: createRepair('C010', 'free'),
    storeId: 'S001',
    storeName: '中关村旗舰店',
    handler: '客服小李',
  },
  {
    id: 'C011',
    warrantyId: 'W015',
    cardNo: 'W2026123470',
    customerName: '杨丽',
    phone: '13800138015',
    phoneModel: 'vivo Y100',
    faultDescription: '指纹识别不灵敏，经常无法解锁',
    photos: generatePhotos(3),
    detectionResult: '屏幕有明显碎裂痕迹，系外力撞击导致',
    isCovered: false,
    rejectReason: '屏幕有明显碎裂痕迹，系外力撞击导致',
    submitDate: '2026-06-05',
    status: 'disputed',
    storeId: 'S002',
    storeName: '朝阳路店',
    handler: '主管刘经理',
  },
  {
    id: 'C012',
    warrantyId: 'W002',
    cardNo: 'W2026123457',
    customerName: '李四',
    phone: '13800138002',
    phoneModel: '华为Mate 60 Pro',
    faultDescription: 'WiFi信号弱，经常断连',
    photos: generatePhotos(2),
    detectionResult: '该故障不在质保范围内，属于人为损坏',
    isCovered: false,
    rejectReason: '质保期已过，且检测发现有摔落痕迹',
    submitDate: '2026-04-15',
    status: 'rejected',
    storeId: 'S001',
    storeName: '中关村旗舰店',
    handler: '客服小王',
  },
];

export const getClaimById = (id: string): Claim | undefined => {
  return claims.find(c => c.id === id);
};

export const getClaimsByWarrantyId = (warrantyId: string): Claim[] => {
  return claims.filter(c => c.warrantyId === warrantyId);
};

export const getClaimsByStatus = (status: string): Claim[] => {
  return claims.filter(c => c.status === status);
};

export const getClaimsByStore = (storeId: string): Claim[] => {
  return claims.filter(c => c.storeId === storeId);
};

export const getPendingClaims = (): Claim[] => {
  return claims.filter(c => c.status === 'pending');
};

export const updateClaimStatus = (claimId: string, status: Claim['status'], handler?: string) => {
  const claim = claims.find(c => c.id === claimId);
  if (claim) {
    claim.status = status;
    if (handler) {
      claim.handler = handler;
    }
  }
};

export const addRepairToClaim = (claimId: string, repair: Repair) => {
  const claim = claims.find(c => c.id === claimId);
  if (claim) {
    claim.repair = repair;
  }
};
