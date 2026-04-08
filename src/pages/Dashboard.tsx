import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  FileText,
  List as ListIcon,
  Megaphone,
  BarChart2,
  Users,
  PieChart as PieChartIcon,
  Search,
  Download,
  ChevronDown,
  ShieldCheck,
  HelpCircle,
  X
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from "recharts";
import { Link } from "react-router-dom";
import { MOCK_DATA, MOCK_CLAIMS } from "../constants";
import { ViewType, Recommendation, BusinessCategory, EventStatus } from "../types";
import { cn } from "../lib/utils";
import { useView } from "../contexts/ViewContext";

export const Dashboard: React.FC = () => {
  const [isProgressHelpModalOpen, setIsProgressHelpModalOpen] = useState(false);
  const [activeBusinessTab, setActiveBusinessTab] = useState<BusinessCategory>(BusinessCategory.COLLECTION_DELIVERY);
  const { viewType, setViewType, currentOrg, setCurrentOrg } = useView();

  const TIME_PROGRESS_RATIO = 0.266; // April 7th is ~26.6% of the year

  const ProgressBar: React.FC<{ value: number; total: number; targetRatio?: number }> = ({ value, total, targetRatio = TIME_PROGRESS_RATIO }) => {
    const ratio = total > 0 ? Math.min(1, value / total) : 0;
    const percentage = (ratio * 100).toFixed(1);
    
    return (
      <div className="mt-1 w-full max-w-[80px] mx-auto">
        <div className="relative h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
              ratio > targetRatio ? "bg-red-500" : "bg-blue-500"
            )}
            style={{ width: `${ratio * 100}%` }}
          />
          {/* Target marker */}
          <div 
            className="absolute top-0 h-full w-[1px] bg-slate-400 z-10"
            style={{ left: `${targetRatio * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-[7px] text-slate-400 font-mono leading-none">{percentage}%</span>
          <span className="text-[7px] text-slate-400 font-mono leading-none">目标: {(targetRatio * 100).toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  const currentOrgData = useMemo(() => {
    if (viewType === ViewType.GROUP || !currentOrg) return null;
    return MOCK_DATA.find(item => currentOrg.includes(item.regionName) || item.regionName.includes(currentOrg));
  }, [viewType, currentOrg]);

  const recommendations = useMemo<Recommendation[]>(() => {
    if (!currentOrgData) return [];
    
    // Standard configuration based on the provided image
    return [
      { 
        planName: "方案一", 
        suggestedCoverage: 30, 
        expectedRiskReduction: 60, 
        additionalPremium: 30 
      },
      { 
        planName: "方案二", 
        suggestedCoverage: 50, 
        expectedRiskReduction: 80, 
        additionalPremium: 50 
      },
      { 
        planName: "方案三", 
        suggestedCoverage: 80, 
        expectedRiskReduction: 90, 
        additionalPremium: 80 
      },
    ];
  }, [currentOrgData]);

  const filteredData = useMemo(() => {
    const data = MOCK_DATA.filter((item) => {
      const matchesBusinessTab = viewType !== ViewType.GROUP || item.businessCategory === activeBusinessTab;
      
      if (viewType !== ViewType.GROUP && currentOrg) {
        return (currentOrg.includes(item.regionName) || item.regionName.includes(currentOrg));
      }
      
      return matchesBusinessTab;
    });
    return data;
  }, [viewType, currentOrg, activeBusinessTab]);

  const stats = useMemo(() => {
    const totalPremium = filteredData.reduce((acc, curr) => acc + curr.basePremium, 0);
    
    // 基础保费赔付 (Capped at premium)
    const totalBasePayout = filteredData.reduce((acc, curr) => {
      const basePayoutActual = curr.basePremium * curr.baseLossRatio;
      return acc + Math.min(basePayoutActual, curr.basePremium);
    }, 0);

    // 供应商赔付
    const totalSupplierPayout = filteredData.reduce((acc, curr) => acc + curr.supplierPayout, 0);

    // 地区赔付 (Excess over base premium)
    const totalRegionalPayout = filteredData.reduce((acc, curr) => {
      const basePayoutActual = curr.basePremium * curr.baseLossRatio;
      const excessPayout = Math.max(0, basePayoutActual - curr.basePremium);
      return acc + excessPayout;
    }, 0);

    // 平台赔付
    const totalCompanyPayout = filteredData.reduce((acc, curr) => acc + curr.companyPayout, 0);

    // 风险支出总成本 = 基础保费赔付 + 供应商 + 平台 + 地区
    const riskExpenditureCost = totalBasePayout + totalSupplierPayout + totalCompanyPayout + totalRegionalPayout;

    const filteredRegionCodes = new Set(filteredData.map(d => d.regionCode));
    const totalEvents = MOCK_CLAIMS.filter(c => filteredRegionCodes.has(c.regionCode)).length;

    return {
      totalPremium,
      totalBasePayout,
      totalSupplierPayout,
      totalCompanyPayout,
      totalRegionalPayout,
      riskExpenditureCost,
      totalEvents
    };
  }, [filteredData]);

  const costCompositionData = useMemo(() => {
    return [
      { name: "保险赔付", value: stats.totalBasePayout, color: "#2d5cf6" },
      { name: "平台赔付", value: stats.totalCompanyPayout, color: "#9333ea" },
      { name: "供应商赔付", value: stats.totalSupplierPayout, color: "#9333ea" },
      { name: "地区赔付", value: stats.totalRegionalPayout, color: "#f59e0b" },
    ];
  }, [stats]);

  const chartData = useMemo(() => {
    return filteredData.map(item => ({
      name: item.regionName,
      ratio: (item.baseLossRatio * 100).toFixed(1),
      payout: item.totalPayout / 10000, 
    }));
  }, [filteredData]);

  const payoutBreakdown = useMemo(() => {
    const sap = filteredData.reduce((acc, curr) => acc + curr.sapPayout, 0);
    const pmp = filteredData.reduce((acc, curr) => acc + curr.pmpPayout, 0);
    const company = filteredData.reduce((acc, curr) => acc + curr.companyPayout, 0);
    const supplier = filteredData.reduce((acc, curr) => acc + curr.supplierPayout, 0);
    
    return [
      { name: "平台SAP赔付", value: sap, color: "#2d5cf6" },
      { name: "平台PMP赔付", value: pmp, color: "#1890ff" },
      { name: "平台赔付", value: company, color: "#9333ea" },
      { name: "第三方赔付", value: supplier, color: "#9333ea" },
    ];
  }, [filteredData]);

  const filteredClaims = useMemo(() => {
    const categoryClaims = MOCK_CLAIMS.filter(c => c.businessCategory === activeBusinessTab);
    
    if (viewType === ViewType.GROUP || !currentOrg) {
      return categoryClaims;
    }

    const filtered = categoryClaims.filter(c => 
      (currentOrg.includes(c.regionCode) || c.regionCode.includes(currentOrg))
    );

    // If no specific data for the selected region, show all data for this category
    // to avoid the "No data" state as requested by the user.
    return filtered.length > 0 ? filtered : categoryClaims;
  }, [viewType, currentOrg, activeBusinessTab]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Management Points Section */}
      <div className="bg-white border border-[#e5e9f2] rounded-sm shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#e5e9f2]">
          <div className="bg-[#f27d26] p-1 rounded-sm text-white">
            <Megaphone size={14} />
          </div>
          <span className="text-sm font-bold">管理要点</span>
        </div>
        <div className="p-4 text-[11px] text-slate-600 leading-relaxed">
          <div className="space-y-3">
            <div>
              <div className="font-bold text-slate-800 mb-0.5">① 赔付动态监控与风险分摊预警</div>
              <div className="pl-4">提供动态监控工具，实时追踪赔付支出，识别风险失衡节点，辅助地区进行风险管控决策</div>
            </div>
            <div>
              <div className="font-bold text-slate-800 mb-0.5">② 风险准备金测算</div>
              <div className="pl-4">提供法定标准测算工具，辅助各地区对未完结风险事件做风险应对准备</div>
            </div>
            <div>
              <div className="font-bold text-slate-800 mb-0.5">③ 保险方案对比分析</div>
              <div className="pl-4">输出保费与风险成本对比分析工具，辅助地区判断是否需要增投商业保险，支撑地区自主决策</div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Overview Section */}
      <div className="bg-white border border-[#e5e9f2] rounded-sm shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#e5e9f2]">
          <div className="bg-[#2d5cf6] p-1 rounded-sm text-white">
            <BarChart2 size={14} />
          </div>
          <span className="text-sm font-bold">管理概况</span>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-[#722ed1]" />
            <span className="text-xs font-bold">看保险业务整体情况</span>
          </div>

          {/* Grid-based Tree Diagram */}
          <div className="pt-4 pb-8 overflow-x-auto">
            <div className="min-w-[1000px] flex flex-col items-center">
              {/* Root: Total Risk Response Cost and Events */}
              <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white px-8 py-3 rounded-sm shadow-md text-center min-w-[200px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">总风险应对成本</div>
                    <div className="text-xl font-black">{formatCurrency(stats.riskExpenditureCost)}</div>
                  </div>
                  <div className="bg-slate-700 text-white px-8 py-3 rounded-sm shadow-md text-center min-w-[150px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">发生事件数</div>
                    <div className="text-xl font-black">{stats.totalEvents} <span className="text-xs font-normal opacity-70">件</span></div>
                  </div>
                </div>
                <div className="w-[2px] h-8 bg-slate-200" />
              </div>

              {/* Grid Container */}
              <div className="w-full max-w-6xl border border-slate-100 rounded-sm overflow-hidden shadow-sm bg-white">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-3 text-left border-r border-slate-100 w-40">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">案件</span>
                      </th>
                      <th colSpan={2} className="p-3 text-center border-r border-slate-100 bg-blue-50/30">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">保险赔付</span>
                          <button onClick={() => setIsProgressHelpModalOpen(true)} className="text-blue-300 hover:text-blue-500">
                            <HelpCircle size={12} />
                          </button>
                        </div>
                      </th>
                      <th colSpan={2} className="p-3 text-center border-r border-slate-100 bg-purple-50/30">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-widest">第三方赔付</span>
                          <button onClick={() => setIsProgressHelpModalOpen(true)} className="text-purple-300 hover:text-purple-500">
                            <HelpCircle size={12} />
                          </button>
                        </div>
                      </th>
                      <th className="p-3 text-center bg-amber-50/30">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">地区赔付</span>
                      </th>
                    </tr>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-2 border-r border-slate-100"></th>
                      <th className="p-2 text-center border-r border-slate-100 text-[9px] font-bold text-slate-500">雇主险赔付</th>
                      <th className="p-2 text-center border-r border-slate-100 text-[9px] font-bold text-slate-500">百万医疗赔付</th>
                      <th className="p-2 text-center border-r border-slate-100 text-[9px] font-bold text-slate-500">平台赔付</th>
                      <th className="p-2 text-center border-r border-slate-100 text-[9px] font-bold text-slate-500">供应商赔付</th>
                      <th className="p-2 text-center text-[9px] font-bold text-slate-500">地区赔付</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Platform Collection & Delivery */}
                    <tr className="border-b border-slate-50">
                      <td className="p-4 border-r border-slate-100 bg-slate-50/20">
                        <div className="text-[10px] font-bold text-slate-700">平台收派</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-blue-600">{formatCurrency(stats.totalBasePayout * 0.4 * 0.8)}</div>
                        <ProgressBar value={stats.totalBasePayout * 0.4 * 0.8} total={stats.totalPremium * 0.4 * 0.8 * 1.2} />
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-blue-600">{formatCurrency(stats.totalBasePayout * 0.4 * 0.2)}</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-purple-600">{formatCurrency(stats.totalCompanyPayout * 0.4)}</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-purple-600">{formatCurrency(stats.totalSupplierPayout * 0.4)}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-xs font-bold text-slate-900">{formatCurrency(stats.totalRegionalPayout * 0.4)}</div>
                      </td>
                    </tr>
                    {/* Row 2: Platform Operation (SAP) */}
                    <tr className="border-b border-slate-50">
                      <td className="p-4 border-r border-slate-100 bg-slate-50/20">
                        <div className="text-[10px] font-bold text-slate-700">平台运作SAP</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-blue-600">{formatCurrency(stats.totalBasePayout * 0.3 * 0.8)}</div>
                        <ProgressBar value={stats.totalBasePayout * 0.3 * 0.8} total={stats.totalPremium * 0.3 * 0.8 * 1.2} />
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-blue-600">{formatCurrency(stats.totalBasePayout * 0.3 * 0.2)}</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-purple-600">{formatCurrency(stats.totalCompanyPayout * 0.3)}</div>
                        <ProgressBar value={stats.totalCompanyPayout * 0.3} total={stats.totalPremium * 0.3 * 0.5} />
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center">
                        <div className="text-xs font-bold text-purple-600">{formatCurrency(stats.totalSupplierPayout * 0.3)}</div>
                        <ProgressBar value={stats.totalSupplierPayout * 0.3} total={stats.totalPremium * 0.3 * 0.5} />
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-xs font-bold text-slate-900">{formatCurrency(stats.totalRegionalPayout * 0.3)}</div>
                      </td>
                    </tr>
                    {/* Row 3: Platform Operation (PMP) */}
                    <tr>
                      <td className="p-4 border-r border-slate-100 bg-slate-50/20">
                        <div className="text-[10px] font-bold text-slate-700">平台运作PMP</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center bg-slate-50/5">
                        <div className="text-xs font-bold text-blue-600">{formatCurrency(stats.totalBasePayout * 0.3 * 0.8)}</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center bg-slate-50/5">
                        <div className="text-xs font-bold text-blue-600">{formatCurrency(stats.totalBasePayout * 0.3 * 0.2)}</div>
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center bg-slate-50/5">
                        <div className="text-xs font-bold text-purple-600">{formatCurrency(stats.totalCompanyPayout * 0.3)}</div>
                        <ProgressBar value={stats.totalCompanyPayout * 0.3} total={stats.totalPremium * 0.3 * 0.5} />
                      </td>
                      <td className="p-4 border-r border-slate-100 text-center bg-slate-50/5">
                        <div className="text-xs font-bold text-purple-600">{formatCurrency(stats.totalSupplierPayout * 0.3)}</div>
                        <ProgressBar value={stats.totalSupplierPayout * 0.3} total={stats.totalPremium * 0.3 * 0.5} />
                      </td>
                      <td className="p-4 text-center bg-slate-50/5">
                        <div className="text-xs font-bold text-slate-900">{formatCurrency(stats.totalRegionalPayout * 0.3)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border border-[#e5e9f2] rounded-sm shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e5e9f2] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#2d5cf6] p-1 rounded-sm text-white">
                <FileText size={14} />
              </div>
              <span className="text-sm font-bold">
                {viewType === ViewType.GROUP ? "业务明细表" : `${currentOrg} - 保险赔付明细表`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-slate-100">
            {Object.values(BusinessCategory).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveBusinessTab(tab)}
                className={cn(
                  "px-4 py-2 text-[11px] font-bold transition-all relative",
                  activeBusinessTab === tab 
                    ? "text-blue-600" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
                {activeBusinessTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {viewType === ViewType.GROUP ? (
            <table className="w-full text-center border-collapse min-w-[1400px] border border-[#e5e9f2]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#e5e9f2]">
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-20 border-r border-[#e5e9f2]">地区代码</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-32 border-r border-[#e5e9f2]">地区名称</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28 border-r border-[#e5e9f2]">类型</th>
                  <th colSpan={2} className="px-2 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-center border-b border-r border-[#e5e9f2]">
                    <div className="flex items-center justify-center gap-1">
                      保险赔付
                      <button onClick={() => setIsProgressHelpModalOpen(true)} className="text-blue-300 hover:text-blue-500">
                        <HelpCircle size={12} />
                      </button>
                    </div>
                  </th>
                  <th colSpan={2} className="px-2 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-center border-b border-r border-[#e5e9f2]">
                    <div className="flex items-center justify-center gap-1">
                      第三方赔付
                      <button onClick={() => setIsProgressHelpModalOpen(true)} className="text-indigo-300 hover:text-indigo-500">
                        <HelpCircle size={12} />
                      </button>
                    </div>
                  </th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-amber-600 uppercase tracking-wider w-24 border-r border-[#e5e9f2]">地区赔付</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">备注</th>
                </tr>
                <tr className="bg-[#f8f9fb] border-b border-[#e5e9f2]">
                  <th className="px-2 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider w-32 border-r border-[#e5e9f2]">雇主险赔付</th>
                  <th className="px-2 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider w-32 border-r border-[#e5e9f2]">百万医疗赔付</th>
                  <th className="px-2 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider w-32 border-r border-[#e5e9f2]">供应商赔付</th>
                  <th className="px-2 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider w-32 border-r border-[#e5e9f2]">平台赔付</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9f2]">
                {filteredData.map((item) => {
                  const basePayoutActual = item.basePremium * item.baseLossRatio;
                  const basePayoutCapped = Math.min(basePayoutActual, item.basePremium);
                  const excessPayout = Math.max(0, basePayoutActual - item.basePremium);
                  const baseUsageRate = Math.min(item.baseLossRatio * 100, 100);
                  const supplierRate = Math.min((item.supplierPayout / (item.basePremium || 1)) * 100, 100);
                  const platformRate = Math.min((item.companyPayout / (item.basePremium || 1)) * 100, 100);
                  
                  // Progress bar visibility logic
                  const showEmployerProgress = item.businessCategory === BusinessCategory.COLLECTION_DELIVERY || 
                                              item.businessCategory === BusinessCategory.OPERATION_SAP;
                  const showPlatformProgress = item.businessCategory === BusinessCategory.OPERATION_SAP || 
                                              item.businessCategory === BusinessCategory.OPERATION_PMP;
                  const showSupplierProgress = item.businessCategory === BusinessCategory.OPERATION_SAP || 
                                              item.businessCategory === BusinessCategory.OPERATION_PMP;

                  return (
                    <tr key={item.id} className="bg-white border-b border-[#e5e9f2]">
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <span className="text-[10px] font-bold text-slate-400">{item.regionCode}</span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap border-r border-[#e5e9f2]">
                        <div className="font-bold text-slate-800 text-xs">{item.regionName}</div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap border-r border-[#e5e9f2]">
                        <div className="text-slate-600 text-[10px] font-bold">{item.businessCategory}</div>
                      </td>
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-blue-600">
                            {formatCurrency(basePayoutCapped * 0.8)}
                          </span>
                          {showEmployerProgress && (
                            <ProgressBar value={baseUsageRate * 0.8} total={100} />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-blue-600">
                            {formatCurrency(basePayoutCapped * 0.2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-slate-400">
                            {formatCurrency(item.supplierPayout)}
                          </span>
                          {showSupplierProgress && (
                            <ProgressBar value={supplierRate} total={100} />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-slate-400">
                            {formatCurrency(item.companyPayout)}
                          </span>
                          {showPlatformProgress && (
                            <ProgressBar value={platformRate} total={100} />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <span className={cn(
                          "text-xs font-bold",
                          excessPayout > 0 ? "text-amber-500" : "text-slate-300"
                        )}>
                          {formatCurrency(excessPayout)}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-center border-collapse min-w-[1800px] border border-[#e5e9f2]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#e5e9f2]">
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">事件状态</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">工号</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">姓名</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">人员类型</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">成本中心</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">岗位</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">供应商名称</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">发生时间</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">异常编码</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">是否工伤</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">总赔付金额</th>
                  <th colSpan={2} className="px-2 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-center border-b border-r border-[#e5e9f2]">保险赔付</th>
                  <th colSpan={2} className="px-2 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-center border-b border-r border-[#e5e9f2]">第三方赔付</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-amber-600 uppercase tracking-wider whitespace-nowrap border-r border-[#e5e9f2]">地区赔付</th>
                  <th rowSpan={2} className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">法定赔付标准值测算</th>
                </tr>
                <tr className="bg-[#f8f9fb] border-b border-[#e5e9f2]">
                  <th className="px-2 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider border-r border-[#e5e9f2]">雇主险赔付</th>
                  <th className="px-2 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider border-r border-[#e5e9f2]">万医疗赔付</th>
                  <th className="px-2 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider border-r border-[#e5e9f2]">平台赔付</th>
                  <th className="px-2 py-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider border-r border-[#e5e9f2]">供应商赔付</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9f2]">
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => (
                    <tr key={claim.id} className="bg-white border-b border-[#e5e9f2]">
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <span className={cn(
                          "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase",
                          claim.eventStatus === EventStatus.COMPLETED ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                          {claim.eventStatus}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-xs font-mono text-slate-500 border-r border-[#e5e9f2]">{claim.employeeId}</td>
                      <td className="px-2 py-4 text-xs font-bold text-slate-900 border-r border-[#e5e9f2]">{claim.name}</td>
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <span className={cn(
                          "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase",
                          claim.personnelType === "全职" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {claim.personnelType}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-xs text-slate-600 border-r border-[#e5e9f2]">{claim.costCenter}</td>
                      <td className="px-2 py-4 text-xs text-slate-600 font-bold border-r border-[#e5e9f2]">{claim.position}</td>
                      <td className="px-2 py-4 text-xs text-slate-600 border-r border-[#e5e9f2]">{claim.supplierName}</td>
                      <td className="px-2 py-4 text-xs font-mono text-slate-500 border-r border-[#e5e9f2]">{claim.occurrenceTime}</td>
                      <td className="px-2 py-4 text-xs font-mono text-slate-500 border-r border-[#e5e9f2]">{claim.anomalyCode}</td>
                      <td className="px-2 py-4 border-r border-[#e5e9f2]">
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          claim.isWorkInjury ? "text-red-600" : "text-slate-400"
                        )}>
                          {claim.isWorkInjury ? "是" : "否"}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-xs font-bold text-slate-900 border-r border-[#e5e9f2]">{formatCurrency(claim.totalPayout)}</td>
                      <td className="px-2 py-4 text-xs font-bold text-blue-600 border-r border-[#e5e9f2]">{formatCurrency(claim.employerInsurancePayout)}</td>
                      <td className="px-2 py-4 text-xs font-bold text-blue-600 border-r border-[#e5e9f2]">{formatCurrency(claim.medicalInsurancePayout)}</td>
                      <td className="px-2 py-4 text-xs font-bold text-indigo-600 border-r border-[#e5e9f2]">{formatCurrency(claim.platformPayout)}</td>
                      <td className="px-2 py-4 text-xs font-bold text-indigo-600 border-r border-[#e5e9f2]">{formatCurrency(claim.supplierPayout)}</td>
                      <td className="px-2 py-4 text-xs font-bold text-amber-600 border-r border-[#e5e9f2]">{formatCurrency(claim.regionalPayout)}</td>
                      <td className="px-2 py-4 text-xs font-bold text-slate-800">{formatCurrency(claim.statutoryPayoutStandard)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={17} className="px-4 py-12 text-center text-slate-400 text-xs">
                      暂无明细数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Commercial Insurance Supplemental Recommendations Module */}
      {viewType !== ViewType.GROUP && currentOrgData && (
        <div className="bg-white border border-[#e5e9f2] rounded-sm shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e5e9f2] flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1 rounded-sm text-white">
                <ShieldCheck size={14} />
              </div>
              <span className="text-sm font-bold">杠杆型保险增投测算</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-hidden border border-slate-200 rounded-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 text-left border-r border-slate-200 w-1/4">当前预估待赔付风险金</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 text-center border-r border-slate-200">配置方案</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 text-center border-r border-slate-200">增投保额</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 text-center border-r border-slate-200">保费成本</th>
                    <th className="px-6 py-4 text-xs font-bold text-blue-600 text-center">预估可覆盖风险</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec, idx) => (
                    <tr key={idx} className={cn(
                      "border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors",
                      idx % 2 === 1 ? "bg-white" : "bg-slate-50/30"
                    )}>
                      {idx === 0 && (
                        <td rowSpan={recommendations.length} className="px-6 py-4 text-center border-r border-slate-200 align-middle">
                          <div className="text-xl font-bold text-red-600">
                            {currentOrgData.estimatedRiskFund}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-medium">单位: 万元</div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-xs font-bold text-slate-800 text-center border-r border-slate-200">
                        <div className="flex items-center justify-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            idx === 0 ? "bg-blue-400" : idx === 1 ? "bg-indigo-400" : "bg-purple-400"
                          )} />
                          {rec.planName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-900 text-center border-r border-slate-200">
                        {rec.suggestedCoverage}万
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-900 text-center border-r border-slate-200">
                        {rec.additionalPremium}万
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-blue-600 text-center bg-blue-50/30">
                        {rec.expectedRiskReduction}万
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Progress Help Modal */}
      {isProgressHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-sm font-bold text-slate-700">进度说明</span>
              <button 
                onClick={() => setIsProgressHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <HelpCircle className="text-blue-600" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700">进度说明</p>
              <div className="text-xs text-slate-500 leading-relaxed text-left space-y-2">
                <p>当前时间进度比例约为 <span className="font-bold text-blue-600">26.6%</span>。</p>
                <p>进度条中的<span className="font-bold text-slate-400">竖线</span>代表当前时间进度节点。</p>
                <p>若赔付进度比例超过此数值，进度条将显示为红色，否则显示为蓝色。</p>
                <p>部分金额无上限，因此无赔付进度比例。</p>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={() => setIsProgressHelpModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-sm hover:bg-blue-700 transition-colors"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
