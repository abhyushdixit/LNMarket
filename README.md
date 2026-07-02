# 🛒 LNMarket — Real-Time Campus Marketplace

[![Live Site](https://img.shields.io/badge/Live-Demo-cyan?style=for-the-badge&logo=vercel)](https://lnm-market.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-purple?style=for-the-badge)](https://lnm-market.vercel.app)

LNMarket is a full-stack, peer-to-peer web application designed to let college students securely buy, sell, and negotiate items within their campus network. Built using the MERN stack, the platform integrates cloud asset storage, real-time communication protocols, and strict institutional email verification.

🔗 Live Production Deployment: https://lnm-market.vercel.app

---

## 🚀 Core Features

* 🔐 Secure Institutional Onboarding: User registration is strictly filtered using regex checks matching campus handles (@lnmiit.ac.in), paired with active transactional verification links dispatched via Nodemailer.
* 📸 Cloud Asset Upload Pipeline: Sellers can upload up to 5 pictures simultaneously. Images pass through a specialized Multer storage engine that optimizes and processes them directly via Cloudinary.
* 🧭 Split-View Detail Panel & Carousel: Buyers can review an interactive image carousel and full item specifics alongside an integrated messaging frame on a single screen.
* 💬 Live Negotiation Gateway: Instant real-time bargaining interfaces initialized via Socket.io rooms unique to each product-buyer pair.
* 🔴 Site-Wide Unread Telemetry: Automated notification badges synchronized across all application paths via state elevation inside React Context, paired with automatic cyan tracking dots on active chat logs.
* 🧹 Intelligent Cascading Cleanups: Wiping an active listing document automatically performs a regular expression data clean, scrubbing all dependent message records from MongoDB collections.

---

## 🏗️ Architecture & Directory Tree

The platform uses a monorepo workspace arrangement separating the decoupled client-side layer and server-side engine:

* backend/ — Express REST API & Socket.io Engine
  * middleware/ — Token validation interceptors
  * models/ — Mongoose Database Schemas (User, Listing, Message)
  * .env — Server configuration secrets (Ignored by Git)
  * server.js — Main API router and connection hub
* frontend/ — Vite + React Client App
  * src/
    * components/ — Modular layouts (Header, ListingCard, Chat)
    * context/ — Global Auth & Notification Context wrappers
    * pages/ — Routed Screen Frames (Home, AuthPage, AddListing, Inbox)
  * index.html
  * tailwind.config.js
  * vite.config.js
* .gitignore — Root protection schema

---

## 🛠️ Tech Stack

* Frontend: React (Hooks, Context API), Tailwind CSS, React Router DOM, Vite, Axios, Socket.io-Client
* Backend: Node.js, Express.js, Socket.io, JSON Web Tokens (JWT), BcryptJS
* Database & Storage: MongoDB (Mongoose ODM), Cloudinary Storage Pipeline
* Utilities: Multer, Nodemailer, Crypto API
* Deployment: Vercel (Frontend), Render/AWS/Heroku (Backend Pipeline)

---

## 🚦 Local Installation & Setup

To deploy the application framework locally on your system, execute the setup guide below:

### 1. Prerequisites
Ensure you have Node.js and MongoDB (Local or Atlas Cluster string) installed.

### 2. Configure Backend Secrets
Navigate into your /backend folder, create a file named .env, and populate these parameters:

* PORT = 5000
* MONGO_URI = your_mongodb_connection_string
* JWT_SECRET = your_custom_jwt_secret_key
* EMAIL_USER = your_gmail_address_for_nodemailer
* EMAIL_PASS = your_gmail_app_password
* CLOUDINARY_CLOUD_NAME = your_cloudinary_name
* CLOUDINARY_API_KEY = your_cloudinary_api_key
* CLOUDINARY_API_SECRET = your_cloudinary_api_secret
* APP_URL = https://lnm-market.vercel.app
* ADMIN_EMAIL = admin@lnmiit.ac.in

### 3. Install Dependencies & Launch
Open two split command terminal windows to execute both processes concurrently:

* To run the Server Node Pipeline:
  * cd backend
  * npm install
  * npm start

* To run the Vite Frontend Application:
  * cd frontend
  * npm install
  * npm run dev

Open your web browser and target http://localhost:5173 to test the sandbox workflow across multiple user profiles!
