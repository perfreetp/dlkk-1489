import { useState } from 'react';
import { AlertTriangle, UserPlus, X, ChevronRight, Check, XCircle, ArrowUp, Eye, Trash2, Edit3, FileText, Camera, User, Clock, Building } from 'lucide-react';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/Layout';
import { StatusBadge } from '@/components/Card';
import { Input, Select, Textarea } from '@/components/Form';
import DataTable from '@/components/Table/DataTable';
import { useWarrantyStore } from '@/store/warrantyStore';
import { getStoreOptions } from '@/data/stores';
import type { DisputeRecord, BlacklistItem, RiskLevel, FormOption } from '@/types';
import { cn } from '@/lib/utils';

type TabType = 'pending' | 'blacklist' | 'history';

interface FilterState {
  storeId: string;
  startDate: string;
  endDate: string;
  priority: string;
}

interface BlacklistForm {
  customerName: string;
  phone: string;
  level: RiskLevel | '';
  reason: string;
  notes: string;
}

const priorityOptions: FormOption[] = [
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

const liabilityOptions: FormOption[] = [
  { value: 'store', label: '门店责任' },
  { value: 'customer', label: '客户责任' },
  { value: 'manufacturer', label: '厂商责任' },
];

const riskLevelOptions: FormOption[] = [
  { value: 'high', label: '高风险' },
  { value: 'medium', label: '中风险' },
  { value: 'low', label: '低风险' },
];

const tabLabels: Record<TabType, string> = {
  pending: '争议待处理',
  blacklist: '黑名单管理',
  history: '已处理记录',
};

export default function Audit() {
  const { disputes, blacklist, stores, updateDispute, addToBlacklist, removeFromBlacklist } = useWarrantyStore();
  const storeOptions = getStoreOptions();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [filters, setFilters] = useState<FilterState>({
    storeId: '',
    startDate: '',
    endDate: '',
    priority: '',
  });
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [expandedBlacklistId, setExpandedBlacklistId] = useState<string | null>(null);
  const [liability, setLiability] = useState<string>('');
  const [auditNotes, setAuditNotes] = useState('');
  const [blacklistForm, setBlacklistForm] = useState<BlacklistForm>({
    customerName: '',
    phone: '',
    level: '',
    reason: '',
    notes: '',
  });
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const pendingDisputes = disputes.filter(d => d.status === 'pending');
  const resolvedDisputes = disputes.filter(d => d.status !== 'pending');

  const filteredPendingDisputes = pendingDisputes.filter(dispute => {
    if (filters.storeId && stores.find(s => s.id === filters.storeId)?.name !== dispute.claimId.slice(0, 4)) {
      const store = stores.find(s => s.name === dispute.claimId.slice(0, 4));
      if (store && store.id !== filters.storeId) return false;
    }
    if (filters.startDate && dayjs(dispute.submitDate).isBefore(filters.startDate)) return false;
    if (filters.endDate && dayjs(dispute.submitDate).isAfter(filters.endDate)) return false;
    return true;
  });

  const handleRowClick = (dispute: DisputeRecord) => {
    setSelectedDispute(dispute);
    setLiability('');
    setAuditNotes('');
    setShowDetailDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDetailDrawer(false);
    setSelectedDispute(null);
    setLiability('');
    setAuditNotes('');
  };

  const handleApprove = () => {
    if (!selectedDispute || !liability) {
      alert('请先选择责任方');
      return;
    }
    const statusMap: Record<string, DisputeRecord['status']> = {
      store: 'resolved_store',
      customer: 'resolved_customer',
      manufacturer: 'resolved_manufacturer',
    };
    const resolutionMap: Record<string, string> = {
      store: '门店责任：承担返修成本，影响门店绩效',
      customer: '客户责任：维持拒保决定',
      manufacturer: '厂商责任：上报厂商处理',
    };
    updateDispute(selectedDispute.id, {
      status: statusMap[liability],
      liability: liability as DisputeRecord['liability'],
      resolution: resolutionMap[liability],
      handler: '当前审核员',
      handleDate: dayjs().format('YYYY-MM-DD HH:mm'),
      notes: auditNotes || undefined,
    });
    handleCloseDrawer();
    alert('审核通过，已记录处理结果');
  };

  const handleReject = () => {
    if (!selectedDispute) return;
    if (!auditNotes.trim()) {
      alert('请填写驳回原因');
      return;
    }
    updateDispute(selectedDispute.id, {
      status: 'rejected',
      handler: '当前审核员',
      handleDate: dayjs().format('YYYY-MM-DD HH:mm'),
      resolution: '驳回：需补充材料后重新提交',
      notes: auditNotes,
    });
    handleCloseDrawer();
    alert('已驳回，需要补充材料');
  };

  const handleEscalate = () => {
    if (!selectedDispute) return;
    updateDispute(selectedDispute.id, {
      status: 'escalated',
      handler: '当前审核员',
      handleDate: dayjs().format('YYYY-MM-DD HH:mm'),
      resolution: '升级：已提交至主管处理',
      notes: auditNotes || undefined,
    });
    handleCloseDrawer();
    alert('已升级至主管处理');
  };

  const handleAddBlacklist = () => {
    setBlacklistForm({
      customerName: '',
      phone: '',
      level: '',
      reason: '',
      notes: '',
    });
    setShowBlacklistModal(true);
  };

  const handleSubmitBlacklist = () => {
    if (!blacklistForm.customerName.trim()) {
      alert('请输入客户姓名');
      return;
    }
    if (!blacklistForm.phone.trim()) {
      alert('请输入手机号');
      return;
    }
    if (!blacklistForm.level) {
      alert('请选择风险等级');
      return;
    }
    if (!blacklistForm.reason.trim()) {
      alert('请输入列入原因');
      return;
    }
    addToBlacklist({
      customerName: blacklistForm.customerName,
      phone: blacklistForm.phone,
      level: blacklistForm.level as RiskLevel,
      reason: blacklistForm.reason,
      historyCount: 1,
      createDate: dayjs().format('YYYY-MM-DD'),
      lastIncident: dayjs().format('YYYY-MM-DD'),
      notes: blacklistForm.notes || undefined,
    });
    setShowBlacklistModal(false);
    alert('已添加至黑名单');
  };

  const handleRemoveBlacklist = (id: string) => {
    if (confirm('确定要从黑名单中移除该客户吗？')) {
      removeFromBlacklist(id);
    }
  };

  const handleViewBlacklistDetail = (item: BlacklistItem) => {
    alert(`查看 ${item.customerName} 的详细信息`);
  };

  const toggleBlacklistExpand = (id: string) => {
    setExpandedBlacklistId(expandedBlacklistId === id ? null : id);
  };

  const handleEditNotes = (item: BlacklistItem) => {
    setEditingNotesId(item.id);
    setEditingNotes(item.notes || '');
  };

  const handleSaveNotes = () => {
    alert('备注已保存');
    setEditingNotesId(null);
    setEditingNotes('');
  };

  const disputeColumns = [
    {
      key: 'id',
      title: '争议单号',
      width: '120px',
      render: (row: DisputeRecord) => (
        <span className="font-mono text-sm text-primary-400">{row.id}</span>
      ),
    },
    {
      key: 'cardNo',
      title: '质保卡号',
      width: '140px',
      render: (row: DisputeRecord) => (
        <span className="font-mono text-sm">{row.cardNo}</span>
      ),
    },
    {
      key: 'customerName',
      title: '客户名',
      width: '100px',
    },
    {
      key: 'storeName',
      title: '门店',
      width: '120px',
      render: (row: DisputeRecord) => (
        <span className="text-dark-200">{row.claimId.includes('C00') ? '北京朝阳店' : '其他门店'}</span>
      ),
    },
    {
      key: 'submitDate',
      title: '提交时间',
      width: '140px',
      render: (row: DisputeRecord) => (
        <span className="text-dark-300">{dayjs(row.submitDate).format('YYYY-MM-DD HH:mm')}</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (row: DisputeRecord) => <StatusBadge status={row.status} />,
    },
    {
      key: 'action',
      title: '操作',
      width: '100px',
      render: (row: DisputeRecord) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
          className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm"
        >
          处理 <ChevronRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const historyColumns = [
    ...disputeColumns.filter(c => c.key !== 'action'),
    {
      key: 'liability',
      title: '处理结果',
      width: '120px',
      render: (row: DisputeRecord) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: 'handler',
      title: '处理人',
      width: '100px',
      render: (row: DisputeRecord) => (
        <span className="text-dark-300">{row.handler || '-'}</span>
      ),
    },
    {
      key: 'handleDate',
      title: '处理时间',
      width: '140px',
      render: (row: DisputeRecord) => (
        <span className="text-dark-400 text-sm">{row.handleDate || '-'}</span>
      ),
    },
    {
      key: 'resolution',
      title: '处理说明',
      width: '200px',
      render: (row: DisputeRecord) => (
        <span className="text-dark-300 text-sm">{row.resolution || '-'}</span>
      ),
    },
    {
      key: 'notes',
      title: '备注',
      width: '160px',
      render: (row: DisputeRecord) => (
        <span className="text-dark-400 text-sm line-clamp-1" title={row.notes}>
          {row.notes || '-'}
        </span>
      ),
    },
  ];



  const getLiabilityDescription = () => {
    switch (liability) {
      case 'store':
        return '承担返修成本，影响门店绩效';
      case 'customer':
        return '维持拒保决定';
      case 'manufacturer':
        return '上报厂商处理';
      default:
        return '请选择责任方';
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="门店审核"
        subtitle="处理争议单、查看原始工单、确认责任归属"
      />

      <div className="flex gap-2 mb-6">
        {(Object.keys(tabLabels) as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-all duration-200',
              activeTab === tab
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            )}
          >
            {tabLabels[tab]}
            {tab === 'pending' && pendingDisputes.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-danger-500 rounded-full">
                {pendingDisputes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && (
        <>
          <div className="card p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="门店"
                options={storeOptions}
                value={filters.storeId}
                onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
                placeholder="全部门店"
              />
              <Input
                label="开始日期"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <Input
                label="结束日期"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
              <Select
                label="优先级"
                options={priorityOptions}
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                placeholder="全部优先级"
              />
            </div>
          </div>

          <DataTable
            columns={disputeColumns}
            data={filteredPendingDisputes}
            onRowClick={handleRowClick}
            emptyText="暂无待处理争议单"
          />
        </>
      )}

      {activeTab === 'blacklist' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-dark-400">共 {blacklist.length} 条黑名单记录</p>
            <button
              onClick={handleAddBlacklist}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              添加黑名单
            </button>
          </div>

          <div className="space-y-3">
            {blacklist.map((item) => (
              <div key={item.id} className="card overflow-hidden">
                <div
                  onClick={() => toggleBlacklistExpand(item.id)}
                  className="cursor-pointer"
                >
                  <div className="grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-2">
                      <span className="font-medium text-white">{item.customerName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-mono text-sm text-dark-300">{item.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={item.level} type="risk" />
                    </div>
                    <div className="col-span-2">
                      <span className={cn(
                        'font-medium',
                        item.historyCount >= 5 ? 'text-danger-400' : item.historyCount >= 2 ? 'text-warning-400' : 'text-dark-300'
                      )}>
                        {item.historyCount} 次
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-dark-300">{item.createDate}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewBlacklistDetail(item); }}
                          className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveBlacklist(item.id); }}
                          className="p-1.5 text-dark-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                          title="移除黑名单"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {editingNotesId === item.id ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSaveNotes(); }}
                            className="p-1.5 text-success-400 hover:bg-success-500/10 rounded-lg transition-colors"
                            title="保存备注"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditNotes(item); }}
                            className="p-1.5 text-dark-400 hover:text-warning-400 hover:bg-warning-500/10 rounded-lg transition-colors"
                            title="编辑备注"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRight className={cn(
                          'w-4 h-4 text-dark-400 transition-transform',
                          expandedBlacklistId === item.id && 'rotate-90'
                        )} />
                      </div>
                    </div>
                  </div>
                </div>

                {editingNotesId === item.id && (
                  <div className="px-4 pb-4">
                    <Textarea
                      placeholder="输入备注信息..."
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                )}

                {expandedBlacklistId === item.id && (
                  <div className="border-t border-dark-700 p-4 bg-dark-800/50">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning-400" />
                      历史欺诈记录
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-dark-900/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-danger-500/20 flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-4 h-4 text-danger-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-200">{item.reason}</p>
                          <p className="text-xs text-dark-400 mt-1">{item.lastIncident}</p>
                        </div>
                      </div>
                      {item.historyCount > 1 && (
                        <div className="flex items-start gap-3 p-3 bg-dark-900/50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-warning-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 text-warning-400" />
                          </div>
                          <div>
                            <p className="text-sm text-dark-200">疑似故意损坏设备骗取保修</p>
                            <p className="text-xs text-dark-400 mt-1">2024-03-15</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {item.notes && editingNotesId !== item.id && (
                      <div className="mt-3 pt-3 border-t border-dark-700">
                        <p className="text-xs text-dark-400 mb-1">备注</p>
                        <p className="text-sm text-warning-300 bg-warning-500/10 rounded-lg p-3 border border-warning-500/30">
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {blacklist.length === 0 && (
              <div className="card p-12 text-center">
                <User className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-200 mb-2">暂无黑名单记录</h3>
                <p className="text-dark-400">点击右上角按钮添加黑名单</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <DataTable
          columns={historyColumns}
          data={resolvedDisputes}
          emptyText="暂无已处理记录"
        />
      )}

      {showDetailDrawer && selectedDispute && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseDrawer}
          />
          <div className="absolute top-0 right-0 bottom-0 w-full max-w-2xl bg-dark-800 shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white">争议单详情</h2>
                <p className="text-sm text-dark-400 mt-1">
                  单号：{selectedDispute.id} | {dayjs(selectedDispute.submitDate).format('YYYY-MM-DD HH:mm')}
                </p>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" />
                  争议原因
                </h3>
                <p className="text-dark-200">{selectedDispute.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-400" />
                    原始工单信息
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">维修内容</span>
                      <span className="text-dark-200">{selectedDispute.originalWorkOrder.repairContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">技师</span>
                      <span className="text-dark-200">{selectedDispute.originalWorkOrder.technician}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">日期</span>
                      <span className="text-dark-200">{selectedDispute.originalWorkOrder.date}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-dark-400 mb-2 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> 维修照片
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDispute.originalWorkOrder.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-dark-700 rounded-lg flex items-center justify-center text-dark-500 text-xs"
                        >
                          {photo}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning-400" />
                    当前故障信息
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-dark-400">故障描述</span>
                      <p className="text-dark-200 mt-1">{selectedDispute.reason}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-dark-400 mb-2 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> 故障照片
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDispute.currentPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-dark-700 rounded-lg flex items-center justify-center text-dark-500 text-xs"
                        >
                          {photo}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dark-700">
                    <p className="text-xs text-dark-400 mb-1">检测报告</p>
                    <p className="text-sm text-primary-300 bg-primary-500/10 rounded-lg p-2">
                      {selectedDispute.detectionReport}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-400" />
                  双方陈述
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-white">门店陈述</span>
                    </div>
                    <p className="text-sm text-dark-300">
                      客户设备电池鼓包是由于过充导致，属于人为损坏，且已过质保期。
                    </p>
                  </div>
                  <div className="bg-dark-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-warning-400" />
                      <span className="text-sm font-medium text-white">客户陈述</span>
                    </div>
                    <p className="text-sm text-dark-300">
                      电池在质保期内就有鼓包迹象，当时门店说正常使用没问题，现在刚过保就严重了。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-900/50 rounded-xl p-4 border border-primary-500/30">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary-400" />
                  责任判定
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">责任方</label>
                    <Select
                      options={liabilityOptions}
                      value={liability}
                      onChange={(e) => setLiability(e.target.value)}
                      placeholder="请选择责任方"
                    />
                  </div>
                  {liability && (
                    <div className={cn(
                      'rounded-lg p-4',
                      liability === 'store' && 'bg-danger-500/10 border border-danger-500/30',
                      liability === 'customer' && 'bg-dark-700/50 border border-dark-600',
                      liability === 'manufacturer' && 'bg-primary-500/10 border border-primary-500/30'
                    )}>
                      <p className="text-sm font-medium text-white mb-1">处理结果</p>
                      <p className={cn(
                        'text-sm',
                        liability === 'store' && 'text-danger-300',
                        liability === 'customer' && 'text-dark-300',
                        liability === 'manufacturer' && 'text-primary-300'
                      )}>
                        {getLiabilityDescription()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="input-label">审核备注</label>
                    <Textarea
                      placeholder="请输入审核备注信息..."
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-800 border-t border-dark-700 px-6 py-4 flex gap-3">
              <button
                onClick={handleEscalate}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <ArrowUp className="w-4 h-4" />
                升级
              </button>
              <button
                onClick={handleReject}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                驳回
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                通过
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlacklistModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">添加黑名单</h3>
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="客户姓名"
                placeholder="请输入客户姓名"
                value={blacklistForm.customerName}
                onChange={(e) => setBlacklistForm({ ...blacklistForm, customerName: e.target.value })}
              />
              <Input
                label="手机号"
                placeholder="请输入手机号"
                value={blacklistForm.phone}
                onChange={(e) => setBlacklistForm({ ...blacklistForm, phone: e.target.value })}
              />
              <Select
                label="风险等级"
                options={riskLevelOptions}
                value={blacklistForm.level}
                onChange={(e) => setBlacklistForm({ ...blacklistForm, level: e.target.value as RiskLevel })}
                placeholder="请选择风险等级"
              />
              <Textarea
                label="列入原因"
                placeholder="请输入列入黑名单的原因"
                value={blacklistForm.reason}
                onChange={(e) => setBlacklistForm({ ...blacklistForm, reason: e.target.value })}
                rows={3}
              />
              <Textarea
                label="备注"
                placeholder="请输入备注信息（选填）"
                value={blacklistForm.notes}
                onChange={(e) => setBlacklistForm({ ...blacklistForm, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="px-6 py-4 border-t border-dark-700 flex gap-3">
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmitBlacklist}
                className="flex-1 btn-primary"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
