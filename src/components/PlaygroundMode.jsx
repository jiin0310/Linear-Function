import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Eye, ChevronRight, ChevronLeft, Edit3 } from 'lucide-react';
import { SmartNumber, toFraction, VerticalFraction, SlopeFraction, parseFractionOrNumber, formatFractionStr } from '../utils/fractionUtils';

const PRESETS = [
  { label: 'y = x', a: 1, b: 0 },
  { label: 'y = (5/3)x', a: 5 / 3, b: 0 },
  { label: 'y = 3x - 1', a: 3, b: -1 },
  { label: 'y = -2x + 4', a: -2, b: 4 },
  { label: 'y = 3', a: 0, b: 3 },
  { label: 'y = 2x - 5', a: 2, b: -5 },
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

  // Direct text input states for fractions / decimals
  const [aText, setAText] = useState(formatFractionStr(a, true));
  const [bText, setBText] = useState(formatFractionStr(b, true));
  const [a2Text, setA2Text] = useState(formatFractionStr(a2, true));
  const [b2Text, setB2Text] = useState(formatFractionStr(b2, true));

  useEffect(() => { setAText(prev => parseFractionOrNumber(prev) === a ? prev : formatFractionStr(a, true)); }, [a]);
  useEffect(() => { setBText(prev => parseFractionOrNumber(prev) === b ? prev : formatFractionStr(b, true)); }, [b]);
  useEffect(() => { setA2Text(prev => parseFractionOrNumber(prev) === a2 ? prev : formatFractionStr(a2, true)); }, [a2]);
  useEffect(() => { setB2Text(prev => parseFractionOrNumber(prev) === b2 ? prev : formatFractionStr(b2, true)); }, [b2]);

  // Intersection math with exact fraction formatting
  let intersectionNode = null;
  if (showLine2) {
    if (a !== a2) {
      const ixRaw = (b2 - b) / (a - a2);
      const iyRaw = a * ixRaw + b;
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
          <div className="formula-display" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
            <span>y₁ =</span>
            {a === 0 ? (
              <span style={{ color: '#94a3b8', opacity: 0.6 }}>0x</span>
            ) : (
              <>
                <SlopeFraction num={a} color="#2563eb" />
                <span>x</span>
              </>
            )}
            <span>{b >= 0 ? '+' : '-'}</span>
            <SmartNumber val={Math.abs(b)} color="#dc2626" fontSize="1.2rem" />
          </div>
          {showLine2 && (
            <div className="formula-display" style={{ color: '#ec4899', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
              <span>y₂ =</span>
              {a2 === 0 ? (
                <span style={{ color: '#94a3b8', opacity: 0.6 }}>0x</span>
              ) : (
                <>
                  <SlopeFraction num={a2} color="#be185d" />
                  <span>x</span>
                </>
              )}
              <span>{b2 >= 0 ? '+' : '-'}</span>
              <SmartNumber val={Math.abs(b2)} color="#be185d" fontSize="1.1rem" />
            </div>
          )}
        </div>

        {/* Direct Equation & Fraction Input Card */}
        <div style={{ background: '#eff6ff', padding: '0.75rem 0.85rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={15} color="#2563eb" />
            <span>직접 함수식 입력</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1.5px solid #93c5fd', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>y₁ =</span>
            <input
              type="text"
              value={aText}
              onChange={(e) => {
                const val = e.target.value;
                setAText(val);
                const parsed = parseFractionOrNumber(val);
                if (parsed !== null) setA(parsed);
              }}
              placeholder="기울기(5/3)"
              title="기울기 입력 (예: 5/3, -2, 1.5)"
              style={{
                width: '76px',
                padding: '0.3rem 0.4rem',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center',
                border: '1.5px solid #3b82f6',
                borderRadius: '6px',
                color: '#1d4ed8',
                background: '#f0f9ff',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>x +</span>
            <input
              type="text"
              value={bText}
              onChange={(e) => {
                const val = e.target.value;
                setBText(val);
                const parsed = parseFractionOrNumber(val);
                if (parsed !== null) setB(parsed);
              }}
              placeholder="y절편(3/4)"
              title="y절편 입력 (예: 3/4, -1, 2.5)"
              style={{
                width: '76px',
                padding: '0.3rem 0.4rem',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center',
                border: '1.5px solid #ef4444',
                borderRadius: '6px',
                color: '#dc2626',
                background: '#fef2f2',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '0.35rem', lineHeight: '1.3' }}>
            💡 <strong style={{ color: '#1d4ed8' }}>5/3</strong>, <strong style={{ color: '#1d4ed8' }}>-2/5</strong> 처럼 분수를 입력하면 그래프에 즉시 반영됩니다!
          </div>
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
                기울기 (a): <strong style={{ color: '#3b82f6' }}>{formatFractionStr(a, true)}</strong>
              </span>
              <span className="param-badge">변화율</span>
            </div>
            <input
              type="range"
              min="-8"
              max="8"
              step="0.5"
              value={Number.isInteger(a) || Math.abs(a * 2 - Math.round(a * 2)) < 0.01 ? a : 1}
              onChange={(e) => setA(Number(e.target.value))}
            />
          </div>

          <div className="slider-box">
            <div className="slider-header">
              <span className="param-title">
                y절편 (b): <strong style={{ color: '#3b82f6' }}>{formatFractionStr(b, true)}</strong>
              </span>
              <span className="param-badge">시작점</span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={Number.isInteger(b) ? b : Math.round(b)}
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
              {/* Line 2 Direct Fraction Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1.5px solid #f472b6' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#be185d' }}>y₂ =</span>
                <input
                  type="text"
                  value={a2Text}
                  onChange={(e) => {
                    const val = e.target.value;
                    setA2Text(val);
                    const parsed = parseFractionOrNumber(val);
                    if (parsed !== null) setA2(parsed);
                  }}
                  placeholder="기울기2"
                  style={{
                    width: '65px',
                    padding: '0.25rem 0.35rem',
                    fontSize: '13px',
                    fontWeight: '700',
                    textAlign: 'center',
                    border: '1px solid #f472b6',
                    borderRadius: '6px',
                    color: '#be185d',
                    background: '#fdf2f8',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>x +</span>
                <input
                  type="text"
                  value={b2Text}
                  onChange={(e) => {
                    const val = e.target.value;
                    setB2Text(val);
                    const parsed = parseFractionOrNumber(val);
                    if (parsed !== null) setB2(parsed);
                  }}
                  placeholder="y절편2"
                  style={{
                    width: '65px',
                    padding: '0.25rem 0.35rem',
                    fontSize: '13px',
                    fontWeight: '700',
                    textAlign: 'center',
                    border: '1px solid #f472b6',
                    borderRadius: '6px',
                    color: '#db2777',
                    background: '#fdf2f8',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="slider-box">
                <div className="slider-header">
                  <span className="param-title" style={{ color: '#ec4899' }}>
                    기울기 2 (a2): <strong>{formatFractionStr(a2, true)}</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.5"
                  value={Number.isInteger(a2) || Math.abs(a2 * 2 - Math.round(a2 * 2)) < 0.01 ? a2 : 1}
                  onChange={(e) => setA2(Number(e.target.value))}
                />
              </div>

              <div className="slider-box">
                <div className="slider-header">
                  <span className="param-title" style={{ color: '#db2777' }}>
                    y절편 2 (b2): <strong>{formatFractionStr(b2, true)}</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={Number.isInteger(b2) ? b2 : Math.round(b2)}
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
