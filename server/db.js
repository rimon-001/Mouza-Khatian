const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'bhumisafe.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Mouza Plots Table
  db.run(`CREATE TABLE IF NOT EXISTS MouzaPlots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mouzaId TEXT NOT NULL,
    mouzaName TEXT NOT NULL,
    upazila TEXT NOT NULL,
    district TEXT NOT NULL,
    dagNumber INTEGER NOT NULL,
    totalPhysicalArea REAL NOT NULL,
    isEcoProtected INTEGER DEFAULT 0,
    ecoZoneType TEXT,
    ecoRestrictionLevel TEXT,
    UNIQUE(mouzaName, dagNumber)
  )`);

  // 2. Khatians Table
  db.run(`CREATE TABLE IF NOT EXISTS Khatians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mouzaName TEXT NOT NULL,
    dagNumber INTEGER NOT NULL,
    khatianNumber TEXT NOT NULL,
    ownerName TEXT NOT NULL,
    recordedArea REAL NOT NULL,
    surveyEra TEXT DEFAULT 'RS',
    UNIQUE(mouzaName, dagNumber, khatianNumber)
  )`);

  // 3. Transactions Table
  db.run(`CREATE TABLE IF NOT EXISTS Transactions (
    id TEXT PRIMARY KEY,
    mouzaName TEXT NOT NULL,
    dagNumber INTEGER NOT NULL,
    proposedArea REAL NOT NULL,
    buyerName TEXT NOT NULL,
    sellerName TEXT NOT NULL,
    status TEXT NOT NULL,
    issue TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 4. Mutation Chain Table
  db.run(`CREATE TABLE IF NOT EXISTS MutationChain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mouzaName TEXT NOT NULL,
    dagNumber INTEGER NOT NULL,
    surveyEra TEXT NOT NULL,
    khatianNo TEXT NOT NULL,
    ownerName TEXT NOT NULL,
    holdingArea REAL NOT NULL,
    transferType TEXT NOT NULL,
    yearRecorded INTEGER NOT NULL,
    status TEXT NOT NULL
  )`);

  // 5. Dispute Reports Table
  db.run(`CREATE TABLE IF NOT EXISTS DisputeReports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mouzaName TEXT NOT NULL,
    dagNumber INTEGER NOT NULL,
    complainantName TEXT NOT NULL,
    phone TEXT,
    disputeType TEXT NOT NULL,
    caseNumber TEXT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    reportedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Clean insert of Mouza Plots
  const insertPlot = db.prepare(`INSERT OR IGNORE INTO MouzaPlots (mouzaId, mouzaName, upazila, district, dagNumber, totalPhysicalArea, isEcoProtected, ecoZoneType, ecoRestrictionLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insertPlot.run('M-ASH-01', 'Ashulia', 'Savar', 'Dhaka', 101, 10.00, 0, 'Designated Rural Homestead', 'NONE');
  insertPlot.run('M-ASH-01', 'Ashulia', 'Savar', 'Dhaka', 102, 8.00, 0, 'General Agricultural', 'NONE');
  insertPlot.run('M-ASH-01', 'Ashulia', 'Savar', 'Dhaka', 103, 12.50, 0, 'Highland Residential Zone', 'NONE');
  insertPlot.run('M-ASH-01', 'Ashulia', 'Savar', 'Dhaka', 104, 15.00, 1, 'Turag River Flood Flow Wetland (DAP Protected)', 'CRITICAL_BLOCK');
  insertPlot.run('M-SAV-02', 'Savar', 'Savar', 'Dhaka', 201, 10.00, 1, 'Protected Agricultural Green Belt', 'WARNING');
  insertPlot.run('M-DHM-03', 'Dhamrai', 'Dhamrai', 'Dhaka', 302, 14.00, 0, 'Industrial Commercial Zone', 'NONE');
  insertPlot.finalize();

  // Clean insert of Khatians
  const insertKhatian = db.prepare(`INSERT OR IGNORE INTO Khatians (mouzaName, dagNumber, khatianNumber, ownerName, recordedArea, surveyEra) VALUES (?, ?, ?, ?, ?, ?)`);
  insertKhatian.run('Ashulia', 101, 'K-1011', 'Rahim Uddin', 5.00, 'RS');
  insertKhatian.run('Ashulia', 101, 'K-1012', 'Farhana Begum', 3.50, 'RS');
  insertKhatian.run('Ashulia', 102, 'K-901', 'Abdul Mannan', 8.00, 'RS');
  insertKhatian.run('Ashulia', 103, '1245', 'Rofiqul Islam', 5.00, 'RS');
  insertKhatian.run('Ashulia', 103, '1246', 'Salma Begum', 4.00, 'RS');
  insertKhatian.run('Ashulia', 103, '1357', 'Kamrul Hossain', 3.00, 'RS');
  insertKhatian.run('Ashulia', 103, '1678', 'Ayesha Akter', 2.00, 'RS');
  insertKhatian.run('Ashulia', 104, 'K-4401', 'Siddiqur Rahman', 6.00, 'RS');
  insertKhatian.finalize();

  // Clean insert of Transactions
  const insertTx = db.prepare(`INSERT OR IGNORE INTO Transactions (id, mouzaName, dagNumber, proposedArea, buyerName, sellerName, status, issue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  insertTx.run('TR-001', 'Ashulia', 103, 10.00, 'Farhan Tariq', 'Rofiqul Islam', 'FLAGGED', 'Over-allocation (112%)');
  insertTx.run('TR-002', 'Savar', 201, 5.00, 'Anisur Rahman', 'Shah Alam', 'FLAGGED', 'Duplicate Deed Claim');
  insertTx.run('TR-003', 'Ashulia', 101, 1.20, 'Tanvir Hasan', 'Rahim Uddin', 'CLEAR', 'None - Valid Capacity');
  insertTx.run('TR-004', 'Ashulia', 104, 3.00, 'Green Land Builders', 'Siddiqur Rahman', 'BLOCKED', 'Wetland Encroachment (Turag River Basin)');
  insertTx.finalize();

  // Comprehensive Mutation Chain for ALL Dags
  const insertChain = db.prepare(`INSERT OR IGNORE INTO MutationChain (mouzaName, dagNumber, surveyEra, khatianNo, ownerName, holdingArea, transferType, yearRecorded, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  // Dag 101
  insertChain.run('Ashulia', 101, 'CS (Cadastral Survey)', 'CS-44', 'Golam Mostafa', 10.00, 'Original Settlement Record', 1940, 'VERIFIED');
  insertChain.run('Ashulia', 101, 'SA (State Acquisition)', 'SA-112', 'Kabir Uddin Mostafa', 10.00, 'Inheritance (Waris)', 1962, 'VERIFIED');
  insertChain.run('Ashulia', 101, 'RS (Revisional Survey)', 'RS-501', 'Rahim Uddin', 5.00, 'Partition Deed (Bonton)', 1988, 'VERIFIED');
  insertChain.run('Ashulia', 101, 'RS (Revisional Survey)', 'RS-502', 'Farhana Begum', 5.00, 'Partition Deed (Bonton)', 1988, 'VERIFIED');
  insertChain.run('Ashulia', 101, 'Namjari (Mutation)', 'MUT-890', 'Farhana Begum', 3.50, 'Sale Deed Registered', 2018, 'VERIFIED');

  // Dag 102 (Seeded: 100% full, but unbroken title lineage)
  insertChain.run('Ashulia', 102, 'CS (Cadastral Survey)', 'CS-82', 'Moniruzzaman Bhuiyan', 8.00, 'Original Settlement Record', 1940, 'VERIFIED');
  insertChain.run('Ashulia', 102, 'SA (State Acquisition)', 'SA-210', 'Fazlur Rahman Bhuiyan', 8.00, 'Inheritance (Waris)', 1962, 'VERIFIED');
  insertChain.run('Ashulia', 102, 'RS (Revisional Survey)', 'RS-901', 'Abdul Mannan', 8.00, 'Registered Sale Deed', 1989, 'VERIFIED');
  insertChain.run('Ashulia', 102, 'Namjari (Mutation)', 'MUT-1022', 'Abdul Mannan', 8.00, 'Mutation Khatian Approved', 2015, 'VERIFIED');

  // Dag 103 (Disputed / Over-allocated chain)
  insertChain.run('Ashulia', 103, 'CS (Cadastral Survey)', 'CS-90', 'Nizam Chowdhury', 12.50, 'Original Settlement Record', 1940, 'VERIFIED');
  insertChain.run('Ashulia', 103, 'SA (State Acquisition)', 'SA-340', 'Nurul Islam Chowdhury', 12.50, 'Inheritance (Waris)', 1962, 'VERIFIED');
  insertChain.run('Ashulia', 103, 'RS (Revisional Survey)', 'RS-1245', 'Rofiqul Islam', 14.00, 'Unverified Mutation (Disputed Excess Area)', 1992, 'CHAIN_BROKEN');

  // Dag 104 (Wetland protected area)
  insertChain.run('Ashulia', 104, 'CS (Cadastral Survey)', 'CS-102', 'Government of Bengal (Khas)', 15.00, 'River Flow & Water Retention', 1940, 'VERIFIED');
  insertChain.run('Ashulia', 104, 'SA (State Acquisition)', 'SA-415', 'Bangladesh Water Development Board', 15.00, 'State Acquisition & Vesting', 1962, 'VERIFIED');
  insertChain.run('Ashulia', 104, 'RS (Revisional Survey)', 'RS-4401', 'Siddiqur Rahman', 6.00, 'Disputed Private Claim over Flood Basin', 1990, 'CHAIN_BROKEN');

  insertChain.finalize();

  // Community Dispute Reports
  const insertDispute = db.prepare(`INSERT OR IGNORE INTO DisputeReports (id, mouzaName, dagNumber, complainantName, phone, disputeType, caseNumber, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insertDispute.run(1, 'Ashulia', 103, 'Kamrul Hossain', '01711-XXXXXX', 'Co-sharer Inheritance Dispute', 'Misc Case 45/2025', 'Seller attempting to sell joint family inheritance without legal partition (Bonton-nama).', 'ACTIVE');
  insertDispute.run(2, 'Ashulia', 102, 'Tariqul Islam', '01819-XXXXXX', 'Court Injunction', 'Title Suit 112/2024', 'Temporary injunction granted by Dhaka Senior Assistant Judge Court against transferring Dag 102.', 'ACTIVE');
  insertDispute.finalize();
});

module.exports = db;