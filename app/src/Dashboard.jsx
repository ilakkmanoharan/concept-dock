import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "concept-dock-dashboard";

const SHAPE_TYPES = [
  { id: "rounded-square", label: "Rounded Square", icon: "⬜" },
  { id: "square", label: "Square", icon: "🟦" },
  { id: "circle", label: "Circle", icon: "⭕" },
  { id: "post-it", label: "Post-it Note", icon: "📝" },
  { id: "arrow-right", label: "Arrow Right", icon: "➡️" },
  { id: "arrow-left", label: "Arrow Left", icon: "⬅️" },
  { id: "arrow-up", label: "Arrow Up", icon: "⬆️" },
  { id: "arrow-down", label: "Arrow Down", icon: "⬇️" },
  { id: "arrow-block-right", label: "Block Arrow →", icon: "▶" },
  { id: "arrow-block-left", label: "Block Arrow ←", icon: "◀" },
  { id: "star", label: "Star Burst", icon: "⭐" },
  { id: "line", label: "Line", icon: "—" },
  { id: "dotted-line", label: "Dotted Line", icon: "· · ·" },
  { id: "parallelogram", label: "Parallelogram", icon: "▱" },
  { id: "hexagon", label: "Hexagon", icon: "⬡" },
];

const COLORS = [
  "#FFE566", "#FFB3BA", "#B3D9FF", "#B3FFD9", "#D9B3FF",
  "#FFDAB3", "#B3FFB3", "#FFB3FF", "#C8E6C9", "#FCE4EC",
  "#E3F2FD", "#FFF9C4", "#F3E5F5", "#E0F7FA", "#FBE9E7",
];

const ENTER_BUTTONS = {
  "rounded-square": { style: "teal-pill", label: "Open" },
  "square": { style: "blue-square", label: "→" },
  "circle": { style: "white-circle", label: "↗" },
  "post-it": { style: "pin", label: "📌" },
  "arrow-right": { style: "pulse", label: "Go" },
  "arrow-left": { style: "pulse", label: "Go" },
  "arrow-up": { style: "up-btn", label: "↑" },
  "arrow-down": { style: "down-btn", label: "↓" },
  "arrow-block-right": { style: "play-btn", label: "▶" },
  "arrow-block-left": { style: "play-btn", label: "◀" },
  "star": { style: "glow-star", label: "✦" },
  "line": { style: "dot-btn", label: "•" },
  "dotted-line": { style: "dot-btn", label: "•" },
  "parallelogram": { style: "slant-btn", label: "//→" },
  "hexagon": { style: "hex-btn", label: "⬡" },
};

let idCounter = 100;

const defaultShapes = [
  { id: 1, type: "rounded-square", x: 140, y: 30, w: 200, h: 90, color: "#FFE566", text: "Family Health", fontSize: 18 },
  { id: 2, type: "circle", x: 340, y: 100, w: 120, h: 120, color: "#FFE566", text: "Hello Doctor", fontSize: 16 },
  { id: 3, type: "rounded-square", x: 30, y: 80, w: 220, h: 200, color: "#C8E6C9", text: "Work Stuff", fontSize: 18 },
  { id: 4, type: "rounded-square", x: 230, y: 300, w: 220, h: 200, color: "#B3EDFF", text: "Personal Project1", fontSize: 18 },
  { id: 5, type: "rounded-square", x: 30, y: 460, w: 220, h: 130, color: "#B3D9FF", text: "Bookmarks", fontSize: 18 },
  { id: 6, type: "rounded-square", x: 540, y: 30, w: 220, h: 60, color: "#FFE566", text: "Work", fontSize: 18 },
  { id: 7, type: "rounded-square", x: 800, y: 30, w: 220, h: 260, color: "#FFB3BA", text: "Ideas\n1. Build a shopping cart\n2. Job search app", fontSize: 15 },
  { id: 8, type: "rounded-square", x: 1040, y: 30, w: 220, h: 260, color: "#B3D9FF", text: "To do\n1. Complete Task1, Task2\n2.", fontSize: 15 },
  { id: 9, type: "rounded-square", x: 800, y: 340, w: 200, h: 100, color: "#B3D9FF", text: "Human Psychology", fontSize: 16 },
  { id: 10, type: "rounded-square", x: 1020, y: 320, w: 220, h: 130, color: "#FFE566", text: "Kid school stuff", fontSize: 17 },
  { id: 11, type: "rounded-square", x: 1040, y: 510, w: 220, h: 110, color: "#B3D9FF", text: "Projects", fontSize: 18 },
  { id: 12, type: "star", x: 490, y: 530, w: 160, h: 160, color: "#FFE566", text: "Focus of the week", fontSize: 15 },
  { id: 13, type: "rounded-square", x: 700, y: 500, w: 220, h: 160, color: "#D9B3FF", text: "Study Cards", fontSize: 17 },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.idCounter != null) idCounter = data.idCounter;
    return {
      shapes: Array.isArray(data.shapes) ? data.shapes : null,
      canvasOffset: data.canvasOffset && typeof data.canvasOffset.x === "number" ? data.canvasOffset : null,
    };
  } catch {
    return null;
  }
}

