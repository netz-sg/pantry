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
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle" alt="Drizzle ORM">
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker">
  </div>
</div>

<br />

## 📖 About the Project

**Pantry** is a modern, self-hosted web application designed to help you organize your household digitally. From managing your favorite recipes and planning your entire week to automatically generating shopping lists – Pantry is your central hub for everything food-related.

Designed as a **single-user application** for personal or household use, with easy Docker deployment for quick setup.

## ✨ Features

- **👨‍🍳 Recipe Management**: Create, edit and organize your favorite recipes with images and detailed instructions.
- **📅 Interactive Meal Planner**: Plan your meals for the week with an intuitive calendar view.
- **🏷️ Categories & Tags**: Organize recipes by categories (breakfast, lunch, dinner, etc.) and custom tags.
- **🛒 Smart Shopping List**: Add ingredients directly from recipes to your shopping list with one click.
- **📦 Pantry Inventory**: Keep track of your pantry items, expiry dates, and low stock alerts.
- **👤 Personalization**: User profile with custom profile picture and settings.
- **🔐 Secure Authentication**: Username/password login with NextAuth.
- **📱 REST API**: Complete REST API with JWT authentication for mobile app integration.
- **🌍 Internationalization**: Full support for English, German, and Chinese with bilingual data storage.
- **🐳 Docker Ready**: One-command deployment with Docker Compose.

## 🛠 Tech Stack

The project is built on cutting-edge web technologies:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **UI Components**: Radix UI & Lucide Icons
- **Deployment**: Docker & Docker Compose

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

The fastest way to get started:

```bash
# 1. Clone the repository
git clone https://github.com/netz-sg/pantry.git
cd pantry

# 2. Start with Docker Compose
docker-compose up -d
```

**That's it!** Open [http://localhost:3000](http://localhost:3000) and create your account.

📖 **Full Docker documentation**: See [DOCKER.md](DOCKER.md) for advanced configuration, backups, and troubleshooting.

### Option 2: Local Development

For development or if you prefer running without Docker:

1. **Clone the repository**
   ```bash
   git clone https://github.com/netz-sg/pantry.git
   cd pantry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 First Time Setup

After starting the application:

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click **"Jetzt registrieren"** (Register)
3. Create your account with:
   - **Name**: Your display name
   - **Username**: Your login username (min. 3 characters)
   - **Password**: Your secure password (min. 8 characters)

**Important**: This is a single-user application. After the first user registers, no additional registrations are possible.

## 📱 REST API

Pantry includes a complete **REST API** for mobile app integration. All endpoints support full CRUD operations with JWT-based authentication.

### Available Endpoints

- **🔐 Authentication**: Login & token verification (`POST /api/auth/login`, `GET /api/auth/verify`)
- **👨‍🍳 Recipes**: Complete recipe management with ingredients & instructions (`/api/recipes`)
- **📦 Pantry**: Pantry inventory management (`/api/pantry`)
- **🛒 Shopping List**: Shopping list operations (`/api/shopping`)
- **📅 Meal Planner**: Weekly meal planning with date range queries (`/api/planner`)
- **⭐ Favorites**: Manage favorite recipes (`/api/favorites`)
- **👤 User**: Profile and settings management (`/api/user`)

### Key Features

- **JWT Authentication**: 30-day token validity with Bearer authentication
- **Bilingual Support**: All content fields include both German and English variants
- **Complete Data**: Recipe endpoints return full details including ingredients, instructions, and favorite status
- **Relational Data**: Efficient queries with automatic relation loading
- **Standardized Responses**: Consistent success/error response format

📖 **Full API Documentation**: See [API.md](API.md) for detailed endpoint specifications, request/response examples, and authentication flow.

## 📦 Environment Variables

Optional environment variables (with defaults):

```env
# Authentication
AUTH_SECRET=your-secret-key-here  # Used for NextAuth and JWT signing
NEXTAUTH_URL=http://localhost:3000

# Database (SQLite)
DATABASE_URL=file:./data/pantry.db
```

## 🐳 Docker Volumes

When using Docker, your data is persisted in volumes:

- **pantry-data**: Database files
- **pantry-uploads**: Uploaded images (profile pictures, recipe images)

## 📸 Screenshots

<div align="center">

### Dashboard
Your overview showing recent recipes and quick stats at a glance.

<img src="public/screenshots/Screenshot 2026-01-21 180956.png" alt="Dashboard Overview" width="100%" />

---

### Recipe Management
Create and manage your recipes with images, ingredients, and step-by-step instructions.

<img src="public/screenshots/Screenshot 2026-01-21 181005.png" alt="Recipe Management" width="100%" />

---

### Recipe Detail View
Detailed view of a recipe with all ingredients, instructions, and nutritional information.

<img src="public/screenshots/Screenshot 2026-01-21 181017.png" alt="Recipe Detail View" width="100%" />

---

### Meal Planner
Plan your meals for the week in a clear calendar view.

<img src="public/screenshots/Screenshot 2026-01-21 181028.png" alt="Meal Planner" width="100%" />

</div>

## 📄 License

This project is published under the MIT License.

---

<div align="center">
  Made with ❤️ by netz-sg
</div>
