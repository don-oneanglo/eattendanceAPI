# Sample API Requests for Testing

## Basic Health Check
```bash
curl -X GET http://localhost:5000/
```

## 1. Students Management

### Get All Students
```bash
curl -X GET http://localhost:5000/students
```

### Get Specific Student
```bash
curl -X GET http://localhost:5000/students/1
```

### Create New Student
```bash
curl -X POST http://localhost:5000/students \
  -H "Content-Type: application/json" \
  -d '{
    "StudentCode": "STU999",
    "StudentNickname": "Alex",
    "StudentName": "Alexander Kim",
    "EmailAddress": "alex.kim@example.com",
    "Campus": "BKK",
    "Form": "11A"
  }'
```

### Update Student
```bash
curl -X PUT http://localhost:5000/students/1 \
  -H "Content-Type: application/json" \
  -d '{
    "StudentCode": "STU0000001",
    "StudentNickname": "Joey",
    "StudentName": "Joseph Tan Updated",
    "EmailAddress": "joey.tan@example.com",
    "Campus": "BKK",
    "Form": "10B"
  }'
```

## 2. Teachers Management

### Get All Teachers
```bash
curl -X GET http://localhost:5000/teachers
```

### Create New Teacher
```bash
curl -X POST http://localhost:5000/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "TeacherCode": "TCH999",
    "TeacherNickname": "Dr.Smith",
    "TeacherName": "Dr. Sarah Smith",
    "EmailAddress": "sarah.smith@example.com",
    "Campus": "BKK",
    "Department": "Physics"
  }'
```

## 3. Subject Sets

### Get All Subject Sets
```bash
curl -X GET http://localhost:5000/subject-sets
```

### Create New Subject Set
```bash
curl -X POST http://localhost:5000/subject-sets \
  -H "Content-Type: application/json" \
  -d '{
    "Campus": "BKK",
    "SubjectSetID": "PHY101",
    "Subject": "Physics",
    "SubjectSetDescription": "Introduction to Physics",
    "Credits": 4
  }'
```

## 4. Classes (Enrollments)

### Get All Classes
```bash
curl -X GET http://localhost:5000/classes
```

### Create New Class Enrollment
```bash
curl -X POST http://localhost:5000/classes \
  -H "Content-Type: application/json" \
  -d '{
    "Campus": "BKK",
    "SubjectSetID": "MATH101",
    "TeacherCode": "TCH00001",
    "StudentCode": "STU0000001"
  }'
```

## 5. Sessions

### Get All Sessions
```bash
curl -X GET http://localhost:5000/sessions
```

### Create New Session
```bash
curl -X POST http://localhost:5000/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "SessionName": "Math Class - Advanced Algebra",
    "SubjectSetID": "MATH101",
    "TeacherCode": "TCH00001",
    "Campus": "BKK",
    "SessionDate": "2025-01-20",
    "StartTime": "09:00:00",
    "EndTime": "10:30:00"
  }'
```

## 6. Attendance Management

### Get All Attendance Records
```bash
curl -X GET http://localhost:5000/attendance
```

### Get Attendance for Specific Session
```bash
curl -X GET http://localhost:5000/attendance/session/1
```

### Create Attendance Record
```bash
curl -X POST http://localhost:5000/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "SessionId": 1,
    "StudentCode": "STU0000001",
    "Status": "Present",
    "AttendanceDate": "2025-01-20"
  }'
```

### Update Attendance Record
```bash
curl -X PUT http://localhost:5000/attendance/1 \
  -H "Content-Type: application/json" \
  -d '{
    "SessionId": 1,
    "StudentCode": "STU0000001",
    "Status": "Late",
    "AttendanceDate": "2025-01-20"
  }'
```

## 7. Face Recognition Data

### Get Face Data for Person
```bash
curl -X GET http://localhost:5000/face-data/STU0000001
```

### Store Face Recognition Data
```bash
curl -X POST http://localhost:5000/face-data \
  -H "Content-Type: application/json" \
  -d '{
    "PersonType": "student",
    "PersonCode": "STU0000001",
    "ImageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "FaceDescriptor": "[0.1, 0.2, 0.3, 0.4, 0.5]",
    "OriginalName": "student_photo.jpg",
    "ContentType": "image/jpeg"
  }'
```

## JavaScript/Firebase Studio Examples

### Basic API Function
```javascript
const API_BASE_URL = 'http://localhost:5000';

async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors'
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Sample Usage in JavaScript
```javascript
// Get all students
const students = await apiRequest('/students');
console.log('Students:', students.data);

// Create new student
const newStudent = await apiRequest('/students', 'POST', {
  StudentCode: 'STU888',
  StudentNickname: 'Mike',
  StudentName: 'Michael Johnson',
  EmailAddress: 'mike@example.com',
  Campus: 'SGN',
  Form: '12A'
});

// Get attendance for session
const attendance = await apiRequest('/attendance/session/1');
console.log('Session Attendance:', attendance.data);
```

## Expected Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Actual data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error message"]
}
```

## Testing Workflow

1. **Start with health check** - Verify API is running
2. **Test GET endpoints** - Check existing data
3. **Test POST endpoints** - Create new records
4. **Test PUT endpoints** - Update existing records
5. **Test relationships** - Create classes, sessions, attendance
6. **Test error cases** - Try invalid data to see validation

## Notes for Firebase Studio Integration

- The API is already CORS-enabled for all origins
- All endpoints accept and return JSON
- Image data should be base64 encoded
- Face descriptors should be JSON strings
- Status values for attendance: "Present", "Absent", "Late"
- PersonType for face data: "student" or "teacher"