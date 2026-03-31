import React from "react";
import { BookOpen, Shield, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export const StrategyLibrary: React.FC = () => {
  const strategies = [
    {
      title: "情形一：高风险对冲策略",
      description: "针对已超基础保费且保险外赔付金较高的地区，建议增加杠杆型商业保险补充。",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
      steps: [
        "对重点岗位/区域增投非对赌保险方案",
        "增加供应商赔付上限，当年赔付总额不超年度服务费总额",
        "建立月度风险复盘机制"
      ]
    },
    {
      title: "情形二：风险应对金优先策略",
      description: "针对已超基础保费但保险外赔付金较低的地区，优先使用保险外风险应对金。",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
      steps: [
        "优化基础雇主险方案，提高赔付效率",
        "加强现场安全巡检，降低事故发生率",
        "建立风险预警模型"
      ]
    },
    {
      title: "情形三：保险内赔付优先策略",
      description: "针对未超基础保费但保险外赔付金较高的地区，优先使用保险内赔付，维护良性合作。",
      icon: Shield,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      steps: [
        "引导供应商优先申报保险理赔",
        "优化理赔流程，缩短赔付周期",
        "定期评估保险覆盖范围"
      ]
    },
    {
      title: "情形四：稳健运行策略",
      description: "针对未超基础保费且保险外赔付金较低的地区，风险应对成本在可控范围内。",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      steps: [
        "维持现有保险方案不变",
        "持续监控赔付率动态变化",
        "优化日常安全培训体系"
      ]
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
          <BookOpen size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">保险调优策略库</h2>
          <p className="text-slate-400 font-bold mt-1">基于不同业务情形的标准化应对方案</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {strategies.map((strategy, i) => (
          <div 
            key={i}
            className={`p-10 rounded-[2.5rem] border ${strategy.border} ${strategy.bg} flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-white shadow-sm ${strategy.color}`}>
                  <strategy.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900">{strategy.title}</h3>
              </div>
              <p className="text-sm text-slate-600 font-bold leading-relaxed mb-8">
                {strategy.description}
              </p>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">执行步骤</h4>
                <ul className="space-y-3">
                  {strategy.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${strategy.color.replace('text-', 'bg-')}`} />
                      <span className="text-sm text-slate-700 font-bold">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
