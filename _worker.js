/*
 * File: /_worker.js
 * Ini adalah 'Mesin' Cron (Penjadwalan) Anda.
 * File ini akan dijalankan oleh Cloudflare sesuai jadwal.
 */

export default {
  // Fungsi 'scheduled' inilah yang akan dipanggil oleh Cron Trigger
  async scheduled(controller, env, ctx) {
    
    // env.EXAM_KV tersedia karena sudah kita 'bind' di pengaturan
    
    // 1. Cek Saklar Utama (SYSTEM_STATUS)
    const status = await env.EXAM_KV.get('SYSTEM_STATUS');
    
    // 2. Cek Saklar Mode (TOKEN_MODE)
    const mode = await env.EXAM_KV.get('TOKEN_MODE');
    
    // 3. Ambil keputusan
    if (status === 'active' && mode === 'auto') {
      // HANYA JIKA sistem AKTIF dan mode OTOMATIS...
      // ...buat token baru.
      const newToken = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Simpan token baru ke KV
      await env.EXAM_KV.put('CURRENT_TOKEN', newToken);
      
      // (Untuk debugging Anda nanti, ini akan muncul di log)
      console.log(`CRON: Token diperbarui otomatis ke: ${newToken}`);
      
    } else {
      // Jika sistem tidak aktif atau mode manual, jangan lakukan apa-apa.
      console.log('CRON: Sistem non-aktif atau mode manual. Tidak ada token dibuat.');
    }
  },
};