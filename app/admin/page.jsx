'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState({ tipe: '', teks: '' });

  const [formOpen, setFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [oldFilename, setOldFilename] = useState('');
  const [title, setTitle] = useState('');
  const [thumb, setThumb] = useState(''); // Textarea untuk banyak link
  const [body, setBody] = useState('');

  const fetchBerita = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/perpussemangatpagi/smpn1damai-nextjs/contents/content/berita');
      if (res.ok) {
        const files = await res.json();
        const dataBerita = await Promise.all(
          files.filter(f => f.name.endsWith('.json')).map(async (f) => {
            const detail = await fetch(f.download_url);
            return detail.json();
          })
        );
        setBeritaList(dataBerita);
      }
    } catch (e) { console.error("Gagal load"); }
  };

  useEffect(() => { fetchBerita(); }, []);

  const showPesan = (tipe, teks) => {
    setPesan({ tipe, teks });
    setTimeout(() => setPesan({ tipe: '', teks: '' }), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
      showPesan('sukses', 'Login Berhasil! Selamat bekerja Mandor.');
    } else {
      showPesan('error', 'Masukkan Username & Password!');
    }
  };

  const handleBatal = () => {
    setFormOpen(false); setIsEdit(false); setOldFilename(''); setTitle(''); setThumb(''); setBody('');
    showPesan('sukses', 'Aksi dibatalkan.');
  };

  const handleBukaTambah = () => {
    setIsEdit(false); setTitle(''); setThumb(''); setBody(''); setFormOpen(true);
  };

  const handleBukaEdit = (b) => {
    setIsEdit(true); setOldFilename(b.filename); setTitle(b.title);
    setThumb(b.images ? b.images.join(', ') : b.thumb); 
    setBody(b.body); setFormOpen(true);
  };

  const handleSimpanBerita = async (e) => {
    e.preventDefault();
    setLoading(true);
    const imageArray = thumb ? thumb.split(',').map(url => url.trim()).filter(url => url !== '') : [];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const filename = isEdit ? oldFilename : `${new Date().toISOString().split('T')[0]}-${slug}`;

    try {
      const res = await fetch('/api/admin/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, filename, title, thumbStr: thumb, images: imageArray, body, isEdit })
      });
      const hasil = await res.json();
      if (res.ok) { showPesan('sukses', hasil.message); setFormOpen(false); fetchBerita(); } 
      else { showPesan('error', hasil.error); }
    } catch (err) { showPesan('error', 'Koneksi error!'); } finally { setLoading(false); }
  };

  const handleHapusBerita = async (filename, judul) => {
    if (!confirm(`Hapus "${judul}"?`)) return;
    setLoading(true);
    try {
        const res = await fetch('/api/admin/berita', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, filename: `${filename}.json` })
        });
        const hasil = await res.json();
        if (res.ok) { showPesan('sukses', 'Berhasil dihapus'); fetchBerita(); }
        else { showPesan('error', hasil.error); }
    } catch (err) { showPesan('error', 'Gagal'); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: 'linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 100%)', minHeight: '100vh', color: '#1e293b' }}>
      {pesan.teks && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', left: '20px', padding: '15px', borderRadius: '15px', color: 'white', fontWeight: 'bold', textAlign: 'center', zIndex: 10000, background: pesan.tipe === 'sukses' ? '#10b981' : '#ef4444', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          {pesan.teks}
        </div>
      )}

      {!isLoggedIn ? (
        <div style={{ maxWidth: '400px', margin: '10vh auto', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
          <img src="/logo_sekolah (1).png" alt="Logo" style={{ height: '70px', marginBottom: '15px' }} />
          <h2 style={{ margin: '0 0 10px 0' }}>CMS SMPN 1 Damai</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Silakan masuk menggunakan kredensial Vercel.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Username Admin" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} required />
            <input type="password" placeholder="Password Admin" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} required />
            <button type="submit" style={{ padding: '14px', borderRadius: '14px', background: '#0ea5e9', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>Masuk Dashboard 🚀</button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'rgba(255,255,255,0.5)', padding: '15px 20px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Ruang Kerja Berita</h1>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Mode Admin Aktif</span>
            </div>
            {!formOpen && (
              <button onClick={handleBukaTambah} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>+ Tulis Berita</button>
            )}
          </div>

          {formOpen && (
            <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#0ea5e9' }}>{isEdit ? '📝 Edit Berita Sekolah' : '📣 Tulis Berita Baru'}</h2>
              <form onSubmit={handleSimpanBerita} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Judul Berita</label>
                  <input type="text" placeholder="Contoh: Siswa SMPN 1 Damai Juara Coding..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem' }} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Daftar URL Foto (Pisahkan dengan koma ,)</label>
                  <textarea placeholder="Contoh: https://foto1.jpg, https://foto2.jpg" value={thumb} onChange={(e) => setThumb(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', height: '80px', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Isi Konten Berita</label>
                  <textarea placeholder="Tuliskan berita lengkap di sini..." rows="8" value={body} onChange={(e) => setBody(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'vertical' }} required></textarea>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Sedang Memproses...' : 'Simpan ke Web Resmi 🚀'}
                  </button>
                  <button type="button" onClick={handleBatal} style={{ padding: '14px 25px', borderRadius: '14px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {!formOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ margin: '10px 0 5px 0' }}>Berita yang sudah Mengudara ({beritaList.length})</h3>
              {beritaList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px' }}>Sedang mengambil gudang berita...</div>
              ) : (
                beritaList.map((b) => (
                  <div key={b.filename} style={{ background: 'white', padding: '15px', borderRadius: '20px', display: 'flex', gap: '15px', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}>
                    <img src={b.thumb} alt="Thumb" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '12px', background: '#f1f5f9' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 'bold' }}>{b.tanggalCantik} | Oleh: {b.author}</span>
                      <h4 style={{ margin: '4px 0', fontSize: '1rem' }}>{b.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.snippetBersih}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <button onClick={() => handleBukaEdit(b)} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleHapusBerita(b.filename, b.title)} style={{ background: '#fee2e2', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#ef4444', fontSize: '0.8rem' }}>Hapus</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
