/* ─────────────────────────────────────────────────────────────
   Game Icons — roughjs hand-drawn style
   Every shape is rendered with roughjs so it looks genuinely
   sketched / hand-drawn while keeping the neo-brutalism palette.
   ───────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

interface IconProps {
  size?: number;
  className?: string;
}

/* ── Base: roughjs canvas-to-SVG renderer ────────────────────── */
type DrawFn = (rc: ReturnType<typeof rough.svg>, svg: SVGSVGElement) => void;

function RoughIcon({ size = 80, className = "", draw }: IconProps & { draw: DrawFn }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const rc = rough.svg(svg);
    drawRef.current(rc, svg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={{ overflow: "visible" }}
    />
  );
}

/* Shared roughjs options */
const base: Options = {
  roughness: 1.6,
  bowing: 1.2,
  strokeWidth: 3.5,
  stroke: "#111",
  fillStyle: "solid",
};

const bold: Options = { ...base, strokeWidth: 4.5 };

/* ── Balance Scale ────────────────────────────────────────────── */
export function IconScale({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // BASE — wide foot
      svg.appendChild(rc.rectangle(30, 104, 60, 10, { ...bold, fill: "#333", strokeWidth: 4 }));
      // POLE — vertical thick bar
      svg.appendChild(rc.rectangle(56, 22, 8, 84, { ...bold, fill: "#FFD600", strokeWidth: 3.5 }));
      // BEAM — horizontal bar (slightly tilted → left side up, right side down)
      svg.appendChild(rc.polygon([
        [14, 37], [106, 43], [106, 51], [14, 45]
      ], { ...bold, fill: "#FF8C00", strokeWidth: 4 }));
      // PIVOT — round knob at top of pole
      svg.appendChild(rc.circle(60, 24, 18, { ...bold, fill: "#FF8C00", strokeWidth: 4 }));
      // LEFT chain — two parallel lines from beam-end to pan
      svg.appendChild(rc.line(18, 46, 24, 64, { ...base, strokeWidth: 4 }));
      svg.appendChild(rc.line(28, 47, 34, 65, { ...base, strokeWidth: 4 }));
      // LEFT PAN — trapezoid bowl (up since left side lighter)
      svg.appendChild(rc.polygon([
        [10, 64], [40, 64], [36, 76], [14, 76]
      ], { ...bold, fill: "#FF1493", strokeWidth: 4 }));
      // RIGHT chain — from right beam-end to pan (lower, heavier)
      svg.appendChild(rc.line(92, 48, 84, 70, { ...base, strokeWidth: 4 }));
      svg.appendChild(rc.line(102, 49, 96, 71, { ...base, strokeWidth: 4 }));
      // RIGHT PAN — lower (heavier side)
      svg.appendChild(rc.polygon([
        [78, 70], [108, 70], [104, 82], [82, 82]
      ], { ...bold, fill: "#1E90FF", strokeWidth: 4 }));
      // STAR on top pivot
      const star = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      star.setAttribute("points", "60,4 62,12 70,12 64,17 66,25 60,20 54,25 56,17 50,12 58,12");
      star.setAttribute("fill", "#FFD600");
      star.setAttribute("stroke", "#111");
      star.setAttribute("stroke-width", "2");
      svg.appendChild(star);
    }} />
  );
}

/* ── Gavel ────────────────────────────────────────────────────── */
export function IconGavel({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // handle
      svg.appendChild(rc.line(22, 98, 68, 46, { ...base, strokeWidth: 12, stroke: "#FF8C00" }));
      svg.appendChild(rc.line(22, 98, 68, 46, { ...base, strokeWidth: 14 }));
      svg.appendChild(rc.line(22, 98, 68, 46, { ...base, strokeWidth: 10, stroke: "#FF8C00" }));
      // head
      svg.appendChild(rc.rectangle(54, 8, 46, 36, { ...bold, fill: "#FF1493", roughness: 1.4 }));
      // sound block
      svg.appendChild(rc.rectangle(8, 88, 44, 18, { ...bold, fill: "#FFD600" }));
    }} />
  );
}

