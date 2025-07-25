const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateStudent } = require('../middleware/validation');
const { successResponse, errorResponse, notFoundResponse, createdResponse } = require('../utils/responseHandler');

// GET /students - Get all students
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Student ORDER BY CreatedDate DESC');
    successResponse(res, rows, 'Students retrieved successfully');
  } catch (error) {
    console.error('Error fetching students:', error);
    errorResponse(res, 'Failed to fetch students');
  }
});

// GET /students/:id - Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM Student WHERE Id = ?', [id]);
    
    if (rows.length === 0) {
      return notFoundResponse(res, 'Student');
    }
    
    successResponse(res, rows[0], 'Student retrieved successfully');
  } catch (error) {
    console.error('Error fetching student:', error);
    errorResponse(res, 'Failed to fetch student');
  }
});

// POST /students - Create new student
router.post('/', validateStudent, async (req, res) => {
  try {
    const {
      StudentCode,
      StudentNickname,
      StudentName,
      StudentImage,
      EmailAddress,
      Campus,
      Form
    } = req.body;
    
    // Check if student code already exists
    const [existing] = await db.execute('SELECT Id FROM Student WHERE StudentCode = ?', [StudentCode]);
    if (existing.length > 0) {
      return errorResponse(res, 'Student code already exists', 400);
    }
    
    // Convert base64 image to buffer if provided
    let imageBuffer = null;
    if (StudentImage) {
      try {
        imageBuffer = Buffer.from(StudentImage, 'base64');
      } catch (err) {
        return errorResponse(res, 'Invalid image data format', 400);
      }
    }
    
    const [result] = await db.execute(
      `INSERT INTO Student (StudentCode, StudentNickname, StudentName, StudentImage, EmailAddress, Campus, Form) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [StudentCode, StudentNickname, StudentName, imageBuffer, EmailAddress, Campus, Form]
    );
    
    const [newStudent] = await db.execute('SELECT * FROM Student WHERE Id = ?', [result.insertId]);
    createdResponse(res, newStudent[0], 'Student created successfully');
  } catch (error) {
    console.error('Error creating student:', error);
    errorResponse(res, 'Failed to create student');
  }
});

// PUT /students/:id - Update student
router.put('/:id', validateStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      StudentCode,
      StudentNickname,
      StudentName,
      StudentImage,
      EmailAddress,
      Campus,
      Form
    } = req.body;
    
    // Check if student exists
    const [existing] = await db.execute('SELECT Id FROM Student WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Student');
    }
    
    // Check if student code already exists for other students
    const [codeCheck] = await db.execute('SELECT Id FROM Student WHERE StudentCode = ? AND Id != ?', [StudentCode, id]);
    if (codeCheck.length > 0) {
      return errorResponse(res, 'Student code already exists', 400);
    }
    
    // Convert base64 image to buffer if provided
    let imageBuffer = null;
    if (StudentImage) {
      try {
        imageBuffer = Buffer.from(StudentImage, 'base64');
      } catch (err) {
        return errorResponse(res, 'Invalid image data format', 400);
      }
    }
    
    await db.execute(
      `UPDATE Student SET StudentCode = ?, StudentNickname = ?, StudentName = ?, 
       StudentImage = ?, EmailAddress = ?, Campus = ?, Form = ? WHERE Id = ?`,
      [StudentCode, StudentNickname, StudentName, imageBuffer, EmailAddress, Campus, Form, id]
    );
    
    const [updatedStudent] = await db.execute('SELECT * FROM Student WHERE Id = ?', [id]);
    successResponse(res, updatedStudent[0], 'Student updated successfully');
  } catch (error) {
    console.error('Error updating student:', error);
    errorResponse(res, 'Failed to update student');
  }
});

// DELETE /students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const [existing] = await db.execute('SELECT Id FROM Student WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Student');
    }
    
    await db.execute('DELETE FROM Student WHERE Id = ?', [id]);
    successResponse(res, null, 'Student deleted successfully');
  } catch (error) {
    console.error('Error deleting student:', error);
    errorResponse(res, 'Failed to delete student');
  }
});

module.exports = router;
