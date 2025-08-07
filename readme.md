# Mini Wuzzuf APIs

This is a backend API built using **Express.js** and **MongoDB** for Mini Wuzzuf. It provides authentication, user and company management, job handling, interview system, and scheduled tasks using **CRON jobs**.

## API Documentation

[Postman-Doc](https://documenter.getpostman.com/view/25674968/2sAYdmmTd4)

## Features

### Authentication

- User signup (with email verification and OTP)
- Google authentication (signup & login)
- Secure password handling using bcrypt
- JWT-based authentication (access & refresh tokens)
- OTP-based password reset
- Email change functionality with OTP verification

### Security Enhancements

- **Helmet** for setting secure HTTP headers
- **CORS** to allow cross-origin requests
- **Rate-Limiting** to prevent excessive API requests
- Mobile number encryption using crypto-js

### User Management

- Update user details (mobile number encryption included)
- Retrieve user profile data (own profile and other users)
- Upload/delete profile & cover pictures
- Soft delete user accounts
- Password change functionality
- Email change with OTP verification
- Account freeze/unfreeze functionality
- User logout functionality

### Company Management

- CRUD operations on company data
- Search companies by name
- Upload/delete company logo and cover pictures
- Get user's companies
- Company approval system (admin approval field exists)
- Company ban/unban functionality

### Job Management

- CRUD operations on jobs
- Advanced filtering & pagination for job listings
- Job applications with CV upload
- Role-based access control for job applications
- Get job applications for a specific job
- Handle job applications (accept/reject)
- Get application status for users
- Change application status
- Get company-specific jobs

### Interview System

- Add interview summary
- Get interview summary by job ID
- Get interview summary

### Task Scheduling

- **CRON job** to remove expired OTPs every 6 hours

### File Management

- Cloudinary integration for file uploads
- Support for image uploads (profile pictures, company logos)
- Support for document uploads (CVs)
- Automatic file cleanup and management

### Email System

- Nodemailer integration
- Email templates
- OTP delivery via email
- Password reset emails
- Email change verification

---

## API Endpoints

### Authentication (`/auth`)

- `POST /register` - User registration with OTP
- `POST /send-otp` - Send OTP for registration
- `POST /login` - User login
- `POST /refresh-token` - Refresh JWT token
- `POST /google-login` - Google authentication login
- `POST /google-signup` - Google authentication signup
- `POST /send-otp-forget-password` - Send OTP for password reset
- `POST /forget-password` - Reset password with OTP

### Users (`/users`)

- `PATCH /` - Update user details
- `PATCH /updatePass` - Update password
- `DELETE /` - Freeze account
- `GET /` - Get logged-in user data
- `GET /:id` - Get another user's data
- `PATCH /profile-pic` - Upload profile picture
- `DELETE /profile-pic` - Delete profile picture
- `PATCH /cover-pic` - Upload cover picture
- `DELETE /cover-pic` - Delete cover picture
- `POST /checkPasswordChangeEmail` - Check password change email
- `POST /sendOTP` - Send OTP for email change
- `POST /changeEmail` - Change email with OTP
- `POST /logout` - User logout

### Companies (`/companies`)

- `POST /` - Create company
- `GET /userCompanies` - Get user's companies
- `GET /search` - Search companies by name
- `PATCH /uploadCompanyLogo/:id` - Upload company logo
- `PATCH /uploadCompanyCoverPic/:id` - Upload company cover picture
- `DELETE /deleteCompanyLogo/:id` - Delete company logo
- `DELETE /deleteCompanyCoverPic/:id` - Delete company cover picture
- `GET /:id` - Get company details
- `DELETE /:id` - Delete company
- `PATCH /:id` - Update company

### Jobs (`/jobs`)

- `POST /add/:id` - Add job to company
- `PATCH /:id` - Update job
- `DELETE /:id` - Delete job
- `POST /apply/:id` - Apply for job with CV
- `GET /filter` - Filter jobs
- `GET /getJobApplications/:id` - Get job applications
- `POST /handle-application/:id` - Handle job application
- `GET /application-status/:jobId` - Get application status
- `PATCH /change-application-status/:jobId` - Change application status
- `GET /:jobId?` - Get company jobs

### Interviews (`/interviews`)

- `POST /:jobId` - Add interview summary
- `GET /interview/:jobId` - Get interview summary by job ID
- `GET /:jobId` - Get interview summary

---

## Running with Docker

### Prerequisites

- Docker installed on your system

### Using Docker

1. **Build the Docker image**

   ```bash
   docker build . -t mini_wuzzuf
   ```

2. **Run the container**

   ```bash
   docker run -d --name wuzzuf -p 3000:3000 mini_wuzzuf
   ```

3. **View logs**

   ```bash
   docker logs wuzzuf -f
   ```

4. **Stop the container**

   ```bash
   docker stop wuzzuf
   ```

5. **Remove the container**
   ```bash
   docker rm wuzzuf
   ```

### Docker Commands Reference

- **Build and run in one command:**

  ```bash
  docker build . -t mini_wuzzuf && docker run -d --name wuzzuf -p 3000:3000 mini_wuzzuf
  ```

- **Remove existing container and run new one:**

  ```bash
  docker rm wuzzuf && docker run -d --name wuzzuf -p 3000:3000 mini_wuzzuf
  ```

- **Access the application:**
  - The API will be available at `http://localhost:3000`
  - try to access this url `http://localhost:3000/health` with method `GET` to see the api is running or not

### Environment Variables

The Dockerfile includes all necessary environment variables for:

- Database connection (MongoDB)
- JWT secrets
- Email configuration
- Google OAuth
- Cloudinary configuration

**Note:** For production deployment, consider using Docker secrets or environment files instead of hardcoded values in the Dockerfile.

---
