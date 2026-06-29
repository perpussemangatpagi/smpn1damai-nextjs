import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; // <-- Ganti ini bre!
  
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/content/berita`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 } // Bypass cache biar up-to-date
    });
    if (!res.ok) return NextResponse.json([]);
    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
