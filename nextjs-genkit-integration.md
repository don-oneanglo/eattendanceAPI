# Next.js + Genkit AI Integration Guide
## Face Recognition Attendance System

Based on your package.json, you're using Next.js with Genkit AI. This is perfect for face recognition! Here's how to integrate with your attendance API.

## Your Current Stack Analysis
- **Next.js 15.3.3** - Frontend framework
- **Genkit AI 1.14.1** - Google's AI framework for face recognition
- **React 18.3.1** - UI components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **mysql2** - Already have database connectivity

## API Integration Setup

### 1. Create API Service (src/lib/api.ts)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
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

  // Teacher Authentication
  async getTeachers() {
    return this.request<Teacher[]>('/auth/teachers');
  }

  async verifyTeacherFace(teacherCode: string, faceDescriptor: number[]) {
    return this.request<TeacherVerification>('/auth/verify-teacher-face', 'POST', {
      TeacherCode: teacherCode,
      FaceDescriptor: JSON.stringify(faceDescriptor)
    });
  }

  async getTeacherClasses(teacherCode: string) {
    return this.request<TeacherClass[]>(`/auth/teacher-classes/${teacherCode}`);
  }

  // Student Attendance
  async getClassStudents(teacherCode: string, campus: string, subjectSetId: string) {
    return this.request<Student[]>(`/auth/class-students/${teacherCode}/${campus}/${subjectSetId}`);
  }

  async verifyStudentFace(studentCode: string, faceDescriptor: number[], sessionId?: number) {
    return this.request<StudentVerification>('/auth/verify-student-face', 'POST', {
      StudentCode: studentCode,
      FaceDescriptor: JSON.stringify(faceDescriptor),
      SessionId: sessionId
    });
  }

  async markAttendance(sessionId: number, studentCode: string, status: 'Present' | 'Late' | 'Absent' = 'Present') {
    return this.request<AttendanceRecord>('/auth/mark-attendance', 'POST', {
      SessionId: sessionId,
      StudentCode: studentCode,
      Status: status,
      AttendanceDate: new Date().toISOString().split('T')[0]
    });
  }

  // Session Management
  async createSession(sessionData: CreateSessionData) {
    return this.request<Session>('/sessions', 'POST', sessionData);
  }
}

export const apiService = new ApiService();

// TypeScript Interfaces
export interface Teacher {
  Id: number;
  TeacherCode: string;
  TeacherName: string;
  TeacherNickname: string;
  Campus: string;
  Department: string;
}

export interface TeacherClass {
  Campus: string;
  SubjectSetID: string;
  Subject: string;
  SubjectSetDescription: string;
  Credits: number;
  StudentCount: number;
}

export interface Student {
  Id: number;
  StudentCode: string;
  StudentName: string;
  StudentNickname: string;
  EmailAddress: string;
  Form: string;
  Campus: string;
}

export interface TeacherVerification {
  teacher: Teacher;
  storedFaceDescriptor: string;
  providedFaceDescriptor: string;
  message: string;
}

export interface StudentVerification {
  student: Student;
  storedFaceDescriptor: string;
  providedFaceDescriptor: string;
  sessionId?: number;
  message: string;
}

export interface AttendanceRecord {
  Id: number;
  SessionId: number;
  StudentCode: string;
  Status: string;
  AttendanceDate: string;
  CreatedDate: string;
  SessionName: string;
  StudentName: string;
  StudentNickname: string;
}

export interface CreateSessionData {
  SessionName: string;
  SubjectSetID: string;
  TeacherCode: string;
  Campus: string;
  SessionDate: string;
  StartTime: string;
  EndTime: string;
}

export interface Session {
  Id: number;
  SessionName: string;
  SubjectSetID: string;
  TeacherCode: string;
  Campus: string;
  SessionDate: string;
  StartTime: string;
  EndTime: string;
  CreatedDate: string;
}
```

### 2. Face Recognition Service with Genkit (src/lib/faceRecognition.ts)
```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Configure Genkit with Google AI
const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro-vision',
});

export class FaceRecognitionService {
  
  // Extract face descriptor from image using Genkit
  async extractFaceDescriptor(imageData: string): Promise<number[]> {
    try {
      // Convert base64 to appropriate format for Genkit
      const prompt = `Analyze this image and extract facial features as a numerical descriptor. 
                     Return only a JSON array of 128 floating point numbers representing the face encoding.
                     If no face is detected, return an empty array.`;

      const result = await ai.generate({
        model: 'googleai/gemini-pro-vision',
        prompt: prompt,
        media: {
          url: `data:image/jpeg;base64,${imageData}`
        },
        config: {
          temperature: 0.1, // Low temperature for consistent results
        }
      });

      // Parse the response to extract face descriptor
      const descriptor = JSON.parse(result.text());
      return descriptor;
      
    } catch (error) {
      console.error('Face extraction error:', error);
      throw new Error('Failed to extract face descriptor');
    }
  }

