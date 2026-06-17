import { cn } from '@/lib/utils';
import type { WarrantyStatus, ClaimStatus, SolutionType, RiskLevel } from '@/types';

interface StatusBadgeProps {
  status: WarrantyStatus | ClaimStatus | SolutionType | RiskLevel | string;
  type?: 'warranty' | 'claim' | 'solution' | 'risk';
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: '有效', className: 'badge-success' },
  expired: { label: '已过期', className: 'badge-default' },
  cancelled: { label: '已取消', className: 'badge-danger' },
  
  pending: { label: '待处理', className: 'badge-warning' },
  approved: { label: '已通过', className: 'badge-success' },
  rejected: { label: '已拒绝', className: 'badge-danger' },
  disputed: { label: '待审核', className: 'badge-primary' },
  
  free: { label: '免费维修', className: 'badge-success' },
  discounted: { label: '折价更换', className: 'badge-warning' },
  escalated: { label: '升级主管', className: 'badge-primary' },
  
  low: { label: '低风险', className: 'badge-default' },
  medium: { label: '中风险', className: 'badge-warning' },
  high: { label: '高风险', className: 'badge-danger' },

  resolved_store: { label: '门店责任', className: 'badge-danger' },
  resolved_customer: { label: '客户责任', className: 'badge-default' },
  resolved_manufacturer: { label: '厂商责任', className: 'badge-primary' },
};

export default function StatusBadge({ status, type, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-default' };
  
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
