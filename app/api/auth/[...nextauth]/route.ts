import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Google login production fazında etkinleştirilecek. Lokal deneme için DEV_USER_EMAIL kullanılıyor."
    },
    { status: 501 }
  );
}

export const POST = GET;
