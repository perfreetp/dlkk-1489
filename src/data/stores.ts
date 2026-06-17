import type { Store } from '../types';

export const stores: Store[] = [
  {
    id: 'S001',
    name: '中关村旗舰店',
    address: '北京市海淀区中关村大街1号海龙大厦1层',
    manager: '张建国',
    phone: '010-88881234',
    totalWarranties: 328,
    totalClaims: 89,
    approvalRate: 0.92,
    avgRepairCost: 328,
  },
  {
    id: 'S002',
    name: '朝阳路店',
    address: '北京市朝阳区朝阳路88号万达广场2层',
    manager: '李婷婷',
    phone: '010-88885678',
    totalWarranties: 256,
    totalClaims: 67,
    approvalRate: 0.88,
    avgRepairCost: 298,
  },
  {
    id: 'S003',
    name: '浦东中心店',
    address: '上海市浦东新区陆家嘴环路1000号',
    manager: '王大明',
    phone: '021-66661234',
    totalWarranties: 412,
    totalClaims: 112,
    approvalRate: 0.95,
    avgRepairCost: 356,
  },
  {
    id: 'S004',
    name: '天河城店',
    address: '广州市天河区天河路208号天河城4层',
    manager: '陈美玲',
    phone: '020-88881234',
    totalWarranties: 289,
    totalClaims: 78,
    approvalRate: 0.90,
    avgRepairCost: 312,
  },
  {
    id: 'S005',
    name: '南山科技园店',
    address: '深圳市南山区科技园南区深南大道9996号',
    manager: '刘伟强',
    phone: '0755-88881234',
    totalWarranties: 367,
    totalClaims: 95,
    approvalRate: 0.93,
    avgRepairCost: 342,
  },
  {
    id: 'S006',
    name: '西湖银泰店',
    address: '杭州市西湖区延安路98号银泰百货3层',
    manager: '赵雪梅',
    phone: '0571-88881234',
    totalWarranties: 198,
    totalClaims: 52,
    approvalRate: 0.87,
    avgRepairCost: 286,
  },
];

export const getStoreById = (id: string): Store | undefined => {
  return stores.find(store => store.id === id);
};

export const getStoreByName = (name: string): Store | undefined => {
  return stores.find(store => store.name === name);
};

export const getStoreOptions = () => {
  return stores.map(store => ({
    value: store.id,
    label: store.name,
  }));
};
