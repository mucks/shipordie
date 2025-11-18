import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { waitlistDb } from '@/lib/db';

// GET - Get all waitlist entries (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const entries = waitlistDb.getAllWaitlistEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

