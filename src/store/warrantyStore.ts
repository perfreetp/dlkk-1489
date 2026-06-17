import { create } from 'zustand';
import dayjs from 'dayjs';
import type {
  Warranty,
  Claim,
  Repair,
  Store,
  BlacklistItem,
  VisitRecord,
  DisputeRecord,
  StatsData,
  QueryParams,
} from '../types';
import {
  mockWarranties,
  mockClaims,
  mockRepairs,
  mockStores,
  mockBlacklist,
  mockVisits,
  mockDisputes,
} from '../data';

interface WarrantyState {
  warranties: Warranty[];
  claims: Claim[];
  repairs: Repair[];
  stores: Store[];
  blacklist: BlacklistItem[];
  visits: VisitRecord[];
  disputes: DisputeRecord[];
  currentWarranty: Warranty | null;
  currentClaim: Claim | null;
  loading: boolean;
  error: string | null;

  addWarranty: (warranty: Omit<Warranty, 'id' | 'cardNo'>) => void;
  updateWarranty: (id: string, data: Partial<Warranty>) => void;
  addClaim: (claim: Omit<Claim, 'id'>) => void;
  updateClaim: (id: string, data: Partial<Claim>) => void;
  addRepair: (repair: Omit<Repair, 'id'>) => void;
  addDispute: (dispute: Omit<DisputeRecord, 'id'>) => void;
  updateDispute: (id: string, data: Partial<DisputeRecord>) => void;
  addToBlacklist: (item: Omit<BlacklistItem, 'id'>) => void;
  removeFromBlacklist: (id: string) => void;
  addVisit: (visit: Omit<VisitRecord, 'id'>) => void;
  setCurrentWarranty: (warranty: Warranty | null) => void;
  setCurrentClaim: (claim: Claim | null) => void;
  getStats: () => StatsData;
  searchWarranties: (keyword: string) => Warranty[];
  searchClaims: (params: QueryParams) => Claim[];
  getExpiringWarranties: (days: number) => Warranty[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCardNo = () => `W${dayjs().format('YYYYMM')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

export const useWarrantyStore = create<WarrantyState>((set, get) => ({
  warranties: mockWarranties,
  claims: mockClaims,
  repairs: mockRepairs,
  stores: mockStores,
  blacklist: mockBlacklist,
  visits: mockVisits,
  disputes: mockDisputes,
  currentWarranty: null,
  currentClaim: null,
  loading: false,
  error: null,

  addWarranty: (warranty) => {
    const newWarranty: Warranty = {
      ...warranty,
      id: generateId(),
      cardNo: generateCardNo(),
      claims: [],
    };
    set((state) => ({ warranties: [...state.warranties, newWarranty] }));
  },

  updateWarranty: (id, data) => {
    set((state) => ({
      warranties: state.warranties.map((w) =>
        w.id === id ? { ...w, ...data } : w
      ),
    }));
  },

  addClaim: (claim) => {
    const newClaim: Claim = {
      ...claim,
      id: `C${generateId()}`,
    };
    set((state) => ({ claims: [...state.claims, newClaim] }));
  },

  updateClaim: (id, data) => {
    set((state) => ({
      claims: state.claims.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    }));
  },

  addRepair: (repair) => {
    const newRepair: Repair = {
      ...repair,
      id: `R${generateId()}`,
    };
    set((state) => ({ repairs: [...state.repairs, newRepair] }));
  },

  addDispute: (dispute) => {
    const newDispute: DisputeRecord = {
      ...dispute,
      id: `D${generateId()}`,
    };
    set((state) => ({ disputes: [...state.disputes, newDispute] }));
  },

  updateDispute: (id, data) => {
    set((state) => ({
      disputes: state.disputes.map((d) =>
        d.id === id ? { ...d, ...data } : d
      ),
    }));
  },

  addToBlacklist: (item) => {
    const newItem: BlacklistItem = {
      ...item,
      id: `B${generateId()}`,
    };
    set((state) => ({ blacklist: [...state.blacklist, newItem] }));
  },

  removeFromBlacklist: (id) => {
    set((state) => ({
      blacklist: state.blacklist.filter((item) => item.id !== id),
    }));
  },

  addVisit: (visit) => {
    const newVisit: VisitRecord = {
      ...visit,
      id: `V${generateId()}`,
    };
    set((state) => ({ visits: [...state.visits, newVisit] }));
  },

  setCurrentWarranty: (warranty) => {
    set({ currentWarranty: warranty });
  },

  setCurrentClaim: (claim) => {
    set({ currentClaim: claim });
  },

  getStats: () => {
    const { warranties, claims, repairs } = get();
    const today = dayjs();

    const totalWarranties = warranties.length;
    const activeWarranties = warranties.filter((w) => w.status === 'active').length;
    const totalClaims = claims.length;
    const approvedClaims = claims.filter((c) => c.status === 'approved').length;
    const rejectedClaims = claims.filter((c) => c.status === 'rejected').length;
    const approvalRate = totalClaims > 0 ? approvedClaims / totalClaims : 0;

    const completedRepairs = repairs.filter((r) => r.cost > 0);
    const totalRepairCost = completedRepairs.reduce((sum, r) => sum + r.cost, 0);
    const avgRepairCost = completedRepairs.length > 0 ? totalRepairCost / completedRepairs.length : 0;

    const expiringSoon = warranties.filter((w) => {
      const expireDate = dayjs(w.expireDate);
      const diff = expireDate.diff(today, 'day');
      return diff > 0 && diff <= 30 && w.status === 'active';
    }).length;

    const expiringToday = warranties.filter((w) => {
      const expireDate = dayjs(w.expireDate);
      return expireDate.isSame(today, 'day') && w.status === 'active';
    }).length;

    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const month = today.subtract(5 - i, 'month');
      const monthStr = month.format('YYYY-MM');
      const issued = warranties.filter((w) =>
        dayjs(w.issueDate).format('YYYY-MM') === monthStr
      ).length;
      const claimed = claims.filter((c) =>
        dayjs(c.submitDate).format('YYYY-MM') === monthStr
      ).length;
      return { month: month.format('MM月'), issued, claimed };
    });

    const rejectReasonsMap = new Map<string, number>();
    claims
      .filter((c) => c.status === 'rejected' && c.rejectReason)
      .forEach((c) => {
        const reason = c.rejectReason!;
        rejectReasonsMap.set(reason, (rejectReasonsMap.get(reason) || 0) + 1);
      });
    const rejectReasons = Array.from(rejectReasonsMap.entries()).map(([reason, count]) => ({
      reason,
      count,
    }));

    const storeRanking = get().stores.map((store) => ({
      store: store.name,
      warranties: warranties.filter((w) => w.storeId === store.id).length,
      claims: claims.filter((c) => c.storeId === store.id).length,
      rate: store.approvalRate,
    }));

    const repairCostTrend = Array.from({ length: 6 }, (_, i) => {
      const month = today.subtract(5 - i, 'month');
      const monthStr = month.format('YYYY-MM');
      const cost = repairs
        .filter((r) => dayjs(r.completeDate).format('YYYY-MM') === monthStr)
        .reduce((sum, r) => sum + r.cost, 0);
      return { month: month.format('MM月'), cost };
    });

    const coverageRanges = [
      { range: '0-30天', min: 0, max: 30 },
      { range: '31-90天', min: 31, max: 90 },
      { range: '91-180天', min: 91, max: 180 },
      { range: '180天以上', min: 181, max: Infinity },
    ];
    const coverageDistribution = coverageRanges.map(({ range, min, max }) => ({
      range,
      count: warranties.filter((w) => w.warrantyDays >= min && w.warrantyDays <= max).length,
    }));

    return {
      totalWarranties,
      activeWarranties,
      totalClaims,
      approvedClaims,
      rejectedClaims,
      approvalRate,
      avgRepairCost,
      totalRepairCost,
      expiringSoon,
      expiringToday,
      monthlyTrend,
      rejectReasons,
      storeRanking,
      repairCostTrend,
      coverageDistribution,
    };
  },

  searchWarranties: (keyword) => {
    const { warranties } = get();
    if (!keyword.trim()) return warranties;
    const lowerKeyword = keyword.toLowerCase();
    return warranties.filter(
      (w) =>
        w.cardNo.toLowerCase().includes(lowerKeyword) ||
        w.customerName.toLowerCase().includes(lowerKeyword) ||
        w.phone.includes(keyword) ||
        w.phoneModel.toLowerCase().includes(lowerKeyword) ||
        w.imei.includes(keyword)
    );
  },

  searchClaims: (params) => {
    const { claims } = get();
    return claims.filter((claim) => {
      if (params.keyword) {
        const lowerKeyword = params.keyword.toLowerCase();
        const matchKeyword =
          claim.cardNo.toLowerCase().includes(lowerKeyword) ||
          claim.customerName.toLowerCase().includes(lowerKeyword) ||
          claim.phone.includes(params.keyword) ||
          claim.phoneModel.toLowerCase().includes(lowerKeyword);
        if (!matchKeyword) return false;
      }
      if (params.status && claim.status !== params.status) {
        return false;
      }
      if (params.storeId && claim.storeId !== params.storeId) {
        return false;
      }
      if (params.startDate && dayjs(claim.submitDate).isBefore(params.startDate)) {
        return false;
      }
      if (params.endDate && dayjs(claim.submitDate).isAfter(params.endDate)) {
        return false;
      }
      return true;
    });
  },

  getExpiringWarranties: (days) => {
    const { warranties } = get();
    const today = dayjs();
    return warranties.filter((w) => {
      if (w.status !== 'active') return false;
      const expireDate = dayjs(w.expireDate);
      const diff = expireDate.diff(today, 'day');
      return diff >= 0 && diff <= days;
    });
  },
}));
