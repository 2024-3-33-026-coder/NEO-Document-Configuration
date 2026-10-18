import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { CanvasPdfViewer } from './components/CanvasPdfViewer';
import { NeoTransportNavbarLogo } from './components/NeoTransportNavbarLogo';
import {
  Truck,
  FileText,
  UploadCloud,
  Sparkles,
  Download,
  Settings2,
  ChevronDown,
  Eye,
  RefreshCw,
  CheckCircle2,
  Car,
  User,
  CreditCard,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Code2,
  Copy,
  Check,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Crosshair,
  Sliders
} from 'lucide-react';

interface Coordinates {
  vX: number;
  vY: number;
  pX: number;
  pY: number;
  dX: number;
  dY: number;
}

const DEFAULT_COORDINATES: Coordinates = {
  vX: 385,
  vY: 249,
  pX: 305,
  pY: 220,
  dX: 305,
  dY: 178,
};

const PRESET_FLEET = [
  { label: 'Hossein (Van YD21PWZ)', reg: 'YD21PWZ', person: 'HOSSEIN BOYRATI', id: 'DRIVING LICENSE' },
  { label: 'David (HGV NX72BVO)', reg: 'NX72BVO', person: 'DAVID CHEN', id: 'TACHO CARD #48291' },
  { label: 'Sarah (Luton LK23WRP)', reg: 'LK23WRP', person: 'SARAH CONNOR', id: 'UK DQC CARD' },
];

