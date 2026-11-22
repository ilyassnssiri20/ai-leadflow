
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{title}</p>
        <Icon size={22} className="text-blue-600" />
      </div>

      <h2 className="text-3xl font-bold mt-4 text-slate-900">
        {value}
      </h2>

      <p className="text-xs text-slate-400 mt-2">
        {description}
      </p>
    </div>
  );
}
