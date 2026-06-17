import { QRCodeSVG } from 'qrcode.react';
import dayjs from 'dayjs';
import { Smartphone, Calendar, Shield, MapPin, User, CheckCircle, Clock } from 'lucide-react';
import type { Warranty } from '@/types';
import StatusBadge from './StatusBadge';
import { cn } from '@/lib/utils';

interface WarrantyCardProps {
  warranty: Warranty;
  showQR?: boolean;
  compact?: boolean;
  className?: string;
}

export default function WarrantyCard({ warranty, showQR = false, compact = false, className = '' }: WarrantyCardProps) {
  const remainingDays = dayjs(warranty.expireDate).diff(dayjs(), 'day');
  const isExpiring = remainingDays <= 7 && remainingDays > 0;
  const isExpired = remainingDays <= 0;

  const getGradientClass = () => {
    if (isExpired) return 'from-dark-700 to-dark-800';
    if (isExpiring) return 'from-warning-900/50 to-dark-800';
    return 'from-primary-900/30 to-dark-800';
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-dark-600 bg-gradient-to-br",
      getGradientClass(),
      "shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
      className
    )}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-success-500/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={cn(
                "w-6 h-6",
                isExpired ? "text-dark-400" : isExpiring ? "text-warning-400" : "text-primary-400"
              )} />
              <span className="font-mono text-sm text-dark-300">{warranty.cardNo}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{warranty.phoneModel}</h3>
            <p className="text-sm text-dark-300 mt-1">{warranty.repairContent}</p>
          </div>
          <StatusBadge status={warranty.status} type="warranty" />
        </div>

        {!compact && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-dark-200">
                <User className="w-4 h-4 text-dark-400" />
                <span>{warranty.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-200">
                <Smartphone className="w-4 h-4 text-dark-400" />
                <span className="font-mono">{warranty.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-200">
                <Calendar className="w-4 h-4 text-dark-400" />
                <span>签发: {dayjs(warranty.issueDate).format('YYYY-MM-DD')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-200">
                <MapPin className="w-4 h-4 text-dark-400" />
                <span>{warranty.storeName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-900/30 rounded-xl border border-dark-700/50">
              <div>
                <p className="text-xs text-dark-400 mb-1">保修剩余</p>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-3xl font-bold font-mono",
                    isExpired ? "text-dark-400" : isExpiring ? "text-warning-400" : "text-success-400"
                  )}>
                    {isExpired ? 0 : Math.max(0, remainingDays)}
                  </span>
                  <span className="text-sm text-dark-300">天</span>
                </div>
                <p className="text-xs text-dark-400 mt-1">
                  到期: {dayjs(warranty.expireDate).format('YYYY-MM-DD')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {warranty.signed ? (
                  <div className="flex items-center gap-1 text-success-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>已签收</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-warning-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>待签收</span>
                  </div>
                )}
                {showQR && (
                  <div className="p-2 bg-white rounded-lg">
                    <QRCodeSVG 
                      value={`https://warranty.example.com/query?cardNo=${warranty.cardNo}`}
                      size={60}
                      level="M"
                    />
                  </div>
                )}
              </div>
            </div>

            {warranty.claims.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-700/50">
                <p className="text-xs text-dark-400 mb-2">历史核销记录 ({warranty.claims.length})</p>
                <div className="space-y-2">
                  {warranty.claims.slice(-2).map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between text-sm">
                      <span className="text-dark-200">{dayjs(claim.submitDate).format('YYYY-MM-DD')}</span>
                      <StatusBadge status={claim.status} type="claim" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
