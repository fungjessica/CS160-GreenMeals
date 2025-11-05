## 📦 Prerequisites

Before setting up the project, make sure you have the following installed:

1. **Node.js (v23.11.0)**  
   Verify installation:
   ```bash
   node --version
   ```

My version: `v23.11.0`

2. **npm (v10.9.2)**
   Verify:

   ```bash
   npm --version
   ```

   my version: `10.9.2`

3. **MySQL (v9.4.0)**
   Installed via Homebrew for macOS.
   Verify:

   ```bash
   mysql --version
   ```

   My version: `mysql  Ver 9.4.0 for macos14.7 on arm64 (Homebrew)`

---

## 🚀 Project Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd TooGoodToGo
git checkout muyi
```

---

### Step 2: Set Up MySQL Database

Step 2.0 
Make sure to go to CS160-GreenMeals/backend/database/cs160.sql

#### 2.1 Start the MySQL Server

```bash
brew services start mysql@8.0
```

#### 2.2 Log in to MySQL

```bash
mysql -u root -p
```

#### 2.3 Create and Load the Database

Inside the MySQL prompt:

```sql
DROP DATABASE IF EXISTS too_good_to_go;
CREATE DATABASE too_good_to_go;
USE too_good_to_go;
SOURCE cs160.sql;
```

> 💡 This imports all tables and sample data from the provided `cs160.sql` file.

Alternatively, run it as a single command in the terminal:

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS too_good_to_go; CREATE DATABASE too_good_to_go; USE too_good_to_go; SOURCE cs160.sql;"
```

#### 2.4 Verify Database

```sql
SHOW DATABASES;
USE too_good_to_go;
SHOW TABLES;
```

---

### Step 3: Configure Backend

From the root directory (where `server.js` is located):

```bash
npm install
```

#### 3.1 Update Database Credentials

Open `/backend/config/database.js` and update:

```javascript
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "YOUR_MYSQL_PASSWORD_HERE",
  database: "too_good_to_go",
});
```

---

### Step 4: Configure Frontend

Navigate to the frontend folder:

```bash
cd too-good-to-go-frontend
npm install
```

If Tailwind or PostCSS give errors, ensure dependencies are installed:

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
npx tailwindcss init -p
```

#### 4.1 Verify Tailwind Configuration

`tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

`src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## ▶️ Running the Application

You must run **both backend** and **frontend** servers.

### 🖥️ Terminal 1 – Backend

```bash
cd TooGoodToGo
npm start   # or node server.js
```

You should see:

```
✅ Server running on port 3001
📡 API available at http://localhost:3001/api
```

### 💻 Terminal 2 – Frontend

```bash
cd too-good-to-go-frontend
npm start
```

The browser should open automatically at:
👉 [http://localhost:3000](http://localhost:3000)

If you see **“Something is already running on port 3000”**, fix it with:

```bash
lsof -i :3000
kill -9 <PID>
```

or start on a different port:

```bash
PORT=3001 npm start
```

---

## 🐛 Troubleshooting

**Problem:** “Access denied for user 'root'@'localhost'”
✅ Check password in `server.js` and restart MySQL.

**Problem:** “Frontend stuck on Loading…”
✅ Ensure backend is running on port 3001 and API base URL matches.

**Problem:** “Port already in use”
✅ Run `lsof -i :3000` and `kill -9 <PID>`.

**Problem:** “Database already exists”
✅ Inside MySQL:

```sql
DROP DATABASE too_good_to_go;
```

**Problem:** Tailwind or PostCSS errors
✅ Ensure these packages are installed in devDependencies:

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

---

## 🧰 Project Structure

```
TooGoodToGo/
├── server.js
├── cs160.sql
├── package.json
│
└── too-good-to-go-frontend/
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── public/
    ├── package.json
    └── tailwind.config.js
```

---

## ✅ Quick Start

```bash
brew services start mysql@8.0
mysql -u root -p
# Inside MySQL:
DROP DATABASE IF EXISTS too_good_to_go;
CREATE DATABASE too_good_to_go;
USE too_good_to_go;
SOURCE cs160.sql;
npm install       # backend
npm start         # backend
cd too-good-to-go-frontend
npm install       # frontend
npm start         # frontend
```

```

---

```
