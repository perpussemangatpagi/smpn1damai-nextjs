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
  const [thumb, setThumb] = useState(''); // Sekarang buat nampung banyak link dipisah koma
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

  const handleBatal = () => {
    setFormOpen(false); setThumb(''); setTitle(''); setBody('');
  };

  const handleBukaTambah = () => {
    setIsEdit(false); setTitle(''); setThumb(''); setBody(''); setFormOpen(true);
  };

  const handleBukaEdit = (b) => {
    setIsEdit(true); setOldFilename(b.filename); setTitle(b.title);
    // Kalau sudah ada array images, gabungin lagi jadi string koma
    setThumb(b.images ? b.images.join(', ') : b.thumb); 
    setBody(b.body); setFormOpen(true);
  };

  const handleSimpanBerita = async (e) => {
    e.preventDefault();
    setLoading(true);
    // 🔥 Pecah string koma jadi array
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
        if (res.ok) { showPesan('sukses', 'Berhasil dihapus'); fetchBerita(); }
    } catch (err) { showPesan('error', 'Gagal'); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      {pesan.teks && <div style={{ position: 'fixed', top: '10px', left: '10px', right: '10px', padding: '10px', background: pesan.tipe === 'sukses' ? '#10b981' : '#ef4444', color: 'white', borderRadius: '10px', textAlign: 'center', zIndex: 999 }}>{pesan.teks}</div>}
      
      {!isLoggedIn ? (
        <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} style={{ maxWidth: '300px', margin: '50px auto' }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} required />
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#0ea5e9', color: 'white', border: 'none' }}>Masuk</button>
        </form>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={handleBukaTambah} style={{ marginBottom: '20px', padding: '10px 20px' }}>+ Berita Baru</button>
            {formOpen && (
                <form onSubmit={handleSimpanBerita} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'white', padding: '20px', borderRadius: '15px' }}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul" style={{ padding: '10px' }} required />
                    <textarea value={thumb} onChange={(e) => setThumb(e.target.value)} placeholder="URL Foto (Pisahkan koma ,)" style={{ padding: '10px', height: '60px' }}></textarea>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Isi Berita" style={{ padding: '10px', height: '150px' }} required></textarea>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '10px' }}>Simpan</button>
                        <button type="button" onClick={handleBatal} style={{ padding: '10px', background: '#ef4444', color: 'white' }}>Batal</button>
                    </div>
                </form>
            )}
            {beritaList.map(b => (
                <div key={b.filename} style={{ background: 'white', padding: '10px', borderRadius: '10px', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <img src={b.thumb} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>{b.title}</div>
                    <button onClick={() => handleBukaEdit(b)}>Edit</button>
                    <button onClick={() => handleHapusBerita(b.filename, b.title)}>X</button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
