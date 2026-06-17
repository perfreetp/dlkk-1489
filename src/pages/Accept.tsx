import { useState, useRef, useCallback, ChangeEvent, DragEvent } from 'react';
import { Search, Upload, X, Check, Clock, DollarSign, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PageHeader } from '@/components/Layout';
import { StatusBadge } from '@/components/Card';
import { Input, Select, Textarea } from '@/components/Form';
import { useWarrantyStore } from '@/store/warrantyStore';
import type { Warranty, Claim, FormOption } from '@/types';
import dayjs from 'dayjs';

const faultCategoryOptions: FormOption[] = [
  { value: 'screen', label: '屏幕故障' },
  { value: 'battery', label: '电池故障' },
  { value: 'camera', label: '摄像头故障' },
  { value: 'motherboard', label: '主板故障' },
  { value: 'other', label: '其他' },
];

const rejectReasonOptions: FormOption[] = [
  { value: 'human_damage', label: '人为损坏' },
  { value: 'water_damage', label: '进水' },
  { value: 'unauthorized_repair', label: '私自拆机' },
  { value: 'expired', label: '质保过期' },
  { value: 'other', label: '其他' },
];

const repairDurationOptions: FormOption[] = [
  { value: '1h', label: '1小时内' },
  { value: '1-3h', label: '1-3小时' },
  { value: '1d', label: '1天' },
  { value: '3d', label: '3天' },
  { value: '1w', label: '1周' },
];

const steps = [
  { id: 1, title: '查询质保卡' },
  { id: 2, title: '登记故障信息' },
  { id: 3, title: '检测评估' },
  { id: 4, title: '确认提交' },
];

interface PhotoItem {
  id: string;
  url: string;
  name: string;
}

interface FormData {
  warranty: Warranty | null;
  faultDescription: string;
  faultCategory: string;
  faultTime: string;
  photos: PhotoItem[];
  detectionResult: string;
  isCovered: boolean | null;
  rejectReason: string;
  rejectRemark: string;
  repairDuration: string;
  estimatedCost: string;
}