/* ── Question Card ────────────────────────────────────────────── */
export function IconQuestion({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // card body
      svg.appendChild(rc.rectangle(14, 12, 92, 100, { ...bold, fill: "#7B2FFF", strokeWidth: 5 }));
      // corner stars (simple dots)
      svg.appendChild(rc.circle(26, 26, 8, { ...base, fill: "#FFD600", roughness: 0.8 }));
      svg.appendChild(rc.circle(94, 98, 8, { ...base, fill: "#FFD600", roughness: 0.8 }));
      // big ? text
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", "60");
      text.setAttribute("y", "90");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-family", "'Lalezar', Arial Black, sans-serif");
      text.setAttribute("font-size", "78");
      text.setAttribute("fill", "white");
      text.setAttribute("stroke", "#111");
      text.setAttribute("stroke-width", "3");
      text.setAttribute("paint-order", "stroke");
      text.textContent = "?";
      svg.appendChild(text);
    }} />
  );
}

/* ── Eye ──────────────────────────────────────────────────────── */
export function IconEye({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // eye white - almond shape using ellipse  
      svg.appendChild(rc.ellipse(60, 62, 100, 58, { ...bold, fill: "white", strokeWidth: 5 }));
      // iris
      svg.appendChild(rc.circle(60, 62, 46, { ...bold, fill: "#00C851" }));
      // pupil
      svg.appendChild(rc.circle(60, 62, 24, { ...base, fill: "#111", roughness: 0.5 }));
      // shine
      svg.appendChild(rc.circle(70, 52, 12, { ...base, fill: "white", stroke: "none", roughness: 0.4 }));
      // top lashes
      svg.appendChild(rc.line(18, 40, 10, 24, { ...base, strokeWidth: 4.5 }));
      svg.appendChild(rc.line(40, 28, 38, 10, { ...base, strokeWidth: 4.5 }));
      svg.appendChild(rc.line(66, 22, 68, 6,  { ...base, strokeWidth: 4.5 }));
      svg.appendChild(rc.line(90, 30, 100, 16, { ...base, strokeWidth: 4.5 }));
      // sparkle star (SVG path)
      const star = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      star.setAttribute("points", "104,16 106,8 108,16 116,18 108,20 106,28 104,20 96,18");
      star.setAttribute("fill", "#FFD600");
      star.setAttribute("stroke", "#111");
      star.setAttribute("stroke-width", "2");
      svg.appendChild(star);
    }} />
  );
}

/* ── Devil ────────────────────────────────────────────────────── */
export function IconDevil({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // LEFT horn — tall sharp triangle
      svg.appendChild(rc.polygon([[18,68],[6,10],[40,50]], { ...bold, fill: "#8B0000", strokeWidth: 5 }));
      // RIGHT horn
      svg.appendChild(rc.polygon([[102,68],[114,10],[80,50]], { ...bold, fill: "#8B0000", strokeWidth: 5 }));
      // wide oval face
      svg.appendChild(rc.ellipse(60, 74, 108, 90, { ...bold, fill: "#CC2200", strokeWidth: 5 }));
      // dark shadow under brows
      svg.appendChild(rc.ellipse(38, 60, 30, 14, { ...base, fill: "#991100", stroke: "none", roughness: 0.3 }));
      svg.appendChild(rc.ellipse(82, 60, 30, 14, { ...base, fill: "#991100", stroke: "none", roughness: 0.3 }));
      // angry V-brows (thick)
      svg.appendChild(rc.line(22, 52, 52, 62, { ...base, strokeWidth: 8 }));
      svg.appendChild(rc.line(68, 62, 98, 52, { ...base, strokeWidth: 8 }));
      // glowing yellow eyes
      svg.appendChild(rc.ellipse(38, 68, 28, 22, { ...bold, fill: "#FFD600", strokeWidth: 4 }));
      svg.appendChild(rc.ellipse(82, 68, 28, 22, { ...bold, fill: "#FFD600", strokeWidth: 4 }));
      // slit pupils
      svg.appendChild(rc.ellipse(38, 68, 8, 18, { ...base, fill: "#111", roughness: 0.4 }));
      svg.appendChild(rc.ellipse(82, 68, 8, 18, { ...base, fill: "#111", roughness: 0.4 }));
      // evil wide grin — open arc
      svg.appendChild(rc.arc(60, 90, 80, 36, 0, Math.PI, true, { ...bold, fill: "#111", strokeWidth: 5 }));
      // fang teeth
      svg.appendChild(rc.polygon([[30,90],[38,90],[34,106]], { ...base, fill: "white", roughness: 0.5 }));
      svg.appendChild(rc.polygon([[50,90],[58,90],[54,108]], { ...base, fill: "white", roughness: 0.5 }));
      svg.appendChild(rc.polygon([[62,90],[70,90],[66,108]], { ...base, fill: "white", roughness: 0.5 }));
      svg.appendChild(rc.polygon([[80,90],[90,90],[86,106]], { ...base, fill: "white", roughness: 0.5 }));
      // tail curl bottom-right
      svg.appendChild(rc.arc(100, 100, 30, 30, Math.PI, 0, false, { ...base, strokeWidth: 5, stroke: "#8B0000" }));
      svg.appendChild(rc.polygon([[114,100],[108,110],[120,108]], { ...bold, fill: "#CC2200" }));
    }} />
  );
}

