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

const STORAGE_KEY = 'warranty_platform_state_v1';

interface PersistedState {
  warranties: Warranty[];
  claims: Claim[];
  repairs: Repair[];
  blacklist: BlacklistItem[];
  visits: VisitRecord[];
  disputes: DisputeRecord[];
}

const loadFromStorage = (): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage:', e);
  }
  return {};
};

const saveToStorage = (state: Partial<PersistedState>) => {
  try {
    const toSave: PersistedState = {
      warranties: state.warranties || [],
      claims: state.claims || [],
      repairs: state.repairs || [],
      blacklist: state.blacklist || [],
      visits: state.visits || [],
      disputes: state.disputes || [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save state to localStorage:', e);
  }
};

const stored = loadFromStorage();

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

  addWarranty: (warranty: Omit<Warranty, 'id' | 'cardNo'>) => Warranty;
  updateWarranty: (id: string, data: Partial<Warranty>) => void;
  addClaim: (claim: Omit<Claim, 'id'>) => Claim;
  updateClaim: (id: string, data: Partial<Claim>) => void;
  addRepair: (repair: Omit<Repair, 'id'>) => Repair;
  addDispute: (dispute: Omit<DisputeRecord, 'id'>) => DisputeRecord;
  updateDispute: (id: string, data: Partial<DisputeRecord>) => void;
  addToBlacklist: (item: Omit<BlacklistItem, 'id'>) => BlacklistItem;
  removeFromBlacklist: (id: string) => void;
  addVisit: (visit: Omit<VisitRecord, 'id'>) => VisitRecord;
  setCurrentWarranty: (warranty: Warranty | null) => void;
  setCurrentClaim: (claim: Claim | null) => void;
  getStats: () => StatsData;
  searchWarranties: (keyword: string) => Warranty[];
  searchClaims: (params: QueryParams) => Claim[];
  getExpiringWarranties: (days: number) => Warranty[];
  getBlacklistByPhone: (phone: string) => BlacklistItem | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateCardNo = () => {
  const dateStr = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `WB${dateStr}${random}`;
};

const hydrateWarrantyClaims = (warranties: Warranty[], claims: Claim[]): Warranty[] => {
  return warranties.map(w => ({
    ...w,
    claims: claims.filter(c => c.warrantyId === w.id),
  }));
};

const hydrateClaimRepair = (claims: Claim[], repairs: Repair[]): Claim[] => {
  return claims.map(c => {
    const repair = repairs.find(r => r.claimId === c.id);
    return repair ? { ...c, repair } : c;
  });
};

const initialWarrantiesRaw = stored.warranties ?? mockWarranties;
const initialClaimsRaw = stored.claims ?? mockClaims;
const initialRepairs = stored.repairs ?? mockRepairs;
const initialClaims = hydrateClaimRepair(initialClaimsRaw, initialRepairs);
const initialWarranties = hydrateWarrantyClaims(initialWarrantiesRaw, initialClaims);
const initialBlacklist = stored.blacklist ?? mockBlacklist;
const initialVisits = stored.visits ?? mockVisits;
const initialDisputes = stored.disputes ?? mockDisputes;

export const useWarrantyStore = create<WarrantyState>((set, get) => ({
  warranties: initialWarranties,
  claims: initialClaims,
  repairs: initialRepairs,
  stores: mockStores,
  blacklist: initialBlacklist,
  visits: initialVisits,
  disputes: initialDisputes,
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
    set((state) => {
      const newWarranties = [...state.warranties, newWarranty];
      saveToStorage({
        warranties: newWarranties,
        claims: state.claims,
        repairs: state.repairs,
        blacklist: state.blacklist,
        visits: state.visits,
        disputes: state.disputes,
      });
      return { warranties: newWarranties };
    });
    return newWarranty;
  },

  updateWarranty: (id, data) => {
    set((state) => {
      const newWarranties = state.warranties.map((w) =>
        w.id === id ? { ...w, ...data } : w
      );
      saveToStorage({
        warranties: newWarranties,
        claims: state.claims,
        repairs: state.repairs,
        blacklist: state.blacklist,
        visits: state.visits,
        disputes: state.disputes,
      });
      return { warranties: newWarranties };
    });
  },

  addClaim: (claim) => {
    const newClaim: Claim = {
      ...claim,
      id: `C${generateId()}`,
    };
    set((state) => {
      const newClaims = [...state.claims, newClaim];
      const newWarranties = state.warranties.map((w) =>
        w.id === claim.warrantyId
          ? { ...w, claims: [...w.claims, newClaim] }
          : w
      );
      saveToStorage({
        warranties: newWarranties,
        claims: newClaims,
        repairs: state.repairs,
        blacklist: state.blacklist,
        visits: state.visits,
        disputes: state.disputes,
      });
      return { claims: newClaims, warranties: newWarranties };
    });
    return newClaim;
  },

  updateClaim: (id, data) => {
    set((state) => {
      const newClaims = state.claims.map((c) =>
        c.id === id ? { ...c, ...data } : c
      );
      const newWarranties = state.warranties.map((w) => ({
        ...w,
        claims: w.claims.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
      saveToStorage({
        warranties: newWarranties,
        claims: newClaims,
        repairs: state.repairs,
        blacklist: state.blacklist,
        visits: state.visits,
        disputes: state.disputes,
      });
      return { claims: newClaims, warranties: newWarranties };
    });
  },

  addRepair: (repair) => {
    const newRepair: Repair = {
      ...repair,
      id: `R${generateId()}`,
    };
    set((state) => {
      const newRepairs = [...state.repairs, newRepair];
      const newClaims = state.claims.map((c) =>
        c.id === repair.claimId ? { ...c, repair: newRepair } : c
      );
      const newWarranties = state.warranties.map((w) => ({
        ...w,
        claims: w.claims.map((c) =>
          c.id === repair.claimId ? { ...c, repair: newRepair } : c
        ),
      }));
      saveToStorage({
        warranties: newWarranties,
        claims: newClaims,
        repairs: newRepairs,
        blacklist: state.blacklist,
        visits: state.visits,
        disputes: state.disputes,
      });
      return { repairs: newRepairs, claims: newClaims, warranties: newWarranties };
    });
    return newRepair;
  },

  addDispute: (dispute) => {
    const newDispute: DisputeRecord = {
      ...dispute,
      id: `D${generateId()}`,
    };
    set((state) => {
      const newDisputes = [...state.disputes, newDispute];
      saveToStorage({
        warranties: state.warranties,
        claims: state.claims,
        repairs: state.repairs,
        blacklist: state.blacklist,
        visits: state.visits,
        disputes: newDisputes,
      });
      return { disputes: newDisputes };
    });
    return newDispute;
  },

  updateDispute: (id, data) => {
    set((state) => {
      const newDisputes = state.disputes.map((d) =>
        d.id === id ? { ...d, ...data } : d
      );
      saveToStorage({
        warranties: state.warranties,
        claims: state.claims,
        repairs: state.repairs,
        blacklist: state.blacklist,
        visits: state.visits,
        disputes: newDisputes,
      });
      return { disputes: newDisputes };
    });
  },

  addToBlacklist: (item) => {
    const newItem: BlacklistItem = {
      ...item,
      id: `B${generateId()}`,
    };
    set((state) => {
      const newBlacklist = [...state.blacklist, newItem];
      saveToStorage({
        warranties: state.warranties,
        claims: state.claims,
        repairs: state.repairs,
        blacklist: newBlacklist,
        visits: state.visits,
        disputes: state.disputes,
      });
      return { blacklist: newBlacklist };
    });
    return newItem;
  },

  removeFromBlacklist: (id) => {
    set((state) => {
      const newBlacklist = state.blacklist.filter((item) => item.id !== id);
      saveToStorage({
        warranties: state.warranties,
        claims: state.claims,
        repairs: state.repairs,
        blacklist: newBlacklist,
        visits: state.visits,
        disputes: state.disputes,
      });
      return { blacklist: newBlacklist };
    });
  },

  addVisit: (visit) => {
    const newVisit: VisitRecord = {
      ...visit,
      id: `V${generateId()}`,
    };
    set((state) => {
      const newVisits = [...state.visits, newVisit];
      saveToStorage({
        warranties: state.warranties,
        claims: state.claims,
        repairs: state.repairs,
        blacklist: state.blacklist,
        visits: newVisits,
        disputes: state.disputes,
      });
      return { visits: newVisits };
    });
    return newVisit;
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

  getBlacklistByPhone: (phone) => {
    const { blacklist } = get();
    return blacklist.find((b) => b.phone === phone);
  },
}));
