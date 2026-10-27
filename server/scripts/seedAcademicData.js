import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../src/config/env.js';
import { Department } from '../src/models/Department.js';
import { Subject } from '../src/models/Subject.js';
import { Unit } from '../src/models/Unit.js';
import { User } from '../src/models/User.js';
import { Resource } from '../src/models/Resource.js';
import { uploadDir, ensureUploadDirExists } from '../src/config/storage.js';

const seedAcademicData = async () => {
  try {
    ensureUploadDirExists();
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB for Academic data seeding');

    // 1. Seed Departments
    const departmentsData = [
      {
        name: 'Computer Engineering',
        code: 'CE',
        description: 'Department of Computer Engineering & Systems Architecture',
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'Department of Information Technology & Software Systems',
      },
      {
        name: 'Electronics & Communication',
        code: 'EC',
        description: 'Department of Electronics & Communication Engineering',
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Department of Mechanical Engineering & Thermal Sciences',
      },
    ];

    const departmentMap = {};

    for (const dept of departmentsData) {
      let doc = await Department.findOne({ code: dept.code });
      if (!doc) {
        doc = await Department.create(dept);
        console.log(`[Seed] Created Department: ${doc.name} (${doc.code})`);
      } else {
        console.log(`[Seed] Department already exists: ${doc.code}`);
      }
      departmentMap[dept.code] = doc;
    }

    // 2. Seed Subjects
    const ceDept = departmentMap['CE'];
    const itDept = departmentMap['IT'];

    const subjectsData = [
      // CE Sem 1 & 2
      { name: 'Engineering Mathematics I', code: 'MA101', department: ceDept._id, semester: 1 },
      { name: 'Engineering Physics', code: 'PH101', department: ceDept._id, semester: 1 },
      { name: 'Engineering Mathematics II', code: 'MA201', department: ceDept._id, semester: 2 },
      { name: 'Basic Electrical Engineering', code: 'EE201', department: ceDept._id, semester: 2 },
      // CE Sem 3
      { name: 'Data Structures and Algorithms', code: 'CS301', department: ceDept._id, semester: 3 },
      { name: 'Digital Logic and Computer Design', code: 'CS302', department: ceDept._id, semester: 3 },
      // CE Sem 4
      { name: 'Database Management Systems', code: 'CS401', department: ceDept._id, semester: 4 },
      { name: 'Computer Networks', code: 'CS402', department: ceDept._id, semester: 4 },
      // CE Sem 5
      { name: 'Operating Systems', code: 'CS501', department: ceDept._id, semester: 5 },
      { name: 'Software Engineering', code: 'CS502', department: ceDept._id, semester: 5 },
      { name: 'Theory of Computation', code: 'CS503', department: ceDept._id, semester: 5 },
      // CE Sem 6
      { name: 'Artificial Intelligence & Machine Learning', code: 'CS601', department: ceDept._id, semester: 6 },
      { name: 'Compiler Design', code: 'CS602', department: ceDept._id, semester: 6 },
      // IT Sem 5
      { name: 'Web Technologies & Frameworks', code: 'IT501', department: itDept._id, semester: 5 },
      { name: 'Cloud Computing Architecture', code: 'IT502', department: itDept._id, semester: 5 },
    ];

    const subjectMap = {};

    for (const subj of subjectsData) {
      let doc = await Subject.findOne({ code: subj.code, department: subj.department });
      if (!doc) {
        doc = await Subject.create(subj);
        console.log(`[Seed] Created Subject: ${doc.name} (${doc.code}, Sem ${doc.semester})`);
      } else {
        console.log(`[Seed] Subject already exists: ${doc.code}`);
      }
      subjectMap[subj.code] = doc;
    }

    // 3. Seed Units for Operating Systems (CS501)
    const osSubject = subjectMap['CS501'];
    const unitsData = [
      {
        unitNumber: 1,
        title: 'Introduction to Operating Systems and System Structures',
        subject: osSubject._id,
        description: 'OS concepts, system calls, system programs, virtual machines',
      },
      {
        unitNumber: 2,
        title: 'Process Management and Multithreading',
        subject: osSubject._id,
        description: 'Process state, PCB, scheduling queues, IPC, POSIX threads',
      },
      {
        unitNumber: 3,
        title: 'CPU Scheduling and Process Synchronization',
        subject: osSubject._id,
        description: 'Scheduling algorithms, critical-section problem, semaphores, classic IPC problems',
      },
      {
        unitNumber: 4,
        title: 'Deadlocks and Memory Management',
        subject: osSubject._id,
        description: 'Deadlock characterization, prevention, Banker algorithm, paging, segmentation, virtual memory',
      },
      {
        unitNumber: 5,
        title: 'Storage Management and File Systems',
        subject: osSubject._id,
        description: 'File concepts, directory structure, allocation methods, disk scheduling',
      },
    ];

    const unitMap = {};

    for (const unit of unitsData) {
      let doc = await Unit.findOne({ subject: unit.subject, unitNumber: unit.unitNumber });
      if (!doc) {
        doc = await Unit.create(unit);
        console.log(`[Seed] Created Unit ${doc.unitNumber}: ${doc.title}`);
      } else {
        console.log(`[Seed] Unit already exists: Unit ${doc.unitNumber} of ${osSubject.code}`);
      }
      unitMap[unit.unitNumber] = doc;
    }

    // Units for DBMS (CS401)
    const dbmsSubject = subjectMap['CS401'];
    const dbmsUnits = [
      { unitNumber: 1, title: 'Introduction and Relational Model', subject: dbmsSubject._id },
      { unitNumber: 2, title: 'SQL and Relational Algebra', subject: dbmsSubject._id },
      { unitNumber: 3, title: 'Database Design and Normalization', subject: dbmsSubject._id },
      { unitNumber: 4, title: 'Transaction Management & Concurrency Control', subject: dbmsSubject._id },
    ];

    for (const unit of dbmsUnits) {
      let doc = await Unit.findOne({ subject: unit.subject, unitNumber: unit.unitNumber });
      if (!doc) {
        doc = await Unit.create(unit);
        console.log(`[Seed] Created Unit ${doc.unitNumber} for DBMS: ${doc.title}`);
      }
    }

    // 4. Seed Faculty User
    const facultyEmail = 'faculty@campusnotes.edu';
    let faculty = await User.findOne({ email: facultyEmail });
    if (!faculty) {
      faculty = await User.create({
        name: 'Prof. Alan Turing',
        email: facultyEmail,
        passwordHash: await User.hashPassword('FacultyPassword@123'),
        role: 'Faculty',
        department: ceDept._id,
        isActive: true,
      });
      console.log(`[Seed] Created Faculty account: ${faculty.email}`);
    } else {
      console.log(`[Seed] Faculty account already exists: ${faculty.email}`);
    }

    // 5. Seed Student User
    const studentEmail = 'student@campusnotes.edu';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'John Doe',
        email: studentEmail,
        passwordHash: await User.hashPassword('StudentPassword@123'),
        role: 'Student',
        department: ceDept._id,
        semester: 5,
        isActive: true,
      });
      console.log(`[Seed] Created Student account: ${student.email}`);
    } else {
      console.log(`[Seed] Student account already exists: ${student.email}`);
    }

    // 6. Seed a Sample Verified Resource with actual physical file
    const sampleFileName = 'os-unit3-notes-demo.pdf';
    const sampleFilePath = path.join(uploadDir, sampleFileName);

    // Create a real minimal PDF file if not exists
    if (!fs.existsSync(sampleFilePath)) {
      const dummyPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 176 >>
stream
BT
/F1 20 Tf
70 700 Td
(CampusNotes: Operating Systems Unit 3 Notes) Tj
/F1 12 Tf
0 -30 Td
(CPU Scheduling, Process Synchronization, and Classical IPC Solutions) Tj
0 -25 Td
(Faculty Verified Study Material - Computer Engineering Semester 5) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
0000000293 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
521
%%EOF`;
      fs.writeFileSync(sampleFilePath, dummyPdfContent);
      console.log(`[Seed] Created sample PDF file at: ${sampleFilePath}`);
    }

    const fileBuffer = fs.readFileSync(sampleFilePath);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const sampleResourceExists = await Resource.findOne({ fileHash });
    if (!sampleResourceExists) {
      await Resource.create({
        title: 'Operating Systems Unit 3 — Process Synchronization & CPU Scheduling Notes',
        description:
          'Comprehensive notes covering CPU scheduling algorithms (FCFS, SJF, Round Robin), Critical Section problem, Peterson algorithm, Semaphores, Mutex locks, and Classical IPC synchronization problems.',
        department: ceDept._id,
        semester: 5,
        subject: osSubject._id,
        unit: unitMap[3]._id,
        resourceType: 'Notes',
        academicYear: '2024-2025',
        tags: ['Operating Systems', 'CPU Scheduling', 'Synchronization', 'Semaphores', 'Unit 3'],
        uploadedBy: student._id,
        file: {
          originalName: 'Operating Systems Unit 3 Notes.pdf',
          storageName: sampleFileName,
          mimeType: 'application/pdf',
          size: fileBuffer.length,
          path: sampleFilePath,
        },
        fileHash,
        verificationStatus: 'Approved',
        verifiedBy: faculty._id,
        verifiedAt: new Date(),
        verificationNote: 'Accurate and comprehensive handwritten lecture notes verified according to syllabus.',
        moderationStatus: 'Active',
        downloadCount: 42,
      });
      console.log('[Seed] Created sample verified Resource: Operating Systems Unit 3 Notes');
    }

    console.log('[Seed Academic Data] Seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error] Failed to seed academic data: ${err.message}`);
    process.exit(1);
  }
};

seedAcademicData();