/* ── Microphone ───────────────────────────────────────────────── */
export function IconMic({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // mic body
      svg.appendChild(rc.rectangle(34, 6, 52, 68, { ...bold, fill: "#FF1493", strokeWidth: 5, borderRadius: 26 } as Options));
      // actually use ellipse for rounded capsule top
      svg.appendChild(rc.ellipse(60, 32, 52, 52, { ...bold, fill: "#FF1493", strokeWidth: 5 }));
      svg.appendChild(rc.rectangle(34, 32, 52, 42, { ...bold, fill: "#FF1493", stroke: "none" }));
      svg.appendChild(rc.ellipse(60, 74, 52, 16, { ...bold, fill: "#FF1493", strokeWidth: 5 }));
      // grille lines
      svg.appendChild(rc.line(40, 38, 80, 38, { ...base, roughness: 0.8, strokeWidth: 3, stroke: "rgba(0,0,0,0.3)" }));
      svg.appendChild(rc.line(38, 50, 82, 50, { ...base, roughness: 0.8, strokeWidth: 3, stroke: "rgba(0,0,0,0.3)" }));
      svg.appendChild(rc.line(38, 62, 82, 62, { ...base, roughness: 0.8, strokeWidth: 3, stroke: "rgba(0,0,0,0.3)" }));
      // stand arc
      svg.appendChild(rc.arc(60, 74, 72, 64, 0, Math.PI, false, { ...bold, strokeWidth: 6 }));
      // pole
      svg.appendChild(rc.line(60, 106, 60, 116, { ...bold, strokeWidth: 6 }));
      // base
      svg.appendChild(rc.ellipse(60, 116, 52, 10, { ...base, fill: "#111" }));
      // sound waves
      svg.appendChild(rc.arc(100, 62, 20, 40, -0.6, 0.6, false, { ...base, stroke: "#FFD600", strokeWidth: 5 }));
      svg.appendChild(rc.arc(112, 62, 28, 56, -0.7, 0.7, false, { ...base, stroke: "#FFD600", strokeWidth: 4 }));
    }} />
  );
}

/* ── Target ───────────────────────────────────────────────────── */
export function IconTarget({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      svg.appendChild(rc.circle(60, 62, 108, { ...bold, fill: "#FF1493", strokeWidth: 5 }));
      svg.appendChild(rc.circle(60, 62, 76,  { ...bold, fill: "white", strokeWidth: 5 }));
      svg.appendChild(rc.circle(60, 62, 44,  { ...bold, fill: "#FF1493", strokeWidth: 4 }));
      svg.appendChild(rc.circle(60, 62, 16,  { ...bold, fill: "white", strokeWidth: 4 }));
      // arrow shaft
      svg.appendChild(rc.line(104, 14, 66, 56, { ...base, strokeWidth: 7, stroke: "#111" }));
      svg.appendChild(rc.line(104, 14, 66, 56, { ...base, strokeWidth: 5, stroke: "#FF8C00" }));
      // arrowhead
      svg.appendChild(rc.polygon([[60,60],[76,6],[108,10],[96,34],[80,52]], {
        ...bold, fill: "#FFD600", strokeWidth: 4
      }));
    }} />
  );
}

