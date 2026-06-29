// FUNGSI INI JALAN DI MESIN VERCEL (Nggak akan ketahuan di HP user)
async function getBeritaLengkap() {
  const token = process.env.GITHUB_PAT;
  const repo = 'perpussemangatpagi/smpn1damai';
  const rawUrl = `https://raw.githubusercontent.com/${repo}/main`;

  // 1. Cek ada file berita apa aja
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/content/berita`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 10 } // Otomatis refresh data tiap 10 detik!
  });
  
  if (!res.ok) return [];
  const files = await res.json();
  const fileBerita = files.filter(f => f.name.endsWith('.md')).reverse().slice(0, 6);

  // 2. Buka satu-satu file-nya buat nyari judul sama foto sampul
  const detailPromises = fileBerita.map(async (file) => {
    const dRes = await fetch(`https://api.github.com/repos/${repo}/contents/${file.path}`, {
       headers: { Authorization: `Bearer ${token}` }
    });
    const dData = await dRes.json();
    
    // Server Vercel langsung nerjemahin kode Base64 ke Teks
    const teksMentah = Buffer.from(dData.content, 'base64').toString('utf8');

    // Nyari judul dan foto pakai Regex
    const title = teksMentah.match(/title:\s*"(.*?)"/)?.[1] || file.name;
    let thumb = teksMentah.match(/thumbnail:\s*"(.*?)"/)?.[1] || '';
    
    if (thumb && thumb.startsWith('/')) { 
        thumb = rawUrl + thumb; 
    } else if (!thumb) { 
        thumb = 'https://via.placeholder.com/400x200?text=Tanpa+Foto'; 
    }

    return { sha: file.sha, title, thumb };
  });

  // Tunggu semua file selesai dibongkar barengan
  return Promise.all(detailPromises);
}


// TAMPILAN HALAMAN (JSX)
export default async function Beranda() {
  // Panggil fungsinya
  const berita = await getBeritaLengkap();

  return (
    <>
      <div className="hero">
        <h1>Selamat Datang di<br/>SMP Negeri 1 Damai</h1>
        <p>Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.</p>
      </div>

      <div className="container">
        
        {/* KARTU VISI MISI */}
        <section className="section-card glass">
          <h2 className="section-title">Visi & Misi</h2>
          <p><strong>Visi:</strong> Mewujudkan peserta didik yang beriman, cerdas, terampil, dan berwawasan lingkungan.</p>
          <p style={{ marginTop: '10px' }}><strong>Misi:</strong> Menyelenggarakan pembelajaran aktif dan inovatif.</p>
        </section>

        {/* KARTU BERITA */}
        <section className="section-card glass">
          <h2 className="section-title">Berita & Informasi Terbaru</h2>
          
          <div className="news-grid">
            {berita.map((item) => (
              // Looping berita otomatis dari server
              <div key={item.sha} className="news-card">
                <img src={item.thumb} alt={item.title} className="news-img" />
                <div className="news-content">
                  <h3 className="news-title">{item.title}</h3>
                  <a href="#" className="btn-baca">Baca Selengkapnya</a>
                </div>
              </div>
            ))}
          </div>

          {berita.length === 0 && (
             <p>Belum ada berita yang diterbitkan.</p>
          )}
        </section>

      </div>
    </>
  )
}
