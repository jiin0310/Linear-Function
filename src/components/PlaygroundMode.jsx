import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { SmartNumber, toFraction, VerticalFraction } from '../utils/fractionUtils';

const PRESETS = [
  { label: 'y = x (기본)', a: 1, b: 0 },
  { label: 'y = 3x - 1 (가파름)', a: 3, b: -1 },
  { label: 'y = -2x + 4 (내리막)', a: -2, b: 4 },
  { label: 'y = 3 (평평함)', a: 0, b: 3 },
  { label: 'y = 2x - 5 (음수절편)', a: 2, b: -5 },
];

export default function PlaygroundMode({
  sidePanelOpen,
  setSidePanelOpen,
  a,
  setA,
  b,
  setB,
  showLine2,
  setShowLine2,
  a2,
  setA2,
  b2,
  setB2,
  showSlopeTriangle,
  setShowSlopeTriangle
}) {
  const [inspectXStr, setInspectXStr] = useState('3');
  const inspectXNum = inspectXStr !== '' && !isNaN(Number(inspectXStr)) ? Number(inspectXStr) : null;

  const rawY1 = inspectXNum !== null ? a * inspectXNum + b : null;
  const rawY2 = inspectXNum !== null ? a2 * inspectXNum + b2 : null;

  // Intersection math with exact fraction formatting
  let intersectionNode = null;
  if (showLine2) {
    if (a !== a2) {
      const ixRaw = (b2 - b) / (a - a2);
      const iyRaw = a * ixRaw + b;
      const ixFrac = toFraction(ixRaw);
      const iyFrac = toFraction(iyRaw);
      intersectionNode = (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <span>두 직선의 교점: (</span>
          <SmartNumber val={ixRaw} color="#2563eb" />
          <span>, </span>
          <SmartNumber val={iyRaw} color="#2563eb" />
          <span>)</span>
        </span>
      );
    } else if (b === b2) {
      intersectionNode = '두 직선이 완전히 일치합니다 (교점 무수히 많음)';
    } else {
      intersectionNode = '두 직선이 평행합니다 (교점 없음)';
    }
  }

  return (
    <div className={`floating-side-panel ${!sidePanelOpen ? 'collapsed' : ''}`}>
      <button
        className="side-panel-toggle"
        onClick={() => setSidePanelOpen(!sidePanelOpen)}
        title={sidePanelOpen ? '패널 접기' : '패널 펼치기'}
      >
        {sidePanelOpen ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
      </button>

      <div className="side-panel-content">
        <div className="formula-banner" style={{ gap: '0.5rem' }}>
          <div className="formula-display" style={{ color: '#3b82f6' }}>
            y₁ = <span className="val-a">{a}</span>x + <span className="val-b">{b < 0 ? `(${b})` : b}</span>
          </div>
          {showLine2 && (
            <div className="formula-display" style={{ color: '#ec4899', fontSize: '18px' }}>
              y₂ = <span>{a2}</span>x + <span>{b2 < 0 ? `(${b2})` : b2}</span>
            </div>
          )}
        </div>

        <div className="preset-row">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="preset-btn"
              onClick={() => {
                setA(p.a);
                setB(p.b);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="control-group">
          <div className="slider-box">
            <div className="slider-header">
              <span className="param-title">
                기울기 (a): <strong style={{ color: '#3b82f6' }}>{a}</strong>
              </span>
              <span className="param-badge">변화율</span>
            </div>
            <input
              type="range"
              min="-8"
              max="8"
              step="0.5"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
            />
          </div>

          <div className="slider-box">
            <div className="slider-header">
              <span className="param-title">
                y절편 (b): <strong style={{ color: '#ef4444' }}>{b}</strong>
              </span>
              <span className="param-badge">시작점</span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Second Line Toggle Section */}
        <div style={{ background: '#fdf2f8', padding: '0.75rem', borderRadius: '10px', border: '1px solid #fbcfe8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showLine2 ? '0.75rem' : '0' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#be185d' }}>
              ✌️ 두 번째 직선 (비교용)
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '12px', borderColor: '#f472b6', color: '#be185d' }}
              onClick={() => setShowLine2(!showLine2)}
            >
              {showLine2 ? '선 2 제거' : '선 2 추가'}
            </button>
          </div>

          {showLine2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="slider-box">
                <div className="slider-header">
                  <span className="param-title" style={{ color: '#ec4899' }}>
                    기울기 2 (a2): <strong>{a2}</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.5"
                  value={a2}
                  onChange={(e) => setA2(Number(e.target.value))}
                />
              </div>

              <div className="slider-box">
                <div className="slider-header">
                  <span className="param-title" style={{ color: '#db2777' }}>
                    y절편 2 (b2): <strong>{b2}</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={b2}
                  onChange={(e) => setB2(Number(e.target.value))}
                />
              </div>

              <div style={{ background: '#ffffff', padding: '0.6rem', borderRadius: '8px', fontSize: '12px', color: '#be185d', fontWeight: '600', textAlign: 'center' }}>
                {intersectionNode}
              </div>
            </div>
          )}
        </div>

        {/* Value inspector with SmartNumber format to prevent raw floats */}
        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>x = </span>
            <input
              type="number"
              value={inspectXStr}
              onChange={(e) => setInspectXStr(e.target.value)}
              style={{
                width: '60px',
                padding: '0.25rem 0.4rem',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontWeight: '600'
              }}
            />
            <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>일 때:</span>
          </div>

          <div style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>y₁ = </span>
            <SmartNumber val={rawY1} color="#3b82f6" fontSize="1rem" />
          </div>
          {showLine2 && (
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#ec4899', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>y₂ = </span>
              <SmartNumber val={rawY2} color="#ec4899" fontSize="1rem" />
            </div>
          )}
        </div>

        <button
          className="btn-secondary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          onClick={() => setShowSlopeTriangle(!showSlopeTriangle)}
        >
          <Eye size={16} /> {showSlopeTriangle ? '기울기 삼각형 숨기기' : '기울기 삼각형 보기'}
        </button>
      </div>
    </div>
  );
}
