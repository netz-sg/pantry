# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pantry is a self-hosted kitchen and pantry management application built with Next.js 16. It's a single-user application designed to manage recipes, meal planning, shopping lists, and pantry inventory with full internationalization support.

## Key Technologies

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Auth.js v5 (NextAuth) with credentials provider
- **Internationalization**: next-intl supporting English (en), German (de), and Chinese (zh)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with custom components
- **Deployment**: Docker & Docker Compose (standalone output)

## Development Commands

### Essential Commands
```bash
npm run dev          # Start development server (DO NOT run - user handles this)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:push      # Push database schema changes to SQLite
npm run db:seed      # Seed database with initial data

npm run release      # Create release (PowerShell script)
npm run release:bash # Create release (Bash script)
```

### Important Notes
- **NEVER start the dev server** - the user handles this
- **NEVER create git commits or push to GitHub** - the user handles version control
- When running builds, ensure no errors occur - this is critical

## Architecture Overview

### App Structure (Next.js App Router)
- `/app/(app)/*` - Main application routes (dashboard, recipes, planner, shopping, pantry, settings, favorites)
- `/app/(auth)/*` - Authentication routes (signin, register)
- `/app/actions/*` - Server actions for data mutations (recipes, planner, shopping, pantry, user, auth, etc.)
- `/app/api/*` - API routes

### Database Schema (`db/schema.ts`)

The application uses a relational SQLite database with Drizzle ORM. All content fields support **bilingual localization** with separate `*De` and `*En` columns:

**Core Tables:**
- `users` - User accounts (single user system, locale preference)
- `recipes` - Recipes with localized title/subtitle/description (`titleDe`, `titleEn`, etc.)
- `recipeIngredients` - Recipe ingredients with localized names (`nameDe`, `nameEn`)
- `recipeInstructions` - Step-by-step recipe instructions (localized)
- `pantryItems` - User's pantry inventory with localized names
- `shoppingListItems` - Shopping list with localized item names
- `mealPlans` - Weekly meal planning calendar
- `favorites` - User favorite recipes
- `categories` - Recipe categories

**Key Relationships:**
- One user → many recipes, pantry items, shopping items, meal plans
- Recipes have many ingredients and instructions (ordered by `order` and `stepNumber`)
- Recipes can be favorited and planned in meals
- Shopping list items can optionally link to recipes

### Internationalization System

**Languages**: English (en), German (de), Chinese (zh) - default is English

**Structure:**
- `/i18n/config.ts` - Locale configuration
- `/i18n/request.ts` - Request handler for next-intl
- `/messages/` - Translation JSON files (en.json, de.json, zh.json)
- Database fields use `*De`, `*En` suffix pattern for bilingual content
- Users have a `locale` preference in the database

**Critical Rule**: When creating new database schemas or features, ALWAYS add localized field variants for user-facing content.

### Component Organization
- `/components/ui/*` - Base UI components (buttons, inputs, dialogs, etc.)
- `/components/layout/*` - Layout components (sidebar, header, etc.)
- `/components/recipes/*` - Recipe-specific components
- `/components/planner/*` - Meal planner components
- `/components/pantry/*` - Pantry management components
- `/components/shopping/*` - Shopping list components
- `/components/settings/*` - Settings page components
- `/components/language-switcher.tsx` - Language toggle component

### Server Actions Pattern
All data mutations use Next.js Server Actions located in `/app/actions/`:
- Actions start with `'use server'` directive
- Always check authentication via `await auth()`
- Use `revalidatePath()` after mutations
- Return structured responses with success/error states

### Authentication Flow
- Single-user system: first registration creates the only account
- Uses NextAuth credentials provider with bcrypt password hashing
- Session stored as JWT
- Protected routes check `session?.user?.id`
- Custom signin page at `/signin`

### Database Localization Pattern
When accessing localized content in the database:
```typescript
// Get localized field based on user's locale
const title = locale === 'de' ? recipe.titleDe : recipe.titleEn;
const name = locale === 'de' ? item.nameDe : item.nameEn;
```

When creating/updating localized content, ALWAYS provide both language variants.

### Styling Guidelines
- Follow existing component design patterns in `/components/ui/`
- Use Tailwind CSS v4 utilities
- Match the established design system - review similar components before creating new ones
- Use lucide-react for icons
- Components should be responsive and accessible

## Critical Development Rules

1. **No Server Starts**: Never start the development server - the user handles this
2. **No Git Operations**: Never commit or push - the user manages version control
3. **Build Quality**: When implementing features, ensure no build errors occur
4. **Localization**: Always implement bilingual support (de/en) for user-facing content
5. **Design Consistency**: Review existing components to match the website design
6. **No Unnecessary Files**: Don't create README files unless explicitly requested
7. **Schema Localization**: When adding Sanity schemas (if applicable) or database fields, always include localization

## File Paths & Imports

TypeScript path alias: `@/*` maps to project root

Common imports:
```typescript
import { db } from '@/db/drizzle';
import { auth } from '@/lib/auth';
import { recipes, users, etc } from '@/db/schema';
import { useTranslations } from 'next-intl';
```

## Docker Deployment

The application builds as a standalone Next.js app:
- `Dockerfile` for containerization
- `docker-compose.yml` for orchestration
- Persisted volumes: `pantry-data` (database), `pantry-uploads` (images)
- Default port: 3000

## REST API

The project includes a complete REST API for mobile app integration located in `/app/api/*`.

### API Structure

**Authentication:**
- JWT-based authentication (30-day token validity)
- Login: `POST /api/auth/login`
- Verify: `GET /api/auth/verify`

**Endpoints:**
- `/api/recipes` - Recipe CRUD operations
- `/api/pantry` - Pantry items CRUD operations
- `/api/shopping` - Shopping list CRUD operations
- `/api/planner` - Meal planner CRUD operations (supports date range queries)
- `/api/favorites` - Favorites management
- `/api/user` - User profile and settings

**Response Format:**
```typescript
// Success
{ success: true, data: any, message?: string }

// Error
{ success: false, error: string }
```

**API Helpers:** Located in `/lib/api-helpers.ts`
- `apiSuccess()` - Create success response
- `apiError()` - Create error response
- `generateToken()` - Generate JWT token
- `verifyToken()` - Verify JWT token
- `authenticateRequest()` - Authenticate API request

**Documentation:** See `API.md` for complete API documentation

### API Development Notes
- All API routes use JWT authentication (except login)
- Include token in header: `Authorization: Bearer <token>`
- API is designed for mobile app consumption
- All endpoints respect the bilingual localization pattern
- Protected routes verify user ownership of resources

## Environment Variables

Required for production:
- `AUTH_SECRET` - NextAuth secret key (also used for JWT signing)
- `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)
- `DATABASE_URL` - SQLite database path (default: file:./data/pantry.db)
