import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, CreditCard, ShieldAlert, CheckCircle, Clock, XCircle, Send, History, FileText, AlertTriangle, Shield, X } from 'lucide-react';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/Layout';
import { WarrantyCard, StatusBadge } from '@/components/Card';
import { Input } from '@/components/Form';
import { useWarrantyStore } from '@/store/warrantyStore';
import type { Warranty, BlacklistItem, Claim } from '@/types';
import { cn } from '@/lib/utils';

type SearchType = 'phone' | 'card';

export default function Query() {
  const navigate = useNavigate();
  const { searchWarranties, getBlacklistByPhone } = useWarrantyStore();

  const [searchType, setSearchType] = useState<SearchType>('phone');
  const [keyword, setKeyword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [searchResults, setSearchResults] = useState<Warranty[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blacklistItem, setBlacklistItem] = useState<BlacklistItem | null>(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (codeCountdown > 0) {
      timer = setInterval(() => {
        setCodeCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [codeCountdown]);

  const handleSendCode = () => {
    if (codeCountdown > 0) return;
    if (!keyword.trim()) {
      alert('请先输入手机号');
      return;
    }
    if (searchType === 'phone' && !/^1[3-9]\d{9}$/.test(keyword)) {
      alert('请输入正确的手机号格式');
      return;
    }
    setCodeCountdown(60);
  };

  const handleSearch = () => {
    if (!keyword.trim()) {
      alert('请输入搜索关键词');
      return;
    }
    if (!verificationCode.trim()) {
      alert('请输入验证码');
      return;
    }
    if (verificationCode.length !== 6) {
      alert('请输入6位验证码');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setBlacklistItem(null);
    setShowBlacklistModal(false);
    setSelectedWarranty(null);

    setTimeout(() => {
      const results = searchWarranties(keyword);
      setSearchResults(results);
      setLoading(false);

      if (searchType === 'phone') {
        const blacklistInfo = getBlacklistByPhone(keyword);
        if (blacklistInfo) {
          setBlacklistItem(blacklistInfo);
          if (blacklistInfo.level === 'high') {
            setShowBlacklistModal(true);
          }
        }
      }

      if (results.length > 0) {
        setSelectedWarranty(results[0]);
      }
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSendWarrantyLink = () => {
    if (!selectedWarranty) return;
    alert(`已向 ${selectedWarranty.phone} 发送质保卡链接`);
  };

  const handleViewFullHistory = () => {
    if (!selectedWarranty) return;
    alert(`查看 ${selectedWarranty.cardNo} 的完整历史记录`);
  };

  const handleInitiateClaim = () => {
    if (!selectedWarranty) return;
    navigate('/accept', { state: { warranty: selectedWarranty } });
  };

  const formatRemainingDays = (days: number) => {
    if (days <= 0) return { text: '已过期', color: 'text-dark-400' };
    if (days <= 7) return { text: `${days}天`, color: 'text-warning-400' };
    return { text: `${days}天`, color: 'text-success-400' };
  };

  const getTimelineIcon = (status: Claim['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-danger-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning-400" />;
      case 'disputed':
        return <AlertTriangle className="w-5 h-5 text-primary-400" />;
      default:
        return <Clock className="w-5 h-5 text-dark-400" />;
    }
  };

  const allClaims = selectedWarranty?.claims || [];
  const sortedClaims = [...allClaims].sort((a, b) => 
    dayjs(b.submitDate).valueOf() - dayjs(a.submitDate).valueOf()
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        title="客户查询"
        subtitle="输入手机号或卡号查询质保信息"
      />

      <div className="card p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSearchType('phone')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200',
              searchType === 'phone'
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            )}
          >
            <Phone className="w-5 h-5" />
            手机号查询
          </button>
          <button
            onClick={() => setSearchType('card')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200',
              searchType === 'card'
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            )}
          >
            <CreditCard className="w-5 h-5" />
            卡号查询
          </button>
        </div>

        <div className="space-y-4">
          <Input
            icon={Search}
            iconPosition="left"
            placeholder={searchType === 'phone' ? '请输入手机号' : '请输入质保卡号'}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-lg py-4"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="请输入6位验证码"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                maxLength={6}
                className="text-lg py-4 tracking-widest text-center font-mono"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={codeCountdown > 0}
              className={cn(
                'px-6 py-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap',
                codeCountdown > 0
                  ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                  : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
              )}
            >
              {codeCountdown > 0 ? `${codeCountdown}s后重发` : '获取验证码'}
            </button>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full btn-primary py-4 text-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                查询中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                查询质保信息
              </span>
            )}
          </button>
        </div>
      </div>

      {blacklistItem && !showBlacklistModal && blacklistItem.level !== 'high' && (
        <div className={cn(
          'card p-4 mb-6 border-l-4',
          blacklistItem.level === 'medium' ? 'border-l-warning-500 bg-warning-500/10' : 'border-l-dark-500'
        )}>
          <div className="flex items-center gap-3">
            <ShieldAlert className={cn(
              'w-6 h-6',
              blacklistItem.level === 'medium' ? 'text-warning-400' : 'text-dark-400'
            )} />
            <div>
              <p className="font-medium text-dark-100">该客户存在风险记录</p>
              <p className="text-sm text-dark-400">风险等级：{blacklistItem.level === 'medium' ? '中风险' : '低风险'}</p>
            </div>
          </div>
        </div>
      )}

      {!hasSearched ? (
        <div className="card p-12 text-center">
          <Search className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-200 mb-2">请输入查询条件</h3>
          <p className="text-dark-400">通过手机号或质保卡号查询客户的质保信息</p>
        </div>
      ) : loading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-300">正在查询...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="card p-12 text-center">
          <XCircle className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-200 mb-2">未找到相关质保信息</h3>
          <p className="text-dark-400">请检查输入的{searchType === 'phone' ? '手机号' : '卡号'}是否正确</p>
        </div>
      ) : selectedWarranty ? (
        <div className="space-y-6">
          <WarrantyCard warranty={selectedWarranty} showQR />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleSendWarrantyLink}
              className="btn-secondary py-3"
            >
              <Send className="w-4 h-4 mr-2" />
              发送质保卡链接
            </button>
            <button
              onClick={handleViewFullHistory}
              className="btn-secondary py-3"
            >
              <History className="w-4 h-4 mr-2" />
              查看完整历史
            </button>
            <button
              onClick={handleInitiateClaim}
              disabled={selectedWarranty.status !== 'active'}
              className="btn-primary py-3"
            >
              <FileText className="w-4 h-4 mr-2" />
              发起核销申请
            </button>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-400" />
              覆盖范围说明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                <h4 className="font-medium text-success-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  保修范围
                </h4>
                <ul className="space-y-2 text-dark-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                    <span>{selectedWarranty.repairContent}相关的质量问题</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                    <span>非人为损坏的功能故障</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                    <span>维修部位的材料和工艺问题</span>
                  </li>
                </ul>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700">
                <h4 className="font-medium text-danger-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  排除条款
                </h4>
                <ul className="space-y-2 text-dark-200">
                  {selectedWarranty.exclusions.length > 0 ? (
                    selectedWarranty.exclusions.map((exclusion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-danger-400 mt-0.5 flex-shrink-0" />
                        <span>{exclusion}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-danger-400 mt-0.5 flex-shrink-0" />
                      <span>人为损坏、液体侵入、自行拆解</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-primary-400" />
              使用记录时间线
            </h3>
            {sortedClaims.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-700" />
                <div className="space-y-6">
                  {sortedClaims.map((claim, index) => {
                    const remainingDays = dayjs(selectedWarranty.expireDate).diff(dayjs(claim.submitDate), 'day');
                    const remainingInfo = formatRemainingDays(remainingDays);
                    return (
                      <div key={claim.id} className="relative pl-12">
                        <div className="absolute left-2 w-5 h-5 rounded-full bg-dark-800 border-2 border-dark-600 flex items-center justify-center">
                          {getTimelineIcon(claim.status)}
                        </div>
                        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-white">{claim.faultDescription}</p>
                              <p className="text-sm text-dark-400">
                                {dayjs(claim.submitDate).format('YYYY年MM月DD日 HH:mm')}
                              </p>
                            </div>
                            <StatusBadge status={claim.status} type="claim" />
                          </div>
                          {claim.detectionResult && (
                            <p className="text-sm text-dark-300 mb-2">
                              检测结果：{claim.detectionResult}
                            </p>
                          )}
                          {claim.rejectReason && (
                            <p className="text-sm text-danger-400 mb-2">
                              拒绝原因：{claim.rejectReason}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-dark-400">
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              申请时距到期：<span className={remainingInfo.color}>{remainingInfo.text}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {claim.storeName}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">暂无核销记录</p>
              </div>
            )}
          </div>

          {searchResults.length > 1 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">其他相关质保卡 ({searchResults.length - 1})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.slice(1).map((warranty) => (
                  <div
                    key={warranty.id}
                    onClick={() => setSelectedWarranty(warranty)}
                    className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 cursor-pointer hover:border-primary-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-dark-300">{warranty.cardNo}</span>
                      <StatusBadge status={warranty.status} type="warranty" />
                    </div>
                    <p className="font-medium text-white">{warranty.phoneModel}</p>
                    <p className="text-sm text-dark-400">{warranty.repairContent}</p>
                    <div className="flex items-center justify-between mt-2 text-sm text-dark-400">
                      <span>{dayjs(warranty.issueDate).format('YYYY-MM-DD')} 签发</span>
                      <span>剩余 {Math.max(0, dayjs(warranty.expireDate).diff(dayjs(), 'day'))} 天</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {showBlacklistModal && blacklistItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-danger-500/50 shadow-2xl shadow-danger-500/20 max-w-md w-full overflow-hidden">
            <div className="bg-danger-500/20 px-6 py-4 border-b border-danger-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-danger-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-danger-400" />
                </div>
                <div>
                  <h3 className="font-bold text-danger-400">高风险客户警示</h3>
                  <p className="text-sm text-danger-300/70">请谨慎处理该客户的业务</p>
                </div>
              </div>
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">客户姓名</span>
                <span className="font-medium text-white">{blacklistItem.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">手机号码</span>
                <span className="font-mono text-white">{blacklistItem.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">风险等级</span>
                <StatusBadge status={blacklistItem.level} type="risk" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-400">历史记录</span>
                <span className="font-medium text-danger-400">{blacklistItem.historyCount} 次</span>
              </div>
              <div className="pt-4 border-t border-dark-700">
                <p className="text-sm text-dark-400 mb-2">风险原因</p>
                <p className="text-dark-200 bg-dark-900/50 rounded-lg p-3">{blacklistItem.reason}</p>
              </div>
              {blacklistItem.notes && (
                <div>
                  <p className="text-sm text-dark-400 mb-2">备注信息</p>
                  <p className="text-warning-300 bg-warning-500/10 rounded-lg p-3 border border-warning-500/30">
                    {blacklistItem.notes}
                  </p>
                </div>
              )}
              <div className="pt-4">
                <button
                  onClick={() => setShowBlacklistModal(false)}
                  className="w-full btn-danger py-3"
                >
                  我已知晓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
