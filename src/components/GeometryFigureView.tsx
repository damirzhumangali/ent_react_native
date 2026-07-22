import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText, G } from "react-native-svg";
import { FigureParams } from "@/models/question";

interface GeometryFigureViewProps {
  figureType: string;
  params?: FigureParams;
}

// Custom Glassmorphic label widget
const FigLabel = ({ text }: { text: string }) => (
  <View style={styles.figLabelContainer}>
    <Text style={styles.figLabelText}>{text}</Text>
  </View>
);

export default function GeometryFigureView({ figureType, params }: GeometryFigureViewProps) {
  const renderFigure = () => {
    switch (figureType) {
      case "triangle":
        return <TriangleFigure params={params} />;
      case "right_triangle":
        return <RightTriangleFigure params={params} />;
      case "isosceles_triangle":
        return <IsoscelesTriangleFigure params={params} />;
      case "equilateral_triangle":
        return <EquilateralTriangleFigure params={params} />;
      case "circle":
        return <CircleFigure params={params} />;
      case "circle_chord":
        return <CircleChordFigure params={params} />;
      case "pyramid":
        return <PyramidFigure params={params} />;
      case "coordinate_line":
        return <CoordinateLineFigure params={params} />;
      case "coordinate_circle":
        return <CoordinateCircleFigure params={params} />;
      case "rectangle":
        return <RectangleFigure params={params} />;
      case "square":
        return <SquareFigure params={params} />;
      case "trapezoid":
        return <TrapezoidFigure params={params} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderFigure()}
    </View>
  );
}

