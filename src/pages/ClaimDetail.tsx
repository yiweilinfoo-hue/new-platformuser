import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, FileText, Download } from "lucide-react";
import { MOCK_CLAIMS, MOCK_DATA } from "../constants";
import { cn } from "../lib/utils";

export const ClaimDetail: React.FC = () => {
  const { regionCode } = useParams<{ regionCode: string }>();
  
  const regionInfo = useMemo(() => {
    return MOCK_DATA.find(r => r.regionCode === regionCode);
  }, [regionCode]);

  const filteredClaims = useMemo(() => {
    return MOCK_CLAIMS.filter(c => c.regionCode === regionCode);
  }, [regionCode]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);
  };

  if (!regionInfo) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-xl font-bold text-slate-900">未找到该地区数据</h2>
        <Link to="/" className="text-[#2d5cf6] font-bold mt-4 inline-block transition-none">返回看板</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-slate-500 font-bold text-xs transition-none">
          <ChevronLeft size={14} />
          返回看板
        </Link>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-[#2d5cf6] text-white rounded-sm text-xs font-medium transition-none">
          <Download size={14} />
          导出明细
        </button>
      </div>

      <div className="bg-white border border-[#e5e9f2] rounded-sm shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e5e9f2] flex items-center gap-2">
          <div className="bg-[#2d5cf6] p-1 rounded-sm text-white">
            <FileText size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{regionInfo.regionName} - 保险赔付明细表</h3>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
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
                <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right whitespace-nowrap">商保理赔金额</th>
                <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider text-right whitespace-nowrap">其他保险理赔</th>
                <th className="px-4 py-3 text-[10px] font-bold text-orange-600 uppercase tracking-wider text-right whitespace-nowrap">人道主义金额</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-wider text-right whitespace-nowrap">组织承担金额</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-wider text-right whitespace-nowrap">供应商承担金额</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-700 uppercase tracking-wider text-right whitespace-nowrap">平台承担金额</th>
                <th className="px-4 py-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-right whitespace-nowrap">法定赔付标准值测算</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9f2]">
              {filteredClaims.map((claim) => (
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
                  <td className="px-4 py-4 text-right text-xs font-bold text-blue-600">{formatCurrency(claim.commercialInsurancePayout)}</td>
                  <td className="px-4 py-4 text-right text-xs font-bold text-blue-600">{formatCurrency(claim.otherInsurancePayout)}</td>
                  <td className="px-4 py-4 text-right text-xs font-bold text-orange-600">{formatCurrency(claim.humanitarianAmount)}</td>
                  <td className="px-4 py-4 text-right text-xs font-bold text-slate-800">{formatCurrency(claim.organizationBearingAmount)}</td>
                  <td className="px-4 py-4 text-right text-xs font-bold text-slate-800">{formatCurrency(claim.supplierBearingAmount)}</td>
                  <td className="px-4 py-4 text-right text-xs font-bold text-slate-800">{formatCurrency(claim.platformBearingAmount)}</td>
                  <td className="px-4 py-4 text-right text-xs font-bold text-indigo-600">{formatCurrency(claim.statutoryPayoutStandard)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