export default function Accept() {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Warranty[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    warranty: null,
    faultDescription: '',
    faultCategory: '',
    faultTime: '',
    photos: [],
    detectionResult: '',
    isCovered: null,
    rejectReason: '',
    rejectRemark: '',
    repairDuration: '',
    estimatedCost: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<Claim | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { warranties, claims, addClaim, searchWarranties } = useWarrantyStore();

  const pendingClaims = claims.filter((c) => c.status === 'pending').slice(0, 5);

  const handleSearch = useCallback(() => {
    if (!searchKeyword.trim()) {
      setSearchResults(warranties.slice(0, 10));
    } else {
      const results = searchWarranties(searchKeyword);
      setSearchResults(results);
    }
    setHasSearched(true);
  }, [searchKeyword, warranties, searchWarranties]);

  const handleSelectWarranty = (warranty: Warranty) => {
    setFormData((prev) => ({ ...prev, warranty }));
    setErrors((prev) => ({ ...prev, warranty: '' }));
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const newPhotos: PhotoItem[] = imageFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId),
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.warranty) {
        newErrors.warranty = '请选择质保卡';
      }
    } else if (step === 2) {
      if (!formData.faultDescription.trim()) {
        newErrors.faultDescription = '请填写故障现象';
      }
      if (!formData.faultCategory) {
        newErrors.faultCategory = '请选择故障分类';
      }
      if (!formData.faultTime) {
        newErrors.faultTime = '请选择故障发生时间';
      }
    } else if (step === 3) {
      if (!formData.detectionResult.trim()) {
        newErrors.detectionResult = '请填写检测结论';
      }
      if (formData.isCovered === null) {
        newErrors.isCovered = '请选择是否属于保修';
      }
      if (formData.isCovered === false) {
        if (!formData.rejectReason) {
          newErrors.rejectReason = '请选择拒保原因';
        }
        if (!formData.rejectRemark.trim()) {
          newErrors.rejectRemark = '请填写拒保说明';
        }
      }
      if (!formData.repairDuration) {
        newErrors.repairDuration = '请选择预计维修时长';
      }
      if (!formData.estimatedCost) {
        newErrors.estimatedCost = '请填写预计维修费用';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!formData.warranty) return;

    const newClaim: Omit<Claim, 'id'> = {
      warrantyId: formData.warranty.id,
      cardNo: formData.warranty.cardNo,
      customerName: formData.warranty.customerName,
      phone: formData.warranty.phone,
      phoneModel: formData.warranty.phoneModel,
      faultDescription: formData.faultDescription,
      photos: formData.photos.map((p) => p.url),
      detectionResult: formData.detectionResult,
      isCovered: formData.isCovered,
      rejectReason: formData.isCovered === false ? formData.rejectRemark : undefined,
      submitDate: dayjs().format('YYYY-MM-DD'),
      status: 'pending',
      storeId: formData.warranty.storeId,
      storeName: formData.warranty.storeName,
    };

    addClaim(newClaim);
    const createdClaim = claims[claims.length - 1];
    setSubmittedClaim(createdClaim);
    setShowSuccess(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSearchKeyword('');
    setSearchResults([]);
    setHasSearched(false);
    setFormData({
      warranty: null,
      faultDescription: '',
      faultCategory: '',
      faultTime: '',
      photos: [],
      detectionResult: '',
      isCovered: null,
      rejectReason: '',
      rejectRemark: '',
      repairDuration: '',
      estimatedCost: '',
    });
    setErrors({});
    setShowSuccess(false);
    setSubmittedClaim(null);
  };

  const handleLoadClaim = (claim: Claim) => {
    const warranty = warranties.find((w) => w.id === claim.warrantyId);
    if (warranty) {
      setFormData({
        warranty,
        faultDescription: claim.faultDescription,
        faultCategory: '',
        faultTime: '',
        photos: claim.photos.map((url, i) => ({
          id: Math.random().toString(36).substring(2, 11),
          url,
          name: `photo_${i + 1}.jpg`,
        })),
        detectionResult: claim.detectionResult || '',
        isCovered: claim.isCovered,
        rejectReason: '',
        rejectRemark: claim.rejectReason || '',
        repairDuration: '',
        estimatedCost: '',
      });
      setCurrentStep(2);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'inactive';
  };

  const getRepairDurationLabel = (value: string) => {
    return repairDurationOptions.find((o) => o.value === value)?.label || value;
  };

  const getFaultCategoryLabel = (value: string) => {
    return faultCategoryOptions.find((o) => o.value === value)?.label || value;
  };

  const getRejectReasonLabel = (value: string) => {
    return rejectReasonOptions.find((o) => o.value === value)?.label || value;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  status === 'completed'
                    ? 'bg-success-500 text-white'
                    : status === 'active'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-600 text-dark-400'
                }`}
              >
                {status === 'completed' ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span
                className={`mt-2 text-xs ${
                  status === 'active' ? 'text-primary-400' : status === 'completed' ? 'text-success-400' : 'text-dark-400'
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 rounded ${
                  status === 'completed' ? 'bg-success-500' : 'bg-dark-600'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="输入质保卡号、客户姓名、手机号、手机型号或IMEI"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            icon={Search}
          />
        </div>
        <button className="btn btn-primary px-6" onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          查询
        </button>
      </div>

      {errors.warranty && <p className="text-xs text-danger-400">{errors.warranty}</p>}

      {hasSearched && (
        <div className="space-y-3">
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-dark-400">
              <p>未找到匹配的质保卡</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((warranty) => (
                <div
                  key={warranty.id}
                  onClick={() => handleSelectWarranty(warranty)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.warranty?.id === warranty.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 hover:border-dark-500 bg-dark-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-white">{warranty.cardNo}</span>
                        <StatusBadge status={warranty.status} type="warranty" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-dark-400">客户：</span>
                          <span className="text-dark-200">{warranty.customerName}</span>
                        </div>
                        <div>
                          <span className="text-dark-400">手机：</span>
                          <span className="text-dark-200">{warranty.phoneModel}</span>
                        </div>
                        <div>
                          <span className="text-dark-400">电话：</span>
                          <span className="text-dark-200">{warranty.phone}</span>
                        </div>
                        <div>
                          <span className="text-dark-400">有效期至：</span>
                          <span className="text-dark-200">{warranty.expireDate}</span>
                        </div>
                      </div>
                    </div>
                    {formData.warranty?.id === warranty.id && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Textarea
        label="故障现象"
        placeholder="请详细描述故障现象，包括出现时间、频率、具体表现等"
        value={formData.faultDescription}
        onChange={(e) => setFormData((prev) => ({ ...prev, faultDescription: e.target.value }))}
        error={errors.faultDescription}
        rows={4}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="故障分类"
          options={faultCategoryOptions}
          value={formData.faultCategory}
          onChange={(e) => setFormData((prev) => ({ ...prev, faultCategory: e.target.value }))}
          error={errors.faultCategory}
          placeholder="请选择故障分类"
        />
        <Input
          label="故障发生时间"
          type="datetime-local"
          value={formData.faultTime}
          onChange={(e) => setFormData((prev) => ({ ...prev, faultTime: e.target.value }))}
          error={errors.faultTime}
        />
      </div>

      <div>
        <label className="input-label">照片上传</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-dark-600 hover:border-dark-500 bg-dark-800'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto text-dark-400 mb-3" />
          <p className="text-dark-300 mb-1">拖拽照片到此处或点击上传</p>
          <p className="text-xs text-dark-500">支持 JPG、PNG 格式，最多可上传9张</p>
        </div>

        {formData.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {formData.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(photo.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {formData.photos.length < 9 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-dark-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-dark-500 transition-colors"
              >
                <Plus className="w-6 h-6 text-dark-400" />
                <span className="text-xs text-dark-500 mt-1">添加照片</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Textarea
        label="检测结论"
        placeholder="请填写详细的检测结论，包括检测方法、发现的问题、故障原因分析等"
        value={formData.detectionResult}
        onChange={(e) => setFormData((prev) => ({ ...prev, detectionResult: e.target.value }))}
        error={errors.detectionResult}
        rows={4}
      />

      <div>
        <label className="input-label">是否属于保修</label>
        {errors.isCovered && <p className="text-xs text-danger-400 mb-2">{errors.isCovered}</p>}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="isCovered"
              checked={formData.isCovered === true}
              onChange={() => setFormData((prev) => ({ ...prev, isCovered: true }))}
              className="w-4 h-4 text-primary-500"
            />
            <span className="text-dark-200">是</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="isCovered"
              checked={formData.isCovered === false}
              onChange={() => setFormData((prev) => ({ ...prev, isCovered: false }))}
              className="w-4 h-4 text-primary-500"
            />
            <span className="text-dark-200">否</span>
          </label>
        </div>
      </div>

      {formData.isCovered === false && (
        <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg space-y-4">
          <Select
            label="拒保原因"
            options={rejectReasonOptions}
            value={formData.rejectReason}
            onChange={(e) => setFormData((prev) => ({ ...prev, rejectReason: e.target.value }))}
            error={errors.rejectReason}
            placeholder="请选择拒保原因"
          />
          <Textarea
            label="拒保说明"
            placeholder="请详细说明拒保的具体原因"
            value={formData.rejectRemark}
            onChange={(e) => setFormData((prev) => ({ ...prev, rejectRemark: e.target.value }))}
            error={errors.rejectRemark}
            rows={3}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">预计维修时长</label>
          {errors.repairDuration && <p className="text-xs text-danger-400 mb-2">{errors.repairDuration}</p>}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="4"
              value={repairDurationOptions.findIndex((o) => o.value === formData.repairDuration)}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setFormData((prev) => ({ ...prev, repairDuration: repairDurationOptions[index].value }));
              }}
              className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-dark-400">
              {repairDurationOptions.map((opt) => (
                <span
                  key={opt.value}
                  className={formData.repairDuration === opt.value ? 'text-primary-400' : ''}
                >
                  {opt.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Input
          label="预计维修费用"
          type="number"
          placeholder="请输入预计维修费用"
          value={formData.estimatedCost}
          onChange={(e) => setFormData((prev) => ({ ...prev, estimatedCost: e.target.value }))}
          error={errors.estimatedCost}
          icon={DollarSign}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-dark-800 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">质保卡信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-dark-400">质保卡号：</span>
              <span className="text-dark-200">{formData.warranty?.cardNo}</span>
            </div>
            <div>
              <span className="text-dark-400">客户姓名：</span>
              <span className="text-dark-200">{formData.warranty?.customerName}</span>
            </div>
            <div>
              <span className="text-dark-400">联系电话：</span>
              <span className="text-dark-200">{formData.warranty?.phone}</span>
            </div>
            <div>
              <span className="text-dark-400">手机型号：</span>
              <span className="text-dark-200">{formData.warranty?.phoneModel}</span>
            </div>
            <div>
              <span className="text-dark-400">门店：</span>
              <span className="text-dark-200">{formData.warranty?.storeName}</span>
            </div>
            <div>
              <span className="text-dark-400">有效期至：</span>
              <span className="text-dark-200">{formData.warranty?.expireDate}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-700 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">故障信息</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-dark-400">故障现象：</span>
              <p className="text-dark-200 mt-1">{formData.faultDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-dark-400">故障分类：</span>
                <span className="text-dark-200">{getFaultCategoryLabel(formData.faultCategory)}</span>
              </div>
              <div>
                <span className="text-dark-400">故障发生时间：</span>
                <span className="text-dark-200">{formData.faultTime}</span>
              </div>
            </div>
            {formData.photos.length > 0 && (
              <div>
                <span className="text-dark-400">故障照片：</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {formData.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-16 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dark-700 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">检测评估</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-dark-400">检测结论：</span>
              <p className="text-dark-200 mt-1">{formData.detectionResult}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-dark-400">是否保修：</span>
                <span className={formData.isCovered ? 'text-success-400' : 'text-danger-400'}>
                  {formData.isCovered ? '是' : '否'}
                </span>
              </div>
              {formData.isCovered === false && (
                <div>
                  <span className="text-dark-400">拒保原因：</span>
                  <span className="text-dark-200">{getRejectReasonLabel(formData.rejectReason)}</span>
                </div>
              )}
              <div>
                <span className="text-dark-400">预计维修时长：</span>
                <span className="text-dark-200">{getRepairDurationLabel(formData.repairDuration)}</span>
              </div>
              <div>
                <span className="text-dark-400">预计维修费用：</span>
                <span className="text-dark-200">¥{formData.estimatedCost}</span>
              </div>
            </div>
            {formData.isCovered === false && formData.rejectRemark && (
              <div>
                <span className="text-dark-400">拒保说明：</span>
                <p className="text-dark-200 mt-1">{formData.rejectRemark}</p>
              </div>
            )}
          </div>
        </div>
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
          核销申请已提交，申请单号：<span className="text-primary-400">{submittedClaim?.id}</span>
        </p>
        <div className="space-y-3">
          <button className="btn btn-primary w-full" onClick={handleReset}>
            <Plus className="w-4 h-4 mr-2" />
            继续受理
          </button>
          <button className="btn btn-secondary w-full">
            查看详情
          </button>
          <button className="btn btn-ghost w-full">
            返回列表
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        title="核销受理"
        subtitle="登记故障信息并完成检测评估"
        breadcrumb={[{ label: '首页' }, { label: '核销受理' }]}
      />

      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0">
          <div className="bg-dark-800 rounded-xl p-4">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              待处理列表
            </h3>
            {pendingClaims.length === 0 ? (
              <p className="text-sm text-dark-500 text-center py-8">暂无待处理申请</p>
            ) : (
              <div className="space-y-3">
                {pendingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => handleLoadClaim(claim)}
                    className="p-3 rounded-lg bg-dark-700 hover:bg-dark-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{claim.cardNo}</span>
                      <StatusBadge status={claim.status} type="claim" className="text-xs" />
                    </div>
                    <p className="text-xs text-dark-400 mb-1">{claim.customerName}</p>
                    <p className="text-xs text-dark-500 truncate">{claim.faultDescription}</p>
                    <p className="text-xs text-dark-500 mt-1">{claim.submitDate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-dark-800 rounded-xl p-6">
            {renderStepIndicator()}

            <div className="min-h-96">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-dark-700">
              <button
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一步
              </button>
              {currentStep < 4 ? (
                <button className="btn btn-primary" onClick={handleNext}>
                  下一步
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <Check className="w-4 h-4 mr-2" />
                  提交申请
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccess && renderSuccessModal()}
    </div>
  );
}
