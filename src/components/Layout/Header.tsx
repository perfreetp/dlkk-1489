import { Bell, Search, Calendar, ChevronDown, AlertTriangle, Clock } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useWarrantyStore } from '@/store/warrantyStore';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [showNotifications, setShowNotifications] = useState(false);
  
  const warranties = useWarrantyStore((state) => state.warranties);
  const claims = useWarrantyStore((state) => state.claims);
  const disputes = useWarrantyStore((state) => state.disputes);
  const getExpiringWarranties = useWarrantyStore((state) => state.getExpiringWarranties);

  const expiringSoon = useMemo(() => getExpiringWarranties(7), [warranties, getExpiringWarranties]);
  const pendingClaims = useMemo(() => claims.filter(c => c.status === 'pending'), [claims]);
  const pendingDisputes = useMemo(() => disputes.filter(d => d.status === 'pending'), [disputes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: '临期提醒',
      message: `${expiringSoon.length} 张质保卡将在7天内到期`,
      time: '刚刚',
      icon: Clock,
    },
    {
      id: 2,
      type: 'info',
      title: '待处理核销',
      message: `${pendingClaims.length} 笔核销申请等待处理`,
      time: '5分钟前',
      icon: Search,
    },
    {
      id: 3,
      type: 'danger',
      title: '争议待处理',
      message: `${pendingDisputes.length} 笔争议单等待审核`,
      time: '10分钟前',
      icon: AlertTriangle,
    },
  ];

  const unreadCount = expiringSoon.length > 0 ? 1 : 0 + (pendingClaims.length > 0 ? 1 : 0) + (pendingDisputes.length > 0 ? 1 : 0);

  return (
    <header className="sticky top-0 z-30 bg-dark-800/80 backdrop-blur-xl border-b border-dark-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="搜索卡号、手机号、客户名..."
              className="pl-10 pr-4 py-2 w-80 bg-dark-700/50 border border-dark-600 rounded-lg text-sm text-dark-50 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-dark-300">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-mono">
              {currentTime.format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-dark-300 hover:bg-dark-700/50 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-dark-700 rounded-xl border border-dark-600 shadow-2xl overflow-hidden animate-slide-up z-50">
                <div className="px-4 py-3 border-b border-dark-600">
                  <h3 className="font-semibold text-white">通知中心</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 border-b border-dark-600/50 hover:bg-dark-600/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          notification.type === 'warning' && "bg-warning-500/15 text-warning-400",
                          notification.type === 'info' && "bg-primary-500/15 text-primary-400",
                          notification.type === 'danger' && "bg-danger-500/15 text-danger-400",
                        )}>
                          <notification.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                            <span className="text-xs text-dark-400 flex-shrink-0">{notification.time}</span>
                          </div>
                          <p className="text-sm text-dark-300 mt-0.5">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-dark-600">
                  <button className="w-full text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
                    查看全部通知
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-dark-700" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">张主管</p>
              <div className="flex items-center gap-1 text-xs text-dark-400">
                <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span>在线</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
