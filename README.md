

## 📦 Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **MySQL** (v8 or higher)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Verify: `mysql --version`

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

---

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <your-repository-url>
cd TooGoodToGo

# Or download and extract the ZIP file
```

### Step 2: Set Up the Database

#### 2.1 Start MySQL
```bash
# On Mac
sudo /usr/local/mysql/support-files/mysql.server start

# On Windows
net start MySQL80

# Or use MySQL Workbench GUI
```

#### 2.2 Create Database and Tables
1. Open **MySQL Workbench** or use command line:
   ```bash
   mysql -u root -p
   ```

2. Run the `database_schema.sql` file:
   - **In MySQL Workbench**: 
     - File → Open SQL Script → Select `database_schema.sql`
     - Click Execute (⚡ icon)
   
   - **In Command Line**:
     ```bash
     mysql -u root -p < database_schema.sql
     ```

3. Verify database was created:
   ```sql
   SHOW DATABASES;
   USE too_good_to_go;
   SHOW TABLES;
   ```

#### 2.3 Update Database Password
Open `server.js` and update line 49 with YOUR MySQL password:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_MYSQL_PASSWORD_HERE', // ⚠️ CHANGE THIS!
  database: 'too_good_to_go',
  // ...
});
```

### Step 3: Install Backend Dependencies

```bash
# Navigate to backend folder (root directory with server.js)
npm install express mysql2 cors bcrypt jsonwebtoken axios
```

**What these do:**
- `express` - Web server framework
- `mysql2` - MySQL database connector
- `cors` - Allows frontend to connect to backend
- `bcrypt` - Password encryption
- `jsonwebtoken` - User authentication tokens
- `axios` - Makes HTTP requests to Yelp API

### Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd too-good-to-go-frontend

# Install dependencies
npm install lucide-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 4.1 Configure Tailwind
Create/update `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Update `src/index.css` (add to the top):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## ▶️ Running the Application

You need to run BOTH the backend and frontend servers.

### Terminal 1 - Backend Server

```bash
# From root directory (where server.js is located)
node server.js

# You should see:
# ✅ Server running on port 3001
# 📡 API available at http://localhost:3001/api
```

### Terminal 2 - Frontend Server

```bash
# From frontend directory
cd too-good-to-go-frontend
npm start

# Browser will automatically open at http://localhost:3000
```

**✅ Success!** You should now see the login screen.

---

## 📁 Project Structure

```
TooGoodToGo/
├── server.js                      # Backend API server
├── database_schema.sql            # Database setup script
├── package.json                   # Backend dependencies
│
└── too-good-to-go-frontend/
    ├── src/
    │   ├── App.js                 # Main React application
    │   ├── index.js               # React entry point
    │   └── index.css              # Tailwind CSS
    ├── public/
    ├── package.json               # Frontend dependencies
    └── tailwind.config.js         # Tailwind configuration
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "555-1234",
  "role": "customer",           // or "restaurant"
  "restaurantId": 1             // only if role is "restaurant"
}

Response: { token, user }
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token, user }
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { user, dietaryRestrictions }
```

### Customer Endpoints

#### Search Restaurants
```http
GET /api/restaurants/search?latitude=37.3382&longitude=-121.8863&radius=10&restrictionIds=1,2
Authorization: Bearer <token>

Response: [ { id, name, address, distance, ... } ]
```

#### Get Restaurant Menu
```http
GET /api/restaurants/:restaurantId/menu?restrictionIds=1,2
Authorization: Bearer <token>

Response: [ { id, name, price, dietaryCompliance, ... } ]
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": 1,
  "foodItems": [
    { "foodId": 1, "quantity": 2, "price": 10.99 }
  ],
  "pickupSlotId": 5,
  "totalAmount": 21.98
}

Response: { orderId, message }
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <token>

Response: [ { id, restaurant_name, items, status, ... } ]
```

### Restaurant Owner Endpoints

#### Get Inventory
```http
GET /api/restaurant/inventory
Authorization: Bearer <token>

Response: [ { id, name, price, available_quantity, ... } ]
```

#### Add Food Item
```http
POST /api/restaurant/foods
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Veggie Wrap",
  "description": "Fresh vegetables",
  "price": 8.99,
  "discount_percent": 50,
  "available_quantity": 10,
  "pickup_start": "17:00:00",
  "pickup_end": "20:00:00",
  "dietary_restriction_ids": [1, 7]
}

Response: { message, foodId }
```

#### Get Restaurant Orders
```http
GET /api/restaurant/orders
Authorization: Bearer <token>

