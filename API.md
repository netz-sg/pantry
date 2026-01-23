# Pantry API Documentation

Complete REST API for Pantry - Your Personal Kitchen & Pantry Manager

## Base URL

When running locally: `http://localhost:3000/api`

When deployed: `https://your-domain.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication.

### Login Flow

1. **POST /api/auth/login** - Get JWT token
2. Include token in subsequent requests: `Authorization: Bearer <token>`

### Authentication Endpoints

#### POST /api/auth/login
Login with username and password to receive JWT token.

**Request Body:**
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "username": "your-username",
      "name": "Your Name",
      "email": "email@example.com",
      "image": "/uploads/profile.jpg",
      "locale": "de"
    }
  },
  "message": "Login successful"
}
```

#### GET /api/auth/verify
Verify JWT token and get user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "your-username",
      "name": "Your Name",
      "email": "email@example.com",
      "image": "/uploads/profile.jpg",
      "locale": "de"
    }
  }
}
```

---

## User Endpoints

### GET /api/user
Get current user profile.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "your-username",
    "name": "Your Name",
    "email": "email@example.com",
    "image": "/uploads/profile.jpg",
    "locale": "de",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/user
Update user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "image": "/uploads/new-profile.jpg",
  "locale": "en",
  "currentPassword": "current-password",  // Required if changing password
  "newPassword": "new-password"           // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "your-username",
    "name": "Updated Name",
    "email": "newemail@example.com",
    "image": "/uploads/new-profile.jpg",
    "locale": "en",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "User profile updated successfully"
}
```

---

## Recipe Endpoints

### GET /api/recipes
Get all recipes for authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "titleDe": "Spaghetti Carbonara",
      "titleEn": "Spaghetti Carbonara",
      "subtitleDe": "Klassisches italienisches Rezept",
      "subtitleEn": "Classic Italian Recipe",
      "descriptionDe": "Ein köstliches...",
      "descriptionEn": "A delicious...",
      "imageUrl": "/uploads/recipe.jpg",
      "prepTime": 15,
      "cookTime": 20,
      "servings": 4,
      "calories": 450,
      "category": "dinner",
      "tags": ["italian", "pasta"],
      "isPublic": false,
      "ingredients": [
        {
          "id": "...",
          "recipeId": "...",
          "nameDe": "Spaghetti",
          "nameEn": "Spaghetti",
          "amount": 400,
          "unit": "g",
          "order": 0
        }
      ],
      "instructions": [
        {
          "id": "...",
          "recipeId": "...",
          "stepNumber": 1,
          "instructionDe": "Wasser kochen...",
          "instructionEn": "Boil water..."
        }
      ],
      "favorites": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/recipes/[id]
Get single recipe by ID.

**Authentication:** Required

**Response:** Same as single recipe object from GET /api/recipes

### POST /api/recipes
Create new recipe.

**Authentication:** Required

**Request Body:**
```json
{
  "titleDe": "Spaghetti Carbonara",
  "titleEn": "Spaghetti Carbonara",
  "subtitleDe": "Klassisches italienisches Rezept",
  "subtitleEn": "Classic Italian Recipe",
  "descriptionDe": "Ein köstliches...",
  "descriptionEn": "A delicious...",
  "imageUrl": "/uploads/recipe.jpg",
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "calories": 450,
  "category": "dinner",
  "tags": ["italian", "pasta"],
  "isPublic": false,
  "ingredients": [
    {
      "nameDe": "Spaghetti",
      "nameEn": "Spaghetti",
      "amount": 400,
      "unit": "g"
    }
  ],
  "instructions": [
    {
      "instructionDe": "Wasser kochen...",
      "instructionEn": "Boil water..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* recipe object */ },
  "message": "Recipe created successfully"
}
```

### PUT /api/recipes/[id]
Update recipe.

**Authentication:** Required

**Request Body:** Same as POST /api/recipes

**Response:**
```json
{
  "success": true,
  "data": { /* updated recipe object */ },
  "message": "Recipe updated successfully"
}
```

