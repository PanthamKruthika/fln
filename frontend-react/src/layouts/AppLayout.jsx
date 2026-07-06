import { useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { roles } from "../data/roles";

function initialsFromName(name = "") {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AppLayout({
  navItems,
  title,
  subtitle,
  announcement,
  activeId,
  onSelect,
  children,
}) {
  const { user } = useAuth();
  const profile = useMemo(() => {
    if (!user) return null;
    const fallback = roles[user.role];
    return {
      name:  user.name  ?? fallback?.title ?? "User",
      email: user.email ?? fallback?.email ?? "",
      avatar: initialsFromName(user.name) || fallback?.avatar || "U",
    };
  }, [user]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        items={navItems}
        activeId={activeId ?? "dashboard"}
        onSelect={onSelect}
        user={profile}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          announcement={announcement}
        />
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}