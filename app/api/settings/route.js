import { NextResponse } from 'next/server';

const token = process.env.GITHUB_PAT;
// GANTI BAGIAN INI SESUAI NAMA REPO NEXT.JS LU!
const repo = 'perpussemangatpagi/smpn1damai-nextjs'; 
const path = 'content/settings.json';

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 } // Bypass cache CMS biar selalu narik yang terbaru
    });
    if (!res.ok) return NextResponse.json({ profil: "", visi: "", misi: "" });
    
    const data = await res.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    return NextResponse.json({ ...content, sha: data.sha });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, password, settings, sha } = await request.json();
    
    // Verifikasi Password (kayak sistem lama)
    const usersList = JSON.parse(process.env.CMS_USERS || '[]');
    const user = usersList.find(u => u.user === username && u.pass === password);
    if (!user) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
    
    const encodedContent = Buffer.from(JSON.stringify(settings, null, 2), 'utf8').toString('base64');
    const payload = {
      message: `Update pengaturan web oleh ${user.nama}`,
      content: encodedContent,
      branch: 'main',
      sha: sha
    };

    const saveRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!saveRes.ok) throw new Error('Gagal menyimpan ke GitHub');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
