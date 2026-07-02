import React from 'react';
import Svg, { Line, Circle } from 'react-native-svg';

// The Algogo mark: three nodes forming an "A", joined by light lavender-gray
// legs + crossbar. Multi-color, so it must render as a real color asset (never
// a tinted/template image). Coordinate space is 1024×1024; scale via `size`.
export default function AlgogoLogo({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Line x1={512} y1={310} x2={348} y2={700} stroke="#CDD0E0" strokeWidth={28} strokeLinecap="round" />
      <Line x1={512} y1={310} x2={676} y2={700} stroke="#CDD0E0" strokeWidth={28} strokeLinecap="round" />
      <Line x1={405} y1={565} x2={619} y2={565} stroke="#CDD0E0" strokeWidth={28} strokeLinecap="round" />
      <Circle cx={512} cy={310} r={80} fill="#EF7A63" />
      <Circle cx={348} cy={700} r={80} fill="#8E97EC" />
      <Circle cx={676} cy={700} r={80} fill="#5EC97D" />
    </Svg>
  );
}