// 1. Triangle Figure
function TriangleFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const pad = 24;
  const A = { x: pad, y: h - pad };
  const B = { x: w - pad, y: h - pad };
  const C = { x: w * 0.4, y: pad };

  // Calculate side midpoints for labels
  const midAB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 + 14 };
  const midBC = { x: (B.x + C.x) / 2 + 10, y: (B.y + C.y) / 2 - 4 };
  const midAC = { x: (A.x + C.x) / 2 - 14, y: (A.y + C.y) / 2 - 4 };

  const d = `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Path d={d} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        {/* Vertex Dots */}
        <Circle cx={A.x} cy={A.y} r={3} fill="#FFFFFF" />
        <Circle cx={B.x} cy={B.y} r={3} fill="#FFFFFF" />
        <Circle cx={C.x} cy={C.y} r={3} fill="#FFFFFF" />
        {/* Labels */}
        <SvgText x={A.x - 14} y={A.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">A</SvgText>
        <SvgText x={B.x + 6} y={B.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">B</SvgText>
        <SvgText x={C.x - 4} y={C.y - 6} fill="#FFFFFF" fontSize={12} fontWeight="bold">C</SvgText>
      </Svg>
      {params?.labelC && <View style={[styles.absoluteLabel, { left: midAB.x - 15, top: midAB.y - 10 }]}><FigLabel text={params.labelC} /></View>}
      {params?.labelA && <View style={[styles.absoluteLabel, { left: midBC.x - 15, top: midBC.y - 10 }]}><FigLabel text={params.labelA} /></View>}
      {params?.labelB && <View style={[styles.absoluteLabel, { left: midAC.x - 15, top: midAC.y - 10 }]}><FigLabel text={params.labelB} /></View>}
    </View>
  );
}

// 2. Right Triangle Figure
function RightTriangleFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const pad = 24;
  const A = { x: pad, y: h - pad }; // Right angle
  const B = { x: w - pad, y: h - pad };
  const C = { x: pad, y: pad };
  const sq = 10; // Right angle square size

  const d = `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`;
  const rightAnglePath = `M ${A.x + sq} ${A.y} L ${A.x + sq} ${A.y - sq} L ${A.x} ${A.y - sq}`;

  const midAB = { x: (A.x + B.x) / 2, y: A.y + 14 };
  const midBC = { x: (B.x + C.x) / 2 + 10, y: (B.y + C.y) / 2 - 4 };
  const midAC = { x: A.x - 14, y: (A.y + C.y) / 2 - 6 };

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Path d={d} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        <Path d={rightAnglePath} fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={1.2} />
        <Circle cx={A.x} cy={A.y} r={3} fill="#FFFFFF" />
        <Circle cx={B.x} cy={B.y} r={3} fill="#FFFFFF" />
        <Circle cx={C.x} cy={C.y} r={3} fill="#FFFFFF" />
        <SvgText x={A.x - 14} y={A.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">A</SvgText>
        <SvgText x={B.x + 6} y={B.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">B</SvgText>
        <SvgText x={C.x - 4} y={C.y - 6} fill="#FFFFFF" fontSize={12} fontWeight="bold">C</SvgText>
      </Svg>
      {params?.labelC && <View style={[styles.absoluteLabel, { left: midAC.x - 15, top: midAC.y }]}><FigLabel text={params.labelC} /></View>}
      {params?.labelB && <View style={[styles.absoluteLabel, { left: midAB.x - 15, top: midAB.y - 10 }]}><FigLabel text={params.labelB} /></View>}
      {params?.labelA && <View style={[styles.absoluteLabel, { left: midBC.x - 15, top: midBC.y - 10 }]}><FigLabel text={params.labelA} /></View>}
    </View>
  );
}

// 3. Isosceles Triangle Figure
function IsoscelesTriangleFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const pad = 24;
  const A = { x: pad, y: h - pad };
  const B = { x: w - pad, y: h - pad };
  const C = { x: w / 2, y: pad };

  // Calculate midpoints for equal side ticks
  const midAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const midBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };

  const d = `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Path d={d} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        {/* Tick marks for equal sides */}
        <Line x1={midAC.x - 4} y1={midAC.y + 2} x2={midAC.x + 4} y2={midAC.y - 2} stroke="#00e5ff" strokeWidth={2} />
        <Line x1={midBC.x - 4} y1={midBC.y - 2} x2={midBC.x + 4} y2={midBC.y + 2} stroke="#00e5ff" strokeWidth={2} />
        <Circle cx={A.x} cy={A.y} r={3} fill="#FFFFFF" />
        <Circle cx={B.x} cy={B.y} r={3} fill="#FFFFFF" />
        <Circle cx={C.x} cy={C.y} r={3} fill="#FFFFFF" />
        <SvgText x={A.x - 14} y={A.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">A</SvgText>
        <SvgText x={B.x + 6} y={B.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">B</SvgText>
        <SvgText x={C.x - 4} y={C.y - 6} fill="#FFFFFF" fontSize={12} fontWeight="bold">C</SvgText>
      </Svg>
      {params?.labelB && <View style={[styles.absoluteLabel, { left: w / 2 - 15, top: h - pad + 8 }]}><FigLabel text={params.labelB} /></View>}
      {params?.labelA && <View style={[styles.absoluteLabel, { left: midAC.x - 24, top: midAC.y - 12 }]}><FigLabel text={params.labelA} /></View>}
    </View>
  );
}

