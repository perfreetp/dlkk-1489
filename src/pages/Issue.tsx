import { useState, useMemo, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Smartphone, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Copy,
  MessageSquare,
  Download,
  History,
  Eye,
  Send,
  X,
  Plus,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { PageHeader, Container } from '@/components/Layout';
import { Input, Select, Textarea } from '@/components/Form';
import { WarrantyCard } from '@/components/Card';
import { useWarrantyStore } from '@/store/warrantyStore';
import { getStoreOptions } from '@/data/stores';
import type { Warranty, BlacklistItem, FormOption } from '@/types';
import { cn } from '@/lib/utils';

const phoneBrandOptions: FormOption[] = [
  { value: 'iPhone 15 Pro Max', label: 'iPhone 15 Pro Max' },
  { value: 'iPhone 15 Pro', label: 'iPhone 15 Pro' },
  { value: 'iPhone 15', label: 'iPhone 15' },
  { value: 'iPhone 14 Pro Max', label: 'iPhone 14 Pro Max' },
  { value: 'iPhone 14 Pro', label: 'iPhone 14 Pro' },
  { value: 'iPhone 14', label: 'iPhone 14' },
  { value: '华为 Mate 60 Pro+', label: '华为 Mate 60 Pro+' },
  { value: '华为 Mate 60 Pro', label: '华为 Mate 60 Pro' },
  { value: '华为 Mate 60', label: '华为 Mate 60' },
  { value: '华为 P60 Pro', label: '华为 P60 Pro' },
  { value: '华为 P60', label: '华为 P60' },
  { value: '小米 14 Ultra', label: '小米 14 Ultra' },
  { value: '小米 14 Pro', label: '小米 14 Pro' },
  { value: '小米 14', label: '小米 14' },
  { value: '小米 13 Ultra', label: '小米 13 Ultra' },
  { value: 'OPPO Find X7 Ultra', label: 'OPPO Find X7 Ultra' },
  { value: 'OPPO Find X7', label: 'OPPO Find X7' },
  { value: 'OPPO Reno 11 Pro', label: 'OPPO Reno 11 Pro' },
  { value: 'vivo X100 Pro', label: 'vivo X100 Pro' },
  { value: 'vivo X100', label: 'vivo X100' },
  { value: 'vivo S18 Pro', label: 'vivo S18 Pro' },
];

const repairItemOptions: FormOption[] = [
  { value: '屏幕更换', label: '屏幕更换' },
  { value: '电池更换', label: '电池更换' },
  { value: '主板维修', label: '主板维修' },
  { value: '摄像头更换', label: '摄像头更换' },
  { value: '听筒维修', label: '听筒维修' },
  { value: '扬声器维修', label: '扬声器维修' },
  { value: '充电接口维修', label: '充电接口维修' },
  { value: '指纹识别维修', label: '指纹识别维修' },
  { value: '面容识别维修', label: '面容识别维修' },
  { value: '外壳更换', label: '外壳更换' },
  { value: '按键维修', label: '按键维修' },
  { value: '震动马达维修', label: '震动马达维修' },
];

const warrantyDaysOptions: FormOption[] = [
  { value: '30', label: '30天' },
  { value: '90', label: '90天' },
  { value: '180', label: '180天' },
  { value: '365', label: '365天' },
];

const defaultExclusions = ['人为损坏', '进水', '私自拆机', '外观磨损'];

interface FormData {
  customerName: string;
  phone: string;
  confirmPhone: string;
  storeId: string;
  phoneModel: string;
  imei: string;
  repairItems: string[];
  repairContent: string;
  warrantyDays: string;
  exclusions: string[];
  technician: string;
}

interface FormErrors {
  customerName?: string;
  phone?: string;
  confirmPhone?: string;
  storeId?: string;
  phoneModel?: string;
  imei?: string;
  repairItems?: string;
  repairContent?: string;
  warrantyDays?: string;
}

const phoneRegex = /^1[3-9]\d{9}$/;

export default function Issue() {
  const navigate = useNavigate();
  const { stores, addWarranty, getBlacklistByPhone } = useWarrantyStore();
  const storeOptions = getStoreOptions();

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    phone: '',
    confirmPhone: '',
    storeId: '',
    phoneModel: '',
    imei: '',
    repairItems: [],
    repairContent: '',
    warrantyDays: '90',
    exclusions: [...defaultExclusions],
    technician: '当前用户',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [blacklistInfo, setBlacklistInfo] = useState<BlacklistItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newExclusion, setNewExclusion] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [createdWarranty, setCreatedWarranty] = useState<Warranty | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const cardNo = useMemo(() => createdWarranty?.cardNo || '', [createdWarranty]);
  const previewCardNo = useMemo(() => {
    if (createdWarranty) return createdWarranty.cardNo;
    const dateStr = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `WB${dateStr}${random}`;
  }, [createdWarranty]);

  useEffect(() => {
    if (formData.phone && phoneRegex.test(formData.phone)) {
      const info = getBlacklistByPhone(formData.phone);
      setBlacklistInfo(info || null);
    } else {
      setBlacklistInfo(null);
    }
  }, [formData.phone, getBlacklistByPhone]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRepairItemToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      repairItems: prev.repairItems.includes(item)
        ? prev.repairItems.filter(i => i !== item)
        : [...prev.repairItems, item]
    }));
    if (errors.repairItems) {
      setErrors(prev => ({ ...prev, repairItems: undefined }));
    }
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim() && !formData.exclusions.includes(newExclusion.trim())) {
      setFormData(prev => ({
        ...prev,
        exclusions: [...prev.exclusions, newExclusion.trim()]
      }));
      setNewExclusion('');
    }
  };

  const handleRemoveExclusion = (exclusion: string) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter(e => e !== exclusion)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = '请输入客户姓名';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }

    if (!formData.confirmPhone.trim()) {
      newErrors.confirmPhone = '请确认手机号';
    } else if (formData.phone !== formData.confirmPhone) {
      newErrors.confirmPhone = '两次输入的手机号不一致';
    }

    if (!formData.storeId) {
      newErrors.storeId = '请选择门店';
    }

    if (!formData.phoneModel) {
      newErrors.phoneModel = '请选择手机品牌/机型';
    }

    if (!formData.imei.trim()) {
      newErrors.imei = '请输入IMEI号';
    } else if (formData.imei.trim().length < 15) {
      newErrors.imei = 'IMEI号至少15位';
    }

    if (formData.repairItems.length === 0) {
      newErrors.repairItems = '请选择维修项目';
    }

    if (!formData.repairContent.trim()) {
      newErrors.repairContent = '请输入维修内容描述';
    }

    if (!formData.warrantyDays) {
      newErrors.warrantyDays = '请选择保修天数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const previewWarranty = useMemo((): Warranty => {
    if (createdWarranty) return createdWarranty;
    const store = stores.find(s => s.id === formData.storeId);
    const warrantyDays = parseInt(formData.warrantyDays) || 90;
    const issueDate = dayjs().format('YYYY-MM-DD');
    const expireDate = dayjs().add(warrantyDays, 'day').format('YYYY-MM-DD');

    return {
      id: 'preview',
      cardNo: previewCardNo,
      customerName: formData.customerName || '客户姓名',
      phone: formData.phone || '13800138000',
      phoneModel: formData.phoneModel || 'iPhone 15 Pro',
      imei: formData.imei || '123456789012345',
      repairContent: formData.repairContent || formData.repairItems.join('、') || '屏幕更换',
      warrantyDays: warrantyDays,
      issueDate: issueDate,
      expireDate: expireDate,
      exclusions: formData.exclusions,
      storeId: formData.storeId || 'S001',
      storeName: store?.name || '中关村旗舰店',
      technician: formData.technician,
      status: 'active',
      claims: [],
      signed: false,
    };
  }, [formData, stores, previewCardNo, createdWarranty]);

  const smsContent = useMemo(() => {
    const currentCardNo = createdWarranty ? createdWarranty.cardNo : previewCardNo;
    const url = `https://warranty.example.com/query?cardNo=${currentCardNo}`;
    return `【XX维修】尊敬的${formData.customerName || '客户'}，您的${formData.phoneModel || '手机'}手机维修质保卡已生成，卡号${currentCardNo}，保修期${formData.warrantyDays || '90'}天。点击查看详情：${url}`;
  }, [formData.customerName, formData.phoneModel, formData.warrantyDays, previewCardNo, createdWarranty]);

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const store = stores.find(s => s.id === formData.storeId);
    const warrantyDays = parseInt(formData.warrantyDays);
    const issueDate = dayjs().format('YYYY-MM-DD');
    const expireDate = dayjs().add(warrantyDays, 'day').format('YYYY-MM-DD');

    const newWarranty = addWarranty({
      customerName: formData.customerName,
      phone: formData.phone,
      phoneModel: formData.phoneModel,
      imei: formData.imei,
      repairContent: formData.repairContent,
      warrantyDays: warrantyDays,
      issueDate: issueDate,
      expireDate: expireDate,
      exclusions: formData.exclusions,
      storeId: formData.storeId,
      storeName: store?.name || '',
      technician: formData.technician,
      status: 'active',
      claims: [],
      signed: false,
    });

    setCreatedWarranty(newWarranty);
    setShowSuccessModal(true);
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-danger-400 bg-danger-500/10 border-danger-500/30';
      case 'medium': return 'text-warning-400 bg-warning-500/10 border-warning-500/30';
      case 'low': return 'text-info-400 bg-info-500/10 border-info-500/30';
      default: return 'text-dark-400 bg-dark-500/10 border-dark-500/30';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      default: return '未知';
    }
  };

  return (
    <Container>
      <PageHeader
        title="质保卡发放"
        subtitle="根据维修项目生成电子质保卡"
        action={
          <button className="btn btn-secondary">
            <History className="w-4 h-4" />
            <span>历史记录</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-400" />
              客户信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="客户姓名"
                placeholder="请输入客户姓名"
                icon={User}
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                error={errors.customerName}
              />
              <div />
              <Input
                label="手机号"
                placeholder="请输入手机号"
                icon={Phone}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                maxLength={11}
              />
              <Input
                label="确认手机号"
                placeholder="请再次输入手机号"
                icon={Phone}
                value={formData.confirmPhone}
                onChange={(e) => handleInputChange('confirmPhone', e.target.value)}
                error={errors.confirmPhone}
                maxLength={11}
              />
            </div>

            {blacklistInfo && (
              <div className={cn(
                "mt-4 p-4 rounded-xl border",
                getRiskLevelColor(blacklistInfo.level)
              )}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">黑名单检测</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        getRiskLevelColor(blacklistInfo.level)
                      )}>
                        {getRiskLevelText(blacklistInfo.level)}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      <strong>风险原因：</strong>{blacklistInfo.reason}
                    </p>
                    <p className="text-sm opacity-80">
                      <strong>历史记录：</strong>该用户已有 {blacklistInfo.historyCount} 次不良记录
                    </p>
                    {blacklistInfo.notes && (
                      <p className="text-sm opacity-80 mt-1">
                        <strong>备注：</strong>{blacklistInfo.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {formData.phone && phoneRegex.test(formData.phone) && !blacklistInfo && (
              <div className="mt-4 p-4 rounded-xl border border-success-500/30 bg-success-500/10 text-success-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">手机号正常，未在黑名单中</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary-400" />
              设备信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="门店选择"
                options={storeOptions}
                placeholder="请选择门店"
                value={formData.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                error={errors.storeId}
              />
              <Select
                label="手机品牌/机型"
                options={phoneBrandOptions}
                placeholder="请选择手机品牌/机型"
                value={formData.phoneModel}
                onChange={(e) => handleInputChange('phoneModel', e.target.value)}
                error={errors.phoneModel}
              />
              <Input
                label="IMEI号"
                placeholder="请输入15位IMEI号"
                icon={Smartphone}
                value={formData.imei}
                onChange={(e) => handleInputChange('imei', e.target.value)}
                error={errors.imei}
                maxLength={15}
              />
              <div />
            </div>

            <div className="mt-4">
              <label className="input-label mb-2 block">
                维修项目选择 <span className="text-danger-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {repairItemOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRepairItemToggle(option.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      formData.repairItems.includes(option.value)
                        ? "bg-primary-500 text-white"
                        : "bg-dark-700 text-dark-200 hover:bg-dark-600"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.repairItems && (
                <p className="mt-1 text-xs text-danger-400">{errors.repairItems}</p>
              )}
            </div>

            <div className="mt-4">
              <Textarea
                label="维修内容描述"
                placeholder="请详细描述维修内容..."
                value={formData.repairContent}
                onChange={(e) => handleInputChange('repairContent', e.target.value)}
                error={errors.repairContent}
                rows={4}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-400" />
              保修条款
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="保修天数"
                options={warrantyDaysOptions}
                placeholder="请选择保修天数"
                value={formData.warrantyDays}
                onChange={(e) => handleInputChange('warrantyDays', e.target.value)}
                error={errors.warrantyDays}
              />
              <Input
                label="经手人"
                placeholder="经手人"
                icon={User}
                value={formData.technician}
                onChange={(e) => handleInputChange('technician', e.target.value)}
              />
            </div>

            <div className="mt-4">
              <label className="input-label mb-2 block">排除条款</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.exclusions.map((exclusion) => (
                  <span
                    key={exclusion}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dark-700 text-dark-200 text-sm"
                  >
                    {exclusion}
                    <button
                      type="button"
                      onClick={() => handleRemoveExclusion(exclusion)}
                      className="hover:text-danger-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="添加排除条款"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExclusion())}
                />
                <button
                  type="button"
                  onClick={handleAddExclusion}
                  className="btn btn-primary px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handlePreview}
              className="btn btn-secondary flex-1"
            >
              <Eye className="w-4 h-4" />
              <span>预览质保卡</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary flex-1"
            >
              <Send className="w-4 h-4" />
              <span>生成并发送</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-400" />
              实时预览
            </h3>
            <WarrantyCard warranty={previewWarranty} showQR />
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary-400" />
              二维码
            </h3>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG
                  value={`https://warranty.example.com/query?cardNo=${createdWarranty ? createdWarranty.cardNo : previewCardNo}`}
                  size={160}
                  level="M"
                />
              </div>
            </div>
            <p className="text-center text-sm text-dark-400 mt-3">
              卡号：<span className="font-mono text-primary-400">{createdWarranty ? createdWarranty.cardNo : previewCardNo}</span>
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-400" />
              短信文案预览
            </h3>
            <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
              <p className="text-dark-200 text-sm leading-relaxed">{smsContent}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(smsContent, 'sms')}
              className="btn btn-secondary w-full mt-4"
            >
              {copySuccess === 'sms' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-400" />
                  <span className="text-success-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制短信文案</span>
                </>
              )}
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-400" />
              分享功能
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleCopy(`https://warranty.example.com/query?cardNo=${createdWarranty ? createdWarranty.cardNo : previewCardNo}`, 'link')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                {copySuccess === 'link' ? (
                  <CheckCircle className="w-6 h-6 text-success-400" />
                ) : (
                  <Copy className="w-6 h-6 text-primary-400" />
                )}
                <span className="text-sm text-dark-200">
                  {copySuccess === 'link' ? '已复制' : '复制链接'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(smsContent, 'sms2')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-primary-400" />
                <span className="text-sm text-dark-200">发送短信</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                <Download className="w-6 h-6 text-primary-400" />
                <span className="text-sm text-dark-200">下载图片</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && createdWarranty && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-8 max-w-md w-full mx-4">
            <div className="w-20 h-20 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">质保卡生成成功</h2>
            <div className="bg-dark-900/50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> 质保卡号
                </span>
                <span className="text-primary-400 font-mono font-bold text-lg">{createdWarranty.cardNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">客户</span>
                <span className="text-white">{createdWarranty.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">机型</span>
                <span className="text-white">{createdWarranty.phoneModel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">保修期</span>
                <span className="text-success-400">{createdWarranty.warrantyDays}天（至{createdWarranty.expireDate}）</span>
              </div>
            </div>
            <div className="space-y-3">
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  navigate('/query');
                }}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                去客户查询页验证
              </button>
              <button
                className="btn btn-secondary w-full"
                onClick={() => {
                  setFormData({
                    customerName: '',
                    phone: '',
                    confirmPhone: '',
                    storeId: '',
                    phoneModel: '',
                    imei: '',
                    repairItems: [],
                    repairContent: '',
                    warrantyDays: '90',
                    exclusions: [...defaultExclusions],
                    technician: '当前用户',
                  });
                  setCreatedWarranty(null);
                  setShowSuccessModal(false);
                  setShowPreview(false);
                }}
              >
                继续发放新卡
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
