'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ClientPage({ berita, settings }) {
  const [activeModal, setActiveModal] = useState(null);
  const navListRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Efek Otomatis deteksi kalau orang masuk lewat link share (?berita=...)
  useEffect(() => {
    const beritaParam = searchParams.get('berita');
    if (beritaParam) {
      const idx = berita.findIndex(b => b.filename === beritaParam);
      if (idx !== -1) setActiveModal(berita[idx]);
    }
  }, [searchParams, berita]);

  const bukaModal = (item) => {
    setActiveModal(item);
    router.push(`?berita=${item.filename}`, { scroll: false });
    document.body.style.overflow = 'hidden';
  };

  const tutupModal = () => {
    setActiveModal(null);
    router.push('/', { scroll: false });
    document.body.style.overflow = 'auto';
  };

  const scrollNav = (jarak) => {
    if (navListRef.current) {
      navListRef.current.scrollBy({ left: jarak, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* NAVBAR / HEADER */}
      <header className="header-container glass">
        <div class="nav-brand">
            <img src="/logo_sekolah (1).png" alt="Logo SMPN 1 Damai" />
            <div class="title">SMP Negeri 1 Damai</div>
        </div>
        <div class="nav-wrapper">
            <button class="nav-arrow left" style={{display: 'flex'}} onclick={() => scrollNav(-100)}><i class="fa-solid fa-chevron-left"></i></button>
            <nav>
                <ul ref={navListRef}>
                    <li><a href="#beranda">Beranda</a></li>
                    <li><a href="#profil">Profil</a></li>
                    <li><a href="#visimisi">Visi & Misi</a></li>
                    <li><a href="#struktur">Struktur</a></li>
                    <li><a href="#layanan">Web Lainnya</a></li>
                    <li><a href="#kontak">Kontak</a></li>
                </ul>
            </nav>
            <button class="nav-arrow right" style={{display: 'flex'}} onclick={() => scrollNav(100)}><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <h1>Selamat Datang di<br />SMP Negeri 1 Damai</h1>
        <p>{settings?.profil || 'Membentuk generasi unggul, beradab, dan melek teknologi untuk masa depan gemilang.'}</p>
      </div>

      <div className="container">
        {/* KARTU 1: BERITA */}
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

        {/* KARTU 2: PROFIL */}
        <section id="profil" className="section-card glass">
          <h2 className="section-title">Profil Sekolah</h2>
          <p>Sejarah dan profil lengkap SMP Negeri 1 Damai sedang dalam proses pembaruan. Kami akan segera menampilkan informasi detail mengenai perjalanan dan pencapaian sekolah kami.</p>
        </section>

        {/* KARTU 3: VISI MISI DARI DATABASE CMS */}
        <section id="visimisi" className="section-card glass">
          <h2 className="section-title">Visi & Misi</h2>
          <p><strong>Visi:</strong> {settings?.visi || 'Mewujudkan peserta didik yang beriman, cerdas, terampil, dan berwawasan lingkungan.'}</p>
          <p style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}><strong>Misi:</strong><br />{settings?.misi || '(Detail misi akan segera diperbarui)'}</p>
        </section>

        {/* KARTU 4: STRUKTUR */}
        <section id="struktur" className="section-card glass">
          <h2 className="section-title">Struktur Organisasi</h2>
          <p>Bagan struktur organisasi Kepala Sekolah, Dewan Guru, dan Staf Tata Usaha SMPN 1 Damai akan ditampilkan pada sesi ini.</p>
        </section>

        {/* KARTU 5: LAYANAN */}
        <section id="layanan" className="section-card glass">
          <h2 className="section-title">Web Lainnya</h2>
          <p style={{ marginBottom: '20px' }}>Beberapa Web lain dari SMP Negeri 1 Damai:</p>
          <div className="layanan-grid">
            <a href="https://perpus.smpn1damai.web.id" className="layanan-card perpus">
              <i className="fa-solid fa-book-open-reader"></i>
              <h3>Perpus Semangat Pagi</h3>
              <p>Perpustakaan digital dan e-katalog pintar.</p>
            </a>
            <a href="https://exambro.smpn1damai.web.id" className="layanan-card exambro">
              <i className="fa-solid fa-shield-halved"></i>
              <h3>ExamBro</h3>
              <p>Aplikasi ujian resmi anti kecurangan (Android).</p>
            </a>
          </div>
        </section>

        {/* KARTU 6: KONTAK */}
        <section id="kontak" className="section-card glass" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title">Hubungi Kami</h2>
          <div className="kontak-wrapper">
            <div className="kontak-item">
              <i className="fa-solid fa-location-dot"></i>
              <p>Alamat</p>
              <a href="#">{settings?.alamat || 'Jl. Temenggung Gamas'}</a>
            </div>
            <div className="kontak-item">
              <i className="fa-solid fa-envelope"></i>
              <p>Email</p>
              <a href={`mailto:${settings?.email || 'smpn1damai@gmail.com'}`}>{settings?.email || 'smpn1damai@gmail.com'}</a>
            </div>
            <div className="kontak-item">
              <i className="fa-brands fa-instagram"></i>
              <p>Instagram</p>
              <a href={`https://instagram.com/${settings?.ig || 'smpn1damai'}`} target="_blank">@{settings?.ig || 'smpn1damai'}</a>
            </div>
          </div>
        </section>
      </div>

      <footer>
        &copy; 2026 | Admin Web : Nur Alfi Syahri, S.P.
      </footer>

      {/* POP-UP MODAL BERITA SECARA REAL SSR */}
      {activeModal && (
        <div id="modal-berita-next" onClick={tutupModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="close-btn" onClick={tutupModal}>&times;</div>
            <img src={activeModal.thumb} alt={activeModal.title} className="modal-img" />
            <div className="modal-body">
              <h2>{activeModal.title}</h2>
              <div className="meta">{activeModal.tanggalCantik} | Oleh: {activeModal.author}</div>
              <div className="text-content" dangerouslySetInnerHTML={{ __html: activeModal.body.replace(/\n/g, '<br>') }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
