const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateSession } = require('../middleware/validation');
const { successResponse, errorResponse, notFoundResponse, createdResponse } = require('../utils/responseHandler');

// GET /sessions - Get all sessions
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT s.*, ss.Subject, t.TeacherName
      FROM Sessions s
      LEFT JOIN SubjectSet ss ON s.SubjectSetID = ss.SubjectSetID AND s.Campus = ss.Campus
      LEFT JOIN Teacher t ON s.TeacherCode = t.TeacherCode
      ORDER BY s.SessionDate DESC, s.StartTime DESC
    `);
    successResponse(res, rows, 'Sessions retrieved successfully');
  } catch (error) {
    console.error('Error fetching sessions:', error);
    errorResponse(res, 'Failed to fetch sessions');
  }
});

// GET /sessions/:id - Get session by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT s.*, ss.Subject, t.TeacherName
      FROM Sessions s
      LEFT JOIN SubjectSet ss ON s.SubjectSetID = ss.SubjectSetID AND s.Campus = ss.Campus
      LEFT JOIN Teacher t ON s.TeacherCode = t.TeacherCode
      WHERE s.Id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return notFoundResponse(res, 'Session');
    }
    
    successResponse(res, rows[0], 'Session retrieved successfully');
  } catch (error) {
    console.error('Error fetching session:', error);
    errorResponse(res, 'Failed to fetch session');
  }
});

// POST /sessions - Create new session
router.post('/', validateSession, async (req, res) => {
  try {
    const {
      SessionName,
      SubjectSetID,
      TeacherCode,
      Campus,
      SessionDate,
      StartTime,
      EndTime
    } = req.body;
    
    // Verify subject set exists
    const [subjectExists] = await db.execute('SELECT Id FROM SubjectSet WHERE SubjectSetID = ? AND Campus = ?', [SubjectSetID, Campus]);
    if (subjectExists.length === 0) {
      return errorResponse(res, 'Subject set not found for this campus', 400);
    }
    
    // Verify teacher exists
    const [teacherExists] = await db.execute('SELECT Id FROM Teacher WHERE TeacherCode = ?', [TeacherCode]);
    if (teacherExists.length === 0) {
      return errorResponse(res, 'Teacher not found', 400);
    }
    
    // Validate time format (basic check)
    if (StartTime >= EndTime) {
      return errorResponse(res, 'Start time must be before end time', 400);
    }
    
    const [result] = await db.execute(
      `INSERT INTO Sessions (SessionName, SubjectSetID, TeacherCode, Campus, SessionDate, StartTime, EndTime) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [SessionName, SubjectSetID, TeacherCode, Campus, SessionDate, StartTime, EndTime]
    );
    
    const [newSession] = await db.execute(`
      SELECT s.*, ss.Subject, t.TeacherName
      FROM Sessions s
      LEFT JOIN SubjectSet ss ON s.SubjectSetID = ss.SubjectSetID AND s.Campus = ss.Campus
      LEFT JOIN Teacher t ON s.TeacherCode = t.TeacherCode
      WHERE s.Id = ?
    `, [result.insertId]);
    
    createdResponse(res, newSession[0], 'Session created successfully');
  } catch (error) {
    console.error('Error creating session:', error);
    errorResponse(res, 'Failed to create session');
  }
});

// PUT /sessions/:id - Update session
router.put('/:id', validateSession, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      SessionName,
      SubjectSetID,
      TeacherCode,
      Campus,
      SessionDate,
      StartTime,
      EndTime
    } = req.body;
    
    // Check if session exists
    const [existing] = await db.execute('SELECT Id FROM Sessions WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Session');
    }
    
    // Verify subject set exists
    const [subjectExists] = await db.execute('SELECT Id FROM SubjectSet WHERE SubjectSetID = ? AND Campus = ?', [SubjectSetID, Campus]);
    if (subjectExists.length === 0) {
      return errorResponse(res, 'Subject set not found for this campus', 400);
    }
    
    // Verify teacher exists
    const [teacherExists] = await db.execute('SELECT Id FROM Teacher WHERE TeacherCode = ?', [TeacherCode]);
    if (teacherExists.length === 0) {
      return errorResponse(res, 'Teacher not found', 400);
    }
    
    // Validate time format
    if (StartTime >= EndTime) {
      return errorResponse(res, 'Start time must be before end time', 400);
    }
    
    await db.execute(
      `UPDATE Sessions SET SessionName = ?, SubjectSetID = ?, TeacherCode = ?, 
       Campus = ?, SessionDate = ?, StartTime = ?, EndTime = ? WHERE Id = ?`,
      [SessionName, SubjectSetID, TeacherCode, Campus, SessionDate, StartTime, EndTime, id]
    );
    
    const [updatedSession] = await db.execute(`
      SELECT s.*, ss.Subject, t.TeacherName
      FROM Sessions s
      LEFT JOIN SubjectSet ss ON s.SubjectSetID = ss.SubjectSetID AND s.Campus = ss.Campus
      LEFT JOIN Teacher t ON s.TeacherCode = t.TeacherCode
      WHERE s.Id = ?
    `, [id]);
    
    successResponse(res, updatedSession[0], 'Session updated successfully');
  } catch (error) {
    console.error('Error updating session:', error);
    errorResponse(res, 'Failed to update session');
  }
});

module.exports = router;
