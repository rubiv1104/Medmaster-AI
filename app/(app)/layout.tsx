import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <Sidebar
        userName="Nitin"
        avatarUrl={null}
        rcsScore={0}
        branch=""
      />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}