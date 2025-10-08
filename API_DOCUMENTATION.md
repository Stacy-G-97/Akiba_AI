# Akiba AI API Documentation

This document provides comprehensive documentation for all API endpoints in the Akiba AI application.

## Base URL

All API endpoints are relative to: `/api`

## Authentication

All endpoints require a `userId` parameter to identify the user making the request. In production, this should be replaced with proper JWT authentication using Supabase Auth.

## Common Response Formats

### Success Response
```json
{
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Inventory API

### GET /api/inventory

Retrieve all inventory items for a user.

**Query Parameters:**
- `userId` (required): User identifier

**Example Request:**
```
GET /api/inventory?userId=abc123
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Sukuma Wiki",
      "category": "Vegetables",
      "quantity": 25,
      "unit": "bunches",
      "cost": 500,
      "expiry_date": "2025-01-17",
      "status": "good",
      "user_id": "abc123",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Missing userId parameter
- `500`: Database or server error

---

### POST /api/inventory

Create a new inventory item.

**Request Body:**
```json
{
  "userId": "abc123",
  "name": "Tomatoes",
  "category": "Vegetables",
  "quantity": 15,
  "unit": "kg",
  "cost": 1200,
  "expiry_date": "2025-01-20",
  "status": "good"
}
```

**Field Validations:**
- `name`: Required, non-empty string
- `category`: Required, string
- `quantity`: Required, non-negative number
- `unit`: Required, string
- `cost`: Required, non-negative number
- `status`: Required, one of: "good", "warning", "critical"
- `expiry_date`: Optional, valid date string

**Success Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Tomatoes",
    "category": "Vegetables",
    "quantity": 15,
    "unit": "kg",
    "cost": 1200,
    "expiry_date": "2025-01-20",
    "status": "good",
    "user_id": "abc123",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing userId or validation errors
- `500`: Database or server error

---

### PUT /api/inventory

Update an existing inventory item.

**Request Body:**
```json
{
  "id": "uuid",
  "userId": "abc123",
  "name": "Tomatoes",
  "category": "Vegetables",
  "quantity": 10,
  "unit": "kg",
  "cost": 800,
  "expiry_date": "2025-01-20",
  "status": "warning"
}
```

**Field Validations:** Same as POST

**Success Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Tomatoes",
    "category": "Vegetables",
    "quantity": 10,
    "unit": "kg",
    "cost": 800,
    "expiry_date": "2025-01-20",
    "status": "warning",
    "user_id": "abc123",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T11:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing id/userId or validation errors
- `500`: Database or server error

---

### DELETE /api/inventory

Delete an inventory item.

**Query Parameters:**
- `id` (required): Item identifier
- `userId` (required): User identifier

**Example Request:**
```
DELETE /api/inventory?id=uuid&userId=abc123
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400`: Missing id or userId parameter
- `500`: Database or server error

---

## Predictions API

### GET /api/predictions

Retrieve demand predictions for a user.

**Query Parameters:**
- `userId` (required): User identifier
- `activeOnly` (optional): If "true", only return predictions that haven't expired

