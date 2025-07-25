// Validation middleware for API requests

const validateStudent = (req, res, next) => {
  const { StudentCode, StudentNickname, StudentName, EmailAddress, Campus, Form } = req.body;
  
  const errors = [];
  
  if (!StudentCode) errors.push('StudentCode is required');
  if (!StudentNickname) errors.push('StudentNickname is required');
  if (!StudentName) errors.push('StudentName is required');
  if (!EmailAddress) errors.push('EmailAddress is required');
  if (!Campus) errors.push('Campus is required');
  if (!Form) errors.push('Form is required');
  
  // Validate email format
  if (EmailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmailAddress)) {
    errors.push('Invalid email format');
  }
  
  // Validate StudentCode length
  if (StudentCode && StudentCode.length > 10) {
    errors.push('StudentCode must be 10 characters or less');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateTeacher = (req, res, next) => {
  const { TeacherCode, TeacherNickname, TeacherName, EmailAddress, Campus, Department } = req.body;
  
  const errors = [];
  
  if (!TeacherCode) errors.push('TeacherCode is required');
  if (!TeacherNickname) errors.push('TeacherNickname is required');
  if (!TeacherName) errors.push('TeacherName is required');
  if (!EmailAddress) errors.push('EmailAddress is required');
  if (!Campus) errors.push('Campus is required');
  if (!Department) errors.push('Department is required');
  
  // Validate email format
  if (EmailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmailAddress)) {
    errors.push('Invalid email format');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateSubjectSet = (req, res, next) => {
  const { Campus, SubjectSetID, Subject, SubjectSetDescription, Credits } = req.body;
  
  const errors = [];
  
  if (!Campus) errors.push('Campus is required');
  if (!SubjectSetID) errors.push('SubjectSetID is required');
  if (!Subject) errors.push('Subject is required');
  // Credits has DEFAULT 3, so not required
  
  // Validate Campus length (CHAR(10) in database)
  if (Campus && Campus.length > 10) {
    errors.push('Campus must be 10 characters or less');
  }
  
  // Validate SubjectSetID length (VARCHAR(50) in database)
  if (SubjectSetID && SubjectSetID.length > 50) {
    errors.push('SubjectSetID must be 50 characters or less');
  }
  
  // Validate Subject length (VARCHAR(100) in database)
  if (Subject && Subject.length > 100) {
    errors.push('Subject must be 100 characters or less');
  }
  
  // Validate SubjectSetDescription length (VARCHAR(200) in database)
  if (SubjectSetDescription && SubjectSetDescription.length > 200) {
    errors.push('SubjectSetDescription must be 200 characters or less');
  }
  
  // Validate Credits is a number
  if (Credits !== undefined && isNaN(Credits)) {
    errors.push('Credits must be a number');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateClass = (req, res, next) => {
  const { Campus, SubjectSetID, TeacherCode, StudentCode } = req.body;
  
  const errors = [];
  
  if (!Campus) errors.push('Campus is required');
  if (!SubjectSetID) errors.push('SubjectSetID is required');
  if (!TeacherCode) errors.push('TeacherCode is required');
  if (!StudentCode) errors.push('StudentCode is required');
  
  // Validate Campus length (CHAR(10) in database)
  if (Campus && Campus.length > 10) {
    errors.push('Campus must be 10 characters or less');
  }
  
  // Validate SubjectSetID length (VARCHAR(50) in database)
  if (SubjectSetID && SubjectSetID.length > 50) {
    errors.push('SubjectSetID must be 50 characters or less');
  }
  
  // Validate TeacherCode length (CHAR(10) in database)
  if (TeacherCode && TeacherCode.length > 10) {
    errors.push('TeacherCode must be 10 characters or less');
  }
  
  // Validate StudentCode length (CHAR(10) in database)
  if (StudentCode && StudentCode.length > 10) {
    errors.push('StudentCode must be 10 characters or less');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateSession = (req, res, next) => {
  const { SessionName, SubjectSetID, TeacherCode, Campus, SessionDate, StartTime, EndTime } = req.body;
  
  const errors = [];
  
  if (!SessionName) errors.push('SessionName is required');
  if (!SubjectSetID) errors.push('SubjectSetID is required');
  if (!TeacherCode) errors.push('TeacherCode is required');
  if (!SessionDate) errors.push('SessionDate is required');
  // Campus, StartTime, EndTime are optional in schema
  
  // Validate SessionName length (VARCHAR(100) in database)
  if (SessionName && SessionName.length > 100) {
    errors.push('SessionName must be 100 characters or less');
  }
  
  // Validate SubjectSetID length (VARCHAR(50) in database)
  if (SubjectSetID && SubjectSetID.length > 50) {
    errors.push('SubjectSetID must be 50 characters or less');
  }
  
  // Validate TeacherCode length (CHAR(10) in database)
  if (TeacherCode && TeacherCode.length > 10) {
    errors.push('TeacherCode must be 10 characters or less');
  }
  
  // Validate Campus length (CHAR(10) in database)
  if (Campus && Campus.length > 10) {
    errors.push('Campus must be 10 characters or less');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateAttendance = (req, res, next) => {
  const { SessionId, StudentCode, Status, AttendanceDate } = req.body;
  
  const errors = [];
  const validStatuses = ['Present', 'Absent', 'Late'];
  
  if (!SessionId) errors.push('SessionId is required');
  if (!StudentCode) errors.push('StudentCode is required');
  if (!Status) errors.push('Status is required');
  // AttendanceDate has DEFAULT CURRENT_TIMESTAMP, so not required
  
  // Validate StudentCode length (CHAR(10) in database)
  if (StudentCode && StudentCode.length > 10) {
    errors.push('StudentCode must be 10 characters or less');
  }
  
  // Validate Status length (VARCHAR(20) with CHECK constraint)
  if (Status && Status.length > 20) {
    errors.push('Status must be 20 characters or less');
  }
  
  // Validate Status enum
  if (Status && !validStatuses.includes(Status)) {
    errors.push('Status must be one of: Present, Absent, Late');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateFaceData = (req, res, next) => {
  const { PersonType, PersonCode, ImageData, FaceDescriptor, OriginalName, ContentType } = req.body;
  
  const errors = [];
  const validPersonTypes = ['student', 'teacher']; // Match database CHECK constraint
  
  if (!PersonType) errors.push('PersonType is required');
  if (!PersonCode) errors.push('PersonCode is required');
  if (!ImageData) errors.push('ImageData is required');
  if (!OriginalName) errors.push('OriginalName is required');
  if (!ContentType) errors.push('ContentType is required');
  
  // Validate PersonType enum - must match database CHECK constraint exactly
  if (PersonType && !validPersonTypes.includes(PersonType)) {
    errors.push('PersonType must be either "student" or "teacher"');
  }
  
  // Validate PersonCode length (CHAR(10) in database)
  if (PersonCode && PersonCode.length > 10) {
    errors.push('PersonCode must be 10 characters or less');
  }
  
  // Validate OriginalName length (VARCHAR(255) in database, NOT NULL)
  if (OriginalName && OriginalName.length > 255) {
    errors.push('OriginalName must be 255 characters or less');
  }
  
  // Validate ContentType length (VARCHAR(100) in database, NOT NULL)
  if (ContentType && ContentType.length > 100) {
    errors.push('ContentType must be 100 characters or less');
  }
  
  // Validate ImageData is base64
  if (ImageData && !isBase64(ImageData)) {
    errors.push('ImageData must be valid base64 encoded string');
  }
  
  // Validate FaceDescriptor is valid JSON if provided (TEXT field, nullable)
  if (FaceDescriptor) {
    try {
      JSON.parse(FaceDescriptor);
    } catch (err) {
      errors.push('FaceDescriptor must be valid JSON format');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// Helper function to validate base64
const isBase64 = (str) => {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    // For Node.js environment
    try {
      return Buffer.from(str, 'base64').toString('base64') === str;
    } catch (e) {
      return false;
    }
  }
};

module.exports = {
  validateStudent,
  validateTeacher,
  validateSubjectSet,
  validateClass,
  validateSession,
  validateAttendance,
  validateFaceData
};
