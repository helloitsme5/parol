# SecureCheck - Password Exposure Monitoring Platform

## Overview

SecureCheck is a full-stack web application designed to help users check if their credentials have been exposed in data breaches. The platform provides a secure interface for searching breach databases and offers administrative capabilities for processing and managing large-scale breach data files. Built as a modern web application, it combines a React frontend with an Express.js backend, utilizing PostgreSQL for data persistence and implementing comprehensive authentication through Replit's OIDC system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for optimal development experience
- **UI Library**: shadcn/ui components with Radix UI primitives for accessible, customizable interface elements
- **Styling**: Tailwind CSS with CSS variables for theming, featuring a dark-themed design with glass effects
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with OpenID Connect strategy for Replit authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **File Processing**: Custom streaming file processor for handling large breach data files
- **API Design**: RESTful endpoints with proper error handling and request logging

### Data Storage Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless database with connection pooling
- **Schema Design**: 
  - Users table with role-based access control (user/admin roles)
  - Breach records table with indexed username and domain fields
  - Processing jobs table for tracking file upload and processing status
  - Sessions table for authentication persistence

### Security & Authentication
- **Authentication Provider**: Replit OIDC for secure user authentication
- **Authorization**: Role-based access control with admin-only routes
- **Session Security**: HTTP-only cookies with secure flags and TTL management
- **Input Validation**: Zod schemas for runtime type checking and validation
- **File Upload Security**: Multer with size limits and destination controls

### File Processing System
- **Upload Handling**: Multer middleware for processing large files up to 10GB
- **Stream Processing**: Node.js streams for memory-efficient processing of large datasets
- **Job Management**: Asynchronous job processing with status tracking and progress reporting
- **Error Handling**: Comprehensive error handling with job failure tracking and recovery

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **express**: Web application framework with middleware ecosystem
- **passport**: Authentication middleware with OpenID Connect support

### Frontend UI Dependencies
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **@tanstack/react-query**: Powerful data synchronization for React applications
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **react-hook-form**: Performant forms library with minimal re-renders

### Development & Build Tools
- **vite**: Next-generation frontend tooling with HMR and optimized builds
- **typescript**: Static type checking across the entire application
- **tsx**: TypeScript execution engine for development server
- **esbuild**: Fast bundling for production server builds

### Authentication & Session Management
- **openid-client**: OpenID Connect client implementation
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **memoizee**: Function memoization for OIDC configuration caching

### File Processing Dependencies
- **multer**: Multipart form data handling for file uploads
- **ws**: WebSocket implementation for Neon database connections
- **crypto**: Built-in Node.js module for hash generation and security functions