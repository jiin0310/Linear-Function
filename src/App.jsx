import React, { useState, useCallback } from 'react';
import { Compass, Sparkles, ChevronUp, ChevronDown, Sliders, Box, CheckCircle2 } from 'lucide-react';
import InteractiveGraph from './components/InteractiveGraph';
import PlaygroundMode from './components/PlaygroundMode';
import FunctionBoxMode from './components/FunctionBoxMode';
import DeterminationRulesMode from './components/DeterminationRulesMode';

export default function App() {
  const [activeTab, setActiveTab] = useState('box'); // 'box' | 'playground' | 'determination'
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isTopBarOpen, setIsTopBarOpen] = useState(true);
  const [isTipDismissed, setIsTipDismissed] = useState(false);
  const [isTipObscured, setIsTipObscured] = useState(false);

  // Persistent shared Graph State
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [showLine2, setShowLine2] = useState(false);
  const [a2, setA2] = useState(-1);
  const [b2, setB2] = useState(1);
  const [showSlopeTriangle, setShowSlopeTriangle] = useState(true);
  const [targets, setTargets] = useState([]);

  // Callback to sync parameters from sub-components
  const handleDeterminationParamChange = useCallback((newA, newB, newTargets) => {
    setA(newA);
    setB(newB);
    setTargets(newTargets || []);
    setShowLine2(false);
  }, []);

  const handleFunctionBoxParamChange = useCallback((newA, newB) => {
    setA(newA);
    setB(newB);
    setTargets([]);
    setShowLine2(false);
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'box') {
      setShowLine2(false);
      setTargets([]);
    } else if (tabKey === 'determination') {
      setShowLine2(false);
    }
  };

  const handleResetGraph = useCallback(() => {
    setA(1);
    setB(2);
    setA2(-1);
    setB2(1);
    setShowLine2(false);
    setTargets([]);
  }, []);

  return (
    <div className="app-fullscreen-shell">
      {/* Persistent SVG Graph Canvas - Mounted ONCE at root to prevent unmounting flicker/shift */}
      <InteractiveGraph
        a={a}
        b={b}
        onParamChange={(newA, newB) => {
          setA(newA);
          setB(newB);
        }}
        showSlopeTriangle={showSlopeTriangle}
        interactiveHandles={activeTab === 'playground'}
        showLine2={showLine2}
        a2={a2}
        b2={b2}
        onParamChange2={(newA2, newB2) => {
          setA2(newA2);
          setB2(newB2);
        }}
        targets={activeTab === 'determination' ? targets : []}
        isSidePanelOpen={isSidePanelOpen}
        onReset={handleResetGraph}
        onTipObscuredChange={setIsTipObscured}
      />

      {/* Floating Top Navigation Header */}
      <header className={`floating-top-bar ${!isTopBarOpen ? 'collapsed' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="brand-title">일차함수 그래프 마스터 🚀</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'box' ? 'active' : ''}`}
            onClick={() => handleTabChange('box')}
          >
            <Box size={18} />
            <span>1. 개념 & 함수 상자</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => handleTabChange('playground')}
          >
            <Compass size={18} />
            <span>2. 자유 실습장</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'determination' ? 'active' : ''}`}
            onClick={() => handleTabChange('determination')}
          >
            <CheckCircle2 size={18} />
            <span>3. 일차함수 식 구하기</span>
          </button>
        </nav>

        {/* Header Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '10px' }}
            onClick={() => setIsTopBarOpen(false)}
            title="상단바 접기"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </header>

      {/* Trigger Button when Top Bar is collapsed */}
      {!isTopBarOpen && (
        <button
          className="collapsed-topbar-trigger"
          onClick={() => setIsTopBarOpen(true)}
        >
          <Sparkles size={16} color="#0284c7" /> 메뉴 펼치기 <ChevronDown size={16} />
        </button>
      )}

      {/* Trigger Button when Side Panel is collapsed */}
      {!isSidePanelOpen && (
        <button
          className="collapsed-panel-trigger"
          onClick={() => setIsSidePanelOpen(true)}
        >
          <Sliders size={18} color="#0284c7" /> 컨트롤 패널 열기 <ChevronLeft size={18} />
        </button>
      )}

      {/* Control Panel Views (Floating Side Drawers) */}
      {activeTab === 'box' && (
        <FunctionBoxMode
          sidePanelOpen={isSidePanelOpen}
          setSidePanelOpen={setIsSidePanelOpen}
          onParamChange={handleFunctionBoxParamChange}
        />
      )}
      {activeTab === 'playground' && (
        <PlaygroundMode
          sidePanelOpen={isSidePanelOpen}
          setSidePanelOpen={setIsSidePanelOpen}
          a={a}
          setA={setA}
          b={b}
          setB={setB}
          showLine2={showLine2}
          setShowLine2={setShowLine2}
          a2={a2}
          setA2={setA2}
          b2={b2}
          setB2={setB2}
          showSlopeTriangle={showSlopeTriangle}
          setShowSlopeTriangle={setShowSlopeTriangle}
        />
      )}
      {activeTab === 'determination' && (
        <DeterminationRulesMode
          sidePanelOpen={isSidePanelOpen}
          setSidePanelOpen={setIsSidePanelOpen}
          onParamChange={handleDeterminationParamChange}
        />
      )}

      {/* Floating overlay badge on bottom left */}
      {!isTipDismissed && activeTab === 'playground' && (
        <div
          className="floating-overlay-badge"
          style={{
            opacity: isTipObscured ? 0.1 : 1,
            pointerEvents: isTipObscured ? 'none' : 'auto',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transform: isTipObscured ? 'translateY(10px)' : 'translateY(0)'
          }}
        >
          <span style={{ color: '#0284c7' }}>💡 직관 조작 팁:</span>
          <span style={{ color: '#0f172a' }}>y절편 점(붉은색)이나 기울기 점(파란색)을 잡고 끌어서 조절해보세요!</span>
          <button
            onClick={() => setIsTipDismissed(true)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '0 4px',
              fontSize: '14px',
              marginLeft: '4px'
            }}
            title="팁 닫기"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
