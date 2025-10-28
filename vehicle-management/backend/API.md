# Vehicle Management API (simple contract)

Base URL: http://localhost:4000

Shared type (Vehicle):
{
  "id": "string",
  "licensePlate": "string",
  "status": "Available" | "InUse" | "Maintenance",
  "createdAt": "ISO timestamp string"
}

---

## GET /vehicles
- Request: none
- Success: 200 OK
- Response body: array of Vehicle
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
- Request body (JSON): { "licensePlate": "string" }
- Success: 201 Created -> created Vehicle (backend must set `status` = "Available" and `createdAt`)
- Validation error: 400 Bad Request -> { "error": "licensePlate is required" } or { "error":"licensePlate must be unique" }
Example request:
{ "licensePlate": "NEW-123" }
Example success response (201):
{ "id": "v6", "licensePlate": "NEW-123", "status": "Available", "createdAt": "2025-10-25T12:00:00.000Z" }

---

## PATCH /vehicles/:id
- Request body (JSON): any of { "licensePlate": "string", "status": "Available"|"InUse"|"Maintenance" }
- Success: 200 OK -> updated Vehicle
- Validation errors (400):
  - Illegal status transition -> { "error": "Invalid status transition" }
  - Maintenance cap -> { "error": "Maintenance quota reached: M of N vehicles currently in Maintenance (max allowed: X)" }
Example request:
{ "status": "InUse" }
Example success response:
{ "id":"v1","licensePlate":"ABC-123","status":"InUse","createdAt":"2025-10-01T09:00:00.000Z" }

---

## DELETE /vehicles/:id
- Success: 204 No Content (no body)
- Not allowed: 400 Bad Request -> { "error": "Cannot delete vehicle while InUse or Maintenance" }
- Not found: 404 -> { "error": "Vehicle not found" }

---

## Error format (always)
For errors return a JSON object like:
{ "error": "human-friendly message" }
