# Educational Attendance Management API

## Overview

This is a comprehensive Node.js + Express REST API for managing educational attendance with face recognition support. The system manages students, teachers, subjects, classes, sessions, and attendance records with MySQL database storage hosted on Hostinger. The API is designed to integrate with Firebase Studio frontend projects and supports face recognition data storage for attendance tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Node.js with Express.js web framework
- **Database**: MySQL with connection pooling using mysql2 driver
- **API Design**: RESTful API following standard HTTP methods and status codes
- **Environment Management**: dotenv for configuration management
- **Cross-Origin Support**: CORS enabled for frontend integration

### Database Design
The system uses a relational database with 7 interconnected tables:
- **Core Entities**: Student, Teacher, SubjectSet
- **Relationship Tables**: Class (enrollment), Sessions (class meetings)
- **Tracking Tables**: AttendanceRecords, FaceData (biometric support)

### Request/Response Pattern
- Async/await pattern throughout for database operations
- Standardized JSON responses with success/error indicators
- Input validation middleware with detailed error messages
- Connection pooling for efficient database resource management

## Key Components

### Database Layer (`config/database.js`)
- MySQL connection pool with configurable limits (10 connections)
- Automatic reconnection and connection testing
- UTF-8 charset support for international data
- Environment-based configuration

### Validation Middleware (`middleware/validation.js`)
- Input validation for all entity types
- Email format validation
- Field length constraints (e.g., StudentCode max 10 chars)
- Required field enforcement

### Route Handlers (`routes/`)
- **Students**: Complete CRUD operations with image storage
- **Teachers**: Teacher management with department tracking
- **Subject Sets**: Course/subject definitions with credit hours
- **Classes**: Student-teacher-subject enrollment management
- **Sessions**: Class session scheduling with date/time
- **Attendance**: Attendance tracking with status (Present/Absent/Late)
- **Face Data**: Biometric data storage with LONGBLOB support

### Response Utilities (`utils/responseHandler.js`)
- Standardized response formatting
- HTTP status code management
- Error handling with detailed messages
- Success/failure response patterns

## Data Flow

### Entity Relationships
1. **Students** and **Teachers** are core entities with unique codes
2. **SubjectSets** define courses with campus and credit information
3. **Classes** link students to teachers and subjects on specific campuses
4. **Sessions** represent scheduled class meetings for subject sets
5. **AttendanceRecords** track student presence in specific sessions
6. **FaceData** stores biometric information for both students and teachers

### Image and Biometric Data
- Student and teacher images stored as LONGBLOB in respective tables
- Face recognition descriptors stored as JSON in FaceData table
- Support for base64 image encoding with 50MB payload limit
- Separate storage for original image metadata (filename, content type)

### Campus-Based Organization
- Multi-campus support with campus field in relevant entities
- Subject sets and classes are campus-specific
- Teachers and students are associated with specific campuses

## External Dependencies

### Production Dependencies
- **express**: Web framework for API endpoints and middleware
- **mysql2**: MySQL database driver with Promise support and connection pooling
- **cors**: Cross-Origin Resource Sharing for frontend integration
- **dotenv**: Environment variable management for configuration

### Database Configuration
- Hosted on Hostinger MySQL service
- Requires environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- Connection pooling configured for production workloads
- Charset set to utf8mb4 for full Unicode support

### Frontend Integration
- CORS configured to allow all origins for development flexibility
- Large payload support (50MB) for image data transfer
- JSON request/response format throughout
- RESTful endpoints following standard conventions

## Deployment Strategy

### Environment Configuration
- Environment variables for database credentials and configuration
- Port configuration with fallback to 8000
- Separate development and production environment support

### Database Connection Management
- Connection pool with automatic reconnection
- Health check endpoint for monitoring API status
- Graceful error handling for database connection failures

### API Structure
- Modular route organization by entity type
- Middleware-based validation and error handling
- Standardized response format across all endpoints
- Health check endpoint at root path for monitoring

### Development Features
- Hot reload support with nodemon (recommended for development)
- Detailed error logging for debugging
- Input validation with comprehensive error messages
- Database connection testing on startup

The API is designed to be stateless and horizontally scalable, with all state managed in the MySQL database. The connection pooling and async/await patterns ensure efficient resource utilization and good performance under load.