  // Compare two face descriptors
  async compareFaces(descriptor1: number[], descriptor2: number[]): Promise<number> {
    if (!descriptor1.length || !descriptor2.length) {
      return 0;
    }

    try {
      // Use cosine similarity for face comparison
      const similarity = this.cosineSimilarity(descriptor1, descriptor2);
      return similarity;
    } catch (error) {
      console.error('Face comparison error:', error);
      return 0;
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Descriptor lengths must match');
    }

    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Capture image from camera
  async captureFromCamera(): Promise<string> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement('video');
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          video.srcObject = stream;
          video.play();

          video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Capture frame
            context?.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
            
            // Stop camera
            stream.getTracks().forEach(track => track.stop());
            
            resolve(imageData);
          });
        })
        .catch(reject);
    });
  }
}

export const faceService = new FaceRecognitionService();
```

### 3. Teacher Login Component (src/components/TeacherLogin.tsx)
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, UserCheck, Loader2 } from 'lucide-react';
import { apiService, Teacher } from '@/lib/api';
import { faceService } from '@/lib/faceRecognition';
import { useToast } from '@/hooks/use-toast';

interface TeacherLoginProps {
  onLoginSuccess: (teacher: Teacher) => void;
}

export function TeacherLogin({ onLoginSuccess }: TeacherLoginProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  // Load teachers on component mount
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const result = await apiService.getTeachers();
      setTeachers(result.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    }
  };

  const handleFaceLogin = async () => {
    if (!selectedTeacher) {
      toast({
        title: "Please select a teacher",
        variant: "destructive",
      });
      return;
    }

    setScanning(true);
    setLoading(true);

    try {
      // Capture face from camera
      const imageData = await faceService.captureFromCamera();
      
      // Extract face descriptor
      const faceDescriptor = await faceService.extractFaceDescriptor(imageData);
      
      if (faceDescriptor.length === 0) {
        throw new Error('No face detected. Please ensure your face is clearly visible.');
      }

      // Verify with API
      const verification = await apiService.verifyTeacherFace(selectedTeacher, faceDescriptor);
      
      // Compare faces
      const storedDescriptor = JSON.parse(verification.data.storedFaceDescriptor);
      const confidence = await faceService.compareFaces(storedDescriptor, faceDescriptor);

      if (confidence > 0.8) {
        toast({
          title: "Login Successful",
          description: `Welcome ${verification.data.teacher.TeacherName}!`,
        });
        onLoginSuccess(verification.data.teacher);
      } else {
        throw new Error(`Face verification failed. Confidence: ${(confidence * 100).toFixed(1)}%`);
      }

    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Face verification failed",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Teacher Login
        </CardTitle>
        <CardDescription>
          Select your name and scan your face to login
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger>
            <SelectValue placeholder="Select your name" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.TeacherCode} value={teacher.TeacherCode}>
                {teacher.TeacherName} ({teacher.TeacherNickname})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={handleFaceLogin}
          disabled={!selectedTeacher || loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {scanning ? 'Scanning Face...' : 'Processing...'}
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Scan Face to Login
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 4. Environment Variables (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Genkit AI Configuration  
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here

# Development
NODE_ENV=development
```

### 5. Main Application Flow (src/app/page.tsx)
```tsx
'use client';

import { useState } from 'react';
import { TeacherLogin } from '@/components/TeacherLogin';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { AttendanceSession } from '@/components/AttendanceSession';
import { Teacher, TeacherClass } from '@/lib/api';

type AppState = 'login' | 'dashboard' | 'attendance';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);

  const handleLoginSuccess = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setAppState('dashboard');
  };

  const handleClassSelected = (teacherClass: TeacherClass) => {
    setSelectedClass(teacherClass);
    setAppState('attendance');
  };

  const handleBackToDashboard = () => {
    setSelectedClass(null);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setCurrentTeacher(null);
    setSelectedClass(null);
    setAppState('login');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        {appState === 'login' && (
          <TeacherLogin onLoginSuccess={handleLoginSuccess} />
        )}
        
        {appState === 'dashboard' && currentTeacher && (
          <TeacherDashboard 
            teacher={currentTeacher}
            onClassSelected={handleClassSelected}
            onLogout={handleLogout}
          />
        )}
        
        {appState === 'attendance' && currentTeacher && selectedClass && (
          <AttendanceSession
            teacher={currentTeacher}
            teacherClass={selectedClass}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </main>
  );
}
```

## Quick Setup Instructions

1. **Install your dependencies** (already done based on your package.json)

2. **Add environment variables** to `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

3. **Create the API service** and face recognition components above

4. **Update your Genkit configuration** in `src/ai/dev.ts` if needed

5. **Test the integration**:
   - Start your API: `node server.js` (port 5000)
   - Start your Next.js app: `npm run dev` (port 9002)
   - Visit `http://localhost:9002`

## Key Advantages of Your Stack

- **Genkit AI**: Built specifically for Google AI integration
- **Type Safety**: Full TypeScript support
- **Modern UI**: Radix UI components with Tailwind
- **Real-time**: Next.js for fast, responsive experience
- **Face Recognition**: Google's advanced AI models

Your setup is actually perfect for this face recognition attendance system! The integration will be much cleaner than Firebase Studio.