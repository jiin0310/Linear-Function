import React, { useState } from 'react';
import { Box, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { VerticalFraction, toFraction, SmartNumber } from '../utils/fractionUtils';

export default function FunctionBoxMode({ sidePanelOpen, setSidePanelOpen, onParamChange }) {
  // Function Box State
  const [boxA, setBoxA] = useState(2);
  const [boxB, setBoxB] = useState(3);
  const [inputXStr, setInputXStr] = useState('36');

  // General Form State: ax + by + c = 0
  const [genA, setGenA] = useState(3);
  const [genB, setGenB] = useState(-2);
  const [genC, setGenC] = useState(6);

  // Conversion from ax + by + c = 0 => y = (-a/b)x + (-c/b)
  const slopeFrac = genB !== 0 ? toFraction(-genA / genB) : { num: 0, den: 1, isInteger: true };
  const interceptFrac = genB !== 0 ? toFraction(-genC / genB) : { num: 0, den: 1, isInteger: true };

  // Calculate Function Box Output Displays
  const hasInput = inputXStr !== '' && !isNaN(Number(inputXStr));
  const numX = hasInput ? Number(inputXStr) : 0;
  const currentY = numX * boxA + boxB;

  const topLabelDisplay = hasInput ? inputXStr : '□';
  const boxTextDisplay = hasInput ? `[ ${inputXStr} × ${boxA} ] + ${boxB}` : `[ □ × ${boxA} ] + ${boxB}`;
  const bottomLabelDisplay = hasInput ? currentY : '△';

  // Update parent graph parameters when genA, genB, genC change
  React.useEffect(() => {
    if (onParamChange && genB !== 0) {
      onParamChange(-genA / genB, -genC / genB);
    }
  }, [genA, genB, genC, onParamChange]);

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
        {/* SECTION 1: FUNCTION BOX */}
        <div className="concept-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div className="concept-title" style={{ color: '#0f172a' }}>
            <Box size={20} color="#3b82f6" />
            <span>함수 상자</span>
          </div>

          {/* SVG Function Box Diagram - Generous ViewBox (0 -15 320 210) preventing any clipping */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.25rem 0.5rem',
              margin: '0.75rem 0',
              display: 'flex',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              overflow: 'visible'
            }}
          >
            <svg
              viewBox="0 -15 320 210"
              style={{
                width: '100%',
                maxWidth: '300px',
                display: 'block',
                overflow: 'visible'
              }}
            >
              {/* Top Input Funnel */}
              <line x1="25" y1="15" x2="40" y2="40" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="85" y1="15" x2="70" y2="40" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

              {/* Top Input Arrow & Label */}
              <text x="55" y="5" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2563eb">
                {topLabelDisplay}
              </text>
              <path
                d="M 55 12 V 34 M 50 28 L 55 34 L 60 28"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main Box Contour - OPEN at Top (40 to 70) & OPEN at Bottom (170 to 200) */}
              <path
                d="M 10 40 H 40 M 70 40 H 290 V 140 H 200 M 170 140 H 10 V 40"
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Internal Rule Expression */}
              <g transform="translate(150, 90)">
                <rect
                  x="-95"
                  y="-22"
                  width="190"
                  height="44"
                  rx="8"
                  fill="#eff6ff"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text textAnchor="middle" y="6" fontSize="15" fontWeight="700" fill="#1e40af">
                  {boxTextDisplay}
                </text>
              </g>

              {/* Bottom Exit Funnel */}
              <line x1="170" y1="140" x2="155" y2="165" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="200" y1="140" x2="215" y2="165" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

              {/* Bottom Exit Arrow & Label */}
              <path
                d="M 185 140 V 160 M 180 155 L 185 160 L 190 155"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="185" y="185" textAnchor="middle" fontSize="16" fontWeight="700" fill="#047857">
                {bottomLabelDisplay}
              </text>
            </svg>
          </div>

          {/* Direct Number Input Box */}
          <div style={{ marginBottom: '1rem', background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
              ✏️ 입력할 숫자 (x):
            </label>
            <input
              type="number"
              placeholder="숫자를 입력해보세요"
              value={inputXStr}
              onChange={(e) => setInputXStr(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                fontSize: '15px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontWeight: '600',
                color: '#1e293b'
              }}
            />
          </div>

          {/* Controls for Box Rule (Multiplier & Addition) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', minWidth: '50px' }}>곱하기:</span>
              <input
                type="range"
                min="-5"
                max="5"
                value={boxA}
                onChange={(e) => setBoxA(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', width: '20px' }}>{boxA}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', minWidth: '50px' }}>더하기:</span>
              <input
                type="range"
                min="-10"
                max="10"
                value={boxB}
                onChange={(e) => setBoxB(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', width: '20px' }}>{boxB}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: EQUATION FORM CONVERTER */}
        <div className="concept-card" style={{ background: '#fdf2f8', borderColor: '#fbcfe8' }}>
          <div className="concept-title" style={{ color: '#9d174d' }}>
            <RefreshCw size={18} color="#db2777" />
            <span>일차방정식 ⇄ 일차함수 변환기</span>
          </div>

          <p style={{ fontSize: '12px', color: '#9d174d', lineHeight: '1.4' }}>
            방정식 ax + by + c = 0을 y = ax + b 형태로 정리하면 기울기와 y절편을 분수로 쉽게 구할 수 있습니다!
          </p>

          {/* General Form Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div className="slider-box">
              <div className="slider-header">
                <span className="param-title">a 계수: {genA}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="1"
                value={genA}
                onChange={(e) => setGenA(Number(e.target.value))}
              />
            </div>

            <div className="slider-box">
              <div className="slider-header">
                <span className="param-title">b 계수: {genB}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="1"
                value={genB}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGenB(val === 0 ? 1 : val); // prevent b=0 for division
                }}
              />
            </div>

            <div className="slider-box">
              <div className="slider-header">
                <span className="param-title">c 상수항: {genC}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={genC}
                onChange={(e) => setGenC(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Step-by-Step Conversion Flow */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #f472b6',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#831843' }}>
              1️⃣ 일반형 방정식 형태:
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#be185d', textAlign: 'center' }}>
              {genA}x + ({genB})y + ({genC}) = 0
            </div>

            <div style={{ fontSize: '13px', fontWeight: '600', color: '#831843', marginTop: '0.25rem' }}>
              2️⃣ y에 대해 이항 정리:
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#be185d', textAlign: 'center' }}>
              {genB}y = -{genA}x - {genC}
            </div>

            <div style={{ fontSize: '13px', fontWeight: '600', color: '#831843', marginTop: '0.25rem' }}>
              3️⃣ 교과서 스타일 분수 표현 함수식:
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#2563eb',
                textAlign: 'center',
                background: '#eff6ff',
                padding: '0.75rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>y = </span>
              <VerticalFraction num={slopeFrac.num} den={slopeFrac.den} color="#2563eb" fontSize="1.2rem" />
              <span>x + </span>
              <VerticalFraction num={interceptFrac.num} den={interceptFrac.den} color="#dc2626" fontSize="1.2rem" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
