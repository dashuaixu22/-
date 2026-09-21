import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  User,
  Settings,
  LogOut,
  Globe,
  ChevronDown,
} from 'lucide-react';

interface GlobalTopBarProps {
  userName?: string;
  userRole?: string;
}

export const GlobalTopBar: React.FC<GlobalTopBarProps> = ({
  userName = 'ProUser',
  userRole = '运营管理员',
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 鼠标移入/移出处理
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <header
        id="global-top-statusbar"
        className="fixed top-0 left-0 right-0 h-12 bg-[#0B1F3A] text-white flex items-center justify-between px-4 z-50 border-b border-[#152B4D] select-none shadow-sm"
      >
        {/* 左侧：图标 + 武汉算力网供应商运营平台 */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14.5px] font-bold text-white tracking-wide font-sans">
              武汉算力网运营看板
            </span>
          </div>
        </div>

        {/* 右侧：使用文档 + 角色状态栏 */}
        <div className="flex items-center gap-4">
          {/* 使用文档 */}
          <button
            type="button"
            id="topbar-docs-btn"
            onClick={() => setDocModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="查看使用文档"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>使用文档</span>
          </button>

          {/* 角色状态栏 (光标移动到此处展示下拉功能) */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              id="topbar-user-status-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-2 py-1 rounded-md text-xs text-slate-200 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              {/* 头像 */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-xs">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              {/* 用户角色名 */}
              <div className="flex items-center gap-1">
                <span className="font-medium text-white">{userName}</span>
                <span className="text-[11px] text-blue-300 font-light hidden sm:inline-block">
                  ({userRole})
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                    dropdownOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </div>
            </button>

            {/* 下拉悬浮框 (参照 Ant Design Pro) */}
            {dropdownOpen && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {/* 用户信息简报 */}
                <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    Pro
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {userName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {userRole}
                    </span>
                  </div>
                </div>

                {/* 功能列表 */}
                <div className="py-1">
                  <button
                    type="button"
                    id="dropdown-item-settings"
                    onClick={() => {
                      setDropdownOpen(false);
                      alert('已打开个人设置面板');
                    }}
                    className="w-full px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 hover:text-blue-600 transition-colors text-slate-600 text-left cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>个人设置</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    id="dropdown-item-logout"
                    onClick={() => {
                      setDropdownOpen(false);
                      alert('已安全退出登录');
                    }}
                    className="w-full px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-red-50 hover:text-red-600 transition-colors text-slate-600 text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-400" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 使用文档弹窗 */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                武汉算力网运营看板 - 使用指南
              </h3>
              <button
                type="button"
                onClick={() => setDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. 运营总览：</strong>
                首页提供供应商总数、销售额、订单数、平台收入等核心运营指标的实时分析与环比态势。
              </p>
              <p>
                <strong>2. 服务分类：</strong>
                清晰洞察基础服务与增值服务的订单量、交易额及佣金分成比例。
              </p>
              <p>
                <strong>3. 周期联动：</strong>
                支持近一年、近一月、近一周的时间维度自动推算与数据切换。
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setDocModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
