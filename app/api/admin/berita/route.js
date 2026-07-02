import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password, filename, title, thumbStr, images, body, isEdit } = await request.json();
    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'Salah' }, { status: 401 });

    const pathFile = `content/berita/${filename}.json`;
    const url = `https://api.github.com/repos/perpussemangatpagi/smpn1damai-nextjs/contents/${pathFile}`;
    
    // Foto pertama jadi thumb
    const mainThumb = images.length > 0 ? images[0] : 'https://raw.githubusercontent.com/perpussemangatpagi/smpn1damai-nextjs/main/public/og-logo.png';

    const contentData = {
      filename: filename.replace('.json',''),
      title,
      thumb: mainThumb,
      images: images, // Array foto
      tanggalCantik: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: process.env.AUTHOR_NAME || 'Admin',
      snippetBersih: body.substring(0, 100) + '...',
      body
    };

    let sha = null;
    const check = await fetch(url, { headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } });
    if (check.ok) sha = (await check.json()).sha;

    await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update Berita',
        content: Buffer.from(JSON.stringify(contentData, null, 2)).toString('base64'),
        sha: sha || undefined
      })
    });
    return NextResponse.json({ success: true, message: 'Berhasil!' });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
// (Bagian DELETE tetap sama, tidak usah diubah)
