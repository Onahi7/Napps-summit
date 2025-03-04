import { NextResponse } from 'next/server';
import { generateBulkTags } from '@/lib/tagGenerator';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get registration IDs from request
    const { registrationIds } = await request.json();
    
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid registration IDs' },
        { status: 400 }
      );
    }

    // Generate tags
    const tagPaths = await generateBulkTags(registrationIds);

    return NextResponse.json({ tagPaths });
  } catch (error) {
    console.error('Error generating tags:', error);
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    );
  }
}
