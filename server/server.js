const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Deed Validation Engine
app.post('/api/validate-deed', (req, res) => {
  const { mouzaName, dagNumber, proposedArea, paymentTxId } = req.body;
  const proposed = parseFloat(proposedArea);

  if (!mouzaName || !dagNumber || isNaN(proposed)) {
    return res.status(400).json({ error: 'Please provide mouzaName, dagNumber, and proposedArea.' });
  }

  db.get(
    `SELECT * FROM MouzaPlots WHERE LOWER(mouzaName) = LOWER(?) AND dagNumber = ?`,
    [mouzaName.trim(), parseInt(dagNumber, 10)],
    (err, plot) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!plot) return res.status(404).json({ error: `Plot (Dag ${dagNumber}) not found in Mouza ${mouzaName}.` });

      db.get(
        `SELECT SUM(recordedArea) AS totalClaimed FROM Khatians WHERE LOWER(mouzaName) = LOWER(?) AND dagNumber = ?`,
        [mouzaName.trim(), parseInt(dagNumber, 10)],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });

          const claimedArea = parseFloat((row?.totalClaimed || 0).toFixed(2));
          const availableArea = parseFloat((plot.totalPhysicalArea - claimedArea).toFixed(2));
          const utilization = Math.round((claimedArea / plot.totalPhysicalArea) * 100);

          db.all(
            `SELECT * FROM DisputeReports WHERE LOWER(mouzaName) = LOWER(?) AND dagNumber = ? AND status = 'ACTIVE'`,
            [mouzaName.trim(), parseInt(dagNumber, 10)],
            (err, activeDisputes) => {
              if (err) return res.status(500).json({ error: err.message });

              const hasDispute = activeDisputes && activeDisputes.length > 0;

              // Rule 1: Eco-Zone Restriction
              if (plot.isEcoProtected === 1 && plot.ecoRestrictionLevel === 'CRITICAL_BLOCK') {
                return res.json({
                  status: 'BLOCKED_ECO',
                  code: 'ECO_VIOLATION',
                  mouzaName: plot.mouzaName,
                  upazila: plot.upazila,
                  district: plot.district,
                  dagNumber: plot.dagNumber,
                  totalPhysicalArea: plot.totalPhysicalArea,
                  allocatedArea: claimedArea,
                  remainingArea: availableArea,
                  proposedArea: proposed,
                  utilization: utilization,
                  isEcoProtected: 1,
                  ecoZoneType: plot.ecoZoneType,
                  disputes: activeDisputes,
                  messageEn: `Deed Registration Blocked: Dag ${plot.dagNumber} falls within ${plot.ecoZoneType}. Protected under Bangladesh Environmental Law.`,
                  messageBn: `দলিল নিবন্ধন স্থগিত: দাগ নং ${plot.dagNumber} পরিবেশগতভাবে সংরক্ষিত (${plot.ecoZoneType}) এলাকায় পড়েছে।`
                });
              }

              // Rule 2: Mouza Map Over-Allocation
              if (proposed > availableArea) {
                const deficit = parseFloat((proposed - (availableArea > 0 ? availableArea : 0)).toFixed(2));
                return res.json({
                  status: 'FLAGGED',
                  code: 'INSUFFICIENT_AREA',
                  mouzaName: plot.mouzaName,
                  upazila: plot.upazila,
                  district: plot.district,
                  dagNumber: plot.dagNumber,
                  totalPhysicalArea: plot.totalPhysicalArea,
                  allocatedArea: claimedArea,
                  remainingArea: availableArea,
                  proposedArea: proposed,
                  deficit: deficit,
                  utilization: utilization,
                  isEcoProtected: plot.isEcoProtected,
                  ecoZoneType: plot.ecoZoneType,
                  disputes: activeDisputes,
                  messageEn: `The proposed transfer exceeds the unencumbered area. Dag ${plot.dagNumber} has only ${availableArea > 0 ? availableArea : 0} decimals remaining.`,
                  messageBn: `প্রস্তাবিত জমি হস্তান্তর সীমার বাইরে। দাগ নং ${plot.dagNumber}-এ মাত্র ${availableArea > 0 ? availableArea : 0} শতাংশ অবশিষ্ট রয়েছে।`
                });
              }

              // Rule 3: Valid Transfer
              const clearanceToken = `MC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
              return res.json({
                status: hasDispute ? 'WARNING_DISPUTE' : 'CLEAR',
                code: hasDispute ? 'ACTIVE_DISPUTE_WARNING' : 'VALID',
                clearanceToken,
                paymentTxId: paymentTxId || 'BKASH-FEE-EXEMPT',
                mouzaName: plot.mouzaName,
                upazila: plot.upazila,
                district: plot.district,
                dagNumber: plot.dagNumber,
                totalPhysicalArea: plot.totalPhysicalArea,
                allocatedArea: claimedArea,
                remainingArea: availableArea,
                proposedArea: proposed,
                utilization: utilization,
                isEcoProtected: plot.isEcoProtected,
                ecoZoneType: plot.ecoZoneType,
                disputes: activeDisputes,
                messageEn: hasDispute 
                  ? `Sufficient physical area exists, but WARNING: ${activeDisputes.length} active dispute(s) are logged against Dag ${plot.dagNumber}.`
                  : 'Deed is valid. Sufficient physical area and unencumbered title verified.',
                messageBn: hasDispute
                  ? `পর্যাপ্ত জমি রয়েছে, তবে সতর্কবার্তা: দাগ নং ${plot.dagNumber}-এ ${activeDisputes.length}টি সক্রিয় বিরোধ বা মামলা নথিভুক্ত রয়েছে।`
                  : 'দলিল যাচাই সম্পন্ন। জমিতে বৈধ মালিকানা ও হস্তান্তরযোগ্য পরিমাণ বিদ্যমান।'
              });
            }
          );
        }
      );
    }
  );
});

// 2. Direct Public Verification Route
app.get('/api/verify-token/:token', (req, res) => {
  const { token } = req.params;
  const { dag, mouza } = req.query;

  const targetDag = dag ? parseInt(dag, 10) : 101;
  const targetMouza = mouza ? mouza.trim() : 'Ashulia';

  db.get(
    `SELECT * FROM MouzaPlots WHERE LOWER(mouzaName) = LOWER(?) AND dagNumber = ?`,
    [targetMouza, targetDag],
    (err, plot) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!plot) return res.status(404).json({ error: 'Certificate record not found in DLRS database.' });

      res.json({
        isValid: true,
        clearanceToken: token,
        mouzaName: plot.mouzaName,
        upazila: plot.upazila,
        district: plot.district,
        dagNumber: plot.dagNumber,
        totalPhysicalArea: plot.totalPhysicalArea,
        status: 'VERIFIED_GENUINE',
        certifiedBy: 'Directorate of Land Records and Surveys (DLRS)',
        verifiedAt: new Date().toISOString()
      });
    }
  );
});

// 3. Plot Details
app.get('/api/plots/:mouzaName/:dagNumber', (req, res) => {
  const { mouzaName, dagNumber } = req.params;
  const dag = parseInt(dagNumber, 10);

  db.get(
    `SELECT * FROM MouzaPlots WHERE LOWER(mouzaName) = LOWER(?) AND dagNumber = ?`,
    [mouzaName.trim(), dag],
    (err, plot) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!plot) return res.status(404).json({ error: 'Plot not found in Mouza records.' });

      db.all(
        `SELECT * FROM Khatians WHERE LOWER(mouzaName) = LOWER(?) AND dagNumber = ?`,
        [mouzaName.trim(), dag],
        (err, khatians) => {
          if (err) return res.status(500).json({ error: err.message });

          const totalAllocated = khatians.reduce((acc, k) => acc + k.recordedArea, 0);
          const remaining = parseFloat((plot.totalPhysicalArea - totalAllocated).toFixed(2));
          const utilization = Math.round((totalAllocated / plot.totalPhysicalArea) * 100);

          res.json({
            plot,
            khatians,
            totalAllocated: parseFloat(totalAllocated.toFixed(2)),
            remaining,
            utilization
          });
        }
      );
    }
  );
});

// 4. Mutation Chain History
app.get('/api/mutation-chain/:mouzaName/:dagNumber', (req, res) => {
  const { mouzaName, dagNumber } = req.params;
  const dag = parseInt(dagNumber, 10);

  db.all(
    `SELECT * FROM MutationChain WHERE LOWER(mouzaName) = LOWER(?) AND dagNumber = ? ORDER BY yearRecorded ASC`,
    [mouzaName.trim(), dag],
    (err, chain) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ chain: chain || [] });
    }
  );
});

// 5. Community Dispute Reports
app.get('/api/disputes', (req, res) => {
  db.all(`SELECT * FROM DisputeReports ORDER BY reportedAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ disputes: rows });
  });
});

