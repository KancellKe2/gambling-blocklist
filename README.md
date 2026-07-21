# Gambling Website Blocklist Generator

Cloudflare Worker yang menghasilkan daftar blokir untuk website judi (gambling) menggunakan AdGuard.

## Fitur

- 🔍 Pencarian otomatis website judi menggunakan berbagai keyword
- ✅ Validasi otomatis apakah website benar-benar situs judi
- 📋 Menghasilkan blocklist dalam format AdGuard/AdBlock
- ⏰ Dapat dijadwalkan untuk scan otomatis setiap 24 jam
- 🌐 Mendukung multiple search engines (Google, Bing)

## Cara Penggunaan

### 1. Deploy ke Cloudflare Workers

```bash
# Install dependencies
npm install

# Login ke Cloudflare
npx wrangler login

# Buat KV Namespace
npx wrangler kv namespace create BLOCKLIST_KV

# Update ID di wrangler.toml
# Deploy worker
npx wrangler deploy
```

### 2. Akses Blocklist

Setelah deploy, Anda dapat mengakses blocklist di:

- **Blocklist URL**: `https://your-worker-name.your-subdomain.workers.dev/blocklist`
- **Status**: `https://your-worker-name.your-subdomain.workers.dev/status`
- **Manual Scan**: `https://your-worker-name.your-subdomain.workers.dev/scan`

### 3. Gunakan di AdGuard

#### Cara 1: Hosts File
Download blocklist dan tambahkan ke hosts file router Anda.

#### Cara 2: AdGuard DNS
Tambahkan URL blocklist ke konfigurasi AdGuard DNS:

1. Buka AdGuard DNS Dashboard
2. Pergi ke Settings > Blocklist
3. Tambahkan URL blocklist Anda

#### Cara 3: AdGuard Home
Jika menggunakan AdGuard Home:

1. Buka AdGuard Home Dashboard
2. Pergi ke Filters > DNS Blocklists
3. Tambahkan URL blocklist

## Konfigurasi

### API Keys (Opsional)

Untuk hasil yang lebih baik, Anda dapat menambahkan API keys:

```toml
[vars]
GOOGLE_API_KEY = "your-google-api-key"
GOOGLE_CX = "your-google-custom-search-engine-id"
BING_API_KEY = "your-bing-api-key"
```

### Keyword Pencarian

Anda dapat menambahkan keyword pencarian di file `worker.js`:

```javascript
SEARCH_KEYWORDS: [
  'judi online',
  'slot online',
  'casino online',
  // tambahkan keyword lainnya
]
```

## Endpoint

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/` | GET | Informasi worker |
| `/blocklist` | GET | Download blocklist |
| `/status` | GET | Status scan terakhir |
| `/scan` | GET | Trigger scan manual |

## Schedule

Worker akan otomatis menjalankan scan setiap 24 jam pada jam 00:00 UTC.

## Troubleshooting

### Error: KV Namespace not found
Pastikan Anda sudah membuat KV namespace dan mengupdate ID di `wrangler.toml`.

### Tidak ada hasil
1. Pastikan worker berjalan dengan benarnpm run dev
2. Cek log di Cloudflare Dashboard
3. Trigger scan manual melalui endpoint `/scan`

## License

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

## Kontribusi

Silakan buka issue atau pull request untuk kontribusi.