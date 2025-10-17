import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const adminStatus = isAdmin(user.email);

    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
