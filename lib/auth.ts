import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getCurrentUserRole(): Promise<'viewer' | 'producer' | 'admin' | null> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Cookie setting might fail
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Cookie removal might fail
          }
        },
      },
    }
  );

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  return data?.role ?? null;
}
