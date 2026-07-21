# Panduan Setup Gambling Blocklist Worker

## Langkah 1: Install Dependencies

```bash
# Clone repository
git clone https://github.com/KancellKe2/gambling-blocklist.git
cd gambling-blocklist

# Install dependencies
npm install
```

## Langkah 2: Login ke Cloudflare

```bash
# Login ke Cloudflare
npx wrangler login
```

## Langkah 3: Buat KV Namespace

```bash
# Buat KV Namespace untuk menyimpan blocklist
npx wrangler kv namespace create BLOCKLIST_KV

# Catat ID yang ditampilkan, contoh:
# id = "abc123def456..."
```

## Langkah 4: Update Konfigurasi

Edit file `wrangler.toml` dan ganti `YOUR_KV_NAMESPACE_ID` dengan ID yang didapat:

```toml
[[kv_namespaces]]
binding = "BLOCKLIST_KV"
id = "abc123def456..."  # Ganti dengan ID Anda
```

## Langkah 5: Deploy Worker

```bash
# Deploy worker ke Cloudflare
npx wrangler deploy
```

## Langkah 6: Verifikasi

### Cek Worker
```bash
# Lihat status worker
npx wrangler status
```

### Test Endpoints
```bash
# Akses worker
curl https://gambling-blocklist-worker.your-subdomain.workers.dev/

# Cek status
curl https://gambling-blocklist-worker.your-subdomain.workers.dev/status

# Trigger scan manual
curl https://gambling-blocklist-worker.your-subdomain.workers.dev/scan

# Download blocklist
curl https://gambling-blocklist-worker.your-subdomain.workers.dev/blocklist
```

## Langkah 7: Gunakan di AdGuard

### Opsi 1: AdGuard Home
1. Buka AdGuard Home Dashboard
2. Pergi ke Filters > DNS Blocklists
3. Klik "Add Blocklist"
4. Pilih "Add a custom blocklist"
5. Masukkan URL blocklist:
   ```
   https://gambling-blocklist-worker.your-subdomain.workers.dev/blocklist
   ```
6. Klik "Save"

### Opsi 2: AdGuard DNS
1. Login ke AdGuard DNS Dashboard
2. Pergi ke Settings > Blocklists
3. Klik "Add Blocklist"
4. Pilih "Custom"
5. Masukkan URL blocklist
6. Simpan

### Opsi 3: Hosts File (Router)
1. Download blocklist:
   ```bash
   curl https://gambling-blocklist-worker.your-subdomain.workers.dev/blocklist > gambling-blocklist.txt
   ```
2. Edit hosts file di router Anda
3. Tambahkan isi blocklist

## Langkah 8: Setup API Keys (Opsional)

Untuk hasil yang lebih baik, tambahkan API keys:

### Google Custom Search API
1. Buka Google Cloud Console
2. Buat project baru
3. Enable Custom Search API
4. Buat API key
5. Buat Custom Search Engine di https://cse.google.com/
6. Tambahkan di `wrangler.toml`:
   ```toml
   [vars]
   GOOGLE_API_KEY = "your-google-api-key"
   GOOGLE_CX = "your-custom-search-engine-id"
   ```

### Bing Search API
1. Buka Azure Portal
2. Buat Cognitive Services resource
3. Dapatkan API key
4. Tambahkan di `wrangler.toml`:
   ```toml
   [vars]
   BING_API_KEY = "your-bing-api-key"
   ```

## Langkah 9: Setup Scheduled Scans

Worker sudah dikonfigurasi untuk menjalankan scan setiap 24 jam. Untuk mengubah jadwal:

Edit `wrangler.toml`:
```toml
[triggers]
# Scan setiap hari jam 00:00 UTC
crons = ["0 0 * * *"]

# Atau scan setiap 6 jam
# crons = ["0 */6 * * *"]
```

## Troubleshooting

### Error: "KV Namespace not found"
- Pastikan ID KV namespace benar di `wrangler.toml`
- Jalankan: `npx wrangler kv namespace list`

### Error: "Worker not found"
- Pastikan sudah deploy: `npx wrangler deploy`
- Cek nama worker di Cloudflare Dashboard

### Blocklist kosong
- Trigger scan manual: `curl https://your-worker.workers.dev/scan`
- Cek log di Cloudflare Dashboard > Workers > gambling-blocklist-worker > Logs

### Rate limiting
- Jika terkena rate limiting dari search engine, tambahkan delay
- Atau gunakan API keys untuk menghindari rate limiting

## Monitoring

### Cek Statistik
```bash
curl https://your-worker.workers.dev/status
```

### Cek Logs
```bash
npx wrangler tail
```

## Update Worker

```bash
# Pull perubahan terbaru
git pull origin master

# Deploy ulang
npx wrangler deploy
```

## Backup Blocklist

```bash
# Download blocklist
curl https://your-worker.workers.dev/blocklist > backup-$(date +%Y%m%d).txt
```

## Contact

Untuk pertanyaan atau masalah, buka issue di:
https://github.com/KancellKe2/gambling-blocklist/issues