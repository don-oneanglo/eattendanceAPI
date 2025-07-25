const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateClass } = require('../middleware/validation');
const { successResponse, errorResponse, notFoundResponse, createdResponse } = require('../utils/responseHandler');

// GET /classes - Get all classes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.*, s.Subject, t.TeacherName, st.StudentName 
      FROM Class c
      LEFT JOIN SubjectSet s ON c.SubjectSetID = s.SubjectSetID AND c.Campus = s.Campus
      LEFT JOIN Teacher t ON c.TeacherCode = t.TeacherCode
      LEFT JOIN Student st ON c.StudentCode = st.StudentCode
      ORDER BY c.CreatedDate DESC
    `);
    successResponse(res, rows, 'Classes retrieved successfully');
  } catch (error) {
    console.error('Error fetching classes:', error);
    errorResponse(res, 'Failed to fetch classes');
  }
});

// GET /classes/:id - Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT c.*, s.Subject, t.TeacherName, st.StudentName 
      FROM Class c
      LEFT JOIN SubjectSet s ON c.SubjectSetID = s.SubjectSetID AND c.Campus = s.Campus
      LEFT JOIN Teacher t ON c.TeacherCode = t.TeacherCode
      LEFT JOIN Student st ON c.StudentCode = st.StudentCode
      WHERE c.Id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return notFoundResponse(res, 'Class');
    }
    
    successResponse(res, rows[0], 'Class retrieved successfully');
  } catch (error) {
    console.error('Error fetching class:', error);
    errorResponse(res, 'Failed to fetch class');
  }
});

// POST /classes - Create new class
router.post('/', validateClass, async (req, res) => {
  try {
    const {
      Campus,
      SubjectSetID,
      TeacherCode,
      StudentCode
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
    
    // Verify student exists
    const [studentExists] = await db.execute('SELECT Id FROM Student WHERE StudentCode = ?', [StudentCode]);
    if (studentExists.length === 0) {
      return errorResponse(res, 'Student not found', 400);
    }
    
    // Check if class already exists
    const [existing] = await db.execute(
      'SELECT Id FROM Class WHERE Campus = ? AND SubjectSetID = ? AND TeacherCode = ? AND StudentCode = ?',
      [Campus, SubjectSetID, TeacherCode, StudentCode]
    );
    if (existing.length > 0) {
      return errorResponse(res, 'Class enrollment already exists', 400);
    }
    
    const [result] = await db.execute(
      `INSERT INTO Class (Campus, SubjectSetID, TeacherCode, StudentCode) 
       VALUES (?, ?, ?, ?)`,
      [Campus, SubjectSetID, TeacherCode, StudentCode]
    );
    
    const [newClass] = await db.execute(`
      SELECT c.*, s.Subject, t.TeacherName, st.StudentName 
      FROM Class c
      LEFT JOIN SubjectSet s ON c.SubjectSetID = s.SubjectSetID AND c.Campus = s.Campus
      LEFT JOIN Teacher t ON c.TeacherCode = t.TeacherCode
      LEFT JOIN Student st ON c.StudentCode = st.StudentCode
      WHERE c.Id = ?
    `, [result.insertId]);
    
    createdResponse(res, newClass[0], 'Class created successfully');
  } catch (error) {
    console.error('Error creating class:', error);
    errorResponse(res, 'Failed to create class');
  }
});

module.exports = router;
