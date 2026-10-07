# Express.js Architecture and Project Setup Guide

An end-to-end guide for structuring, refactoring, and setting up a production-ready Express.js REST API with clean separation of concerns.

---

## 1. Introduction to Express.js

**Express.js** is a fast, minimal, and unopinionated web framework for Node.js. 

### Key Characteristics
* **Routing:** Maps HTTP methods and URLs to specific handler functions.
* **Middleware:** Modular functions that execute during the request-response cycle.
* **Unopinionated:** Express does not enforce a rigid folder structure, leaving architectural decisions to the developer.

```js
// Basic Hello World (hello.js)
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(3000);
```

To install Express:
```bash
npm install express
```

---

## 2. Architectural Evolution: Monolith to Modular

### Single-File Approach (Monolithic)
In basic setups, all routes and business logic reside in a single file:
* Logic and routing are tightly coupled.
* Difficult to read, maintain, test, and reuse code.
* Every new feature increases file complexity and length.

### Modular Architecture ("One Job Per File")
A proper project structure separates concerns into clear layers:
* `routes/`: Maps incoming HTTP request URLs and methods to controllers.
* `controllers/`: Contains the application business logic.
* `middleware/`: Handles reusable steps like logging, authentication, and error handling.
* `app.js`: Configures the application and wires components together.
* `server.js`: Handles environment configuration and starts the HTTP server.

---

## 3. Recommended Directory Structure

```text
my-api/
├── src/
│   ├── config/
│   │   └── db.js              # Database connection setup
│   ├── controllers/
│   │   └── user.controller.js # Handles request/response logic
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handling
│   │   └── logger.js          # Request logging
│   ├── models/
│   │   └── user.model.js      # Data models & DB access schemas
│   ├── routes/
│   │   └── user.routes.js     # Route definitions
│   ├── app.js                 # App configuration & assembly
│   └── server.js              # Server entry point & listener
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
└── package.json               # Node project manifest
```

---

## 4. Setting Up the Application

### Project Initialization & Dependencies
```bash
# Initialize Node.js project
npm init -y

# Install production dependencies
npm i express dotenv

# Install development dependencies
npm i -D nodemon
```

### Application Configuration (`src/app.js`)
`app.js` is responsible solely for creating, configuring, and assembling the Express application instance.

```js
const express = require('express');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global Middleware
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
```

### Server Entry Point (`src/server.js`)
`server.js` manages environment variables and starts the HTTP server listening on a port.

```js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

* **Why split `app.js` and `server.js`?** Separating app configuration from network listening makes the application easily testable with integration test suites (like Supertest) without opening active network ports.

---

## 5. Routing Basics & Input Handling

### RESTful Routing Mapping

| Method | Route | Purpose | HTTP Status |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | List all users | `200 OK` |
| **POST** | `/api/users` | Create a user | `201 Created` |
| **PUT** | `/api/users/:id` | Update a user | `200 OK` |
| **DELETE** | `/api/users/:id` | Remove a user | `204 No Content` |

### Extracting Request Input
* **`req.params`**: Path parameters (e.g., `/users/:id` $\rightarrow$ `req.params.id`).
* **`req.query`**: Query string parameters (e.g., `/users?page=2` $\rightarrow$ `req.query.page`).
* **`req.body`**: JSON payload parsed via `express.json()` middleware.

---

## 6. Modular Routes & Controllers

### Modular Router (`src/routes/user.routes.js`)
Keep routes "thin" by delegating execution to controller functions.

```js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');

router.get('/', ctrl.getUsers);
router.post('/', ctrl.createUser);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
```

### Controller Logic (`src/controllers/user.controller.js`)
Controllers receive `(req, res)`, process requests, interact with models/services, and respond with an explicit HTTP status code.

```js
const users = []; // In-memory fallback (replace with DB model)

exports.getUsers = (req, res) => {
  res.status(200).json(users);
};

exports.createUser = (req, res) => {
  const { name, email } = req.body;
  const user = { id: Date.now(), name, email };
  users.push(user);
  res.status(201).json(user);
};
```

* **Rule:** *Routes know the URLs; Controllers know the logic. Never mix the two.*

---

## 7. Middleware Concepts & Pipeline

### Middleware Function Anatomy
A middleware function takes `(req, res, next)` as parameters:
* Executes custom code.
* Modifies request and response objects.
* Ends the request-response cycle or calls `next()` to pass control down the pipeline.

```js
// Request Logger Middleware (src/middleware/logger.js)
module.exports = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass control to the next middleware
};

// Token Authentication Middleware (src/middleware/auth.js)
module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }
  req.user = { id: 101, role: 'admin' };
  next();
};
```

### Middleware Execution Order
Middleware runs sequentially from top to bottom. Order is critical:
1. Global Loggers & Body Parsers (`app.use(logger)`, `app.use(express.json())`)
2. Route Handlers (`app.use('/api/users', userRoutes)`)
3. 404 Route Not Found Handler
4. Global Error Handler (`app.use(errorHandler)`)

* **Warning:** Forgetting to call `next()` or send a response will leave the request hanging indefinitely.

---

## 8. Centralized Error Handling

Express identifies error-handling middleware by its four-parameter signature: `(err, req, res, next)`.

### Error Handler Implementation (`src/middleware/errorHandler.js`)
```js
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
};
```

### 404 Fallback in `app.js`
```js
// Catch-all 404 for unhandled routes (placed after registered routes)
app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  next(err); // Forwards error to error-handling middleware
});
```

---

## 9. End-to-End Request Lifecycle Trace

Tracing a `POST /api/users` request through the architectural pipeline:

1. **`server.js`**: Listens on `PORT` and hands the incoming HTTP request to `app`.
2. **`app.js`**: `express.json()` parses the JSON request payload into `req.body`.
3. **`logger.js`**: Logs `POST /api/users` to console and calls `next()`.
4. **`user.routes.js`**: Matches the `POST /` route mounted under `/api/users`.
5. **`user.controller.js`**: `createUser` extracts `name` and `email`, constructs the record, and saves it.
6. **Response**: Sends HTTP `201 Created` with the created JSON object back to the client.

---

## 10. Architectural Best Practices Summary

* **Thin Routes, Focused Controllers, Reusable Middleware.**
* **Secrets in `.env`:** Never commit API keys or database passwords; list `.env` in `.gitignore`.
* **API Versioning:** Prefix routes (e.g., `/api/v1/users`) to allow seamless future upgrades.
* **Input Validation:** Validate `req.body` using custom middleware before hitting controllers.
* **Appropriate HTTP Status Codes:** Use `200` (OK), `201` (Created), `400` (Bad Request), `401` (Unauthorized), `404` (Not Found), and `500` (Server Error).
* **Decouple Data Access:** Keep database queries inside model layers or dedicated service modules.
