import React from 'react';

// Greatest Common Divisor
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Convert float to exact fraction using Continued Fraction algorithm
// Fixes repeating decimals like 1.33333333333 => 4/3, 0.666666666 => 2/3, -0.5 => -1/2
export function toFraction(val, maxDen = 100) {
  if (val === null || val === undefined || isNaN(val)) {
    return { num: 0, den: 1, isInteger: true };
  }
  if (Number.isInteger(val)) {
    return { num: val, den: 1, isInteger: true };
  }

  const isNeg = val < 0;
  let x = Math.abs(val);
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = x;
  do {
    let a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    if (b - a === 0) break;
    b = 1 / (b - a);
  } while (Math.abs(x - h1 / k1) > 1e-5 && k1 <= maxDen);

  let num = isNeg ? -h1 : h1;
  let den = k1;

  if (den === 1) {
    return { num, den: 1, isInteger: true };
  }
  return { num, den, isInteger: false };
}

// Render vertical fraction component (수학 교과서 형태 분수)
export function VerticalFraction({ num, den, color, fontSize = '1.1rem' }) {
  if (den === 1) {
    return <span style={{ color, fontSize, fontWeight: '600' }}>{num}</span>;
  }
  if (den === -1) {
    return <span style={{ color, fontSize, fontWeight: '600' }}>{-num}</span>;
  }

  const isNumNum = typeof num === 'number';
  const isDenNum = typeof den === 'number';

  const isNegative =
    (isNumNum && num < 0 && isDenNum && den > 0) ||
    (isNumNum && num > 0 && isDenNum && den < 0) ||
    (!isNumNum && isDenNum && den < 0);

  const displayNum = isNumNum ? Math.abs(num) : num;
  const displayDen = isDenNum ? Math.abs(den) : den;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        verticalAlign: 'middle',
        margin: '0 2px',
        color,
        fontSize,
        fontWeight: '600'
      }}
    >
      {isNegative && <span style={{ marginRight: '1px' }}>-</span>}
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '1.1'
        }}
      >
        <span style={{ borderBottom: '1.5px solid currentColor', padding: '0 3px', paddingBottom: '1px' }}>
          {displayNum}
        </span>
        <span style={{ padding: '0 3px', paddingTop: '1px' }}>
          {displayDen}
        </span>
      </span>
    </span>
  );
}

// Format slope fraction (e.g., if slope is 1, return ""; if -1, return "-"; if fraction, return VerticalFraction)
export function SlopeFraction({ num, den, color = '#3b82f6' }) {
  const frac = den ? { num, den, isInteger: den === 1 } : toFraction(num);
  if (frac.isInteger) {
    if (frac.num === 1) return null; // y = x
    if (frac.num === -1) return <span style={{ color, fontWeight: '600' }}>-</span>; // y = -x
    return <span style={{ color, fontWeight: '600' }}>{frac.num}</span>;
  }
  return <VerticalFraction num={frac.num} den={frac.den} color={color} />;
}

// Format any number to clean display: Integer, clean decimal (e.g. 1.5), or VerticalFraction
export function SmartNumber({ val, color, fontSize = '1rem' }) {
  if (val === null || val === undefined || isNaN(val)) return '?';
  if (Number.isInteger(val)) return <span style={{ color, fontSize, fontWeight: '600' }}>{val}</span>;
  
  const frac = toFraction(val);
  if (frac.isInteger) {
    return <span style={{ color, fontSize, fontWeight: '600' }}>{frac.num}</span>;
  }
  return <VerticalFraction num={frac.num} den={frac.den} color={color} fontSize={fontSize} />;
}
