import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json(); // Ngambil data dari form CMS
    
    // ... Logika nyimpen ke GitHub persis kayak kemaren ...
    
    return NextResponse.json({ success: true, pesan: "Berita berhasil diterbitkan!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
