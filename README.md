# TraceIt | Campus Lost and Found Management System

TraceIt is a web-based campus lost and found management system designed to help students report lost belongings, share details of found items, and manage claims through a centralized platform.

The goal is to make it easier to reconnect lost belongings with their owners by organizing item reports and claim information in one place.

## Features

- **Lost Item Reporting:** Submit reports for belongings that have been lost on campus.
- **Found Item Reporting:** Publish details and photos of items that have been found.
- **Item Browsing:** Explore lost and found listings and view individual item details.
- **Claim Management:** Submit and track claims for reported items.
- **Notifications:** View notifications related to platform activity.
- **Item Matching:** Support the process of identifying potentially matching lost and found items.
- **User Authentication:** Sign-up and login functionality for users.
- **Admin Dashboard:** Administrative pages for managing reports, items, claims, users, and analytics.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite |
| Styling | CSS, Tailwind CSS |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcrypt |
| File Uploads | Multer |

## Project Structure

```text
TraceIt/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── claims.js
│   │   ├── items.js
│   │   └── notifications.js
│   ├── createAdmin.js
│   ├── database.js
│   ├── package.json
│   └── server.js
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   │   ├── admin/
│   │   ├── public/
│   │   └── student/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Ardra-venugopal/TraceIt.git
cd TraceIt
```

### 2. Install frontend dependencies

From the project root, run:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Configure the environment variables required by the backend, including `JWT_SECRET`, using a local `.env` file if the application is configured to load one.

Use a strong, private JWT secret. Never commit real credentials or secret keys to GitHub.

### 5. Start the backend

From the `backend` directory, run the start command defined in `backend/package.json`.

For example, if its start script is configured as `node server.js`:

```bash
npm start
```

### 6. Start the frontend

Open a second terminal at the project root:

```bash
npm run dev
```

Vite will display the local frontend address in the terminal, commonly `http://localhost:5173`.

Ensure the backend is running at the API address configured by the frontend.

## Security

- Keep environment files and credentials out of version control.
- Do not commit private database files or uploaded user data.
- Use secure passwords and a private JWT secret.
- Review access permissions before deploying the application publicly.

## Project Status

TraceIt is a student project focused on developing a centralized campus lost and found management platform. Refer to the source code for the current implementation and supported functionality.

## Repository

GitHub: https://github.com/Ardra-venugopal/TraceIt

---

**TraceIt**  
*Making lost and found reporting easier on campus.*