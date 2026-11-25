import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Ensure db directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data with at least 10 realistic students
const SEED_DATA = {
  classes: [
    {
      code: "PHYS-101",
      name: "Class 11 Physics - Section A",
      teacherId: "teacher_01",
      createdAt: "2026-11-20T10:00:00Z"
    },
    {
      code: "HACK-2026",
      name: "HackHounds Advanced Lab",
      teacherId: "teacher_01",
      createdAt: "2026-11-21T09:00:00Z"
    }
  ],
  students: [
    { id: "s1", name: "Aarav Sharma", email: "aarav.s@school.edu", classCode: "PHYS-101" },
    { id: "s2", name: "Ananya Iyer", email: "ananya.i@school.edu", classCode: "PHYS-101" },
    { id: "s3", name: "Rohan Verma", email: "rohan.v@school.edu", classCode: "PHYS-101" },
    { id: "s4", name: "Priya Nair", email: "priya.n@school.edu", classCode: "PHYS-101" },
    { id: "s5", name: "Kabir Patel", email: "kabir.p@school.edu", classCode: "PHYS-101" },
    { id: "s6", name: "Diya Chatterjee", email: "diya.c@school.edu", classCode: "PHYS-101" },
    { id: "s7", name: "Siddharth Rao", email: "sid.r@school.edu", classCode: "PHYS-101" },
    { id: "s8", name: "Sneha Mukherjee", email: "sneha.m@school.edu", classCode: "PHYS-101" },
    { id: "s9", name: "Aditya Joshi", email: "aditya.j@school.edu", classCode: "PHYS-101" },
    { id: "s10", name: "Meera Gupta", email: "meera.g@school.edu", classCode: "PHYS-101" },
    { id: "s11", name: "Arjun Reddy", email: "arjun.r@school.edu", classCode: "PHYS-101" },
    { id: "s12", name: "Tanvi Deshmukh", email: "tanvi.d@school.edu", classCode: "PHYS-101" }
  ],
  attempts: [
    {
      id: "att_01",
      studentId: "s1",
      studentName: "Aarav Sharma",
      classCode: "PHYS-101",
      experiment: "ohm",
      score: 95,
      mistakes: ["openCircuit"],
      hintsUsed: 1,
      timeTaken: 184,
      date: "2026-11-22T14:20:00Z"
    },
    {
      id: "att_02",
      studentId: "s2",
      studentName: "Ananya Iyer",
      classCode: "PHYS-101",
      experiment: "pendulum",
      score: 98,
      mistakes: [],
      hintsUsed: 0,
      timeTaken: 140,
      date: "2026-11-22T14:35:00Z"
    },
    {
      id: "att_03",
      studentId: "s3",
      studentName: "Rohan Verma",
      classCode: "PHYS-101",
      experiment: "ohm",
      score: 62,
      mistakes: ["ammeterInParallel", "shortCircuit", "voltmeterInSeries"],
      hintsUsed: 4,
      timeTaken: 340,
      date: "2026-11-22T15:10:00Z",
      needsHelp: true
    },
    {
      id: "att_04",
      studentId: "s4",
      studentName: "Priya Nair",
      classCode: "PHYS-101",
      experiment: "pendulum",
      score: 88,
      mistakes: ["angleTooLarge"],
      hintsUsed: 1,
      timeTaken: 195,
      date: "2026-11-22T15:30:00Z"
    },
    {
      id: "att_05",
      studentId: "s5",
      studentName: "Kabir Patel",
      classCode: "PHYS-101",
      experiment: "ohm",
      score: 55,
      mistakes: ["shortCircuit", "shortCircuit", "resistorOverheating"],
      hintsUsed: 5,
      timeTaken: 410,
      date: "2026-11-22T15:50:00Z",
      needsHelp: true
    },
    {
      id: "att_06",
      studentId: "s6",
      studentName: "Diya Chatterjee",
      classCode: "PHYS-101",
      experiment: "pendulum",
      score: 92,
      mistakes: ["singleOscillationTimed"],
      hintsUsed: 1,
      timeTaken: 165,
      date: "2026-11-22T16:05:00Z"
    },
    {
      id: "att_07",
      studentId: "s7",
      studentName: "Siddharth Rao",
      classCode: "PHYS-101",
      experiment: "ohm",
      score: 84,
      mistakes: ["wrongPolarity"],
      hintsUsed: 2,
      timeTaken: 220,
      date: "2026-11-22T16:20:00Z"
    },
    {
      id: "att_08",
      studentId: "s8",
      studentName: "Sneha Mukherjee",
      classCode: "PHYS-101",
      experiment: "pendulum",
      score: 58,
      mistakes: ["angleTooLarge", "massConfusion", "stoppedTooEarly"],
      hintsUsed: 4,
      timeTaken: 390,
      date: "2026-11-22T16:45:00Z",
      needsHelp: true
    },
    {
      id: "att_09",
      studentId: "s9",
      studentName: "Aditya Joshi",
      classCode: "PHYS-101",
      experiment: "ohm",
      score: 90,
      mistakes: ["openCircuit"],
      hintsUsed: 1,
      timeTaken: 175,
      date: "2026-11-22T17:00:00Z"
    },
    {
      id: "att_10",
      studentId: "s10",
      studentName: "Meera Gupta",
      classCode: "PHYS-101",
      experiment: "pendulum",
      score: 96,
      mistakes: [],
      hintsUsed: 0,
      timeTaken: 155,
      date: "2026-11-22T17:15:00Z"
    },
    {
      id: "att_11",
      studentId: "s11",
      studentName: "Arjun Reddy",
      classCode: "PHYS-101",
      experiment: "ohm",
      score: 72,
      mistakes: ["voltmeterInSeries"],
      hintsUsed: 2,
      timeTaken: 260,
      date: "2026-11-22T17:30:00Z"
    },
    {
      id: "att_12",
      studentId: "s12",
      studentName: "Tanvi Deshmukh",
      classCode: "PHYS-101",
      experiment: "pendulum",
      score: 91,
      mistakes: ["angleTooLarge"],
      hintsUsed: 1,
      timeTaken: 180,
      date: "2026-11-22T17:45:00Z"
    }
  ]
};

