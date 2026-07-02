// app/page.jsx
import ClientPage from './ClientPage';

async function getBeritaLengkap() {
  // Menggunakan token yang ada di Vercel env lu bre
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; 

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/content/berita`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  
  if (!res.ok) return [];
  const files = await res.json();
  
  // 🔥 1. GANTI FILTER: Sekarang nyari file .json racikan CMS baru
  const fileBerita = files.filter(f => f.name.endsWith('.json')).reverse().slice(0, 6);

  const detailPromises = fileBerita.map(async (file) => {
    const dRes = await fetch(`https://api.github.com/repos/${repo}/contents/${file.path}`, {
       headers: { Authorization: `Bearer ${token}` }
    });
    const dData = await dRes.json();
    const teksMentah = Buffer.from(dData.content, 'base64').toString('utf8');

    try {
      // 🔥 2. PARSE OTOMATIS: Gak perlu ribet pakai regex lagi, langsung kunyah objek JSON
      const dataJson = JSON.parse(teksMentah);

      return {
        filename: file.name.replace('.json', ''),
        title: dataJson.title || 'Tanpa Judul',
        thumb: dataJson.thumb || 'https://raw.githubusercontent.com/perpussemangatpagi/smpn1damai-nextjs/main/public/og-logo.png',
        images: dataJson.images || [], // Ambil data array multi-foto
        tanggalCantik: dataJson.tanggalCantik || '-',
        author: dataJson.author || 'Admin Sekolah',
        body: dataJson.body || '',
        snippetBersih: dataJson.snippetBersih || ''
      };
    } catch (err) {
      console.error("Gagal parse JSON berita:", file.name);
      return null;
    }
  });

  const hasil = await Promise.all(detailPromises);
  return hasil.filter(item => item !== null); // Buang data jikalau ada yang error
}

async function getSettings() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; 
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/content/settings.json`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
}

export default async function Home() {
  const dataBerita = await getBeritaLengkap();
  const dataSettings = await getSettings();
  
  return <ClientPage berita={dataBerita} settings={dataSettings} />;
}
