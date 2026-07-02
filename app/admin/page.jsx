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
  const [thumb, setThumb] = useState(''); // Nyimpen foto lama buat mode edit
  const [files, setFiles] = useState([]); // 🔥 State baru buat nampung file upload
  const [body, setBody] = useState('');

  const fetchBerita = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/perpussemangatpagi/smpn1damai-nextjs/contents/content/berita');
      if (res.ok) {
        const fileGithub = await res.json();
        const dataBerita = await Promise.all(
          fileGithub.filter(f => f.name.endsWith('.json')).map(async (f) => {
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
    if (username && password) { setIsLoggedIn(true); showPesan('sukses', 'Login Berhasil!'); } 
    else { showPesan('error', 'Masukkan Kredensial!'); }
  };

  const bersihkanForm = () => {
    setFormOpen(false); setIsEdit(false); setOldFilename(''); setTitle(''); setThumb(''); setBody(''); setFiles([]);
  };

  const handleBukaTambah = () => { bersihkanForm(); setFormOpen(true); };

  const handleBukaEdit = (b) => {
    bersihkanForm();
    setIsEdit(true); setOldFilename(b.filename); setTitle(b.title);
    setThumb(b.images ? b.images.join(', ') : b.thumb); 
    setBody(b.body); setFormOpen(true);
  };

  // 🔥 JURUS KOMPRESOR FOTO OTOMATIS DI HP MANDOR
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Ukuran standar web
          let scaleSize = MAX_WIDTH / img.width;
          if (scaleSize > 1) scaleSize = 1; // Jangan perbesar kalau fotonya udah kecil
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7); // Kualitas 70%
          resolve({ name: file.name, data: base64.split(',')[1] });
        };
      };
    });
  };

  const handleSimpanBerita = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Proses kompres semua foto yang dipilih
      const compressedFiles = await Promise.all(files.map(compressImage));
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const filename = isEdit ? oldFilename : `${new Date().toISOString().split('T')[0]}-${slug}`;

      const res = await fetch('/api/admin/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username, password, filename, title, body, isEdit, 
            newImages: compressedFiles, // Kirim foto yang udah dikompres
            oldThumb: thumb // Kirim foto lama buat jaga-jaga kalau gak upload foto baru
        })
      });
      const hasil = await res.json();
      if (res.ok) { showPesan('sukses', hasil.message); bersihkanForm(); fetchBerita(); } 
      else { showPesan('error', hasil.error); }
    } catch (err) { showPesan('error', 'Koneksi error!'); } finally { setLoading(false); }
  };

  const handleHapusBerita = async (filename, judul) => {
    if (!confirm(`Hapus "${judul}" permanen?`)) return;
    setLoading(true);
    try {
        const res = await fetch('/api/admin/berita', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, filename: `${filename}.json` })
        });
        if (res.ok) { showPesan('sukses', 'Berita dihapus'); fetchBerita(); }
    } catch (err) { showPesan('error', 'Gagal'); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: 'linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 100%)', minHeight: '100vh', color: '#1e293b' }}>
      {pesan.teks && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', left: '20px', padding: '15px', borderRadius: '15px', color: 'white', fontWeight: 'bold', textAlign: 'center', zIndex: 10000, background: pesan.tipe === 'sukses' ? '#10b981' : '#ef4444', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>{pesan.teks}</div>
      )}

      {!isLoggedIn ? (
        <div style={{ maxWidth: '400px', margin: '10vh auto', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
          <img src="/logo_sekolah (1).png" style={{ height: '70px', marginBottom: '15px' }} />
          <h2>CMS SMPN 1 Damai</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop:'20px' }}>
            <input type="text" placeholder="Username Admin" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '12px', borderRadius: '14px', border: '1px solid #cbd5e1' }} required />
            <input type="password" placeholder="Password Admin" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '14px', border: '1px solid #cbd5e1' }} required />
            <button type="submit" style={{ padding: '14px', borderRadius: '14px', background: '#0ea5e9', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Masuk Dashboard 🚀</button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'rgba(255,255,255,0.5)', padding: '15px 20px', borderRadius: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Ruang Kerja Berita</h1>
            {!formOpen && <button onClick={handleBukaTambah} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: 'bold' }}>+ Tulis Berita</button>}
          </div>

          {formOpen && (
            <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#0ea5e9' }}>{isEdit ? '📝 Edit Berita' : '📣 Tulis Berita Baru'}</h2>
              <form onSubmit={handleSimpanBerita} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Judul Berita</label>
                  <input type="text" placeholder="Contoh: Siswa Juara 1..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} required />
                </div>

                {/* 🔥 INI DIA TOMBOL UPLOAD ASLI DARI HP */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Upload Foto Berita (Bisa Pilih Banyak)</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                  {isEdit && <small style={{ color: '#ef4444', fontStyle: 'italic' }}>*Kosongkan jika tidak ingin mengubah foto yang sudah ada.</small>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Isi Konten Berita</label>
                  <textarea placeholder="Tuliskan berita lengkap di sini..." rows="8" value={body} onChange={(e) => setBody(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', resize: 'vertical' }} required></textarea>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold' }}>{loading ? 'Mengunggah & Menyimpan...' : 'Simpan ke Web 🚀'}</button>
                  <button type="button" onClick={bersihkanForm} style={{ padding: '14px 25px', borderRadius: '14px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold' }}>Batal</button>
                </div>
              </form>
            </div>
          )}

          {!formOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {beritaList.map((b) => (
                <div key={b.filename} style={{ background: 'white', padding: '15px', borderRadius: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <img src={b.thumb} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '12px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0' }}>{b.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{b.tanggalCantik}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button onClick={() => handleBukaEdit(b)} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold' }}>Edit</button>
                    <button onClick={() => handleHapusBerita(b.filename, b.title)} style={{ background: '#fee2e2', border: 'none', padding: '6px 12px', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold' }}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
