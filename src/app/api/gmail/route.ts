import { NextRequest, NextResponse } from 'next/server';
import { sendGmail } from '@/lib/workspace';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Bearer token required' }, { status: 401 });
    }

    const body = await req.json();
    const { to, subject, htmlBody } = body;

    if (!to || !subject || !htmlBody) {
      return NextResponse.json(
        { error: 'Fields "to", "subject", and "htmlBody" are required' },
        { status: 400 }
      );
    }

    const result = await sendGmail(token, { to, subject, htmlBody });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
