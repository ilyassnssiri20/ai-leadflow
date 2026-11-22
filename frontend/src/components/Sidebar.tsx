
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Settings as SettingsIcon,
  BrainCircuit,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Leads", path: "/leads", icon: Users },
  { name: "Pipeline", path: "/pipeline", icon: GitBranch },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white p-6">
      <div className="flex items-center gap-3 mb-10">
        <BrainCircuit size={28} className="text-blue-400" />
        <h1 className="text-xl font-bold">AI LeadFlow</h1>
      </div>

      <p className="text-xs uppercase text-slate-500 mb-4">
        Workspace
      </p>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
