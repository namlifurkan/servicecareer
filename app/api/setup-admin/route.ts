import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email gerekli' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update user to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        is_active: true,
      })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${email} artık admin!`,
      user: data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
