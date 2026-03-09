# Vehicle Management API (simple contract)

**Base URL:** `http://localhost:4000`

**Shared type (Vehicle):**
{
  "id": "string",                 // exactly 8 alphanumeric characters on create/update if provided
  "licensePlate": "string",      // uppercase letters, digits and '-' only
  "status": "Available" | "InUse" | "Maintenance",
  "createdAt": "ISO timestamp string"
}


---

## GET /vehicles
- Request: none
- Success: 200 OK
- Response body: Vehicle[] (array of vehicles)
Example:
[
  { "id": "v1", "licensePlate": "ABC-123", "status": "Available", "createdAt": "2025-10-01T09:00:00.000Z" }
]


---

## GET /vehicles/:id
- Request: none
- Success: 200 OK -> single Vehicle
- Not found: 404 -> { "error": "Vehicle not found" }
Example success:
{ "id": "v1", "licensePlate": "ABC-123", "status": "Available", "createdAt": "2025-10-01T09:00:00.000Z" }

---

## POST /vehicles

Request body (JSON):
- Required: { "licensePlate": "string" }
- Optional: { "id": "string" } — if omitted the server generates an id.
Headers: Content-Type: application/json
Success: 201 Created → created Vehicle
Validation errors: 400 Bad Request with JSON { "error": "..." }

Validation & notes:
licensePlate will be converted to uppercase by the server.
licensePlate format: only uppercase letters, digits and hyphen (/^[A-Z0-9-]+$/).
Error example: { "error": "Invalid licensePlate format. Use only uppercase letters, digits and hyphen (e.g. ABC-123 or ABC123)." }

If id is provided it must be exactly 8 alphanumeric chars (/^[A-Za-z0-9]{8}$/).
Error example: { "error": "Invalid id provided. Id must be exactly 8 letters or digits (e.g. A1B2C3D4)." }

Uniqueness errors:
{ "error": "licensePlate must be unique" }
{ "error": "id must be unique" }

Example request:
{ "id": "A1B2C3D4", "licensePlate": "NEW-123" }

Example success response (201):
{ "id": "A1B2C3D4", "licensePlate": "NEW-123", "status": "Available", "createdAt": "2025-10-25T12:00:00.000Z" }


---

## PATCH /vehicles/:id

Request body (JSON): any of { "id": "string", "licensePlate": "string", "status": "Available"|"InUse"|"Maintenance" }
Headers: Content-Type: application/json
Success: 200 OK → updated Vehicle
Errors: 400 Bad Request or 404 Not Found with { "error": "..." }

Validation & business rules
id change: must be exactly 8 alphanumeric chars and unique → error { "error": "Invalid id format. Id must be exactly 8 letters or digits." } or { "error": "id must be unique" }

licensePlate change: server uppercases and validates format and uniqueness → errors:
{ "error": "Invalid licensePlate format. Use only uppercase letters, digits and hyphen." }
{ "error": "licensePlate must be unique" }

Status transitions:
If moving from Maintenance you may only move to Available.
Error: { "error": "Vehicles in Maintenance can only move to Available" }

If setting to Maintenance, the server enforces the maintenance quota:
allowed = floor(total * MAINTENANCE_PERCENT / 100) (defaults: MAINTENANCE_PERCENT = 5)
allowed is also clamped with MIN_MAINTENANCE (default 0)

If quota exceeded, error example:
{
  "error": "Maintenance quota reached: 1 of 11 vehicles currently in Maintenance (max allowed: 1)"
}

Example request
{ "status": "InUse" }

Example success
{ "id":"v1","licensePlate":"ABC-123","status":"InUse","createdAt":"2025-10-01T09:00:00.000Z" }

---

## DELETE /vehicles/:id
Success: 204 No Content (no body)
Not allowed: 400 Bad Request → { "error": "Cannot delete vehicle while InUse or Maintenance" }
Not found: 404 → { "error": "Vehicle not found" }

---

## Error format
All errors respond with a JSON object:
{ "error": "human-friendly message" }

---

## Environment & config notes

Defaults: MAINTENANCE_PERCENT = 5, MIN_MAINTENANCE = 0. 
These can be overridden via environment variables for testing.
Server automatically uppercases licensePlate values before validation/storage.