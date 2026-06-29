import { NextResponse } from 'next/server';

export async function POST(request) {
  const token = process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; // <-- Ganti ini bre!
  
  try {
    const { username, password, path, sha } = await request.json();
    const usersList = JSON.parse(process.env.CMS_USERS || '[]');
    const user = usersList.find(u => u.user === username && u.pass === password);
    if (!user) return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Hapus berita oleh ${user.nama}`, sha: sha, branch: 'main' })
    });

    if (!res.ok) throw new Error('Gagal hapus di GitHub');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
