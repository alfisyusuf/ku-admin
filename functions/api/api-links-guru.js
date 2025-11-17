/*
 * File: /functions/api/api-links-guru.js
 * API ini mengelola SEMUA operasi untuk database 'links_guru'.
 */

// Menangani permintaan GET (Saat admin membuka halaman)
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const stmt = env.EXAM_DB.prepare('SELECT * FROM links_guru ORDER BY "order" ASC');
    const { results } = await stmt.all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// Menangani permintaan POST (Untuk Create, Update, Delete, Reorder)
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();

    switch (data.action) {
      
      // --- KASUS 1: BUAT LINK BARU ---
      case 'create': {
        if (!data.text || !data.url) throw new Error('Text dan URL dibutuhkan');
        
        // Dapatkan 'order' tertinggi + 1
        const orderQuery = await env.EXAM_DB.prepare('SELECT MAX("order") as maxOrder FROM links_guru').first();
        const newOrder = (orderQuery.maxOrder || 0) + 1;
        
        const stmt = env.EXAM_DB.prepare('INSERT INTO links_guru (text, url, "order") VALUES (?, ?, ?)');
        await stmt.bind(data.text, data.url, newOrder).run();
        
        return new Response(JSON.stringify({ success: true }), { status: 201 });
      }

      // --- KASUS 2: UPDATE LINK ---
      case 'update': {
        if (!data.id || !data.text || !data.url) throw new Error('ID, Text, dan URL dibutuhkan');
        
        const stmt = env.EXAM_DB.prepare('UPDATE links_guru SET text = ?, url = ? WHERE id = ?');
        await stmt.bind(data.text, data.url, data.id).run();
        
        return new Response(JSON.stringify({ success: true }));
      }
      
      // --- KASUS 3: HAPUS LINK ---
      case 'delete': {
        if (!data.id) throw new Error('ID dibutuhkan');
        
        const stmt = env.EXAM_DB.prepare('DELETE FROM links_guru WHERE id = ?');
        await stmt.bind(data.id).run();
        
        return new Response(JSON.stringify({ success: true }));
      }
      
      // --- KASUS 4: ATUR ULANG URUTAN (Drag & Drop) ---
      case 'reorder': {
        if (!data.idArray || !Array.isArray(data.idArray)) throw new Error('Array ID dibutuhkan');
        
        // Ini adalah cara D1 menangani banyak query sekaligus (Batch)
        const stmts = data.idArray.map((id, index) => {
          const newOrder = index + 1;
          return env.EXAM_DB.prepare('UPDATE links_guru SET "order" = ? WHERE id = ?').bind(newOrder, id);
        });
        
        await env.EXAM_DB.batch(stmts);
        
        return new Response(JSON.stringify({ success: true }));
      }
        
      default:
        return new Response(JSON.stringify({ error: 'Aksi tidak valid' }), { status: 400 });
    }
    
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}