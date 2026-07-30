import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toFraction } from '../utils/fractionUtils';

const formatCoordStr = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '?';
  if (Number.isInteger(val)) return `${val}`;
  const f = toFraction(val);
  return f.isInteger ? `${f.num}` : `${f.num}/${f.den}`;
};

export default function InteractiveGraph({
  a,
  b,
  onParamChange,
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

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = dimensions;

  // Base pixels per unit when zoom is 1
  const basePixelsPerUnit = 45;
  const pixelsPerUnit = basePixelsPerUnit * zoom;

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

  // Dynamic Auto-panning: shift centerY down when target Y values (b, b2) increase,
  // pushing X-axis towards the bottom to reveal higher Y-axis values dynamically!
  let targetFocusY = b;
  if (showLine2) {
    targetFocusY = (b + b2) / 2;
  }
  const panShiftYMath = Math.max(-12, Math.min(12, targetFocusY * 0.4));
  const centerY = height / 2 + panShiftYMath * pixelsPerUnit;

  let targetFocusX = 0;
  if (showLine2 && intersection && intersection.type === 'point') {
    targetFocusX = Math.max(-8, Math.min(8, intersection.x * 0.3));
  }
  // Stable Canvas Center: anchor centerX to viewport width to prevent grid jumping when collapsing sidebar
  const centerX = (width / 2) - targetFocusX * pixelsPerUnit;

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
  let ixBadgeX = 0;
  let ixBadgeY = -32;
  let ixTextAnchor = "middle";
  let ixBoxX = -45;
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
      ixBadgeX = 45;
      ixBadgeY = -22;
      ixTextAnchor = "start";
      ixBoxX = -10;
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
  const handlePointerDown = (type) => (e) => {
    if (!interactiveHandles) return;
    e.target.setPointerCapture(e.pointerId);
    setDragging(type);
  };

  const handlePointerMove = (e) => {
    if (!dragging || !containerRef.current) return;
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
  const tickStepX = zoom < 0.6 ? 2 : 1;
  const tickStepY = zoom < 0.6 ? 2 : 1;

  return (
    <div
      className="fullscreen-graph-canvas"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ userSelect: 'none', background: '#fafafa', position: 'relative' }}
    >
      <svg className="graph-svg" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Paper Grid Lines */}
        <g className="grid-lines">
          {xTicks.map((val) => {
            if (val === 0) return null;
            const px = toPx(val);
            return (
              <line
                key={`vx-${val}`}
                x1={px}
                y1={0}
                x2={px}
                y2={height}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            );
          })}
          {yTicks.map((val) => {
            if (val === 0) return null;
            const py = toPy(val);
            return (
              <line
                key={`hy-${val}`}
                x1={0}
                y1={py}
                x2={width}
                y2={py}
                stroke="#f3f4f6"
                strokeWidth="1"
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
            stroke={hoveredAxis === 'y' ? "#9ca3af" : "#d1d5db"}
            strokeWidth="2"
            transition="all 0.3s ease"
          />
          <text
            x={toPx(0) - 12}
            y={24}
            fill="#6b7280"
            fontSize="14"
            fontWeight="500"
            textAnchor="end"
            opacity={hoveredAxis === 'y' ? 1 : 0}
            style={{ transition: 'opacity 0.3s ease' }}
          >
            Y Axis
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
            stroke={hoveredAxis === 'x' ? "#9ca3af" : "#d1d5db"}
            strokeWidth="2"
            style={{ transition: 'stroke 0.3s ease' }}
          />
          <text
            x={width - 24}
            y={toPy(0) + 20}
            fill="#6b7280"
            fontSize="14"
            fontWeight="500"
            textAnchor="end"
            opacity={hoveredAxis === 'x' ? 1 : 0}
            style={{ transition: 'opacity 0.3s ease' }}
          >
            X Axis
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
                fill="#9ca3af"
                fontSize="12"
                fontWeight="400"
                textAnchor="middle"
              >
                {t}
              </text>
            );
          })}
          {yTicks.map((t) => {
            if (t === 0 || t % tickStepY !== 0) return null;
            return (
              <text
                key={`ty-${t}`}
                x={toPx(0) - 10}
                y={toPy(t) + 4}
                fill="#9ca3af"
                fontSize="12"
                fontWeight="400"
                textAnchor="end"
              >
                {t}
              </text>
            );
          })}
        </g>

        {/* Origin Label */}
        <text x={toPx(0) - 8} y={toPy(0) + 16} fill="#9ca3af" fontSize="11" fontWeight="400" textAnchor="end">
          0
        </text>

        {/* Slope Triangle */}
        {showSlopeTriangle && a !== 0 && (
          <g className="slope-triangle" style={{ opacity: 0.8 }}>
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
              fontWeight="500"
              textAnchor="middle"
            >
              +1
            </text>
            <text
              x={toPx(triX1) + (a > 0 ? 8 : -8)}
              y={(toPy(triY1) + toPy(triY2)) / 2}
              fill="#2563eb"
              fontSize="12"
              fontWeight="500"
              textAnchor={a > 0 ? "start" : "end"}
            >
              {a > 0 ? `+${formatCoordStr(a)}` : formatCoordStr(a)}
            </text>
          </g>
        )}

        {/* Target Stars for Game */}
        {targets.map((tgt, idx) => {
          const isHit = Math.abs(a * tgt.x + b - tgt.y) < 0.2;
          return (
            <g key={idx} transform={`translate(${toPx(tgt.x)}, ${toPy(tgt.y)})`}>
              <circle
                r="16"
                fill={isHit ? "#d1fae5" : "#fef3c7"}
                stroke={isHit ? "#10b981" : "#f59e0b"}
                strokeWidth="1.5"
                style={{ transition: 'all 0.3s ease' }}
              />
              <text textAnchor="middle" dominantBaseline="central" fontSize="16">
                {isHit ? "⭐" : "🌟"}
              </text>
              <text
                x="0"
                y="26"
                fill={isHit ? "#059669" : "#d97706"}
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
              >
                ({tgt.x}, {tgt.y})
              </text>
            </g>
          );
        })}

        {/* Function Line 1: y = ax + b */}
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

        {/* Intersection Point */}
        {showLine2 && intersection && intersection.type === 'point' && (
          <g transform={`translate(${toPx(intersection.x)}, ${toPy(intersection.y)})`}>
            <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 2px 5px rgba(16,185,129,0.4))' }} />
            {isNearHandle && (
              <line x1="0" y1="0" x2={ixBadgeX} y2={ixBadgeY + 4} stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
            )}
            <g transform={`translate(${ixBadgeX}, ${ixBadgeY})`}>
              <rect
                x={ixBoxX}
                y="-11"
                width="95"
                height="22"
                rx="6"
                fill="rgba(16, 185, 129, 0.95)"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
              />
              <text
                x={ixTextAnchor === "start" ? 0 : 0}
                y="4"
                fill="#ffffff"
                fontSize="11"
                fontWeight="600"
                textAnchor={ixTextAnchor}
              >
                교점 ({formatCoordStr(intersection.rawX)}, {formatCoordStr(intersection.rawY)})
              </text>
            </g>
          </g>
        )}

        {/* Y-Intercept Handle 1 (0, b) */}
        <g
          style={{ cursor: interactiveHandles ? 'ns-resize' : 'default' }}
          onPointerDown={handlePointerDown('intercept')}
        >
          <circle
            cx={toPx(0)}
            cy={h1Py}
            r="12"
            fill="#ffffff"
            stroke="#ef4444"
            strokeWidth="2.5"
            style={{ transition: 'stroke-width 0.2s ease', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
          />
          <text
            x={toPx(0) - 16}
            y={labelY1}
            fill="#ef4444"
            fontSize="12"
            fontWeight="500"
            textAnchor="end"
            style={{ pointerEvents: 'none' }}
          >
            y절편 ({formatCoordStr(b)})
          </text>
        </g>

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
              fill="#ec4899"
              fontSize="12"
              fontWeight="500"
              textAnchor="start"
              style={{ pointerEvents: 'none' }}
            >
              y절편2 ({formatCoordStr(b2)})
            </text>
          </g>
        )}

        {/* Interactive Slope Control Handle 1 */}
        {interactiveHandles && (
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
              fill="#3b82f6"
              fontSize="12"
              fontWeight="500"
              textAnchor={slopeAnchor1}
              style={{ pointerEvents: 'none' }}
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
