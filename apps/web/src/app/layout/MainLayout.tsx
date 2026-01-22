import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Users, ClipboardList, PlusCircle, BarChart3 } from "lucide-react";

const navItems = [
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/visits", label: "Visits", icon: ClipboardList },
  { to: "/create", label: "Create", icon: PlusCircle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 }
];

export function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-18 md:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm font-semibold">
            HCA
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold leading-tight">MedHerbEMR</span>
            <span className="text-xs text-muted-foreground">Balmain Chinese Herbal Centre</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card px-6 py-3 text-sm text-muted-foreground flex items-center justify-between">
          <div>
            <div className="font-medium text-foreground">MedHerbEMR</div>
            <div className="text-xs text-muted-foreground">
              中医电子病历系统（MVP）
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 bg-background/60">{children}</div>
      </main>
    </div>
  );
}


