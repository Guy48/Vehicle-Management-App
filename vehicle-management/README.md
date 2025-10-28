# Vehicle Management App

**Author:** Guy Ashury  
**Email:** guy.ashury@mail.huji.ac.il

A full-stack TypeScript project for managing vehicles — view, add, edit, delete, and change vehicle status with a small JSON-backed API and a modern React front-end.

## Overview
This project implements the Optibus assignment *Vehicle Management App*.  
It tracks vehicles and their statuses:
- Statuses: `Available`, `InUse`, `Maintenance`  
- Backend: Node.js + Express + TypeScript  
- Frontend: React + TypeScript + Vite  
- Storage: Local JSON file: `backend/data/vehicles.json`

## Project structure
vehicle-management/
├── backend/
│   ├── src/
│   └── data/vehicles.json
├── frontend/
│   ├── src/
│   └── test/
└── README.md

## Key features
- List all vehicles (id, license plate, status, createdAt)  
- Create / Read / Update / Delete vehicles (CRUD)  
- Status management (Available, InUse, Maintenance)  
- Client + server validations (unique id/license, format rules)  
- Business rules enforced:
  - Vehicles in `InUse` or `Maintenance` cannot be deleted.
  - Vehicles in `Maintenance` can only move back to `Available`.
  - **Maintenance quota:** at most **5%** of the fleet may be in `Maintenance` at the same time. The quota is calculated as `floor(total * 0.05)`; minimum allowed is **0**.  
    - Examples: `5 vehicles -> 0 allowed`, `20 vehicles -> 1 allowed`.
- Search, filter, and sort in the frontend UI
- Tests in both frontend and backend

## Deliverables (included)
- Full project source code (frontend + backend)
- `README.md` (this file)
- `backend/data/vehicles.json` (seed / persisted data)
- `backend/API.md` file
- Tests (frontend: Vitest, backend: Jest)

## Notes:
- There were some design choices that I would have made differently, for example:
    - The requirement that up to 5% of the vehicles in the DB can be in maintenance mode at the same time means that if there are 20 vehicles (or less) in the fleet, then no vehicle can be in maintenance. I debated whether to define that at least one vehicle can always be in maintenance, but I decided to stick to the instructions and define the program so that up to 5% of the vehicles can be in maintenance mode, means for fleet in size <=20 zero vehilces are allowed to be in maintenance.
    - There is an egde case when exactly 5% of vehicles are in maintenance, but now the user delete a car. In that point the program should either prevet the user from delete, or "bare" the situation of more then 5% that are in statues maintenance. I thought that the latter option makes more sense, but again - it's a design decision. 
- I tried to write the code so that it is divided into different files in a logical and orderly manner, so that it is easy to read, and I hope that the reader will agree with me.
- the code include tests as well (running inscruction as follows).
- If you have any questions, you are always welcome to contact me by the email mentioned above.
- I used AI tools in some of the code sections, since the instructions did not state that this was prohibited and because I do not have much experience working with the TS language. On the other hand, of course the program was still written by me, including design choices and the project structure.

----------

## Usage Instructions

You may clone the repository using: 
    git clone https://github.com/Guy48/Vehicle-Management-App.git

Prerequisites:
- Node.js (v16+) and npm

Make sure Node and npm are installed. Check versions:
    node -v
    npm -v
If Node is not installed use:
    brew install node

Install dependencies:
Open a terminal and run the commands below from the project root:
    cd backend
    npm install
    cd ../frontend
    npm install

# Run start
Start both backend and frontend in separate terminal windows/tabs.
Terminal 1 (Backend):
    cd backend
    npm run build
    npm run start
Terminal 2 (Frontend):
    cd frontend
    npm run build
    npm run start
You may press o+enter in terminal 2 in order to open the UI.

# Run tests
There are tests in both backend and frontend. 
You may run the following command once from /backend and once from /frontend:
    npm run test
