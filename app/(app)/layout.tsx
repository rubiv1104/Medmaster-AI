import Sidebar from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, avatar_url, rcs_score, branch")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="app-layout">
      <Sidebar
        userName={
          profile?.full_name ??
          user.email ??
          "Student"
        }
        avatarUrl={profile?.avatar_url ?? null}
        rcsScore={profile?.rcs_score ?? 0}
        branch={profile?.branch ?? ""}
      />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
