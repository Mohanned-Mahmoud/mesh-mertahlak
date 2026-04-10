import { useEffect, useRef } from "react";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

interface IconProps {
  size?: number;
  className?: string;
}

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

const base: Options = {
  roughness: 1.6,
  bowing: 1.2,
  strokeWidth: 3.5,
  stroke: "#111",
  fillStyle: "solid",
};

const bold: Options = { ...base, strokeWidth: 4.5 };

export function IconScale({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.rectangle(30, 104, 60, 10, { ...bold, fill: "#333", strokeWidth: 4 }));
        svg.appendChild(rc.rectangle(56, 22, 8, 84, { ...bold, fill: "#FFD600", strokeWidth: 3.5 }));
        svg.appendChild(
          rc.polygon(
            [
              [14, 37],
              [106, 43],
              [106, 51],
              [14, 45],
            ],
            { ...bold, fill: "#FF8C00", strokeWidth: 4 },
          ),
        );
        svg.appendChild(rc.circle(60, 24, 18, { ...bold, fill: "#FF8C00", strokeWidth: 4 }));
        svg.appendChild(rc.line(18, 46, 24, 64, { ...base, strokeWidth: 4 }));
        svg.appendChild(rc.line(28, 47, 34, 65, { ...base, strokeWidth: 4 }));
        svg.appendChild(
          rc.polygon(
            [
              [10, 64],
              [40, 64],
              [36, 76],
              [14, 76],
            ],
            { ...bold, fill: "#FF1493", strokeWidth: 4 },
          ),
        );
        svg.appendChild(rc.line(92, 48, 84, 70, { ...base, strokeWidth: 4 }));
        svg.appendChild(rc.line(102, 49, 96, 71, { ...base, strokeWidth: 4 }));
        svg.appendChild(
          rc.polygon(
            [
              [78, 70],
              [108, 70],
              [104, 82],
              [82, 82],
            ],
            { ...bold, fill: "#1E90FF", strokeWidth: 4 },
          ),
        );
      }}
    />
  );
}

export function IconGavel({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.line(22, 98, 68, 46, { ...base, strokeWidth: 12, stroke: "#FF8C00" }));
        svg.appendChild(rc.rectangle(54, 8, 46, 36, { ...bold, fill: "#FF1493", roughness: 1.4 }));
        svg.appendChild(rc.rectangle(8, 88, 44, 18, { ...bold, fill: "#FFD600" }));
      }}
    />
  );
}

export function IconQuestion({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.rectangle(14, 12, 92, 100, { ...bold, fill: "#7B2FFF", strokeWidth: 5 }));
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
      }}
    />
  );
}

export function IconEye({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.ellipse(60, 62, 100, 58, { ...bold, fill: "white", strokeWidth: 5 }));
        svg.appendChild(rc.circle(60, 62, 46, { ...bold, fill: "#00C851" }));
        svg.appendChild(rc.circle(60, 62, 24, { ...base, fill: "#111", roughness: 0.5 }));
      }}
    />
  );
}

export function IconDevil({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.ellipse(60, 74, 108, 90, { ...bold, fill: "#CC2200", strokeWidth: 5 }));
        svg.appendChild(rc.line(22, 52, 52, 62, { ...base, strokeWidth: 8 }));
        svg.appendChild(rc.line(68, 62, 98, 52, { ...base, strokeWidth: 8 }));
        svg.appendChild(rc.ellipse(38, 68, 28, 22, { ...bold, fill: "#FFD600", strokeWidth: 4 }));
        svg.appendChild(rc.ellipse(82, 68, 28, 22, { ...bold, fill: "#FFD600", strokeWidth: 4 }));
      }}
    />
  );
}

export function IconMic({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.ellipse(60, 32, 52, 52, { ...bold, fill: "#FF1493", strokeWidth: 5 }));
        svg.appendChild(rc.rectangle(34, 32, 52, 42, { ...bold, fill: "#FF1493", stroke: "none" }));
        svg.appendChild(rc.arc(60, 74, 72, 64, 0, Math.PI, false, { ...bold, strokeWidth: 6 }));
      }}
    />
  );
}

