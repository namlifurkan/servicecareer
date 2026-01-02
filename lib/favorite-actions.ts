'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(jobId: string): Promise<{ success: boolean; isFavorited: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, isFavorited: false, error: 'Giriş yapmanız gerekiyor' }
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .single()

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId)

    if (error) {
      return { success: false, isFavorited: true, error: 'Favori kaldırılamadı' }
    }

    revalidatePath('/dashboard/favorilerim')
    return { success: true, isFavorited: false }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        job_id: jobId
      })

    if (error) {
      return { success: false, isFavorited: false, error: 'Favorilere eklenemedi' }
    }

    revalidatePath('/dashboard/favorilerim')
    return { success: true, isFavorited: true }
  }
}

export async function getFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { favorites: [], error: 'Giriş yapmanız gerekiyor' }
  }

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      jobs (
        id,
        title,
        slug,
        location_city,
        work_type,
        salary_min,
        salary_max,
        show_salary,
        published_at,
        status,
        companies (
          name,
          logo_url
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { favorites: [], error: 'Favoriler yüklenemedi' }
  }

  // Filter out jobs that are no longer active
  const activeFavorites = favorites?.filter(
    (fav: any) => fav.jobs && fav.jobs.status === 'active'
  ) || []

  return { favorites: activeFavorites, error: null }
}

export async function checkIsFavorited(jobId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .single()

  return !!data
}

export async function getFavoriteJobIds(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('job_id')
    .eq('user_id', user.id)

  return favorites?.map(f => f.job_id) || []
}
