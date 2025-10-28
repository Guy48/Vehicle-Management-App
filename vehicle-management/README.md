
### Usage Instructions

# Install packages

Make sure Node and npm are installed. Check versions:
node -v
npm -v

If Node is not installed use:
brew install node

Open a terminal and run the commands below for each sub-project (backend and frontend). Run them from the project root (same folder that contains backend/ and frontend/).

cd backend
npm install

cd frontend
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

In the same way as in "run start", use the following:

cd backend
npm test

cd frontend
npm test