# HOMES HUB API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Routes (`/api/auth`)

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890" // optional
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user"
    }
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": { ... }
  }
  ```

### Get Current User
- **GET** `/api/auth/me`
- **Auth:** Required
- **Response:**
  ```json
  {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "favorites": [...]
    }
  }
  ```

### Update Profile
- **PUT** `/api/auth/me`
- **Auth:** Required
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "phone": "9876543210"
  }
  ```

### Add to Favorites
- **POST** `/api/auth/favorites/:propertyId`
- **Auth:** Required

### Remove from Favorites
- **DELETE** `/api/auth/favorites/:propertyId`
- **Auth:** Required

---

## Property Routes (`/api/properties`)

### Get All Properties
- **GET** `/api/properties`
- **Query Parameters:**
  - `purpose` - "buy" or "rent"
  - `type` - "house", "apartment", "commercial", "plot"
  - `location` - Location search string
  - `minPrice` - Minimum price
  - `maxPrice` - Maximum price
  - `beds` - Minimum number of bedrooms
  - `search` - Text search
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 20)
- **Example:**
  ```
  GET /api/properties?purpose=buy&type=apartment&minPrice=1&maxPrice=5&beds=2
  ```
- **Response:**
  ```json
  {
    "properties": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
  ```

### Get Single Property
- **GET** `/api/properties/:id`
- **Response:**
  ```json
  {
    "property": {
      "_id": "property_id",
      "title": "Modern Apartment",
      "location": "Lahore",
      "price": 2.5,
      "type": "apartment",
      "purpose": "buy",
      "beds": 3,
      "baths": 2,
      "area": "1200 sq. ft",
      "description": "...",
      "images": [...],
      "lat": 31.4812,
      "lng": 74.3274,
      "contactEmail": "owner@example.com",
      "postedBy": { ... },
      "views": 10,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

### Create Property
- **POST** `/api/properties`
- **Auth:** Required
- **Body:**
  ```json
  {
    "title": "Modern Apartment in DHA",
    "location": "Lahore, DHA Phase 5",
    "price": 2.5,
    "type": "apartment",
    "purpose": "buy",
    "beds": 3,
    "baths": 2,
    "area": "1200 sq. ft",
    "description": "Beautiful apartment...",
    "images": ["url1", "url2"],
    "lat": 31.4812,
    "lng": 74.3274,
    "contactEmail": "owner@example.com"
  }
  ```

### Update Property
- **PUT** `/api/properties/:id`
- **Auth:** Required (Owner or Admin)
- **Body:** Same as create (all fields optional)

### Delete Property
- **DELETE** `/api/properties/:id`
- **Auth:** Required (Owner or Admin)

### Get User's Properties
- **GET** `/api/properties/user/my-properties`
- **Auth:** Required
- **Response:**
  ```json
  {
    "properties": [...]
  }
  ```

---

## Contact Routes (`/api/contact`)

### Submit Contact Form
- **POST** `/api/contact`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "message": "I'm interested in..."
  }
  ```

### Contact Property Owner
- **POST** `/api/contact/property/:propertyId`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "message": "I'm interested in this property..."
  }
  ```

---

## Health Check

### Server Status
- **GET** `/api/health`
- **Response:**
  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "database": "Connected"
  }
  ```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. All timestamps are in ISO 8601 format
2. Prices are in PKR Crores (e.g., 2.5 = 2.5 Crore PKR)
3. JWT tokens expire after 7 days
4. Property views are automatically incremented when viewing a property
5. Text search uses MongoDB text indexing on title, location, and description


