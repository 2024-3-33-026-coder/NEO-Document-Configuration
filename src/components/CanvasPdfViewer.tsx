import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Crosshair,
  FileText,
  Sparkles,
  Loader2,
  AlertTriangle
} from 'lucide-react';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  // Use Vite's native URL resolution for the worker or unpkg fallback
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

interface Coordinates {
  vX: number;
  vY: number;
  pX: number;
  pY: number;
  dX: number;
  dY: number;
}

interface CanvasPdfViewerProps {
  pdfBytes: Uint8Array | null;
  fileName: string;
  isGenerated: boolean;
  coords: Coordinates;
  vehReg: string;
  personName: string;
  driverId: string;
  onGenerateSample: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const CanvasPdfViewer: React.FC<CanvasPdfViewerProps> = ({
  pdfBytes,
  fileName,
  isGenerated,
  coords,
  vehReg,
  personName,
  driverId,
  onGenerateSample,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<'fit-width' | 'custom'>('fit-width');
  const [showCoordsOverlay, setShowCoordsOverlay] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Page natural dimensions (in PDF points, usually 595.28 x 841.89 for A4)
  const [pageNaturalWidth, setPageNaturalWidth] = useState<number>(595.28);
  const [pageNaturalHeight, setPageNaturalHeight] = useState<number>(841.89);
  const [renderedScale, setRenderedScale] = useState<number>(1.0);

  // Load PDF document when pdfBytes change
  useEffect(() => {
    if (!pdfBytes || pdfBytes.length === 0) {
      setPdfDoc(null);
      setTotalPages(1);
      setCurrentPage(1);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadDoc = async () => {
      try {
        // Cancel any pending render task
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
        }

        const loadingTask = pdfjsLib.getDocument({
          data: pdfBytes,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('PDF.js parse error:', err);
        setError('Failed to display PDF document.');
        setLoading(false);
      }
    };

    loadDoc();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfBytes]);

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isMounted = true;
    setLoading(true);

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            await renderTaskRef.current.cancel();
          } catch {
            // ignore cancellation
          }
        }

        const page = await pdfDoc.getPage(currentPage);
        if (!isMounted) return;

        const defaultViewport = page.getViewport({ scale: 1.0 });
        setPageNaturalWidth(defaultViewport.width);
        setPageNaturalHeight(defaultViewport.height);

        // Determine effective scale
        let effectiveScale = zoomScale;
        if (fitMode === 'fit-width' && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 48; // padding
          if (containerWidth > 0) {
            effectiveScale = Math.min(Math.max(containerWidth / defaultViewport.width, 0.5), 2.5);
          }
        }
        setRenderedScale(effectiveScale);

        // High DPI canvas support
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: effectiveScale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') {
          return;
        }
        console.error('Page render error:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, currentPage, zoomScale, fitMode, isFullscreen]);

  // Handle window resize to re-fit if in fit-width mode
  useEffect(() => {
    const handleResize = () => {
      if (fitMode === 'fit-width' && pdfDoc) {
        // trigger re-render
        setZoomScale((prev) => prev);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMode, pdfDoc]);

  // Zoom helpers
  const handleZoomIn = () => {
    setFitMode('custom');
    setZoomScale((prev) => Math.min(prev + 0.15, 2.5));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setZoomScale((prev) => Math.max(prev - 0.15, 0.4));
  };

  const handleFitWidth = () => {
    setFitMode('fit-width');
  };

  // Download PDF
  const handleDownload = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isGenerated ? `Completed_${fileName || 'Collection_Note.pdf'}` : fileName || 'Document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open in new window
  const handleOpenNewWindow = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Compute screen pixel position for a PDF point coordinate on Page 1
  // PDF point system: origin (0,0) is bottom-left corner of the page
  // Canvas pixel system: origin (0,0) is top-left corner
  const getPointPixelCoords = (pdfX: number, pdfY: number) => {
    const pixelX = pdfX * renderedScale;
    const pixelY = (pageNaturalHeight - pdfY) * renderedScale;
    return { left: `${pixelX}px`, top: `${pixelY}px` };
  };

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900/95 border border-slate-800/90 rounded-2xl shadow-2xl flex flex-col h-full relative overflow-hidden backdrop-blur-md transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : ''
      }`}
    >
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/80 z-20 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Live Document Preview
            </h2>
          </div>

          {isGenerated ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-[10px] font-bold text-emerald-400 uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Stamped & Ready
            </span>
          ) : pdfBytes ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Template Loaded
            </span>
          ) : null}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {pdfBytes && (
            <>
              {/* Coordinate Overlay Marker Toggle (Page 1) */}
              {currentPage === 1 && (
                <button
                  type="button"
                  onClick={() => setShowCoordsOverlay(!showCoordsOverlay)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    showCoordsOverlay
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-slate-200'
                  }`}
                  title="Toggle visual coordinate stamp target pins on page 1"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Pin Guide</span>
                </button>
              )}

