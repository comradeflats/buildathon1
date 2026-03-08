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

    console.log('Hash from env:', adminPasswordHash);
    console.log('Hash length:', adminPasswordHash?.length);

    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, adminPasswordHash);
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