Response: [ { id, customer_name, items, status, ... } ]
```

#### Update Order Status
```http
PATCH /api/restaurant/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"  // pending, confirmed, ready, completed, cancelled
}

Response: { message }
```

---

## 👤 Test Accounts

### Customer Account
- **Email:** `customer@test.com`
- **Password:** Any password (bcrypt hash in DB accepts anything for testing)
- **Role:** Customer

### Restaurant Owner Accounts
- **Email:** `owner@greenplate.com`
- **Restaurant ID:** 1 (Green Plate Cafe)
- **Password:** Any password

- **Email:** `owner@pastaparadise.com`
- **Restaurant ID:** 2 (Pasta Paradise)
- **Password:** Any password

> **Note:** For production, you'll need to register with proper passwords that will be hashed by bcrypt.

---

## 🐛 Troubleshooting

### Problem: Backend won't start
**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- Update MySQL password in `server.js` line 49
- Make sure MySQL server is running
- Try connecting via MySQL Workbench to verify credentials

### Problem: Frontend shows "Network Error"
**Solution:**
- Make sure backend is running on port 3001
- Check `API_BASE_URL` in `App.js` (should be `http://localhost:3001/api`)
- Check CORS settings in `server.js`

### Problem: Tailwind CSS not working
**Solution:**
```bash
# Make sure these files exist:
tailwind.config.js
postcss.config.js

# Make sure index.css has:
@tailwind base;
@tailwind components;
@tailwind utilities;

# Restart the frontend server
npm start
```

### Problem: Database tables don't exist
**Solution:**
```bash
# Run the SQL script again
mysql -u root -p < database_schema.sql

# Or in MySQL Workbench:
# File → Open SQL Script → Execute
```

### Problem: Yelp API returns error
**Solution:**
- The Yelp API key is already included in `server.js`
- If it's expired, get a new one from: https://www.yelp.com/developers
- Update `YELP_API_KEY` in `server.js` line 43

### Problem: Port already in use
**Backend:**
```javascript
// Change port in server.js (last line)
const PORT = process.env.PORT || 3002; // Changed from 3001
```

**Frontend:**
```bash
# Create .env file in frontend folder
PORT=3002
```

---

## 📝 Important Notes for Team Members

### Working with the Code

1. **Always run database setup first** before starting servers
2. **Run backend BEFORE frontend** so API is available
3. **Don't commit passwords** - add `server.js` to `.gitignore` or use environment variables
4. **Test with both roles** - customer and restaurant owner have different views
5. **Check console for errors** - both browser console (F12) and terminal

### Making Changes

#### Adding a New API Endpoint:
1. Add route in `server.js`
2. Use `authenticateToken` middleware if authentication required
3. Use `isRestaurantOwner` if restaurant-only endpoint
4. Test with Postman or browser first

#### Modifying Database:
1. Update `database_schema.sql`
2. Drop and recreate database
3. Update affected API endpoints in `server.js`
4. Update frontend components that use the data

#### Adding Frontend Features:
1. Modify `App.js` components
2. Make sure to include authentication token in fetch requests
3. Handle loading and error states
4. Test both customer and restaurant views

---

## 🔒 Security Notes

**For Development:**
- Passwords in test accounts are hashed but simple for testing
- JWT secret is hardcoded (line 41 in server.js)
- CORS allows all origins from localhost:3000

**For Production, you MUST:**
- Use environment variables for secrets (`.env` file)
- Use strong JWT secret key
- Implement proper CORS restrictions
- Add rate limiting
- Enable HTTPS
- Validate all user inputs
- Add SQL injection protection
- Implement proper error handling

---

## 👥 Team Members

- Nguyen Nguyen
- Muyi Lin
- Jessica Fung  
- Yeng Her

---

## 📞 Support

If you encounter any issues:
1. Check this README troubleshooting section
2. Review server.js comments for API details
3. Check browser console (F12) for frontend errors
4. Check terminal for backend errors
5. Ask team members on Slack/Discord

---

## 🎯 Next Steps / Future Improvements

- [ ] Add password reset functionality
- [ ] Implement real-time notifications (WebSocket)
- [ ] Add payment integration (Stripe)
- [ ] Upload photos for food items
- [ ] Customer reviews and ratings
- [ ] Email confirmations
- [ ] Mobile responsive design improvements
- [ ] Restaurant analytics dashboard
- [ ] Push notifications for order updates

---

## 📄 License

This project is for educational purposes as part of CS160 coursework.

---

**Happy Coding! 🚀**