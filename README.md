# Case Study: Containerizing & Deploying Multi-Container Web App (WSL2 Dev to Cloud VPS Production)

## Executive Summary
Proyek ini mendemonstrasikan proses migrasi dan pembentukan infrastruktur aplikasi modern menggunakan **Docker** dan **Docker Compose**. Proyek ini mentransformasi aplikasi monolitik/multi-service agar berjalan secara terisolasi dan konsisten, mulai dari lingkungan pengembangan lokal (**WSL2 Ubuntu**) hingga lingkungan produksi di **Cloud VPS**.

---

## Problem Statement
Sebelum menerapkan kontainerisasi:
1. **"It works on my machine" Syndrome**: Perbedaan versi runtime/dependency antara OS pengembang (Windows/WSL) dan server produksi (Linux VPS) sering menyebabkan error tak terduga saat pengujian dan pengesahan.
2. **Konfigurasi Lingkungan yang Rumpit**: Membutuhkan setup manual (Database, Web Server, Runtime) secara berulang di setiap server baru.
3. **Isolasi & Manajemen Resource**: Aplikasi dan database saling berebut resource OS host tanpa pembatasan yang jelas.

---

## The Solution
Menerapkan arsitektur berbasis kontainer memanfaatkan **Docker Engine** dan **Docker Compose** dengan alur kerja berikut:
* **Development (Lokal)**: Windows Subsystem for Linux (WSL2 - Ubuntu) + Docker Engine untuk pengembangan ringan dan seragam.
* **Orchestration**: Docker Compose untuk mengelola dependensi multi-container (App, Database, Reverse Proxy).
* **Production**: Cloud VPS (Ubuntu Linux) yang dilengkapi Reverse Proxy (Nginx) + SSL (Certbot) dan registri container (Docker Hub).

---

## System Architecture & Workflow

[ Local WSL2 Dev ]                 [ Remote Cloud VPS Prod ]
+------------------------+         +------------------------+
| - Docker Engine (WSL2) |  Push   | - Nginx (Reverse Proxy)|
| - Dockerfile           | ------> | - Docker Compose       |
| - Docker Compose Dev   | Docker  | - Isolated Containers  |
| - `.env.local`         | Hub     | - Managed Volumes/Net  |
+------------------------+         +------------------------+

---

## Key Technical Implementations

Berdasarkan implementasi konsep Docker Fundamental:

### 1. Multi-Stage Dockerfile Optimization
Membuat `Dockerfile` efisien dengan teknik *multi-stage build* untuk memangkas ukuran image hingga **>70%** dan meningkatkan keamanan produksi.
- Base image berbasis **Alpine Linux**.
- Pemisahan stage *build/compile* dan stage *runtime*.
- Penggunaan `.dockerignore` untuk mengecualikan file sensitif dan node_modules/vendor lokal.

### 2. Multi-Container Orchestration (Docker Compose)
Mengintegrasikan layanan aplikasi dengan database (MySQL/PostgreSQL) dan caching layer (Redis) dalam satu manifes `docker-compose.yml`:
- **Networking**: Membuat private bridge network khusus agar antar-kontainer saling berkomunikasi via Service Name tanpa mengekspos port database ke publik.
- **Data Persistence**: Mengkonfigurasi **Named Volume** untuk memastikan data database tetap aman (*persistent*) meskipun kontainer di-restart atau dihapus.
- **Environment Variables**: Memisahkan kredensial menggunakan file `.env`.

### 3. Production Deployment di Cloud VPS
- Deployment menggunakan SSH ke Cloud VPS.
- Penyiapan **Restart Policy** (`restart: always` / `unless-stopped`) agar kontainer otomatis menyala kembali jika server reboot.
- Penyiapan Nginx Reverse Proxy pada VPS untuk menangani SSL (HTTPS) dan mengarahkan *traffic* port 80/443 ke port kontainer.

---

## Key Results & Impact
*  **100% Consistency**: Menghilangkan inkonsistensi environment antara WSL2 dan Cloud VPS.
*  **Minimal Image Size**: Berhasil memangkas ukuran image dari ~800MB menjadi <150MB dengan *multi-stage build*.
*  **Deployment Speed**: Proses *deployment* dan *environment spin-up* baru memakan waktu kurang dari **2 menit** menggunakan `docker compose up -d`.

---

## Live Demo & Links
-  **Live Demo**: `https://app.namadomainanda.com` *(Atau IP VPS)*
-  **GitHub Repository**: `https://github.com/username/project-name`
