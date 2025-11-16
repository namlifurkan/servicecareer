'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Get user profile to redirect appropriately
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'company') {
      revalidatePath('/isveren/dashboard', 'layout')
      redirect('/isveren/dashboard')
    } else if (profile?.role === 'candidate') {
      revalidatePath('/aday/dashboard', 'layout')
      redirect('/aday/dashboard')
    } else if (profile?.role === 'admin') {
      revalidatePath('/admin', 'layout')
      redirect('/admin')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string

  const data = {
    email,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: fullName,
        role: formData.get('role') as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Send welcome email after successful registration
  const emailResult = await sendWelcomeEmail(email, fullName)
  if (!emailResult.success) {
    console.error('Failed to send welcome email:', emailResult.error)
    // Continue anyway - don't fail the registration
  }

  revalidatePath('/', 'layout')
  redirect('/giris')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
