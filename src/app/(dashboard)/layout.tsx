import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      {/* Sidebar — desktop only */}
      <div
        className="sidebar"
        style={{
          width: "240px",
          flexShrink: 0,
          height: "100vh",
        }}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* TopBar — fixed at top */}
        <div style={{ flexShrink: 0 }}>
          <TopBar />
        </div>

        {/* Page content — THIS is the scrollable area */}
        <div
          className="page-content"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}