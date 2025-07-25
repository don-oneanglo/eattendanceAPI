-- Educational Attendance Management System Database Schema
-- MySQL Database for Hostinger Hosting

-- 1. Student Table
CREATE TABLE IF NOT EXISTS Student (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    StudentCode CHAR(10) NOT NULL UNIQUE,
    StudentNickname VARCHAR(100) NOT NULL,
    StudentName VARCHAR(200) NOT NULL,
    StudentImage LONGBLOB,
    EmailAddress VARCHAR(100) NOT NULL,
    Campus VARCHAR(50) NOT NULL,
    Form VARCHAR(100) NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_code (StudentCode),
    INDEX idx_student_campus (Campus),
    INDEX idx_student_email (EmailAddress)
);

-- 2. Teacher Table
CREATE TABLE IF NOT EXISTS Teacher (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    TeacherCode CHAR(10) NOT NULL UNIQUE,
    TeacherNickname VARCHAR(100) NOT NULL,
    TeacherName VARCHAR(200) NOT NULL,
    TeacherImage LONGBLOB,
    EmailAddress VARCHAR(100) NOT NULL,
    Campus VARCHAR(50) NOT NULL,
    Department VARCHAR(100) NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_teacher_code (TeacherCode),
    INDEX idx_teacher_campus (Campus),
    INDEX idx_teacher_email (EmailAddress)
);

-- 3. SubjectSet Table
CREATE TABLE IF NOT EXISTS SubjectSet (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Campus VARCHAR(50) NOT NULL,
    SubjectSetID VARCHAR(50) NOT NULL,
    Subject VARCHAR(200) NOT NULL,
    SubjectSetDescription TEXT,
    Credits INT NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_subject_campus (SubjectSetID, Campus),
    INDEX idx_subjectset_campus (Campus),
    INDEX idx_subjectset_id (SubjectSetID)
);

-- 4. Class Table
CREATE TABLE IF NOT EXISTS Class (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Campus VARCHAR(50) NOT NULL,
    SubjectSetID VARCHAR(50) NOT NULL,
    TeacherCode CHAR(10) NOT NULL,
    StudentCode CHAR(10) NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_class_enrollment (Campus, SubjectSetID, TeacherCode, StudentCode),
    INDEX idx_class_campus (Campus),
    INDEX idx_class_teacher (TeacherCode),
    INDEX idx_class_student (StudentCode),
    FOREIGN KEY (TeacherCode) REFERENCES Teacher(TeacherCode) ON DELETE CASCADE,
    FOREIGN KEY (StudentCode) REFERENCES Student(StudentCode) ON DELETE CASCADE
);

-- 5. Sessions Table
CREATE TABLE IF NOT EXISTS Sessions (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    SessionName VARCHAR(200) NOT NULL,
    SubjectSetID VARCHAR(50) NOT NULL,
    TeacherCode CHAR(10) NOT NULL,
    Campus VARCHAR(50) NOT NULL,
    SessionDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_date (SessionDate),
    INDEX idx_session_teacher (TeacherCode),
    INDEX idx_session_campus (Campus),
    INDEX idx_session_subject (SubjectSetID),
    FOREIGN KEY (TeacherCode) REFERENCES Teacher(TeacherCode) ON DELETE CASCADE
);

-- 6. AttendanceRecords Table
CREATE TABLE IF NOT EXISTS AttendanceRecords (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    SessionId INT NOT NULL,
    StudentCode CHAR(10) NOT NULL,
    Status ENUM('Present', 'Absent', 'Late') NOT NULL,
    AttendanceDate DATE NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_session_student (SessionId, StudentCode),
    INDEX idx_attendance_session (SessionId),
    INDEX idx_attendance_student (StudentCode),
    INDEX idx_attendance_date (AttendanceDate),
    INDEX idx_attendance_status (Status),
    FOREIGN KEY (SessionId) REFERENCES Sessions(Id) ON DELETE CASCADE,
    FOREIGN KEY (StudentCode) REFERENCES Student(StudentCode) ON DELETE CASCADE
);

-- 7. FaceData Table
CREATE TABLE IF NOT EXISTS FaceData (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PersonType ENUM('student', 'teacher') NOT NULL,
    PersonCode CHAR(10) NOT NULL,
    ImageData LONGBLOB NOT NULL,
    FaceDescriptor TEXT NOT NULL, -- JSON format
    OriginalName VARCHAR(255),
    ContentType VARCHAR(100) DEFAULT 'image/jpeg',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_facedata_person (PersonType, PersonCode),
    INDEX idx_facedata_type (PersonType)
);

-- Create views for common queries
CREATE OR REPLACE VIEW StudentAttendanceSummary AS
SELECT 
    s.StudentCode,
    s.StudentName,
    s.Campus,
    COUNT(ar.Id) AS TotalSessions,
    SUM(CASE WHEN ar.Status = 'Present' THEN 1 ELSE 0 END) AS PresentCount,
    SUM(CASE WHEN ar.Status = 'Absent' THEN 1 ELSE 0 END) AS AbsentCount,
    SUM(CASE WHEN ar.Status = 'Late' THEN 1 ELSE 0 END) AS LateCount,
    ROUND((SUM(CASE WHEN ar.Status = 'Present' THEN 1 ELSE 0 END) / COUNT(ar.Id)) * 100, 2) AS AttendancePercentage
FROM Student s
LEFT JOIN AttendanceRecords ar ON s.StudentCode = ar.StudentCode
GROUP BY s.StudentCode, s.StudentName, s.Campus;

CREATE OR REPLACE VIEW SessionAttendanceSummary AS
SELECT 
    ses.Id AS SessionId,
    ses.SessionName,
    ses.SessionDate,
    ses.Campus,
    ss.Subject,
    t.TeacherName,
    COUNT(ar.Id) AS TotalStudents,
    SUM(CASE WHEN ar.Status = 'Present' THEN 1 ELSE 0 END) AS PresentCount,
    SUM(CASE WHEN ar.Status = 'Absent' THEN 1 ELSE 0 END) AS AbsentCount,
    SUM(CASE WHEN ar.Status = 'Late' THEN 1 ELSE 0 END) AS LateCount
FROM Sessions ses
LEFT JOIN AttendanceRecords ar ON ses.Id = ar.SessionId
LEFT JOIN SubjectSet ss ON ses.SubjectSetID = ss.SubjectSetID AND ses.Campus = ss.Campus
LEFT JOIN Teacher t ON ses.TeacherCode = t.TeacherCode
GROUP BY ses.Id, ses.SessionName, ses.SessionDate, ses.Campus, ss.Subject, t.TeacherName;
