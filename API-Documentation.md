# Educational Attendance Management API Documentation
**Complete Reference Guide**

## Overview

This is a comprehensive Node.js Express REST API for managing educational attendance with face recognition support. The system manages students, teachers, subjects, classes, sessions, and attendance records with MySQL database storage hosted on Hostinger.

**Base URL:** `http://localhost:5000`  
**Database:** MySQL (Hostinger)  
**Framework:** Node.js + Express.js  
**Response Format:** JSON  

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Student Management](#student-management)
4. [Teacher Management](#teacher-management)
5. [Subject Sets](#subject-sets)
6. [Classes](#classes)
7. [Sessions](#sessions)
8. [Attendance](#attendance)
9. [Face Data](#face-data)
10. [Error Handling](#error-handling)
11. [Database Schema](#database-schema)
12. [Sample Data](#sample-data)

---

## Quick Start

### Server Status
```bash
GET /
```
**Response:**
```json
{
  "success": true,
  "message": "Educational Attendance Management API is running",
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

### API Configuration for Frontend
```javascript
const API_BASE_URL = 'http://localhost:5000';

async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = { 
    method, 
    headers: { 'Content-Type': 'application/json' }, 
    mode: 'cors' 
  };
  if (data) config.body = JSON.stringify(data);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result;
}
```

---

## Authentication Endpoints
*For Face Recognition Workflow*

### Get Teachers for Login Dropdown
```bash
GET /auth/teachers
```
**Description:** Retrieves all teachers for face recognition login selection

**Response:**
```json
{
  "success": true,
  "message": "Teachers retrieved for login selection",
  "data": [
    {
      "Id": 2,
      "TeacherCode": "TCH00001",
      "TeacherName": "Lynn Chong",
      "TeacherNickname": "MsLynn",
      "Campus": "BKK",
      "Department": "Mathematics"
    },
    {
      "Id": 1,
      "TeacherCode": "64S00080",
      "TeacherName": "Orlando Viray III",
      "TeacherNickname": "Don",
      "Campus": "64",
      "Department": "IT Department"
    }
  ]
}
```

### Verify Teacher Face Login
```bash
POST /auth/verify-teacher-face
```
**Body:**
```json
{
  "TeacherCode": "TCH00001",
  "FaceDescriptor": "[0.123, -0.456, 0.789, ...]"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Teacher face verification data retrieved",
  "data": {
    "teacher": {
      "Id": 2,
      "TeacherCode": "TCH00001",
      "TeacherName": "Lynn Chong",
      "TeacherNickname": "MsLynn",
      "Campus": "BKK",
      "Department": "Mathematics"
    },
    "storedFaceDescriptor": "[0.123, -0.456, 0.789, ...]",
    "providedFaceDescriptor": "[0.123, -0.456, 0.789, ...]"
  }
}
```

### Get Teacher's Classes
```bash
GET /auth/teacher-classes/{teacherCode}
```
**Example:** `GET /auth/teacher-classes/TCH00001`

**Response:**
```json
{
  "success": true,
  "message": "Teacher classes retrieved successfully",
  "data": [
    {
      "Campus": "BKK",
      "SubjectSetID": "MATH101",
      "Subject": "Mathematics",
      "SubjectSetDescription": "Advanced Mathematics Level 1",
      "Credits": 3,
      "StudentCount": 25
    }
  ]
}
```

### Get Class Students
```bash
GET /auth/class-students/{teacherCode}/{campus}/{subjectSetId}
```
**Example:** `GET /auth/class-students/TCH00001/BKK/MATH101`

**Response:**
```json
{
  "success": true,
  "message": "Class students retrieved successfully",
  "data": [
    {
      "Id": 1,
      "StudentCode": "STU001",
      "StudentName": "John Doe",
      "StudentNickname": "Johnny",
      "EmailAddress": "john.doe@school.edu",
      "Form": "10A",
      "Campus": "BKK"
    }
  ]
}
```

### Verify Student Face
```bash
POST /auth/verify-student-face
```
**Body:**
```json
{
  "StudentCode": "STU001",
  "FaceDescriptor": "[0.123, -0.456, 0.789, ...]",
  "SessionId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student face verification data retrieved",
  "data": {
    "student": {
      "Id": 1,
      "StudentCode": "STU001",
      "StudentName": "John Doe",
      "StudentNickname": "Johnny",
      "EmailAddress": "john.doe@school.edu",
      "Form": "10A",
      "Campus": "BKK"
    },
    "storedFaceDescriptor": "[0.123, -0.456, 0.789, ...]",
    "providedFaceDescriptor": "[0.123, -0.456, 0.789, ...]",
    "sessionId": 1
  }
}
```

### Mark Attendance
```bash
POST /auth/mark-attendance
```
**Body:**
```json
{
  "SessionId": 1,
  "StudentCode": "STU001",
  "Status": "Present",
  "AttendanceDate": "2025-01-24"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "Id": 1,
    "SessionId": 1,
    "StudentCode": "STU001",
    "Status": "Present",
    "AttendanceDate": "2025-01-24",
    "CreatedDate": "2025-01-24T10:30:00.000Z",
    "SessionName": "MATH101 - Morning Session",
    "StudentName": "John Doe",
    "StudentNickname": "Johnny"
  }
}
```

---

## Student Management

### Get All Students
```bash
GET /students
```

### Get Student by ID
```bash
GET /students/{id}
```

### Get Students by Campus
```bash
GET /students/campus/{campus}
```
**Example:** `GET /students/campus/BKK`

### Create Student
```bash
POST /students
```
**Body:**
```json
{
  "StudentCode": "STU001",
  "StudentName": "John Doe",
  "StudentNickname": "Johnny",
  "EmailAddress": "john.doe@school.edu",
  "Form": "10A",
  "Campus": "BKK",
  "StudentImage": "base64_encoded_image_data"
}
```

### Update Student
```bash
PUT /students/{id}
```
**Body:** Same as create student

### Delete Student
```bash
DELETE /students/{id}
```

**Standard Student Response:**
```json
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "Id": 1,
    "StudentCode": "STU001",
    "StudentName": "John Doe",
    "StudentNickname": "Johnny",
    "EmailAddress": "john.doe@school.edu",
    "Form": "10A",
    "Campus": "BKK",
    "StudentImage": "base64_image_data",
    "CreatedDate": "2025-01-24T10:30:00.000Z"
  }
}
```

---

## Teacher Management

### Get All Teachers
```bash
GET /teachers
```

### Get Teacher by ID
```bash
GET /teachers/{id}
```

### Get Teachers by Campus
```bash
GET /teachers/campus/{campus}
```

### Create Teacher
```bash
POST /teachers
```
**Body:**
```json
{
  "TeacherCode": "TCH001",
  "TeacherName": "Jane Smith",
  "TeacherNickname": "Ms. Jane",
  "Campus": "BKK",
  "Department": "Mathematics",
  "TeacherImage": "base64_encoded_image_data"
}
```

### Update Teacher
```bash
PUT /teachers/{id}
```

### Delete Teacher
```bash
DELETE /teachers/{id}
```

**Standard Teacher Response:**
```json
{
  "success": true,
  "message": "Teacher retrieved successfully",
  "data": {
    "Id": 1,
    "TeacherCode": "TCH001",
    "TeacherName": "Jane Smith",
    "TeacherNickname": "Ms. Jane",
    "Campus": "BKK",
    "Department": "Mathematics",
    "TeacherImage": "base64_image_data",
    "CreatedDate": "2025-01-24T10:30:00.000Z"
  }
}
```

---

## Subject Sets

### Get All Subject Sets
```bash
GET /subject-sets
```

### Get Subject Sets by Campus
```bash
GET /subject-sets/campus/{campus}
```

### Create Subject Set
```bash
POST /subject-sets
```
**Body:**
```json
{
  "SubjectSetID": "MATH101",
  "Subject": "Mathematics",
  "SubjectSetDescription": "Advanced Mathematics Level 1",
  "Campus": "BKK",
  "Credits": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subject set created successfully",
  "data": {
    "Id": 1,
    "SubjectSetID": "MATH101",
    "Subject": "Mathematics",
    "SubjectSetDescription": "Advanced Mathematics Level 1",
    "Campus": "BKK",
    "Credits": 3,
    "CreatedDate": "2025-01-24T10:30:00.000Z"
  }
}
```

---

## Classes

### Get All Classes
```bash
GET /classes
```

### Get Classes by Campus
```bash
GET /classes/campus/{campus}
```

### Get Classes by Teacher
```bash
GET /classes/teacher/{teacherCode}
```

### Create Class (Enrollment)
```bash
POST /classes
```
**Body:**
```json
{
  "StudentCode": "STU001",
  "TeacherCode": "TCH001",
  "SubjectSetID": "MATH101",
  "Campus": "BKK"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Class enrollment created successfully",
  "data": {
    "Id": 1,
    "StudentCode": "STU001",
    "TeacherCode": "TCH001",
    "SubjectSetID": "MATH101",
    "Campus": "BKK",
    "CreatedDate": "2025-01-24T10:30:00.000Z"
  }
}
```

---

## Sessions

### Get All Sessions
```bash
GET /sessions
```

### Get Sessions by Campus
```bash
GET /sessions/campus/{campus}
```

### Get Sessions by Teacher
```bash
GET /sessions/teacher/{teacherCode}
```

### Get Sessions by Subject
```bash
GET /sessions/subject/{subjectSetId}
```

### Create Session
```bash
POST /sessions
```
**Body:**
```json
{
  "SessionName": "MATH101 - Morning Session",
  "SubjectSetID": "MATH101",
  "TeacherCode": "TCH001",
  "Campus": "BKK",
  "SessionDate": "2025-01-24",
  "StartTime": "09:00:00",
  "EndTime": "10:30:00"
}
```

### Update Session
```bash
PUT /sessions/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "Id": 1,
    "SessionName": "MATH101 - Morning Session",
    "SubjectSetID": "MATH101",
    "TeacherCode": "TCH001",
    "Campus": "BKK",
    "SessionDate": "2025-01-24",
    "StartTime": "09:00:00",
    "EndTime": "10:30:00",
    "CreatedDate": "2025-01-24T10:30:00.000Z"
  }
}
```

---

## Attendance

### Get All Attendance Records
```bash
GET /attendance
```

### Get Attendance by Session
```bash
GET /attendance/session/{sessionId}
```

### Get Attendance by Student
```bash
GET /attendance/student/{studentCode}
```

### Get Attendance by Date Range
```bash
GET /attendance/date-range?startDate=2025-01-01&endDate=2025-01-31
```

### Create Attendance Record
```bash
POST /attendance
```
**Body:**
```json
{
  "SessionId": 1,
  "StudentCode": "STU001",
  "Status": "Present",
  "AttendanceDate": "2025-01-24"
}
```

### Update Attendance Record
```bash
PUT /attendance/{id}
```
**Body:**
```json
{
  "Status": "Late"
}
```

**Attendance Response:**
```json
{
  "success": true,
  "message": "Attendance record retrieved successfully",
  "data": {
    "Id": 1,
    "SessionId": 1,
    "StudentCode": "STU001",
    "Status": "Present",
    "AttendanceDate": "2025-01-24",
    "CreatedDate": "2025-01-24T10:30:00.000Z",
    "SessionName": "MATH101 - Morning Session",
    "StudentName": "John Doe",
    "StudentNickname": "Johnny",
    "SubjectSetID": "MATH101",
    "Subject": "Mathematics",
    "TeacherCode": "TCH001",
    "TeacherName": "Jane Smith"
  }
}
```

**Valid Status Values:** `Present`, `Absent`, `Late`

---

## Face Data

### Get All Face Data
```bash
GET /face-data
```

### Get Face Data by Person
```bash
GET /face-data/person?personCode={code}&personType={type}
```
**Example:** `GET /face-data/person?personCode=STU001&personType=Student`

### Create Face Data
```bash
POST /face-data
```
**Body:**
```json
{
  "PersonType": "Student",
  "PersonCode": "STU001",
  "ImageData": "base64_encoded_image_data",
  "FaceDescriptor": "[0.123, -0.456, 0.789, ...]",
  "OriginalName": "student_face.jpg",
  "ContentType": "image/jpeg"
}
```

**Validation Rules:**
- `PersonType`: Required, must be "Student" or "Teacher" (case-sensitive)
- `PersonCode`: Required, max 10 characters (matches database CHAR(10))
- `ImageData`: Required, valid base64 encoded string
- `FaceDescriptor`: Optional, must be valid JSON if provided (nullable in database)
- `OriginalName`: Optional, max 255 characters (VARCHAR(255))
- `ContentType`: Optional, max 100 characters, defaults to "image/jpeg" (VARCHAR(100))

### Update Face Data
```bash
PUT /face-data/{id}
```
**Body:** Same as Create Face Data

### Delete Face Data
```bash
DELETE /face-data/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Face data retrieved successfully",
  "data": {
    "Id": 1,
    "PersonCode": "STU001",
    "PersonType": "Student",
    "FaceDescriptor": "[0.123, -0.456, 0.789, ...]",
    "OriginalName": "student_face.jpg",
    "ContentType": "image/jpeg",
    "CreatedDate": "2025-01-24T10:30:00.000Z"
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **404** - Not Found
- **500** - Internal Server Error

### Validation Errors Example
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "StudentCode is required",
    "EmailAddress must be a valid email",
    "StudentCode must be 10 characters or less"
  ]
}
```

---

## Database Schema

### Tables Overview
1. **Student** - Student information and images
2. **Teacher** - Teacher information and images  
3. **SubjectSet** - Course/subject definitions
4. **Class** - Student-teacher-subject enrollments
5. **Sessions** - Scheduled class meetings
6. **AttendanceRecords** - Attendance tracking
7. **FaceData** - Biometric data storage

### Key Relationships
- Students enrolled in Classes with Teachers and Subjects
- Sessions scheduled for specific Subjects with Teachers
- AttendanceRecords link Students to Sessions
- FaceData stores biometric info for both Students and Teachers

### Campus Support
Multi-campus system with campus field in:
- Student, Teacher, SubjectSet, Class, Sessions

---

## Sample Data

### Current Teachers in System
```json
[
  {
    "TeacherCode": "TCH00001",
    "TeacherName": "Lynn Chong",
    "TeacherNickname": "MsLynn",
    "Campus": "BKK",
    "Department": "Mathematics"
  },
  {
    "TeacherCode": "64S00080", 
    "TeacherName": "Orlando Viray III",
    "TeacherNickname": "Don",
    "Campus": "64",
    "Department": "IT Department"
  },
  {
    "TeacherCode": "TCH0000002",
    "TeacherName": "Terry Ong", 
    "TeacherNickname": "MrTee",
    "Campus": "SGN",
    "Department": "Science"
  },
  {
    "TeacherCode": "64S00179",
    "TeacherName": "Toqaful Yaosaful Herrera",
    "TeacherNickname": "Toqaf", 
    "Campus": "64",
    "Department": "IT Department"
  }
]
```

### Sample API Usage

#### Complete Face Recognition Workflow
```javascript
// 1. Teacher Login
const teachers = await apiRequest('/auth/teachers');
// User selects teacher and captures face
const verification = await apiRequest('/auth/verify-teacher-face', 'POST', {
  TeacherCode: 'TCH00001',
  FaceDescriptor: JSON.stringify(capturedDescriptor)
});

// 2. Get Teacher's Classes
const classes = await apiRequest('/auth/teacher-classes/TCH00001');

// 3. Start Attendance Session
const session = await apiRequest('/sessions', 'POST', {
  SessionName: 'MATH101 - Morning Session',
  SubjectSetID: 'MATH101',
  TeacherCode: 'TCH00001',
  Campus: 'BKK',
  SessionDate: '2025-01-24',
  StartTime: '09:00:00',
  EndTime: '10:30:00'
});

// 4. Get Students in Class
const students = await apiRequest('/auth/class-students/TCH00001/BKK/MATH101');

// 5. Student Face Verification & Attendance
const studentVerification = await apiRequest('/auth/verify-student-face', 'POST', {
  StudentCode: 'STU001',
  FaceDescriptor: JSON.stringify(studentDescriptor),
  SessionId: session.data.Id
});

// 6. Mark Attendance
const attendance = await apiRequest('/auth/mark-attendance', 'POST', {
  SessionId: session.data.Id,
  StudentCode: 'STU001',
  Status: 'Present',
  AttendanceDate: '2025-01-24'
});
```

---

## Technical Specifications

### Server Configuration
- **Port:** 5000
- **CORS:** Enabled for all origins
- **Body Parser:** 50MB limit for image uploads
- **Database:** MySQL with connection pooling
- **Environment:** Configured via .env file

### Image Storage
- **Format:** Base64 encoded LONGBLOB
- **Size Limit:** 50MB per image
- **Types:** JPEG, PNG for student/teacher photos

### Face Recognition Data
- **Storage:** JSON arrays in FaceData table
- **Format:** Floating point descriptors
- **Comparison:** Cosine similarity recommended
- **Threshold:** >0.8 confidence for success

---

This API provides complete functionality for educational attendance management with advanced face recognition capabilities. All endpoints support CORS and return standardized JSON responses for easy frontend integration.