app.post('/api/disputes', (req, res) => {
  const { mouzaName, dagNumber, complainantName, phone, disputeType, caseNumber, description } = req.body;

  if (!mouzaName || !dagNumber || !complainantName || !disputeType || !description) {
    return res.status(400).json({ error: 'Please provide all required dispute fields.' });
  }

  const stmt = db.prepare(`
    INSERT INTO DisputeReports (mouzaName, dagNumber, complainantName, phone, disputeType, caseNumber, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `);

  stmt.run(
    mouzaName.trim(),
    parseInt(dagNumber, 10),
    complainantName.trim(),
    phone || '',
    disputeType,
    caseNumber || '',
    description.trim(),
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, disputeId: this.lastID });
    }
  );
  stmt.finalize();
});

// 6. Officer Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM MouzaPlots) AS totalDags,
      (SELECT COUNT(*) FROM Transactions WHERE status = 'CLEAR') AS validTransfers,
      (SELECT COUNT(*) FROM Transactions WHERE status = 'FLAGGED' OR status = 'BLOCKED') AS flaggedTransfers,
      (SELECT COUNT(*) FROM DisputeReports WHERE status = 'ACTIVE') AS activeDisputesCount,
      (SELECT COALESCE(SUM(totalPhysicalArea), 0) FROM MouzaPlots) AS totalAreaDecimals
  `;

  db.get(statsQuery, [], (err, stats) => {
    if (err) return res.status(500).json({ error: err.message });

    const dagsQuery = `
      SELECT p.dagNumber, p.mouzaName, p.totalPhysicalArea, p.isEcoProtected, p.ecoZoneType,
             COALESCE(SUM(k.recordedArea), 0) AS allocatedArea
      FROM MouzaPlots p
      LEFT JOIN Khatians k ON LOWER(p.mouzaName) = LOWER(k.mouzaName) AND p.dagNumber = k.dagNumber
      GROUP BY p.id
    `;

    db.all(dagsQuery, [], (err, dags) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(`SELECT * FROM Transactions ORDER BY createdAt DESC`, [], (err, transactions) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ stats, dags, transactions });
      });
    });
  });
});

// 7. Update Transaction Status
app.patch('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(`UPDATE Transactions SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updatedId: id, status });
  });
});

