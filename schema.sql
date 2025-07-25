-- -------------------------
-- Student Table
-- -------------------------
CREATE TABLE Student (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    StudentCode CHAR(10),
    StudentNickname VARCHAR(100),
    StudentName VARCHAR(200),
    StudentImage LONGBLOB,
    EmailAddress VARCHAR(100),
    Campus VARCHAR(50),
    Form VARCHAR(100),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Teacher Table
-- -------------------------
CREATE TABLE Teacher (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TeacherCode CHAR(10),
    TeacherNickname VARCHAR(100),
    TeacherName VARCHAR(200),
    TeacherImage LONGBLOB,
    EmailAddress VARCHAR(100),
    Campus VARCHAR(50),
    Department VARCHAR(100),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- SubjectSet Table
-- -------------------------
CREATE TABLE SubjectSet (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Campus CHAR(10),
    SubjectSetID VARCHAR(50),
    Subject VARCHAR(100),
    SubjectSetDescription VARCHAR(200),
    Credits INT DEFAULT 3,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Class Table
-- -------------------------
CREATE TABLE Class (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Campus CHAR(10),
    SubjectSetID VARCHAR(50),
    TeacherCode CHAR(10),
    StudentCode CHAR(10),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Sessions Table
-- -------------------------
CREATE TABLE Sessions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    SessionName VARCHAR(100) NOT NULL,
    SubjectSetID VARCHAR(50) NOT NULL,
    TeacherCode CHAR(10) NOT NULL,
    Campus CHAR(10),
    SessionDate DATE NOT NULL,
    StartTime TIME,
    EndTime TIME,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- AttendanceRecords Table
-- -------------------------
CREATE TABLE AttendanceRecords (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    SessionId INT NOT NULL,
    StudentCode CHAR(10) NOT NULL,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Present', 'Absent', 'Late')),
    AttendanceDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SessionId) REFERENCES Sessions(Id)
);

-- -------------------------
-- FaceData Table
-- -------------------------
CREATE TABLE FaceData (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PersonType VARCHAR(20) NOT NULL CHECK (PersonType IN ('student', 'teacher')),
    PersonCode CHAR(10) NOT NULL,
    ImageData LONGBLOB NOT NULL,
    FaceDescriptor TEXT,
    OriginalName VARCHAR(255) NOT NULL,
    ContentType VARCHAR(100) NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Indexes
-- -------------------------
CREATE INDEX IX_AttendanceRecords_Date ON AttendanceRecords (AttendanceDate);
CREATE INDEX IX_AttendanceRecords_Session ON AttendanceRecords (SessionId);
CREATE INDEX IX_AttendanceRecords_Student ON AttendanceRecords (StudentCode);

CREATE INDEX IX_FaceData_Person ON FaceData (PersonType, PersonCode);

CREATE INDEX IX_Sessions_Date ON Sessions (SessionDate);
CREATE INDEX IX_Sessions_Teacher ON Sessions (TeacherCode);

CREATE INDEX IX_Class_SubjectSet ON Class (SubjectSetID);
CREATE INDEX IX_Class_Teacher ON Class (TeacherCode);
CREATE INDEX IX_Class_Student ON Class (StudentCode);