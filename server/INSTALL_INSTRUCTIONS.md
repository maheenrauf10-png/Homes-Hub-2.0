# Installation Instructions

## Main Problem
The dependencies are not installed in the server directory. You need to install them before running the server.

## Solution

### Step 1: Open Terminal/Command Prompt
Navigate to the server directory:
```powershell
cd server
```

### Step 2: Install Dependencies
Run this command:
```powershell
npm install
```

This will install all the required packages:
- express
- mongoose
- cors
- dotenv
- bcrypt
- jsonwebtoken
- nodemon (dev dependency)

### Step 3: Verify Installation
After installation, you should see a `node_modules` folder in the server directory.

### Step 4: Start the Server
Once dependencies are installed, you can start the server:
```powershell
npm start
```

Or for development with auto-reload:
```powershell
npm run dev
```

## Alternative: Install from Root Directory

If you prefer, you can also install from the root directory:
```powershell
npm install --prefix server
```

## Expected Output After Installation

When you run `npm install`, you should see:
- Downloading packages
- Installing dependencies
- A `node_modules` folder created
- A `package-lock.json` file created

## Troubleshooting

If you get errors:
1. Make sure you have Node.js installed: `node --version`
2. Make sure you have npm installed: `npm --version`
3. Try deleting `package-lock.json` and `node_modules` (if exists) and run `npm install` again
4. Check your internet connection


