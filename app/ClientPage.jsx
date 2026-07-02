'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ClientPage({ berita, settings }) {
  const [activeModal, setActiveModal] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const navListRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const beritaParam = searchParams.get('berita');
    if (beritaParam && berita) {
      const idx = berita.findIndex(b => b.filename === beritaParam);
      if (idx !== -1) { setActiveModal(berita[idx]); document.body.style.overflow = 'hidden'; }
    }
  }, [searchParams, berita]);

  const cekPanah = () => {
    if (navListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navListRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollWidth - clientWidth - scrollLeft > 5);
    }
  };

  useEffect(() => {
    cekPanah(); 
    const navEl = navListRef.current;
    if (navEl) navEl.addEventListener('scroll', cekPanah);
    window.addEventListener('resize', cekPanah);
    return () => {
      if (navEl) navEl.removeEventListener('scroll', cekPanah);
      window.removeEventListener('resize', cekPanah);
    };
  }, []);

  const scrollNav = (jarak) => { if (navListRef.current) navListRef.current.scrollBy({ left: jarak, behavior: 'smooth' }); };
  const bukaModal = (item) => { setActiveModal(item); router.push(`?berita=${item.filename}`, { scroll: false }); document.body.style.overflow = 'hidden'; };
  const tutupModal = (e) => {
    if(e.target.id === 'modal-berita-next' || e.target.className === 'close-btn') {
        setActiveModal(null); router.push('/', { scroll: false }); document.body.style.overflow = 'auto';
    }
  };

  const bagikanBerita = async () => {
    const urlBerita = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: activeModal.title, text: 'Baca berita terbaru dari SMPN 1 Damai!', url: urlBerita }); } 
      catch (err) { console.log('Batal share'); }
    } else {
      navigator.clipboard.writeText(urlBerita); alert('Link berita berhasil disalin!');
    }
  };

  const semuaData = [
    ...berita.map(b => ({ tipe: 'Berita', judul: b.title, link: b, konten: b.snippetBersih })),
    { tipe: 'Halaman', judul: 'Profil Sekolah', link: '#profil', konten: settings?.profil || 'Membentuk generasi unggul' },
    { tipe: 'Visi & Misi', judul: 'Visi Sekolah', link: '#visimisi', konten: settings?.visi || '' },
    { tipe: 'Visi & Misi', judul: 'Misi Sekolah', link: '#visimisi', konten: settings?.misi || '' },
    { tipe: 'Struktur', judul: 'Struktur Organisasi', link: '#struktur', konten: 'Bagan Kepala Sekolah, Guru, Staf' },
    { tipe: 'Fasilitas', judul: 'Perpus Semangat Pagi', link: 'https://perpus.smpn1damai.web.id', konten: 'Perpustakaan digital dan e-katalog' },
    { tipe: 'Fasilitas', judul: 'ExamBro Ujian', link: 'https://exambro.smpn1damai.web.id', konten: 'Aplikasi ujian anti kecurangan' },
    { tipe: 'Kontak', judul: 'Alamat Sekolah', link: '#kontak', konten: settings?.alamat || 'Jl. Temenggung Gamas' },
    { tipe: 'Sosial Media', judul: 'Instagram SMPN 1 Damai', link: `https://instagram.com/${settings?.ig}`, konten: 'Foto dokumentasi kegiatan' },
    { tipe: 'Sosial Media', judul: 'YouTube SMPN 1 Damai', link: settings?.yt || '#kontak', konten: 'Video dokumentasi kegiatan sekolah' }
  ];

  const hasilCari = query.length > 1 ? semuaData.filter(item => 
    item.judul.toLowerCase().includes(query.toLowerCase()) || 
    item.konten.toLowerCase().includes(query.toLowerCase())
  ) : [];

  const klikHasil = (item) => {
    setIsSearchOpen(false); document.body.style.overflow = 'auto';
    setQuery('');
    if (item.tipe === 'Berita') {
      bukaModal(item.link);
    } else if (typeof item.link === 'string' && item.link.startsWith('http')) {
      window.open(item.link, '_blank');
    } else {
      window.location.href = item.link;
    }
  };

  const bukaSearch = () => { setIsSearchOpen(true); document.body.style.overflow = 'hidden'; };
  const tutupSearch = () => { setIsSearchOpen(false); document.body.style.overflow = 'auto'; setQuery(''); };

  return (
    <>
      {/* NAVBAR LANGSING */}
      <header className="header-container glass" style={{ padding: '12px 16px', gap: '6px', borderRadius: '24px' }}>
        <div className="nav-brand" style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px' }}>
            <img src="/logo_sekolah (1).png" alt="Logo SMPN 1 Damai" style={{ margin: 0, height: '36px', width: 'auto' }} />
            <div className="title" style={{ whiteSpace: 'nowrap', fontSize: '1.1rem', margin: 0, fontWeight: '800' }}>SMPN 1 Damai</div>
            <button className="search-trigger" onClick={bukaSearch} style={{ margin: 0, padding: '6px 12px', fontSize: '0.85rem', height: '36px' }}>
                <i className="fa-solid fa-magnifying-glass"></i> <span>Cari</span>
            </button>
        </div>
        <div className="nav-wrapper" style={{ marginTop: '2px' }}>
            <button className="nav-arrow left" style={{ display: showLeftArrow ? 'flex' : 'none' }} onClick={() => scrollNav(-100)}><i className="fa-solid fa-chevron-left"></i></button>
            <nav>
                <ul ref={navListRef} style={{ gap: '16px', display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
                    <li><a href="#beranda" style={{ padding: '4px 0', fontSize: '0.9rem' }}>Beranda</a></li>
                    <li><a href="#profil" style={{ padding: '4px 0', fontSize: '0.9rem' }}>Profil</a></li>
                    <li><a href="#visimisi" style={{ padding: '4px 0', fontSize: '0.9rem' }}>Visi & Misi</a></li>
                    <li><a href="#struktur" style={{ padding: '4px 0', fontSize: '0.9rem' }}>Struktur</a></li>
                    <li><a href="#layanan" style={{ padding: '4px 0', fontSize: '0.9rem' }}>Web Lainnya</a></li>
                    <li><a href="#kontak" style={{ padding: '4px 0', fontSize: '0.9rem' }}>Kontak</a></li>
                </ul>
            </nav>
            <button className="nav-arrow right" style={{ display: showRightArrow ? 'flex' : 'none' }} onClick={() => scrollNav(100)}><i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </header>

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="search-modal">
            <div className="search-header-box">
                <input type="text" className="search-input" placeholder="Ketik yang ingin Anda cari..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                <button className="close-search" onClick={tutupSearch}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="search-results">
                {query.length > 1 && hasilCari.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>Pencarian tidak ditemukan.</div>
                )}
                {hasilCari.map((item, index) => (
                    <div key={index} className="result-item" onClick={() => klikHasil(item)}>
                        <span className="result-type">{item.tipe}</span>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{item.judul}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.konten}</p>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="hero">
        <h1>Selamat Datang di<br />SMP Negeri 1 Damai</h1>
        <p>{settings?.profil || 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.'}</p>
      </div>

      <div className="container">
        {/* 🔥 LOGIC BACA FOTO PERTAMA DARI ARRAY */}
        <section id="beranda" className="section-card glass">
          <h2 className="section-title">Berita & Informasi Terbaru</h2>
          <div className="news-grid">
            {berita.map((item) => (
              <div key={item.filename} className="news-card">
                <img 
                  src={item.images && item.images.length > 0 ? item.images[0] : item.thumb} 
                  alt={item.title} 
                  className="news-img" 
                  loading="lazy" 
                />
                <div className="news-content">
                  <div className="news-date">{item.tanggalCantik}</div>
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-snippet">{item.snippetBersih}</p>
                  <button className="btn-baca" onClick={() => bukaModal(item)}>Baca Selengkapnya</button>
                </div>
              </div>
            ))}
            {berita.length === 0 && <p style={{textAlign:'center', gridColumn:'1/-1'}}>Belum ada berita.</p>}
          </div>
        </section>

        <section id="profil" className="section-card glass">
          <h2 className="section-title">Profil Sekolah</h2>
          <p>Sejarah dan profil lengkap SMP Negeri 1 Damai sedang dalam proses pembaruan. Kami akan segera menampilkan informasi detail mengenai perjalanan dan pencapaian sekolah kami.</p>
        </section>

        <section id="visimisi" className="section-card glass">
          <h2 className="section-title">Visi & Misi</h2>
          <p><strong>Visi:</strong> {settings?.visi || 'Mewujudkan peserta didik yang beriman, cerdas, terampil, dan berwawasan lingkungan.'}</p>
          <div style={{ marginTop: '15px' }}>
            <strong>Misi:</strong>
            <div style={{ marginTop: '8px' }}>
              {settings?.misi ? settings.misi.split('\n').map((baris, i) => {
                const match = baris.match(/^(\d+\.)\s+(.*)/);
                if (match) return (<div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}><span style={{ minWidth: '18px', fontWeight: 'bold' }}>{match[1]}</span><span>{match[2]}</span></div>);
                return (<div key={i} style={{ marginBottom: '6px' }}>{baris}</div>);
              }) : '(Detail misi akan segera diperbarui)'}
            </div>
          </div>
        </section>

        <section id="struktur" className="section-card glass">
          <h2 className="section-title">Struktur Organisasi</h2>
          <p>Bagan struktur organisasi Kepala Sekolah, Dewan Guru, dan Staf Tata Usaha SMPN 1 Damai akan ditampilkan pada sesi ini.</p>
        </section>

        <section id="layanan" className="section-card glass">
          <h2 className="section-title">Web Lainnya</h2>
          <div className="layanan-grid">
            <a href="https://perpus.smpn1damai.web.id" className="layanan-card perpus"><i className="fa-solid fa-book-open-reader"></i><h3>Perpus Semangat Pagi</h3><p>Perpustakaan digital dan e-katalog pintar.</p></a>
            <a href="https://exambro.smpn1damai.web.id" className="layanan-card exambro"><i className="fa-solid fa-shield-halved"></i><h3>ExamBro</h3><p>Aplikasi ujian resmi anti kecurangan (Android).</p></a>
          </div>
        </section>

        {/* 🔥 KONTAK SOSMED (YouTube dipaksa muncul) */}
        <section id="kontak" className="section-card glass" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title">Hubungi Kami</h2>
          <div className="kontak-wrapper">
            <div className="kontak-item">
              <i className="fa-solid fa-location-dot"></i><p>Alamat</p>
              <a href="https://maps.app.goo.gl/AwZjhDuKuMgAdm3C8?g_st=ac" target="_blank" rel="noopener noreferrer">{settings?.alamat || 'Jl. Temenggung Gamas'}</a>
            </div>
            <div className="kontak-item">
              <i className="fa-solid fa-envelope"></i><p>Email</p>
              <a href={`mailto:${settings?.email || 'smpn1damai@gmail.com'}`}>{settings?.email || 'smpn1damai@gmail.com'}</a>
            </div>
            <div className="kontak-item">
              <i className="fa-brands fa-instagram"></i><p>Instagram</p>
              <a href={`https://instagram.com/${settings?.ig || 'smpn1damai'}`} target="_blank" rel="noopener noreferrer">@{settings?.ig || 'smpn1damai'}</a>
            </div>
            <div className="kontak-item">
              <i className="fa-brands fa-facebook" style={{color:'#3b82f6'}}></i><p>Facebook</p>
              <a href={settings?.fb || '#'} target="_blank" rel="noopener noreferrer">Kunjungi Halaman</a>
            </div>
            <div className="kontak-item">
              <i className="fa-brands fa-youtube" style={{color:'#ef4444'}}></i><p>YouTube</p>
              <a href={settings?.yt || 'https://youtube.com/@smpnegeri1damai-lq2lr'} target="_blank" rel="noopener noreferrer">SMP Negeri 1 Damai</a>
            </div>
          </div>
        </section>
      </div>

      <footer>© 2026 | Admin Web : Nur Alfi Syahri, S.P.</footer>

      {activeModal && (
        <div id="modal-berita-next" onClick={tutupModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="close-btn" onClick={tutupModal}>×</div>
            <img 
              src={activeModal.images && activeModal.images.length > 0 ? activeModal.images[0] : activeModal.thumb} 
              alt={activeModal.title} 
              className="modal-img" 
            />
            <div className="modal-body">
              <h2>{activeModal.title}</h2>
              <div className="meta" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>{activeModal.tanggalCantik} | Oleh: {activeModal.author}</span>
                <button onClick={bagikanBerita} style={{background:'#10b981', color:'white', border:'none', padding:'8px 15px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer'}}><i className="fa-solid fa-share-nodes"></i> Bagikan</button>
              </div>
              <div className="text-content" dangerouslySetInnerHTML={{ __html: activeModal.body.replace(/\/content\/gambar\//g, 'https://raw.githubusercontent.com/perpussemangatpagi/smpn1damai-nextjs/main/content/gambar/').replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="width: 100%; border-radius: 12px; margin: 15px 0; display: block;" />').replace(/\n/g, '<br>') }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
