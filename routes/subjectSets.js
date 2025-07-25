const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateSubjectSet } = require('../middleware/validation');
const { successResponse, errorResponse, notFoundResponse, createdResponse } = require('../utils/responseHandler');

// GET /subject-sets - Get all subject sets
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM SubjectSet ORDER BY CreatedDate DESC');
    successResponse(res, rows, 'Subject sets retrieved successfully');
  } catch (error) {
    console.error('Error fetching subject sets:', error);
    errorResponse(res, 'Failed to fetch subject sets');
  }
});

// GET /subject-sets/:id - Get subject set by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM SubjectSet WHERE Id = ?', [id]);
    
    if (rows.length === 0) {
      return notFoundResponse(res, 'Subject set');
    }
    
    successResponse(res, rows[0], 'Subject set retrieved successfully');
  } catch (error) {
    console.error('Error fetching subject set:', error);
    errorResponse(res, 'Failed to fetch subject set');
  }
});

// POST /subject-sets - Create new subject set
router.post('/', validateSubjectSet, async (req, res) => {
  try {
    const {
      Campus,
      SubjectSetID,
      Subject,
      SubjectSetDescription,
      Credits
    } = req.body;
    
    // Check if subject set ID already exists for the same campus
    const [existing] = await db.execute('SELECT Id FROM SubjectSet WHERE SubjectSetID = ? AND Campus = ?', [SubjectSetID, Campus]);
    if (existing.length > 0) {
      return errorResponse(res, 'Subject set ID already exists for this campus', 400);
    }
    
    const [result] = await db.execute(
      `INSERT INTO SubjectSet (Campus, SubjectSetID, Subject, SubjectSetDescription, Credits) 
       VALUES (?, ?, ?, ?, ?)`,
      [Campus, SubjectSetID, Subject, SubjectSetDescription || null, Credits]
    );
    
    const [newSubjectSet] = await db.execute('SELECT * FROM SubjectSet WHERE Id = ?', [result.insertId]);
    createdResponse(res, newSubjectSet[0], 'Subject set created successfully');
  } catch (error) {
    console.error('Error creating subject set:', error);
    errorResponse(res, 'Failed to create subject set');
  }
});

module.exports = router;
