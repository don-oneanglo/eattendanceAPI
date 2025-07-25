# Educational Attendance Management API

A comprehensive Node.js + Express REST API for managing educational attendance with face recognition support. This API connects to a MySQL database hosted on Hostinger and provides complete CRUD operations for students, teachers, subjects, classes, sessions, and attendance records.

## 🚀 Features

- **Complete REST API** with 7 database tables
- **MySQL database** with connection pooling
- **CORS enabled** for Firebase Studio frontend integration
- **Face recognition data support** with LONGBLOB storage
- **Input validation** with proper error handling
- **JSON responses** with appropriate HTTP status codes
- **Async/await** pattern throughout

## 📋 Database Schema

### Tables
1. **Student** - Student information with image storage
2. **Teacher** - Teacher information with image storage
3. **SubjectSet** - Course/subject definitions
4. **Class** - Student-teacher-subject enrollments
5. **Sessions** - Class sessions with date/time
6. **AttendanceRecords** - Attendance tracking (Present/Absent/Late)
7. **FaceData** - Face recognition data with descriptors

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **mysql2** - MySQL database driver with connection pooling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📦 Installation & Setup

### 1. Clone and Install Dependencies

```bash
npm install express mysql2 cors dotenv
```

### 2. Database Setup

1. **Create MySQL Database** on Hostinger:
   - Log into your Hostinger control panel
   - Go to "Databases" section
   - Create a new MySQL database
   - Note down the connection details

2. **Import Database Schema**:
   ```bash
   mysql -h [your_host] -u [username] -p [database_name] < schema.sql
   ```

### 3. Environment Configuration

Set up your environment variables by providing these values when prompted:
- `DB_HOST` - Your Hostinger MySQL host (e.g., srv1234.hstgr.io)
- `DB_USER` - Your MySQL username
- `DB_PASSWORD` - Your MySQL password
- `DB_NAME` - Your database name
- `DB_PORT` - MySQL port (usually 3306)

### 4. Running the Project

#### In Replit:
The server will automatically start when you configure your environment variables.

#### Locally:
```bash
node server.js
```

The API will be available at `http://localhost:5000`

## 🌐 API Endpoints

### Students
- `GET /students` - Get all students
- `POST /students` - Create new student
- `GET /students/:id` - Get student by ID
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Teachers
- `GET /teachers` - Get all teachers
- `POST /teachers` - Create new teacher
- `GET /teachers/:id` - Get teacher by ID
- `PUT /teachers/:id` - Update teacher
- `DELETE /teachers/:id` - Delete teacher

### Subject Sets
- `GET /subject-sets` - Get all subject sets
- `POST /subject-sets` - Create new subject set
- `GET /subject-sets/:id` - Get subject set by ID

### Classes
- `GET /classes` - Get all classes (with joins)
- `POST /classes` - Create new class enrollment
- `GET /classes/:id` - Get class by ID

### Sessions
- `GET /sessions` - Get all sessions
- `POST /sessions` - Create new session
- `GET /sessions/:id` - Get session by ID
- `PUT /sessions/:id` - Update session

### Attendance
- `GET /attendance` - Get all attendance records
- `POST /attendance` - Create attendance record
- `GET /attendance/session/:sessionId` - Get attendance for specific session
- `PUT /attendance/:id` - Update attendance record

### Face Data
- `POST /face-data` - Store face recognition data
- `GET /face-data/:personCode` - Get face data for person
- `DELETE /face-data/:id` - Delete face data record

## 📊 Request/Response Examples

### Create Student
```bash
curl -X POST http://localhost:5000/students \
  -H "Content-Type: application/json" \
  -d '{
    "StudentCode": "STU001",
    "StudentNickname": "John",
    "StudentName": "John Doe",
    "EmailAddress": "john@example.com",
    "Campus": "Main Campus",
    "Form": "Grade 10A"
  }'
```

### Response Format
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "Id": 1,
    "StudentCode": "STU001",
    "StudentNickname": "John",
    "StudentName": "John Doe",
    "EmailAddress": "john@example.com",
    "Campus": "Main Campus",
    "Form": "Grade 10A",
    "CreatedDate": "2025-01-01T12:00:00.000Z"
  }
}
```

## 🔧 Testing

### With Postman:
1. Import the API endpoints
2. Set base URL to `http://localhost:5000`
3. Test each endpoint with sample data

### With Firebase Studio:
1. Configure CORS (already enabled for all origins)
2. Use fetch() or axios to make requests
3. Handle JSON responses with success/error patterns

## 🚀 Deployment

### To Replit Deployments:
1. Ensure your environment variables are configured
2. Click the Deploy button in Replit
3. Your API will be available at a `.replit.app` domain

### To Other Hosting Services:
1. Set environment variables on your hosting platform
2. Ensure MySQL database is accessible
3. Update CORS settings if needed for production

## 🔒 Security Features

- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- CORS configuration for cross-origin requests
- Environment variable protection for sensitive data
- Error handling without exposing internal details

## 📝 Notes

- All image data is stored as LONGBLOB (base64 encoded)
- Face recognition descriptors stored as JSON strings
- Connection pooling enabled for optimal database performance
- Async/await pattern used throughout for better error handling
- RESTful design following standard HTTP status codes
