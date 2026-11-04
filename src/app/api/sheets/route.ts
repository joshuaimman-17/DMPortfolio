import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheetValues, appendSpreadsheetRow } from '@/lib/workspace';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Bearer token required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    const range = searchParams.get('range') || 'Sheet1!A1:Z100';

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'spreadsheetId parameter is required' }, { status: 400 });
    }

    const result = await getSpreadsheetValues(token, spreadsheetId, range);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Bearer token required' }, { status: 401 });
    }

    const body = await req.json();
    const { spreadsheetId, range, values } = body;

    if (!spreadsheetId || !range || !values) {
      return NextResponse.json(
        { error: 'spreadsheetId, range, and values array are required' },
        { status: 400 }
      );
    }

    const result = await appendSpreadsheetRow(token, spreadsheetId, range, values);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
