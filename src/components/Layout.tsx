import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Search, 
  Download, 
  Info, 
  ChevronDown, 
  Bell, 
  HelpCircle, 
  User,
  LayoutGrid,
  ShieldCheck,
  DownloadCloud,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";
import { useView } from "../contexts/ViewContext";
import { ViewType } from "../types";
import { cn } from "../lib/utils";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { viewType, setViewType, currentOrg, setCurrentOrg } = useView();
  
  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#333333] font-sans selection:bg-blue-100">
      {/* Top Navigation Bar */}
      <header className="bg-[#001529] text-white h-12 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-6 h-full">
          <Link to="/" className="flex items-center gap-2 mr-4">
            <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
              <BarChart3 size={14} />
            </div>
            <span className="font-bold text-base tracking-tight">智策平台</span>
            <span className="text-xs opacity-60 ml-1">⇌</span>
          </Link>
          
          <nav className="flex items-center h-full">
            <Link to="/" className="px-4 h-full flex items-center text-sm hover:bg-white/10 transition-none">智策首页</Link>
            <div className="px-4 h-full flex items-center text-sm hover:bg-white/10 cursor-default transition-none gap-1">
              主题分析 <ChevronDown size={12} />
            </div>
            <div className="px-4 h-full flex items-center text-sm hover:bg-white/10 cursor-default transition-none gap-1">
              数据服务 <ChevronDown size={12} />
            </div>
            <div className="px-4 h-full flex items-center text-sm hover:bg-white/10 cursor-default transition-none gap-1">
              后台配置 <ChevronDown size={12} />
            </div>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-4 text-xs opacity-80 h-full">
            <div className="flex items-center gap-1 cursor-default hover:text-white transition-none">工具 <ChevronDown size={10} /></div>
            <div className="flex items-center gap-1 cursor-default hover:text-white transition-none">权限中心</div>
            <div className="flex items-center gap-1 cursor-default hover:text-white transition-none">下载任务</div>
          </div>
          <div className="flex items-center gap-3 ml-4 border-l border-white/20 pl-4 h-6">
            <Bell size={16} className="opacity-80 cursor-default" />
            <HelpCircle size={16} className="opacity-80 cursor-default" />
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <User size={14} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation / Tabs */}
      <div className="bg-white border-b border-[#e5e9f2] h-10 flex items-center px-4 gap-1">
        <div className="h-full flex items-center px-4 text-xs border-r border-[#e5e9f2] cursor-default">
          智策首页
        </div>
        <div className="h-full flex items-center px-4 text-xs bg-[#f0f2f5] border-x border-[#e5e9f2] text-blue-600 gap-2 cursor-default">
          商业保险配比模型 <X size={12} className="text-slate-400" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-[#e5e9f2] py-2 px-4 flex items-center justify-between shadow-sm sticky top-12 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                setViewType(ViewType.GROUP);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-sm text-[12px] font-bold transition-all border",
                viewType === ViewType.GROUP 
                  ? "bg-[#eef2ff] text-[#2d5cf6] border-[#dbeafe]" 
                  : "text-slate-500 hover:text-slate-700 border-transparent"
              )}
            >
              <ChevronLeft size={14} strokeWidth={3} />
              集团
            </button>
            
            <button
              onClick={() => {
                setViewType(ViewType.BUSINESS);
                setCurrentOrg("速运福建区");
              }}
              className={cn(
                "text-[12px] font-bold transition-all px-1",
                viewType === ViewType.BUSINESS ? "text-[#2d5cf6]" : "text-slate-600 hover:text-slate-900"
              )}
            >
              业务区
            </button>

            <button
              onClick={() => {
                setViewType(ViewType.DISTRIBUTION);
                setCurrentOrg("华东分拨区");
              }}
              className={cn(
                "text-[12px] font-bold transition-all px-1",
                viewType === ViewType.DISTRIBUTION ? "text-[#2d5cf6]" : "text-slate-600 hover:text-slate-900"
              )}
            >
              分拨区
            </button>
            
            <ChevronRight size={14} className="text-slate-300 ml-[-10px]" />
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          {viewType !== ViewType.GROUP && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-500">组织:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e5e9f2] rounded-sm bg-white hover:border-blue-400 transition-colors cursor-pointer min-w-[120px] justify-between">
                <span className="text-[12px] font-medium text-slate-700">{currentOrg}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-500">时间:</span>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e5e9f2] rounded-sm bg-white hover:border-blue-400 transition-colors cursor-pointer min-w-[140px] justify-between">
              <span className="text-[12px] font-medium text-slate-700">2026年03月</span>
              <Calendar size={14} className="text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-2">
            <button className="px-6 py-1.5 bg-[#2d5cf6] text-white rounded-sm text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm">
              查询
            </button>
            <button className="flex items-center gap-1 text-[#2d5cf6] text-[12px] font-bold hover:opacity-80 transition-all ml-2">
              <Download size={16} />
              <span className="border-b border-[#2d5cf6]">图片下载</span>
            </button>
          </div>
        </div>
      </div>

      <main className="p-4 max-w-[1920px] mx-auto">
        {children}
      </main>
    </div>
  );
};
