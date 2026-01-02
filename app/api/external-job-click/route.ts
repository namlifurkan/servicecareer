import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID gerekli' }, { status: 400 });
    }

    const supabase = await createClient();

    // Increment click count using RPC function
    const { error } = await supabase.rpc('increment_external_job_click', {
      job_id: jobId,
    });

    if (error) {
      // Log but don't fail - click tracking should be non-blocking
      console.error('Click tracking error:', error.message);
      return NextResponse.json({ success: false }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log but don't fail - click tracking should be non-blocking
    console.error('Click tracking error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
