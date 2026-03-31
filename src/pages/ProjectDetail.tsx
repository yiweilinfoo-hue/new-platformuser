import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { MOCK_DATA } from "../constants";

export const ProjectDetail: React.FC = () => {
  const { regionCode } = useParams<{ regionCode: string }>();
  const project = MOCK_DATA.find(p => p.regionCode === regionCode);

  if (!project) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-black text-slate-900">未找到该项目</h2>
        <Link to="/" className="text-blue-700 font-bold mt-4 inline-block">返回看板</Link>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-12">
      <Link to="/" className="flex items-center gap-2 text-slate-400 font-bold text-sm">
        <ChevronLeft size={18} />
        返回看板
      </Link>

      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-12 border-b border-slate-50">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-2xl font-black text-blue-700 border border-blue-100">
              {project.regionCode}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{project.regionName}</h2>
                <span className="px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {project.scenario}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  <span>业务覆盖区域</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={16} />
                  <span>保险方案已激活</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-6 py-4 rounded-2xl flex items-center gap-3 ${project.baseLossRatio > 0.8 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {project.baseLossRatio > 0.8 ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">风险状态</p>
                <p className="text-lg font-black">{project.baseLossRatio > 0.8 ? '高风险预警' : '风险可控'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">基础数据</h4>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-400 font-bold mb-1">基础保费</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(project.basePremium)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-bold mb-1">满期赔付率</p>
                <p className="text-2xl font-black text-blue-700">{(project.baseLossRatio * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">赔付明细</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-600">商保赔付</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(project.commercialPayout)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-600">公司赔付</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(project.companyPayout)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-600">供应商赔付</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(project.supplierPayout)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">调优策略</h4>
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
              <p className="text-sm text-blue-900 font-bold leading-relaxed">
                {project.optimizationDirection}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
