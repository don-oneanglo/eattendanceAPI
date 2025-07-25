const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateFaceData } = require('../middleware/validation');
const { successResponse, errorResponse, notFoundResponse, createdResponse } = require('../utils/responseHandler');

// GET /face-data/:personCode - Get face data for a person
router.get('/:personCode', async (req, res) => {
  try {
    const { personCode } = req.params;
    const [rows] = await db.execute('SELECT * FROM FaceData WHERE PersonCode = ? ORDER BY CreatedDate DESC', [personCode]);
    
    if (rows.length === 0) {
      return notFoundResponse(res, 'Face data');
    }
    
    successResponse(res, rows, 'Face data retrieved successfully');
  } catch (error) {
    console.error('Error fetching face data:', error);
    errorResponse(res, 'Failed to fetch face data');
  }
});

// POST /face-data - Create new face data record
router.post('/', validateFaceData, async (req, res) => {
  try {
    const {
      PersonType,
      PersonCode,
      ImageData,
      FaceDescriptor,
      OriginalName,
      ContentType
    } = req.body;
    
    // Verify person exists based on type (case-sensitive to match database ENUM)
    if (PersonType === 'Student') {
      const [studentExists] = await db.execute('SELECT Id FROM Student WHERE StudentCode = ?', [PersonCode]);
      if (studentExists.length === 0) {
        return errorResponse(res, 'Student not found', 400);
      }
    } else if (PersonType === 'Teacher') {
      const [teacherExists] = await db.execute('SELECT Id FROM Teacher WHERE TeacherCode = ?', [PersonCode]);
      if (teacherExists.length === 0) {
        return errorResponse(res, 'Teacher not found', 400);
      }
    }
    
    // Convert base64 image to buffer
    let imageBuffer = null;
    try {
      imageBuffer = Buffer.from(ImageData, 'base64');
    } catch (err) {
      return errorResponse(res, 'Invalid image data format', 400);
    }
    
    // Validate FaceDescriptor is valid JSON if provided (it's nullable in database)
    let parsedDescriptor = null;
    if (FaceDescriptor) {
      try {
        parsedDescriptor = JSON.parse(FaceDescriptor);
      } catch (err) {
        return errorResponse(res, 'Invalid face descriptor JSON format', 400);
      }
    }
    
    const [result] = await db.execute(
      `INSERT INTO FaceData (PersonType, PersonCode, ImageData, FaceDescriptor, OriginalName, ContentType) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [PersonType, PersonCode, imageBuffer, FaceDescriptor || null, OriginalName || null, ContentType || 'image/jpeg']
    );
    
    const [newFaceData] = await db.execute('SELECT * FROM FaceData WHERE Id = ?', [result.insertId]);
    createdResponse(res, newFaceData[0], 'Face data created successfully');
  } catch (error) {
    console.error('Error creating face data:', error);
    errorResponse(res, 'Failed to create face data');
  }
});

// PUT /face-data/:id - Update face data record
router.put('/:id', validateFaceData, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      PersonType,
      PersonCode,
      ImageData,
      FaceDescriptor,
      OriginalName,
      ContentType
    } = req.body;
    
    // Check if face data exists
    const [existing] = await db.execute('SELECT Id FROM FaceData WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Face data');
    }
    
    // Verify person exists based on type (case-sensitive to match database ENUM)
    if (PersonType === 'Student') {
      const [studentExists] = await db.execute('SELECT Id FROM Student WHERE StudentCode = ?', [PersonCode]);
      if (studentExists.length === 0) {
        return errorResponse(res, 'Student not found', 400);
      }
    } else if (PersonType === 'Teacher') {
      const [teacherExists] = await db.execute('SELECT Id FROM Teacher WHERE TeacherCode = ?', [PersonCode]);
      if (teacherExists.length === 0) {
        return errorResponse(res, 'Teacher not found', 400);
      }
    }
    
    // Convert base64 image to buffer
    let imageBuffer = null;
    try {
      imageBuffer = Buffer.from(ImageData, 'base64');
    } catch (err) {
      return errorResponse(res, 'Invalid image data format', 400);
    }
    
    // Validate FaceDescriptor is valid JSON if provided (it's nullable in database)
    if (FaceDescriptor) {
      try {
        JSON.parse(FaceDescriptor);
      } catch (err) {
        return errorResponse(res, 'Invalid face descriptor JSON format', 400);
      }
    }
    
    await db.execute(
      `UPDATE FaceData SET PersonType = ?, PersonCode = ?, ImageData = ?, FaceDescriptor = ?, OriginalName = ?, ContentType = ? 
       WHERE Id = ?`,
      [PersonType, PersonCode, imageBuffer, FaceDescriptor || null, OriginalName || null, ContentType || 'image/jpeg', id]
    );
    
    const [updatedFaceData] = await db.execute('SELECT * FROM FaceData WHERE Id = ?', [id]);
    successResponse(res, updatedFaceData[0], 'Face data updated successfully');
  } catch (error) {
    console.error('Error updating face data:', error);
    errorResponse(res, 'Failed to update face data');
  }
});

// DELETE /face-data/:id - Delete face data record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if face data exists
    const [existing] = await db.execute('SELECT Id FROM FaceData WHERE Id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Face data');
    }
    
    await db.execute('DELETE FROM FaceData WHERE Id = ?', [id]);
    successResponse(res, null, 'Face data deleted successfully');
  } catch (error) {
    console.error('Error deleting face data:', error);
    errorResponse(res, 'Failed to delete face data');
  }
});

module.exports = router;
