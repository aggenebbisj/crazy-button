import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export type BgPattern = 'none' | 'stars' | 'confetti' | 'waves' | 'bubbles' | 'hearts' | 'sparkles' | 'galaxy';

interface Props {
  pattern: BgPattern;
  width: number;
  height: number;
}

export function BackgroundPattern({ pattern, width, height }: Props) {
  if (pattern === 'none') return null;

  if (pattern === 'stars') {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      const x = (i * 137 + 29) % width;
      const y = (i * 89 + 13) % height;
      const s = 3 + (i % 5) * 3;
      const colors = ['rgba(255,230,109,0.4)', 'rgba(255,255,255,0.35)', 'rgba(78,205,196,0.3)', 'rgba(168,85,247,0.3)', 'rgba(255,107,107,0.3)'];
      const d = `M${x},${y - s} L${x + s * 0.3},${y - s * 0.3} L${x + s},${y} L${x + s * 0.3},${y + s * 0.3} L${x},${y + s} L${x - s * 0.3},${y + s * 0.3} L${x - s},${y} L${x - s * 0.3},${y - s * 0.3}Z`;
      stars.push(<Path key={i} d={d} fill={colors[i % colors.length]} />);
    }
    return <Svg width={width} height={height} style={StyleSheet.absoluteFill}>{stars}</Svg>;
  }

  if (pattern === 'confetti') {
    const pieces = [];
    const colors = [
      'rgba(233,69,96,0.35)', 'rgba(78,205,196,0.35)', 'rgba(255,230,109,0.35)',
      'rgba(168,85,247,0.35)', 'rgba(6,214,160,0.35)', 'rgba(59,130,246,0.35)',
      'rgba(236,72,153,0.35)', 'rgba(249,115,22,0.35)',
    ];
    for (let i = 0; i < 60; i++) {
      const x = (i * 151 + 17) % width;
      const y = (i * 97 + 31) % height;
      const color = colors[i % colors.length];
      const angle = (i * 47) % 360;
      const w = 5 + (i % 3) * 4;
      const h = 10 + (i % 4) * 6;
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const points = [
        [-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2],
      ].map(([px, py]) => `${x + px * cos - py * sin},${y + px * sin + py * cos}`);
      pieces.push(<Path key={i} d={`M${points.join('L')}Z`} fill={color} />);
    }
    return <Svg width={width} height={height} style={StyleSheet.absoluteFill}>{pieces}</Svg>;
  }

  if (pattern === 'waves') {
    const waves = [];
    const colors = ['rgba(78,205,196,0.2)', 'rgba(59,130,246,0.15)', 'rgba(168,85,247,0.15)', 'rgba(6,214,160,0.2)'];
    for (let y = 30; y < height; y += 40) {
      const offset = (y * 0.5) % 30;
      let d = `M${-20 + offset},${y}`;
      for (let x = -20 + offset; x < width + 40; x += 50) {
        d += ` Q${x + 12},${y - 18} ${x + 25},${y} Q${x + 38},${y + 18} ${x + 50},${y}`;
      }
      waves.push(<Path key={y} d={d} stroke={colors[(y / 40 | 0) % colors.length]} strokeWidth={3} fill="none" />);
    }
    return <Svg width={width} height={height} style={StyleSheet.absoluteFill}>{waves}</Svg>;
  }

  if (pattern === 'bubbles') {
    const bubbles = [];
    const colors = [
      'rgba(78,205,196,0.2)', 'rgba(168,85,247,0.2)', 'rgba(59,130,246,0.2)',
      'rgba(236,72,153,0.15)', 'rgba(6,214,160,0.2)',
    ];
    for (let i = 0; i < 35; i++) {
      const x = (i * 137 + 41) % width;
      const y = (i * 89 + 23) % height;
      const r = 12 + (i % 6) * 12;
      const color = colors[i % colors.length];
      bubbles.push(
        <Circle key={`o-${i}`} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={2.5} />,
      );
      bubbles.push(
        <Circle key={`i-${i}`} cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.15} fill={`rgba(255,255,255,0.25)`} />,
      );
    }
    return <Svg width={width} height={height} style={StyleSheet.absoluteFill}>{bubbles}</Svg>;
  }

  if (pattern === 'hearts') {
    const hearts = [];
    const colors = [
      'rgba(233,69,96,0.3)', 'rgba(236,72,153,0.3)', 'rgba(168,85,247,0.25)',
      'rgba(255,107,107,0.3)', 'rgba(249,115,22,0.2)', 'rgba(255,230,109,0.2)',
    ];
    for (let i = 0; i < 30; i++) {
      const x = (i * 127 + 37) % width;
      const y = (i * 83 + 19) % height;
      const s = 8 + (i % 5) * 6;
      const color = colors[i % colors.length];
      const d = `M${x},${y + s * 0.3} C${x},${y - s * 0.5} ${x - s * 1.2},${y - s * 0.5} ${x - s * 1.2},${y + s * 0.1} C${x - s * 1.2},${y + s * 0.8} ${x},${y + s * 1.3} ${x},${y + s * 1.3} C${x},${y + s * 1.3} ${x + s * 1.2},${y + s * 0.8} ${x + s * 1.2},${y + s * 0.1} C${x + s * 1.2},${y - s * 0.5} ${x},${y - s * 0.5} ${x},${y + s * 0.3}Z`;
      hearts.push(<Path key={i} d={d} fill={color} />);
    }
    return <Svg width={width} height={height} style={StyleSheet.absoluteFill}>{hearts}</Svg>;
  }

  if (pattern === 'sparkles') {
    const sparkles = [];
    const colors = [
      'rgba(255,230,109,0.4)', 'rgba(255,255,255,0.3)', 'rgba(78,205,196,0.3)',
      'rgba(168,85,247,0.3)', 'rgba(6,214,160,0.3)', 'rgba(236,72,153,0.25)',
    ];
    for (let i = 0; i < 40; i++) {
      const x = (i * 149 + 23) % width;
      const y = (i * 79 + 41) % height;
      const s = 5 + (i % 5) * 5;
      const color = colors[i % colors.length];
      const d = `M${x},${y - s} L${x + s * 0.2},${y - s * 0.2} L${x + s},${y} L${x + s * 0.2},${y + s * 0.2} L${x},${y + s} L${x - s * 0.2},${y + s * 0.2} L${x - s},${y} L${x - s * 0.2},${y - s * 0.2}Z`;
      sparkles.push(<Path key={i} d={d} fill={color} />);
    }
    return <Svg width={width} height={height} style={StyleSheet.absoluteFill}>{sparkles}</Svg>;
  }

  if (pattern === 'galaxy') {
    const elements = [];
    // Colorful nebula clouds
    const nebulaColors = [
      'rgba(168,85,247,0.15)', 'rgba(59,130,246,0.12)', 'rgba(236,72,153,0.12)',
      'rgba(6,214,160,0.1)', 'rgba(233,69,96,0.1)', 'rgba(78,205,196,0.12)',
    ];
    for (let i = 0; i < 25; i++) {
      const x = (i * 163 + 47) % width;
      const y = (i * 101 + 29) % height;
      const r = 30 + (i % 5) * 20;
      elements.push(
        <Circle key={`n-${i}`} cx={x} cy={y} r={r} fill={nebulaColors[i % nebulaColors.length]} />,
      );
    }
    // Bright stars
    const starColors = ['rgba(255,255,255,0.5)', 'rgba(255,230,109,0.4)', 'rgba(78,205,196,0.35)'];
    for (let i = 0; i < 60; i++) {
      const x = (i * 113 + 7) % width;
      const y = (i * 67 + 11) % height;
      const r = 0.8 + (i % 4) * 0.8;
      elements.push(
        <Circle key={`s-${i}`} cx={x} cy={y} r={r} fill={starColors[i % starColors.length]} />,
      );
    }
    return <Svg width={width} height={height} style={StyleSheet.absoluteFill}>{elements}</Svg>;
  }

  return null;
}