function saveState(shapes, canvasOffset) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ shapes, canvasOffset, idCounter })
    );
  } catch (_) {}
}

function ShapeComponent({ shape, onUpdate, onDelete, onEnter, onSelect, isSelected }) {
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef(null);
  const resizeStart = useRef(null);
  const textRef = useRef(null);

  const btn = ENTER_BUTTONS[shape.type] || { style: "teal-pill", label: "Open" };

  const handleMouseDown = (e) => {
    if (e.target.closest(".enter-btn") || e.target.closest(".resize-handle") || e.target.closest("textarea") || e.target.closest(".shape-link-input")) return;
    e.preventDefault();
    onSelect(shape.id);
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: shape.x, sy: shape.y };
  };

  const handleResizeDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    resizeStart.current = { mx: e.clientX, my: e.clientY, sw: shape.w, sh: shape.h };
  };

  useEffect(() => {
    if (!dragging && !resizing) return;
    const move = (e) => {
      if (dragging && dragStart.current) {
        const dx = e.clientX - dragStart.current.mx;
        const dy = e.clientY - dragStart.current.my;
        onUpdate(shape.id, { x: dragStart.current.sx + dx, y: dragStart.current.sy + dy });
      }
      if (resizing && resizeStart.current) {
        const dx = e.clientX - resizeStart.current.mx;
        const dy = e.clientY - resizeStart.current.my;
        onUpdate(shape.id, {
          w: Math.max(80, resizeStart.current.sw + dx),
          h: Math.max(60, resizeStart.current.sh + dy),
        });
      }
    };
    const up = () => { setDragging(false); setResizing(false); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [dragging, resizing, shape.id, onUpdate]);

  return (
    <div
      style={{
        position: "absolute",
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.type === "line" || shape.type === "dotted-line" ? 20 : shape.h,
        cursor: dragging ? "grabbing" : "grab",
        zIndex: isSelected ? 100 : 10,
        filter: isSelected ? "drop-shadow(0 0 8px rgba(0,150,255,0.5))" : "none",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => { setEditing(true); setTimeout(() => textRef.current?.focus(), 50); }}
    >
      <ShapeOutline shape={shape} />

      {shape.type !== "line" && shape.type !== "dotted-line" && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: shape.type === "star" ? "30px" : shape.type.includes("arrow") ? "10px 20px" : "16px",
          pointerEvents: editing ? "auto" : "none",
          overflow: "hidden",
          ...getTextAlignment(shape.type),
        }}>
          {shape.imageUrl && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src={shape.imageUrl}
                alt=""
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}
          {editing ? (
            <textarea
              ref={textRef}
              value={shape.text}
              onChange={e => onUpdate(shape.id, { text: e.target.value })}
              onBlur={() => setEditing(false)}
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontFamily: "'Nunito', sans-serif",
                fontSize: shape.fontSize || 16,
                color: "#2c2c2c",
                textAlign: "center",
                zIndex: 2,
              }}
            />
          ) : (
            <p style={{
              margin: 0,
              fontFamily: "'Nunito', sans-serif",
              fontSize: shape.fontSize || 16,
              color: "#2c2c2c",
              whiteSpace: "pre-wrap",
              textAlign: "center",
              fontWeight: 600,
              lineHeight: 1.4,
              zIndex: 1,
              position: shape.imageUrl ? "relative" : undefined,
              background: shape.imageUrl ? "rgba(255,255,255,0.7)" : undefined,
              padding: shape.imageUrl ? "4px 8px" : undefined,
              borderRadius: shape.imageUrl ? 8 : undefined,
            }}>{shape.text || "Double-click to edit"}</p>
          )}
        </div>
      )}

      {shape.type !== "line" && shape.type !== "dotted-line" && (
        <EnterButton btnStyle={btn} onEnter={() => onEnter(shape)} />
      )}

      {isSelected && (
        <div
          className="resize-handle"
          onMouseDown={handleResizeDown}
          style={{
            position: "absolute",
            right: -6,
            bottom: -6,
            width: 16,
            height: 16,
            background: "#2563eb",
            borderRadius: 3,
            cursor: "nwse-resize",
            border: "2px solid white",
            zIndex: 200,
          }}
        />
      )}

      {isSelected && (
        <div
          onClick={(e) => { e.stopPropagation(); onDelete(shape.id); }}
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 22,
            height: 22,
            background: "#ef4444",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            zIndex: 200,
            border: "2px solid white",
          }}
        >×</div>
      )}

      {isSelected && shape.type !== "line" && shape.type !== "dotted-line" && (
        <div style={{
          position: "absolute",
          bottom: -44,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center",
          maxWidth: "90vw",
          background: "white",
          padding: "6px 8px",
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          zIndex: 200,
        }}>
          {COLORS.map(c => (
            <div key={c} onClick={(e) => { e.stopPropagation(); onUpdate(shape.id, { color: c }); }}
              style={{
                width: 18, height: 18, borderRadius: "50%", background: c, cursor: "pointer",
                border: shape.color === c ? "2px solid #2563eb" : "2px solid transparent",
                transition: "transform 0.1s",
              }}
              onMouseEnter={e => e.target.style.transform = "scale(1.3)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}
            />
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
            <button onClick={(e) => { e.stopPropagation(); onUpdate(shape.id, { fontSize: Math.max(10, (shape.fontSize || 16) - 2) }); }}
              style={{ border: "none", background: "#f0f0f0", borderRadius: 4, cursor: "pointer", padding: "0 4px", fontSize: 12, fontWeight: 700 }}>A-</button>
            <button onClick={(e) => { e.stopPropagation(); onUpdate(shape.id, { fontSize: Math.min(40, (shape.fontSize || 16) + 2) }); }}
              style={{ border: "none", background: "#f0f0f0", borderRadius: 4, cursor: "pointer", padding: "0 4px", fontSize: 12, fontWeight: 700 }}>A+</button>
          </div>
          <div className="shape-link-input" style={{ width: "100%", marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <input
              type="url"
              placeholder="Image URL"
              value={shape.imageUrl || ""}
              onChange={e => onUpdate(shape.id, { imageUrl: e.target.value || undefined })}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", minWidth: 140, padding: "4px 8px", fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb" }}
            />
            <input
              type="url"
              placeholder="Link URL (opens on Enter)"
              value={shape.linkUrl || ""}
              onChange={e => onUpdate(shape.id, { linkUrl: e.target.value || undefined })}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", minWidth: 140, padding: "4px 8px", fontSize: 11, borderRadius: 6, border: "1px solid #e5e7eb" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getTextAlignment(type) {
  if (type === "arrow-right" || type === "arrow-left" || type === "arrow-up" || type === "arrow-down") {
    return { justifyContent: "center", alignItems: "center" };
  }
  return {};
}

function ShapeOutline({ shape }) {
  const { type, w, h, color } = shape;
  const effectiveH = type === "line" || type === "dotted-line" ? 4 : h;

  if (type === "rounded-square") {
    return <div style={{ position: "absolute", inset: 0, background: color, borderRadius: 20, boxShadow: "4px 4px 12px rgba(0,0,0,0.1)" }} />;
  }
  if (type === "square") {
    return <div style={{ position: "absolute", inset: 0, background: color, borderRadius: 4, boxShadow: "4px 4px 12px rgba(0,0,0,0.1)" }} />;
  }
  if (type === "circle") {
    return <div style={{ position: "absolute", inset: 0, background: color, borderRadius: "50%", boxShadow: "4px 4px 12px rgba(0,0,0,0.1)" }} />;
  }
  if (type === "post-it") {
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: color, borderRadius: "2px 2px 12px 12px", boxShadow: "4px 4px 12px rgba(0,0,0,0.1)" }} />
        <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 30, height: 16, background: adjustColor(color, -30), borderRadius: 3 }} />
      </>
    );
  }
  if (type === "star") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} viewBox={`0 0 ${w} ${h}`}>
        <polygon points={starPoints(w / 2, h / 2, Math.min(w, h) / 2 - 5, Math.min(w, h) / 4, 12)} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "arrow-right") {
    const aw = w, ah = h, notch = ah * 0.25;
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${aw} ${ah}`} preserveAspectRatio="none">
        <polygon points={`0,${notch} ${aw * 0.7},${notch} ${aw * 0.7},0 ${aw},${ah / 2} ${aw * 0.7},${ah} ${aw * 0.7},${ah - notch} 0,${ah - notch}`} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "arrow-left") {
    const aw = w, ah = h, notch = ah * 0.25;
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${aw} ${ah}`} preserveAspectRatio="none">
        <polygon points={`${aw},${notch} ${aw * 0.3},${notch} ${aw * 0.3},0 0,${ah / 2} ${aw * 0.3},${ah} ${aw * 0.3},${ah - notch} ${aw},${ah - notch}`} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "arrow-up") {
    const aw = w, ah = h, notch = aw * 0.25;
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${aw} ${ah}`} preserveAspectRatio="none">
        <polygon points={`${notch},${ah} ${notch},${ah * 0.35} 0,${ah * 0.35} ${aw / 2},0 ${aw},${ah * 0.35} ${aw - notch},${ah * 0.35} ${aw - notch},${ah}`} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "arrow-down") {
    const aw = w, ah = h, notch = aw * 0.25;
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${aw} ${ah}`} preserveAspectRatio="none">
        <polygon points={`${notch},0 ${notch},${ah * 0.65} 0,${ah * 0.65} ${aw / 2},${ah} ${aw},${ah * 0.65} ${aw - notch},${ah * 0.65} ${aw - notch},0`} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "arrow-block-right") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polygon points={`0,0 ${w * 0.65},0 ${w},${h / 2} ${w * 0.65},${h} 0,${h}`} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "arrow-block-left") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polygon points={`${w},0 ${w * 0.35},0 0,${h / 2} ${w * 0.35},${h} ${w},${h}`} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "line") {
    return <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, background: color, transform: "translateY(-50%)", borderRadius: 2 }} />;
  }
  if (type === "dotted-line") {
    return <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, borderTop: `4px dashed ${color}`, transform: "translateY(-50%)" }} />;
  }
  if (type === "parallelogram") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polygon points={`${w * 0.2},0 ${w},0 ${w * 0.8},${h} 0,${h}`} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  if (type === "hexagon") {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 4;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox={`0 0 ${w} ${h}`}>
        <polygon points={pts} fill={color} style={{ filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.1))" }} />
      </svg>
    );
  }
  return <div style={{ position: "absolute", inset: 0, background: color, borderRadius: 12 }} />;
}

