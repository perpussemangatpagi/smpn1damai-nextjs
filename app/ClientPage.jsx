'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ClientPage({ berita, settings }) {
  const [activeModal, setActiveModal] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
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

  // 🔥 FITUR SHARE BAWAAN HP
  const bagikanBerita = async () => {
    const urlBerita = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: activeModal.title, text: 'Baca berita terbaru dari SMPN 1 Damai!', url: urlBerita }); } 
      catch (err) { console.log('Batal share'); }
    } else {
      navigator.clipboard.writeText(urlBerita); alert('Link berita berhasil disalin!');
    }
  };

  return (
    <>
      <header className="header-container glass">
        <div className="nav-brand"><img src="/logo_sekolah (1).png" alt="Logo SMPN 1 Damai" /><div className="title">SMP Negeri 1 Damai</div></div>
        <div className="nav-wrapper">
            <button className="nav-arrow left" style={{ display: showLeftArrow ? 'flex' : 'none' }} onClick={() => scrollNav(-100)}><i className="fa-solid fa-chevron-left"></i></button>
            <nav>
                <ul ref={navListRef}>
                    <li><a href="#beranda">Beranda</a></li><li><a href="#profil">Profil</a></li><li><a href="#visimisi">Visi & Misi</a></li><li><a href="#struktur">Struktur</a></li><li><a href="#layanan">Web Lainnya</a></li><li><a href="#kontak">Kontak</a></li>
                </ul>
            </nav>
            <button className="nav-arrow right" style={{ display: showRightArrow ? 'flex' : 'none' }} onClick={() => scrollNav(100)}><i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </header>

      <div className="hero">
        <h1>Selamat Datang di<br />SMP Negeri 1 Damai</h1>
        <p>{settings?.profil || 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.'}</p>
      </div>

      <div className="container">
        <section id="beranda" className="section-card glass">
          <h2 className="section-title">Berita & Informasi Terbaru</h2>
          <div className="news-grid">
            {berita.map((item) => (
              <div key={item.filename} className="news-card">
                <img src={item.thumb} alt={item.title} className="news-img" loading="lazy" />
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
            <a href="https://perpus.smpn1damai.web.id" className="layanan-card perpus"><i className="fa-solid fa-book-open-reader"></i><h3>Perpus Semangat Pagi</h3><p>Perpustakaan digital dan e-katalog.</p></a>
            <a href="https://exambro.smpn1damai.web.id" className="layanan-card exambro"><i className="fa-solid fa-shield-halved"></i><h3>ExamBro</h3><p>Aplikasi ujian resmi anti kecurangan (Android).</p></a>
          </div>
        </section>

                {/* 🔥 KARTU KONTAK (Update Maps, IG, FB, YT) */}
        <section id="kontak" className="section-card glass" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title">Hubungi Kami</h2>
          <div className="kontak-wrapper">
            <div className="kontak-item">
              <i className="fa-solid fa-location-dot"></i><p>Alamat</p>
              {/* Link otomatis nembak ke koordinat akurat */}
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
            {settings?.fb && (
              <div className="kontak-item">
                <i className="fa-brands fa-facebook" style={{color:'#3b82f6'}}></i><p>Facebook</p>
                <a href={settings.fb} target="_blank" rel="noopener noreferrer">Kunjungi Halaman</a>
              </div>
            )}
            {settings?.yt && (
              <div className="kontak-item">
                <i className="fa-brands fa-youtube" style={{color:'#ef4444'}}></i><p>YouTube</p>
                {/* Teks YouTube diganti jadi nama sekolah */}
                <a href={settings.yt} target="_blank" rel="noopener noreferrer">SMP Negeri 1 Damai</a>
              </div>
            )}
          </div>
        </section>

      <footer>&copy; 2026 | Admin Web : Nur Alfi Syahri, S.P.</footer>

      {activeModal && (
        <div id="modal-berita-next" onClick={tutupModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="close-btn" onClick={tutupModal}>&times;</div>
            <img src={activeModal.thumb} alt={activeModal.title} className="modal-img" />
            <div className="modal-body">
              <h2>{activeModal.title}</h2>
              <div className="meta" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>{activeModal.tanggalCantik} | Oleh: {activeModal.author}</span>
                {/* 🔥 TOMBOL SHARE DI DALAM BERITA */}
                <button onClick={bagikanBerita} style={{background:'#10b981', color:'white', border:'none', padding:'8px 15px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer'}}><i className="fa-solid fa-share-nodes"></i> Bagikan</button>
              </div>
              <div className="text-content" dangerouslySetInnerHTML={{ __html: activeModal.body.replace(/\n/g, '<br>') }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
