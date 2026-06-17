import { useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  Clock,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  PhoneCall,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useWarrantyStore } from '@/store/warrantyStore';
import { PageHeader } from '@/components/Layout';
import { StatCard, StatusBadge } from '@/components/Card';

const CHART_COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#86909C'];

export default function Home() {
  const { getStats, getExpiringWarranties, visits } = useWarrantyStore();
  const stats = useMemo(() => getStats(), [getStats]);
  const expiringWarranties = useMemo(() => getExpiringWarranties(30).slice(0, 6), [getExpiringWarranties]);
  const recentVisits = useMemo(() => [...visits].sort((a, b) => dayjs(b.visitDate).valueOf() - dayjs(a.visitDate).valueOf()).slice(0, 5), [visits]);

  const statCards = [
    {
      title: '质保卡总数',
      value: stats.totalWarranties,
      icon: Shield,
      color: 'primary' as const,
      trend: { value: 12.5, isUp: true },
    },
    {
      title: '有效质保卡',
      value: stats.activeWarranties,
      icon: ShieldCheck,
      color: 'success' as const,
      trend: { value: 8.3, isUp: true },
    },
    {
      title: '待处理核销',
      value: stats.totalClaims - stats.approvedClaims - stats.rejectedClaims,
      icon: Clock,
      color: 'warning' as const,
      trend: { value: 3.2, isUp: false },
    },
    {
      title: '核销通过率',
      value: `${(stats.approvalRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'primary' as const,
      trend: { value: 2.1, isUp: true },
    },
    {
      title: '平均返修成本',
      value: `¥${stats.avgRepairCost.toFixed(0)}`,
      icon: DollarSign,
      color: 'danger' as const,
      trend: { value: 5.8, isUp: false },
    },
    {
      title: '7天内到期',
      value: expiringWarranties.filter(w => {
        const remaining = dayjs(w.expireDate).diff(dayjs(), 'day');
        return remaining <= 7 && remaining > 0;
      }).length,
      icon: AlertTriangle,
      color: 'warning' as const,
      trend: { value: 15.3, isUp: true },
    },
  ];

  const getRemainingDays = (expireDate: string) => {
    const today = dayjs();
    const expire = dayjs(expireDate);
    return expire.diff(today, 'day');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="仪表盘"
        subtitle="维修质保卡管理平台"
        breadcrumb={[{ label: '首页' }, { label: '仪表盘' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="card-hover"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4">月度趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#165DFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#165DFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClaimed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B42A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B42A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#272E3B" />
              <XAxis dataKey="month" stroke="#86909C" tick={{ fill: '#86909C' }} />
              <YAxis stroke="#86909C" tick={{ fill: '#86909C' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1D2129',
                  border: '1px solid #272E3B',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#86909C' }} />
              <Area
                type="monotone"
                dataKey="issued"
                name="质保签发"
                stroke="#165DFF"
                fillOpacity={1}
                fill="url(#colorIssued)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="claimed"
                name="核销数量"
                stroke="#00B42A"
                fillOpacity={1}
                fill="url(#colorClaimed)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4">拒保原因分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.rejectReasons}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ reason, percent }) => `${reason} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.rejectReasons.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1D2129',
                  border: '1px solid #272E3B',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4">门店排行</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-dark-300 uppercase">门店名称</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-dark-300 uppercase">质保数</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-dark-300 uppercase">核销数</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-dark-300 uppercase">通过率</th>
                </tr>
              </thead>
              <tbody>
                {stats.storeRanking.slice(0, 5).map((item, index) => (
                  <tr key={item.store} className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-warning-500/20 text-warning-400' :
                          index === 1 ? 'bg-dark-400/20 text-dark-300' :
                          index === 2 ? 'bg-warning-700/20 text-warning-500' : 'bg-dark-600 text-dark-400'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-white">{item.store}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 text-white font-mono">{item.warranties}</td>
                    <td className="text-center py-3 px-2 text-white font-mono">{item.claims}</td>
                    <td className="text-center py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <StatusBadge status={item.rate >= 0.9 ? 'active' : item.rate >= 0.8 ? 'pending' : 'rejected'} type="warranty" />
                        <span className="text-white font-mono">{(item.rate * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4">临期提醒</h3>
          <div className="space-y-3">
            {expiringWarranties.map((item) => {
              const remainingDays = getRemainingDays(item.expireDate);
              const isUrgent = remainingDays <= 7;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isUrgent ? 'bg-danger-500/20 text-danger-400' : 'bg-warning-500/20 text-warning-400'
                    }`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.cardNo}</p>
                      <p className="text-sm text-dark-300">{item.phoneModel} · {item.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${isUrgent ? 'text-danger-400' : 'text-warning-400'}`}>
                      {remainingDays}天
                    </p>
                    <p className="text-xs text-dark-400">{dayjs(item.expireDate).format('YYYY-MM-DD')}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {expiringWarranties.length === 0 && (
            <div className="text-center py-8 text-dark-400">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无临期质保卡</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">最近回访记录</h3>
          <button className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors">
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-3 text-xs font-semibold text-dark-300 uppercase">质保卡号</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-dark-300 uppercase">客户名称</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-dark-300 uppercase">回访内容</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-dark-300 uppercase">满意度</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-dark-300 uppercase">回访日期</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-dark-300 uppercase">操作人</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.map((visit) => (
                <tr key={visit.id} className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono text-primary-400">{visit.cardNo}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-400" />
                      </div>
                      <span className="text-white">{visit.customerName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-dark-200 max-w-xs truncate" title={visit.content}>
                    {visit.content}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${i < visit.satisfaction ? 'text-warning-400' : 'text-dark-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-dark-300">
                    <div className="flex items-center gap-1">
                      <PhoneCall className="w-4 h-4 text-dark-400" />
                      {dayjs(visit.visitDate).format('YYYY-MM-DD')}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-dark-300">{visit.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentVisits.length === 0 && (
          <div className="text-center py-8 text-dark-400">
            <PhoneCall className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无回访记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