// Initialize DB file if not present
function getDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf8');
    return SEED_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, reinitializing:', err);
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf8');
    return SEED_DATA;
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function saveExperimentAttempt(attempt) {
  const db = getDB();
  const newAttempt = {
    id: `att_${Date.now()}`,
    date: new Date().toISOString(),
    needsHelp: attempt.score < 70 || (attempt.mistakes && attempt.mistakes.length >= 3),
    ...attempt
  };

  db.attempts.unshift(newAttempt);
  saveDB(db);
  return newAttempt;
}

export function getStudentAttempts(studentId) {
  const db = getDB();
  return db.attempts.filter((a) => a.studentId === studentId);
}

export function getTeacherDashboardData(classCode = "PHYS-101") {
  const db = getDB();
  const classAttempts = db.attempts.filter((a) => a.classCode === classCode || !a.classCode);
  const classStudents = db.students.filter((s) => s.classCode === classCode);

  const totalAttempts = classAttempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(classAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalAttempts)
    : 0;

  // Breakdown of mistakes
  const mistakeCounts = {};
  classAttempts.forEach((a) => {
    (a.mistakes || []).forEach((m) => {
      mistakeCounts[m] = (mistakeCounts[m] || 0) + 1;
    });
  });

  // Students needing help (score < 70 or >= 3 mistakes)
  const studentsNeedingHelp = classAttempts
    .filter((a) => a.score < 70 || (a.mistakes && a.mistakes.length >= 2))
    .map((a) => ({
      studentId: a.studentId,
      studentName: a.studentName || 'Student',
      experiment: a.experiment,
      score: a.score,
      mistakes: a.mistakes || [],
      date: a.date
    }));

  return {
    classCode,
    totalStudents: classStudents.length || 12,
    totalExperimentsCompleted: totalAttempts,
    averageScore: avgScore,
    mistakeDistribution: mistakeCounts,
    studentsNeedingHelp,
    recentAttempts: classAttempts.slice(0, 20),
    allStudents: classStudents
  };
}

export function exportCSV(classCode = "PHYS-101") {
  const db = getDB();
  const classAttempts = db.attempts.filter((a) => a.classCode === classCode || !a.classCode);

  const headers = ['Attempt ID', 'Student ID', 'Student Name', 'Experiment', 'Score', 'Mistakes', 'Hints Used', 'Time (seconds)', 'Date', 'Needs Help'];
  const rows = classAttempts.map((a) => [
    a.id,
    a.studentId,
    `"${a.studentName || 'Student'}"`,
    a.experiment,
    a.score,
    `"${(a.mistakes || []).join('; ')}"`,
    a.hintsUsed || 0,
    a.timeTaken || 0,
    a.date,
    a.needsHelp ? 'YES' : 'NO'
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
