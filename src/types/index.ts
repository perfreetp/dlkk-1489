export type WarrantyStatus = 'active' | 'expired' | 'cancelled';
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'disputed';
export type SolutionType = 'free' | 'discounted' | 'rejected' | 'escalated';
export type RiskLevel = 'low' | 'medium' | 'high';
export type UserRole = 'technician' | 'customer_service' | 'supervisor' | 'manager';

export interface Warranty {
  id: string;
  cardNo: string;
  customerName: string;
  phone: string;
  phoneModel: string;
  imei: string;
  repairContent: string;
  warrantyDays: number;
  issueDate: string;
  expireDate: string;
  exclusions: string[];
  storeId: string;
  storeName: string;
  technician: string;
  status: WarrantyStatus;
  claims: Claim[];
  signed: boolean;
  signDate?: string;
  remainingDays?: number;
}

export interface Claim {
  id: string;
  warrantyId: string;
  cardNo: string;
  customerName: string;
  phone: string;
  phoneModel: string;
  faultDescription: string;
  photos: string[];
  detectionResult: string;
  isCovered: boolean | null;
  rejectReason?: string;
  submitDate: string;
  status: ClaimStatus;
  repair?: Repair;
  storeId: string;
  storeName: string;
  handler?: string;
}

export interface Repair {
  id: string;
  claimId: string;
  solutionType: SolutionType;
  cost: number;
  parts: { name: string; cost: number }[];
  description: string;
  technician: string;
  completeDate: string;
  customerSigned: boolean;
  signDate?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  totalWarranties: number;
  totalClaims: number;
  approvalRate: number;
  avgRepairCost: number;
}

export interface BlacklistItem {
  id: string;
  customerName: string;
  phone: string;
  reason: string;
  level: RiskLevel;
  historyCount: number;
  createDate: string;
  lastIncident: string;
  notes?: string;
}

export interface VisitRecord {
  id: string;
  warrantyId: string;
  cardNo: string;
  customerName: string;
  phone: string;
  content: string;
  satisfaction: number;
  visitDate: string;
  operator: string;
  followUp?: string;
}

export interface StatsData {
  totalWarranties: number;
  activeWarranties: number;
  totalClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  approvalRate: number;
  avgRepairCost: number;
  totalRepairCost: number;
  expiringSoon: number;
  expiringToday: number;
  
  monthlyTrend: { month: string; issued: number; claimed: number }[];
  rejectReasons: { reason: string; count: number }[];
  storeRanking: { store: string; warranties: number; claims: number; rate: number }[];
  repairCostTrend: { month: string; cost: number }[];
  coverageDistribution: { range: string; count: number }[];
}

export interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  type: 'issue' | 'claim' | 'repair' | 'reminder' | 'visit';
}

export interface DisputeRecord {
  id: string;
  claimId: string;
  cardNo: string;
  customerName: string;
  phone: string;
  reason: string;
  submitDate: string;
  status: 'pending' | 'resolved_store' | 'resolved_customer' | 'resolved_manufacturer';
  liability?: 'store' | 'customer' | 'manufacturer';
  handler?: string;
  resolution?: string;
  originalWorkOrder: {
    repairContent: string;
    technician: string;
    date: string;
    photos: string[];
  };
  currentPhotos: string[];
  detectionReport: string;
}

export interface FormOption {
  value: string;
  label: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface QueryParams {
  keyword?: string;
  status?: string;
  storeId?: string;
  startDate?: string;
  endDate?: string;
}
