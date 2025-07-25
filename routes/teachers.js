const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateTeacher } = require('../middleware/validation');
const { successResponse, errorResponse, notFoundResponse, createdResponse } = require('../utils/responseHandler');

// GET /teachers - Get all teachers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Teacher ORDER BY CreatedDate DESC');
    successResponse(res, rows, 'Teachers retrieved successfully');
  } catch (error) {
    console.error('Error fetching teachers:', error);
    errorResponse(res, 'Failed to fetch teachers');
  }
});

// GET /teachers/:id - Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM Teacher WHERE Id = ?', [id]);
    
    if (rows.length === 0) {
      return notFoundResponse(res, 'Teacher');
    }
    
    successResponse(res, rows[0], 'Teacher retrieved successfully');
  } catch (error) {
    console.error('Error fetching teacher:', error);
    errorResponse(res, 'Failed to fetch teacher');
  }
});

// POST /teachers - Create new teacher
router.post('/', validateTeacher, async (req, res) => {
  try {
    const {
      TeacherCode,
      TeacherNickname,
      TeacherName,
      TeacherImage,
      EmailAddress,
      Campus,
      Department
    } = req.body;
    
    // Check if teacher code already exists
    const [existing] = await db.execute('SELECT Id FROM Teacher WHERE TeacherCode = ?', [TeacherCode]);
    if (existing.length > 0) {
      return errorResponse(res, 'Teacher code already exists', 400);
    }
    
    // Convert base64 image to buffer if provided
    let imageBuffer = null;
    if (TeacherImage) {
      try {
        imageBuffer = Buffer.from(TeacherImage, 'base64');
      } catch (err) {
        return errorResponse(res, 'Invalid image data format', 400);
      }
    }
    
    const [result] = await db.execute(
      `INSERT INTO Teacher (TeacherCode, TeacherNickname, TeacherName, TeacherImage, EmailAddress, Campus, Department) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [TeacherCode, TeacherNickname, TeacherName, imageBuffer, EmailAddress, Campus, Department]
    );
    
    const [newTeacher] = await db.execute('SELECT * FROM Teacher WHERE Id = ?', [result.insertId]);
    createdResponse(res, newTeacher[0], 'Teacher created successfully');
  } catch (error) {
    console.error('Error creating teacher:', error);
    errorResponse(res, 'Failed to create teacher');
  }
});

// PUT /teachers/:id - Update teacher
router.put('/:id', validateTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      TeacherCode,
      TeacherNickname,
      TeacherName,
      TeacherImage,
      EmailAddress,
      Campus,
      Department
    } = req.body;
    
    // Check if teacher exists
    const [existing] = await db.execute('SELECT Id FROM Teacher WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Teacher');
    }
    
    // Check if teacher code already exists for other teachers
    const [codeCheck] = await db.execute('SELECT Id FROM Teacher WHERE TeacherCode = ? AND Id != ?', [TeacherCode, id]);
    if (codeCheck.length > 0) {
      return errorResponse(res, 'Teacher code already exists', 400);
    }
    
    // Convert base64 image to buffer if provided
    let imageBuffer = null;
    if (TeacherImage) {
      try {
        imageBuffer = Buffer.from(TeacherImage, 'base64');
      } catch (err) {
        return errorResponse(res, 'Invalid image data format', 400);
      }
    }
    
    await db.execute(
      `UPDATE Teacher SET TeacherCode = ?, TeacherNickname = ?, TeacherName = ?, 
       TeacherImage = ?, EmailAddress = ?, Campus = ?, Department = ? WHERE Id = ?`,
      [TeacherCode, TeacherNickname, TeacherName, imageBuffer, EmailAddress, Campus, Department, id]
    );
    
    const [updatedTeacher] = await db.execute('SELECT * FROM Teacher WHERE Id = ?', [id]);
    successResponse(res, updatedTeacher[0], 'Teacher updated successfully');
  } catch (error) {
    console.error('Error updating teacher:', error);
    errorResponse(res, 'Failed to update teacher');
  }
});

// DELETE /teachers/:id - Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if teacher exists
    const [existing] = await db.execute('SELECT Id FROM Teacher WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Teacher');
    }
    
    await db.execute('DELETE FROM Teacher WHERE Id = ?', [id]);
    successResponse(res, null, 'Teacher deleted successfully');
  } catch (error) {
    console.error('Error deleting teacher:', error);
    errorResponse(res, 'Failed to delete teacher');
  }
});

module.exports = router;
