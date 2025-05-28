import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Step 1: Read incoming order (request) from customer (frontend)
  const data = await request.json();
  const { mode, plaintext } = data;

  // Step 2: For now, just repeat back the order to confirm kitchen hears it
  return NextResponse.json({
    mode,
    plaintext,
    message: 'API is working, crypto logic coming soon',
  });
}
