# Pantry 🥗

<div align="center">
  <img src="public/logo.png" alt="Pantry Logo" width="120" height="auto" />
  <br/>
  
  ### Your Personal Kitchen & Pantry Manager
  
  <p align="center">
    Manage Recipes • Meal Planner • Shopping List • Pantry Inventory
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

## 📖 About the Project

**Pantry** is a modern, self-hosted web application designed to help you organize your household digitally. From managing your favorite recipes and planning your entire week to automatically generating shopping lists – Pantry is your central hub for everything food-related.

Developed with a focus on aesthetics (Dark/Light Mode), performance, and user experience.

## ✨ Features

- **👨‍🍳 Recipe Management**: Create your own recipes or import them automatically from popular cooking websites using the URL scraper.
- **📅 Interactive Meal Planner**: Plan your meals using drag & drop in a visual "Masonry" grid layout.
- **🏷️ Categories**: Organize recipes into standard categories or create your own custom ones.
- **🛒 Smart Shopping List**: Add ingredients directly from recipes to your list.
- **📦 Pantry Inventory**: Keep track of your home inventory and ingredients.
- **👤 Personalization**: User profiles, custom profile pictures, and personalized settings.
- **🔐 Authentication**: Secure login system powered by NextAuth.

## 🛠 Tech Stack

The project is built on cutting-edge web technologies:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **UI Components**: Radix UI & Lucide Icons

## 🚀 Installation & Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/netz-sg/pantry.git
   cd pantry
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Setup Database**
   The project uses SQLite. The database file will be created locally.
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Screenshots

*(Placeholders for application screenshots - Dashboard, Recipe View, Planner)*

## 📄 License

This project is published under the MIT License.

---

<div align="center">
  Made with ❤️ by netz-sg
</div>
