'use client';
import { useState } from 'react';
import { saveNews, deleteNews } from '../actions/adminActions'; // Server Action nanti

export default function AdminDashboard({ semuaBerita }) {
  const [editing, setEditing] = useState(null); // Null berarti tambah baru, isi = edit
  
  const handleCancel = () => setEditing(null);

  return (
    <div className="p-4">
      <h1>Dashboard Admin</h1>
      {/* List Berita */}
      {semuaBerita.map(b => (
        <div key={b.filename} className="border p-2 mb-2">
          <h3>{b.title}</h3>
          <button onClick={() => setEditing(b)}>Edit</button>
          <button onClick={() => deleteNews(b.filename)}>Hapus</button>
        </div>
      ))}

      {/* Form Tambah/Edit */}
      {editing ? (
        <form action={saveNews}>
          <input name="filename" type="hidden" value={editing.filename} />
          <input name="title" defaultValue={editing.title} required />
          <textarea name="body" defaultValue={editing.body} />
          <button type="submit">Simpan</button>
          {/* 🔥 Tombol Batal sakti */}
          <button type="button" onClick={handleCancel}>Batal</button>
        </form>
      ) : (
        <button onClick={() => setEditing({title: '', body: ''})}>Tambah Berita Baru</button>
      )}
    </div>
  );
}