/* ── Laughing ─────────────────────────────────────────────────── */
export function IconLaugh({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // face
      svg.appendChild(rc.circle(60, 60, 108, { ...bold, fill: "#FFD600", strokeWidth: 5 }));
      // cheeks
      svg.appendChild(rc.ellipse(24, 76, 28, 18, { ...base, fill: "#FF6B9D", stroke: "none", roughness: 0.4 }));
      svg.appendChild(rc.ellipse(96, 76, 28, 18, { ...base, fill: "#FF6B9D", stroke: "none", roughness: 0.4 }));
      // closed X eyes
      svg.appendChild(rc.line(26, 40, 44, 56, { ...base, strokeWidth: 7 }));
      svg.appendChild(rc.line(44, 40, 26, 56, { ...base, strokeWidth: 7 }));
      svg.appendChild(rc.line(76, 40, 94, 56, { ...base, strokeWidth: 7 }));
      svg.appendChild(rc.line(94, 40, 76, 56, { ...base, strokeWidth: 7 }));
      // big mouth
      svg.appendChild(rc.arc(60, 72, 74, 52, 0, Math.PI, true, { ...bold, fill: "#111", strokeWidth: 4 }));
      // teeth strip
      svg.appendChild(rc.rectangle(30, 70, 60, 14, { ...base, fill: "white", stroke: "none", roughness: 0.4 }));
      // tongue
      svg.appendChild(rc.ellipse(60, 92, 36, 20, { ...base, fill: "#FF6B9D", strokeWidth: 3 }));
      // tears
      svg.appendChild(rc.circle(10, 72, 14, { ...base, fill: "#1E90FF", strokeWidth: 3.5 }));
      svg.appendChild(rc.circle(110, 72, 14, { ...base, fill: "#1E90FF", strokeWidth: 3.5 }));
    }} />
  );
}

/* ── Thinking ─────────────────────────────────────────────────── */
export function IconThinking({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // face
      svg.appendChild(rc.circle(58, 64, 100, { ...bold, fill: "#1E90FF", strokeWidth: 5 }));
      // cheeks
      svg.appendChild(rc.ellipse(26, 76, 22, 14, { ...base, fill: "#0060CC", stroke: "none", roughness: 0.3 }));
      svg.appendChild(rc.ellipse(82, 76, 22, 14, { ...base, fill: "#0060CC", stroke: "none", roughness: 0.3 }));
      // left eye (open)
      svg.appendChild(rc.circle(38, 56, 22, { ...bold, fill: "white" }));
      svg.appendChild(rc.circle(41, 56, 11, { ...base, fill: "#111", roughness: 0.5 }));
      svg.appendChild(rc.circle(44, 52, 5, { ...base, fill: "white", stroke: "none", roughness: 0.3 }));
      // right eye (squint line)
      svg.appendChild(rc.line(62, 54, 86, 54, { ...base, strokeWidth: 6.5 }));
      // brows raised
      svg.appendChild(rc.line(24, 42, 50, 38, { ...base, strokeWidth: 5.5 }));
      svg.appendChild(rc.line(64, 38, 90, 44, { ...base, strokeWidth: 5.5 }));
      // smirk
      svg.appendChild(rc.line(36, 78, 68, 74, { ...base, strokeWidth: 5.5 }));
      // hand under chin
      svg.appendChild(rc.line(80, 94, 100, 76, { ...base, strokeWidth: 6.5 }));
      svg.appendChild(rc.line(66, 96, 86, 96, { ...base, strokeWidth: 8 }));
      // thought bubbles
      svg.appendChild(rc.circle(92, 32, 11, { ...base, fill: "white", strokeWidth: 3.5 }));
      svg.appendChild(rc.circle(102, 20, 15, { ...base, fill: "white", strokeWidth: 3.5 }));
      svg.appendChild(rc.circle(114, 6,  20, { ...base, fill: "white", strokeWidth: 3.5 }));
    }} />
  );
}

