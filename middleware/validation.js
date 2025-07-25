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
  const { Campus, SubjectSetID, Subject, Credits } = req.body;
  
  const errors = [];
  
  if (!Campus) errors.push('Campus is required');
  if (!SubjectSetID) errors.push('SubjectSetID is required');
  if (!Subject) errors.push('Subject is required');
  if (Credits === undefined || Credits === null) errors.push('Credits is required');
  
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
  if (!Campus) errors.push('Campus is required');
  if (!SessionDate) errors.push('SessionDate is required');
  if (!StartTime) errors.push('StartTime is required');
  if (!EndTime) errors.push('EndTime is required');
  
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
  if (!AttendanceDate) errors.push('AttendanceDate is required');
  
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
  const validPersonTypes = ['Student', 'Teacher']; // Match database ENUM values
  
  if (!PersonType) errors.push('PersonType is required');
  if (!PersonCode) errors.push('PersonCode is required');
  if (!ImageData) errors.push('ImageData is required');
  // FaceDescriptor is nullable in database, so not required
  
  // Validate PersonType enum - must match database ENUM exactly
  if (PersonType && !validPersonTypes.includes(PersonType)) {
    errors.push('PersonType must be either "Student" or "Teacher"');
  }
  
  // Validate PersonCode length (char(10) in database)
  if (PersonCode && PersonCode.length > 10) {
    errors.push('PersonCode must be 10 characters or less');
  }
  
  // Validate OriginalName length (varchar(255) in database)
  if (OriginalName && OriginalName.length > 255) {
    errors.push('OriginalName must be 255 characters or less');
  }
  
  // Validate ContentType length (varchar(100) in database)
  if (ContentType && ContentType.length > 100) {
    errors.push('ContentType must be 100 characters or less');
  }
  
  // Validate ImageData is base64
  if (ImageData && !isBase64(ImageData)) {
    errors.push('ImageData must be valid base64 encoded string');
  }
  
  // Validate FaceDescriptor is valid JSON if provided
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
