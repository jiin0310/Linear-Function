import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Move, HelpCircle } from 'lucide-react';
import { VerticalFraction, toFraction, gcd } from '../utils/fractionUtils';

export default function DeterminationRulesMode({ sidePanelOpen, setSidePanelOpen, onParamChange }) {
  const [subTab, setSubTab] = useState('twoPoints'); // 'twoPoints' | 'slopeAndPoint' | 'intercepts'

  // Condition A: 2 Points
  const [p1, setP1] = useState({ x: -2, y: 1 });
  const [p2, setP2] = useState({ x: 3, y: 5 });

  // Condition B: Slope + 1 Point
  const [fixedA, setFixedA] = useState(2);
  const [singleP, setSingleP] = useState({ x: 1, y: 4 });

  // Condition C: X-Intercept & Y-Intercept
  const [xIntercept, setXIntercept] = useState(-3);
  const [yIntercept, setYIntercept] = useState(4);

  // Math Calculations for Condition A
  const dxA = p2.x - p1.x;
  const isVerticalA = dxA === 0;
  const dyA = p2.y - p1.y;
  const rawSlopeA = isVerticalA ? 0 : dyA / dxA;
  const slopeAFrac = toFraction(rawSlopeA);
  const interceptA = isVerticalA ? 0 : p1.y - rawSlopeA * p1.x;
  const interceptAFrac = toFraction(interceptA);

  // Math Calculations for Condition B
  const interceptB = singleP.y - fixedA * singleP.x;
  const interceptBFrac = toFraction(interceptB);

  // Math Calculations for Condition C
  const rawSlopeC = xIntercept !== 0 ? -yIntercept / xIntercept : 0;
  
  // Exact fraction calculation for slope C: a = -y0 / x0
  let numC = -yIntercept;
  let denC = xIntercept;
  if (denC < 0) {
    numC = -numC;
    denC = -denC;
  }
  const commonC = gcd(numC, denC) || 1;
  const slopeCFrac = {
    num: numC / commonC,
    den: denC / commonC,
    isInteger: denC / commonC === 1
  };

  // Sync parameters to main graph
  useEffect(() => {
    if (!onParamChange) return;
    if (subTab === 'twoPoints') {
      onParamChange(rawSlopeA, interceptA, [
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p2.y }
      ]);
    } else if (subTab === 'slopeAndPoint') {
      onParamChange(fixedA, interceptB, [{ x: singleP.x, y: singleP.y }]);
    } else if (subTab === 'intercepts') {
      onParamChange(rawSlopeC, yIntercept, [
        { x: xIntercept, y: 0 },
        { x: 0, y: yIntercept }
      ]);
    }
  }, [subTab, p1, p2, fixedA, singleP, xIntercept, yIntercept, rawSlopeA, interceptA, interceptB, rawSlopeC, onParamChange]);

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
        {/* SubTab Selector */}
        <div className="story-selector">
          <button
            className={`story-tab ${subTab === 'twoPoints' ? 'active' : ''}`}
            onClick={() => setSubTab('twoPoints')}
          >
            <span>1. 두 점 주어질 때</span>
          </button>
          <button
            className={`story-tab ${subTab === 'slopeAndPoint' ? 'active' : ''}`}
            onClick={() => setSubTab('slopeAndPoint')}
          >
            <span>2. 기울기+1점</span>
          </button>
          <button
            className={`story-tab ${subTab === 'intercepts' ? 'active' : ''}`}
            onClick={() => setSubTab('intercepts')}
          >
            <span>3. x절편+y절편</span>
          </button>
        </div>

        {/* SUBTAB 1: TWO POINTS */}
        {subTab === 'twoPoints' && (
          <div className="concept-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div className="concept-title" style={{ color: '#166534' }}>
              <CheckCircle2 size={20} color="#16a34a" />
              <span>📍 1. 서로 다른 두 점 ➔ 직선 1개 확정!</span>
            </div>
            <p style={{ fontSize: '13px', color: '#15803d', lineHeight: '1.4' }}>
              평면 위에 점 2개가 정해지면 이 두 점을 동시에 지나는 일차함수식은 <strong>오직 단 1개</strong>만 존재합니다.
            </p>

            {/* Point Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#166534', marginBottom: '0.35rem' }}>
                  🟢 첫 번째 점 P1 ({p1.x}, {p1.y})
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label style={{ fontSize: '12px' }}>x1: {p1.x}</label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={p1.x}
                    onChange={(e) => setP1({ ...p1, x: Number(e.target.value) })}
                  />
                  <label style={{ fontSize: '12px' }}>y1: {p1.y}</label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={p1.y}
                    onChange={(e) => setP1({ ...p1, y: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#166534', marginBottom: '0.35rem' }}>
                  🔵 두 번째 점 P2 ({p2.x}, {p2.y})
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label style={{ fontSize: '12px' }}>x2: {p2.x}</label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={p2.x}
                    onChange={(e) => setP2({ ...p2, x: Number(e.target.value) })}
                  />
                  <label style={{ fontSize: '12px' }}>y2: {p2.y}</label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={p2.y}
                    onChange={(e) => setP2({ ...p2, y: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Calculated Formula */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #16a34a',
                borderRadius: '12px',
                padding: '1rem',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}
            >
              {isVerticalA ? (
                <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '700' }}>
                  ⚠️ 두 점의 x좌표가 같으면 수직선이 되어 일차함수(y=ax+b)로 나타낼 수 없습니다!
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                    기울기 a = (y2 - y1) / (x2 - x1) = ({dyA}) / ({dxA})
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#15803d',
                      marginTop: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>y = </span>
                    <VerticalFraction num={slopeAFrac.num} den={slopeAFrac.den} color="#15803d" fontSize="1.3rem" />
                    <span>x + </span>
                    <VerticalFraction num={interceptAFrac.num} den={interceptAFrac.den} color="#047857" fontSize="1.3rem" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: SLOPE & 1 POINT */}
        {subTab === 'slopeAndPoint' && (
          <div className="concept-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div className="concept-title" style={{ color: '#1e40af' }}>
              <Move size={20} color="#2563eb" />
              <span>📐 2. 기울기(방향) + 지나가는 1점 ➔ 직선 1개 확정!</span>
            </div>
            <p style={{ fontSize: '13px', color: '#1d4ed8', lineHeight: '1.4' }}>
              직선의 기울기(경사)가 고정되어 있으면, 특정 점 1개를 통과하는 순간 직선의 위치가 <strong>완벽히 고정</strong>됩니다!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="slider-box">
                <div className="slider-header">
                  <span className="param-title">고정된 기울기 a: {fixedA}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={fixedA}
                  onChange={(e) => setFixedA(Number(e.target.value))}
                />
              </div>

              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e40af', marginBottom: '0.35rem' }}>
                  📍 지나가는 점 P ({singleP.x}, {singleP.y})
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label style={{ fontSize: '12px' }}>x: {singleP.x}</label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={singleP.x}
                    onChange={(e) => setSingleP({ ...singleP, x: Number(e.target.value) })}
                  />
                  <label style={{ fontSize: '12px' }}>y: {singleP.y}</label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={singleP.y}
                    onChange={(e) => setSingleP({ ...singleP, y: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Calculated Formula */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #2563eb',
                borderRadius: '12px',
                padding: '1rem',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>
                y - {singleP.y} = {fixedA}(x - {singleP.x})
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1d4ed8',
                  marginTop: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>y = {fixedA}x + </span>
                <VerticalFraction num={interceptBFrac.num} den={interceptBFrac.den} color="#1d4ed8" fontSize="1.3rem" />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: X & Y INTERCEPTS */}
        {subTab === 'intercepts' && (
          <div className="concept-card" style={{ background: '#faf5ff', borderColor: '#e9d5ff' }}>
            <div className="concept-title" style={{ color: '#6b21a8' }}>
              <HelpCircle size={20} color="#9333ea" />
              <span>🎯 3. x절편과 y절편 ➔ 완벽한 함수식 완성!</span>
            </div>
            <p style={{ fontSize: '13px', color: '#7e22ce', lineHeight: '1.4' }}>
              직선이 x축과 만나는 점(x절편)과 y축과 만나는 점(y절편) 2개만 찾으면 바로 함수식이 완성됩니다!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="slider-box">
                <div className="slider-header">
                  <span className="param-title" style={{ color: '#9333ea' }}>x절편 (x0, 0): {xIntercept}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={xIntercept}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setXIntercept(val === 0 ? 1 : val); // prevent 0 for division
                  }}
                />
              </div>

              <div className="slider-box">
                <div className="slider-header">
                  <span className="param-title" style={{ color: '#ef4444' }}>y절편 (0, y0): {yIntercept}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={yIntercept}
                  onChange={(e) => setYIntercept(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Formula & Intercept Form Display */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #a855f7',
                borderRadius: '12px',
                padding: '1rem',
                marginTop: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                textAlign: 'center'
              }}
            >
              {/* 0. Fixed Textbook General Formula: x/a + y/b = 1 */}
              <div style={{ background: '#f3e8ff', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #c084fc' }}>
                <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: '700', marginBottom: '4px' }}>
                  📐 절편 대표 공식 (x절편 = a, y절편 = b)
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#6b21a8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    margin: '4px 0'
                  }}
                >
                  <VerticalFraction num="x" den="a" color="#7e22ce" fontSize="1.4rem" />
                  <span> + </span>
                  <VerticalFraction num="y" den="b" color="#dc2626" fontSize="1.4rem" />
                  <span> = 1</span>
                </div>
              </div>

              {/* 1. Value Substituted Intercept Form */}
              <div style={{ background: '#faf5ff', padding: '0.6rem', borderRadius: '8px', border: '1px dashed #c084fc' }}>
                <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: '600', marginBottom: '4px' }}>
                  📌 현재 설정된 값 대입 (x절편 = {xIntercept}, y절편 = {yIntercept})
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#7e22ce',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <VerticalFraction num="x" den={xIntercept} color="#9333ea" fontSize="1.2rem" />
                  <span> + </span>
                  <VerticalFraction num="y" den={yIntercept} color="#ef4444" fontSize="1.2rem" />
                  <span> = 1</span>
                </div>
              </div>

              {/* 2. Slope-Intercept Form: y = ax + b */}
              <div>
                <div style={{ fontSize: '12px', color: '#6b21a8', fontWeight: '600' }}>
                  기울기 a = -(y절편 / x절편) = -({yIntercept} / {xIntercept})
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#7e22ce',
                    marginTop: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>y = </span>
                  <VerticalFraction num={slopeCFrac.num} den={slopeCFrac.den} color="#7e22ce" fontSize="1.3rem" />
                  <span>x + </span>
                  <span style={{ color: '#ef4444' }}>{yIntercept}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
