import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Safer logging for debugging environment issues on Vercel
    console.log('Hash verification:', {
      length: adminPasswordHash.length,
      prefix: adminPasswordHash.substring(0, 10),
      suffix: adminPasswordHash.substring(adminPasswordHash.length - 5),
      hasSpaces: adminPasswordHash.includes(' '),
      hasNewlines: adminPasswordHash.includes('\n') || adminPasswordHash.includes('\r'),
    });

    const isValid = await bcrypt.compare(password, adminPasswordHash.trim());
    console.log('Password valid:', isValid);

    if (isValid) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
