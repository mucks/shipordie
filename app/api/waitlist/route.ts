import { NextRequest, NextResponse } from 'next/server';
import { waitlistDb } from '@/lib/db';
import { z } from 'zod';

const waitlistSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  walletAddress: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  features: z.array(z.string()).optional(),
  willPay: z.string().min(1, 'Payment interest is required'),
  additionalInfo: z.string().optional(),
});

// POST - Create waitlist entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = waitlistSchema.parse(body);

    // Check if email already exists
    const existing = waitlistDb.getWaitlistEntryByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400 }
      );
    }

    // Insert entry
    waitlistDb.insertWaitlistEntry({
      name: data.name,
      email: data.email,
      wallet_address: data.walletAddress || null,
      role: data.role,
      features: data.features || null,
      will_pay: data.willPay,
      additional_info: data.additionalInfo || null,
    });

    return NextResponse.json(
      { message: 'Successfully added to waitlist' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating waitlist entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add to waitlist';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

