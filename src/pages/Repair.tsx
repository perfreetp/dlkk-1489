import { useState } from 'react';
import {
  Wrench,
  RefreshCw,
  XCircle,
  Plus,
  Trash2,
  PenTool,
  Calendar,
  MessageSquare,
  Send,
  Save,
  Check,
  User,
  Phone,
  Smartphone,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/Layout';
import { StatusBadge } from '@/components/Card';
import { Input, Textarea } from '@/components/Form';
import { useWarrantyStore } from '@/store/warrantyStore';
import type { Claim, SolutionType, Repair as RepairType, FormOption } from '@/types';
import dayjs from 'dayjs';

interface PartItem {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

interface CommunicationRecord {
  id: string;
  time: string;
  content: string;
  operator: string;
}

interface FormData {
  selectedClaim: Claim | null;
  selectedSolution: SolutionType | null;
  parts: PartItem[];
  repairDescription: string;
  discountRate: string;
  customerPayAmount: string;
  remark: string;
  rejectReason: string;
  escalateToSupervisor: boolean;
  laborCost: string;
  discountAmount: string;
  customerSigned: boolean;
  signDate: string;
  newMessage: string;
  communicationRecords: CommunicationRecord[];
}

const solutionOptions: { type: SolutionType; title: string; description: string; theme: string; icon: typeof Wrench }[] = [
  {
    type: 'free',
    title: '免费维修',
    description: '符合保修条件，免费维修',
    theme: 'success',
    icon: Wrench,
  },
  {
    type: 'discounted',
    title: '折价更换',
    description: '不符合保修条件，提供折价优惠',
    theme: 'warning',
    icon: RefreshCw,
  },
  {
    type: 'rejected',
    title: '拒保处理',
    description: '拒绝保修，填写拒保说明',
    theme: 'danger',
    icon: XCircle,
  },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function Repair() {
  const { claims, addRepair, updateClaim } = useWarrantyStore();
  const approvedClaims = claims.filter((c) => c.status === 'approved' && !c.repair);

  const [formData, setFormData] = useState<FormData>({
    selectedClaim: null,
    selectedSolution: null,
    parts: [],
    repairDescription: '',
    discountRate: '50',
    customerPayAmount: '',
    remark: '',
    rejectReason: '',
    escalateToSupervisor: false,
    laborCost: '0',
    discountAmount: '0',
    customerSigned: false,
    signDate: '',
    newMessage: '',
    communicationRecords: [],
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRepair, setSubmittedRepair] = useState<RepairType | null>(null);

  const partsTotal = formData.parts.reduce((sum, part) => sum + part.quantity * part.cost, 0);
  const laborCost = parseFloat(formData.laborCost) || 0;
  const discountAmount = parseFloat(formData.discountAmount) || 0;
  const totalBeforeDiscount = partsTotal + laborCost;
  const customerActualPay = totalBeforeDiscount - discountAmount;

  const handleSelectClaim = (claim: Claim) => {
    setFormData((prev) => ({
      ...prev,
      selectedClaim: claim,
      selectedSolution: null,
      parts: [],
      repairDescription: '',
      discountRate: '50',
      customerPayAmount: '',
      remark: '',
      rejectReason: '',
      escalateToSupervisor: false,
      laborCost: '0',
      discountAmount: '0',
      customerSigned: false,
      signDate: '',
      communicationRecords: [
        {
          id: generateId(),
          time: dayjs().format('YYYY-MM-DD HH:mm'),
          content: `开始处理申请：${claim.faultDescription}`,
          operator: '当前操作员',
        },
      ],
    }));
  };

  const handleSelectSolution = (solution: SolutionType) => {
    setFormData((prev) => ({
      ...prev,
      selectedSolution: solution,
    }));
  };

  const handleAddPart = () => {
    const newPart: PartItem = {
      id: generateId(),
      name: '',
      quantity: 1,
      cost: 0,
    };
    setFormData((prev) => ({
      ...prev,
      parts: [...prev.parts, newPart],
    }));
  };

  const handleRemovePart = (partId: string) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p.id !== partId),
    }));
  };

  const handleUpdatePart = (partId: string, field: keyof PartItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.map((p) =>
        p.id === partId ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handleSign = () => {
    setFormData((prev) => ({
      ...prev,
      customerSigned: true,
      signDate: dayjs().format('YYYY-MM-DD'),
    }));
  };

  const handleAddMessage = () => {
    if (!formData.newMessage.trim()) return;

    const newRecord: CommunicationRecord = {
      id: generateId(),
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      content: formData.newMessage,
      operator: '当前操作员',
    };

    setFormData((prev) => ({
      ...prev,
      communicationRecords: [...prev.communicationRecords, newRecord],
      newMessage: '',
    }));
  };

  const handleSaveDraft = () => {
    alert('草稿已保存');
  };

  const handleSubmit = () => {
    if (!formData.selectedClaim || !formData.selectedSolution) {
      alert('请选择申请单和处理方案');
      return;
    }

    let cost = 0;
    let description = '';

    if (formData.selectedSolution === 'free') {
      cost = 0;
      description = formData.repairDescription || '免费维修';
    } else if (formData.selectedSolution === 'discounted') {
      cost = customerActualPay;
      description = formData.remark || formData.repairDescription || '折价更换';
    } else if (formData.selectedSolution === 'rejected') {
      cost = 0;
      description = formData.rejectReason || '拒保处理';
    }

    const solutionType = formData.escalateToSupervisor ? 'escalated' : formData.selectedSolution;

    const newRepair: Omit<RepairType, 'id'> = {
      claimId: formData.selectedClaim.id,
      solutionType,
      cost,
      parts: formData.parts.map((p) => ({ name: p.name, cost: p.cost * p.quantity })),
      description,
      technician: '当前操作员',
      completeDate: dayjs().format('YYYY-MM-DD'),
      customerSigned: formData.customerSigned,
      signDate: formData.customerSigned ? formData.signDate : undefined,
    };

    const createdRepair = addRepair(newRepair);
    updateClaim(formData.selectedClaim.id, {
      status: formData.selectedSolution === 'rejected' ? 'rejected' : 'approved',
      handler: '当前操作员',
    });

    setSubmittedRepair(createdRepair);
    setShowSuccess(true);
  };

  const handleReset = () => {
    setFormData({
      selectedClaim: null,
      selectedSolution: null,
      parts: [],
      repairDescription: '',
      discountRate: '50',
      customerPayAmount: '',
      remark: '',
      rejectReason: '',
      escalateToSupervisor: false,
      laborCost: '0',
      discountAmount: '0',
      customerSigned: false,
      signDate: '',
      newMessage: '',
      communicationRecords: [],
    });
    setShowSuccess(false);
    setSubmittedRepair(null);
  };

  const getThemeClasses = (theme: string, selected: boolean) => {
    const themeMap: Record<string, { border: string; bg: string; text: string; ring: string }> = {
      success: {
        border: selected ? 'border-success-500' : 'border-dark-600 hover:border-success-500/50',
        bg: selected ? 'bg-success-500/10' : 'bg-dark-800',
        text: 'text-success-400',
        ring: 'ring-success-500',
      },
      warning: {
        border: selected ? 'border-warning-500' : 'border-dark-600 hover:border-warning-500/50',
        bg: selected ? 'bg-warning-500/10' : 'bg-dark-800',
        text: 'text-warning-400',
        ring: 'ring-warning-500',
      },
      danger: {
        border: selected ? 'border-danger-500' : 'border-dark-600 hover:border-danger-500/50',
        bg: selected ? 'bg-danger-500/10' : 'bg-dark-800',
        text: 'text-danger-400',
        ring: 'ring-danger-500',
      },
    };
    return themeMap[theme] || themeMap.success;
  };

  const renderClaimInfo = () => {
    if (!formData.selectedClaim) return null;
    const claim = formData.selectedClaim;

    return (
      <div className="bg-dark-800 rounded-xl p-5 mb-6 border border-dark-600">
        <h3 className="font-medium text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" />
          申请单信息
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-dark-400">申请单号：</span>
            <span className="text-white font-medium">{claim.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-dark-400">质保卡号：</span>
            <span className="text-dark-200">{claim.cardNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-dark-500" />
            <span className="text-dark-400">客户：</span>
            <span className="text-dark-200">{claim.customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-dark-500" />
            <span className="text-dark-400">电话：</span>
            <span className="text-dark-200">{claim.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-dark-500" />
            <span className="text-dark-400">机型：</span>
            <span className="text-dark-200">{claim.phoneModel}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={claim.status} type="claim" className="text-xs" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="text-sm">
            <span className="text-dark-400">故障描述：</span>
            <p className="text-dark-200 mt-1">{claim.faultDescription}</p>
          </div>
          <div className="text-sm mt-3">
            <span className="text-dark-400">检测结论：</span>
            <p className="text-dark-200 mt-1">{claim.detectionResult}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSolutionCards = () => (
    <div className="mb-6">
      <h3 className="font-medium text-white mb-4">选择处理方案</h3>
      <div className="grid grid-cols-3 gap-4">
        {solutionOptions.map((option) => {
          const selected = formData.selectedSolution === option.type;
          const themeClasses = getThemeClasses(option.theme, selected);
          const Icon = option.icon;

          return (
            <div
              key={option.type}
              onClick={() => handleSelectSolution(option.type)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${themeClasses.border} ${themeClasses.bg}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${themeClasses.bg} ${themeClasses.text}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {selected && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${themeClasses.text.replace('text', 'bg')}`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h4 className={`font-semibold mb-1 ${themeClasses.text}`}>{option.title}</h4>
              <p className="text-sm text-dark-400">{option.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPartsTable = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white">更换配件明细</h4>
        <button
          type="button"
          onClick={handleAddPart}
          className="btn btn-outline text-sm py-2"
        >
          <Plus className="w-4 h-4 mr-1" />
          添加配件
        </button>
      </div>
      <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dark-700/50">
              <th className="px-4 py-3 text-left text-dark-300 font-medium">配件名称</th>
              <th className="px-4 py-3 text-left text-dark-300 font-medium w-28">数量</th>
              <th className="px-4 py-3 text-left text-dark-300 font-medium w-36">成本(元)</th>
              <th className="px-4 py-3 text-left text-dark-300 font-medium w-28">小计(元)</th>
              <th className="px-4 py-3 text-center text-dark-300 font-medium w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {formData.parts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-dark-500">
                  暂无配件，点击上方按钮添加
                </td>
              </tr>
            ) : (
              formData.parts.map((part) => (
                <tr key={part.id} className="border-t border-dark-700">
                  <td className="px-4 py-3">
                    <Input
                      placeholder="请输入配件名称"
                      value={part.name}
                      onChange={(e) => handleUpdatePart(part.id, 'name', e.target.value)}
                      className="bg-dark-900 border-dark-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min="1"
                      value={part.quantity}
                      onChange={(e) => handleUpdatePart(part.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="bg-dark-900 border-dark-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min="0"
                      value={part.cost}
                      onChange={(e) => handleUpdatePart(part.id, 'cost', parseFloat(e.target.value) || 0)}
                      className="bg-dark-900 border-dark-600"
                    />
                  </td>
                  <td className="px-4 py-3 text-dark-200 font-medium">
                    ¥{(part.quantity * part.cost).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemovePart(part.id)}
                      className="p-2 text-dark-400 hover:text-danger-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFreeRepairForm = () => (
    <div className="space-y-6">
      {renderPartsTable()}
      <Textarea
        label="维修说明"
        placeholder="请详细描述维修过程、更换的配件、注意事项等"
        value={formData.repairDescription}
        onChange={(e) => setFormData((prev) => ({ ...prev, repairDescription: e.target.value }))}
        rows={4}
      />
    </div>
  );

  const renderDiscountedForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="折价比例(%)"
          type="number"
          min="0"
          max="100"
          value={formData.discountRate}
          onChange={(e) => {
            const rate = e.target.value;
            setFormData((prev) => ({
              ...prev,
              discountRate: rate,
              discountAmount: (totalBeforeDiscount * (parseFloat(rate) / 100)).toFixed(2),
            }));
          }}
        />
        <Input
          label="客户自付金额(元)"
          type="number"
          min="0"
          value={formData.customerPayAmount}
          onChange={(e) => setFormData((prev) => ({ ...prev, customerPayAmount: e.target.value }))}
        />
      </div>
      {renderPartsTable()}
      <Textarea
        label="说明"
        placeholder="请详细说明折价原因、更换配件、客户需知等"
        value={formData.remark}
        onChange={(e) => setFormData((prev) => ({ ...prev, remark: e.target.value }))}
        rows={4}
      />
    </div>
  );

  const renderRejectedForm = () => (
    <div className="space-y-6">
      <Textarea
        label="拒保原因详细说明"
        placeholder="请详细说明拒保的原因，包括检测结果、不符合保修条款的具体依据等"
        value={formData.rejectReason}
        onChange={(e) => setFormData((prev) => ({ ...prev, rejectReason: e.target.value }))}
        rows={6}
      />
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="escalate"
          checked={formData.escalateToSupervisor}
          onChange={(e) => setFormData((prev) => ({ ...prev, escalateToSupervisor: e.target.checked }))}
          className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
        />
        <label htmlFor="escalate" className="text-dark-200 cursor-pointer">
          升级主管审核
        </label>
      </div>
    </div>
  );

  const renderSolutionForm = () => {
    if (!formData.selectedSolution) return null;

    const formMap: Record<SolutionType, () => JSX.Element> = {
      free: renderFreeRepairForm,
      discounted: renderDiscountedForm,
      rejected: renderRejectedForm,
      escalated: renderRejectedForm,
    };

    return (
      <div className="bg-dark-800 rounded-xl p-5 mb-6 border border-dark-600">
        <h3 className="font-medium text-white mb-4">处理方案详情</h3>
        {formMap[formData.selectedSolution]()}
      </div>
    );
  };

  const renderCostSummary = () => {
    if (!formData.selectedSolution || formData.selectedSolution === 'rejected') return null;

    return (
      <div className="bg-dark-800 rounded-xl p-5 mb-6 border border-dark-600">
        <h3 className="font-medium text-white mb-4">费用明细</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-300">配件费用小计</span>
            <span className="text-white font-medium">¥{partsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-300">工时费用</span>
            <div className="w-32">
              <Input
                type="number"
                min="0"
                value={formData.laborCost}
                onChange={(e) => setFormData((prev) => ({ ...prev, laborCost: e.target.value }))}
                className="bg-dark-900 border-dark-600 py-2 text-right"
              />
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-300">优惠金额</span>
            <div className="w-32">
              <Input
                type="number"
                min="0"
                value={formData.discountAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, discountAmount: e.target.value }))}
                className="bg-dark-900 border-dark-600 py-2 text-right text-danger-400"
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-white font-semibold">客户实付</span>
            <span className={`text-xl font-bold ${formData.selectedSolution === 'free' ? 'text-success-400' : 'text-primary-400'}`}>
              {formData.selectedSolution === 'free' ? '免费' : `¥${customerActualPay.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerSign = () => {
    if (!formData.selectedSolution || formData.selectedSolution === 'rejected') return null;

    return (
      <div className="bg-dark-800 rounded-xl p-5 mb-6 border border-dark-600">
        <h3 className="font-medium text-white mb-4">客户签收</h3>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="input-label">电子签名</label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                formData.customerSigned
                  ? 'border-success-500 bg-success-500/10'
                  : 'border-dark-600 bg-dark-900 hover:border-dark-500'
              }`}
            >
              {formData.customerSigned ? (
                <div>
                  <PenTool className="w-8 h-8 text-success-400 mx-auto mb-2" />
                  <p className="text-success-400 font-medium">已签名</p>
                  <p className="text-xs text-dark-400 mt-1">客户确认维修完成</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSign}
                  className="btn btn-outline w-full"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  模拟客户签名
                </button>
              )}
            </div>
          </div>
          <div className="w-48">
            <label className="input-label flex items-center gap-1">
              <Calendar className="w-4 h-4 text-dark-500" />
              签收日期
            </label>
            <Input
              type="date"
              value={formData.signDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, signDate: e.target.value }))}
              readOnly={formData.customerSigned}
              className="bg-dark-900 border-dark-600"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCommunicationRecords = () => (
    <div className="bg-dark-800 rounded-xl p-5 mb-6 border border-dark-600">
      <h3 className="font-medium text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary-400" />
        客户沟通记录
      </h3>
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
        {formData.communicationRecords.length === 0 ? (
          <p className="text-center text-dark-500 py-8">暂无沟通记录</p>
        ) : (
          formData.communicationRecords.map((record, index) => (
            <div key={record.id} className="flex gap-4">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index === 0 ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-600 text-dark-300'
                }`}>
                  {index === 0 ? <FileText className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                {index < formData.communicationRecords.length - 1 && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-dark-700" style={{ height: 'calc(100% + 16px)' }} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{record.operator}</span>
                  <span className="text-xs text-dark-500">{record.time}</span>
                </div>
                <p className="text-sm text-dark-300">{record.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="输入沟通记录内容..."
            value={formData.newMessage}
            onChange={(e) => setFormData((prev) => ({ ...prev, newMessage: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
            className="bg-dark-900 border-dark-600"
          />
        </div>
        <button
          type="button"
          onClick={handleAddMessage}
          className="btn btn-primary px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderSuccessModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">提交成功</h2>
        <p className="text-dark-400 mb-6">
          返修处理已完成，处理单号：<span className="text-primary-400">{submittedRepair?.id}</span>
        </p>
        <div className="space-y-3">
          <button className="btn btn-primary w-full" onClick={handleReset}>
            <Plus className="w-4 h-4 mr-2" />
            继续处理
          </button>
          <button className="btn btn-secondary w-full">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        title="返修处理"
        subtitle="根据检测结论执行返修方案"
        breadcrumb={[{ label: '首页' }, { label: '返修处理' }]}
      />

      <div className="flex gap-6">
        <div className="w-80 flex-shrink-0">
          <div className="bg-dark-800 rounded-xl p-4">
            <h3 className="font-medium text-white mb-4">待处理列表</h3>
            {approvedClaims.length === 0 ? (
              <p className="text-sm text-dark-500 text-center py-8">暂无待处理申请</p>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {approvedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => handleSelectClaim(claim)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.selectedClaim?.id === claim.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-500 bg-dark-700/50 hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{claim.cardNo}</span>
                      <StatusBadge status={claim.status} type="claim" className="text-xs" />
                    </div>
                    <p className="text-sm text-dark-300 mb-1">{claim.customerName} - {claim.phoneModel}</p>
                    <p className="text-xs text-dark-500 truncate">{claim.faultDescription}</p>
                    <p className="text-xs text-dark-500 mt-2">{claim.submitDate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          {!formData.selectedClaim ? (
            <div className="bg-dark-800 rounded-xl p-12 text-center">
              <Wrench className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">请选择待处理申请</h3>
              <p className="text-dark-500">从左侧列表中选择一个已通过审核的申请开始返修处理</p>
            </div>
          ) : (
            <>
              {renderClaimInfo()}
              {renderSolutionCards()}
              {renderSolutionForm()}
              {renderCostSummary()}
              {renderCustomerSign()}
              {renderCommunicationRecords()}

              <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
                <button
                  className="btn btn-secondary px-6"
                  onClick={handleSaveDraft}
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存草稿
                </button>
                <button
                  className="btn btn-primary px-6"
                  onClick={handleSubmit}
                  disabled={!formData.selectedSolution}
                >
                  <Check className="w-4 h-4 mr-2" />
                  提交处理
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSuccess && renderSuccessModal()}
    </div>
  );
}
