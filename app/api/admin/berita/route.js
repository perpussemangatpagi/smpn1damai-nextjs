import { NextResponse } from 'next/server';

const OWNER = 'perpussemangatpagi';
const REPO = 'smpn1damai-nextjs';
const TOKEN = process.env.GITHUB_TOKEN;

// Fungsi pembantu untuk cek kecocokan login admin
function cekAutentikasi(username, password) {
  return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
}

// 1. TAMBAH & EDIT BERITA (POST)
export async function POST(request) {
  try {
    const data = await request.json();
    const { username, password, filename, title, thumb, body, isEdit } = data;

    // Cek KTP Admin dulu bre
    if (!cekAutentikasi(username, password)) {
      return NextResponse.json({ error: 'Username atau Password Salah!' }, { status: 401 });
    }

    const pathFile = `content/berita/${filename}.json`;
    const urlGithub = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathFile}`;

    // Ambil tanggal hari ini otomatis buat berita baru
    const hari Ini = new Date();
    const tanggalCantik = hariIni.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Racikan isi data berita yang disimpan (Penulis diambil otomatis dari Vercel Env)
    const isiBerita = {
      filename,
      title,
      thumb: thumb || 'https://raw.githubusercontent.com/perpussemangatpagi/smpn1damai-nextjs/main/public/og-logo.png',
      tanggalCantik,
      author: process.env.AUTHOR_NAME || 'Admin Sekolah',
      snippetBersih: body.replace(/[#*`_]/g, '').substring(0, 120) + '...',
      body
    };

    // Cari tahu apakah file sudah ada di github (buat dapetin SHA kalau mode Edit)
    let sha = null;
    const cekFile = await fetch(urlGithub, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (cekFile.ok) {
      const infoFile = await cekFile.json();
      sha = infoFile.sha;
    }

    // Kirim atau timpa data ke GitHub
    const responGithub = await fetch(urlGithub, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: isEdit ? `Mengubah berita: ${title}` : `Menambah berita baru: ${title}`,
        content: Buffer.from(JSON.stringify(isiBerita, null, 2)).toString('base64'),
        sha: sha || undefined
      })
    });

    if (!responGithub.ok) throw new Error('Gagal berkomunikasi dengan GitHub API');

    return NextResponse.json({ success: true, message: 'Berita berhasil disimpan ke GitHub!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. HAPUS BERITA (DELETE)
export async function DELETE(request) {
  try {
    const data = await request.json();
    const { username, password, filename } = data;

    if (!cekAutentikasi(username, password)) {
      return NextResponse.json({ error: 'Akses Ditolak!' }, { status: 401 });
    }

    const pathFile = `content/berita/${filename}`;
    const urlGithub = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathFile}`;

    // Ambil SHA file dulu sebelum dihapus
    const cekFile = await fetch(urlGithub, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!cekFile.ok) return NextResponse.json({ error: 'File berita tidak ditemukan di GitHub!' }, { status: 404 });
    const infoFile = await cekFile.json();

    // Eksekusi hapus file di repo
    const hapusFile = await fetch(urlGithub, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `Menghapus berita: ${filename}`,
        sha: infoFile.sha
      })
    });

    if (!hapusFile.ok) throw new Error('Gagal menghapus file di GitHub');

    return NextResponse.json({ success: true, message: 'Berita berhasil dihapus!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
      }
