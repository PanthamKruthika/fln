import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AppLayout({
  navItems,
  user,
  title,
  subtitle,
  announcement,
  activeId,
  onSelect,
  children,
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        items={navItems}
        activeId={activeId ?? "dashboard"}
        onSelect={onSelect}
        user={user}
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