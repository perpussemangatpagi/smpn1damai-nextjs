// Fungsi ini narik data diem-diem di server (nggak keliatan loading di HP user)
async function getBerita() {
  const res = await fetch('https://api.github.com/repos/perpussemangatpagi/smpn1damai/contents/content/berita', {
    headers: { Authorization: `Bearer ${process.env.GITHUB_PAT}` },
    next: { revalidate: 60 } // Rahasia Next.js: Auto-refresh data tiap 60 detik!
  });
  if (!res.ok) return [];
  return res.json();
}

// Ini Tampilan Web-nya
export default async function Beranda() {
  const berita = await getBerita();

  return (
    <main style={{ padding: '20px' }}>
      <h1>Selamat Datang di SMPN 1 Damai</h1>
      
      <section>
         <h2>Visi & Misi</h2>
         <p>Visi: Menjadi sekolah hebat dan bermartabat.</p>
      </section>

      <section>
         <h2>Berita Terbaru</h2>
         <div style={{ display: 'grid', gap: '10px' }}>
           {berita.map((item) => (
             <div key={item.sha} style={{ border: '1px solid black', padding: '10px' }}>
               <h3>{item.name.replace('.md', '')}</h3>
               <button>Baca</button>
             </div>
           ))}
         </div>
      </section>
    </main>
  )
}