/* ── Lock ─────────────────────────────────────────────────────── */
export function IconLock({ size = 64, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // shackle
      svg.appendChild(rc.arc(60, 40, 50, 60, Math.PI, 0, false, { ...base, strokeWidth: 12, stroke: "#FF8C00" }));
      svg.appendChild(rc.arc(60, 40, 50, 60, Math.PI, 0, false, { ...base, strokeWidth: 8 }));
      // body
      svg.appendChild(rc.rectangle(14, 50, 92, 62, { ...bold, fill: "#1E90FF", strokeWidth: 5 }));
      // keyhole ring
      svg.appendChild(rc.circle(60, 76, 26, { ...bold, fill: "#0055BB" }));
      svg.appendChild(rc.circle(60, 76, 13, { ...base, fill: "#111", roughness: 0.4 }));
      // keyhole slot
      svg.appendChild(rc.rectangle(55, 82, 10, 20, { ...base, fill: "#111", stroke: "none", roughness: 0.4 }));
    }} />
  );
}

/* ── Diamond ──────────────────────────────────────────────────── */
export function IconDiamond({ size = 36, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // BOTTOM pavilion — deep blue, comes to sharp point
      svg.appendChild(rc.polygon([[8,46],[112,46],[60,116]], { ...bold, fill: "#0060CC", strokeWidth: 4 }));
      // top-left facet
      svg.appendChild(rc.polygon([[8,46],[38,6],[60,46]], { ...bold, fill: "#64C8FF", strokeWidth: 3.5 }));
      // top-middle facet (crown)
      svg.appendChild(rc.polygon([[38,6],[82,6],[60,46]], { ...bold, fill: "#A8E4FF", strokeWidth: 3.5 }));
      // top-right facet
      svg.appendChild(rc.polygon([[82,6],[112,46],[60,46]], { ...bold, fill: "#1E90FF", strokeWidth: 3.5 }));
      // inner facet lines (cut pattern)
      svg.appendChild(rc.line(60, 46, 60, 116, { ...base, strokeWidth: 2.5, stroke: "#0040AA" }));
      svg.appendChild(rc.line(8, 46, 60, 80, { ...base, strokeWidth: 2, stroke: "#0040AA" }));
      svg.appendChild(rc.line(112, 46, 60, 80, { ...base, strokeWidth: 2, stroke: "#0040AA" }));
      // big sparkle top-right
      const sp = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      sp.setAttribute("points", "104,4 107,14 117,17 107,20 104,30 101,20 91,17 101,14");
      sp.setAttribute("fill", "white"); sp.setAttribute("stroke", "#AAD8FF"); sp.setAttribute("stroke-width", "1.5");
      svg.appendChild(sp);
      // small sparkle top-left
      const sp2 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      sp2.setAttribute("points", "14,8 16,14 22,16 16,18 14,24 12,18 6,16 12,14");
      sp2.setAttribute("fill", "white"); sp2.setAttribute("stroke", "#AAD8FF"); sp2.setAttribute("stroke-width", "1.5");
      svg.appendChild(sp2);
      // shine streak
      svg.appendChild(rc.line(42, 10, 54, 8, { ...base, stroke: "white", strokeWidth: 5, roughness: 0.5 }));
    }} />
  );
}

/* ── Controller ───────────────────────────────────────────────── */
export function IconController({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // body
      svg.appendChild(rc.ellipse(60, 66, 110, 66, { ...bold, fill: "#7B2FFF", strokeWidth: 5 }));
      // D-pad
      svg.appendChild(rc.rectangle(22, 52, 10, 28, { ...base, fill: "white", roughness: 0.7 }));
      svg.appendChild(rc.rectangle(14, 60, 26, 12, { ...base, fill: "white", roughness: 0.7 }));
      // buttons
      svg.appendChild(rc.circle(76, 54, 18, { ...base, fill: "#FF1493", roughness: 0.7 }));
      svg.appendChild(rc.circle(90, 66, 18, { ...base, fill: "#FFD600", roughness: 0.7 }));
      svg.appendChild(rc.circle(76, 78, 18, { ...base, fill: "#00C851", roughness: 0.7 }));
      svg.appendChild(rc.circle(62, 66, 18, { ...base, fill: "#1E90FF", roughness: 0.7 }));
    }} />
  );
}