// 4. Equilateral Triangle Figure
function EquilateralTriangleFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const pad = 24;
  const A = { x: pad, y: h - pad };
  const B = { x: w - pad, y: h - pad };
  const C = { x: w / 2, y: pad + 8 };

  const midAB = { x: (A.x + B.x) / 2, y: A.y };
  const midAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const midBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };

  const d = `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Path d={d} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        {/* Ticks on 3 sides */}
        <Line x1={midAB.x} y1={midAB.y - 4} x2={midAB.x} y2={midAB.y + 4} stroke="#00e5ff" strokeWidth={2} />
        <Line x1={midAC.x - 4} y1={midAC.y + 2} x2={midAC.x + 4} y2={midAC.y - 2} stroke="#00e5ff" strokeWidth={2} />
        <Line x1={midBC.x - 4} y1={midBC.y - 2} x2={midBC.x + 4} y2={midBC.y + 2} stroke="#00e5ff" strokeWidth={2} />
        
        <Circle cx={A.x} cy={A.y} r={3} fill="#FFFFFF" />
        <Circle cx={B.x} cy={B.y} r={3} fill="#FFFFFF" />
        <Circle cx={C.x} cy={C.y} r={3} fill="#FFFFFF" />
        
        <SvgText x={A.x - 14} y={A.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">A</SvgText>
        <SvgText x={B.x + 6} y={B.y + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">B</SvgText>
        <SvgText x={C.x - 4} y={C.y - 6} fill="#FFFFFF" fontSize={12} fontWeight="bold">C</SvgText>
      </Svg>
      {params?.labelA && <View style={[styles.absoluteLabel, { left: midAB.x - 15, top: midAB.y + 6 }]}><FigLabel text={params.labelA} /></View>}
    </View>
  );
}

// 5. Circle Figure
function CircleFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const cx = w / 2;
  const cy = h / 2;
  const r = 50;
  const onCircle = { x: cx + r, y: cy };

  const label = params?.labelR || (params?.radius ? `R = ${params.radius}` : "R");

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Circle cx={cx} cy={cy} r={r} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        <Circle cx={cx} cy={cy} r={2.5} fill="#FFFFFF" />
        <Line x1={cx} y1={cy} x2={onCircle.x} y2={onCircle.y} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={1.5} strokeDasharray="4, 3" />
        <SvgText x={cx - 12} y={cy + 4} fill="#FFFFFF" fontSize={12} fontWeight="bold">O</SvgText>
      </Svg>
      <View style={[styles.absoluteLabel, { left: cx + r / 2 - 15, top: cy - 18 }]}><FigLabel text={label} /></View>
    </View>
  );
}

// 6. Circle with Chord
function CircleChordFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const cx = w / 2;
  const cy = h / 2;
  const r = 50;
  // chord endpoints
  const chordA = { x: cx - r * 0.8, y: cy - r * 0.6 };
  const chordB = { x: cx + r * 0.9, y: cy - r * 0.44 };
  const midChord = { x: (chordA.x + chordB.x) / 2, y: (chordA.y + chordB.y) / 2 };

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Circle cx={cx} cy={cy} r={r} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        <Line x1={chordA.x} y1={chordA.y} x2={chordB.x} y2={chordB.y} stroke="#ffcc00" strokeWidth={2} />
        <Line x1={cx} y1={cy} x2={midChord.x} y2={midChord.y} stroke="rgba(255, 255, 255, 0.5)" strokeWidth={1.5} strokeDasharray="4, 3" />
        <Circle cx={cx} cy={cy} r={2.5} fill="#FFFFFF" />
        <Circle cx={chordA.x} cy={chordA.y} r={2.5} fill="#ffcc00" />
        <Circle cx={chordB.x} cy={chordB.y} r={2.5} fill="#ffcc00" />
        <SvgText x={cx - 12} y={cy + 12} fill="#FFFFFF" fontSize={11} fontWeight="bold">O</SvgText>
      </Svg>
      {params?.labelR && <View style={[styles.absoluteLabel, { left: cx + r / 2, top: cy + r * 0.4 }]}><FigLabel text={params.labelR} /></View>}
      {params?.labelA && <View style={[styles.absoluteLabel, { left: midChord.x - 15, top: midChord.y - 18 }]}><FigLabel text={params.labelA} /></View>}
    </View>
  );
}

// 7. Pyramid Figure
function PyramidFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const pad = 24;
  const bx = w * 0.22;
  const by = h - pad - 10;
  const bw = w * 0.56;
  const bDepth = 18;
  const apex = { x: w / 2, y: pad };

  const bl = { x: bx, y: by };
  const br = { x: bx + bw, y: by };
  const tr = { x: bx + bw - bDepth, y: by - bDepth * 1.5 };
  const tl = { x: bx - bDepth, y: by - bDepth * 1.5 };
  const baseCenter = { x: (bl.x + br.x + tr.x + tl.x) / 4, y: (bl.y + br.y + tr.y + tl.y) / 4 };

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        {/* Dashed hidden edges */}
        <Line x1={tl.x} y1={tl.y} x2={bl.x} y2={bl.y} stroke="rgba(0, 230, 255, 0.4)" strokeWidth={1.2} strokeDasharray="4, 3" />
        <Line x1={tl.x} y1={tl.y} x2={tr.x} y2={tr.y} stroke="rgba(0, 230, 255, 0.4)" strokeWidth={1.2} strokeDasharray="4, 3" />
        <Line x1={tl.x} y1={tl.y} x2={apex.x} y2={apex.y} stroke="rgba(0, 230, 255, 0.4)" strokeWidth={1.2} strokeDasharray="4, 3" />
        <Line x1={apex.x} y1={apex.y} x2={baseCenter.x} y2={baseCenter.y} stroke="rgba(0, 230, 255, 0.4)" strokeWidth={1.2} strokeDasharray="4, 3" />

        {/* Visible faces fill & stroke */}
        <Path d={`M ${bl.x} ${bl.y} L ${br.x} ${br.y} L ${apex.x} ${apex.y} Z`} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={1.8} />
        <Path d={`M ${br.x} ${br.y} L ${tr.x} ${tr.y} L ${apex.x} ${apex.y} Z`} fill="rgba(0, 230, 255, 0.06)" stroke="rgba(0, 230, 255, 0.7)" strokeWidth={1.5} />

        <Circle cx={apex.x} cy={apex.y} r={2.5} fill="#FFFFFF" />
        <SvgText x={apex.x} y={apex.y - 6} fill="#FFFFFF" fontSize={11} fontWeight="bold" textAnchor="middle">S</SvgText>
      </Svg>
      {params?.labelH && <View style={[styles.absoluteLabel, { left: baseCenter.x + 10, top: (apex.y + baseCenter.y) / 2 - 10 }]}><FigLabel text={params.labelH} /></View>}
      {params?.labelA && <View style={[styles.absoluteLabel, { left: (bl.x + br.x) / 2 - 15, top: bl.y + 4 }]}><FigLabel text={params.labelA} /></View>}
    </View>
  );
}

// 8. Coordinate Line Figure
function CoordinateLineFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const ox = w / 2;
  const oy = h / 2;
  const scale = 24;

  const k = params?.slope ?? 1;
  const b = params?.intercept ?? 0;

  const x1 = -ox / scale;
  const x2 = ox / scale;
  const y1 = k * x1 + b;
  const y2 = k * x2 + b;

  const pt1 = { x: ox + x1 * scale, y: oy - y1 * scale };
  const pt2 = { x: ox + x2 * scale, y: oy - y2 * scale };

  const label = params?.labelLine || `y = ${k}x ${b >= 0 ? "+" : ""} ${b}`;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        {/* Axes */}
        <Line x1={0} y1={oy} x2={w} y2={oy} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={1.5} />
        <Line x1={ox} y1={0} x2={ox} y2={h} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={1.5} />
        {/* Function Line */}
        <Line x1={pt1.x} y1={pt1.y} x2={pt2.x} y2={pt2.y} stroke="#00e5ff" strokeWidth={2.5} />
      </Svg>
      <View style={[styles.absoluteLabel, { left: ox + 20, top: oy - 38 }]}><FigLabel text={label} /></View>
    </View>
  );
}

// 9. Coordinate Circle Figure
function CoordinateCircleFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const ox = w / 2;
  const oy = h / 2;
  const scale = 20;

  const cx = params?.centerX ?? 0;
  const cy = params?.centerY ?? 0;
  const r = params?.radius ?? 2;

  const screenCenter = { x: ox + cx * scale, y: oy - cy * scale };
  const screenR = r * scale;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Line x1={0} y1={oy} x2={w} y2={oy} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={1.5} />
        <Line x1={ox} y1={0} x2={ox} y2={h} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={1.5} />
        <Circle cx={screenCenter.x} cy={screenCenter.y} r={screenR} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        <Circle cx={screenCenter.x} cy={screenCenter.y} r={2.5} fill="#FFFFFF" />
      </Svg>
      <View style={[styles.absoluteLabel, { left: screenCenter.x - 20, top: screenCenter.y - 28 }]}><FigLabel text={`O(${cx};${cy})`} /></View>
      {params?.labelR && <View style={[styles.absoluteLabel, { left: screenCenter.x + screenR / 2, top: screenCenter.y }]}><FigLabel text={params.labelR} /></View>}
    </View>
  );
}

// 10. Rectangle Figure
function RectangleFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const pad = 24;
  const rw = w - pad * 2;
  const rh = h - pad * 2;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Path d={`M ${pad} ${pad} L ${pad + rw} ${pad} L ${pad + rw} ${pad + rh} L ${pad} ${pad + rh} Z`} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        <SvgText x={pad - 12} y={pad + 12} fill="#FFFFFF" fontSize={11} fontWeight="bold">D</SvgText>
        <SvgText x={pad + rw + 4} y={pad + 12} fill="#FFFFFF" fontSize={11} fontWeight="bold">C</SvgText>
        <SvgText x={pad + rw + 4} y={pad + rh} fill="#FFFFFF" fontSize={11} fontWeight="bold">B</SvgText>
        <SvgText x={pad - 12} y={pad + rh} fill="#FFFFFF" fontSize={11} fontWeight="bold">A</SvgText>
      </Svg>
      {params?.labelA && <View style={[styles.absoluteLabel, { left: pad + rw / 2 - 15, top: pad + rh + 4 }]}><FigLabel text={params.labelA} /></View>}
      {params?.labelB && <View style={[styles.absoluteLabel, { left: pad + rw + 4, top: pad + rh / 2 - 10 }]}><FigLabel text={params.labelB} /></View>}
    </View>
  );
}

// 11. Square Figure
function SquareFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const side = 70;
  const padX = (w - side) / 2;
  const padY = (h - side) / 2;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Path d={`M ${padX} ${padY} L ${padX + side} ${padY} L ${padX + side} ${padY + side} L ${padX} ${padY + side} Z`} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        <SvgText x={padX - 12} y={padY + 12} fill="#FFFFFF" fontSize={11} fontWeight="bold">D</SvgText>
        <SvgText x={padX + side + 4} y={padY + 12} fill="#FFFFFF" fontSize={11} fontWeight="bold">C</SvgText>
        <SvgText x={padX + side + 4} y={padY + side} fill="#FFFFFF" fontSize={11} fontWeight="bold">B</SvgText>
        <SvgText x={padX - 12} y={padY + side} fill="#FFFFFF" fontSize={11} fontWeight="bold">A</SvgText>
      </Svg>
      {params?.labelA && <View style={[styles.absoluteLabel, { left: w / 2 - 15, top: padY + side + 4 }]}><FigLabel text={params.labelA} /></View>}
    </View>
  );
}

// 12. Trapezoid Figure
function TrapezoidFigure({ params }: { params?: FigureParams }) {
  const w = 240;
  const h = 140;
  const pad = 24;
  const inset = 30;
  const A = { x: pad, y: h - pad };
  const B = { x: w - pad, y: h - pad };
  const C = { x: w - pad - inset, y: pad + 10 };
  const D = { x: pad + inset, y: pad + 10 };

  const d = `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} L ${D.x} ${D.y} Z`;

  return (
    <View style={styles.figWrapper}>
      <Svg width={w} height={h}>
        <Path d={d} fill="rgba(0, 230, 255, 0.08)" stroke="#00e5ff" strokeWidth={2} />
        <SvgText x={A.x - 14} y={A.y + 4} fill="#FFFFFF" fontSize={11} fontWeight="bold">A</SvgText>
        <SvgText x={B.x + 6} y={B.y + 4} fill="#FFFFFF" fontSize={11} fontWeight="bold">B</SvgText>
        <SvgText x={C.x + 6} y={C.y + 4} fill="#FFFFFF" fontSize={11} fontWeight="bold">C</SvgText>
        <SvgText x={D.x - 14} y={D.y + 4} fill="#FFFFFF" fontSize={11} fontWeight="bold">D</SvgText>
      </Svg>
      {params?.labelA && <View style={[styles.absoluteLabel, { left: (A.x + B.x) / 2 - 15, top: A.y + 6 }]}><FigLabel text={params.labelA} /></View>}
      {params?.labelB && <View style={[styles.absoluteLabel, { left: (D.x + C.x) / 2 - 15, top: D.y - 20 }]}><FigLabel text={params.labelB} /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 190,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  figWrapper: {
    width: 240,
    height: 140,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteLabel: {
    position: "absolute",
    pointerEvents: "none",
  },
  figLabelContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  figLabelText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
