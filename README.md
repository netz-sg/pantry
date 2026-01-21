# Pantry 🥗

<div align="center">
  <img src="public/logo.png" alt="Pantry Logo" width="120" height="auto" />
  <br/>
  
  ### Dein persönlicher Koch- und Vorratsmanager
  
  <p align="center">
    Rezepte verwalten • Wochenplaner • Einkaufsliste • Vorratskammer
  </p>

  <div align="center">
    <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle" alt="Drizzle ORM">
  </div>
</div>

<br />

## 📖 Über das Projekt

**Pantry** ist eine moderne, selbstgehostete Webanwendung, die dir hilft, deinen Haushalt digital zu organisieren. Von der Verwaltung deiner Lieblingsrezepte über die Planung der kompletten Woche bis hin zum automatischen Erstellen von Einkaufslisten – Pantry ist dein zentraler Ort für alles rund ums Essen.

Entwickelt mit einem Fokus auf Ästhetik (Dark/Light Mode), Geschwindigkeit und Benutzerfreundlichkeit.

## ✨ Features

- **👨‍🍳 Rezeptverwaltung**: Erstelle eigene Rezepte oder importiere sie automatisch von beliebten Kochseiten mittels URL-Scraper.
- **📅 Interaktiver Wochenplaner**: Plane deine Mahlzeiten per Drag & Drop in einem visuellen "Masonry"-Grid.
- **🏷️ Kategorien**: Organisiere Rezepte in Standard-Kategorien oder erstelle deine eigenen.
- **🛒 Smarte Einkaufsliste**: Füge Zutaten direkt aus Rezepten hinzu.
- **📦 Vorratskammer**: Behalte den Überblick über deinen Bestand zu Hause.
- **👤 Personalisierung**: Benutzerprofile, Profilbilder und Einstellungen.
- **🔐 Authentifizierung**: Sicheres Login-System mit NextAuth.

## 🛠 Tech Stack

Das Projekt basiert auf modernsten Web-Technologien:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Sprache**: TypeScript
- **Datenbank**: SQLite mit [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **UI Components**: Radix UI & Lucide Icons

## 🚀 Installation & Start

1. **Repository klonen**
   ```bash
   git clone https://github.com/netz-sg/pantry.git
   cd pantry
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   # oder
   yarn install
   # oder
   pnpm install
   ```

3. **Datenbank einrichten**
   Das Projekt nutzt SQLite. Die Datenbankdatei wird lokal erstellt.
   ```bash
   npm run db:push
   ```

4. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```
   Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

## 📸 Screenshots

*(Platzhalter für Screenshots der Anwendung - Dashboard, Rezeptansicht, Planer)*

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz veröffentlicht.

---

<div align="center">
  Made with ❤️ by netz-sg
</div>