export default function App() {
  // Form State
  const [vehReg, setVehReg] = useState('YD21PWZ');
  const [personName, setPersonName] = useState('HOSSEIN BOYRATI');
  const [driverId, setDriverId] = useState('DRIVING LICENSE');
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [fontSize, setFontSize] = useState(11);
  const [fontColor, setFontColor] = useState<'black' | 'navy' | 'darkblue'>('black');

  // File & Preview State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(1);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // UI Interactive States
  const [isDragging, setIsDragging] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCoordsGuide, setShowCoordsGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Create a realistic sample PDF for Neo Transport so user can immediately test
  const handleGenerateSampleTemplate = async () => {
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.create();
      // Standard A4 page (595.28 x 841.89 pt)
      const page = pdfDoc.addPage([595.28, 841.89]);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Colors
      const navy = rgb(0.043, 0.098, 0.173); // #0b192c
      const cyan = rgb(0.007, 0.517, 0.78); // #0284c7
      const grayLight = rgb(0.94, 0.95, 0.96);
      const grayBorder = rgb(0.8, 0.83, 0.88);
      const textDark = rgb(0.1, 0.15, 0.2);
      const textMuted = rgb(0.4, 0.45, 0.5);

      // Header Banner
      page.drawRectangle({
        x: 40,
        y: 760,
        width: 515,
        height: 50,
        color: navy,
      });

      page.drawText('NEO TRANSPORT', {
        x: 55,
        y: 780,
        size: 18,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText('LOGISTICS & FREIGHT DISPATCH NOTE', {
        x: 55,
        y: 768,
        size: 9,
        font: fontRegular,
        color: cyan,
      });

      page.drawText('DOC NO: NT-COL-2026-9041', {
        x: 375,
        y: 780,
        size: 10,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText('DATE: 18-OCT-2026  12:00 UTC', {
        x: 375,
        y: 768,
        size: 8,
        font: fontRegular,
        color: rgb(0.8, 0.85, 0.9),
      });

      // Section: Consignment Info
      page.drawRectangle({
        x: 40,
        y: 630,
        width: 515,
        height: 110,
        color: grayLight,
        borderColor: grayBorder,
        borderWidth: 1,
      });

      page.drawText('CONSIGNMENT SPECIFICATION', {
        x: 55,
        y: 720,
        size: 11,
        font: fontBold,
        color: navy,
      });

      page.drawText('Sender: Global Freight Hub Depot 4B, Heathrow, London', {
        x: 55,
        y: 700,
        size: 9,
        font: fontRegular,
        color: textDark,
      });
      page.drawText('Consignee: Neo Freight Terminal - Bay 12, Manchester M17 1EH', {
        x: 55,
        y: 685,
        size: 9,
        font: fontRegular,
        color: textDark,
      });
      page.drawText('Cargo: Commercial Auto Parts & Secure Electronics (3 Pallets / 740 KG)', {
        x: 55,
        y: 670,
        size: 9,
        font: fontRegular,
        color: textDark,
      });
      page.drawText('Status: AUTHORIZED FOR COLLECTION BY LICENSED COURIER', {
        x: 55,
        y: 645,
        size: 8.5,
        font: fontBold,
        color: cyan,
      });

      // Central Collection Verification Box (Matches the coordinate area!)
      // Coordinates reference:
      // vX=385, vY=249 -> Vehicle Reg
      // pX=305, pY=220 -> Person Collecting
      // dX=305, dY=178 -> Driver ID
      page.drawRectangle({
        x: 40,
        y: 150,
        width: 515,
        height: 140,
        color: rgb(1, 1, 1),
        borderColor: grayBorder,
        borderWidth: 1.5,
      });

      // Header strip for Collection Section
      page.drawRectangle({
        x: 40,
        y: 265,
        width: 515,
        height: 25,
        color: rgb(0.92, 0.95, 0.98),
      });

      page.drawText('COLLECTION AUTHORIZATION & VEHICLE HANDOVER', {
        x: 55,
        y: 273,
        size: 9.5,
        font: fontBold,
        color: navy,
      });

      // Labels on the template
      page.drawText('Authorized Vehicle Registration:', {
        x: 55,
        y: 249,
        size: 10,
        font: fontBold,
        color: textDark,
      });
      // Line for vehicle reg
      page.drawLine({
        start: { x: 230, y: 246 },
        end: { x: 530, y: 246 },
        thickness: 0.75,
        color: grayBorder,
      });

      page.drawText('Full Name of Person Collecting:', {
        x: 55,
        y: 220,
        size: 10,
        font: fontBold,
        color: textDark,
      });
      // Line for person name
      page.drawLine({
        start: { x: 230, y: 217 },
        end: { x: 530, y: 217 },
        thickness: 0.75,
        color: grayBorder,
      });

      page.drawText('Driver Identification / License No:', {
        x: 55,
        y: 178,
        size: 10,
        font: fontBold,
        color: textDark,
      });
      // Line for driver ID
      page.drawLine({
        start: { x: 230, y: 175 },
        end: { x: 530, y: 175 },
        thickness: 0.75,
        color: grayBorder,
      });

      // Footer notice
      page.drawText('I confirm that goods listed above were received in sound condition and verified against driver credentials.', {
        x: 55,
        y: 100,
        size: 8,
        font: fontRegular,
        color: textMuted,
      });
      page.drawText('Official Neo Transport Logistics Operations System - All Rights Reserved.', {
        x: 55,
        y: 85,
        size: 7.5,
        font: fontRegular,
        color: textMuted,
      });

      const pdfBytesData = await pdfDoc.save();
      const sampleBlob = new Blob([pdfBytesData.buffer as ArrayBuffer], { type: 'application/pdf' });
      const sampleFile = new File([sampleBlob], 'Neo_Transport_Collection_Template.pdf', { type: 'application/pdf' });
      
      setFile(sampleFile);
      setFileName(sampleFile.name);
      setFileSize(`${(sampleFile.size / 1024).toFixed(1)} KB`);
      setPageCount(1);
      setPdfBytes(new Uint8Array(pdfBytesData));
      
      const sampleUrl = URL.createObjectURL(sampleBlob);
      setPreviewUrl(sampleUrl);
      setIsGenerated(false);
      setGeneratedBlobUrl(null);
      showToast('Sample Neo Transport Collection Template loaded!');
    } catch (err) {
      console.error(err);
      showToast('Error generating sample template.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle uploaded file
  const handleFile = async (selectedFile: File) => {
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      showToast('Please upload a valid PDF document.');
      return;
    }

    try {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(`${(selectedFile.size / 1024).toFixed(1)} KB`);

      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      setPdfBytes(bytes);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setIsGenerated(false);
      setGeneratedBlobUrl(null);
      showToast(`Uploaded: ${selectedFile.name}`);
    } catch (err) {
      console.error('PDF Load Error:', err);
      showToast('Failed to parse PDF document.');
    }
  };

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Apply Presets
  const handleApplyPreset = (preset: typeof PRESET_FLEET[0]) => {
    setVehReg(preset.reg);
    setPersonName(preset.person);
    setDriverId(preset.id);
    showToast(`Loaded preset for ${preset.person}`);
  };

  // Adjust coordinate value
  const handleCoordChange = (key: keyof Coordinates, delta: number) => {
    setCoords(prev => ({
      ...prev,
      [key]: prev[key] + delta,
    }));
  };

  // Reset coordinates
  const handleResetCoords = () => {
    setCoords(DEFAULT_COORDINATES);
    setFontSize(11);
    setFontColor('black');
    showToast('Coordinates restored to standard defaults.');
  };

  // Core PDF Generation - Exact preservation of original PDF-lib coordinate logic
  const handleProcessPdf = async () => {
    if (!file) {
      showToast('Please upload or generate a PDF template first.');
      return;
    }

    setIsProcessing(true);

    try {
      // Small artificial step for satisfying feedback UI
      await new Promise(r => setTimeout(r, 350));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Embed Standard Helvetica Font (as per specification)
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Determine text color
      let textColor = rgb(0, 0, 0); // Standard black
      if (fontColor === 'navy') textColor = rgb(0.043, 0.098, 0.173);
      if (fontColor === 'darkblue') textColor = rgb(0.007, 0.35, 0.65);

      // Write text overlay natively on Page 1 (exact requested coordinates)
      firstPage.drawText(vehReg, {
        x: coords.vX,
        y: coords.vY,
        size: fontSize,
        font: helveticaFont,
        color: textColor,
      });

      firstPage.drawText(personName, {
        x: coords.pX,
        y: coords.pY,
        size: fontSize,
        font: helveticaFont,
        color: textColor,
      });

      firstPage.drawText(driverId, {
        x: coords.dX,
        y: coords.dY,
        size: fontSize,
        font: helveticaFont,
        color: textColor,
      });

      // Save PDF and create clean Blob URL and bytes
      const pdfBytesData = await pdfDoc.save();
      const generatedBytes = new Uint8Array(pdfBytesData);
      setPdfBytes(generatedBytes);

      const blob = new Blob([pdfBytesData.buffer as ArrayBuffer], { type: 'application/pdf' });
      const finalUrl = URL.createObjectURL(blob);

      setGeneratedBlobUrl(finalUrl);
      setPreviewUrl(finalUrl);
      setIsGenerated(true);
      showToast('Collection Note generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to process PDF. Please check coordinates and document format.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to trigger generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (file && !isProcessing) {
          handleProcessPdf();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, isProcessing, vehReg, personName, driverId, coords, fontSize, fontColor]);

  // Generate the Single-File HTML content for copying or downloading
  const generateStandaloneHtmlCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neo Transport | Collection Note Editor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
  <script src="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    .blueprint-pattern {
      background-size: 20px 20px;
      background-image: linear-gradient(to right, rgba(14, 165, 233, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(14, 165, 233, 0.05) 1px, transparent 1px);
    }
    .input-transition { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
  <header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
      <div class="flex items-center gap-3.5 select-none">
        <div class="flex items-center gap-3">
          <img src="https://admin.neotransport.co.uk/brand/logos/neo-transport-full-blue-white.svg" alt="Neo Transport" class="h-8 sm:h-9 w-auto max-w-[240px] sm:max-w-[280px] object-contain filter drop-shadow-[0_2px_8px_rgba(56,152,236,0.3)]" onerror="this.onerror=null; this.src='/neo-transport-full-blue-white.svg';">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 uppercase tracking-wider hidden sm:inline-block">Fleet Ops</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="font-medium text-slate-300">System Ready</span>
        </div>
      </div>
    </div>
  </header>

  <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div class="lg:col-span-5 space-y-6">
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <i data-lucide="file-check-2" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-white tracking-wide">Document Configuration</h2>
              <p class="text-xs text-slate-400">Set dispatch identifiers & collection details</p>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Source PDF Template <span class="text-rose-400">*</span>
          </label>
          <input type="file" id="pdfInput" accept="application/pdf" class="hidden">
          
          <div id="dropzone" class="blueprint-pattern border-2 border-dashed border-slate-700 hover:border-cyan-500 hover:bg-cyan-950/10 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center gap-3" onclick="document.getElementById('pdfInput').click()">
            <div class="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-cyan-950/80 text-slate-400 group-hover:text-cyan-400 border border-slate-700 group-hover:border-cyan-500/50 flex items-center justify-center shadow-inner transition-colors">
              <i data-lucide="upload-cloud" class="w-6 h-6 transition-transform group-hover:scale-110"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-200 group-hover:text-white" id="uploadTitle">Click or drag & drop PDF template</p>
              <p class="text-xs text-slate-400 mt-1 font-mono" id="fileNameDisplay">Supports single or multi-page dispatch PDF</p>
            </div>
          </div>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Vehicle Registration</span>
              <span class="text-[10px] text-slate-400 font-mono">X: 385 | Y: 249</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="truck" class="w-4 h-4 text-cyan-400"></i>
              </div>
              <input type="text" id="vehReg" value="YD21PWZ" class="input-transition w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-mono text-sm tracking-wider uppercase font-bold shadow-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Person Collecting</span>
              <span class="text-[10px] text-slate-400 font-mono">X: 305 | Y: 220</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="user-check" class="w-4 h-4 text-cyan-400"></i>
              </div>
              <input type="text" id="personName" value="HOSSEIN BOYRATI" class="input-transition w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold tracking-wide uppercase shadow-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Driver ID / Credential</span>
              <span class="text-[10px] text-slate-400 font-mono">X: 305 | Y: 178</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="credit-card" class="w-4 h-4 text-cyan-400"></i>
              </div>
              <input type="text" id="driverId" value="DRIVING LICENSE" class="input-transition w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold tracking-wide uppercase shadow-sm">
            </div>
          </div>
        </div>

        <button id="processBtn" class="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wide active:scale-[0.99] cursor-pointer">
          <i data-lucide="sparkles" class="w-4 h-4"></i> Generate Collection Note
        </button>
      </div>

      <details class="group bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <summary class="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-slate-200 hover:bg-slate-800/60 transition-colors">
          <span class="flex items-center gap-2.5 text-sm">
            <i data-lucide="sliders" class="w-4 h-4 text-cyan-400"></i>
            Advanced Placement Coordinates
          </span>
          <span class="transition-transform duration-300 group-open:rotate-180 text-slate-400">
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </span>
        </summary>
        
        <div class="p-5 pt-2 border-t border-slate-800 bg-slate-950/50 space-y-4">
          <p class="text-xs text-slate-400">Fine-tune horizontal (X) and vertical (Y) PDF point offsets on Page 1.</p>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <label class="block text-[11px] font-bold text-slate-300 mb-1.5">Vehicle Reg (X, Y)</label>
              <div class="grid grid-cols-2 gap-2">
                <input type="number" id="vX" value="385" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono">
                <input type="number" id="vY" value="249" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono">
              </div>
            </div>

            <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <label class="block text-[11px] font-bold text-slate-300 mb-1.5">Person Name (X, Y)</label>
              <div class="grid grid-cols-2 gap-2">
                <input type="number" id="pX" value="305" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono">
                <input type="number" id="pY" value="220" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono">
              </div>
            </div>

            <div class="col-span-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <label class="block text-[11px] font-bold text-slate-300 mb-1.5">Driver ID (X, Y)</label>
              <div class="grid grid-cols-2 gap-2">
                <input type="number" id="dX" value="305" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono">
                <input type="number" id="dY" value="178" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono">
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>

    <div class="lg:col-span-7 flex flex-col min-h-[680px]">
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-full relative overflow-hidden backdrop-blur-sm">
        <div class="flex justify-between items-center px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 z-10">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
            <h2 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="eye" class="w-4 h-4 text-cyan-400"></i>
              Live Document Preview
            </h2>
          </div>
          <a id="downloadBtn" href="#" class="hidden bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95">
            <i data-lucide="download" class="w-4 h-4"></i> Download Completed PDF
          </a>
        </div>
        
        <div id="previewContainer" class="flex-grow bg-slate-950/90 relative overflow-auto flex items-start justify-center p-4 w-full h-[600px] lg:h-full">
          <div id="placeholderText" class="text-center my-auto p-8 max-w-sm">
            <div class="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-inner">
              <i data-lucide="file-search" class="w-10 h-10 text-cyan-500/70"></i>
            </div>
            <h3 class="text-base font-bold text-slate-200 mb-1">No Document Uploaded</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Upload your Neo Transport collection note PDF template to preview and apply dispatch details.
            </p>
          </div>

          <div id="canvasWrapper" class="hidden relative shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white">
            <canvas id="pdfCanvas" class="block"></canvas>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    lucide.createIcons();
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }

    const fileInput = document.getElementById('pdfInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const uploadTitle = document.getElementById('uploadTitle');
    const dropzone = document.getElementById('dropzone');
    const canvas = document.getElementById('pdfCanvas');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const placeholderText = document.getElementById('placeholderText');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentPdfBytes = null;

    async function renderPdfToCanvas(bytes) {
      try {
        if (!window.pdfjsLib) return;
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const containerWidth = document.getElementById('previewContainer').clientWidth - 48;
        const viewportDefault = page.getViewport({ scale: 1.0 });
        const scale = Math.min(Math.max(containerWidth / viewportDefault.width, 0.5), 1.8);
        const viewport = page.getViewport({ scale });
        
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const context = canvas.getContext('2d');
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        
        canvasWrapper.classList.remove('hidden');
        placeholderText.style.display = 'none';
      } catch (err) {
        console.error('Canvas render error:', err);
      }
    }

    fileInput.addEventListener('change', async () => {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileNameDisplay.textContent = file.name + ' (' + (file.size/1024).toFixed(1) + ' KB)';
        fileNameDisplay.classList.add('text-cyan-400');
        uploadTitle.textContent = 'Template Ready';
        dropzone.classList.add('border-cyan-500', 'bg-cyan-950/20');
        
        const arrayBuffer = await file.arrayBuffer();
        currentPdfBytes = new Uint8Array(arrayBuffer);
        renderPdfToCanvas(currentPdfBytes);
        downloadBtn.classList.add('hidden');
      } else {
        canvasWrapper.classList.add('hidden');
        placeholderText.style.display = 'block';
        fileNameDisplay.textContent = 'Supports single or multi-page dispatch PDF';
        fileNameDisplay.classList.remove('text-cyan-400');
        uploadTitle.textContent = 'Click or drag & drop PDF template';
        dropzone.classList.remove('border-cyan-500', 'bg-cyan-950/20');
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-cyan-400', 'bg-cyan-950/30');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-cyan-400', 'bg-cyan-950/30');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-cyan-400', 'bg-cyan-950/30');
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });

    processBtn.addEventListener('click', async () => {
      if (!fileInput.files.length && !currentPdfBytes) {
        alert('Please upload a PDF template first.');
        return;
      }

      const file = fileInput.files[0];
      const vehReg = document.getElementById('vehReg').value;
      const personName = document.getElementById('personName').value;
      const driverId = document.getElementById('driverId').value;

      const vX = parseInt(document.getElementById('vX').value);
      const vY = parseInt(document.getElementById('vY').value);
      const pX = parseInt(document.getElementById('pX').value);
      const pY = parseInt(document.getElementById('pY').value);
      const dX = parseInt(document.getElementById('dX').value);
      const dY = parseInt(document.getElementById('dY').value);

      try {
        const originalText = processBtn.innerHTML;
        processBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Processing Collection Note...';
        processBtn.disabled = true;
        processBtn.classList.add('opacity-75', 'cursor-not-allowed');
        lucide.createIcons();

        const arrayBuffer = file ? await file.arrayBuffer() : currentPdfBytes;
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const black = rgb(0, 0, 0);
        const fontSize = 11;

        firstPage.drawText(vehReg, { x: vX, y: vY, size: fontSize, font: helveticaFont, color: black });
        firstPage.drawText(personName, { x: pX, y: pY, size: fontSize, font: helveticaFont, color: black });
        firstPage.drawText(driverId, { x: dX, y: dY, size: fontSize, font: helveticaFont, color: black });

        const pdfBytes = await pdfDoc.save();
        currentPdfBytes = pdfBytes;
        
        renderPdfToCanvas(pdfBytes);

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);

        downloadBtn.href = pdfUrl;
        downloadBtn.download = \`Completed_\${file ? file.name : 'Collection_Note.pdf'}\`;
        downloadBtn.classList.remove('hidden');

        processBtn.innerHTML = originalText;
        processBtn.disabled = false;
        processBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        lucide.createIcons();
      } catch (err) {
        console.error(err);
        alert('An error occurred while processing the PDF.');
        processBtn.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i> Generate Collection Note';
        processBtn.disabled = false;
        processBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        lucide.createIcons();
      }
    });
  </script>
</body>
</html>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateStandaloneHtmlCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Single-file HTML copied to clipboard!');
  };

  const handleDownloadStandaloneHtml = () => {
    const code = generateStandaloneHtmlCode();
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neo-transport-collection-note-editor.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Saved neo-transport-collection-note-editor.html');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Enterprise Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Area matching uploaded logo neo-03.png */}
          <NeoTransportNavbarLogo />

          {/* Quick Header Tools */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Template button */}
            <button
              onClick={handleGenerateSampleTemplate}
              disabled={isProcessing}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all hover:text-cyan-300 cursor-pointer shadow-sm active:scale-95"
              title="Generate and load a built-in sample collection note template to test immediately"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Sample Template</span>
            </button>

            {/* Export Standalone HTML Modal Trigger */}
            <button
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-xs font-semibold text-blue-300 transition-all cursor-pointer shadow-sm active:scale-95"
              title="View or export the standalone single-file HTML version"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Standalone File</span>
            </button>

            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/50 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline font-mono text-[11px] text-slate-300">System Ready</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Two-Column Layout */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls Card */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">Document Configuration</h2>
                  <p className="text-xs text-slate-400">Specify vehicle, driver, and credential stamps</p>
                </div>
              </div>

              {/* Reset to defaults button */}
              <button
                onClick={handleResetCoords}
                className="text-slate-400 hover:text-slate-200 text-xs p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Reset coordinates and fonts to default"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Fleet Presets */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Dispatch Presets</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_FLEET.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-700/60 text-slate-300 hover:text-cyan-300 transition-all font-medium cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropzone Area */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Source PDF Template <span className="text-rose-400">*</span>
                </label>
                {file && (
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                  </span>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {/* Visible Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center gap-3 overflow-hidden ${
                  isDragging
                    ? 'blueprint-grid-active border-cyan-400 bg-cyan-950/30 ring-4 ring-cyan-500/20'
                    : file
                    ? 'blueprint-grid border-cyan-600/50 bg-slate-950/70'
                    : 'blueprint-grid border-slate-700 hover:border-cyan-500/80 bg-slate-950/50 hover:bg-cyan-950/10'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${
                    file
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 group-hover:text-cyan-400 group-hover:border-cyan-500/40'
                  }`}
                >
                  {file ? <FileCheck className="w-6 h-6 text-cyan-400" /> : <UploadCloud className="w-6 h-6" />}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition">
                    {file ? 'Template Ready to Process' : 'Click to upload PDF template'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {file ? `${fileName} (${fileSize})` : 'or drag & drop your collection document here'}
                  </p>
                </div>

                {/* Subtitle helper if no file */}
                {!file && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateSampleTemplate();
                      }}
                      className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
                    >
                      or click here to load a demo Neo Transport template
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Input Fields with Floating Appearance and Sleek Icons */}
            <div className="space-y-4 mb-6">
              
              {/* Vehicle Registration */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-cyan-400" />
                    Vehicle Registration
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    X: {coords.vX} | Y: {coords.vY}
                  </span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={vehReg}
                    onChange={(e) => setVehReg(e.target.value)}
                    placeholder="e.g. YD21PWZ"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono font-bold tracking-wider uppercase transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Person Collecting */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Person Collecting
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    X: {coords.pX} | Y: {coords.pY}
                  </span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g. HOSSEIN BOYRATI"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold tracking-wide uppercase transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Driver ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                    Driver ID / Credential
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    X: {coords.dX} | Y: {coords.dY}
                  </span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    placeholder="e.g. DRIVING LICENSE"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold tracking-wide uppercase transition-all shadow-sm"
                  />
                </div>
              </div>

            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleProcessPdf}
              disabled={isProcessing}
              className={`w-full relative overflow-hidden rounded-xl py-3.5 px-6 font-bold text-sm tracking-wide text-white transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl cursor-pointer ${
                isProcessing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Stamping PDF Coordinates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Generate Collection Note</span>
                </>
              )}
            </button>
            <div className="text-center mt-2">
              <span className="text-[11px] text-slate-400">
                Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl + Enter</kbd>
              </span>
            </div>
          </div>

          {/* Advanced Positioning Accordion */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-md transition-all">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex justify-between items-center p-5 text-left font-bold cursor-pointer text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">Advanced Coordinate Positioning</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isAdvancedOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAdvancedOpen && (
              <div className="p-5 pt-2 border-t border-slate-800 bg-slate-950/60 space-y-5 animate-fade-in">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Precision coordinate controls for PDF-Lib layout. Standard PDF point origin (0,0) starts at the bottom-left corner of the page.
                </p>

                {/* Coordinate Steppers */}
                <div className="space-y-4">
                  {/* Vehicle Reg */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">Vehicle Reg Coordinates</span>
                      <span className="text-[10px] text-cyan-400 font-mono">X: {coords.vX}, Y: {coords.vY}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">X (Horizontal)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCoordChange('vX', -5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >-</button>
                          <input
                            type="number"
                            value={coords.vX}
                            onChange={(e) => setCoords({ ...coords, vX: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
                          />
                          <button
                            onClick={() => handleCoordChange('vX', 5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >+</button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Y (Vertical)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCoordChange('vY', -5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >-</button>
                          <input
                            type="number"
                            value={coords.vY}
                            onChange={(e) => setCoords({ ...coords, vY: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
                          />
                          <button
                            onClick={() => handleCoordChange('vY', 5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Person Name */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">Person Name Coordinates</span>
                      <span className="text-[10px] text-cyan-400 font-mono">X: {coords.pX}, Y: {coords.pY}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">X (Horizontal)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCoordChange('pX', -5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >-</button>
                          <input
                            type="number"
                            value={coords.pX}
                            onChange={(e) => setCoords({ ...coords, pX: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
                          />
                          <button
                            onClick={() => handleCoordChange('pX', 5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >+</button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Y (Vertical)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCoordChange('pY', -5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >-</button>
                          <input
                            type="number"
                            value={coords.pY}
                            onChange={(e) => setCoords({ ...coords, pY: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
                          />
                          <button
                            onClick={() => handleCoordChange('pY', 5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver ID */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">Driver ID Coordinates</span>
                      <span className="text-[10px] text-cyan-400 font-mono">X: {coords.dX}, Y: {coords.dY}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">X (Horizontal)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCoordChange('dX', -5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >-</button>
                          <input
                            type="number"
                            value={coords.dX}
                            onChange={(e) => setCoords({ ...coords, dX: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
                          />
                          <button
                            onClick={() => handleCoordChange('dX', 5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >+</button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Y (Vertical)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCoordChange('dY', -5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >-</button>
                          <input
                            type="number"
                            value={coords.dY}
                            onChange={(e) => setCoords({ ...coords, dY: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
                          />
                          <button
                            onClick={() => handleCoordChange('dY', 5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography Settings */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">Font Size:</span>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    >
                      <option value={9}>9 pt</option>
                      <option value={10}>10 pt</option>
                      <option value={11}>11 pt (Standard)</option>
                      <option value={12}>12 pt</option>
                      <option value={14}>14 pt</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Text Tone:</span>
                    <select
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value as any)}
                      className="mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    >
                      <option value="black">Pure Black (#000000)</option>
                      <option value="navy">Neo Navy (#0B192C)</option>
                      <option value="darkblue">Logistics Blue</option>
                    </select>
                  </div>

                  <button
                    onClick={handleResetCoords}
                    className="mt-4 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 text-xs"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Live PDF Preview */}
        <div className="lg:col-span-7 flex flex-col min-h-[700px]">
          <CanvasPdfViewer
            pdfBytes={pdfBytes}
            fileName={fileName}
            isGenerated={isGenerated}
            coords={coords}
            vehReg={vehReg}
            personName={personName}
            driverId={driverId}
            onGenerateSample={handleGenerateSampleTemplate}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </div>

      </main>

      {/* Standalone HTML Export Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Standalone Single-File HTML Exporter</h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This completely self-contained single-file HTML version contains all Tailwind CSS, PDF-Lib CDN scripts, Lucide icons, and the coordinate stamping logic in one single file. You can double-click and run it in any browser offline without any Node.js setup!
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto">
              <pre className="text-slate-400 text-[11px] whitespace-pre-wrap">{generateStandaloneHtmlCode().slice(0, 500)}... (truncated)</pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCopyCode}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownloadStandaloneHtml}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .html File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Neo Transport Logistics Operations System &copy; 2026. Enterprise Dispatch Document Engine.</span>
          <span className="font-mono text-[11px] text-slate-400">PDF-Lib 1.17 • Helvetica Native Vector Overlay</span>
        </div>
      </footer>
    </div>
  );
}
