# BhumiSafe — Mouza-Khatian Discrepancy & Land Fraud Detection Engine

**BhumiSafe** is an automated pre-registration validation engine designed for the Bangladeshi land administration framework. It bridges the historical gap between physical revenue village maps (Mouza Maps / Cadastral blueprints) and written rights-of-records (Khatians), preventing phantom land allocation, double deed registrations, and ecological encroachment.

---

## Key Features

1. **Physical Capacity & Over-Allocation Engine**:
   - Calculates real physical plot limitations (in Decimals) against recorded claims across survey eras (CS, SA, RS, BS).
   - Halts deed transactions where proposed areas exceed unencumbered capacity.

2. **DAP Wetland & Eco-Zone Guard (SDG 15)**:
   - Identifies plots situated inside flood flow zones and protected green belts (e.g., Turag River Basin under Rajuk DAP).
   - Automatically blocks commercial or residential mutations on protected wetlands.

3. **Chronological Title Lineage & Mutation Chain (Namjari Audit)**:
   - Tracks title provenance from the Cadastral Survey (1940) through State Acquisition (1962), Revisional Survey (1988), and modern computerized Namjari mutations.
   - Detects breaks in partition deeds (*Bonton-nama*) or unverified inheritance claims.

4. **Citizen Watchlist & Dispute Registry**:
   - Allows citizens, co-sharers, and advocates to register pending civil court injunctions and Title Suits.
   - Flags active disputes directly on the Deed Checker interface for prospective buyers.

5. **Official Clearance Slip & QR Verification Portal**:
   - Generates an official clearance slip with an automated clearance token.
   - Embeds a dynamic QR code that resolves on the public `/verify` endpoint for banks and sub-registrars.
   - Exports high-resolution printable PDF clearance certificates.

6. **Government Fee Simulation Gateway**:
   - Simulates a mobile financial service (bKash) payment workflow for pre-registration clearance fee collection (50 BDT).

7. **Bilingual Localization (i18n)**:
   - Full English and Bengali (বাংলা) interface toggles for citizen accessibility.

---

## Tech Stack

- **Frontend**: React (Vite), Lucide-React, Leaflet, HTML2Canvas, jsPDF, QRCode.react
- **Backend**: Node.js, Express.js (single-port unified hosting)
- **Database**: SQLite3 (persisted locally with relational schemas)

---

## Local Development Setup

### 1. Install & Run via Single-Port Production Mode
```bash
# From project root:
npm run install:server
npm run build:client
npm start