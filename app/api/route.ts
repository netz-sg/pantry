import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Pantry API',
    version: '1.0.0',
    description: 'REST API for Pantry - Your Personal Kitchen & Pantry Manager',
    authentication: {
      type: 'Bearer Token (JWT)',
      endpoints: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
      },
    },
    endpoints: {
      auth: {
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login with username and password to receive JWT token',
          body: {
            username: 'string (required)',
            password: 'string (required)',
          },
          authentication: 'none',
        },
        verify: {
          method: 'GET',
          path: '/api/auth/verify',
          description: 'Verify JWT token and get user information',
          authentication: 'required',
        },
      },
      user: {
        get: {
          method: 'GET',
          path: '/api/user',
          description: 'Get current user profile',
          authentication: 'required',
        },
        update: {
          method: 'PUT',
          path: '/api/user',
          description: 'Update user profile (name, email, image, locale, password)',
          authentication: 'required',
        },
      },
      recipes: {
        list: {
          method: 'GET',
          path: '/api/recipes',
          description: 'Get all recipes',
          authentication: 'required',
        },
        get: {
          method: 'GET',
          path: '/api/recipes/[id]',
          description: 'Get single recipe by ID',
          authentication: 'required',
        },
        create: {
          method: 'POST',
          path: '/api/recipes',
          description: 'Create new recipe',
          authentication: 'required',
        },
        update: {
          method: 'PUT',
          path: '/api/recipes/[id]',
          description: 'Update recipe',
          authentication: 'required',
        },
        delete: {
          method: 'DELETE',
          path: '/api/recipes/[id]',
          description: 'Delete recipe',
          authentication: 'required',
        },
      },
      pantry: {
        list: {
          method: 'GET',
          path: '/api/pantry',
          description: 'Get all pantry items',
          authentication: 'required',
        },
        get: {
          method: 'GET',
          path: '/api/pantry/[id]',
          description: 'Get single pantry item by ID',
          authentication: 'required',
        },
        create: {
          method: 'POST',
          path: '/api/pantry',
          description: 'Create new pantry item',
          authentication: 'required',
        },
        update: {
          method: 'PUT',
          path: '/api/pantry/[id]',
          description: 'Update pantry item',
          authentication: 'required',
        },
        delete: {
          method: 'DELETE',
          path: '/api/pantry/[id]',
          description: 'Delete pantry item',
          authentication: 'required',
        },
      },
      shopping: {
        list: {
          method: 'GET',
          path: '/api/shopping',
          description: 'Get all shopping list items',
          authentication: 'required',
        },
        get: {
          method: 'GET',
          path: '/api/shopping/[id]',
          description: 'Get single shopping list item by ID',
          authentication: 'required',
        },
        create: {
          method: 'POST',
          path: '/api/shopping',
          description: 'Create new shopping list item',
          authentication: 'required',
        },
        update: {
          method: 'PUT',
          path: '/api/shopping/[id]',
          description: 'Update shopping list item',
          authentication: 'required',
        },
        delete: {
          method: 'DELETE',
          path: '/api/shopping/[id]',
          description: 'Delete shopping list item',
          authentication: 'required',
        },
      },
      planner: {
        list: {
          method: 'GET',
          path: '/api/planner',
          description: 'Get meal plans (optional query params: startDate, endDate)',
          authentication: 'required',
        },
        get: {
          method: 'GET',
          path: '/api/planner/[id]',
          description: 'Get single meal plan by ID',
          authentication: 'required',
        },
        create: {
          method: 'POST',
          path: '/api/planner',
          description: 'Create new meal plan',
          authentication: 'required',
        },
        update: {
          method: 'PUT',
          path: '/api/planner/[id]',
          description: 'Update meal plan',
          authentication: 'required',
        },
        delete: {
          method: 'DELETE',
          path: '/api/planner/[id]',
          description: 'Delete meal plan',
          authentication: 'required',
        },
      },
      favorites: {
        list: {
          method: 'GET',
          path: '/api/favorites',
          description: 'Get all favorite recipes',
          authentication: 'required',
        },
        add: {
          method: 'POST',
          path: '/api/favorites',
          description: 'Add recipe to favorites',
          authentication: 'required',
        },
        remove: {
          method: 'DELETE',
          path: '/api/favorites/[id]',
          description: 'Remove recipe from favorites (id can be favorite ID or recipe ID)',
          authentication: 'required',
        },
      },
    },
    usage: {
      authentication: 'Include JWT token in Authorization header: "Bearer <token>"',
      responseFormat: {
        success: {
          success: true,
          data: '...',
          message: 'optional success message',
        },
        error: {
          success: false,
          error: 'error message',
        },
      },
    },
  });
}
