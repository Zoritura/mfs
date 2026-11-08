# MFS - Moonbase Arcade: Moon Runner

**Moon Runner** è un moderno web game in modalità *endless runner* a tema spaziale, sviluppato come parte della piattaforma **Moonbase Arcade**. I giocatori controllano un piccolo esploratore robotico che deve saltare le rocce lunari e percorrere la maggior distanza possibile sulla polvere della Luna.

La versione live del gioco è accessibile all'indirizzo IP: `http://16.171.242.107`

---

## 🎮 Il Gioco

> *"Small steps. Big orbit. One curious little explorer. An endless stretch of moon dust. How far can you make it?"*

### Comandi di Gioco
*   **`SPAZIO` o `↑`**: Salta sopra le rocce lunari.
*   **`TAP` / `Touch`**: Tocca un punto qualsiasi dello schermo per saltare (ottimizzato per dispositivi mobile).

---

## 🚀 Stack Tecnologico

L'architettura del progetto è strutturata per garantire performance fluide nel rendering di gioco e una gestione solida dei punteggi e degli utenti:

*   **Backend (Laravel)**: Gestione delle API, del database, salvataggio dei record personali (`Personal Best`) e delle sessioni di corsa (`This Run`).
*   **Frontend (Vite + TypeScript)**: Engine di gioco leggero e reattivo basato su TypeScript per una gestione ottimale degli asset grafici e dei cicli di gioco (*game loop*).
*   **Gestione Pacchetti**: Configurazione monorepo tramite `pnpm`.

---

## 📦 Installazione e Configurazione Locale

Se desideri clonare il repository ed eseguire l'ambiente di sviluppo in locale, segui questi passaggi:

### 1. Clonazione e Dipendenze Backend
```bash
git clone https://github.com
cd mfs
composer install
```

### 2. Configurazione dell'Ambiente Laravel
```bash
cp .env.example .env
php artisan key:generate
```
*Configura il file `.env` inserendo i parametri del tuo database locale.*

### 3. Migrazione del Database
Crea le tabelle necessarie per salvare le leaderboard e i dati di gioco:
```bash
php artisan migrate
```

### 4. Installazione Dipendenze Frontend
```bash
pnpm install
```

---

## 🛠️ Avviare l'Ambiente di Sviluppo

Apri due terminali separati per avviare contemporaneamente il server backend e il bundler frontend:

**Terminale 1 (Laravel PHP Server):**
```bash
php artisan serve
```

**Terminale 2 (Vite Development Server):**
```bash
pnpm dev
```

L'applicazione sarà solitamente raggiungibile localmente su `http://127.0.0.1:8000`.

---

## 🧪 Qualità del Codice

Il progetto integra diversi strumenti di linting e testing automatico per garantire la pulizia del codice di gioco:
*   **Analisi Statica PHP:** `vendor/bin/phpstan analyse`
*   **Formattatore di Stile (PHP):** `vendor/bin/pint`
*   **Test di Gioco:** `php artisan test`
