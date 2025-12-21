import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // Get user to determine redirect
  const { data: { user } } = await supabase.auth.getUser()

  let redirectUrl = '/'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Sign out
    await supabase.auth.signOut()

    // Redirect based on role
    if (profile?.role === 'company') {
      redirectUrl = '/isveren/giris'
    } else {
      redirectUrl = '/giris'
    }
  }

  return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
    status: 302,
  })
}
