import React, { useState } from 'react';
import { Car, Rocket, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import InteractiveGraph from './InteractiveGraph';

const STORIES = [
  {
    id: 'taxi',
    title: '🚕 택시 요금 계산',
    icon: Car,
    unitX: 'km (이동 거리)',
    unitY: '천 원 (택시 요금)',
    aLabel: '1km당 추가 요금 (a)',
    bLabel: '기본 요금 (b)',
    defaultA: 1,
    defaultB: 4,
    getStoryText: (a, b, x, y) => (
      <>
        택시를 타자마자 기본요금 <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>{b}천 원</span>이 찍혀요 (y절편 <span style={{ color: '#f43f5e' }}>b={b}</span>).<br />
        1km 이동할 때마다 <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{a}천 원</span>씩 늘어나요 (기울기 <span style={{ color: '#38bdf8' }}>a={a}</span>).<br />
        <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{x}km 이동</span>하면 총 <span style={{ color: '#10b981', fontWeight: 'bold' }}>{y}천 원</span>을 내야 해요!
      </>
    )
  },
  {
    id: 'rocket',
    title: '🚀 로켓 발사 고도',
    icon: Rocket,
    unitX: '초 (시간)',
    unitY: 'm (로켓 높이)',
    aLabel: '초당 상승 속도 (a)',
    bLabel: '발사대 높이 (b)',
    defaultA: 3,
    defaultB: 1,
    getStoryText: (a, b, x, y) => (
      <>
        로켓이 높이 <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>{b}m 발사대</span>에서 출발해요 (y절편 <span style={{ color: '#f43f5e' }}>b={b}</span>).<br />
        1초마다 위로 <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{a}m</span>씩 올라가요 (기울기 <span style={{ color: '#38bdf8' }}>a={a}</span>).<br />
        <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{x}초 후</span> 로켓의 위치는 높이 <span style={{ color: '#10b981', fontWeight: 'bold' }}>{y}m</span>예요!
      </>
    )
  }
];

export default function StoryMode({ sidePanelOpen, setSidePanelOpen, onTipObscuredChange }) {
  const [selectedStory, setSelectedStory] = useState(STORIES[0]);
  const [a, setA] = useState(STORIES[0].defaultA);
  const [b, setB] = useState(STORIES[0].defaultB);
  const [scrubX, setScrubX] = useState(2);

  const handleSelectStory = (story) => {
    setSelectedStory(story);
    setA(story.defaultA);
    setB(story.defaultB);
    setScrubX(2);
  };

  const currentY = a * scrubX + b;
  const tableRows = [0, 1, 2, 3, 4, 5].map((xVal) => ({
    x: xVal,
    y: a * xVal + b
  }));

  return (
    <>
      {/* Full-Screen Graph Background */}
      <InteractiveGraph
        a={a}
        b={b}
        onParamChange={(newA, newB) => {
          setA(newA);
          setB(newB);
        }}
        showSlopeTriangle={true}
        showTablePoint={true}
        scrubX={scrubX}
        interactiveHandles={true}
        isSidePanelOpen={sidePanelOpen}
        onReset={() => {
          setA(selectedStory.defaultA);
          setB(selectedStory.defaultB);
          setScrubX(2);
        }}
        onTipObscuredChange={onTipObscuredChange}
      />

      {/* Floating Collapsible Control Panel */}
      <div className={`floating-side-panel ${!sidePanelOpen ? 'collapsed' : ''}`}>
        <button
          className="side-panel-toggle"
          onClick={() => setSidePanelOpen(!sidePanelOpen)}
          title={sidePanelOpen ? '패널 접기' : '패널 펼치기'}
        >
          {sidePanelOpen ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>

        <div className="side-panel-content">
          <div className="formula-banner">
            <div className="formula-display">
              y = <span className="val-a">{a}</span>x + <span className="val-b">{b < 0 ? `(${b})` : b}</span>
            </div>
          </div>

          <div className="story-selector">
            {STORIES.map((story) => {
              const Icon = story.icon;
              const isActive = selectedStory.id === story.id;
              return (
                <button
                  key={story.id}
                  className={`story-tab ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectStory(story)}
                >
                  <Icon size={18} />
                  <span>{story.title.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>

          <div className="story-illustration">
            <div className="illustration-avatar">
              {selectedStory.id === 'taxi' && '🚕'}
              {selectedStory.id === 'rocket' && '🚀'}
            </div>
            <div className="illustration-text">
              <h3>{selectedStory.title}</h3>
              <p>{selectedStory.getStoryText(a, b, scrubX, currentY)}</p>
            </div>
          </div>

          <div className="control-group">
            <div className="slider-box param-b">
              <div className="slider-header">
                <span className="param-title b">시작 위치 (y절편 b)</span>
                <span className="param-badge b">{b}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="8"
                step="1"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                <span style={{ fontWeight: 500 }}>{selectedStory.bLabel}</span>
                <span>(x=0일 때 y값)</span>
              </div>
            </div>

            <div className="slider-box param-a">
              <div className="slider-header">
                <span className="param-title a">변화 속도 (기울기 a)</span>
                <span className="param-badge a">{a}</span>
              </div>
              <input
                type="range"
                min="-4"
                max="5"
                step="1"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                <span style={{ fontWeight: 500 }}>{selectedStory.aLabel}</span>
                <span>(1단위 증가시 변화량)</span>
              </div>
            </div>

            <div className="slider-box param-x">
              <div className="slider-header">
                <span className="param-title x">
                  진행 상황 (x: {selectedStory.unitX})
                </span>
                <span className="param-badge x">
                  {scrubX}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={scrubX}
                onChange={(e) => setScrubX(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="concept-card">
            <div className="concept-title">
              <HelpCircle size={18} color="#38bdf8" />
              <span>표로 보는 x와 y의 대입 결과</span>
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>x</th>
                    {tableRows.map((r) => (
                      <th key={r.x} style={{ color: r.x === scrubX ? '#38bdf8' : 'inherit' }}>
                        {r.x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>y</td>
                    {tableRows.map((r) => (
                      <td
                        key={r.x}
                        style={{
                          color: r.x === scrubX ? '#38bdf8' : '#ffffff',
                          fontWeight: r.x === scrubX ? 'bold' : 'normal',
                          background: r.x === scrubX ? 'rgba(56, 189, 248, 0.2)' : 'transparent'
                        }}
                      >
                        {r.y}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
