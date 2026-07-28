import { ConnectedShapeStyle, ConnectedShapeColor } from "../types";

export interface NodePoint {
  x: number;
  y: number;
  symbol: "." | "-" | ":";
  label?: string;
}

export interface GeneratedGlyphGeometry {
  viewBox: string;
  pathD: string;
  secondaryPathD?: string;
  nodes: NodePoint[];
  dots: { x: number; y: number; r: number }[];
  junctions: { x: number; y: number }[];
  ring?: { cx: number; cy: number; r: number };
  badgePath?: string;
}

export function getColorThemeClasses(color: ConnectedShapeColor) {
  switch (color) {
    case "cyan":
      return {
        stroke: "#38bdf8", // sky-400
        fill: "#0284c7",
        glow: "rgba(56, 189, 248, 0.5)",
        badgeBorder: "border-sky-500/40",
        badgeBg: "bg-sky-950/30",
        textColor: "text-sky-300",
      };
    case "emerald":
      return {
        stroke: "#34d399", // emerald-400
        fill: "#059669",
        glow: "rgba(52, 211, 153, 0.5)",
        badgeBorder: "border-emerald-500/40",
        badgeBg: "bg-emerald-950/30",
        textColor: "text-emerald-300",
      };
    case "amethyst":
      return {
        stroke: "#c084fc", // purple-400
        fill: "#7e22ce",
        glow: "rgba(192, 132, 252, 0.5)",
        badgeBorder: "border-purple-500/40",
        badgeBg: "bg-purple-950/30",
        textColor: "text-purple-300",
      };
    case "monochrome":
      return {
        stroke: "#e2e8f0", // slate-200
        fill: "#64748b",
        glow: "rgba(226, 232, 240, 0.4)",
        badgeBorder: "border-slate-700",
        badgeBg: "bg-slate-900/60",
        textColor: "text-slate-200",
      };
    case "amber":
    default:
      return {
        stroke: "#fbbf24", // amber-400
        fill: "#d97706",
        glow: "rgba(251, 191, 36, 0.5)",
        badgeBorder: "border-amber-500/40",
        badgeBg: "bg-amber-950/30",
        textColor: "text-amber-300",
      };
  }
}

function getSymbolAnchor(
  sym: "." | "-" | ":",
  x: number,
  targetSym: "." | "-" | ":",
  _isRightTarget: boolean,
  _isPureTap: boolean = false
): { x: number; y: number } {
  if (sym === ".") {
    // Taps are always placed at y=72 baseline
    return { x, y: 72 };
  } else if (sym === ":") {
    // Bite (:):
    // Taps connect to Bites at the bottom (y=72)
    // Bites connect to Scratches/Bites at the top (y=28)
    if (targetSym === ".") {
      return { x, y: 72 };
    }
    return { x, y: 28 };
  } else if (sym === "-") {
    // Scratch (-) backslash path goes from (x - 12, 28) down to (x + 12, 72):
    // - Top tip at (x - 12, 28)
    // - Middle at (x, 50)
    // - Bottom tip at (x + 12, 72)
    if (targetSym === "-") {
      // Scratches connect to other Scratches at the midpoint (x, 50)
      return { x, y: 50 };
    } else if (targetSym === ".") {
      // Taps connect to the bottom tip of Scratch backslash at (x + 12, 72)
      return { x: x + 12, y: 72 };
    } else if (targetSym === ":") {
      // Bites connect to the top tip of Scratch backslash at (x - 12, 28)
      return { x: x - 12, y: 28 };
    }
    return { x, y: 50 };
  }
  return { x, y: 50 };
}

