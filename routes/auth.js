const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHandler');

// GET /auth/teachers - Get all teachers for dropdown selection
router.get('/teachers', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT Id, TeacherCode, TeacherName, TeacherNickname, Campus, Department 
      FROM Teacher 
      ORDER BY TeacherName ASC
    `);
    successResponse(res, rows, 'Teachers retrieved for login selection');
  } catch (error) {
    console.error('Error fetching teachers for login:', error);
    errorResponse(res, 'Failed to fetch teachers');
  }
});

// POST /auth/verify-teacher-face - Verify teacher's face for login
router.post('/verify-teacher-face', async (req, res) => {
  try {
    const { TeacherCode, FaceDescriptor } = req.body;
    
    if (!TeacherCode || !FaceDescriptor) {
      return errorResponse(res, 'TeacherCode and FaceDescriptor are required', 400);
    }
    
    // Get teacher's stored face data
    const [faceData] = await db.execute(`
      SELECT FaceDescriptor FROM FaceData 
      WHERE PersonType = 'teacher' AND PersonCode = ?
      ORDER BY CreatedDate DESC LIMIT 1
    `, [TeacherCode]);
    
    if (faceData.length === 0) {
      return errorResponse(res, 'No face data found for this teacher. Please register face first.', 404);
    }
    
    // Return both descriptors for comparison in frontend
    const storedDescriptor = faceData[0].FaceDescriptor;
    
    // Get teacher details
    const [teacher] = await db.execute(`
      SELECT Id, TeacherCode, TeacherName, TeacherNickname, Campus, Department 
      FROM Teacher WHERE TeacherCode = ?
    `, [TeacherCode]);
    
    if (teacher.length === 0) {
      return notFoundResponse(res, 'Teacher');
    }
    
    successResponse(res, {
      teacher: teacher[0],
      storedFaceDescriptor: storedDescriptor,
      providedFaceDescriptor: FaceDescriptor,
      // Note: Face comparison should be done in frontend with Google AI
      message: 'Face descriptors retrieved for comparison'
    }, 'Teacher face verification data retrieved');
    
  } catch (error) {
    console.error('Error verifying teacher face:', error);
    errorResponse(res, 'Failed to verify teacher face');
  }
});

// GET /auth/teacher-classes/:teacherCode - Get classes for logged-in teacher
router.get('/teacher-classes/:teacherCode', async (req, res) => {
  try {
    const { teacherCode } = req.params;
    
    // Get unique classes (subject-campus combinations) for this teacher
    const [classes] = await db.execute(`
      SELECT DISTINCT 
        c.Campus,
        c.SubjectSetID,
        ss.Subject,
        ss.SubjectSetDescription,
        ss.Credits,
        COUNT(DISTINCT c.StudentCode) as StudentCount
      FROM Class c
      LEFT JOIN SubjectSet ss ON c.SubjectSetID = ss.SubjectSetID AND c.Campus = ss.Campus
      WHERE c.TeacherCode = ?
      GROUP BY c.Campus, c.SubjectSetID, ss.Subject, ss.SubjectSetDescription, ss.Credits
      ORDER BY ss.Subject
    `, [teacherCode]);
    
    successResponse(res, classes, 'Teacher classes retrieved successfully');
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    errorResponse(res, 'Failed to fetch teacher classes');
  }
});

// GET /auth/class-students/:teacherCode/:campus/:subjectSetId - Get students in specific class
router.get('/class-students/:teacherCode/:campus/:subjectSetId', async (req, res) => {
  try {
    const { teacherCode, campus, subjectSetId } = req.params;
    
    // Get students enrolled in this specific class
    const [students] = await db.execute(`
      SELECT DISTINCT 
        s.Id,
        s.StudentCode,
        s.StudentName,
        s.StudentNickname,
        s.EmailAddress,
        s.Form,
        s.Campus
      FROM Class c
      JOIN Student s ON c.StudentCode = s.StudentCode
      WHERE c.TeacherCode = ? AND c.Campus = ? AND c.SubjectSetID = ?
      ORDER BY s.StudentName
    `, [teacherCode, campus, subjectSetId]);
    
    successResponse(res, students, 'Class students retrieved successfully');
  } catch (error) {
    console.error('Error fetching class students:', error);
    errorResponse(res, 'Failed to fetch class students');
  }
});

// POST /auth/verify-student-face - Verify student's face for attendance
router.post('/verify-student-face', async (req, res) => {
  try {
    const { StudentCode, FaceDescriptor, SessionId } = req.body;
    
    if (!StudentCode || !FaceDescriptor) {
      return errorResponse(res, 'StudentCode and FaceDescriptor are required', 400);
    }
    
    // Get student's stored face data
    const [faceData] = await db.execute(`
      SELECT FaceDescriptor FROM FaceData 
      WHERE PersonType = 'student' AND PersonCode = ?
      ORDER BY CreatedDate DESC LIMIT 1
    `, [StudentCode]);
    
    if (faceData.length === 0) {
      return errorResponse(res, 'No face data found for this student. Please register face first.', 404);
    }
    
    // Get student details
    const [student] = await db.execute(`
      SELECT Id, StudentCode, StudentName, StudentNickname, Campus, Form 
      FROM Student WHERE StudentCode = ?
    `, [StudentCode]);
    
    if (student.length === 0) {
      return notFoundResponse(res, 'Student');
    }
    
    const storedDescriptor = faceData[0].FaceDescriptor;
    
    successResponse(res, {
      student: student[0],
      storedFaceDescriptor: storedDescriptor,
      providedFaceDescriptor: FaceDescriptor,
      sessionId: SessionId,
      // Note: Face comparison should be done in frontend with Google AI
      message: 'Student face descriptors retrieved for comparison'
    }, 'Student face verification data retrieved');
    
  } catch (error) {
    console.error('Error verifying student face:', error);
    errorResponse(res, 'Failed to verify student face');
  }
});

// POST /auth/mark-attendance - Mark attendance after successful face verification
router.post('/mark-attendance', async (req, res) => {
  try {
    const { SessionId, StudentCode, Status = 'Present', AttendanceDate } = req.body;
    
    if (!SessionId || !StudentCode) {
      return errorResponse(res, 'SessionId and StudentCode are required', 400);
    }
    
    // Check if attendance already exists
    const [existing] = await db.execute(
      'SELECT Id FROM AttendanceRecords WHERE SessionId = ? AND StudentCode = ?',
      [SessionId, StudentCode]
    );
    
    if (existing.length > 0) {
      // Update existing attendance
      await db.execute(
        'UPDATE AttendanceRecords SET Status = ?, AttendanceDate = ? WHERE SessionId = ? AND StudentCode = ?',
        [Status, AttendanceDate || new Date().toISOString().split('T')[0], SessionId, StudentCode]
      );
      
      const [updated] = await db.execute(`
        SELECT a.*, s.SessionName, st.StudentName, st.StudentNickname
        FROM AttendanceRecords a
        LEFT JOIN Sessions s ON a.SessionId = s.Id
        LEFT JOIN Student st ON a.StudentCode = st.StudentCode
        WHERE a.SessionId = ? AND a.StudentCode = ?
      `, [SessionId, StudentCode]);
      
      successResponse(res, updated[0], 'Attendance updated successfully');
    } else {
      // Create new attendance record
      const [result] = await db.execute(
        'INSERT INTO AttendanceRecords (SessionId, StudentCode, Status, AttendanceDate) VALUES (?, ?, ?, ?)',
        [SessionId, StudentCode, Status, AttendanceDate || new Date().toISOString().split('T')[0]]
      );
      
      const [newAttendance] = await db.execute(`
        SELECT a.*, s.SessionName, st.StudentName, st.StudentNickname
        FROM AttendanceRecords a
        LEFT JOIN Sessions s ON a.SessionId = s.Id
        LEFT JOIN Student st ON a.StudentCode = st.StudentCode
        WHERE a.Id = ?
      `, [result.insertId]);
      
      successResponse(res, newAttendance[0], 'Attendance marked successfully');
    }
    
  } catch (error) {
    console.error('Error marking attendance:', error);
    errorResponse(res, 'Failed to mark attendance');
  }
});

module.exports = router;