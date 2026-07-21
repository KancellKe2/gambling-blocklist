# Gambling Website Blocklist Generator

Cloudflare Worker yang menghasilkan daftar blokir untuk website judi (gambling) menggunakan AdGuard.

## Fitur

- 🔍 Pencarian otomatis website judi menggunakan berbagai keyword
- ✅ Validasi otomatis menggunakan 5 metode berbeda
- 🤖 AI validation dengan API gratis (Hugging Face, OpenAI, Google NLP)
- 📋 Menghasilkan blocklist dalam format AdGuard/AdBlock
- ⏰ Dapat dijadwalkan untuk scan otomatis setiap 24 jam
- 🌐 Mendukung multiple search engines (Google, Bing)
- 🔒 Tidak memerlukan API berbayar untuk berfungsi

## Cara Penggunaan

### 1. Deploy ke Cloudflare Workers

#### Langkah 1: Clone Repository
```bash
# Clone repository
git clone https://github.com/KancellKe2/gambling-blocklist.git
cd gambling-blocklist

# Install dependencies
npm install
```

#### Langkah 2: Setup Cloudflare
```bash
# Login ke Cloudflare
npx wrangler login

# Buat KV Namespace untuk menyimpan blocklist
npx wrangler kv namespace create BLOCKLIST_KV

# Catat ID yang ditampilkan, contoh:
# id = "abc123def456..."
```

#### Langkah 3: Update Konfigurasi
Edit file `wrangler.toml` dan ganti `YOUR_KV_NAMESPACE_ID` dengan ID yang didapat:

```toml
[[kv_namespaces]]
binding = "BLOCKLIST_KV"
id = "abc123def456..."  # Ganti dengan ID Anda
```

#### Langkah 4: Deploy Worker
```bash
# Deploy worker ke Cloudflare
npx wrangler deploy

# Jika ingin deploy ke environment production
npx wrangler deploy --env production
```

#### Langkah 5: Verifikasi Deployment
```bash
# Cek status worker
npx wrangler status

# Test worker
curl https://gambling-blocklist-worker.your-subdomain.workers.dev/
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

#### API Pencarian (Opsional)
Untuk hasil pencarian yang lebih baik, Anda dapat menambahkan API keys:

```toml
[vars]
# Google Custom Search API (gratis 100 queries/hari)
GOOGLE_API_KEY = "your-google-api-key"
GOOGLE_CX = "your-google-custom-search-engine-id"

# Bing Search API (gratis 1000 queries/bulan)
BING_API_KEY = "your-bing-api-key"
```

#### API AI Gratis untuk Validasi (Opsional)
Untuk validasi yang lebih akurat menggunakan AI:

```toml
[vars]
# Hugging Face Inference API (gratis)
HUGGING_FACE_API_KEY = "your-hugging-face-api-key"

# OpenAI API (gratis $5 credit untuk baru)
OPENAI_API_KEY = "your-openai-api-key"

# Google Cloud Natural Language API (gratis 500 unit/bulan)
GOOGLE_NLP_API_KEY = "your-google-nlp-api-key"
```

### Cara Mendapatkan API Keys Gratis

#### 1. Hugging Face API (Rekomendasi - 100% Gratis)
1. Buka https://huggingface.co/join
2. Buat akun gratis
3. Buka https://huggingface.co/settings/tokens
4. Buat token baru
5. Gunakan model gratis seperti `facebook/bart-large-mnli` untuk klasifikasi

#### 2. OpenAI API (Gratis $5 Credit)
1. Buka https://platform.openai.com/signup
2. Buat akun
3. Dapatkan $5 credit gratis
4. Buka https://platform.openai.com/api-keys
5. Buat API key

#### 3. Google Cloud Natural Language API (Gratis 500 unit/bulan)
1. Buka https://console.cloud.google.com
2. Buat project baru
3. Enable Cloud Natural Language API
4. Buat API key di Credentials

#### 4. Google Custom Search API (Gratis 100 queries/hari)
1. Buka https://console.developers.google.com
2. Buat project baru
3. Enable Custom Search API
4. Buat API key
5. Buat Custom Search Engine di https://cse.google.com/

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
1. Pastikan worker berjalan dengan benar
2. Cek log di Cloudflare Dashboard
3. Trigger scan manual melalui endpoint `/scan`

### AI Validation tidak bekerja
1. Pastikan API key sudah benar di `wrangler.toml`
2. Cek batas kuota API (Hugging Face gratis, OpenAI $5 credit)
3. Worker akan tetap berfungsi tanpa AI validation (menggunakan metode fallback)

### Rate limiting
1. Jika terkena rate limiting, kurangi frekuensi scan
2. Gunakan API keys untuk menghindari rate limiting
3. Worker sudah memiliki built-in retry logic

## License

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

## Kontribusi

Silakan buka issue atau pull request untuk kontribusi.