**Example Request:**
```
GET /api/predictions?userId=abc123&activeOnly=true
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "item_name": "Chapati",
      "predicted_demand": 45,
      "confidence_score": 89,
      "recommendation": "Order 15 more units",
      "factors": ["30% weather boost", "15% event impact"],
      "timeframe_days": 3,
      "user_id": "abc123",
      "created_at": "2025-01-15T10:00:00Z",
      "expires_at": "2025-01-18T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Missing userId parameter
- `500`: Database or server error

---

### POST /api/predictions

Create a new demand prediction.

**Request Body:**
```json
{
  "userId": "abc123",
  "item_name": "Mandazi",
  "predicted_demand": 30,
  "confidence_score": 92,
  "recommendation": "Consider ordering 10 more units",
  "factors": ["Weekend pattern", "Weather impact"],
  "timeframe_days": 3
}
```

**Field Validations:**
- `item_name`: Required, non-empty string
- `predicted_demand`: Required, non-negative number
- `confidence_score`: Required, number between 0 and 100
- `recommendation`: Required, string
- `factors`: Optional, array
- `timeframe_days`: Required, number between 1 and 365

**Success Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "item_name": "Mandazi",
    "predicted_demand": 30,
    "confidence_score": 92,
    "recommendation": "Consider ordering 10 more units",
    "factors": ["Weekend pattern", "Weather impact"],
    "timeframe_days": 3,
    "user_id": "abc123",
    "created_at": "2025-01-15T10:00:00Z",
    "expires_at": "2025-01-18T10:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing userId or validation errors
- `500`: Database or server error

---

### DELETE /api/predictions

Delete a prediction.

**Query Parameters:**
- `id` (required): Prediction identifier
- `userId` (required): User identifier

**Example Request:**
```
DELETE /api/predictions?id=uuid&userId=abc123
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400`: Missing id or userId parameter
- `500`: Database or server error

---

## Sync Queue API

### GET /api/sync

Retrieve sync queue items for a user.

**Query Parameters:**
- `userId` (required): User identifier
- `unsyncedOnly` (optional): If "true", only return items that haven't been synced

**Example Request:**
```
GET /api/sync?userId=abc123&unsyncedOnly=true
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "data_type": "inventory",
      "data_payload": {...},
      "operation": "create",
      "synced": false,
      "user_id": "abc123",
      "created_at": "2025-01-15T10:00:00Z",
      "synced_at": null
    }
  ]
}
```

**Error Responses:**
- `400`: Missing userId parameter
- `500`: Database or server error

---

### POST /api/sync

Add an item to the sync queue.

**Request Body:**
```json
{
  "userId": "abc123",
  "data_type": "inventory",
  "data_payload": {
    "name": "Tomatoes",
    "quantity": 15
  },
  "operation": "create"
}
```

**Field Validations:**
- `data_type`: Required, one of: "inventory", "prediction", "sale", "waste"
- `data_payload`: Required, object
- `operation`: Required, one of: "create", "update", "delete"

**Success Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "data_type": "inventory",
    "data_payload": {...},
    "operation": "create",
    "synced": false,
    "user_id": "abc123",
    "created_at": "2025-01-15T10:00:00Z",
    "synced_at": null
  }
}
```

**Error Responses:**
- `400`: Missing userId or validation errors
- `500`: Database or server error

---

### PUT /api/sync

Update sync status of a queue item.

**Request Body:**
```json
{
  "id": "uuid",
  "userId": "abc123",
  "synced": true
}
```

**Field Validations:**
- `id`: Required, string
- `userId`: Required, string
- `synced`: Required, boolean

**Success Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "data_type": "inventory",
    "data_payload": {...},
    "operation": "create",
    "synced": true,
    "user_id": "abc123",
    "created_at": "2025-01-15T10:00:00Z",
    "synced_at": "2025-01-15T11:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid types
- `500`: Database or server error

---

## Input Sanitization

All string inputs are sanitized to prevent XSS attacks:
- Leading and trailing whitespace is trimmed
- HTML tags (`<`, `>`) are removed
- Inputs are validated before processing

## Rate Limiting

In production, implement rate limiting per user to prevent abuse:
- Recommended: 100 requests per minute per user
- Use middleware or API gateway for enforcement

## Error Handling

All endpoints implement consistent error handling:
- Input validation errors return 400 status
- Server errors return 500 status with generic message
- Detailed error messages logged server-side only

## Security Best Practices

1. Always use HTTPS in production
2. Implement proper JWT authentication
3. Enable CORS only for trusted domains
4. Use prepared statements (handled by Supabase)
5. Implement rate limiting
6. Log all security-relevant events
7. Regular security audits

## Testing

See the test files for comprehensive test coverage:
- `tests/api.test.ts` - API endpoint tests
- `tests/validation.test.ts` - Input validation tests
- `tests/integration.test.ts` - Integration tests
