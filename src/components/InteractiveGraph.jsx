import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toFraction, formatFractionStr } from '../utils/fractionUtils';

function useSmoothValue(target, speed = 0.15, immediate = false) {
  const [current, setCurrent] = useState(target);
  useEffect(() => {
    if (immediate) {
      setCurrent(target);
      return;
    }
    let id;
    const update = () => {
      setCurrent(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.001) return target;
        return prev + diff * speed;
      });
      id = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(id);
  }, [target, speed, immediate]);
  return current;
}

function useSmoothPan(target, speed = 0.15, immediate = false) {
  const [current, setCurrent] = useState(target);
  useEffect(() => {
    if (immediate) {
      setCurrent(target);
      return;
    }
    let id;
    const update = () => {
      setCurrent(prev => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return target;
        return { x: prev.x + dx * speed, y: prev.y + dy * speed };
      });
      id = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(id);
  }, [target.x, target.y, speed, immediate]);
  return current;
}

export default function InteractiveGraph({
  a,
  b,
  onParamChange,
  showLine1 = true,
  showSlopeTriangle = true,
  showTablePoint = false,
  scrubX = 2,
  targets = [],
  interactiveHandles = true,
  // Second line support
  showLine2 = false,
  a2 = -1,
  b2 = 1,
  onParamChange2,
  // Layout & Reset & Tip Collision
  isSidePanelOpen = true,
  onReset,
  onTipObscuredChange
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [dragging, setDragging] = useState(null); // 'intercept' | 'slope' | 'intercept2' | 'slope2'
  const [zoom, setZoom] = useState(1);
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || window.innerWidth;
        const h = containerRef.current.clientHeight || window.innerHeight;
        setDimensions({
          width: w > 0 ? w : 800,
          height: h > 0 ? h : 600
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = dimensions;

  // Smooth display values
  const displayZoom = useSmoothValue(zoom, 0.15, false);
  const displayPan = useSmoothPan(panOffset, 0.15, dragging === 'pan');

  // Base pixels per unit when zoom is 1
  const basePixelsPerUnit = 45;
  const pixelsPerUnit = basePixelsPerUnit * displayZoom;

  // Compute available visible width (accounting for right side panel width 390px)
  const panelWidth = isSidePanelOpen ? 390 : 0;
  const availableWidth = Math.max(width - panelWidth, 200);

  // Intersection of Line 1 and Line 2
  let intersection = null;
  if (showLine2) {
    if (a !== a2) {
      const ix = (b2 - b) / (a - a2);
      const iy = a * ix + b;
      intersection = { x: Math.round(ix * 100) / 100, y: Math.round(iy * 100) / 100, rawX: ix, rawY: iy, type: 'point' };
    } else if (b === b2) {
      intersection = { type: 'coincident' }; // 평행 & 일치
    } else {
      intersection = { type: 'parallel' }; // 평행 & 불일치
    }
  }

  // Stable Canvas Center with Pan Offset
  const centerY = height / 2 + displayPan.y;
  const centerX = width / 2 - 100 + displayPan.x;

  // Coordinate transforms
  const toPx = (x) => centerX + x * pixelsPerUnit;
  const toPy = (y) => centerY - y * pixelsPerUnit;

  const toMathX = (px) => (px - centerX) / pixelsPerUnit;
  const toMathY = (py) => (centerY - py) / pixelsPerUnit;

  // Calculate visible range based on current screen size and zoom
  const xUnits = Math.ceil(centerX / pixelsPerUnit);
  const yUnits = Math.ceil(centerY / pixelsPerUnit);

  const startX = -xUnits - 2;
  const endX = xUnits + 2;
  const startY = -yUnits - 2;
  const endY = yUnits + 2;

  // Line 1 endpoints to span the entire screen width
  const lineX1 = startX;
  const lineY1 = a * lineX1 + b;
  const lineX2 = endX;
  const lineY2 = a * lineX2 + b;

  // Line 2 endpoints
  const line2X1 = startX;
  const line2Y1 = a2 * line2X1 + b2;
  const line2X2 = endX;
  const line2Y2 = a2 * line2X2 + b2;

  // Handle Y positions
  const h1Py = toPy(b);
  const h2Py = showLine2 ? toPy(b2) : null;
  const s1Py = toPy(2 * a + b);
  const s2Py = showLine2 ? toPy(2 * a2 + b2) : null;

  // Collision detection for bottom-left floating tip box (px < 420, py > height - 120)
  const activeHandles = [
    { px: toPx(0), py: h1Py },
    { px: toPx(2), py: s1Py },
    showLine2 ? { px: toPx(0), py: h2Py } : null,
    showLine2 ? { px: toPx(2), py: s2Py } : null,
  ].filter(Boolean);

  const isObscuringTip = activeHandles.some(
    (pt) => pt.px < 420 && pt.py > height - 120
  );

  useEffect(() => {
    if (onTipObscuredChange) {
      onTipObscuredChange(isObscuringTip);
    }
  }, [isObscuringTip, onTipObscuredChange]);

  // Anti-collision label math for Y-intercepts
  const distYIntercepts = showLine2 && h2Py !== null ? Math.abs(h1Py - h2Py) : 999;
  const isCloseY = distYIntercepts < 34;

  const labelY1 = isCloseY ? h1Py - 12 : h1Py + 4;
  const labelY2 = isCloseY ? h2Py + 20 : h2Py + 4;

  // Anti-collision label math for Slope Handles
  const distSlopeHandles = showLine2 && s2Py !== null ? Math.abs(s1Py - s2Py) : 999;
  const isCloseSlope = distSlopeHandles < 34;

  const slopeLabelX1 = toPx(2) + 16;
  const slopeLabelY1 = isCloseSlope ? s1Py - 12 : s1Py + 4;
  const slopeAnchor1 = "start";

  const slopeLabelX2 = isCloseSlope ? toPx(2) - 16 : toPx(2) + 16;
  const slopeLabelY2 = isCloseSlope ? s2Py + 18 : s2Py + 4;
  const slopeAnchor2 = isCloseSlope ? "end" : "start";

  // Anti-collision label math for Intersection Badge
  const ixTextStr = (showLine2 && intersection && intersection.type === 'point')
    ? `교점 (${formatFractionStr(intersection.rawX)}, ${formatFractionStr(intersection.rawY)})`
    : '';
  const estimatedIxWidth = ixTextStr.split('').reduce((acc, char) => acc + (char.charCodeAt(0) > 255 ? 12 : 7), 0);
  const ixBoxWidth = Math.max(90, Math.ceil(estimatedIxWidth + 24));
  const ixBoxHeight = 28;

  let ixBadgeX = 0;
  let ixBadgeY = -34;
  let ixTextAnchor = "middle";
  let ixBoxX = -ixBoxWidth / 2;
  let isNearHandle = false;

  if (showLine2 && intersection && intersection.type === 'point') {
    const ixPx = toPx(intersection.x);
    const iyPy = toPy(intersection.y);

    const distToH1 = Math.hypot(ixPx - toPx(0), iyPy - h1Py);
    const distToH2 = h2Py !== null ? Math.hypot(ixPx - toPx(0), iyPy - h2Py) : 999;
    const distToS1 = Math.hypot(ixPx - toPx(2), iyPy - s1Py);
    const distToS2 = s2Py !== null ? Math.hypot(ixPx - toPx(2), iyPy - s2Py) : 999;

    if (distToH1 < 50 || distToH2 < 50 || distToS1 < 50 || distToS2 < 50) {
      isNearHandle = true;
      ixBadgeX = -45;
      ixBadgeY = -24;
      ixTextAnchor = "end";
      ixBoxX = -ixBoxWidth + 10;
    }
  }

  // Slope Triangle Points (dx = 1, dy = a)
  // We draw it at x = 0 by default, but to prevent it from going offscreen
  // if origin is moved, it's generally fine since origin is centered.
  const triX0 = 0;
  const triY0 = b;
  const triX1 = 1;
  const triY1 = b;
  const triY2 = a * 1 + b;

  // Dragging Handlers
  const handlePointerDownBg = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setDragging('pan');
    panStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (type) => (e) => {
    if (!interactiveHandles) return;
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDragging(type);
  };

  const handlePointerMove = (e) => {
    if (!dragging || !containerRef.current) return;

    if (dragging === 'pan') {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mathY = toMathY(py);

    if (dragging === 'intercept') {
      const newB = Math.round(mathY * 2) / 2; // snap to 0.5 step
      if (onParamChange) onParamChange(a, newB);
    } else if (dragging === 'slope') {
      const targetX = 2;
      const newA = Math.round(((mathY - b) / targetX) * 2) / 2; // snap to 0.5 step
      if (onParamChange) onParamChange(newA, b);
    } else if (dragging === 'intercept2') {
      const newB2 = Math.round(mathY * 2) / 2;
      if (onParamChange2) onParamChange2(a2, newB2);
    } else if (dragging === 'slope2') {
      const targetX = 2;
      const newA2 = Math.round(((mathY - b2) / targetX) * 2) / 2;
      if (onParamChange2) onParamChange2(newA2, b2);
    }
  };

  const handlePointerUp = () => {
    if (dragging) setDragging(null);
  };

  // Generate grid ticks
  const xTicks = [];
  for (let i = startX; i <= endX; i++) {
    xTicks.push(i);
  }
  
  const yTicks = [];
  for (let i = startY; i <= endY; i++) {
    yTicks.push(i);
  }

  const scrubY = a * scrubX + b;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.4));

  // Determine tick spacing based on zoom so they don't overlap
  const tickStepX = displayZoom < 0.6 ? 2 : 1;
  const tickStepY = displayZoom < 0.6 ? 2 : 1;

  return (
    <div
      className="fullscreen-graph-canvas"
      ref={containerRef}
      onPointerDown={handlePointerDownBg}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ userSelect: 'none', background: '#fafafa', position: 'relative', cursor: dragging === 'pan' ? 'grabbing' : 'grab' }}
    >
      <svg className="graph-svg" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="softShadow" filterUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Paper Grid Lines */}
        <g className="grid-lines">
          {xTicks.map((val) => {
            if (val === 0) return null;
            const px = toPx(val);
            const isMajor = val % 5 === 0;
            return (
              <line
                key={`vx-${val}`}
                x1={px}
                y1={0}
                x2={px}
                y2={height}
                stroke={isMajor ? "#cbd5e1" : "#e2e8f0"}
                strokeWidth={isMajor ? "1.5" : "1"}
              />
            );
          })}
          {yTicks.map((val) => {
            if (val === 0) return null;
            const py = toPy(val);
            const isMajor = val % 5 === 0;
            return (
              <line
                key={`hy-${val}`}
                x1={0}
                y1={py}
                x2={width}
                y2={py}
                stroke={isMajor ? "#cbd5e1" : "#e2e8f0"}
                strokeWidth={isMajor ? "1.5" : "1"}
              />
            );
          })}
        </g>

        {/* Axis Lines (X and Y) with Hover Effect */}
        <g
          onMouseEnter={() => setHoveredAxis('y')}
          onMouseLeave={() => setHoveredAxis(null)}
          style={{ cursor: 'pointer' }}
        >
          <line
            x1={toPx(0)}
            y1={0}
            x2={toPx(0)}
            y2={height}
            stroke={hoveredAxis === 'y' ? "#475569" : "#64748b"}
            strokeWidth="2.5"
            style={{ transition: 'stroke 0.3s ease' }}
          />
          <text
            x={toPx(0) - 12}
            y={24}
            fill="#334155"
            fontSize="14"
            fontWeight="700"
            textAnchor="end"
            opacity={hoveredAxis === 'y' ? 1 : 0.6}
            style={{ transition: 'opacity 0.3s ease', paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3px' }}
          >
            Y축
          </text>
        </g>

        <g
          onMouseEnter={() => setHoveredAxis('x')}
          onMouseLeave={() => setHoveredAxis(null)}
          style={{ cursor: 'pointer' }}
        >
          <line
            x1={0}
            y1={toPy(0)}
            x2={width}
            y2={toPy(0)}
            stroke={hoveredAxis === 'x' ? "#475569" : "#64748b"}
            strokeWidth="2.5"
            style={{ transition: 'stroke 0.3s ease' }}
          />
          <text
            x={width - 24}
            y={toPy(0) + 20}
            fill="#334155"
            fontSize="14"
            fontWeight="700"
            textAnchor="end"
            opacity={hoveredAxis === 'x' ? 1 : 0.6}
            style={{ transition: 'opacity 0.3s ease', paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3px' }}
          >
            X축
          </text>
        </g>

        {/* Ticks and Numbers */}
        <g className="axis-ticks">
          {xTicks.map((t) => {
            if (t === 0 || t % tickStepX !== 0) return null;
            return (
              <text
                key={`tx-${t}`}
                x={toPx(t)}
                y={toPy(0) + 18}
                fill="#475569"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
              >
                {t}
              </text>
            );
          })}
          {yTicks.map((t) => {
            if (t === 0 || t % tickStepY !== 0) return null;
            if (showLine1 && Math.abs(t - b) < 0.25) return null;
            if (showLine2 && Math.abs(t - b2) < 0.25) return null;
            return (
              <text
                key={`ty-${t}`}
                x={toPx(0) - 10}
                y={toPy(t) + 4}
                fill="#475569"
                fontSize="12"
                fontWeight="600"
                textAnchor="end"
                style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3px', strokeLinejoin: 'round' }}
              >
                {t}
              </text>
            );
          })}
        </g>

        {/* Origin Label */}
        <text
          x={toPx(0) - 8}
          y={toPy(0) + 16}
          fill="#475569"
          fontSize="12"
          fontWeight="600"
          textAnchor="end"
          style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '3px' }}
        >
          0
        </text>

        {/* Function Line 1: y = ax + b */}
        {showLine1 && (
          <line
            x1={toPx(lineX1)}
            y1={toPy(lineY1)}
            x2={toPx(lineX2)}
            y2={toPy(lineY2)}
            stroke="#3b82f6"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#softShadow)"
            style={{ transition: 'all 0.1s linear' }}
          />
        )}

        {/* Function Line 2: y = a2*x + b2 */}
        {showLine2 && (
          <line
            x1={toPx(line2X1)}
            y1={toPy(line2Y1)}
            x2={toPx(line2X2)}
            y2={toPy(line2Y2)}
            stroke="#ec4899"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ transition: 'all 0.1s linear' }}
          />
        )}

        {/* Slope Triangle */}
        {showLine1 && showSlopeTriangle && a !== 0 && (
          <g className="slope-triangle" style={{ opacity: 0.85 }}>
            {/* dx */}
            <line
              x1={toPx(triX0)}
              y1={toPy(triY0)}
              x2={toPx(triX1)}
              y2={toPy(triY1)}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* dy */}
            <line
              x1={toPx(triX1)}
              y1={toPy(triY1)}
              x2={toPx(triX1)}
              y2={toPy(triY2)}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <text
              x={(toPx(triX0) + toPx(triX1)) / 2}
              y={toPy(triY0) + (a >= 0 ? 18 : -8)}
              fill="#d97706"
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '5px', strokeLinejoin: 'round' }}
            >
              +1
            </text>
            <text
              x={toPx(triX1) + (a > 0 ? 8 : -8)}
              y={(toPy(triY1) + toPy(triY2)) / 2}
              fill="#2563eb"
              fontSize="12"
              fontWeight="700"
              textAnchor={a > 0 ? "start" : "end"}
              style={{ paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '5px', strokeLinejoin: 'round' }}
            >
              {a > 0 ? `+${formatFractionStr(a)}` : formatFractionStr(a)}
            </text>
          </g>
        )}

        {/* Target Points / Markers */}
        {targets.map((tgt, idx) => {
          const isHit = showLine1 && Math.abs(a * tgt.x + b - tgt.y) < 0.2;
          const labelText = tgt.label
            ? `${tgt.label} (${formatFractionStr(tgt.x)}, ${formatFractionStr(tgt.y)})`
            : `(${formatFractionStr(tgt.x)}, ${formatFractionStr(tgt.y)})`;
          const badgeW = Math.max(72, labelText.length * 7.2 + 16);
          const badgeY = -42;
          return (
            <g key={idx} transform={`translate(${toPx(tgt.x)}, ${toPy(tgt.y)})`}>
              <circle
                r="15"
                fill={showLine1 ? (isHit ? "#d1fae5" : "#fee2e2") : "#e0f2fe"}
                stroke={showLine1 ? (isHit ? "#10b981" : "#ef4444") : "#0284c7"}
                strokeWidth="2"
                style={{ transition: 'all 0.3s ease', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}
              />
              <text textAnchor="middle" dominantBaseline="central" fontSize="14">
                📍
              </text>
              <rect
                x={-badgeW / 2}
                y={badgeY}
                width={badgeW}
                height="22"
                rx="6"
                fill="rgba(255, 255, 255, 0.95)"
                stroke="#94a3b8"
                strokeWidth="1.2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}
              />
              <text
                x="0"
                y={badgeY + 11}
                fill="#0f172a"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {labelText}
              </text>
            </g>
          );
        })}

        {/* Intersection Point */}
        {showLine1 && showLine2 && intersection && intersection.type === 'point' && (
          <g transform={`translate(${toPx(intersection.x)}, ${toPy(intersection.y)})`}>
            <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 2px 5px rgba(16,185,129,0.4))' }} />
            {isNearHandle && (
              <line x1="0" y1="0" x2={ixBadgeX} y2={ixBadgeY + 4} stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
            )}
            <g transform={`translate(${ixBadgeX}, ${ixBadgeY})`}>
              <rect
                x={ixBoxX}
                y={-ixBoxHeight / 2}
                width={ixBoxWidth}
                height={ixBoxHeight}
                rx="8"
                fill="rgba(16, 185, 129, 0.95)"
                style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}
              />
              <text
                x={ixTextAnchor === "start" ? (ixBoxX + 12) : 0}
                y="1"
                fill="#ffffff"
                fontSize="12"
                fontWeight="600"
                textAnchor={ixTextAnchor}
                dominantBaseline="central"
              >
                {ixTextStr}
              </text>
            </g>
          </g>
        )}

        {/* Y-Intercept Handle 1 (0, b) */}
        {showLine1 && (
          <g
            style={{ cursor: interactiveHandles ? 'ns-resize' : 'default' }}
            onPointerDown={handlePointerDown('intercept')}
          >
            <circle
              cx={toPx(0)}
              cy={h1Py}
              r="12"
              fill="#ffffff"
              stroke="#3b82f6"
              strokeWidth="2.5"
              style={{ transition: 'stroke-width 0.2s ease', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
            />
            <text
              x={toPx(0) - 16}
              y={labelY1}
              fill="#2563eb"
              fontSize="12"
              fontWeight="600"
              textAnchor="end"
              style={{ pointerEvents: 'none', paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '4px', strokeLinejoin: 'round' }}
            >
              y절편 ({formatFractionStr(b)})
            </text>
          </g>
        )}

        {/* Y-Intercept Handle 2 (0, b2) */}
        {showLine2 && (
          <g
            style={{ cursor: interactiveHandles ? 'ns-resize' : 'default' }}
            onPointerDown={handlePointerDown('intercept2')}
          >
            <circle
              cx={toPx(0)}
              cy={h2Py}
              r="12"
              fill="#ffffff"
              stroke="#ec4899"
              strokeWidth="2.5"
              style={{ transition: 'stroke-width 0.2s ease', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
            />
            <text
              x={toPx(0) + 16}
              y={labelY2}
              fill="#be185d"
              fontSize="12"
              fontWeight="600"
              textAnchor="start"
              style={{ pointerEvents: 'none', paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '4px', strokeLinejoin: 'round' }}
            >
              y절편2 ({formatFractionStr(b2)})
            </text>
          </g>
        )}

        {/* Interactive Slope Control Handle 1 */}
        {interactiveHandles && showLine1 && (
          <g
            style={{ cursor: 'grab' }}
            onPointerDown={handlePointerDown('slope')}
          >
            <circle
              cx={toPx(2)}
              cy={s1Py}
              r="12"
              fill="#ffffff"
              stroke="#3b82f6"
              strokeWidth="2.5"
              style={{ transition: 'stroke-width 0.2s ease', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
            />
            <text
              x={slopeLabelX1}
              y={slopeLabelY1}
              fill="#2563eb"
              fontSize="12"
              fontWeight="600"
              textAnchor={slopeAnchor1}
              style={{ pointerEvents: 'none', paintOrder: 'stroke fill', stroke: '#ffffff', strokeWidth: '4px', strokeLinejoin: 'round' }}
            >
              기울기1 조절
            </text>
          </g>
        )}

        {/* Interactive Slope Control Handle 2 */}
        {interactiveHandles && showLine2 && (
          <g
            style={{ cursor: 'grab' }}
            onPointerDown={handlePointerDown('slope2')}
          >
            <circle
              cx={toPx(2)}
              cy={s2Py}
              r="12"
              fill="#ffffff"
              stroke="#ec4899"
              strokeWidth="2.5"
              style={{ transition: 'stroke-width 0.2s ease', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
            />
            <text
              x={slopeLabelX2}
              y={slopeLabelY2}
              fill="#ec4899"
              fontSize="12"
              fontWeight="500"
              textAnchor={slopeAnchor2}
              style={{ pointerEvents: 'none' }}
            >
              기울기2 조절
            </text>
          </g>
        )}

        {/* Scrub point */}
        {showTablePoint && (
          <g transform={`translate(${toPx(scrubX)}, ${toPy(scrubY)})`}>
            <circle r="14" fill="#f3e8ff" stroke="#a855f7" strokeWidth="2" />
            <text textAnchor="middle" dominantBaseline="central" fontSize="16">
              🚀
            </text>
            <text
              x="0"
              y="-22"
              fill="#9333ea"
              fontSize="12"
              fontWeight="500"
              textAnchor="middle"
            >
              x={scrubX}, y={scrubY}
            </text>
          </g>
        )}
      </svg>

      {/* Floating Zoom & Reset Controls */}
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={handleZoomIn} title="확대">
          <ZoomIn size={20} />
        </button>
        <div style={{ height: '1px', background: '#e5e7eb' }}></div>
        <button className="zoom-btn" onClick={handleZoomOut} title="축소">
          <ZoomOut size={20} />
        </button>
        <div style={{ height: '1px', background: '#e5e7eb' }}></div>
        <button
          className="zoom-btn"
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
            if (onReset) onReset();
          }}
          title="기본 뷰 및 값 되돌리기 (초기화)"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