### DELETE /api/recipes/[id]
Delete recipe.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": { "id": "..." },
  "message": "Recipe deleted successfully"
}
```

---

## Pantry Endpoints

### GET /api/pantry
Get all pantry items.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "nameDe": "Tomaten",
      "nameEn": "Tomatoes",
      "quantity": 5,
      "unit": "Stk",
      "location": "fridge",
      "category": "produce",
      "expiryDate": "2024-12-31",
      "icon": "🍅",
      "lowStockThreshold": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/pantry/[id]
Get single pantry item.

**Authentication:** Required

### POST /api/pantry
Create new pantry item.

**Authentication:** Required

**Request Body:**
```json
{
  "nameDe": "Tomaten",
  "nameEn": "Tomatoes",
  "quantity": 5,
  "unit": "Stk",
  "location": "fridge",
  "category": "produce",
  "expiryDate": "2024-12-31",
  "icon": "🍅",
  "lowStockThreshold": 2
}
```

### PUT /api/pantry/[id]
Update pantry item.

**Authentication:** Required

**Request Body:** Same as POST /api/pantry

### DELETE /api/pantry/[id]
Delete pantry item.

**Authentication:** Required

---

## Shopping List Endpoints

### GET /api/shopping
Get all shopping list items.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "nameDe": "Milch",
      "nameEn": "Milk",
      "quantity": 1,
      "unit": "L",
      "checked": false,
      "recipeId": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "recipe": null
    }
  ]
}
```

### GET /api/shopping/[id]
Get single shopping list item.

**Authentication:** Required

### POST /api/shopping
Create new shopping list item.

**Authentication:** Required

**Request Body:**
```json
{
  "nameDe": "Milch",
  "nameEn": "Milk",
  "quantity": 1,
  "unit": "L",
  "checked": false,
  "recipeId": null  // Optional: link to recipe
}
```

### PUT /api/shopping/[id]
Update shopping list item.

**Authentication:** Required

**Request Body:** Same as POST /api/shopping

### DELETE /api/shopping/[id]
Delete shopping list item.

**Authentication:** Required

---

## Meal Planner Endpoints

### GET /api/planner
Get meal plans.

**Authentication:** Required

**Query Parameters:**
- `startDate` (optional): ISO date string (YYYY-MM-DD)
- `endDate` (optional): ISO date string (YYYY-MM-DD)

**Example:** `/api/planner?startDate=2024-01-01&endDate=2024-01-07`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "recipeId": "...",
      "date": "2024-01-15",
      "mealType": "dinner",
      "servings": 4,
      "notes": "Family dinner",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "recipe": { /* full recipe object */ }
    }
  ]
}
```

### GET /api/planner/[id]
Get single meal plan.

**Authentication:** Required

### POST /api/planner
Create new meal plan.

**Authentication:** Required

**Request Body:**
```json
{
  "recipeId": "...",
  "date": "2024-01-15",
  "mealType": "dinner",
  "servings": 4,
  "notes": "Family dinner"
}
```

### PUT /api/planner/[id]
Update meal plan.

**Authentication:** Required

**Request Body:** Same as POST /api/planner

### DELETE /api/planner/[id]
Delete meal plan.

**Authentication:** Required

---

## Favorites Endpoints

### GET /api/favorites
Get all favorite recipes.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "recipeId": "...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "recipe": { /* full recipe object */ }
    }
  ]
}
```

### POST /api/favorites
Add recipe to favorites.

**Authentication:** Required

**Request Body:**
```json
{
  "recipeId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* favorite object */ },
  "message": "Recipe added to favorites"
}
```

### DELETE /api/favorites/[id]
Remove recipe from favorites.

**Authentication:** Required

**Note:** `[id]` can be either the favorite ID or the recipe ID.

**Response:**
```json
{
  "success": true,
  "data": { "id": "..." },
  "message": "Recipe removed from favorites"
}
```

---

## Response Format

All API endpoints follow a consistent response format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Common Error Codes

- `400` - Bad Request (missing or invalid data)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Localization

The API supports bilingual content with German (de) and English (en) fields:

- All user-facing text fields have both `*De` and `*En` variants
- When creating/updating resources, provide both language variants
- Users have a `locale` preference that apps can use to determine which language to display

## Example Usage (cURL)

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'
```

### Get Recipes (with token):
```bash
curl -X GET http://localhost:3000/api/recipes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Recipe:
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titleDe": "Test Rezept",
    "titleEn": "Test Recipe",
    "servings": 4,
    "ingredients": [],
    "instructions": []
  }'
```

## Mobile App Integration

For mobile app integration:

1. **Setup Screen:** User enters their Pantry URL (e.g., `https://pantry.example.com`)
2. **Login Screen:** User enters username and password
3. **Call POST /api/auth/login** to get JWT token
4. **Store token securely** in app (e.g., secure storage/keychain)
5. **Include token in all subsequent API requests** as `Authorization: Bearer <token>`
6. **Token validity:** 30 days (configurable in `lib/api-helpers.ts`)
7. **Handle 401 errors:** Re-authenticate user when token expires

## API Overview Endpoint

**GET /api** - Returns complete API documentation in JSON format

This endpoint provides a machine-readable overview of all available endpoints, useful for auto-generating API clients.
