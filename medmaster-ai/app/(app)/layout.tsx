import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url, rcs_score, branch')
    .eq('id', user!.id)
    .single()

  return (
    <div className="app-layout">
      <Sidebar
        userName={profile?.full_name ?? 'Student'}
        avatarUrl={profile?.avatar_url ?? null}
        rcsScore={profile?.rcs_score ?? 0}
        branch={profile?.branch ?? ''}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
