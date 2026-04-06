import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, History, BarChart2,
  Settings, Shield, LogOut, Music, Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const displayName =
    profile?.display_name && profile.display_name !== user?.email
      ? profile.display_name.split(" ")[0]
      : user?.email?.split("@")[0] || "User";

  const navItems = [
    { to: "/",          icon: Home,          label: "Home"        },
    { to: "/history",   icon: History,       label: "Mood History" },
    { to: "/dashboard", icon: BarChart2,     label: "Dashboard"   },
    { to: "/settings",  icon: Settings,      label: "Settings"    },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin Panel" }] : []),
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"} className={linkClass} onClick={onNav}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border/40">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-semibold truncate">{displayName}</p>
          {isAdmin && <span className="text-[10px] text-primary font-medium">Admin</span>}
        </div>
        <button
          onClick={() => { signOut(); onNav?.(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/40 bg-card/40 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border/40 shrink-0">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm font-display">VibeSync</span>
        </div>
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm font-display">VibeSync</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -272 }}
              animate={{ x: 0 }}
              exit={{ x: -272 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-card border-r border-border/40 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/15 p-1.5">
                    <Music className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-sm font-display">VibeSync</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent onNav={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
