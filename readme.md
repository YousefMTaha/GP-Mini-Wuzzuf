# Job Search App API

This is a backend API built using **Express.js** and **MongoDB** for a job search application. It provides authentication, user and company management, job handling, chat functionality, and scheduled tasks using **CRON jobs**.

## API Documentation

[Postman-Doc](https://documenter.getpostman.com/view/25674968/2sAYdhLB3X)



## Features

### Authentication
- User signup (with email verification and OTP)
- Google authentication (signup & login)
- Secure password handling using bcrypt
- JWT-based authentication (access & refresh tokens)
- OTP-based password reset

### Security Enhancements
- **Helmet** for setting secure HTTP headers
- **CORS** to allow cross-origin requests
- **Rate-Limiting** to prevent excessive API requests

### User Management
- Update user details (mobile number encryption included)
- Retrieve user profile data
- Upload/delete profile & cover pictures
- Soft delete user accounts

### Admin Management
- Manage users and companies (GraphQL support for fetching all data)
- Ban/unban users and companies
- Approve company registrations

### Company Management
- CRUD operations on company data
- Search companies by name
- Virtual population to fetch jobs related to a company

### Job Management
- CRUD operations on jobs
- Advanced filtering & pagination for job listings
- Job applications (with role-based access control)
- Real-time notifications via **Socket.IO** when applications are submitted
- Accept/reject applicants and send email notifications

### Chat System
- One-to-one chat between HR and applicants
- Real-time messaging with **Socket.IO**

### Task Scheduling
- **CRON job** to remove expired OTPs every 6 hours

---



## Running the app

Clone the project

```bash
  git clone https://github.com/YousefMTaha/Mini-Wuzzuf
```

Go to the project directory

```bash
  cd Mini-Wuzzuf
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```
