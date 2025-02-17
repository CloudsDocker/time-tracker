import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const timeEntry = await req.json()
  // Here you would typically save to your NoSQL database
  return NextResponse.json({ success: true, data: timeEntry })
}

export async function GET() {
  // Here you would typically fetch from your NoSQL database
  return NextResponse.json({ entries: [] })
}
