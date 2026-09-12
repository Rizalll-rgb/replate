# Aturan Deployment Otomatis ke Vercel

Setiap kali pengguna meminta implementasi, perbaikan, atau perubahan kode:
1. Pastikan seluruh perubahan divalidasi dan lolos pengecekan tipe / build (`npx tsc --noEmit`).
2. **Wajib langsung melakukan commit dan push ke branch `main` (`git add ... ; git commit -m ... ; git pull --rebase origin main ; git push origin main`)**.
3. Repositori terhubung langsung dengan proyek Vercel (`replate`), sehingga setiap push ke `main` akan otomatis memicu build dan deploy ke environment Vercel.
4. Berikan konfirmasi commit hash dan status push kepada pengguna setelah proses selesai.
