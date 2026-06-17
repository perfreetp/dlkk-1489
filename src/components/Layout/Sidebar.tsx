import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  Search, 
  ClipboardList, 
  Wrench, 
  ShieldAlert, 
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/issue', label: '质保卡发放', icon: FilePlus },
  { path: '/query', label: '客户查询', icon: Search },
  { path: '/accept', label: '核销受理', icon: ClipboardList },
  { path: '/repair', label: '返修处理', icon: Wrench },
  { path: '/audit', label: '门店审核', icon: ShieldAlert },
  { path: '/stats', label: '质保统计', icon: BarChart3 },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-dark-800/95 backdrop-blur-xl border-r border-dark-700 z-40 transition-all duration-300",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            {expanded && (
              <div className="overflow-hidden animate-fade-in">
                <h1 className="font-bold text-lg text-white whitespace-nowrap">质保卡平台</h1>
                <p className="text-xs text-dark-400 whitespace-nowrap">Warranty System</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => cn(
                "nav-item group",
                isActive && "active",
                !expanded && "justify-center px-2"
              )}
              title={expanded ? undefined : item.label}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                expanded ? "" : "mx-auto"
              )} />
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-700">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors",
                !expanded && "justify-center"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">管</span>
              </div>
              {expanded && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">售后主管</p>
                    <p className="text-xs text-dark-400">admin@repair.com</p>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-dark-400 transition-transform",
                    userMenuOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>

            {userMenuOpen && expanded && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-700 rounded-xl border border-dark-600 shadow-xl overflow-hidden animate-slide-up">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-dark-100 hover:bg-dark-600 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">系统设置</span>
                </button>
                <div className="h-px bg-dark-600" />
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-danger-400 hover:bg-dark-600 transition-colors">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-sm">退出登录</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-2 flex items-center justify-center p-2 rounded-lg text-dark-400 hover:bg-dark-700/50 hover:text-white transition-colors"
            title={expanded ? "收起侧边栏" : "展开侧边栏"}
          >
            <div className={cn(
              "transition-transform duration-300",
              expanded ? "rotate-0" : "rotate-180"
            )}>
              <ChevronDown className="w-5 h-5" style={{ transform: 'rotate(-90deg)' }} />
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