function EnterButton({ btnStyle, onEnter }) {
  const s = btnStyle.style;
  const buttonStyles = {
    "teal-pill": { position: "absolute", top: 8, right: 8, background: "#0d9488", color: "white", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "2px 2px 6px rgba(0,0,0,0.2)" },
    "blue-square": { position: "absolute", top: 8, right: 8, background: "#2563eb", color: "white", borderRadius: 6, width: 28, height: 28, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    "white-circle": { position: "absolute", top: 8, right: 8, background: "white", color: "#2563eb", borderRadius: "50%", width: 28, height: 28, fontSize: 14, fontWeight: 700, border: "2px solid #2563eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    "pin": { position: "absolute", top: -10, right: 10, background: "transparent", color: "#dc2626", fontSize: 22, border: "none", cursor: "pointer" },
    "pulse": { position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", color: "#1e40af", borderRadius: "50%", width: 30, height: 30, fontSize: 14, fontWeight: 700, border: "2px solid #1e40af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    "glow-star": { position: "absolute", top: 8, right: 8, background: "#fbbf24", color: "white", borderRadius: "50%", width: 28, height: 28, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 10px #fbbf24" },
    "dot-btn": { position: "absolute", top: -14, right: 0, background: "#6b7280", color: "white", borderRadius: "50%", width: 20, height: 20, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    "slant-btn": { position: "absolute", top: 6, right: 20, background: "#7c3aed", color: "white", borderRadius: 4, padding: "2px 10px", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
    "hex-btn": { position: "absolute", top: 6, right: 6, background: "#059669", color: "white", borderRadius: 4, width: 28, height: 28, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    "up-btn": { position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.85)", color: "#1d4ed8", borderRadius: 6, padding: "2px 10px", fontSize: 16, fontWeight: 700, border: "2px solid #1d4ed8", cursor: "pointer" },
    "down-btn": { position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.85)", color: "#1d4ed8", borderRadius: 6, padding: "2px 10px", fontSize: 16, fontWeight: 700, border: "2px solid #1d4ed8", cursor: "pointer" },
    "play-btn": { position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", color: "#1e40af", borderRadius: 4, width: 26, height: 26, fontSize: 12, fontWeight: 700, border: "2px solid #1e40af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  };
  const style = buttonStyles[s] || buttonStyles["teal-pill"];
  return (
    <button className="enter-btn" style={{ ...style, fontFamily: "'Nunito', sans-serif" }} onClick={(e) => { e.stopPropagation(); onEnter(); }} title="Open page">
      {btnStyle.label}
    </button>
  );
}

function starPoints(cx, cy, outerR, innerR, points) {
  const step = Math.PI / points;
  return Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [shapes, setShapes] = useState(() => {
    const saved = loadState();
    return saved?.shapes ?? defaultShapes;
  });
  const [selectedId, setSelectedId] = useState(null);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState(() => {
    const saved = loadState();
    return saved?.canvasOffset ?? { x: 0, y: 0 };
  });
  const [panning, setPanning] = useState(false);
  const panStart = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => saveState(shapes, canvasOffset), 300);
    return () => clearTimeout(t);
  }, [shapes, canvasOffset]);

  const handleCanvasMouseDown = (e) => {
    if (e.target !== canvasRef.current) return;
    setSelectedId(null);
    setShowShapePicker(false);
    setPanning(true);
    panStart.current = { mx: e.clientX, my: e.clientY, ox: canvasOffset.x, oy: canvasOffset.y };
  };

  useEffect(() => {
    if (!panning) return;
    const move = (e) => {
      if (panStart.current) {
        setCanvasOffset({ x: panStart.current.ox + e.clientX - panStart.current.mx, y: panStart.current.oy + e.clientY - panStart.current.my });
      }
    };
    const up = () => setPanning(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [panning]);

  const addShape = (type) => {
    idCounter++;
    const newShape = {
      id: idCounter,
      type,
      x: 200 - canvasOffset.x,
      y: 200 - canvasOffset.y,
      w: type === "circle" ? 140 : type === "line" || type === "dotted-line" ? 200 : 200,
      h: type === "circle" ? 140 : type === "star" ? 160 : type === "line" || type === "dotted-line" ? 20 : 120,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      text: type,
      fontSize: 16,
    };
    setShapes(prev => [...prev, newShape]);
    setShowShapePicker(false);
    setSelectedId(null); // don't auto-select new shape so the color palette dismisses
  };

  const updateShape = useCallback((id, updates) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteShape = useCallback((id) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    setSelectedId(null);
  }, []);

  const handleEnter = (shape) => {
    if (shape.linkUrl && (shape.linkUrl.startsWith("http://") || shape.linkUrl.startsWith("https://"))) {
      window.open(shape.linkUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const shapeName = shape.text?.split("\n")[0] || "Page";
    try {
      const saved = localStorage.getItem(`concept-dock-design-${shape.id}`);
      const hasDesign = saved && JSON.parse(saved)?.pages?.length > 0;
      if (hasDesign) {
        navigate("/design/editor", { state: { shapeId: shape.id, shapeName } });
      } else {
        navigate("/design", { state: { shapeId: shape.id, shapeName } });
      }
    } catch {
      navigate("/design", { state: { shapeId: shape.id, shapeName } });
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#fafafa", fontFamily: "'Nunito', sans-serif", backgroundImage: "radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)", backgroundSize: "32px 32px", cursor: panning ? "grabbing" : "default" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .enter-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .enter-btn:hover { transform: scale(1.12) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.25) !important; }
        .shape-picker-item { transition: transform 0.1s, background 0.1s; }
        .shape-picker-item:hover { transform: scale(1.05); background: #e0f2fe !important; }
      `}</style>

      <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 500, display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderRadius: 20, padding: "10px 20px", boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.8)" }}>
        <span style={{ fontWeight: 900, fontSize: 17, color: "#1a1a1a", letterSpacing: -0.5 }}>✦ Dashboard</span>
        <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
        <button onClick={() => { setShowShapePicker(!showShapePicker); setSelectedId(null); }} style={{ display: "flex", alignItems: "center", gap: 6, background: showShapePicker ? "#1a1a1a" : "#f3f4f6", color: showShapePicker ? "white" : "#374151", border: "none", borderRadius: 12, padding: "8px 16px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, transition: "all 0.15s" }}>
          <span style={{ fontSize: 18 }}>+</span> Add Shape
        </button>
        <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>Drag to pan · Double-click to edit · Click shape to select · Link/Image when selected</div>
      </div>

      {showShapePicker && (
        <div style={{ position: "fixed", top: 76, left: "50%", transform: "translateX(-50%)", zIndex: 500, background: "white", borderRadius: 20, padding: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", border: "1px solid #f0f0f0", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, maxWidth: 500 }}>
          <div style={{ gridColumn: "1 / -1", fontWeight: 800, fontSize: 13, color: "#6b7280", marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>Choose a Shape</div>
          {SHAPE_TYPES.map(st => (
            <div key={st.id} className="shape-picker-item" onClick={() => addShape(st.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", borderRadius: 12, cursor: "pointer", background: "#f9fafb", border: "2px solid transparent" }}>
              <span style={{ fontSize: 22 }}>{st.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textAlign: "center", lineHeight: 1.2 }}>{st.label}</span>
            </div>
          ))}
        </div>
      )}

      <div ref={canvasRef} onMouseDown={handleCanvasMouseDown} onClick={() => setShowShapePicker(false)} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`, width: 3000, height: 2000 }}>
          {shapes.map(shape => (
            <ShapeComponent key={shape.id} shape={shape} onUpdate={updateShape} onDelete={deleteShape} onEnter={handleEnter} onSelect={setSelectedId} isSelected={selectedId === shape.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
