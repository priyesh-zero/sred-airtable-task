# 🧩 Airtable Integration App

This full-stack project integrates with the **Airtable API**, allowing OAuth authentication and data retrieval for bases, tables, pages (tickets), and users.  
It uses **Angular** for the frontend and **Node.js/Express** with **MongoDB** for the backend.

---

## 📁 Project Structure

```
SRED-AIRTABLE-TASK/
├── backend/       → Node.js + Express + MongoDB
├── frontend/      → Angular 19 UI (Material)
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js v22+
- Docker
- if you want you can have MongoDB running locally or in the cloud

### Environment

Create a `.env` file inside `backend/`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/airtable
AIRTABLE_CLIENT_ID=############################################
AIRTABLE_CLIENT_SECRET=****************************************
AIRTABLE_CALLBACK_URL=http://localhost:3000/auth/airtable/callback
JWT_SECRET=****************************************************
CLIENT_URL=http://localhost:4200

```

### Run complete stack

```
docker compose up -d
```

## 🚀 Backend Setup (Node.js + Express)

### Install and Run

```bash
cd backend
npm install
npm run dev
```

Backend will start on: `http://localhost:3000`


## 🌐 Frontend Setup (Angular)

### Prerequisites

- Angular CLI v19+
- Node.js v22+

### Install and Run

```bash
cd frontend
npm install
ng serve
```

App will run at: `http://localhost:4200`

### Build for Production

```bash
ng build
```

## 🔗 Airtable API Integration

OAuth2 flow is implemented to authenticate with Airtable and access the following endpoints:

- **Bases**: `/meta/bases`
- **Tables**: `/meta/bases/:baseId/tables`
- **Tickets (Pages)**: `/:baseId/:tableId`
- **Users**: `/Users`

Key features:

- Secure Airtable authentication
- Airtable API pagination support
- Tickets/pages are stored in a MongoDB collection


## 🔍 Custom Revision History Scraper

A custom scraper is implemented to fetch **Revision History** (Changelog) from Airtable:

- Fetches HTML response from `/readRowActivitiesAndComments`
- Parses and extracts:
  - **Assignee changes**
  - **Status updates**
- Automatically retrieves cookies needed for this endpoint
- Validates cookies and refreshes if expired
- Supports MFA code input from the frontend
- Stores structured changelog data in MongoDB
- Tested with 200+ Airtable pages for reliability

---

## 🛡️ Tech Stack

- **Frontend**: Angular 19, Angular Material
- **Backend**: Node.js, Express, Axios, Mongoose
- **Database**: MongoDB
- **Auth**: Airtable OAuth2

---

## 👨‍💻 Developer Notes

### Custom Revision History Scraper

A custom scraper is implemented to fetch **Revision History** (Changelog) from Airtable:

- Fetches HTML response from `/readRowActivitiesAndComments`
- Parses and extracts:
  - **Assignee changes**
  - **Status updates**
- Automatically retrieves cookies needed for this endpoint
- Validates cookies and refreshes if expired
- Supports MFA code input from the frontend
- Stores structured changelog data in MongoDB
- Tested with 200+ Airtable pages for reliability

---

## Task

[Task Details](./assets/task-three.pdf)

