import { NextResponse } from 'next/server';

const OWNER = 'perpussemangatpagi';
const REPO = 'smpn1damai-nextjs';

function cekAutentikasi(username, password) {
  return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
}

export async function POST(request) {
  try {
    const TOKEN = process.env.GITHUB_TOKEN;
    const { username, password, filename, title, body, isEdit, newImages, oldThumb } = await request.json();

    if (!cekAutentikasi(username, password)) {
      return NextResponse.json({ error: 'Username atau Password Salah!' }, { status: 401 });
    }

    let uploadedUrls = [];

    // 🔥 LOOP UPLOAD GAMBAR BARU KE GITHUB
    if (newImages && newImages.length > 0) {
      for (let file of newImages) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, ''); // Bersihin nama file dari spasi
        const imgPath = `content/gambar/${Date.now()}-${cleanName}`;
        const urlGithubImg = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${imgPath}`;

        const resImg = await fetch(urlGithubImg, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Upload gambar: ${cleanName}`,
            content: file.data
          })
        });

        if (resImg.ok) {
           // Kalau sukses, ambil link raw-nya
           uploadedUrls.push(`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${imgPath}`);
        }
      }
    } else if (oldThumb) {
      // Kalau mode edit tapi ga ada foto baru diupload, pakai foto lama
      uploadedUrls = oldThumb.split(',').map(url => url.trim());
    }

    const mainThumb = uploadedUrls.length > 0 ? uploadedUrls[0] : 'https://raw.githubusercontent.com/perpussemangatpagi/smpn1damai-nextjs/main/public/og-logo.png';

    const isiBerita = {
      filename: filename.replace('.json',''),
      title,
      thumb: mainThumb,
      images: uploadedUrls,
      tanggalCantik: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: process.env.AUTHOR_NAME || 'Admin Sekolah',
      snippetBersih: body.substring(0, 100) + '...',
      body
    };

    const pathFile = `content/berita/${filename}.json`;
    const urlGithub = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathFile}`;

    let sha = null;
    const check = await fetch(urlGithub, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    if (check.ok) sha = (await check.json()).sha;

    const responGithub = await fetch(urlGithub, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: isEdit ? `Update Berita: ${title}` : `Tambah Berita: ${title}`,
        content: Buffer.from(JSON.stringify(isiBerita, null, 2)).toString('base64'),
        sha: sha || undefined
      })
    });

    if (!responGithub.ok) throw new Error('Gagal simpan berita JSON ke GitHub');
    return NextResponse.json({ success: true, message: 'Berhasil upload & simpan berita!' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 2. HAPUS BERITA (DELETE)
export async function DELETE(request) {
  try {
    const TOKEN = process.env.GITHUB_TOKEN;
    const { username, password, filename } = await request.json();

    if (!cekAutentikasi(username, password)) {
      return NextResponse.json({ error: 'Akses Ditolak!' }, { status: 401 });
    }

    const pathFile = `content/berita/${filename}`;
    const urlGithub = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathFile}`;

    const cekFile = await fetch(urlGithub, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    if (!cekFile.ok) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
    
    const infoFile = await cekFile.json();

    const hapusFile = await fetch(urlGithub, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Hapus berita: ${filename}`, sha: infoFile.sha })
    });

    if (!hapusFile.ok) throw new Error('Gagal hapus');
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
