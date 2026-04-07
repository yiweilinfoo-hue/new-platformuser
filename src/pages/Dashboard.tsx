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
  ShieldCheck
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
import { Scenario, ViewType, Recommendation } from "../types";
import { cn } from "../lib/utils";
import { useView } from "../contexts/ViewContext";

export const Dashboard: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const { viewType, setViewType, currentOrg, setCurrentOrg } = useView();

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
      const matchesScenario = selectedScenario === "" || item.scenario === selectedScenario;
      
      if (viewType !== ViewType.GROUP && currentOrg) {
        return matchesScenario && (currentOrg.includes(item.regionName) || item.regionName.includes(currentOrg));
      }
      
      return matchesScenario;
    });
    const scenarioOrder: Record<string, number> = {
      [Scenario.SCENARIO_1]: 1,
      [Scenario.SCENARIO_2]: 2,
      [Scenario.SCENARIO_3]: 3,
      [Scenario.SCENARIO_4]: 4,
    };
    return [...data].sort((a, b) => (scenarioOrder[a.scenario] || 99) - (scenarioOrder[b.scenario] || 99));
  }, [selectedScenario, viewType, currentOrg]);

  const stats = useMemo(() => {
    const totalPremium = filteredData.reduce((acc, curr) => acc + curr.basePremium, 0);
    
    // 平台SAP赔付
    const totalSapPayout = filteredData.reduce((acc, curr) => acc + curr.sapPayout, 0);
    
    // 平台PMP赔付
    const totalPmpPayout = filteredData.reduce((acc, curr) => acc + curr.pmpPayout, 0);

    // 供应商赔付
    const totalSupplierPayout = filteredData.reduce((acc, curr) => acc + curr.supplierPayout, 0);

    // 地区赔付 (Excess over base premium)
    const totalRegionalPayout = filteredData.reduce((acc, curr) => {
      const basePayoutActual = curr.basePremium * curr.baseLossRatio;
      const excessPayout = Math.max(0, basePayoutActual - curr.basePremium);
      return acc + excessPayout;
    }, 0);

    // 风险支出总成本 = SAP + PMP + 供应商 + 地区
    const riskExpenditureCost = totalSapPayout + totalPmpPayout + totalSupplierPayout + totalRegionalPayout;

    const filteredRegionCodes = new Set(filteredData.map(d => d.regionCode));
    const totalEvents = MOCK_CLAIMS.filter(c => filteredRegionCodes.has(c.regionCode)).length;

    return {
      totalPremium,
      totalSapPayout,
      totalPmpPayout,
      totalSupplierPayout,
      totalRegionalPayout,
      riskExpenditureCost,
      totalEvents
    };
  }, [filteredData]);

  const costCompositionData = useMemo(() => {
    return [
      { name: "平台SAP赔付", value: stats.totalSapPayout, color: "#2d5cf6" },
      { name: "平台PMP赔付", value: stats.totalPmpPayout, color: "#1890ff" },
      { name: "第三方赔付", value: stats.totalSupplierPayout, color: "#722ed1" },
      { name: "地区赔付", value: stats.totalRegionalPayout, color: "#f5222d" },
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
      { name: "平台赔付", value: company, color: "#60A5FA" },
      { name: "第三方赔付", value: supplier, color: "#94A3B8" },
    ];
  }, [filteredData]);

  const filteredClaims = useMemo(() => {
    if (viewType === ViewType.GROUP || !currentOrg) return [];
    return MOCK_CLAIMS.filter(c => 
      currentOrg.includes(c.region) || c.region.includes(currentOrg)
    );
  }, [viewType, currentOrg]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);
  };

  const getScenarioBadgeStyle = (scenario: Scenario) => {
    switch (scenario) {
      case Scenario.SCENARIO_1: return "bg-red-600 text-white";
      case Scenario.SCENARIO_2: return "bg-orange-500 text-white";
      case Scenario.SCENARIO_3: return "bg-blue-600 text-white";
      case Scenario.SCENARIO_4: return "bg-emerald-600 text-white";
      default: return "bg-slate-100 text-slate-600";
    }
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
          <div className="font-bold mb-2 text-slate-800">模型设计逻辑：</div>
          <div className="space-y-1">
            <div className="font-bold">1、用工风控动态预警</div>
            <div className="pl-2">① 满期赔付率超过90%，需要追加保费至？+保险服务费(折算成月份看赔付达成结果)</div>
            <div className="pl-2">② 保险外风险成本分摊规则，地区无责任情况下，平台及供应商5:5承担，地区主观因素责任地区承担50%，平台及供应商25%：25%</div>
            <div className="pl-2">③ 平台和供应商的风险应对金上限为上年度推广服务费的50%/100%</div>
            <div className="pl-2">④ 按工伤保险赔付标准测算赔付金额，法定标准外测算结果和实际赔付结果的对比</div>
            <div className="pl-2">⑤ 未发生案件按照法定标准测算风险应对金，动态输出地区风险成本，评估是否增加杠杆型保险</div>
            <div className="pl-2">⑥ 杠杆型保险方案测算，预警风险成本及保费投入费率对比，确定建议增投方案</div>
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

          {/* Vertical Tree Diagram with Events Card */}
          <div className="pt-8 pb-4 overflow-x-auto">
            <div className="flex flex-col items-center min-w-[800px]">
              {/* Level 1: Root + Events Card */}
              <div className="relative w-full max-w-4xl flex items-center justify-center mb-0">
                {/* Events Card Aligned to the left */}
                <div className="absolute left-0 top-0 bg-white p-4 rounded-sm border border-[#e5e9f2] shadow-sm flex flex-col justify-between h-20 w-40">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">发生事件数</span>
                  </div>
                  <div className="text-lg font-bold tracking-tight text-slate-900">{stats.totalEvents} 件</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-48 p-3 bg-white border-2 border-blue-600 rounded-sm shadow-md text-center z-10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">风险支出总成本</div>
                    <div className="text-lg font-bold text-slate-900">{formatCurrency(stats.riskExpenditureCost)}</div>
                  </div>
                  {/* Vertical Line Down */}
                  <div className="w-[2px] h-8 bg-slate-300" />
                </div>
              </div>

              {/* Level 2: Children Container */}
              <div className="relative w-full max-w-5xl">
                {/* Horizontal Connector Line - Spans from center of first child to center of last child */}
                <div className="absolute top-0 left-[12.5%] right-[12.5%] h-[2px] bg-slate-300" />
                
                <div className="flex justify-between">
                  {/* Child 1: Platform SAP Payout */}
                  <div className="flex flex-col items-center w-1/4 relative">
                    <div className="w-[2px] h-8 bg-slate-300" />
                    <div className="w-44 p-3 bg-white border border-blue-200 rounded-sm shadow-sm text-center z-10">
                      <div className="flex justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-500">平台SAP赔付</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{formatCurrency(stats.totalSapPayout)}</div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[8px] font-bold text-slate-400">
                          {(selectedScenario === Scenario.SCENARIO_1 || selectedScenario === Scenario.SCENARIO_2) ? "100" : Math.min((stats.totalSapPayout / (stats.totalPremium || 1)) * 100, 100).toFixed(0)}%
                        </span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500"
                            style={{ width: `${(selectedScenario === Scenario.SCENARIO_1 || selectedScenario === Scenario.SCENARIO_2) ? 100 : Math.min((stats.totalSapPayout / (stats.totalPremium || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Child 2: Platform PMP Payout */}
                  <div className="flex flex-col items-center w-1/4 relative">
                    <div className="w-[2px] h-8 bg-slate-300" />
                    <div className="w-44 p-3 bg-white border border-blue-100 rounded-sm shadow-sm text-center z-10">
                      <div className="flex justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-500">平台PMP赔付</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(stats.totalPmpPayout)}</div>
                    </div>
                  </div>

                  {/* Child 3: Third Party Payout */}
                  <div className="flex flex-col items-center w-1/4 relative">
                    <div className="w-[2px] h-8 bg-slate-300" />
                    <div className="w-44 p-3 bg-white border border-purple-200 rounded-sm shadow-sm text-center z-10">
                      <div className="flex justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-500">第三方赔付</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{formatCurrency(stats.totalSupplierPayout)}</div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[8px] font-bold text-slate-400">{Math.min((stats.totalSupplierPayout / (stats.totalPremium || 1)) * 100, 100).toFixed(0)}%</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500"
                            style={{ width: `${Math.min((stats.totalSupplierPayout / (stats.totalPremium || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Child 4: Regional Payout */}
                  <div className="flex flex-col items-center w-1/4 relative">
                    <div className="w-[2px] h-8 bg-slate-300" />
                    <div className="w-44 p-3 bg-white border border-red-200 rounded-sm shadow-sm text-center z-10">
                      <div className="flex justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-500">地区赔付</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(stats.totalRegionalPayout)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border border-[#e5e9f2] rounded-sm shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e5e9f2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#2d5cf6] p-1 rounded-sm text-white">
              <FileText size={14} />
            </div>
            <span className="text-sm font-bold">
              {viewType === ViewType.GROUP ? "业务明细表" : `${currentOrg} - 保险赔付明细表`}
            </span>
          </div>
          {viewType === ViewType.GROUP && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">情形筛选:</span>
              <select 
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-sm text-[10px] w-48 outline-none cursor-pointer font-medium text-slate-600"
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
              >
                <option value="">全景</option>
                {Object.values(Scenario).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {viewType === ViewType.GROUP ? (
            <table className="w-full text-left border-collapse min-w-[1800px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#e5e9f2]">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">情形分类</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">地区代码</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">地区名称</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right">基础保费赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-right">平台SAP赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-right">平台PMP赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-wider text-right bg-slate-50/50">基础外成本总额</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-right">供应商赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-right">平台赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-red-500 uppercase tracking-wider text-right">地区赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">2026年调优方向</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9f2]">
                {filteredData.map((item, index) => {
                  const isFirstOfScenario = index === 0 || filteredData[index - 1].scenario !== item.scenario;
                  let rowSpan = 1;
                  if (isFirstOfScenario) {
                    for (let i = index + 1; i < filteredData.length; i++) {
                      if (filteredData[i].scenario === item.scenario) {
                        rowSpan++;
                      } else {
                        break;
                      }
                    }
                  }

                  const basePayoutActual = item.basePremium * item.baseLossRatio;
                  const basePayoutCapped = Math.min(basePayoutActual, item.basePremium);
                  const excessPayout = Math.max(0, basePayoutActual - item.basePremium);
                  const insuranceOutsidePayout = item.sapPayout + item.pmpPayout + item.companyPayout + item.supplierPayout;
                  const totalOutsideCost = excessPayout + insuranceOutsidePayout;
                  const baseUsageRate = Math.min(item.baseLossRatio * 100, 100);
                  const sapRate = (item.scenario === Scenario.SCENARIO_1 || item.scenario === Scenario.SCENARIO_2)
                    ? 100
                    : Math.min((item.sapPayout / (item.basePremium || 1)) * 100, 100);
                  const supplierRate = Math.min((item.supplierPayout / (item.basePremium || 1)) * 100, 100);
                  const platformRate = Math.min((item.companyPayout / (item.basePremium || 1)) * 100, 100);
                  
                  return (
                    <tr key={item.id} className="bg-white">
                      {isFirstOfScenario && (
                        <td className={cn(
                          "px-4 py-4 border-r border-[#e5e9f2] bg-white text-center",
                          item.scenario === Scenario.SCENARIO_1 && "bg-red-50/10",
                          item.scenario === Scenario.SCENARIO_2 && "bg-orange-50/10"
                        )} rowSpan={rowSpan}>
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider inline-block whitespace-nowrap",
                              getScenarioBadgeStyle(item.scenario)
                            )}>
                              {item.scenario}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-bold text-slate-400">{item.regionCode}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 text-xs">{item.regionName}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-xs font-bold text-blue-600">
                          {formatCurrency(basePayoutCapped)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-indigo-600">
                            {formatCurrency(item.sapPayout)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-slate-400">{sapRate.toFixed(0)}%</span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500"
                                style={{ width: `${sapRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-xs font-bold text-indigo-600">
                          {formatCurrency(item.pmpPayout)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right bg-slate-50/30">
                        <span className="text-xs font-bold text-slate-800">
                          {formatCurrency(totalOutsideCost)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-slate-400">
                            {formatCurrency(item.supplierPayout)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-slate-400">{supplierRate.toFixed(0)}%</span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-400"
                                style={{ width: `${supplierRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-slate-400">
                            {formatCurrency(item.companyPayout)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-slate-400">{platformRate.toFixed(0)}%</span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-400"
                                style={{ width: `${platformRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={cn(
                          "text-xs font-bold",
                          excessPayout > 0 ? "text-red-500" : "text-slate-300"
                        )}>
                          {formatCurrency(excessPayout)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                          {item.optimizationDirection}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link to={`/claims/${item.regionCode}`} className="text-slate-300 transition-none">
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1800px]">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#e5e9f2]">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">工号</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">姓名</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">人员类型</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">业务外包公司</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">岗位</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">发生时间</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">是否工伤</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right whitespace-nowrap">社保理赔金额</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right whitespace-nowrap">平台SAP赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right whitespace-nowrap">平台PMP赔付</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right whitespace-nowrap">其他保险理赔</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-orange-600 uppercase tracking-wider text-right whitespace-nowrap">人道主义金额</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-wider text-right whitespace-nowrap">组织承担金额</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-wider text-right whitespace-nowrap">供应商承担金额</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-wider text-right whitespace-nowrap">平台承担金额</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-right whitespace-nowrap">法定赔付标准值测算</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9f2]">
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => (
                    <tr key={claim.id} className="bg-white">
                      <td className="px-4 py-4 text-xs font-mono text-slate-500">{claim.employeeId}</td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-900">{claim.name}</td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase",
                          claim.personnelType === "全职" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {claim.personnelType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">{claim.outsourcingCompany}</td>
                      <td className="px-4 py-4 text-xs text-slate-600 font-bold">{claim.position}</td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-500">{claim.occurrenceTime}</td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          claim.isWorkInjury ? "text-red-600" : "text-slate-400"
                        )}>
                          {claim.isWorkInjury ? "是" : "否"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-blue-600">{formatCurrency(claim.socialSecurityPayout)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-blue-600">{formatCurrency(claim.sapInsurancePayout)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-blue-600">{formatCurrency(claim.pmpInsurancePayout)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-blue-600">{formatCurrency(claim.otherInsurancePayout)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-orange-600">{formatCurrency(claim.humanitarianAmount)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-800">{formatCurrency(claim.organizationBearingAmount)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-800">{formatCurrency(claim.supplierBearingAmount)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-800">{formatCurrency(claim.platformBearingAmount)}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-indigo-600">{formatCurrency(claim.statutoryPayoutStandard)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center text-slate-400 text-xs">
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
              <span className="text-sm font-bold">商业保险补充建议</span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">当前预估风险金</div>
                <div className="text-lg font-bold text-slate-900">
                  {currentOrgData.estimatedRiskFund}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">建议增投保额</div>
                <div className="text-lg font-bold text-blue-600">
                  {recommendations[1]?.suggestedCoverage || 0}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">保费成本</div>
                <div className="text-lg font-bold text-emerald-600">
                  {recommendations[1]?.additionalPremium || 0}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">配置方案</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">增投保额</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right">保费成本</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-red-600 uppercase tracking-wider text-right">可覆盖风险金</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recommendations.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                          {rec.planName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">{rec.suggestedCoverage}</td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-blue-600">{rec.additionalPremium}</td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-red-600">{rec.expectedRiskReduction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
