import { NextResponse } from 'next/server';

export async function POST() {
  // We mock the ping. In production you might use fetch('https://www.google.com/ping?sitemap=...')
  return NextResponse.json({ success: true, message: 'Ping successful' });
}
