import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Move, Check, RotateCcw } from 'lucide-react';
import './ImageCropperModal.css';

interface ImageCropperModalProps {
  imageSrc: string;            // base64 or URL of the original image
  aspectRatio?: number;        // width/height, e.g. 4/5 for product, 16/9 for banner
  aspectLabel?: string;        // label like "Produit (4:5)" or "Bannière (16:9)"
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
}

export function ImageCropperModal({ imageSrc, aspectRatio = 4 / 5, aspectLabel, onConfirm, onCancel }: ImageCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    // Only use crossOrigin for external http URLs, otherwise it can block local/data URIs
    if (imageSrc.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.onerror = (err) => {
      console.error('Failed to load image for cropping:', imageSrc, err);
      // fallback just in case
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute crop viewport in the container
  const getCropRect = useCallback(() => {
    const { w, h } = containerSize;
    if (!w || !h) return { x: 0, y: 0, w: 0, h: 0 };

    const padding = 24;
    const availW = w - padding * 2;
    const availH = h - padding * 2;

    let cropW: number, cropH: number;
    if (availW / availH > aspectRatio) {
      cropH = availH;
      cropW = cropH * aspectRatio;
    } else {
      cropW = availW;
      cropH = cropW / aspectRatio;
    }

    return {
      x: (w - cropW) / 2,
      y: (h - cropH) / 2,
      w: cropW,
      h: cropH,
    };
  }, [containerSize, aspectRatio]);

  // Draw preview
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w: cw, h: ch } = containerSize;
    if (!cw || !ch) return;

    canvas.width = cw * window.devicePixelRatio;
    canvas.height = ch * window.devicePixelRatio;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const crop = getCropRect();

    // Compute image draw params: fit image into crop area, then apply zoom & offset
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const cropAspect = crop.w / crop.h;

    let baseW: number, baseH: number;
    if (imgAspect > cropAspect) {
      // Image is wider → fit by height
      baseH = crop.h;
      baseW = baseH * imgAspect;
    } else {
      // Image is taller → fit by width
      baseW = crop.w;
      baseH = baseW / imgAspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;
    const drawX = crop.x + (crop.w - drawW) / 2 + offset.x;
    const drawY = crop.y + (crop.h - drawH) / 2 + offset.y;

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, cw, ch);

    // Draw image
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Draw dark overlay outside crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    // Top
    ctx.fillRect(0, 0, cw, crop.y);
    // Bottom
    ctx.fillRect(0, crop.y + crop.h, cw, ch - crop.y - crop.h);
    // Left
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    // Right
    ctx.fillRect(crop.x + crop.w, crop.y, cw - crop.x - crop.w, crop.h);

    // Crop border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const gx = crop.x + (crop.w / 3) * i;
      const gy = crop.y + (crop.h / 3) * i;
      ctx.beginPath();
      ctx.moveTo(gx, crop.y);
      ctx.lineTo(gx, crop.y + crop.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x, gy);
      ctx.lineTo(crop.x + crop.w, gy);
      ctx.stroke();
    }

    // Corner markers
    const cornerLen = 16;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    const corners = [
      [crop.x, crop.y], [crop.x + crop.w, crop.y],
      [crop.x, crop.y + crop.h], [crop.x + crop.w, crop.y + crop.h],
    ];
    corners.forEach(([cx, cy], idx) => {
      const dx = idx % 2 === 0 ? 1 : -1;
      const dy = idx < 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx + cornerLen * dx, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + cornerLen * dy);
      ctx.stroke();
    });
  }, [imgLoaded, zoom, offset, containerSize, getCropRect]);

  // Mouse drag
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onPointerUp = () => setDragging(false);

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(5, z - e.deltaY * 0.001)));
  };

  // Export cropped image
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const crop = getCropRect();
    const { w: cw } = containerSize;
    if (!cw) return;

    // Figure out what portion of the image is in the crop area
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const cropAspect = crop.w / crop.h;

    let baseW: number, baseH: number;
    if (imgAspect > cropAspect) {
      baseH = crop.h;
      baseW = baseH * imgAspect;
    } else {
      baseW = crop.w;
      baseH = baseW / imgAspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;
    const drawX = crop.x + (crop.w - drawW) / 2 + offset.x;
    const drawY = crop.y + (crop.h - drawH) / 2 + offset.y;

    // Map crop rect to image pixel coords
    const scaleX = img.naturalWidth / drawW;
    const scaleY = img.naturalHeight / drawH;

    const sx = (crop.x - drawX) * scaleX;
    const sy = (crop.y - drawY) * scaleY;
    const sw = crop.w * scaleX;
    const sh = crop.h * scaleY;

    // Output canvas
    const outW = Math.min(1200, Math.round(sw));
    const outH = Math.round(outW / aspectRatio);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;

    outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    onConfirm(outCanvas.toDataURL('image/webp', 0.92));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="crop-modal-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="crop-modal-header">
          <h3><Move size={18} /> Ajuster l'image</h3>
          {aspectLabel && <span className="crop-aspect-badge">{aspectLabel}</span>}
          <button type="button" className="crop-close-btn" onClick={onCancel}><X size={20} /></button>
        </div>

        {/* Canvas area */}
        <div className="crop-canvas-area" ref={containerRef}>
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
            style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
          />
          {!imgLoaded && (
            <div className="crop-loading">Chargement...</div>
          )}
        </div>

        {/* Controls */}
        <div className="crop-controls">
          <div className="crop-zoom-controls">
            <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Dézoomer">
              <ZoomOut size={18} />
            </button>
            <div className="crop-zoom-bar">
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
              />
              <span className="crop-zoom-label">{Math.round(zoom * 100)}%</span>
            </div>
            <button type="button" onClick={() => setZoom(z => Math.min(5, z + 0.1))} title="Zoomer">
              <ZoomIn size={18} />
            </button>
            <button type="button" onClick={handleReset} className="crop-reset-btn" title="Réinitialiser">
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="crop-actions">
            <button type="button" className="crop-btn-cancel" onClick={onCancel}>Annuler</button>
            <button type="button" className="crop-btn-confirm" onClick={handleConfirm}>
              <Check size={16} /> Valider le recadrage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