export function IconTarget({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.circle(60, 62, 108, { ...bold, fill: "#FF1493", strokeWidth: 5 }));
        svg.appendChild(rc.circle(60, 62, 76, { ...bold, fill: "white", strokeWidth: 5 }));
        svg.appendChild(rc.circle(60, 62, 44, { ...bold, fill: "#FF1493", strokeWidth: 4 }));
      }}
    />
  );
}

export function IconLaugh({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.circle(60, 60, 108, { ...bold, fill: "#FFD600", strokeWidth: 5 }));
        svg.appendChild(rc.arc(60, 72, 74, 52, 0, Math.PI, true, { ...bold, fill: "#111", strokeWidth: 4 }));
      }}
    />
  );
}

export function IconThinking({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.circle(58, 64, 100, { ...bold, fill: "#1E90FF", strokeWidth: 5 }));
        svg.appendChild(rc.circle(38, 56, 22, { ...bold, fill: "white" }));
        svg.appendChild(rc.line(62, 54, 86, 54, { ...base, strokeWidth: 6.5 }));
      }}
    />
  );
}

export function IconLock({ size = 64, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.arc(60, 40, 50, 60, Math.PI, 0, false, { ...base, strokeWidth: 12, stroke: "#FF8C00" }));
        svg.appendChild(rc.rectangle(14, 50, 92, 62, { ...bold, fill: "#1E90FF", strokeWidth: 5 }));
      }}
    />
  );
}

export function IconDiamond({ size = 36, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.polygon([[8, 46], [112, 46], [60, 116]], { ...bold, fill: "#0060CC", strokeWidth: 4 }));
        svg.appendChild(rc.polygon([[8, 46], [38, 6], [60, 46]], { ...bold, fill: "#64C8FF", strokeWidth: 3.5 }));
        svg.appendChild(rc.polygon([[38, 6], [82, 6], [60, 46]], { ...bold, fill: "#A8E4FF", strokeWidth: 3.5 }));
        svg.appendChild(rc.polygon([[82, 6], [112, 46], [60, 46]], { ...bold, fill: "#1E90FF", strokeWidth: 3.5 }));
      }}
    />
  );
}

export function IconController({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.ellipse(60, 66, 110, 66, { ...bold, fill: "#7B2FFF", strokeWidth: 5 }));
        svg.appendChild(rc.circle(76, 54, 18, { ...base, fill: "#FF1493", roughness: 0.7 }));
        svg.appendChild(rc.circle(90, 66, 18, { ...base, fill: "#FFD600", roughness: 0.7 }));
      }}
    />
  );
}

export function IconCheck({ size = 40, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.circle(60, 60, 108, { ...bold, fill: "#00C851", strokeWidth: 5 }));
        svg.appendChild(rc.line(24, 62, 48, 88, { ...base, stroke: "white", strokeWidth: 13 }));
        svg.appendChild(rc.line(46, 88, 96, 30, { ...base, stroke: "white", strokeWidth: 13 }));
      }}
    />
  );
}

export function IconHome({ size = 36, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.polygon([[10, 56], [60, 8], [110, 56]], { ...bold, fill: "#FF1493", strokeWidth: 5 }));
        svg.appendChild(rc.rectangle(22, 54, 76, 54, { ...bold, fill: "white", strokeWidth: 5 }));
      }}
    />
  );
}

export function IconRepeat({ size = 36, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.arc(60, 60, 90, 90, Math.PI * 0.8, Math.PI * 2.2, false, { ...bold, strokeWidth: 9, stroke: "#111" }));
      }}
    />
  );
}

export function IconVote({ size = 80, className = "" }: IconProps) {
  return (
    <RoughIcon
      size={size}
      className={className}
      draw={(rc, svg) => {
        svg.appendChild(rc.rectangle(8, 48, 104, 64, { ...bold, fill: "#7B2FFF", strokeWidth: 5 }));
        svg.appendChild(rc.rectangle(38, 6, 44, 50, { ...bold, fill: "white", strokeWidth: 5 }));
      }}
    />
  );
}