/* ── Check ────────────────────────────────────────────────────── */
export function IconCheck({ size = 40, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      svg.appendChild(rc.circle(60, 60, 108, { ...bold, fill: "#00C851", strokeWidth: 5 }));
      svg.appendChild(rc.line(24, 62, 48, 88, { ...base, stroke: "white", strokeWidth: 13 }));
      svg.appendChild(rc.line(46, 88, 96, 30, { ...base, stroke: "white", strokeWidth: 13 }));
    }} />
  );
}

/* ── Home ─────────────────────────────────────────────────────── */
export function IconHome({ size = 36, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // roof
      svg.appendChild(rc.polygon([[10,56],[60,8],[110,56]], { ...bold, fill: "#FF1493", strokeWidth: 5 }));
      // wall
      svg.appendChild(rc.rectangle(22, 54, 76, 54, { ...bold, fill: "white", strokeWidth: 5 }));
      // door
      svg.appendChild(rc.rectangle(44, 70, 32, 38, { ...bold, fill: "#FF8C00", strokeWidth: 4.5 }));
      // window
      svg.appendChild(rc.rectangle(76, 66, 16, 16, { ...base, fill: "#1E90FF", strokeWidth: 4 }));
    }} />
  );
}

/* ── Repeat ───────────────────────────────────────────────────── */
export function IconRepeat({ size = 36, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      svg.appendChild(rc.arc(60, 60, 90, 90, Math.PI * 0.8, Math.PI * 2.2, false, { ...bold, strokeWidth: 9, stroke: "#111" }));
      svg.appendChild(rc.arc(60, 60, 90, 90, Math.PI * 0.8, Math.PI * 2.2, false, { ...bold, strokeWidth: 6, stroke: "#FFD600" }));
      svg.appendChild(rc.polygon([[100,16],[122,46],[88,50]], { ...bold, fill: "#FFD600" }));
      svg.appendChild(rc.arc(60, 60, 90, 90, Math.PI * 1.8, Math.PI * 0.2 + Math.PI, false, { ...bold, strokeWidth: 9, stroke: "#111" }));
      svg.appendChild(rc.arc(60, 60, 90, 90, Math.PI * 1.8, Math.PI * 0.2 + Math.PI, false, { ...bold, strokeWidth: 6, stroke: "#FFD600" }));
      svg.appendChild(rc.polygon([[20,104],[-2,74],[32,70]], { ...bold, fill: "#FFD600" }));
    }} />
  );
}

/* ── Vote ─────────────────────────────────────────────────────── */
export function IconVote({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon size={size} className={className} draw={(rc, svg) => {
      // box
      svg.appendChild(rc.rectangle(8, 48, 104, 64, { ...bold, fill: "#7B2FFF", strokeWidth: 5 }));
      // slot
      svg.appendChild(rc.rectangle(38, 42, 44, 12, { ...base, fill: "#111" }));
      // ballot paper
      svg.appendChild(rc.rectangle(38, 6, 44, 50, { ...bold, fill: "white", strokeWidth: 5 }));
      // check on ballot
      svg.appendChild(rc.line(48, 28, 54, 38, { ...base, stroke: "#00C851", strokeWidth: 6.5 }));
      svg.appendChild(rc.line(54, 38, 74, 16, { ...base, stroke: "#00C851", strokeWidth: 6.5 }));
      // stars
      const s1 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      s1.setAttribute("points", "26,80 28,72 30,80 38,82 30,84 28,92 26,84 18,82");
      s1.setAttribute("fill", "#FFD600"); s1.setAttribute("stroke", "#111"); s1.setAttribute("stroke-width", "2");
      const s2 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      s2.setAttribute("points", "90,80 92,72 94,80 102,82 94,84 92,92 90,84 82,82");
      s2.setAttribute("fill", "#FFD600"); s2.setAttribute("stroke", "#111"); s2.setAttribute("stroke-width", "2");
      svg.appendChild(s1); svg.appendChild(s2);
    }} />
  );
}

export function IconScroll({ size = 80, className = "" }: IconProps) {
  return <IconScale size={size} className={className} />;
}
