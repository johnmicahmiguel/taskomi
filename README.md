# Two-Sided Marketplace Platform

A modern marketplace platform connecting business owners with contractors, featuring robust authentication, email verification, and interactive profile management.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Email Service**: SendGrid/Brevo integration
- **Authentication**: Session-based with OTP verification
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)

## Prerequisites

Before running this application locally, ensure you have:

- **Node.js** (version 20 or higher)
- **PostgreSQL** (version 16 or higher)
- **npm** or **yarn** package manager

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Session Secret
SESSION_SECRET=your_session_secret_key

# Application
NODE_ENV=development
PORT=5000
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE your_database_name;
   ```

4. **Configure environment variables**
   
   Copy the environment variables above into a `.env` file and update with your actual values.

5. **Push database schema**
   ```bash
   npm run db:push
   ```

6. **Seed the database (optional)**
   
   Run the seed script to populate with sample data:
   ```bash
   npx tsx seed-users.ts
   ```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server (integrated with backend)
- Hot reloading for both frontend and backend

### Production Mode

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes to PostgreSQL

## Database Management

The application uses Drizzle ORM for database management. Schema definitions are located in `shared/schema.ts`.

### Making Schema Changes

1. Modify the schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes to the database

### Database Structure

The application includes the following main tables:
- `users` - User accounts (business owners and contractors)
- `posts` - User posts and content
- `job_orders` - Job postings from businesses
- `likes` - Post interactions
- `comments` - Post comments
- `contact_submissions` - Contact form submissions
- `newsletter_subscriptions` - Newsletter signups
- `otp_verifications` - Email verification codes

## Features

### Authentication & Verification
- User registration with email verification
- OTP-based email verification system
- Session-based authentication
- Password hashing with bcrypt

### User Types
- **Business Owners**: Can post job orders, browse contractors
- **Contractors**: Can browse jobs, showcase skills and certifications

### Core Functionality
- User profiles with skills, certifications, and portfolios
- Social feed with posts, likes, and comments
- Job order management system
- Advanced search and filtering
- Email notifications via SendGrid

## API Endpoints

The application provides RESTful API endpoints:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `GET /api/users/profile` - Get user profile
- `GET /api/businesses` - List business owners
- `GET /api/contractors` - List contractors
- `POST /api/posts` - Create post
- `GET /api/posts` - Get posts
- `POST /api/job-orders` - Create job order
- `GET /api/job-orders` - Get job orders

## Folder Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/               # Backend Express application
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── email.ts          # Email service integration
├── shared/
│   └── schema.ts         # Database schema definitions
└── README.md
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Verify DATABASE_URL in `.env` file
   - Check database credentials and permissions

2. **Email verification not working**
   - Verify SENDGRID_API_KEY is correct
   - Check SendGrid account status and quotas

3. **Port already in use**
   - Change PORT in `.env` file or kill process using port 5000

4. **Dependencies issues**
   - Delete `node_modules` and run `npm install` again
   - Ensure Node.js version is 20 or higher

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that all required services (SendGrid) are properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details