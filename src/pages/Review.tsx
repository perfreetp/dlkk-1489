import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
  Handshake,
  MessageSquare,
  AlertOctagon,
  Star,
  User,
  Building,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Search,
  Download,
} from 'lucide-react';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/Layout';
import { StatusBadge } from '@/components/Card';
import { Select, Input } from '@/components/Form';
import { useWarrantyStore } from '@/store/warrantyStore';
import { getStoreOptions } from '@/data/stores';
import type { FormOption, Warranty, Claim } from '@/types';

const statusOptions: FormOption[] = [
  { value: '', label: '全部' },
  { value: 'resolved_store', label: '门店责任' },
  { value: 'resolved_customer', label: '客户责任' },
  { value: 'resolved_manufacturer', label: '厂商责任' },
  { value: 'rejected', label: '已驳回' },
  { value: 'escalated', label: '已升级' },
];

const satisfactionOptions: FormOption[] = [
  { value: '', label: '全部' },
  { value: '5', label: '5星（非常满意）' },
  { value: '4', label: '4星（满意）' },
  { value: '3', label: '3星（一般）' },
  { value: '2', label: '2星（不满意）' },
  { value: '1', label: '1星（非常不满意）' },
];

export default function Review() {
  const { disputes, visits, warranties, claims, stores, getWarrantyJourney, getVisitsByClaimId, getDisputesByClaimId } = useWarrantyStore();
  const storeOptions = getStoreOptions();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    storeId: '',
    handler: '',
    status: '',
    satisfaction: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [journeyWarrantyId, setJourneyWarrantyId] = useState<string | null>(null);
  const [searchCardNo, setSearchCardNo] = useState('');

  useEffect(() => {
    const cardNo = searchParams.get('cardNo');
    if (cardNo) {
      setSearchCardNo(cardNo);
      const found = warranties.find((w) => w.cardNo.toLowerCase() === cardNo.toLowerCase());
      if (found) {
        setJourneyWarrantyId(found.id);
      }
    }
  }, [searchParams, warranties]);

  const handlers = useMemo(() => {
    const set = new Set<string>();
    disputes.forEach((d) => d.handler && set.add(d.handler));
    return Array.from(set).map((h) => ({ value: h, label: h }));
  }, [disputes]);

  const resolvedDisputes = useMemo(() => {
    return disputes.filter((d) => d.status !== 'pending');
  }, [disputes]);

  const filteredDisputes = useMemo(() => {
    return resolvedDisputes.filter((d) => {
      if (filters.storeId) {
        const claim = claims.find((c) => c.id === d.claimId);
        if (claim?.storeId !== filters.storeId) return false;
      }
      if (filters.handler && d.handler !== filters.handler) return false;
      if (filters.status && d.status !== filters.status) return false;
      if (filters.startDate && d.handleDate) {
        if (dayjs(d.handleDate).isBefore(dayjs(filters.startDate))) return false;
      }
      if (filters.endDate && d.handleDate) {
        if (dayjs(d.handleDate).isAfter(dayjs(filters.endDate).endOf('day'))) return false;
      }
      if (filters.satisfaction) {
        const claimVisits = getVisitsByClaimId(d.claimId);
        const targetSatisfaction = parseInt(filters.satisfaction);
        if (!claimVisits.some((v) => v.satisfaction === targetSatisfaction)) return false;
      }
      return true;
    });
  }, [resolvedDisputes, filters, claims, getVisitsByClaimId]);

  const selectedDispute = useMemo(() => {
    return filteredDisputes.find((d) => d.id === selectedDisputeId) || null;
  }, [filteredDisputes, selectedDisputeId]);

  const selectedDisputeWarranty = useMemo(() => {
    if (!selectedDispute) return null;
    const claim = claims.find((c) => c.id === selectedDispute.claimId);
    return claim ? warranties.find((w) => w.id === claim.warrantyId) || null : null;
  }, [selectedDispute, claims, warranties]);

  const selectedDisputeClaim = useMemo(() => {
    if (!selectedDispute) return null;
    return claims.find((c) => c.id === selectedDispute.claimId) || null;
  }, [selectedDispute, claims]);

  const selectedDisputeVisits = useMemo(() => {
    if (!selectedDispute) return [];
    return getVisitsByClaimId(selectedDispute.claimId);
  }, [selectedDispute, getVisitsByClaimId]);

  const journey = useMemo(() => {
    if (!journeyWarrantyId) return null;
    return getWarrantyJourney(journeyWarrantyId);
  }, [journeyWarrantyId, getWarrantyJourney]);

  const searchedWarranty = useMemo(() => {
    if (!searchCardNo.trim()) return null;
    return warranties.find((w) => w.cardNo.toLowerCase().includes(searchCardNo.toLowerCase()));
  }, [searchCardNo, warranties]);

  const avgSatisfaction = useMemo(() => {
    const allClaimVisits = filteredDisputes.flatMap((d) => getVisitsByClaimId(d.claimId));
    if (allClaimVisits.length === 0) return 0;
    return allClaimVisits.reduce((sum, v) => sum + v.satisfaction, 0) / allClaimVisits.length;
  }, [filteredDisputes, getVisitsByClaimId]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-warning-400 fill-warning-400' : 'text-dark-600'}`}
        />
      ))}
    </div>
  );

  const getEventIcon = (iconName: string) => {
    const map: Record<string, any> = {
      Shield,
      FileText,
      CheckCircle,
      XCircle,
      Clock,
      Wrench,
      Handshake,
      MessageSquare,
      AlertOctagon,
    };
    return map[iconName] || FileText;
  };

  const getEventColor = (type: string) => {
    const map: Record<string, string> = {
      issue: 'text-primary-400 bg-primary-500/20',
      claim_submit: 'text-warning-400 bg-warning-500/20',
      claim_approved: 'text-success-400 bg-success-500/20',
      claim_rejected: 'text-danger-400 bg-danger-500/20',
      claim_pending: 'text-warning-400 bg-warning-500/20',
      repair_done: 'text-primary-400 bg-primary-500/20',
      signed: 'text-success-400 bg-success-500/20',
      dispute: 'text-danger-400 bg-danger-500/20',
      visit: 'text-primary-400 bg-primary-500/20',
    };
    return map[type] || 'text-dark-400 bg-dark-700';
  };

  const stats = [
    { label: '已处理争议', value: filteredDisputes.length, icon: AlertOctagon, color: 'primary' },
    { label: '门店责任', value: filteredDisputes.filter((d) => d.status === 'resolved_store').length, icon: Building, color: 'warning' },
    { label: '客户责任', value: filteredDisputes.filter((d) => d.status === 'resolved_customer').length, icon: User, color: 'danger' },
    { label: '平均满意度', value: avgSatisfaction.toFixed(1) + '星', icon: Star, color: 'success' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="客服复盘"
        subtitle="按门店、客服、责任结果和满意度分析争议闭环效果，查看完整售后链路"
        breadcrumb={[{ label: '首页' }, { label: '客服复盘' }]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses: Record<string, string> = {
            primary: 'text-primary-400',
            warning: 'text-warning-400',
            danger: 'text-danger-400',
            success: 'text-success-400',
          };
          return (
            <div key={index} className="card p-4 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-400">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${colorClasses[stat.color]}`}>{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              className={`btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </button>
            {Object.values(filters).some((v) => v) && (
              <button
                className="btn-sm btn-ghost text-dark-400 hover:text-white"
                onClick={() =>
                  setFilters({ storeId: '', handler: '', status: '', satisfaction: '', startDate: '', endDate: '' })
                }
              >
                <X className="w-4 h-4 mr-2" />
                清除筛选
              </button>
            )}
            <span className="text-sm text-dark-400">共 {filteredDisputes.length} 条记录</span>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-dark-700">
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2">门店</label>
              <Select
                value={filters.storeId}
                onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
                options={[{ value: '', label: '全部' }, ...storeOptions]}
                placeholder="全部"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2">处理人</label>
              <Select
                value={filters.handler}
                onChange={(e) => setFilters({ ...filters, handler: e.target.value })}
                options={[{ value: '', label: '全部' }, ...handlers]}
                placeholder="全部"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2">责任结果</label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={statusOptions}
                placeholder="全部"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2">满意度</label>
              <Select
                value={filters.satisfaction}
                onChange={(e) => setFilters({ ...filters, satisfaction: e.target.value })}
                options={satisfactionOptions}
                placeholder="全部"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2">开始时间</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2">结束时间</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-4 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-danger-400" />
            争议闭环列表
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredDisputes.length === 0 ? (
              <div className="text-center py-12 text-dark-400">
                <AlertOctagon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无符合条件的争议记录</p>
              </div>
            ) : (
              filteredDisputes.map((d) => {
                const claim = claims.find((c) => c.id === d.claimId);
                const store = stores.find((s) => s.id === claim?.storeId);
                const claimVisits = getVisitsByClaimId(d.claimId);
                const avgSat =
                  claimVisits.length > 0
                    ? claimVisits.reduce((sum, v) => sum + v.satisfaction, 0) / claimVisits.length
                    : 0;
                return (
                  <div
                    key={d.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedDisputeId === d.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                    }`}
                    onClick={() => setSelectedDisputeId(d.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-md ${
                              d.status.startsWith('resolved')
                                ? 'bg-success-500/20 text-success-400'
                                : d.status === 'rejected'
                                ? 'bg-danger-500/20 text-danger-400'
                                : 'bg-warning-500/20 text-warning-400'
                            }`}
                          >
                            {d.status === 'resolved_store'
                              ? '门店责任'
                              : d.status === 'resolved_customer'
                              ? '客户责任'
                              : d.status === 'resolved_manufacturer'
                              ? '厂商责任'
                              : d.status === 'rejected'
                              ? '已驳回'
                              : '已升级'}
                          </span>
                          <span className="text-xs text-dark-400 font-mono">{d.cardNo}</span>
                        </div>
                        <p className="text-sm text-white font-medium">{d.customerName}</p>
                      </div>
                      {claimVisits.length > 0 && renderStars(Math.round(avgSat))}
                    </div>
                    <p className="text-sm text-dark-300 mb-2 line-clamp-2">{d.reason}</p>
                    <div className="flex items-center justify-between text-xs text-dark-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {store?.name || '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {d.handler || '-'}
                        </span>
                      </div>
                      <span>{d.handleDate || d.submitDate}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card p-4 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary-400" />
            完整售后链路
            {selectedDisputeWarranty && (
              <span className="text-sm font-normal text-dark-400 ml-2">{selectedDisputeWarranty.cardNo}</span>
            )}
          </h3>

          {!selectedDispute ? (
            <div className="text-center py-20 text-dark-400">
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">请从左侧选择一条争议记录</p>
              <p className="text-sm mt-2">查看该售后的完整链路</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {selectedDisputeWarranty && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-dark-400">质保卡号</p>
                      <p className="text-sm font-mono text-primary-400 font-medium">
                        {selectedDisputeWarranty.cardNo}
                      </p>
                    </div>
                    <button
                      className="btn-sm btn-secondary"
                      onClick={() => setJourneyWarrantyId(selectedDisputeWarranty!.id)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      查看完整时间轴
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-dark-400 text-xs">客户</span>
                      <p className="text-white">{selectedDisputeWarranty.customerName}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">机型</span>
                      <p className="text-white">{selectedDisputeWarranty.phoneModel}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">维修内容</span>
                      <p className="text-white">{selectedDisputeWarranty.repairContent}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">发卡门店</span>
                      <p className="text-white">{selectedDisputeWarranty.storeName}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">发卡日期</span>
                      <p className="text-white">{selectedDisputeWarranty.issueDate}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">到期日期</span>
                      <p className="text-white">{selectedDisputeWarranty.expireDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDisputeClaim && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-warning-400" />
                    核销申请信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-dark-400 text-xs">申请单号</span>
                      <p className="text-white font-mono">{selectedDisputeClaim.id}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">申请门店</span>
                      <p className="text-white">{selectedDisputeClaim.storeName}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-dark-400 text-xs">故障描述</span>
                      <p className="text-white">{selectedDisputeClaim.faultDescription}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-dark-400 text-xs">检测结论</span>
                      <p className="text-white">{selectedDisputeClaim.detectionResult}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">申请时间</span>
                      <p className="text-white">{selectedDisputeClaim.submitDate}</p>
                    </div>
                    <div>
                      <span className="text-dark-400 text-xs">处理状态</span>
                      <StatusBadge type="claim" status={selectedDisputeClaim.status} />
                    </div>
                  </div>
                </div>
              )}

              {(() => {
                const repair = selectedDisputeClaim?.repair;
                if (!repair) return null;
                return (
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-4">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary-400" />
                      返修处理信息
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-dark-400 text-xs">处理方案</span>
                        <p className="text-white">
                          {repair.solutionType === 'free'
                            ? '免费维修'
                            : repair.solutionType === 'discounted'
                            ? '折价更换'
                            : repair.solutionType === 'escalated'
                            ? '升级主管'
                            : '拒保处理'}
                        </p>
                      </div>
                      <div>
                        <span className="text-dark-400 text-xs">费用</span>
                        <p className="text-white font-medium">¥{repair.cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-dark-400 text-xs">处理技师</span>
                        <p className="text-white">{repair.technician}</p>
                      </div>
                      <div>
                        <span className="text-dark-400 text-xs">完成时间</span>
                        <p className="text-white">{repair.completeDate}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-dark-400 text-xs">处理说明</span>
                        <p className="text-white">{repair.description}</p>
                      </div>
                      <div>
                        <span className="text-dark-400 text-xs">配件明细</span>
                        <p className="text-white">
                          {repair.parts.map((p) => p.name).join('、') || '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-dark-400 text-xs">客户签收</span>
                        <p className="text-white">
                          {repair.customerSigned
                            ? `已签收 (${repair.signDate})`
                            : '待签收'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-danger-400" />
                  争议处理信息
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-dark-400 text-xs">争议单号</span>
                    <p className="text-white font-mono">{selectedDispute.id}</p>
                  </div>
                  <div>
                    <span className="text-dark-400 text-xs">处理结果</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-md inline-block ${
                        selectedDispute.status.startsWith('resolved')
                          ? 'bg-success-500/20 text-success-400'
                          : selectedDispute.status === 'rejected'
                          ? 'bg-danger-500/20 text-danger-400'
                          : 'bg-warning-500/20 text-warning-400'
                      }`}
                    >
                      {selectedDispute.status === 'resolved_store'
                        ? '门店责任'
                        : selectedDispute.status === 'resolved_customer'
                        ? '客户责任'
                        : selectedDispute.status === 'resolved_manufacturer'
                        ? '厂商责任'
                        : selectedDispute.status === 'rejected'
                        ? '已驳回'
                        : '已升级'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-dark-400 text-xs">争议原因</span>
                    <p className="text-white">{selectedDispute.reason}</p>
                  </div>
                  {selectedDispute.liability && (
                    <div>
                      <span className="text-dark-400 text-xs">责任方</span>
                      <p className="text-white">
                        {selectedDispute.liability === 'store'
                          ? '门店'
                          : selectedDispute.liability === 'customer'
                          ? '客户'
                          : '厂商'}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-dark-400 text-xs">处理人</span>
                    <p className="text-white">{selectedDispute.handler || '-'}</p>
                  </div>
                  <div>
                    <span className="text-dark-400 text-xs">处理时间</span>
                    <p className="text-white">{selectedDispute.handleDate || '-'}</p>
                  </div>
                  {selectedDispute.resolution && (
                    <div className="col-span-2">
                      <span className="text-dark-400 text-xs">处理说明</span>
                      <p className="text-white">{selectedDispute.resolution}</p>
                    </div>
                  )}
                  {selectedDispute.notes && (
                    <div className="col-span-2">
                      <span className="text-dark-400 text-xs">备注</span>
                      <p className="text-warning-300 bg-warning-500/10 p-2 rounded-lg border border-warning-500/30">
                        {selectedDispute.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedDisputeVisits.length > 0 && (
                <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-400" />
                    回访记录 ({selectedDisputeVisits.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedDisputeVisits.map((v) => (
                      <div key={v.id} className="p-3 bg-dark-900/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{v.operator}</span>
                            <span className="text-xs text-dark-400">{v.visitDate}</span>
                          </div>
                          {renderStars(v.satisfaction)}
                        </div>
                        <p className="text-sm text-dark-200">{v.content}</p>
                        {v.followUp && <p className="text-xs text-dark-400 mt-2">后续：{v.followUp}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card p-4 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            单卡旅程时间轴
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <Input
                placeholder="搜索质保卡号查看旅程"
                value={searchCardNo}
                onChange={(e) => setSearchCardNo(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            {searchedWarranty && (
              <button
                className="btn-sm btn-primary"
                onClick={() => setJourneyWarrantyId(searchedWarranty.id)}
              >
                查看旅程
              </button>
            )}
          </div>
        </div>

        {!journey ? (
          <div className="text-center py-16 text-dark-400">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">点击上方卡片的"查看完整时间轴"或搜索卡号</p>
            <p className="text-sm mt-2">查看从发卡到回访的完整售后旅程</p>
          </div>
        ) : (
          <div>
            <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">质保卡号</p>
                    <p className="text-lg font-mono text-primary-400 font-bold">{journey.warranty.cardNo}</p>
                  </div>
                  <div className="h-8 w-px bg-dark-700 mx-2" />
                  <div>
                    <p className="text-xs text-dark-400">客户</p>
                    <p className="text-white font-medium">{journey.warranty.customerName}</p>
                  </div>
                  <div className="h-8 w-px bg-dark-700 mx-2" />
                  <div>
                    <p className="text-xs text-dark-400">机型</p>
                    <p className="text-white font-medium">{journey.warranty.phoneModel}</p>
                  </div>
                  <div className="h-8 w-px bg-dark-700 mx-2" />
                  <div>
                    <p className="text-xs text-dark-400">门店</p>
                    <p className="text-white font-medium">{journey.warranty.storeName}</p>
                  </div>
                </div>
                <button
                  className="btn-sm btn-ghost text-dark-400 hover:text-white"
                  onClick={() => setJourneyWarrantyId(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  关闭
                </button>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-dark-700" />
              {journey.events.map((event: any, index: number) => {
                const EventIcon = getEventIcon(event.icon);
                return (
                  <div key={index} className="relative mb-6 last:mb-0">
                    <div
                      className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center ${getEventColor(
                        event.type
                      )}`}
                    >
                      <EventIcon className="w-3 h-3" />
                    </div>
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 ml-4 hover:border-dark-600 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                            {event.claimId && (
                              <span className="text-xs text-dark-400 font-mono">
                                申请单号：{event.claimId}
                              </span>
                            )}
                          </div>
                          {event.operator && (
                            <p className="text-xs text-dark-400 mt-0.5">
                              {event.store ? `${event.store} · ` : ''}
                              {event.operator}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-dark-400">{event.time}</span>
                      </div>
                      <p className="text-sm text-dark-200">{event.description}</p>
                      {event.detectionResult && (
                        <div className="mt-2 pt-2 border-t border-dark-700">
                          <p className="text-xs text-dark-400 mb-1">检测结论</p>
                          <p className="text-sm text-dark-300">{event.detectionResult}</p>
                        </div>
                      )}
                      {event.parts && event.parts.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dark-700">
                          <p className="text-xs text-dark-400 mb-1">更换配件</p>
                          <div className="flex flex-wrap gap-2">
                            {event.parts.map((p: any, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-md bg-dark-700 text-dark-200"
                              >
                                {p.name} ¥{p.cost}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {event.resolution && (
                        <div className="mt-2 pt-2 border-t border-dark-700">
                          <p className="text-xs text-dark-400 mb-1">处理说明</p>
                          <p className="text-sm text-dark-300">{event.resolution}</p>
                        </div>
                      )}
                      {event.followUp && (
                        <div className="mt-2 pt-2 border-t border-dark-700">
                          <p className="text-xs text-dark-400 mb-1">后续跟进</p>
                          <p className="text-sm text-dark-300">{event.followUp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