              {/* Page Selector (if multi-page) */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-300">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="p-0.5 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="p-0.5 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFitWidth}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition ${
                    fitMode === 'fit-width'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Fit to Width"
                >
                  Fit
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Download Action */}
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Open in new window */}
              <button
                onClick={handleOpenNewWindow}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container with custom scrollbar */}
      <div className="flex-grow bg-slate-950/95 relative overflow-auto flex items-start justify-center p-4 min-h-[550px]">
        {/* Empty State */}
        {!pdfBytes && (
          <div className="text-center my-auto p-8 max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-inner">
              <FileText className="w-10 h-10 text-cyan-500/70" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1.5">No Document Loaded</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Upload your collection note PDF template or test immediately with Neo Transport's official dispatch template.
            </p>
            <button
              onClick={onGenerateSample}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-xs font-bold text-cyan-300 shadow-md transition cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Sample Collection Template</span>
            </button>
          </div>
        )}

        {/* Loading Spinner overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs text-cyan-300 shadow-2xl">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Rendering Document...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-center my-auto p-6 max-w-sm bg-rose-950/40 border border-rose-800/50 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-rose-200 mb-1">Preview Notice</h4>
            <p className="text-xs text-rose-300/80 mb-4">{error}</p>
            <button
              onClick={handleOpenNewWindow}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 border border-rose-700 text-rose-200"
            >
              Open in Browser Window
            </button>
          </div>
        )}

        {/* Rendered Canvas Wrapper */}
        {pdfBytes && !error && (
          <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white">
            <canvas ref={canvasRef} className="block select-none" />

            {/* Interactive Coordinate Target Pins (Visible only on Page 1) */}
            {currentPage === 1 && showCoordsOverlay && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Vehicle Reg Target Pin */}
                <div
                  style={getPointPixelCoords(coords.vX, coords.vY)}
                  className="absolute -translate-y-full transition-all duration-150"
                >
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-600/90 text-[10px] font-mono text-white font-bold shadow-md border border-blue-400/60 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
                    <span>Reg: {vehReg || '...'}</span>
                  </div>
                  <div className="w-1 h-2 bg-blue-500 mx-auto"></div>
                </div>

                {/* Person Collecting Target Pin */}
                <div
                  style={getPointPixelCoords(coords.pX, coords.pY)}
                  className="absolute -translate-y-full transition-all duration-150"
                >
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-600/90 text-[10px] font-mono text-white font-bold shadow-md border border-cyan-400/60 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span>Name: {personName || '...'}</span>
                  </div>
                  <div className="w-1 h-2 bg-cyan-500 mx-auto"></div>
                </div>

                {/* Driver ID Target Pin */}
                <div
                  style={getPointPixelCoords(coords.dX, coords.dY)}
                  className="absolute -translate-y-full transition-all duration-150"
                >
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600/90 text-[10px] font-mono text-white font-bold shadow-md border border-emerald-400/60 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200"></span>
                    <span>ID: {driverId || '...'}</span>
                  </div>
                  <div className="w-1 h-2 bg-emerald-500 mx-auto"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      {pdfBytes && (
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/90 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
          <div className="flex items-center gap-3">
            <span>Doc: <strong className="text-slate-200">{fileName}</strong></span>
            <span>Zoom: <strong>{Math.round(renderedScale * 100)}%</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Stamp Target: <strong className="text-cyan-400">Page 1 (Helvetica)</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
