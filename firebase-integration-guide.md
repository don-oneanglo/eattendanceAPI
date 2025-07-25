# Firebase Studio Integration Guide
## Connecting to Educational Attendance Management API

Use this prompt in your Firebase Studio app to integrate with your Node.js REST API:

---

## API Integration Prompt for Firebase Studio

**System Instructions:**
You are building a Firebase Studio web application that connects to an Educational Attendance Management REST API. The API is running on `http://localhost:5000` (or your deployed domain).

### API Base Configuration
```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:5000'; // Change to your deployed URL when ready
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API Helper Function
async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    headers: API_HEADERS,
    mode: 'cors'
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Available API Endpoints

#### Students Management
```javascript
// Get all students
const students = await apiRequest('/students');

// Get specific student
const student = await apiRequest('/students/1');

// Create new student
const newStudent = await apiRequest('/students', 'POST', {
  StudentCode: 'STU001',
  StudentNickname: 'John',
  StudentName: 'John Doe',
  EmailAddress: 'john@example.com',
  Campus: 'Main Campus',
  Form: 'Grade 10A'
});

// Update student
const updatedStudent = await apiRequest('/students/1', 'PUT', {
  StudentCode: 'STU001',
  StudentNickname: 'Johnny',
  StudentName: 'John Doe Updated',
  EmailAddress: 'johnny@example.com',
  Campus: 'Main Campus',
  Form: 'Grade 10A'
});

// Delete student
await apiRequest('/students/1', 'DELETE');
```

#### Teachers Management
```javascript
// Get all teachers
const teachers = await apiRequest('/teachers');

// Create new teacher
const newTeacher = await apiRequest('/teachers', 'POST', {
  TeacherCode: 'TCH001',
  TeacherNickname: 'Ms.Smith',
  TeacherName: 'Sarah Smith',
  EmailAddress: 'sarah@example.com',
  Campus: 'Main Campus',
  Department: 'Mathematics'
});
```

#### Subject Sets Management
```javascript
// Get all subject sets
const subjects = await apiRequest('/subject-sets');

// Create new subject set
const newSubject = await apiRequest('/subject-sets', 'POST', {
  Campus: 'Main Campus',
  SubjectSetID: 'MATH101',
  Subject: 'Mathematics',
  SubjectSetDescription: 'Basic Mathematics',
  Credits: 3
});
```

#### Classes (Enrollments) Management
```javascript
// Get all classes with student/teacher/subject details
const classes = await apiRequest('/classes');

// Create new class enrollment
const newClass = await apiRequest('/classes', 'POST', {
  Campus: 'Main Campus',
  SubjectSetID: 'MATH101',
  TeacherCode: 'TCH001',
  StudentCode: 'STU001'
});
```

#### Sessions Management
```javascript
// Get all sessions
const sessions = await apiRequest('/sessions');

// Create new session
const newSession = await apiRequest('/sessions', 'POST', {
  SessionName: 'Math Class - Week 1',
  SubjectSetID: 'MATH101',
  TeacherCode: 'TCH001',
  Campus: 'Main Campus',
  SessionDate: '2025-01-15',
  StartTime: '09:00:00',
  EndTime: '10:30:00'
});

// Update session
const updatedSession = await apiRequest('/sessions/1', 'PUT', {
  SessionName: 'Math Class - Week 1 Updated',
  SubjectSetID: 'MATH101',
  TeacherCode: 'TCH001',
  Campus: 'Main Campus',
  SessionDate: '2025-01-15',
  StartTime: '09:15:00',
  EndTime: '10:45:00'
});
```

#### Attendance Management
```javascript
// Get all attendance records
const allAttendance = await apiRequest('/attendance');

// Get attendance for specific session
const sessionAttendance = await apiRequest('/attendance/session/1');

// Create attendance record
const newAttendance = await apiRequest('/attendance', 'POST', {
  SessionId: 1,
  StudentCode: 'STU001',
  Status: 'Present', // 'Present', 'Absent', or 'Late'
  AttendanceDate: '2025-01-15'
});

// Update attendance record
const updatedAttendance = await apiRequest('/attendance/1', 'PUT', {
  SessionId: 1,
  StudentCode: 'STU001',
  Status: 'Late',
  AttendanceDate: '2025-01-15'
});
```

#### Face Recognition Data
```javascript
// Get face data for a person
const faceData = await apiRequest('/face-data/STU001');

// Store face recognition data
const newFaceData = await apiRequest('/face-data', 'POST', {
  PersonType: 'student', // 'student' or 'teacher'
  PersonCode: 'STU001',
  ImageData: 'base64_encoded_image_string',
  FaceDescriptor: JSON.stringify([0.1, 0.2, 0.3]), // Face recognition descriptor array
  OriginalName: 'student_photo.jpg',
  ContentType: 'image/jpeg'
});

// Delete face data
await apiRequest('/face-data/1', 'DELETE');
```

### Error Handling Pattern
```javascript
// Always handle API errors in your components
try {
  const result = await apiRequest('/students');
  console.log('Success:', result.message);
  // Use result.data for the actual data
  setStudents(result.data);
} catch (error) {
  console.error('Error:', error.message);
  // Show user-friendly error message
  alert('Failed to load students: ' + error.message);
}
```

### Response Format
All API responses follow this format:
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* actual data */ }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional
}
```

### Image Upload Helper
```javascript
// Helper function to convert file to base64 for image uploads
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:image/jpeg;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Usage in your components
const handleImageUpload = async (file) => {
  try {
    const base64Image = await fileToBase64(file);
    const student = await apiRequest('/students', 'POST', {
      StudentCode: 'STU001',
      StudentName: 'John Doe',
      StudentImage: base64Image,
      // ... other fields
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Sample Component Integration
```javascript
// Example React component pattern
import { useState, useEffect } from 'react';

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const result = await apiRequest('/students');
      setStudents(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData) => {
    try {
      await apiRequest('/students', 'POST', studentData);
      loadStudents(); // Reload the list
    } catch (err) {
      setError(err.message);
    }
  };

  // Your component JSX here
}
```

### Development vs Production
```javascript
// For development (local API)
const API_BASE_URL = 'http://localhost:5000';

// For production (deployed API)
const API_BASE_URL = 'https://your-api-domain.com';

// Or use environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### Key Integration Notes:
1. **CORS is already enabled** - Your API accepts requests from any origin
2. **All endpoints return JSON** - Perfect for web applications
3. **Consistent error handling** - All responses use the same success/error format
4. **Image support** - Students and teachers can have profile images via base64 encoding
5. **Face recognition ready** - Built-in support for storing face recognition descriptors
6. **Campus-based organization** - Perfect for multi-campus educational institutions

### Testing Your Integration:
Start with simple GET requests to verify connectivity, then gradually implement the full CRUD operations for each entity type.

---

This API provides complete backend functionality for your educational attendance management system. Build your Firebase Studio frontend using these patterns and your app will have full access to student management, teacher management, class scheduling, and attendance tracking with face recognition support.