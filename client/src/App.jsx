import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, MapPin, 
  FileText, Activity, Layers, Printer, Eye, GitCommit, Download,
  Trees, Waves, Flag, Search, Globe, CreditCard, Lock, CheckCircle,
  PlusCircle, UserPlus, CheckCheck
} from 'lucide-react';
import './App.css';

// Bilingual Dictionary
const i18n = {
  en: {
    brand: 'Mouza-Khatian Discrepancy Engine',
    navHome: 'Home',
    navChecker: 'Deed Checker',
    navMap: 'Cadastral Map',
    navChain: 'Title Chain',
    navDispute: 'Report Dispute',
    navOfficer: 'Officer Portal',
    navVerify: 'Verify Token',
    officerLogin: 'Officer Login',
    heroTitle: 'Verify Land. Stop Fraud.',
    heroTitleAccent: 'Protect Ownership.',
    heroDesc: 'The Mouza-Khatian Discrepancy Engine is an automated pre-registration validation portal ensuring no deed or mutation is approved for land that physically does not exist.',
    featRealTime: 'Real-Time',
    featInstant: 'Instant Check',
    featDetects: 'Detects',
    featOver: 'Over-Allocation',
    featEco: 'Eco-Guard',
    featWetland: 'Wetland Defense',
    featWatch: 'Citizen Watch',
    featRegistry: 'Dispute Registry',
    checkPlotBtn: 'Check a Plot →',
    officerPortalBtn: 'Officer Login',
    checkerTitle: 'Deed Checker',
    checkerSubtitle: 'Enter property identifiers to calculate whether physical capacity exists on the Mouza map.',
    mouzaLabel: 'Mouza Name',
    dagLabel: 'Dag Number (Plot Number)',
    proposedLabel: 'Proposed Transfer Area (Decimals)',
    checkBtn: 'Check Availability',
    checkingBtn: 'Validating Dag Constraints...',
    utilization: 'Land Utilization',
    physicalLimit: 'Total Physical Area',
    allocatedArea: 'Total Allocated Area',
    remainingArea: 'Remaining Area',
    deficit: 'Deficit / Excess',
    inspectPlotBtn: 'Inspect Plot',
    titleChainBtn: 'Title Chain',
    clearanceSlipBtn: 'Clearance Slip',
    noPlotSelected: 'No Plot Selected',
    noPlotDesc: 'Select a Mouza and input the Dag number to preview capacity and past Khatian allocations.',
    feeTitle: 'Government Pre-Registration Clearance Fee',
    feeSubtitle: 'Govt. Land Due-Diligence Verification Service',
    feeAmount: 'Fee: 50.00 BDT',
    payWithBkash: 'Confirm bKash Payment',
    paying: 'Verifying with bKash Gateway...'
  },
  bn: {
    brand: 'মৌজা-খতিয়ান অসঙ্গতি যাচাইকরণ ইঞ্জিন',
    navHome: 'হোম',
    navChecker: 'দলিল যাচাইকারী',
    navMap: 'মৌজা নকশা',
    navChain: 'মালিকানা ইতিহাস',
    navDispute: 'বিরোধ অভিযোগ',
    navOfficer: 'অফিসার পোর্টাল',
    navVerify: 'টোকেন যাচাই',
    officerLogin: 'অফিসার লগইন',
    heroTitle: 'জমি যাচাই করুন। জালিয়াতি রোধ করুন।',
    heroTitleAccent: 'মালিকানা সুরক্ষিত রাখুন।',
    heroDesc: 'মৌজা-খতিয়ান অসঙ্গতি ইঞ্জিন একটি স্বয়ংক্রিয় প্রাক-নিবন্ধন যাচাইকরণ পোর্টাল, যা মৌজা নকশায় বাস্তবে অস্তিত্বহীন জমির দলিল নিবন্ধন প্রতিরোধ করে।',
    featRealTime: 'রিয়েল-টাইম',
    featInstant: 'তাৎক্ষণিক যাচাই',
    featDetects: 'শনাক্তকরণ',
    featOver: 'অতিরিক্ত বরাদ্দ',
    featEco: 'পরিবেশ গার্ড',
    featWetland: 'জলাশয় সুরক্ষা',
    featWatch: 'নাগরিক ওয়াচ',
    featRegistry: 'বিরোধ তালিকা',
    checkPlotBtn: 'দাগ যাচাই করুন →',
    officerPortalBtn: 'অফিসার লগইন',
    checkerTitle: 'দলিল ও দাগ যাচাই',
    checkerSubtitle: 'মৌজা নকশায় জমির ধারণক্ষমতা যাচাই করতে তথ্য প্রদান করুন।',
    mouzaLabel: 'মৌজার নাম',
    dagLabel: 'দাগ নম্বর (প্লট নম্বর)',
    proposedLabel: 'প্রস্তাবিত দলিলের পরিমাণ (শতাংশ)',
    checkBtn: 'উপলব্ধতা যাচাই করুন',
    checkingBtn: 'দাগের তথ্য যাচাই হচ্ছে...',
    utilization: 'জমির ধারণক্ষমতা ব্যবহার',
    physicalLimit: 'নকশায় মোট জমির পরিমাণ',
    allocatedArea: 'ইতিমধ্যে রেকর্ডকৃত জমি',
    remainingArea: 'অবশিষ্ট খালি জমি',
    deficit: 'ঘাটতি / অতিরিক্ত দাবি',
    inspectPlotBtn: 'নকশায় দেখুন',
    titleChainBtn: 'মালিকানা চেইন',
    clearanceSlipBtn: 'ছাড়পত্র স্লিপ',
    noPlotSelected: 'কোন দাগ নির্বাচন করা হয়নি',
    noPlotDesc: 'জমির অবস্থা ও খতিয়ানের বিবরণ দেখতে মৌজা ও দাগ নম্বর প্রদান করুন।',
    feeTitle: 'সরকারি প্রাক-নিবন্ধন যাচাই ফি',
    feeSubtitle: 'ভূমি রেকর্ড ও জরিপ অধিদপ্তর স্বয়ংক্রিয় সেবা',
    feeAmount: 'ফি: ৫০.০০ টাকা',
    payWithBkash: 'বিকাশ পেমেন্ট নিশ্চিত করুন',
    paying: 'বিকাশ গেটওয়ে যাচাই হচ্ছে...'
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const t = i18n[lang];

  const [activeTab, setActiveTab] = useState('checker');

  // Deed Checker Form State
  const [formData, setFormData] = useState({
    mouzaName: 'Ashulia',
    dagNumber: '101',
    proposedArea: '1.0'
  });
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inspector Cadastral State
  const [inspectMouza, setInspectMouza] = useState('Ashulia');
  const [inspectDag, setInspectDag] = useState('101');
  const [plotData, setPlotData] = useState(null);

  // Title Chain State
  const [chainData, setChainData] = useState([]);
  const [chainMouza, setChainMouza] = useState('Ashulia');
  const [chainDag, setChainDag] = useState('101');
  const [chainLoading, setChainLoading] = useState(false);

  // Dispute Report Form State
  const [disputeForm, setDisputeForm] = useState({
    mouzaName: 'Ashulia',
    dagNumber: '',
    complainantName: '',
    phone: '',
    disputeType: 'Co-sharer Inheritance Dispute',
    caseNumber: '',
    description: ''
  });
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [allDisputes, setAllDisputes] = useState([]);

  // Officer Console State & Filters
  const [stats, setStats] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [officerSearch, setOfficerSearch] = useState('');
  const [officerStatusFilter, setOfficerStatusFilter] = useState('ALL');

  // Officer CRUD Modals State (NEW)
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);
  const [newPlotForm, setNewPlotForm] = useState({
    mouzaName: 'Ashulia',
    upazila: 'Savar',
    district: 'Dhaka',
    dagNumber: '',
    totalPhysicalArea: '',
    isEcoProtected: false,
    ecoZoneType: 'Turag River Flood Flow Wetland'
  });

  const [showAddKhatianModal, setShowAddKhatianModal] = useState(false);
  const [newKhatianForm, setNewKhatianForm] = useState({
    mouzaName: 'Ashulia',
    dagNumber: '',
    khatianNumber: '',
    ownerName: '',
    recordedArea: '',
    surveyEra: 'RS'
  });

  // Simulated bKash Gateway State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bkashPin, setBkashPin] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [trxId, setTrxId] = useState('BKASH-2026-94821');

  // Public QR Code Token Verification State
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [verifiedTokenData, setVerifiedTokenData] = useState(null);
  const [tokenSearching, setTokenSearching] = useState(false);
  const [tokenSearchError, setTokenSearchError] = useState(null);

  // PDF Export Ref
  const slipPrintRef = useRef(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (activeTab === 'officer') fetchOfficerStats();
    if (activeTab === 'dispute') fetchDisputes();
    if (activeTab === 'inspector' && !plotData) loadPlotInspection(inspectMouza, inspectDag);
    if (activeTab === 'chain' && chainData.length === 0) loadMutationChain(chainMouza, chainDag);
  }, [activeTab]);

  const fetchOfficerStats = () => {
    axios.get('http://localhost:3000/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  };

  const fetchDisputes = () => {
    axios.get('http://localhost:3000/api/disputes')
      .then(res => setAllDisputes(res.data.disputes))
      .catch(err => console.error(err));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3000/api/validate-deed', formData);
      setCheckResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification query failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlotInspection = async (mouza, dag) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/plots/${mouza}/${dag}`);
      setPlotData(res.data);
      setInspectMouza(mouza);
      setInspectDag(dag.toString());
      setActiveTab('inspector');
    } catch (err) {
      alert(err.response?.data?.error || 'Plot not found in Mouza map.');
    }
  };

  const loadMutationChain = async (mouza, dag) => {
    setChainLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/mutation-chain/${mouza}/${dag}`);
      setChainData(res.data.chain || []);
      setChainMouza(mouza);
      setChainDag(dag.toString());
      setActiveTab('chain');
    } catch (err) {
      alert('Failed to load mutation title history.');
    } finally {
      setChainLoading(false);
    }
  };

  const handleLookupToken = async (tokenToSearch) => {
    const queryToken = tokenToSearch || verifyTokenInput;
    if (!queryToken) return;
    setTokenSearching(true);
    setTokenSearchError(null);
    try {
      const res = await axios.get(`http://localhost:3000/api/verify-token/${queryToken.trim()}`);
      setVerifiedTokenData(res.data);
      setActiveTab('verify');
    } catch (err) {
      setTokenSearchError(err.response?.data?.error || 'Clearance certificate token not found in the official registry.');
    } finally {
      setTokenSearching(false);
    }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/disputes', disputeForm);
      setDisputeSuccess(true);
      setDisputeForm({
        mouzaName: 'Ashulia',
        dagNumber: '',
        complainantName: '',
        phone: '',
        disputeType: 'Co-sharer Inheritance Dispute',
        caseNumber: '',
        description: ''
      });
      fetchDisputes();
      setTimeout(() => setDisputeSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit dispute.');
    }
  };

  const handleCreatePlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/admin/plots', newPlotForm);
      setShowAddPlotModal(false);
      setNewPlotForm({
        mouzaName: 'Ashulia',
        upazila: 'Savar',
        district: 'Dhaka',
        dagNumber: '',
        totalPhysicalArea: '',
        isEcoProtected: false,
        ecoZoneType: 'Turag River Flood Flow Wetland'
      });
      fetchOfficerStats();
      alert('Plot added to Mouza registry successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add plot.');
    }
  };

  const handleCreateKhatian = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/admin/khatians', newKhatianForm);
      setShowAddKhatianModal(false);
      setNewKhatianForm({
        mouzaName: 'Ashulia',
        dagNumber: '',
        khatianNumber: '',
        ownerName: '',
        recordedArea: '',
        surveyEra: 'RS'
      });
      fetchOfficerStats();
      alert('Khatian ownership record added successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add Khatian.');
    }
  };

  const handleResolveDispute = async (disputeId) => {
    try {
      await axios.patch(`http://localhost:3000/api/admin/disputes/${disputeId}`, { status: 'RESOLVED' });
      fetchDisputes();
      fetchOfficerStats();
    } catch (err) {
      alert('Failed to resolve dispute.');
    }
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    setPaymentProcessing(true);
    const generatedTrx = `BKASH-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTimeout(() => {
      setTrxId(generatedTrx);
      setPaymentProcessing(false);
      setShowPaymentModal(false);
      setActiveTab('slip');
    }, 1200);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedTx) return;
    try {
      await axios.patch(`http://localhost:3000/api/transactions/${selectedTx.id}`, { status });
      setSelectedTx(null);
      fetchOfficerStats();
    } catch (err) {
      alert('Failed to update transaction.');
    }
  };

  const exportSlipToPdf = async () => {
    if (!slipPrintRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(slipPrintRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Clearance-Slip-${checkResult?.clearanceToken || 'Deed'}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const filteredDags = stats?.dags.filter(d => {
    const matchesSearch = d.dagNumber.toString().includes(officerSearch) || d.mouzaName.toLowerCase().includes(officerSearch.toLowerCase());
    const isOver = (d.totalPhysicalArea - d.allocatedArea) < 0;
    if (officerStatusFilter === 'CLEAR') return matchesSearch && !isOver && d.isEcoProtected === 0;
    if (officerStatusFilter === 'OVER') return matchesSearch && isOver;
    if (officerStatusFilter === 'ECO') return matchesSearch && d.isEcoProtected === 1;
    return matchesSearch;
  }) || [];

  return (
    <div>
      {/* Top Navbar */}
      <nav className="navbar no-print">
        <div className="brand" onClick={() => setActiveTab('hero')}>
          <Layers color="#10b981" size={26} />
          <span>{t.brand}</span>
        </div>
        <ul className="nav-links">
          <li><button className={activeTab === 'hero' ? 'active' : ''} onClick={() => setActiveTab('hero')}>{t.navHome}</button></li>
          <li><button className={activeTab === 'checker' ? 'active' : ''} onClick={() => setActiveTab('checker')}>{t.navChecker}</button></li>
          <li><button className={activeTab === 'inspector' ? 'active' : ''} onClick={() => loadPlotInspection(inspectMouza, inspectDag)}>{t.navMap}</button></li>
          <li><button className={activeTab === 'chain' ? 'active' : ''} onClick={() => loadMutationChain(chainMouza, chainDag)}>{t.navChain}</button></li>
          <li><button className={activeTab === 'dispute' ? 'active' : ''} onClick={() => setActiveTab('dispute')}>Disputes</button></li>
          <li><button className={activeTab === 'verify' ? 'active' : ''} onClick={() => setActiveTab('verify')}>{t.navVerify}</button></li>
          <li><button className={activeTab === 'officer' ? 'active' : ''} onClick={() => setActiveTab('officer')}>{t.navOfficer}</button></li>
        </ul>
        <div className="nav-right">
          <button className="lang-toggle-btn" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}>
            <Globe size={14} />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
          <button className="btn-outline" onClick={() => setActiveTab('officer')}>{t.officerLogin}</button>
        </div>
      </nav>

      {/* VIEW 1: HERO LANDING */}
      {activeTab === 'hero' && (
        <>
          <div className="hero-wrapper">
            <div className="hero-grid">
              <div className="hero-text">
                <h1>{t.heroTitle}<br /><span>{t.heroTitleAccent}</span></h1>
                <p>{t.heroDesc}</p>

                <div className="hero-features">
                  <div className="feat-pill">
                    <Activity size={20} color="#10b981" />
                    <strong>{t.featRealTime}</strong>
                    <span>{t.featInstant}</span>
                  </div>
                  <div className="feat-pill">
                    <AlertTriangle size={20} color="#10b981" />
                    <strong>{t.featDetects}</strong>
                    <span>{t.featOver}</span>
                  </div>
                  <div className="feat-pill">
                    <Trees size={20} color="#10b981" />
                    <strong>{t.featEco}</strong>
                    <span>{t.featWetland}</span>
                  </div>
                  <div className="feat-pill">
                    <Flag size={20} color="#10b981" />
                    <strong>{t.featWatch}</strong>
                    <span>{t.featRegistry}</span>
                  </div>
                </div>

                <div className="hero-actions">
                  <button className="btn-hero-green" onClick={() => setActiveTab('checker')}>{t.checkPlotBtn}</button>
                  <button className="btn-hero-trans" onClick={() => setActiveTab('officer')}>{t.officerPortalBtn}</button>
                </div>
              </div>

              {/* Cadastral Blueprint Hero Preview */}
              <div className="map-visual-card" onClick={() => loadPlotInspection('Ashulia', 104)} style={{ cursor: 'pointer' }}>
                <svg className="hero-blueprint-svg" viewBox="0 0 500 380" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <polygon points="40,40 240,30 220,180 30,170" fill="rgba(16, 185, 129, 0.35)" stroke="#10b981" strokeWidth="2" />
                  <text x="110" y="105" fill="#ffffff" fontWeight="bold" fontSize="13">Dag 101</text>
                  <text x="105" y="125" fill="#a7f3d0" fontSize="11">10.0 Dec (Clear)</text>

                  <polygon points="240,30 470,45 460,190 220,180" fill="rgba(245, 158, 11, 0.35)" stroke="#f59e0b" strokeWidth="2" />
                  <text x="325" y="105" fill="#ffffff" fontWeight="bold" fontSize="13">Dag 102</text>
                  <text x="325" y="125" fill="#fde68a" fontSize="11">8.0 Dec (Full)</text>

                  <polygon points="30,170 220,180 205,350 40,340" fill="rgba(225, 29, 72, 0.45)" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="4" />
                  <text x="75" y="255" fill="#ffffff" fontWeight="bold" fontSize="13">Dag 103 [Disputed]</text>
                  <text x="80" y="275" fill="#fecdd3" fontSize="11">12.50 Dec (Over-Allocated)</text>

                  <polygon points="220,180 460,190 440,350 205,350" fill="rgba(2, 132, 199, 0.45)" stroke="#0284c7" strokeWidth="2.5" />
                  <text x="290" y="255" fill="#ffffff" fontWeight="bold" fontSize="13">Dag 104 [Wetland]</text>
                  <text x="290" y="275" fill="#bae6fd" fontSize="11">15.0 Dec (DAP Protected)</text>
                </svg>

                <div className="plot-overlay-badge">
                  <strong>{lang === 'en' ? 'Mouza: Ashulia' : 'মৌজা: আশুলিয়া'}</strong><br />
                  <span>{lang === 'en' ? 'Click to view Cadastral Map' : 'মৌজা নকশা দেখতে ক্লিক করুন'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="value-props-row">
            <div className="prop-card">
              <h4>{lang === 'en' ? 'For Citizens / Buyers' : 'নাগরিক ও ক্রেতাদের জন্য'}</h4>
              <p>{lang === 'en' ? 'Eliminate phantom land risk and fake deeds before placing cash deposits.' : 'বয়ানামা বা টাকা প্রদানের পূর্বেই অস্তিত্বহীন জমি ও ভূয়া দলিলের ঝুঁকি এড়ান।'}</p>
            </div>
            <div className="prop-card">
              <h4>{lang === 'en' ? 'For Environmental Defense' : 'পরিবেশ ও জলাশয় রক্ষায়'}</h4>
              <p>{lang === 'en' ? "Protect Bangladesh's agricultural wetlands from illegal landfilling and real-estate grabbing." : 'বাংলাদেশর নদী, খাল ও কৃষি জলাভূমি অবৈধ ভরাট ও আবাসন দখল থেকে রক্ষা করুন।'}</p>
            </div>
            <div className="prop-card">
              <h4>{lang === 'en' ? 'For Sub-Registrars' : 'সাব-রেজিস্ট্রারদের জন্য'}</h4>
              <p>{lang === 'en' ? 'Verify physical tolerance limits and halt illegal registration attempts.' : 'মৌজা নকশায় জমির ভৌগোলিক সীমা তাৎক্ষণিক যাচাই করে অবৈধ নিবন্ধন বন্ধ করুন।'}</p>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: DEED CHECKER */}
      {activeTab === 'checker' && (
        <div className="page-container">
          <div className="checker-grid">
            <div className="ui-card">
              <h2>{t.checkerTitle}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {t.checkerSubtitle}
              </p>

              <form onSubmit={handleVerify}>
                <div className="form-field">
                  <label>{t.mouzaLabel}</label>
                  <select 
                    value={formData.mouzaName} 
                    onChange={e => setFormData({...formData, mouzaName: e.target.value})}
                  >
                    <option value="Ashulia">Ashulia (ঢাকা - আশুলিয়া)</option>
                    <option value="Savar">Savar (ঢাকা - সাভার)</option>
                    <option value="Dhamrai">Dhamrai (ঢাকা - ধামরাই)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>{t.dagLabel}</label>
                  <input 
                    type="number" 
                    value={formData.dagNumber} 
                    onChange={e => setFormData({...formData, dagNumber: e.target.value})}
                    placeholder="e.g. 101" 
                    required 
                  />
                </div>

                <div className="form-field">
                  <label>{t.proposedLabel}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.proposedArea} 
                    onChange={e => setFormData({...formData, proposedArea: e.target.value})}
                    placeholder="e.g. 1.00" 
                    required 
                  />
                </div>

                <button type="submit" className="btn-green-full" disabled={loading}>
                  {loading ? t.checkingBtn : t.checkBtn}
                </button>
              </form>

              {error && <div style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            </div>

            <div>
              {checkResult ? (
                <div className="ui-card">
                  {checkResult.isEcoProtected === 1 && (
                    <div className="eco-guard-banner">
                      <Waves size={20} color="#059669" />
                      <div>
                        <strong>{lang === 'en' ? 'Eco-Reserve Warning:' : 'পরিবেশ সতর্কবার্তা:'}</strong> {checkResult.ecoZoneType}
                      </div>
                    </div>
                  )}

                  <div className={`result-banner ${checkResult.status}`}>
                    {checkResult.status === 'BLOCKED_ECO' ? (
                      <Waves size={28} color="#059669" />
                    ) : checkResult.status === 'WARNING_DISPUTE' ? (
                      <AlertTriangle size={28} color="#d97706" />
                    ) : checkResult.status === 'FLAGGED' ? (
                      <AlertTriangle size={28} />
                    ) : (
                      <CheckCircle2 size={28} />
                    )}
                    <div>
                      <strong>
                        {checkResult.status === 'BLOCKED_ECO' 
                          ? (lang === 'en' ? 'Registration Blocked (Eco-Reserve)' : 'নিবন্ধন স্থগিত (সংরক্ষিত জলাভূমি)')
                          : checkResult.status === 'FLAGGED' 
                          ? (lang === 'en' ? 'Transaction Blocked (Over-Allocation)' : 'নিবন্ধন স্থগিত (জমির ঘাটতি)')
                          : checkResult.status === 'WARNING_DISPUTE'
                          ? (lang === 'en' ? 'Active Citizen Dispute Flagged' : 'সক্রিয় বিরোধ / মামলা চিহ্নিত')
                          : (lang === 'en' ? 'Transaction Approved' : 'হস্তান্তর অনুমোদনযোগ্য')}
                      </strong>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        {lang === 'en' ? checkResult.messageEn || checkResult.message : checkResult.messageBn || checkResult.message}
                      </p>
                    </div>
                  </div>

                  {checkResult.disputes && checkResult.disputes.length > 0 && (
                    <div className="dispute-alert-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        <Flag size={16} /> {lang === 'en' ? `Active Legal Reports (${checkResult.disputes.length})` : `সক্রিয় মামলার রিপোর্ট (${checkResult.disputes.length})`}
                      </div>
                      {checkResult.disputes.map((d, idx) => (
                        <div key={idx} className="dispute-item-pill">
                          <strong>{d.disputeType}</strong> {d.caseNumber && <span>({d.caseNumber})</span>}
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{d.description}</p>
                          <span style={{ fontSize: '0.75rem', color: '#b45309' }}>{lang === 'en' ? 'Complainant' : 'অভিযোগকারী'}: {d.complainantName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="utilization-meter-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                      <span>{t.utilization}</span>
                      <span>{checkResult.utilization}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className={`progress-bar-fill ${checkResult.status === 'BLOCKED_ECO' ? 'blue' : checkResult.status === 'WARNING_DISPUTE' ? 'yellow' : checkResult.status === 'FLAGGED' ? 'red' : 'green'}`}
                        style={{ width: `${Math.min(checkResult.utilization, 100)}%` }}
                      />
                    </div>
                  </div>

                  <table className="details-summary-table">
                    <tbody>
                      <tr>
                        <td>{t.physicalLimit}:</td>
                        <td>{checkResult.totalPhysicalArea} {lang === 'en' ? 'Decimal' : 'শতাংশ'}</td>
                      </tr>
                      <tr>
                        <td>{t.allocatedArea}:</td>
                        <td>{checkResult.allocatedArea} {lang === 'en' ? 'Decimal' : 'শতাংশ'}</td>
                      </tr>
                      <tr>
                        <td>{t.remainingArea}:</td>
                        <td>{checkResult.remainingArea} {lang === 'en' ? 'Decimal' : 'শতাংশ'}</td>
                      </tr>
                      {checkResult.deficit && (
                        <tr style={{ color: 'var(--danger)' }}>
                          <td>{t.deficit}:</td>
                          <td>+{checkResult.deficit} {lang === 'en' ? 'Decimal' : 'শতাংশ'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <button 
                      className="btn-outline" 
                      style={{ flex: 1, padding: '0.65rem' }}
                      onClick={() => loadPlotInspection(checkResult.mouzaName, checkResult.dagNumber)}
                    >
                      <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t.inspectPlotBtn}
                    </button>
                    <button 
                      className="btn-outline" 
                      style={{ flex: 1, padding: '0.65rem' }}
                      onClick={() => loadMutationChain(checkResult.mouzaName, checkResult.dagNumber)}
                    >
                      <GitCommit size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t.titleChainBtn}
                    </button>
                    {(checkResult.status === 'CLEAR' || checkResult.status === 'WARNING_DISPUTE') && (
                      <button 
                        className="btn-primary" 
                        style={{ flex: 1, padding: '0.65rem' }}
                        onClick={() => setShowPaymentModal(true)}
                      >
                        <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t.clearanceSlipBtn}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ui-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3.5rem 1rem' }}>
                  <MapPin size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.35 }} />
                  <h4>{t.noPlotSelected}</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {t.noPlotDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CADASTRAL INTERACTIVE MAP */}
      {activeTab === 'inspector' && (
        <div className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2>{lang === 'en' ? `Cadastral Plot Map - ${inspectMouza}` : `মৌজা নকশা ও প্লট চিত্র - ${inspectMouza}`}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {lang === 'en' ? 'Click on any geometric plot on the Mouza blueprint to inspect physical boundaries and recorded ownership.' : 'মৌজা নকশায় যে কোনো দাগে ক্লিক করে জমির সীমানা ও খতিয়ান দেখুন।'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                placeholder="Dag No." 
                value={inspectDag} 
                onChange={e => setInspectDag(e.target.value)} 
                style={{ width: '100px', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
              <button 
                className="btn-hero-green" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => loadPlotInspection(inspectMouza, inspectDag)}
              >
                {lang === 'en' ? 'Inspect' : 'দেখুন'}
              </button>
            </div>
          </div>

          <div className="plot-inspector-layout">
            <div className="ui-card">
              <h3>{lang === 'en' ? 'Cadastral Geometry' : 'মৌজা নকশার নকশিকরণ'}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {lang === 'en' ? 'Visual boundary representation of revenue village survey plots.' : 'রাজস্ব গ্রামের জরিপ অনুযায়ী দাগের নকশা চিত্র।'}
              </p>

              <div className="cadastral-map-box">
                <svg className="cadastral-svg" viewBox="0 0 400 300">
                  <polygon 
                    points="30,30 180,20 170,140 20,130" 
                    fill={inspectDag === '101' ? '#3b82f6' : '#10b981'} 
                    className="cadastral-polygon"
                    onClick={() => loadPlotInspection(inspectMouza, 101)}
                  />
                  <text x="75" y="85" fill="#ffffff" fontWeight="700" fontSize="14">Dag 101</text>
                  <text x="75" y="105" fill="#f1f5f9" fontSize="11">10.00 Dec</text>

                  <polygon 
                    points="180,20 370,30 380,140 170,140" 
                    fill={inspectDag === '102' ? '#3b82f6' : '#f59e0b'} 
                    className="cadastral-polygon"
                    onClick={() => loadPlotInspection(inspectMouza, 102)}
                  />
                  <text x="250" y="85" fill="#ffffff" fontWeight="700" fontSize="14">Dag 102</text>
                  <text x="250" y="105" fill="#f1f5f9" fontSize="11">8.00 Dec</text>

                  <polygon 
                    points="20,130 170,140 160,270 30,260" 
                    fill={inspectDag === '103' ? '#3b82f6' : '#e11d48'} 
                    className="cadastral-polygon"
                    onClick={() => loadPlotInspection(inspectMouza, 103)}
                  />
                  <text x="70" y="200" fill="#ffffff" fontWeight="700" fontSize="14">Dag 103</text>
                  <text x="70" y="220" fill="#fecdd3" fontSize="11">12.50 Dec (Over)</text>

                  <polygon 
                    points="170,140 380,140 360,270 160,270" 
                    fill={inspectDag === '104' ? '#3b82f6' : '#0284c7'} 
                    className="cadastral-polygon"
                    onClick={() => loadPlotInspection(inspectMouza, 104)}
                  />
                  <text x="235" y="200" fill="#ffffff" fontWeight="700" fontSize="14">Dag 104 [Wetland]</text>
                  <text x="240" y="220" fill="#bae6fd" fontSize="11">15.00 Dec (Protected)</text>
                </svg>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1rem', fontSize: '0.78rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#10b981' }}>● {lang === 'en' ? 'Clear' : 'বৈধ'}</span>
                <span style={{ color: '#f59e0b' }}>● {lang === 'en' ? 'Full' : 'পূর্ণ বরাদ্দ'}</span>
                <span style={{ color: '#e11d48' }}>● {lang === 'en' ? 'Disputed' : 'অতিরিক্ত দাবি'}</span>
                <span style={{ color: '#0284c7' }}>● {lang === 'en' ? 'Protected Wetland' : 'সংরক্ষিত জলাভূমি'}</span>
              </div>
            </div>

            {plotData && (
              <div className="ui-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{lang === 'en' ? `Khatians in Dag ${plotData.plot.dagNumber}` : `দাগ নং ${plotData.plot.dagNumber}-এর খতিয়ানসমূহ`}</h3>
                  <button 
                    className="btn-outline" 
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    onClick={() => loadMutationChain(inspectMouza, plotData.plot.dagNumber)}
                  >
                    {t.titleChainBtn} &rarr;
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {lang === 'en' ? 'All recognized ownership records associated with this physical plot.' : 'এই দাগের বিপরীতে স্বীকৃত সকল রেকর্ড ও মালিকানা তালিকা।'}
                </p>

                <table className="khatian-mini-table">
                  <thead>
                    <tr>
                      <th>{lang === 'en' ? 'Khatian No.' : 'খতিয়ান নং'}</th>
                      <th>{lang === 'en' ? 'Owner Name' : 'মালিকের নাম'}</th>
                      <th>{lang === 'en' ? 'Survey' : 'জরিপ'}</th>
                      <th>{lang === 'en' ? 'Area (Dec)' : 'পরিমাণ (শতক)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plotData.khatians.map((k, idx) => (
                      <tr key={idx}>
                        <td><strong>{k.khatianNumber}</strong></td>
                        <td>{k.ownerName}</td>
                        <td>{k.surveyEra}</td>
                        <td>{k.recordedArea} dec</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>{t.physicalLimit}:</span>
                    <strong>{plotData.plot.totalPhysicalArea} Dec</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>{t.allocatedArea}:</span>
                    <strong style={{ color: plotData.utilization > 100 ? 'var(--danger)' : 'inherit' }}>
                      {plotData.totalAllocated} Dec
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{t.remainingArea}:</span>
                    <strong>{plotData.remaining} Dec</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: TITLE MUTATION CHAIN */}
      {activeTab === 'chain' && (
        <div className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2>{lang === 'en' ? 'Title History & Mutation Chain (Namjari)' : 'জমির ধারাবাহিক মালিকানা ও নামজারি খতিয়ান ইতিহাস'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {lang === 'en' ? 'Chronological audit tracking land evolution: CS → SA → RS → BS & Mutation.' : 'সিএস থেকে নামজারি পর্যন্ত ধারাবাহিক মালিকানা অডিটিং।'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                placeholder="Dag No." 
                value={chainDag} 
                onChange={e => setChainDag(e.target.value)} 
                style={{ width: '100px', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
              <button 
                className="btn-hero-green" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => loadMutationChain(chainMouza, chainDag)}
              >
                {lang === 'en' ? 'Track Chain' : 'চেইন দেখুন'}
              </button>
            </div>
          </div>

          <div className="ui-card">
            <h3>{lang === 'en' ? `Mouza: ${chainMouza} | Dag (Plot): ${chainDag}` : `মৌজা: ${chainMouza} | দাগ নং: ${chainDag}`}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
              {lang === 'en' ? 'Checking whether legal title transfers maintain unbroken lineage across historical government records.' : 'মালিকানার ধারাবাহিকতা সরকারি নথিতে অক্ষুণ্ণ রয়েছে কি না যাচাই করা হচ্ছে।'}
            </p>

            {chainLoading ? (
              <p>{lang === 'en' ? 'Auditing Land Mutation Ledger...' : 'খতিয়ানের ধারাবাহিকতা অনুসন্ধান হচ্ছে...'}</p>
            ) : chainData.length > 0 ? (
              <div className="timeline-container">
                {chainData.map((node) => (
                  <div key={node.id} className="timeline-item">
                    <div className={`timeline-dot ${node.status === 'VERIFIED' ? 'verified' : 'broken'}`} />
                    <div className="timeline-header">
                      <div className="timeline-title">
                        {node.surveyEra} &bull; Khatian #{node.khatianNo}
                      </div>
                      <span className={`timeline-badge ${node.status === 'VERIFIED' ? 'verified' : 'broken'}`}>
                        {node.status === 'VERIFIED' ? (lang === 'en' ? 'Verified Title Chain' : 'বৈধ ধারাবাহিকতা') : (lang === 'en' ? 'Discrepancy / Broken Link' : 'অসঙ্গতি / ত্রুটিযুক্ত')}
                      </span>
                    </div>
                    <div className="timeline-body">
                      <div><strong>{lang === 'en' ? 'Recorded Owner:' : 'রেকর্ডীয় মালিক:'}</strong> {node.ownerName} ({node.holdingArea} Decimals)</div>
                      <div><strong>{lang === 'en' ? 'Transfer Mode:' : 'হস্তান্তরের মাধ্যম:'}</strong> {node.transferType} &bull; <strong>{lang === 'en' ? 'Year:' : 'সন:'}</strong> {node.yearRecorded}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? 'No historical mutation records logged for this Dag.' : 'এই দাগের জন্য কোনো নামজারি হিস্টোরি পাওয়া যায়নি।'}</p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: COMMUNITY DISPUTE REPORTING */}
      {activeTab === 'dispute' && (
        <div className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2>{lang === 'en' ? 'Citizen Watchlist & Land Dispute Registry' : 'নাগরিক ওয়াচলিস্ট ও ভূমি বিরোধ রেজিস্ট্রি'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {lang === 'en' ? 'Report pending civil litigation, inheritance conflicts, or land-grabbing attempts to protect prospective buyers.' : 'ক্রেতাদের বাঁচাতে চলমান মামলা, ওয়ারিশ বিরোধ বা জবরদখলের তথ্য নিবন্ধন করুন।'}
              </p>
            </div>
          </div>

          <div className="checker-grid">
            <div className="ui-card">
              <h3>{lang === 'en' ? 'File a Land Dispute Alert' : 'বিরোধের সতর্কবার্তা জমা দিন'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
                {lang === 'en' ? 'Your report will flag this plot across the public verification engine.' : 'আপনার রিপোর্ট এই দাগটিকে সার্বজনীন ভেরিফিকেশন পোর্টালে চিহ্নিত করবে।'}
              </p>

              {disputeSuccess && (
                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {lang === 'en' ? 'Dispute report successfully registered! It is now active on the watch registry.' : 'বিরোধ রিপোর্ট সফলভাবে যুক্ত হয়েছে! এটি ওয়াচলিস্টে দৃশ্যমান।'}
                </div>
              )}

              <form onSubmit={handleSubmitDispute}>
                <div className="form-field">
                  <label>{t.mouzaLabel}</label>
                  <select 
                    value={disputeForm.mouzaName} 
                    onChange={e => setDisputeForm({...disputeForm, mouzaName: e.target.value})}
                  >
                    <option value="Ashulia">Ashulia (ঢাকা - আশুলিয়া)</option>
                    <option value="Savar">Savar (ঢাকা - সাভার)</option>
                    <option value="Dhamrai">Dhamrai (ঢাকা - ধামরাই)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>{t.dagLabel}</label>
                  <input 
                    type="number" 
                    value={disputeForm.dagNumber} 
                    onChange={e => setDisputeForm({...disputeForm, dagNumber: e.target.value})} 
                    placeholder="e.g. 102 or 103" 
                    required 
                  />
                </div>

                <div className="form-field">
                  <label>{lang === 'en' ? 'Dispute Category' : 'বিরোধের ধরণ'}</label>
                  <select 
                    value={disputeForm.disputeType} 
                    onChange={e => setDisputeForm({...disputeForm, disputeType: e.target.value})}
                  >
                    <option value="Co-sharer Inheritance Dispute">Co-sharer Inheritance Dispute (ওয়ারিশ বন্টননামা বিরোধ)</option>
                    <option value="Court Injunction">Court Injunction (আদালতের নিষেধাজ্ঞা / দেওয়ানি মামলা)</option>
                    <option value="Power of Attorney Fraud">Power of Attorney Fraud (আমমোক্তারনামা জালিয়াতি)</option>
                    <option value="Wetland / Government Encroachment">Wetland / Government Encroachment (সরকারি খাস বা জলাশয় দখল)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>{lang === 'en' ? 'Court Case / File Number (Optional)' : 'মামলা নম্বর (যদি থাকে)'}</label>
                  <input 
                    type="text" 
                    value={disputeForm.caseNumber} 
                    onChange={e => setDisputeForm({...disputeForm, caseNumber: e.target.value})} 
                    placeholder="e.g. Title Suit No. 45/2026" 
                  />
                </div>

                <div className="form-field">
                  <label>{lang === 'en' ? 'Complainant Name / Advocate' : 'অভিযোগকারী / আইনজীবীর নাম'}</label>
                  <input 
                    type="text" 
                    value={disputeForm.complainantName} 
                    onChange={e => setDisputeForm({...disputeForm, complainantName: e.target.value})} 
                    placeholder="e.g. Adv. Kazi Mizanur Rahman" 
                    required 
                  />
                </div>

                <div className="form-field">
                  <label>{lang === 'en' ? 'Contact Phone' : 'মোবাইল নম্বর'}</label>
                  <input 
                    type="text" 
                    value={disputeForm.phone} 
                    onChange={e => setDisputeForm({...disputeForm, phone: e.target.value})} 
                    placeholder="017XXXXXXXX" 
                  />
                </div>

                <div className="form-field">
                  <label>{lang === 'en' ? 'Dispute Description' : 'বিরোধের বিস্তারিত বিবরণ'}</label>
                  <textarea 
                    rows="3"
                    value={disputeForm.description} 
                    onChange={e => setDisputeForm({...disputeForm, description: e.target.value})} 
                    placeholder={lang === 'en' ? 'Provide details...' : 'কী কারণে হস্তান্তর ঝুঁকিপূর্ণ তা লিখুন...'} 
                    required 
                  />
                </div>

                <button type="submit" className="btn-green-full">{lang === 'en' ? 'Submit Public Dispute Report' : 'বিরোধের তথ্য জমা দিন'}</button>
              </form>
            </div>

            <div className="ui-card">
              <h3>{lang === 'en' ? 'Active Community Watchlist' : 'নাগরিক ওয়াচলিস্টের তথ্যসমূহ'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 1rem 0' }}>
                {lang === 'en' ? 'Recent dispute reports filed by co-sharers, lawyers, and civil advocates.' : 'ওয়ারিশ, আইনজীবী ও সাধারণ নাগরিকদের দাখিলকৃত চলমান বিরোধ তালিকা।'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
                {allDisputes.map((d) => (
                  <div key={d.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--primary-forest)' }}>Mouza: {d.mouzaName} &bull; Dag #{d.dagNumber}</strong>
                      <span className={`badge-status ${d.status === 'RESOLVED' ? 'clear' : 'warning'}`}>
                        {d.status === 'RESOLVED' ? 'Resolved' : d.disputeType}
                      </span>
                    </div>
                    {d.caseNumber && (
                      <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>
                        Case: {d.caseNumber}
                      </div>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                      {d.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{lang === 'en' ? 'Filed by' : 'দাখিলকারী'}: {d.complainantName} &bull; {d.reportedAt}</span>
                      {d.status === 'ACTIVE' && (
                        <button 
                          className="btn-outline" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                          onClick={() => handleResolveDispute(d.id)}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: PUBLIC QR CODE VERIFIER */}
      {activeTab === 'verify' && (
        <div className="page-container">
          <div className="public-verify-card">
            <div className="verify-badge-large">
              <CheckCircle size={20} color="#10b981" />
              <span>Official DLRS Land Clearance Validator</span>
            </div>

            <h2>Verify Digital Clearance Certificate</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem auto 1.75rem auto', maxWidth: '480px' }}>
              Confirm the validity of printed pre-registration clearance slips issued by the Mouza-Khatian Discrepancy Engine.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
              <input 
                type="text" 
                placeholder="Enter Token (e.g. MC-2026-122358)"
                value={verifyTokenInput}
                onChange={e => setVerifyTokenInput(e.target.value)}
                style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', flex: 1 }}
              />
              <button 
                className="btn-primary" 
                style={{ padding: '0.75rem 1.5rem' }}
                onClick={() => handleLookupToken(verifyTokenInput)}
                disabled={tokenSearching}
              >
                {tokenSearching ? 'Validating...' : 'Verify'}
              </button>
            </div>

            {tokenSearchError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.85rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                {tokenSearchError}
              </div>
            )}

            {verifiedTokenData && (
              <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CERTIFICATE TOKEN</span>
                    <h3 style={{ color: 'var(--primary-forest)' }}>{verifiedTokenData.clearanceToken}</h3>
                  </div>
                  <span className="badge-status clear" style={{ fontSize: '0.85rem' }}>GENUINE & RECORDED</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                  <div><strong>Mouza:</strong> {verifiedTokenData.mouzaName}</div>
                  <div><strong>Upazila / District:</strong> {verifiedTokenData.upazila}, {verifiedTokenData.district}</div>
                  <div><strong>Cadastral Dag:</strong> #{verifiedTokenData.dagNumber}</div>
                  <div><strong>Physical Map Capacity:</strong> {verifiedTokenData.totalPhysicalArea} Decimals</div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Issuer: {verifiedTokenData.certifiedBy}</span>
                  <span>Validation Date: {new Date().toISOString().substring(0, 10)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 7: OFFICER CONSOLE WITH ADMIN MANAGEMENT CONTROLS (NEW) */}
      {activeTab === 'officer' && (
        <div className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>{lang === 'en' ? 'Officer Console & Registry Management' : 'সাব-রেজিস্ট্রার ও সহকারী কমিশনার (ভূমি) কনসোল'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {lang === 'en' ? 'Manage Mouza plot limits, record Khatians, and review flagged deeds.' : 'মৌজা প্লট সীমা নির্ধারণ, খতিয়ান অন্তর্ভুক্তি ও দলিল পর্যালোচনা।'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setShowAddPlotModal(true)}
              >
                <PlusCircle size={15} /> Add New Plot
              </button>
              <button 
                className="btn-outline" 
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setShowAddKhatianModal(true)}
              >
                <UserPlus size={15} /> Record Khatian
              </button>
            </div>
          </div>

          {stats && (
            <>
              <div className="dashboard-metrics">
                <div className="metric-box">
                  <span>{lang === 'en' ? 'Total Monitored Dags' : 'মোট নিরীক্ষিত দাগ'}</span>
                  <h2>{stats.stats.totalDags}</h2>
                </div>
                <div className="metric-box">
                  <span>{lang === 'en' ? 'Valid Transfers Approved' : 'অনুমোদিত হস্তান্তর'}</span>
                  <h2 style={{ color: 'var(--accent-green)' }}>{stats.stats.validTransfers}</h2>
                </div>
                <div className="metric-box">
                  <span>{lang === 'en' ? 'Flagged & Blocked Deals' : 'চিহ্নিত ও স্থগিত চুক্তি'}</span>
                  <h2 style={{ color: 'var(--danger)' }}>{stats.stats.flaggedTransfers}</h2>
                </div>
                <div className="metric-box">
                  <span>{lang === 'en' ? 'Active Citizen Disputes' : 'সক্রিয় নাগরিক বিরোধ'}</span>
                  <h2 style={{ color: 'var(--warning)' }}>{stats.stats.activeDisputesCount}</h2>
                </div>
              </div>

              {/* Transactions Review Queue */}
              <div className="ui-card" style={{ marginBottom: '2rem' }}>
                <h3>{lang === 'en' ? 'Recent Deed Transactions & Review Queue' : 'সাম্প্রতিক দলিল ও রিভিউ কিউ'}</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TX ID</th>
                      <th>{t.mouzaLabel}</th>
                      <th>{t.dagLabel}</th>
                      <th>{lang === 'en' ? 'Proposed Area' : 'জমির পরিমাণ'}</th>
                      <th>{lang === 'en' ? 'Buyer' : 'ক্রেতা'}</th>
                      <th>{lang === 'en' ? 'Issue / Status' : 'সমস্যা / অবস্থা'}</th>
                      <th>{lang === 'en' ? 'Action' : 'পদক্ষেপ'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td><strong>{tx.id}</strong></td>
                        <td>{tx.mouzaName}</td>
                        <td>{tx.dagNumber}</td>
                        <td>{tx.proposedArea} dec</td>
                        <td>{tx.buyerName}</td>
                        <td>
                          <span className={`badge-status ${tx.status.toLowerCase()}`}>
                            {tx.status} {tx.issue ? `(${tx.issue})` : ''}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-outline" 
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => setSelectedTx(tx)}
                          >
                            {lang === 'en' ? 'Review' : 'রিভিউ'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* All Dags Table with Search & Status Filter */}
              <div className="ui-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3>{lang === 'en' ? `Dag Utilization & Zoning Overview (${filteredDags.length} Plots)` : `দাগভিত্তিক ব্যবহার ও জোনিং বিবরণ (${filteredDags.length}টি দাগ)`}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder={lang === 'en' ? 'Search Dag or Mouza...' : 'দাগ বা মৌজা খুঁজুন...'} 
                      value={officerSearch} 
                      onChange={e => setOfficerSearch(e.target.value)}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', width: '180px' }}
                    />
                    <select 
                      value={officerStatusFilter} 
                      onChange={e => setOfficerStatusFilter(e.target.value)}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="CLEAR">Clear Plots</option>
                      <option value="OVER">Over-Allocated</option>
                      <option value="ECO">Wetland Zones</option>
                    </select>
                  </div>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.dagLabel}</th>
                      <th>{t.mouzaLabel}</th>
                      <th>{t.physicalLimit}</th>
                      <th>{t.allocatedArea}</th>
                      <th>{t.remainingArea}</th>
                      <th>{lang === 'en' ? 'Zoning Status' : 'অবস্থা'}</th>
                      <th>{lang === 'en' ? 'Action' : 'পদক্ষেপ'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDags.map((dag, i) => {
                      const rem = dag.totalPhysicalArea - dag.allocatedArea;
                      const isOver = rem < 0;
                      return (
                        <tr key={i}>
                          <td><strong>{dag.dagNumber}</strong></td>
                          <td>{dag.mouzaName}</td>
                          <td>{dag.totalPhysicalArea} dec</td>
                          <td>{dag.allocatedArea} dec</td>
                          <td>{rem.toFixed(2)} dec</td>
                          <td>
                            {dag.isEcoProtected === 1 ? (
                              <span className="badge-status eco">{lang === 'en' ? 'Protected Wetland' : 'সংরক্ষিত জলাভূমি'}</span>
                            ) : (
                              <span className={`badge-status ${isOver ? 'flagged' : 'clear'}`}>
                                {isOver ? (lang === 'en' ? 'Over-Allocated' : 'অতিরিক্ত বরাদ্দ') : (lang === 'en' ? 'Clear' : 'বৈধ')}
                              </span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn-outline" 
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', marginRight: '4px' }}
                              onClick={() => loadPlotInspection(dag.mouzaName, dag.dagNumber)}
                            >
                              Map
                            </button>
                            <button 
                              className="btn-outline" 
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              onClick={() => loadMutationChain(dag.mouzaName, dag.dagNumber)}
                            >
                              Chain
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ADMIN MODAL: ADD NEW PLOT */}
          {showAddPlotModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Add New Mouza Plot</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 1.25rem 0' }}>
                  Register a newly surveyed cadastral boundary from the Mouza Blueprint.
                </p>

                <form onSubmit={handleCreatePlot}>
                  <div className="form-field">
                    <label>Mouza Name</label>
                    <select 
                      value={newPlotForm.mouzaName} 
                      onChange={e => setNewPlotForm({...newPlotForm, mouzaName: e.target.value})}
                    >
                      <option value="Ashulia">Ashulia</option>
                      <option value="Savar">Savar</option>
                      <option value="Dhamrai">Dhamrai</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Dag Number (Plot Number)</label>
                    <input 
                      type="number" 
                      value={newPlotForm.dagNumber} 
                      onChange={e => setNewPlotForm({...newPlotForm, dagNumber: e.target.value})} 
                      placeholder="e.g. 105" 
                      required 
                    />
                  </div>

                  <div className="form-field">
                    <label>Total Physical Area from Mouza Map (Decimals)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newPlotForm.totalPhysicalArea} 
                      onChange={e => setNewPlotForm({...newPlotForm, totalPhysicalArea: e.target.value})} 
                      placeholder="e.g. 20.00" 
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="ecoCheck" 
                      checked={newPlotForm.isEcoProtected} 
                      onChange={e => setNewPlotForm({...newPlotForm, isEcoProtected: e.target.checked})} 
                    />
                    <label htmlFor="ecoCheck" style={{ margin: 0, fontSize: '0.85rem' }}>
                      Designate as DAP Protected Wetland / Eco-Reserve
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                      Save Plot
                    </button>
                    <button type="button" className="btn-outline" style={{ padding: '0.75rem' }} onClick={() => setShowAddPlotModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADMIN MODAL: RECORD KHATIAN */}
          {showAddKhatianModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Record Official Khatian</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 1.25rem 0' }}>
                  Register approved mutation (Namjari) or revisional survey ownership.
                </p>

                <form onSubmit={handleCreateKhatian}>
                  <div className="form-field">
                    <label>Mouza Name</label>
                    <select 
                      value={newKhatianForm.mouzaName} 
                      onChange={e => setNewKhatianForm({...newKhatianForm, mouzaName: e.target.value})}
                    >
                      <option value="Ashulia">Ashulia</option>
                      <option value="Savar">Savar</option>
                      <option value="Dhamrai">Dhamrai</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Dag Number</label>
                    <input 
                      type="number" 
                      value={newKhatianForm.dagNumber} 
                      onChange={e => setNewKhatianForm({...newKhatianForm, dagNumber: e.target.value})} 
                      placeholder="e.g. 101" 
                      required 
                    />
                  </div>

                  <div className="form-field">
                    <label>Khatian Number</label>
                    <input 
                      type="text" 
                      value={newKhatianForm.khatianNumber} 
                      onChange={e => setNewKhatianForm({...newKhatianForm, khatianNumber: e.target.value})} 
                      placeholder="e.g. K-9901" 
                      required 
                    />
                  </div>

                  <div className="form-field">
                    <label>Recognized Owner Name</label>
                    <input 
                      type="text" 
                      value={newKhatianForm.ownerName} 
                      onChange={e => setNewKhatianForm({...newKhatianForm, ownerName: e.target.value})} 
                      placeholder="e.g. Md. Shahidul Islam" 
                      required 
                    />
                  </div>

                  <div className="form-field">
                    <label>Recorded Area (Decimals)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newKhatianForm.recordedArea} 
                      onChange={e => setNewKhatianForm({...newKhatianForm, recordedArea: e.target.value})} 
                      placeholder="e.g. 3.50" 
                      required 
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                      Record Khatian
                    </button>
                    <button type="button" className="btn-outline" style={{ padding: '0.75rem' }} onClick={() => setShowAddKhatianModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Officer Review Modal */}
          {selectedTx && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Review Transaction #{selectedTx.id}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 1.25rem 0' }}>
                  Sub-Registrar validation check for Mouza {selectedTx.mouzaName}, Dag {selectedTx.dagNumber}.
                </p>

                <div style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <div><strong>Buyer:</strong> {selectedTx.buyerName}</div>
                  <div><strong>Seller:</strong> {selectedTx.sellerName}</div>
                  <div><strong>Proposed Area:</strong> {selectedTx.proposedArea} Decimal</div>
                  <div><strong>Flagged Reason:</strong> {selectedTx.issue}</div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '0.75rem' }}
                    onClick={() => handleUpdateStatus('CLEAR')}
                  >
                    Force Approve
                  </button>
                  <button 
                    className="btn-outline" 
                    style={{ flex: 1, padding: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onClick={() => handleUpdateStatus('BLOCKED')}
                  >
                    Block Deed
                  </button>
                  <button 
                    className="btn-outline" 
                    style={{ padding: '0.75rem' }}
                    onClick={() => setSelectedTx(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 8: CERTIFICATE CLEARANCE SLIP */}
      {activeTab === 'slip' && checkResult && (
        <div className="page-container">
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', maxWidth: '760px', margin: '0 auto 1.5rem auto' }}>
            <button className="btn-outline" onClick={() => setActiveTab('checker')}>&larr; Back to Checker</button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-outline" onClick={() => window.print()}>
                <Printer size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Quick Print
              </button>
              <button className="btn-primary" onClick={exportSlipToPdf} disabled={downloadingPdf}>
                <Download size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> 
                {downloadingPdf ? 'Generating PDF...' : 'Download PDF Certificate'}
              </button>
            </div>
          </div>

          <div className="clearance-slip-container" ref={slipPrintRef}>
            <div className="slip-emblem-header">
              <ShieldCheck size={42} color="#10b981" style={{ margin: '0 auto' }} />
              <h2>{lang === 'en' ? "Government of the People's Republic of Bangladesh" : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}</h2>
              <p>{lang === 'en' ? 'Ministry of Land • Directorate of Land Records and Surveys (DLRS)' : 'ভূমি মন্ত্রণালয় • ভূমি রেকর্ড ও জরিপ অধিদপ্তর'}</p>
              <div style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-dark)' }}>
                {lang === 'en' ? 'Official Pre-Registration Land Transfer Clearance Slip' : 'ভূমি হস্তান্তর প্রাক-নিবন্ধন অনাপত্তিপত্র / ছাড়পত্র'}
              </div>
            </div>

            <div className="slip-token-banner">
              <div>
                <span>{lang === 'en' ? 'CERTIFICATE ID:' : 'ছাড়পত্র সনদ নম্বর:'}</span>
                <strong style={{ marginLeft: '6px' }}>{checkResult.clearanceToken}</strong>
              </div>
              <div>
                <span>TrxID:</span>
                <strong style={{ marginLeft: '6px', color: '#e2136e' }}>{trxId}</strong>
              </div>
            </div>

            <div className="slip-columns">
              <div className="slip-col">
                <h4>{lang === 'en' ? 'Cadastral Identification' : 'মৌজা ও ভূমির পরিচিতি'}</h4>
                <div className="slip-field"><span>{lang === 'en' ? 'District:' : 'জেলা:'}</span><strong>{checkResult.district}</strong></div>
                <div className="slip-field"><span>{lang === 'en' ? 'Upazila:' : 'উপজেলা:'}</span><strong>{checkResult.upazila}</strong></div>
                <div className="slip-field"><span>{lang === 'en' ? 'Revenue Mouza:' : 'রাজস্ব মৌজা:'}</span><strong>{checkResult.mouzaName}</strong></div>
                <div className="slip-field"><span>{lang === 'en' ? 'Plot (Dag) No.:' : 'দাগ নম্বর:'}</span><strong>#{checkResult.dagNumber}</strong></div>
                <div className="slip-field">
                  <span>{lang === 'en' ? 'Eco-Reserve Check:' : 'পরিবেশ ছাড়পত্র:'}</span>
                  <strong style={{ color: checkResult.isEcoProtected ? '#0284c7' : 'inherit' }}>
                    {checkResult.isEcoProtected ? checkResult.ecoZoneType : (lang === 'en' ? 'Clear (Zoned)' : 'বৈধ জোন')}
                  </strong>
                </div>
              </div>

              <div className="slip-col">
                <h4>{lang === 'en' ? 'Area Computations' : 'জমির হিসাব বিবরণ'}</h4>
                <div className="slip-field"><span>{lang === 'en' ? 'Mouza Map Capacity:' : 'নকশার ধারণক্ষমতা:'}</span><strong>{checkResult.totalPhysicalArea} Dec</strong></div>
                <div className="slip-field"><span>{lang === 'en' ? 'Prior Recorded Area:' : 'পূর্বে রেকর্ডকৃত জমি:'}</span><strong>{checkResult.allocatedArea} Dec</strong></div>
                <div className="slip-field"><span>{lang === 'en' ? 'Unencumbered Left:' : 'অবশিষ্ট খালি জমি:'}</span><strong>{checkResult.remainingArea} Dec</strong></div>
                <div className="slip-field"><span>{lang === 'en' ? 'Approved Transfer:' : 'অনুমোদিত হস্তান্তর:'}</span><strong>{checkResult.proposedArea} Dec</strong></div>
                <div className="slip-field"><span>{lang === 'en' ? 'Verdict:' : 'সিদ্ধান্ত:'}</span><strong style={{ color: 'var(--accent-green)' }}>LEGAL CAPACITY CONFIRMED</strong></div>
              </div>
            </div>

            <div className="slip-verification-row">
              <div className="slip-qr-box">
                <QRCodeSVG 
                  value={`https://bhumisafe.gov.bd/verify?token=${checkResult.clearanceToken}&dag=${checkResult.dagNumber}&mouza=${checkResult.mouzaName}&trx=${trxId}`} 
                  size={90}
                  level="H"
                />
                <span>
                  {lang === 'en' 
                    ? 'Scan with any smartphone camera to verify the digital authenticity of this deed clearance against the Mouza Map registry.'
                    : 'যেকোনো ক্যামেরা দিয়ে কিউআর কোড স্ক্যান করে অনলাইন ডাটাবেজে এই ছাড়পত্রের সত্যতা যাচাই করুন।'}
                </span>
              </div>

              <div className="slip-signature-box">
                <div className="slip-signature-seal">DIGITALLY CERTIFIED</div>
                <div>Automated Mouza-Khatian Discrepancy Engine</div>
                <div style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  Timestamp: 2026-10-03 21:42:34
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REALISTIC bKASH PAYMENT GATEWAY MODAL */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal-box">
            <div className="bkash-badge">bKash Government Fee Gateway</div>
            <h3>{t.feeTitle}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.35rem 0 1.25rem 0' }}>
              {t.feeSubtitle}
            </p>

            <div style={{ background: '#fdf2f8', padding: '1rem', borderRadius: '8px', border: '1px solid #fbcfe8', marginBottom: '1.25rem', textAlign: 'left', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <div><strong>{t.mouzaLabel}:</strong> {checkResult?.mouzaName}</div>
              <div><strong>{t.dagLabel}:</strong> #{checkResult?.dagNumber}</div>
              <div><strong>{lang === 'en' ? 'Service Fee:' : 'ভেরিফিকেশন ফি:'}</strong> <span style={{ color: '#e2136e', fontWeight: 'bold' }}>50.00 BDT</span></div>
            </div>

            <form onSubmit={handleSimulatePayment}>
              <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> Enter 5-Digit bKash PIN to Confirm
                </label>
                <input 
                  type="password" 
                  maxLength="5" 
                  className="bkash-input-field" 
                  placeholder="•••••" 
                  value={bkashPin} 
                  onChange={e => setBkashPin(e.target.value)} 
                  required 
                />
              </div>

              <button 
                type="submit"
                className="btn-primary" 
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', background: '#e2136e' }}
                disabled={paymentProcessing}
              >
                <CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                {paymentProcessing ? t.paying : t.payWithBkash}
              </button>
            </form>

            <button 
              className="btn-outline" 
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.65rem' }}
              onClick={() => setShowPaymentModal(false)}
            >
              {lang === 'en' ? 'Cancel' : 'বাতিল করুন'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}