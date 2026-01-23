# Pantry Flutter App - Developer Setup Guide

Complete guide for Flutter developers to build a mobile app for Pantry.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Recommended Flutter Packages](#recommended-flutter-packages)
4. [API Connection Setup](#api-connection-setup)
5. [Authentication Flow](#authentication-flow)
6. [API Service Implementation](#api-service-implementation)
7. [Data Models](#data-models)
8. [State Management](#state-management)
9. [Localization](#localization)
10. [Code Examples](#code-examples)
11. [Best Practices](#best-practices)

---

## Overview

Pantry is a self-hosted kitchen management application. Users will:
1. Enter their Pantry server URL (e.g., `https://pantry.example.com`)
2. Login with username/password
3. Access all features through the REST API

**API Base URL Format:** `{user_url}/api`

**Authentication:** JWT Bearer Token (30-day validity)

---

## Prerequisites

- Flutter SDK 3.0+
- Dart 3.0+
- Basic understanding of REST APIs
- Understanding of JWT authentication

---

## Recommended Flutter Packages

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP & Networking
  http: ^1.1.0
  dio: ^5.4.0  # Alternative to http with interceptors

  # State Management (choose one)
  provider: ^6.1.0
  riverpod: ^2.4.0  # Recommended
  bloc: ^8.1.0

  # Secure Storage for Token
  flutter_secure_storage: ^9.0.0

  # JSON Serialization
  json_annotation: ^4.8.0

  # Localization
  intl: ^0.18.0
  flutter_localizations:
    sdk: flutter

  # UI Components
  cached_network_image: ^3.3.0
  image_picker: ^1.0.0

  # Date & Time
  intl: ^0.18.0

dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
```

---

## API Connection Setup

### 1. Configuration Class

Create `lib/config/api_config.dart`:

```dart
class ApiConfig {
  static String? _baseUrl;

  static void setBaseUrl(String url) {
    // Remove trailing slash if present
    _baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  static String get baseUrl {
    if (_baseUrl == null) {
      throw Exception('Base URL not set. Call ApiConfig.setBaseUrl() first.');
    }
    return _baseUrl!;
  }

  static String get apiUrl => '$baseUrl/api';

  // API Endpoints
  static String get loginUrl => '$apiUrl/auth/login';
  static String get verifyUrl => '$apiUrl/auth/verify';
  static String get userUrl => '$apiUrl/user';
  static String get recipesUrl => '$apiUrl/recipes';
  static String get pantryUrl => '$apiUrl/pantry';
  static String get shoppingUrl => '$apiUrl/shopping';
  static String get plannerUrl => '$apiUrl/planner';
  static String get favoritesUrl => '$apiUrl/favorites';

  static String recipeById(String id) => '$recipesUrl/$id';
  static String pantryById(String id) => '$pantryUrl/$id';
  static String shoppingById(String id) => '$shoppingUrl/$id';
  static String plannerById(String id) => '$plannerUrl/$id';
  static String favoriteById(String id) => '$favoritesUrl/$id';
}
```

### 2. Secure Token Storage

Create `lib/services/storage_service.dart`:

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _storage = FlutterSecureStorage();

  // Keys
  static const _tokenKey = 'jwt_token';
  static const _baseUrlKey = 'base_url';
  static const _userIdKey = 'user_id';
  static const _usernameKey = 'username';
  static const _localeKey = 'locale';

  // Token Management
  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  // Base URL
  static Future<void> saveBaseUrl(String url) async {
    await _storage.write(key: _baseUrlKey, value: url);
  }

  static Future<String?> getBaseUrl() async {
    return await _storage.read(key: _baseUrlKey);
  }

  // User Info
  static Future<void> saveUserInfo({
    required String userId,
    required String username,
    required String locale,
  }) async {
    await _storage.write(key: _userIdKey, value: userId);
    await _storage.write(key: _usernameKey, value: username);
    await _storage.write(key: _localeKey, value: locale);
  }

  static Future<String?> getUserLocale() async {
    return await _storage.read(key: _localeKey);
  }

  // Clear all data (logout)
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

---

## Authentication Flow

### 1. Auth Service

Create `lib/services/auth_service.dart`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'storage_service.dart';

class AuthService {
  /// Login with username and password
  /// Returns user data on success, throws exception on failure
  static Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse(ApiConfig.loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['success'] == true) {
      final token = data['data']['token'];
      final user = data['data']['user'];

      // Save token and user info
      await StorageService.saveToken(token);
      await StorageService.saveUserInfo(
        userId: user['id'],
        username: user['username'],
        locale: user['locale'] ?? 'en',
      );

      return user;
    } else {
      throw Exception(data['error'] ?? 'Login failed');
    }
  }

  /// Verify if stored token is still valid
  static Future<bool> verifyToken() async {
    final token = await StorageService.getToken();

    if (token == null) return false;

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.verifyUrl),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);
      return response.statusCode == 200 && data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  /// Logout user
  static Future<void> logout() async {
    await StorageService.clearAll();
  }

  /// Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await StorageService.getToken();
    if (token == null) return false;
    return await verifyToken();
  }
}
```

### 2. Setup Flow in Main App

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'config/api_config.dart';
import 'services/storage_service.dart';
import 'services/auth_service.dart';
import 'screens/setup_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load saved base URL
  final savedUrl = await StorageService.getBaseUrl();
  if (savedUrl != null) {
    ApiConfig.setBaseUrl(savedUrl);
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pantry',
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
      ),
      home: const InitialScreen(),
    );
  }
}

class InitialScreen extends StatefulWidget {
  const InitialScreen({Key? key}) : super(key: key);

  @override
  State<InitialScreen> createState() => _InitialScreenState();
}

class _InitialScreenState extends State<InitialScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    // Check if base URL is set
    final baseUrl = await StorageService.getBaseUrl();

    if (baseUrl == null) {
      // No URL set -> Show setup screen
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const SetupScreen()),
      );
      return;
    }

    // URL is set, check if logged in
    final isLoggedIn = await AuthService.isLoggedIn();

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => isLoggedIn ? const HomeScreen() : const LoginScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
```

---

## API Service Implementation

### Generic API Service

Create `lib/services/api_service.dart`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

class ApiService {
  /// Get authorization headers with JWT token
  static Future<Map<String, String>> _getHeaders() async {
    final token = await StorageService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// GET request
  static Future<Map<String, dynamic>> get(String url) async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse(url), headers: headers);

    return _handleResponse(response);
  }

  /// POST request
  static Future<Map<String, dynamic>> post(
    String url,
    Map<String, dynamic> body,
  ) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );

    return _handleResponse(response);
  }

  /// PUT request
  static Future<Map<String, dynamic>> put(
    String url,
    Map<String, dynamic> body,
  ) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );

    return _handleResponse(response);
  }

  /// DELETE request
  static Future<Map<String, dynamic>> delete(String url) async {
    final headers = await _getHeaders();
    final response = await http.delete(Uri.parse(url), headers: headers);

    return _handleResponse(response);
  }

  /// Handle API response
  static Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (data['success'] == true) {
        return data;
      }
    }

    // Handle error
    throw ApiException(
      message: data['error'] ?? 'Unknown error',
      statusCode: response.statusCode,
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => message;
}
```

---

## Data Models

### Recipe Model

Create `lib/models/recipe.dart`:

```dart
class Recipe {
  final String id;
  final String userId;
  final String? titleDe;
  final String? titleEn;
  final String? subtitleDe;
  final String? subtitleEn;
  final String? descriptionDe;
  final String? descriptionEn;
  final String? imageUrl;
  final int? prepTime;
  final int? cookTime;
  final int servings;
  final int? calories;
  final String? category;
  final List<String> tags;
  final bool isPublic;
  final List<RecipeIngredient> ingredients;
  final List<RecipeInstruction> instructions;
  final DateTime createdAt;
  final DateTime updatedAt;

  Recipe({
    required this.id,
    required this.userId,
    this.titleDe,
    this.titleEn,
    this.subtitleDe,
    this.subtitleEn,
    this.descriptionDe,
    this.descriptionEn,
    this.imageUrl,
    this.prepTime,
    this.cookTime,
    required this.servings,
    this.calories,
    this.category,
    this.tags = const [],
    this.isPublic = false,
    this.ingredients = const [],
    this.instructions = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  // Get localized title based on locale
  String getTitle(String locale) {
    if (locale == 'de') return titleDe ?? titleEn ?? '';
    return titleEn ?? titleDe ?? '';
  }

  String getSubtitle(String locale) {
    if (locale == 'de') return subtitleDe ?? subtitleEn ?? '';
    return subtitleEn ?? subtitleDe ?? '';
  }

  String getDescription(String locale) {
    if (locale == 'de') return descriptionDe ?? descriptionEn ?? '';
    return descriptionEn ?? descriptionDe ?? '';
  }

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: json['id'],
      userId: json['userId'],
      titleDe: json['titleDe'],
      titleEn: json['titleEn'],
      subtitleDe: json['subtitleDe'],
      subtitleEn: json['subtitleEn'],
      descriptionDe: json['descriptionDe'],
      descriptionEn: json['descriptionEn'],
      imageUrl: json['imageUrl'],
      prepTime: json['prepTime'],
      cookTime: json['cookTime'],
      servings: json['servings'],
      calories: json['calories'],
      category: json['category'],
      tags: List<String>.from(json['tags'] ?? []),
      isPublic: json['isPublic'] ?? false,
      ingredients: (json['ingredients'] as List?)
          ?.map((i) => RecipeIngredient.fromJson(i))
          .toList() ?? [],
      instructions: (json['instructions'] as List?)
          ?.map((i) => RecipeInstruction.fromJson(i))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'titleDe': titleDe,
      'titleEn': titleEn,
      'subtitleDe': subtitleDe,
      'subtitleEn': subtitleEn,
      'descriptionDe': descriptionDe,
      'descriptionEn': descriptionEn,
      'imageUrl': imageUrl,
      'prepTime': prepTime,
      'cookTime': cookTime,
      'servings': servings,
      'calories': calories,
      'category': category,
      'tags': tags,
      'isPublic': isPublic,
      'ingredients': ingredients.map((i) => i.toJson()).toList(),
      'instructions': instructions.map((i) => i.toJson()).toList(),
    };
  }
}

class RecipeIngredient {
  final String? id;
  final String? nameDe;
  final String? nameEn;
  final double amount;
  final String unit;

  RecipeIngredient({
    this.id,
    this.nameDe,
    this.nameEn,
    required this.amount,
    required this.unit,
  });

  String getName(String locale) {
    if (locale == 'de') return nameDe ?? nameEn ?? '';
    return nameEn ?? nameDe ?? '';
  }

  factory RecipeIngredient.fromJson(Map<String, dynamic> json) {
    return RecipeIngredient(
      id: json['id'],
      nameDe: json['nameDe'],
      nameEn: json['nameEn'],
      amount: (json['amount'] as num).toDouble(),
      unit: json['unit'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nameDe': nameDe,
      'nameEn': nameEn,
      'amount': amount,
      'unit': unit,
    };
  }
}

class RecipeInstruction {
  final String? id;
  final int stepNumber;
  final String? instructionDe;
  final String? instructionEn;

  RecipeInstruction({
    this.id,
    required this.stepNumber,
    this.instructionDe,
    this.instructionEn,
  });

  String getInstruction(String locale) {
    if (locale == 'de') return instructionDe ?? instructionEn ?? '';
    return instructionEn ?? instructionDe ?? '';
  }

  factory RecipeInstruction.fromJson(Map<String, dynamic> json) {
    return RecipeInstruction(
      id: json['id'],
      stepNumber: json['stepNumber'],
      instructionDe: json['instructionDe'],
      instructionEn: json['instructionEn'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'instructionDe': instructionDe,
      'instructionEn': instructionEn,
    };
  }
}
```

### Other Models

Create similar models for:
- `lib/models/pantry_item.dart`
- `lib/models/shopping_item.dart`
- `lib/models/meal_plan.dart`
- `lib/models/user.dart`

---

## Code Examples

### Recipe Service

Create `lib/services/recipe_service.dart`:

```dart
import '../config/api_config.dart';
import '../models/recipe.dart';
import 'api_service.dart';

class RecipeService {
  /// Get all recipes
  static Future<List<Recipe>> getRecipes() async {
    final response = await ApiService.get(ApiConfig.recipesUrl);
    final List recipesJson = response['data'];
    return recipesJson.map((json) => Recipe.fromJson(json)).toList();
  }

  /// Get recipe by ID
  static Future<Recipe> getRecipeById(String id) async {
    final response = await ApiService.get(ApiConfig.recipeById(id));
    return Recipe.fromJson(response['data']);
  }

  /// Create new recipe
  static Future<Recipe> createRecipe(Recipe recipe) async {
    final response = await ApiService.post(
      ApiConfig.recipesUrl,
      recipe.toJson(),
    );
    return Recipe.fromJson(response['data']);
  }

  /// Update recipe
  static Future<Recipe> updateRecipe(String id, Recipe recipe) async {
    final response = await ApiService.put(
      ApiConfig.recipeById(id),
      recipe.toJson(),
    );
    return Recipe.fromJson(response['data']);
  }

  /// Delete recipe
  static Future<void> deleteRecipe(String id) async {
    await ApiService.delete(ApiConfig.recipeById(id));
  }
}
```

### Example: Login Screen

```dart
// lib/screens/login_screen.dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await AuthService.login(
        username: _usernameController.text,
        password: _passwordController.text,
      );

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter username';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter password';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Login'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### Example: Setup Screen (URL Entry)

```dart
// lib/screens/setup_screen.dart
import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../services/storage_service.dart';
import 'login_screen.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({Key? key}) : super(key: key);

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _urlController = TextEditingController();
  bool _isLoading = false;

  Future<void> _saveUrl() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    String url = _urlController.text.trim();

    // Add https:// if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://$url';
    }

    // Save URL
    await StorageService.saveBaseUrl(url);
    ApiConfig.setBaseUrl(url);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setup Pantry')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.restaurant, size: 80, color: Colors.green),
              const SizedBox(height: 24),
              const Text(
                'Enter your Pantry server URL',
                style: TextStyle(fontSize: 18),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _urlController,
                decoration: const InputDecoration(
                  labelText: 'Server URL',
                  hintText: 'pantry.example.com',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.link),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter server URL';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveUrl,
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Continue'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## Localization

### Handling Bilingual Content

All API responses contain both German (de) and English (en) fields. Use helper methods:

```dart
// Get current user locale
final locale = await StorageService.getUserLocale() ?? 'en';

// Use it with models
final recipe = await RecipeService.getRecipeById('123');
final title = recipe.getTitle(locale);  // Gets correct language
final description = recipe.getDescription(locale);

// For ingredients
for (final ingredient in recipe.ingredients) {
  final name = ingredient.getName(locale);
  print('$name: ${ingredient.amount} ${ingredient.unit}');
}
```

---

## Best Practices

### 1. Error Handling

```dart
try {
  final recipes = await RecipeService.getRecipes();
  // Handle success
} on ApiException catch (e) {
  if (e.statusCode == 401) {
    // Token expired, redirect to login
    await AuthService.logout();
    Navigator.pushReplacement(...);
  } else {
    // Show error message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(e.message)),
    );
  }
} catch (e) {
  // Network error or other
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Connection error: $e')),
  );
}
```

### 2. Image Handling

Images are served from the server:

```dart
// Full image URL
String getImageUrl(String? imagePath) {
  if (imagePath == null || imagePath.isEmpty) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return '${ApiConfig.baseUrl}$imagePath';
}

// Usage with CachedNetworkImage
CachedNetworkImage(
  imageUrl: getImageUrl(recipe.imageUrl),
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

### 3. Date Handling

Meal Planner uses ISO date strings (YYYY-MM-DD):

```dart
// Format date for API
String formatDateForApi(DateTime date) {
  return date.toIso8601String().split('T')[0];  // "2024-01-15"
}

// Get meal plans for a week
final startDate = formatDateForApi(DateTime.now());
final endDate = formatDateForApi(DateTime.now().add(Duration(days: 7)));

final url = '${ApiConfig.plannerUrl}?startDate=$startDate&endDate=$endDate';
final response = await ApiService.get(url);
```

### 4. Token Refresh

The JWT token is valid for 30 days. Handle expiration:

```dart
// Add interceptor (if using Dio)
dio.interceptors.add(
  InterceptorsWrapper(
    onError: (error, handler) async {
      if (error.response?.statusCode == 401) {
        // Token expired
        await AuthService.logout();
        // Navigate to login
      }
      return handler.next(error);
    },
  ),
);
```

### 5. Offline Support (Optional)

Consider implementing local caching:

```dart
// Use packages like:
// - sqflite for local database
// - hive for key-value storage
// - connectivity_plus to detect offline mode

// Example flow:
// 1. Try to fetch from API
// 2. On success, cache data locally
// 3. On network error, serve cached data
// 4. Sync changes when back online
```

---

## Testing the Connection

### Quick Test Script

```dart
// lib/test_api.dart
import 'config/api_config.dart';
import 'services/auth_service.dart';
import 'services/recipe_service.dart';

Future<void> testApi() async {
  try {
    // 1. Set base URL
    ApiConfig.setBaseUrl('https://your-pantry-url.com');

    // 2. Login
    print('Logging in...');
    await AuthService.login(
      username: 'your-username',
      password: 'your-password',
    );
    print('✓ Login successful');

    // 3. Fetch recipes
    print('Fetching recipes...');
    final recipes = await RecipeService.getRecipes();
    print('✓ Got ${recipes.length} recipes');

    // 4. Verify token
    print('Verifying token...');
    final isValid = await AuthService.verifyToken();
    print('✓ Token valid: $isValid');

    print('\n✓ All tests passed!');
  } catch (e) {
    print('✗ Error: $e');
  }
}
```

---

## Support & Documentation

- **API Documentation**: See `API.md` in the repository
- **API Overview**: GET request to `/api` endpoint returns all available endpoints
- **Server Setup**: Contact server administrator for URL and credentials

---

## Common Issues & Solutions

### Issue: "Base URL not set"
**Solution:** Make sure to call `ApiConfig.setBaseUrl()` before making any API calls.

### Issue: 401 Unauthorized
**Solution:** Token expired or invalid. Call `AuthService.logout()` and redirect to login.

### Issue: SSL Certificate Errors
**Solution:** For self-hosted servers with self-signed certificates:
```dart
// WARNING: Only for development!
class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
  }
}

// In main.dart
HttpOverrides.global = MyHttpOverrides();
```

### Issue: CORS errors
**Solution:** CORS is a browser issue, not mobile apps. If you see CORS errors, ensure you're testing on a real device/emulator, not web.

---

## Next Steps

1. Set up your Flutter project with the recommended packages
2. Implement the authentication flow (Setup → Login → Home)
3. Create service classes for each API endpoint
4. Build your UI screens using the data models
5. Test thoroughly with your Pantry server
6. Implement offline support if needed
7. Add image upload functionality for recipes and profile pictures

Good luck with your Pantry mobile app! 🎉
