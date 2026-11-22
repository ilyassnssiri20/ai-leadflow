
import { useEffect, useState } from "react";
import { getLeads } from "../services/api";
import type { Lead } from "../types/lead";

import {
  Users,
  Flame,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const totalLeads = leads.length;

  const hotLeads = leads.filter(
    (lead) => lead.priority === "hot"
  ).length;

  const warmLeads = leads.filter(
    (lead) => lead.priority === "warm"
  ).length;

  const coldLeads = leads.filter(
    (lead) => lead.priority === "cold"
  ).length;

  const convertedLeads = leads.filter(
    (lead) => lead.status === "converted"
  ).length;

  const averageScore =
    totalLeads > 0
      ? Math.round(
          leads.reduce((sum, lead) => sum + (lead.leadScore || 0), 0) /
            totalLeads
        )
      : 0;

  const conversionRate =
    totalLeads > 0
      ? Math.round((convertedLeads / totalLeads) * 100)
      : 0;

  const priorityData = [
    { name: "Hot", value: hotLeads, color: "#ef4444" },
    { name: "Warm", value: warmLeads, color: "#f97316" },
    { name: "Cold", value: coldLeads, color: "#64748b" },
  ];

  const statusData = [
    { name: "New", value: leads.filter((l) => l.status === "new").length },
    { name: "Contacted", value: leads.filter((l) => l.status === "contacted").length },
    { name: "Qualified", value: leads.filter((l) => l.status === "qualified").length },
    { name: "Negotiation", value: leads.filter((l) => l.status === "negotiation").length },
    { name: "Converted", value: convertedLeads },
    { name: "Lost", value: leads.filter((l) => l.status === "lost").length },
  ];

  const recentLeads = [...leads]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      description: "All registered prospects",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Hot Leads",
      value: hotLeads,
      description: "High-priority prospects",
      icon: Flame,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Average AI Score",
      value: `${averageScore}/100`,
      description: "AI qualification score",
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      description: "Converted leads / all leads",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Welcome to your AI LeadFlow overview.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white p-5 rounded-xl border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800 mt-2">
                    {stat.value}
                  </h2>
                </div>

                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <Icon size={23} />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Leads by status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-6">
            Leads by Status
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-6">
            Lead Priority Distribution
          </h2>

          <div className="h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-5 text-sm">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

        <div className="p-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            Recent Leads
          </h2>

          <span className="text-sm text-slate-500">
            Latest 5 prospects
          </span>
        </div>

        {recentLeads.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No leads available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">Priority</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="p-4 font-medium text-slate-800">
                      {lead.firstName} {lead.lastName}
                    </td>

                    <td className="p-4 text-slate-500">
                      {lead.email}
                    </td>

                    <td className="p-4">
                      {lead.budget?.toLocaleString()} MAD
                    </td>

                    <td className="p-4 font-semibold">
                      {lead.leadScore}/100
                    </td>

                    <td className="p-4 capitalize">
                      {lead.priority}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extra information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Warm Leads</p>
          <p className="text-2xl font-bold text-orange-500 mt-2">
            {warmLeads}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Cold Leads</p>
          <p className="text-2xl font-bold text-slate-500 mt-2">
            {coldLeads}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Converted Leads</p>
          <div className="flex items-center gap-2 mt-2">
            <UserCheck className="text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {convertedLeads}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
