---
description: Repository Information Overview
alwaysApply: true
---

# TPQ Baitus Shuffah Information

## Summary

Sistem Informasi Manajemen TPQ Baitus Shuffah is a modern and integrated management system for Islamic education institutions, specifically designed for Tahfidz Qur'an schools. The system manages students (santri), Qur'an memorization tracking, attendance, and finances with modern technology. The project consists of a Next.js web application and two React Native mobile applications.

## Structure

- **src/app**: Next.js App Router with page components
- **src/components**: Reusable UI components organized by functionality
- **src/lib**: Utilities, API services, and business logic
- **src/contexts**: React context providers for state management
- **src/hooks**: Custom React hooks
- **prisma**: Database schema, migrations, and seed scripts
- **public**: Static assets and uploaded files
- **wali/**: React Native mobile app for parents
- **wali-santri-app/**: React Native mobile app for students

## Projects

### Web Application

#### Language & Runtime

**Language**: TypeScript
**Version**: TypeScript 5.x
**Framework**: Next.js 15.3.3 with React 19.0.0
**Build System**: Next.js build system
**Package Manager**: npm

#### Dependencies

**Main Dependencies**:

- Next.js 15.3.3 with App Router
- React 19.0.0
- Prisma ORM with MySQL
- next-auth for authentication
- Tailwind CSS for styling
- midtrans-client for payment processing
- cloudinary for file uploads
- chart.js and recharts for analytics
- react-hook-form and zod for form validation
- socket.io for real-time features

**Development Dependencies**:

- TypeScript 5.x
- ESLint 9.x
- Prisma CLI 5.22.0
- ts-node for TypeScript execution

#### Build & Installation

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with initial data
```

#### Database

**Type**: MySQL
**ORM**: Prisma 5.22.0
**Schema**: Comprehensive data model for Islamic education management
**Main Entities**:

- User (multi-role: Admin, Musyrif/Teacher, Parent)
- Santri (students)
- Halaqah (study groups)
- Hafalan (Qur'an memorization records)
- Attendance
- Payments and Transactions
- SPP (monthly fees)

### Mobile Applications

#### Language & Runtime

**Language**: TypeScript/JavaScript
**Framework**: React Native 0.79.5
**Build System**: Expo 53.0.17
**Package Manager**: npm

#### Dependencies

**Main Dependencies**:

- Expo 53.0.17
- React Native 0.79.5
- Expo Router for navigation
- React Navigation
- Expo modules (haptics, image, linking, etc.)

**Development Dependencies**:

- TypeScript 5.8.3
- ESLint 9.25.0
- Expo config plugins

#### Build & Installation

```bash
# Install dependencies
cd wali  # or wali-santri-app
npm install

# Start development server
npm start

# Build for specific platforms
npm run android
npm run ios
```

## Features

**Core Functionality**:

- Multi-role user system (Admin, Musyrif/Teacher, Parent)
- Student management with detailed profiles
- Qur'an memorization tracking and progress visualization
- Attendance management with QR code system
- Payment processing with Midtrans integration
- Donation system with multiple categories
- Real-time notifications
- Analytics dashboard with performance metrics
- PDF report generation
- AI-based progress prediction

**Frontend**:

- Responsive design with Tailwind CSS
- Custom UI components with Islamic design system
- Arabic typography support
- Interactive charts and data visualization
- Form validation with react-hook-form and zod

## API & Integration

**Internal API**: Next.js API routes for data operations
**External Services**:

- Midtrans: Payment gateway integration
- Cloudinary: File and image storage
- Twilio/WhatsApp: Messaging services
- Email service integration via nodemailer

## Authentication

**System**: next-auth with custom JWT implementation
**Methods**: Email/password, role-based access control
**Security**: Password hashing with bcryptjs

## Testing

**Linting**: ESLint for code quality
**Command**: `npm run lint`
