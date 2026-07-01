// app/page.jsx
import ClientPage from './ClientPage';

async function getBeritaLengkap() {
  const token = process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; // <-- GANTI NAMA REPO NEXTJS LU BRE!
  const rawUrl = `https://raw.githubusercontent.com/${repo}/main`;

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/content/berita`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  
  if (!res.ok) return [];
  const files = await res.json();
  const fileBerita = files.filter(f => f.name.endsWith('.md')).reverse().slice(0, 6);

  const detailPromises = fileBerita.map(async (file) => {
    const dRes = await fetch(`https://api.github.com/repos/${repo}/contents/${file.path}`, {
       headers: { Authorization: `Bearer ${token}` }
    });
    const dData = await dRes.json();
    const teksMentah = Buffer.from(dData.content, 'base64').toString('utf8');

    const title = teksMentah.match(/title:\s*"(.*?)"/)?.[1] || 'Tanpa Judul';
    const dateRaw = teksMentah.match(/date:\s*"(.*?)"/)?.[1] || '';
    const author = teksMentah.match(/author:\s*"(.*?)"/)?.[1] || 'Humas';
    let thumb = teksMentah.match(/thumbnail:\s*"(.*?)"/)?.[1] || '';
    
    if (thumb && thumb.startsWith('/')) { thumb = rawUrl + thumb; } 
    else if (!thumb) { thumb = 'https://via.placeholder.com/400x200?text=Tidak+Ada+Foto'; }

    const tglObj = new Date(dateRaw);
    const tanggalCantik = isNaN(tglObj) ? '-' : tglObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    let body = teksMentah.replace(/---[\s\S]*?---/, '').trim();

    // Bikin snippet pratinjau bersih di server
    let snippetBersih = body.replace(/!\[.*?\]\(.*?\)/g, ''); 
    snippetBersih = snippetBersih.replace(/[#*`_>!\[\]()]/g, '').substring(0, 110) + '...';

    return { filename: file.name.replace('.md', ''), title, thumb, tanggalCantik, author, body, snippetBersih };
  });

  return Promise.all(detailPromises);
}

async function getSettings() {
  const token = process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai-nextjs'; // <-- GANTI JUGA DI SINI BRE!
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