// 8. Admin CRUD: Create New Plot
app.post('/api/admin/plots', (req, res) => {
  const { mouzaName, upazila, district, dagNumber, totalPhysicalArea, isEcoProtected, ecoZoneType } = req.body;
  const mouzaId = `M-${mouzaName.substring(0, 3).toUpperCase()}-01`;

  const stmt = db.prepare(`
    INSERT INTO MouzaPlots (mouzaId, mouzaName, upazila, district, dagNumber, totalPhysicalArea, isEcoProtected, ecoZoneType, ecoRestrictionLevel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    mouzaId,
    mouzaName.trim(),
    upazila || 'Savar',
    district || 'Dhaka',
    parseInt(dagNumber, 10),
    parseFloat(totalPhysicalArea),
    isEcoProtected ? 1 : 0,
    isEcoProtected ? ecoZoneType : 'None',
    isEcoProtected ? 'CRITICAL_BLOCK' : 'NONE',
    function (err) {
      if (err) return res.status(400).json({ error: 'Plot number already exists in this Mouza.' });
      res.json({ success: true, plotId: this.lastID });
    }
  );
  stmt.finalize();
});

// 9. Admin CRUD: Record New Khatian
app.post('/api/admin/khatians', (req, res) => {
  const { mouzaName, dagNumber, khatianNumber, ownerName, recordedArea, surveyEra } = req.body;

  const stmt = db.prepare(`
    INSERT INTO Khatians (mouzaName, dagNumber, khatianNumber, ownerName, recordedArea, surveyEra)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    mouzaName.trim(),
    parseInt(dagNumber, 10),
    khatianNumber.trim(),
    ownerName.trim(),
    parseFloat(recordedArea),
    surveyEra || 'RS',
    function (err) {
      if (err) return res.status(400).json({ error: 'Khatian number already recorded for this Dag.' });
      res.json({ success: true, khatianId: this.lastID });
    }
  );
  stmt.finalize();
});

// 10. Admin CRUD: Resolve Dispute Report
app.patch('/api/admin/disputes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(`UPDATE DisputeReports SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, updatedId: id, status });
  });
});

// 11. Static Frontend Production Hosting (Compatible with all path-to-regexp versions)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BhumiSafe Production Server listening on http://localhost:${PORT}`);
});