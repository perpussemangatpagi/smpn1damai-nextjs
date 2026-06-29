import { NextResponse } from 'next/server';

export async function GET(request) {
  const token = process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; // <-- GANTI INI
  
  // Cara Next.js ngambil parameter URL (?path=...)
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  
  if (!path) return NextResponse.json({ error: 'Alamat path tidak ada' }, { status: 400 });

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 } // Gak boleh di-cache biar selalu narik yang terbaru
    });
    
    if (!res.ok) throw new Error('File tidak ditemukan di GitHub');
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