export function generateGlyphGeometry(
  glyphCode: string,
  style: ConnectedShapeStyle = "junction",
  _smoothness: number = 60
): GeneratedGlyphGeometry {
  const viewBox = "0 0 100 100";
  const validSymbols = glyphCode.replace(/[^.\-:]/g, "").split("") as ("." | "-" | ":")[];

  if (validSymbols.length === 0) {
    return { viewBox, pathD: "", nodes: [], dots: [], junctions: [] };
  }

  const mainPaths: string[] = [];
  const secondaryPaths: string[] = [];
  const nodes: NodePoint[] = [];
  const dots: { x: number; y: number; r: number }[] = [];
  const junctions: { x: number; y: number }[] = [];
  let ring: { cx: number; cy: number; r: number } | undefined;

  const N = validSymbols.length;
  const Y_MID = 50;
  const isPureTap = validSymbols.every((s) => s === ".");
  const Y_TAP = 72; // Taps are always placed at y=72 baseline
  const Y_BITE_TOP = 28;
  const Y_BITE_BOT = 72;

  // Single Symbol Cases (N = 1)
  if (N === 1) {
    const sym = validSymbols[0];
    if (sym === ".") {
      // A (Tap): Single hole punch dot with surrounding sigil ring
      dots.push({ x: 50, y: 72, r: 7 });
      ring = { cx: 50, cy: 72, r: 20 };
      nodes.push({ x: 50, y: 72, symbol: "." });
    } else if (sym === "-") {
      // I (Scratch): Full-height backslash \ with crossed forward slash /
      mainPaths.push("M 38 28 L 62 72");
      mainPaths.push("M 43 56 L 57 44");
      nodes.push({ x: 50, y: 50, symbol: "-" });
    } else if (sym === ":") {
      // U (Bite): Double punch dots with vertical bite stem
      dots.push({ x: 50, y: Y_BITE_TOP, r: 6 }, { x: 50, y: Y_BITE_BOT, r: 6 });
      mainPaths.push(`M 50 ${Y_BITE_TOP} L 50 ${Y_BITE_BOT}`);
      junctions.push({ x: 50, y: Y_MID });
      nodes.push({ x: 50, y: Y_MID, symbol: ":" });
    }
  } else {
    // Multi-symbol glyphs (N >= 2)
    const leftX = 22;
    const rightX = 78;
    const stepX = (rightX - leftX) / (N - 1);

    const xCoords: number[] = [];
    for (let i = 0; i < N; i++) {
      xCoords.push(leftX + i * stepX);
    }

    // Render individual symbols first
    for (let i = 0; i < N; i++) {
      const sym = validSymbols[i];
      const x = xCoords[i];

      if (sym === ".") {
        // Tap (.): Hole punch dot at Y_TAP (y=50 if pure tap, y=72 if mixed)
        dots.push({ x, y: Y_TAP, r: 5.5 });
        nodes.push({ x, y: Y_TAP, symbol: "." });
      } else if (sym === "-") {
        // Scratch (-): Full-height backslash \ (from y=28 to y=72)
        mainPaths.push(`M ${x - 12} ${Y_BITE_TOP} L ${x + 12} ${Y_BITE_BOT}`);

        // Draw crossed forward slash / only if this Scratch does NOT connect to another Scratch on either side
        const hasLeftScratch = i > 0 && validSymbols[i - 1] === "-";
        const hasRightScratch = i < N - 1 && validSymbols[i + 1] === "-";
        const hasScratchNeighbor = hasLeftScratch || hasRightScratch;

        if (!hasScratchNeighbor) {
          mainPaths.push(`M ${x - 7} 56 L ${x + 7} 44`);
        }

        nodes.push({ x, y: Y_MID, symbol: "-" });
      } else if (sym === ":") {
        // Bite (:): Vertical bite stem with double dots
        dots.push({ x, y: Y_BITE_TOP, r: 5 }, { x, y: Y_BITE_BOT, r: 5 });
        mainPaths.push(`M ${x} ${Y_BITE_TOP} L ${x} ${Y_BITE_BOT}`);
        junctions.push({ x, y: Y_MID });
        nodes.push({ x, y: Y_MID, symbol: ":" });
      }
    }

    // Connect adjacent symbols according to their literal anchor rules
    for (let i = 0; i < N - 1; i++) {
      const sym1 = validSymbols[i];
      const sym2 = validSymbols[i + 1];
      const x1 = xCoords[i];
      const x2 = xCoords[i + 1];

      const a1 = getSymbolAnchor(sym1, x1, sym2, true, isPureTap);
      const a2 = getSymbolAnchor(sym2, x2, sym1, false, isPureTap);

      mainPaths.push(`M ${a1.x} ${a1.y} L ${a2.x} ${a2.y}`);
    }
  }

  // Combine and deduplicate paths
  const pathD = Array.from(new Set(mainPaths)).join(" ");
  const secondaryPathD = Array.from(new Set(secondaryPaths)).join(" ");

  // Optional Badge frame geometry
  let badgePath: string | undefined;
  if (style === "runic" || style === "chiseled") {
    badgePath = "M 50 6 L 88 28 L 88 72 L 50 94 L 12 72 L 12 28 Z";
  }

  return {
    viewBox,
    pathD,
    secondaryPathD,
    nodes,
    dots,
    junctions,
    ring,
    badgePath,
  };
}
