# Face Recognition Integration Guide for Firebase Studio

## Complete Workflow Implementation

I've added new `/auth` endpoints to your API specifically for your face recognition workflow. Here's how to integrate everything:

## New API Endpoints for Face Recognition

### 1. Teacher Login Flow

#### Get Teachers for Dropdown
```javascript
const teachers = await apiRequest('/auth/teachers');
// Returns: [{TeacherCode, TeacherName, TeacherNickname, Campus, Department}]
```

#### Verify Teacher Face Login
```javascript
const verification = await apiRequest('/auth/verify-teacher-face', 'POST', {
  TeacherCode: 'TCH00001',
  FaceDescriptor: capturedFaceDescriptor // From Google AI
});
// Returns stored and provided descriptors for comparison
```

#### Get Teacher's Classes
```javascript
const classes = await apiRequest('/auth/teacher-classes/TCH00001');
// Returns: [{Campus, SubjectSetID, Subject, StudentCount}]
```

### 2. Student Attendance Flow

#### Get Students in Class
```javascript
const students = await apiRequest('/auth/class-students/TCH00001/BKK/MATH101');
// Returns: [{StudentCode, StudentName, StudentNickname, Form}]
```

#### Verify Student Face for Attendance
```javascript
const verification = await apiRequest('/auth/verify-student-face', 'POST', {
  StudentCode: 'STU0000001',
  FaceDescriptor: capturedFaceDescriptor,
  SessionId: currentSessionId
});
// Returns stored and provided descriptors for comparison
```

#### Mark Attendance After Verification
```javascript
const attendance = await apiRequest('/auth/mark-attendance', 'POST', {
  SessionId: currentSessionId,
  StudentCode: 'STU0000001',
  Status: 'Present', // or 'Late' if late
  AttendanceDate: '2025-01-25'
});
```

## Firebase Studio Prompt for Face Recognition App

Copy this prompt to your Firebase Studio:

---

**Create a face recognition attendance system with this exact workflow:**

**Step 1: Teacher Login Screen**
- Dropdown showing all teachers from `GET /auth/teachers`
- Face capture button using Google AI face detection
- When face captured, call `POST /auth/verify-teacher-face` with teacher code and face descriptor
- Use Google AI to compare returned face descriptors (stored vs captured)
- Login success if face match confidence > 0.8

**Step 2: Teacher Dashboard**
- Show teacher's classes from `GET /auth/teacher-classes/{teacherCode}`
- Display each class as a card with subject name and student count
- "Start Session" button for each class

**Step 3: Class Session Screen**
- Show students list from `GET /auth/class-students/{teacherCode}/{campus}/{subjectSetId}`
- Each student shows: name, student code, attendance status
- "Scan Face" button for each student

**Step 4: Student Face Scanning**
- Capture student face using Google AI
- Call `POST /auth/verify-student-face` with student code and face descriptor
- Compare face descriptors using Google AI
- If match (confidence > 0.8), call `POST /auth/mark-attendance` to mark present
- Update UI to show "Present" status with green checkmark

**API Configuration:**
```javascript
const API_BASE_URL = 'http://localhost:5000';

async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = { method, headers: { 'Content-Type': 'application/json' }, mode: 'cors' };
  if (data) config.body = JSON.stringify(data);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result;
}

async function compareFaces(descriptor1, descriptor2) {
  // Use Google AI to compare face descriptors
  // Return confidence score (0-1)
  // You'll implement this with Google AI face recognition
}
```

**Key Features:**
- Real-time face recognition using Google AI
- Teacher authentication via face scan
- Student attendance via face scan  
- Visual feedback for successful/failed scans
- Automatic attendance marking
- Modern, responsive UI
- Error handling for no face data found
- Session management for each class

**UI Requirements:**
- Clean, modern design suitable for schools
- Large buttons for easy touch interaction
- Clear visual feedback (green for success, red for failure)
- Loading states during face processing
- Student photos if available from API

Build this as a single-page application with proper navigation between screens.

---

## Face Descriptor Handling

### Google AI Integration Pattern
```javascript
// In your Firebase Studio app
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

class FaceRecognitionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async captureFaceDescriptor(imageData) {
    // Use Google AI to extract face descriptor from image
    // This should return a numerical array representing the face
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    // Process image and extract face features
    // Return face descriptor array
    return faceDescriptor;
  }

  async compareFaces(descriptor1, descriptor2) {
    // Compare two face descriptors
    // Return confidence score (0-1)
    
    // You can use cosine similarity or other comparison methods
    const similarity = this.cosineSimilarity(descriptor1, descriptor2);
    return similarity;
  }

  cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
```

## Sample Implementation Flow

### Complete Teacher Login
```javascript
// 1. Load teachers for dropdown
const teachers = await apiRequest('/auth/teachers');

// 2. Teacher selects themselves and scans face
const selectedTeacher = 'TCH00001';
const capturedDescriptor = await faceService.captureFaceDescriptor(cameraImage);

// 3. Verify face with API
const verification = await apiRequest('/auth/verify-teacher-face', 'POST', {
  TeacherCode: selectedTeacher,
  FaceDescriptor: JSON.stringify(capturedDescriptor)
});

// 4. Compare faces using Google AI
const storedDescriptor = JSON.parse(verification.data.storedFaceDescriptor);
const confidence = await faceService.compareFaces(storedDescriptor, capturedDescriptor);

if (confidence > 0.8) {
  // Login successful - load teacher's classes
  const classes = await apiRequest(`/auth/teacher-classes/${selectedTeacher}`);
  showTeacherDashboard(verification.data.teacher, classes.data);
} else {
  showError('Face verification failed. Please try again.');
}
```

### Complete Student Attendance
```javascript
// 1. Teacher selects a class and starts session
const sessionId = await createNewSession(); // Use existing session endpoint

// 2. Load students for the class
const students = await apiRequest(`/auth/class-students/${teacherCode}/${campus}/${subjectSetId}`);

// 3. Student scans face
const studentCode = 'STU0000001';
const capturedDescriptor = await faceService.captureFaceDescriptor(cameraImage);

// 4. Verify student face
const verification = await apiRequest('/auth/verify-student-face', 'POST', {
  StudentCode: studentCode,
  FaceDescriptor: JSON.stringify(capturedDescriptor),
  SessionId: sessionId
});

// 5. Compare faces
const storedDescriptor = JSON.parse(verification.data.storedFaceDescriptor);
const confidence = await faceService.compareFaces(storedDescriptor, capturedDescriptor);

if (confidence > 0.8) {
  // Mark attendance
  await apiRequest('/auth/mark-attendance', 'POST', {
    SessionId: sessionId,
    StudentCode: studentCode,
    Status: 'Present',
    AttendanceDate: new Date().toISOString().split('T')[0]
  });
  
  updateStudentStatus(studentCode, 'Present');
} else {
  showError('Student face verification failed.');
}
```

## Testing the New Endpoints

```bash
# Test teacher login flow
curl http://localhost:5000/auth/teachers

# Test teacher's classes
curl http://localhost:5000/auth/teacher-classes/TCH00001

# Test class students
curl http://localhost:5000/auth/class-students/TCH00001/BKK/MATH101
```

Your API now supports the complete face recognition workflow. The Firebase Studio app will handle the Google AI face recognition while your API manages the data and verification logic.