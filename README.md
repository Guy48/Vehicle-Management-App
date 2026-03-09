# Vehicle Management App

**Author:** Guy Ashury  
**Email:** guy.ashury@mail.huji.ac.il

A compact full-stack TypeScript app to manage a fleet of vehicles.  
Users can view, add, edit, delete vehicles and change their status. 
The frontend is a React + TypeScript + Vite SPA, and the backend is a Node.js + Express + TypeScript REST API that persists data in a local JSON file.

## Project structure
```
vehicle-management/
├───backend
│   ├───data
│   ├───dist
│   └───src
│       ├───controllers
│       ├───routes
│       ├───services
│       ├───tests
│       └───types
├───frontend
│   ├───dist
│   └───src
│       ├───api
│       ├───components
│       │   ├───Modals
│       │   └───VehicleTable
│       └───test
└── README.md
```

## Features

### Core CRUD
- List all vehicles (columns: `id`, `licensePlate`, `status`, `createdAt`).
- Create a new vehicle (ID + license plate).
- Edit vehicle details (ID, license plate, status).
- Delete a vehicle (with confirmation).

### Status Management
- Status values: `Available`, `InUse`, `Maintenance`.
- New vehicles default to `Available`.
- Status can be changed via a dropdown in the table.

### Search / Filter / Sort
- Search by `id` or `licensePlate`.
- Filter vehicles by status (All / Available / InUse / Maintenance).
- Sort the list by `id`, `licensePlate`, `status`, or `createdAt`.
- Sorting direction can be toggled (ascending / descending).

### Validation & Business Rules
- Vehicle IDs must be exactly **8 alphanumeric characters** (`A–Z`, `0–9`).
- License plates may contain **uppercase letters, digits, and `-` only**.
- IDs and license plates must be **unique**.
- Vehicles with status `InUse` or `Maintenance` **cannot be deleted**.
- Vehicles in `Maintenance` can only transition back to `Available`.
- Maintenance quota: at most `floor(total * 0.05)` vehicles may be in `Maintenance`.
- Validation exists **both on the client and the server** for better UX and reliability.

### Quality & Tests
- Frontend tests implemented with **Vitest** and **React Testing Library**.
- Backend tests implemented with **Jest**.
- Clear error messages are shown to the user when actions violate validation rules.

---

## Architecture & Data

- **Frontend:** React + TypeScript + Vite.  
  The UI is component-based and uses modal dialogs for create, edit, delete, and error flows.

- **Backend:** Node.js + Express + TypeScript.  
  Organized into `routes → controllers → services`, where services contain the main business logic and file persistence.

- **Persistence:**  
  Vehicles are stored in `backend/data/vehicles.json`.

- **Seed Data:**  
  Example vehicles are provided in `backend/data/vehicles.seed.json`.

- **Development Helper:**  
  `POST /__reset_from_seed` resets the runtime data file from the seed file.

---

## Notes & Edge Cases

- **Small fleet behavior:**  
  Because the maintenance limit uses `floor(total * 0.05)`, fleets with fewer than about 20 vehicles may not allow any vehicles to be in `Maintenance`.

- **Deletion edge case:**  
  If the fleet is exactly at the maintenance cap (for example 1/20 vehicles) and a non-maintenance vehicle is deleted, the percentage of maintenance vehicles may temporarily exceed 5%.  
  The chosen design decision is to **allow the deletion** rather than blocking the action.

- **Persistence limitations:**  
  The JSON file storage is intentionally simple and suitable for a demo project. In a real production system, a database would be used instead.

---

## Contact & Disclosure

If you have questions about the project, feel free to contact me using the email listed in the repository.

Disclosure: Some AI tools were used to assist with parts of the implementation. However, the project design, architecture decisions, and final implementation were created and reviewed by me.

---

## Usage Instructions

1) Clone the repository:
```
git clone https://github.com/Guy48/Vehicle-Management-App.git
```
2) Prerequisites:
```
Node.js v16+ (includes npm).
```
Verify installation:
```
node -v
npm -v
```
If Node is not installed: 
- In Windows you can install with winget:
```
winget install OpenJS.NodeJS.LTS
```
- In macOS: you can install with Homebrew:
```
brew install node
```

3) Install dependencies:
Open a terminal and run the commands below from the project root:
```
cd backend
npm install
cd ../frontend
npm install
```

### Run start

Start both backend and frontend in separate terminal windows/tabs.
Terminal 1 (Backend):
```
cd backend
npm run build
npm run start
```
Terminal 2 (Frontend):
```
cd frontend
npm run build
npm run start
```
You may press o+enter in terminal 2 in order to open the UI.

### Run tests

There are tests in both backend and frontend.
You may run the following command once from /backend and once from /frontend:
```
npm run test
```
