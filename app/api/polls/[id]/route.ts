import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: poll, error } = await supabase
    .from('poll_results')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !poll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
  }

  return NextResponse.json(poll);
}
