// app/api/timeEntries/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TimeEntry from '@/models/TimeEntry';

export async function GET() {
  try {
    await dbConnect();
    const entries = await TimeEntry.find({});
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const entry = await TimeEntry.create(data);
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}