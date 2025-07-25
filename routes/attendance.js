const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateAttendance } = require('../middleware/validation');
const { successResponse, errorResponse, notFoundResponse, createdResponse } = require('../utils/responseHandler');

// GET /attendance - Get all attendance records
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.*, s.SessionName, st.StudentName, st.StudentNickname
      FROM AttendanceRecords a
      LEFT JOIN Sessions s ON a.SessionId = s.Id
      LEFT JOIN Student st ON a.StudentCode = st.StudentCode
      ORDER BY a.AttendanceDate DESC, a.CreatedDate DESC
    `);
    successResponse(res, rows, 'Attendance records retrieved successfully');
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    errorResponse(res, 'Failed to fetch attendance records');
  }
});

// GET /attendance/session/:sessionId - Get attendance records for a specific session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify session exists
    const [sessionExists] = await db.execute('SELECT Id FROM Sessions WHERE Id = ?', [sessionId]);
    if (sessionExists.length === 0) {
      return notFoundResponse(res, 'Session');
    }
    
    const [rows] = await db.execute(`
      SELECT a.*, s.SessionName, st.StudentName, st.StudentNickname
      FROM AttendanceRecords a
      LEFT JOIN Sessions s ON a.SessionId = s.Id
      LEFT JOIN Student st ON a.StudentCode = st.StudentCode
      WHERE a.SessionId = ?
      ORDER BY st.StudentName
    `, [sessionId]);
    
    successResponse(res, rows, 'Session attendance records retrieved successfully');
  } catch (error) {
    console.error('Error fetching session attendance:', error);
    errorResponse(res, 'Failed to fetch session attendance records');
  }
});

// POST /attendance - Create new attendance record
router.post('/', validateAttendance, async (req, res) => {
  try {
    const {
      SessionId,
      StudentCode,
      Status,
      AttendanceDate
    } = req.body;
    
    // Verify session exists
    const [sessionExists] = await db.execute('SELECT Id FROM Sessions WHERE Id = ?', [SessionId]);
    if (sessionExists.length === 0) {
      return errorResponse(res, 'Session not found', 400);
    }
    
    // Verify student exists
    const [studentExists] = await db.execute('SELECT Id FROM Student WHERE StudentCode = ?', [StudentCode]);
    if (studentExists.length === 0) {
      return errorResponse(res, 'Student not found', 400);
    }
    
    // Check if attendance record already exists for this session and student
    const [existing] = await db.execute(
      'SELECT Id FROM AttendanceRecords WHERE SessionId = ? AND StudentCode = ?',
      [SessionId, StudentCode]
    );
    if (existing.length > 0) {
      return errorResponse(res, 'Attendance record already exists for this student in this session', 400);
    }
    
    const [result] = await db.execute(
      `INSERT INTO AttendanceRecords (SessionId, StudentCode, Status, AttendanceDate) 
       VALUES (?, ?, ?, ?)`,
      [SessionId, StudentCode, Status, AttendanceDate]
    );
    
    const [newAttendance] = await db.execute(`
      SELECT a.*, s.SessionName, st.StudentName, st.StudentNickname
      FROM AttendanceRecords a
      LEFT JOIN Sessions s ON a.SessionId = s.Id
      LEFT JOIN Student st ON a.StudentCode = st.StudentCode
      WHERE a.Id = ?
    `, [result.insertId]);
    
    createdResponse(res, newAttendance[0], 'Attendance record created successfully');
  } catch (error) {
    console.error('Error creating attendance record:', error);
    errorResponse(res, 'Failed to create attendance record');
  }
});

// PUT /attendance/:id - Update attendance record
router.put('/:id', validateAttendance, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      SessionId,
      StudentCode,
      Status,
      AttendanceDate
    } = req.body;
    
    // Check if attendance record exists
    const [existing] = await db.execute('SELECT Id FROM AttendanceRecords WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Attendance record');
    }
    
    // Verify session exists
    const [sessionExists] = await db.execute('SELECT Id FROM Sessions WHERE Id = ?', [SessionId]);
    if (sessionExists.length === 0) {
      return errorResponse(res, 'Session not found', 400);
    }
    
    // Verify student exists
    const [studentExists] = await db.execute('SELECT Id FROM Student WHERE StudentCode = ?', [StudentCode]);
    if (studentExists.length === 0) {
      return errorResponse(res, 'Student not found', 400);
    }
    
    // Check if another attendance record exists for this session and student
    const [duplicateCheck] = await db.execute(
      'SELECT Id FROM AttendanceRecords WHERE SessionId = ? AND StudentCode = ? AND Id != ?',
      [SessionId, StudentCode, id]
    );
    if (duplicateCheck.length > 0) {
      return errorResponse(res, 'Another attendance record already exists for this student in this session', 400);
    }
    
    await db.execute(
      `UPDATE AttendanceRecords SET SessionId = ?, StudentCode = ?, Status = ?, AttendanceDate = ? 
       WHERE Id = ?`,
      [SessionId, StudentCode, Status, AttendanceDate, id]
    );
    
    const [updatedAttendance] = await db.execute(`
      SELECT a.*, s.SessionName, st.StudentName, st.StudentNickname
      FROM AttendanceRecords a
      LEFT JOIN Sessions s ON a.SessionId = s.Id
      LEFT JOIN Student st ON a.StudentCode = st.StudentCode
      WHERE a.Id = ?
    `, [id]);
    
    successResponse(res, updatedAttendance[0], 'Attendance record updated successfully');
  } catch (error) {
    console.error('Error updating attendance record:', error);
    errorResponse(res, 'Failed to update attendance record');
  }
});

module.exports = router;
