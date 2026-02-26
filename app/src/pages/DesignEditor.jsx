import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_PREFIX = "concept-dock-design-";

function getStorageKey(shapeId) {
  return shapeId ? `${STORAGE_PREFIX}${shapeId}` : `${STORAGE_PREFIX}default`;
}

function loadDesign(shapeId) {
  try {
    const raw = localStorage.getItem(getStorageKey(shapeId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDesign(shapeId, design) {
  try {
    localStorage.setItem(getStorageKey(shapeId), JSON.stringify(design));
  } catch (_) {}
}

const ELEMENT_COLORS = ["#FFE566", "#FFB3BA", "#B3D9FF", "#B3FFD9", "#D9B3FF", "#94a3b8", "#f97316", "#22c55e"];
const QUICK_SHAPES = [
  { type: "rect", label: "Rectangle", icon: "▭" },
  { type: "circle", label: "Circle", icon: "●" },
  { type: "arrow", label: "Arrow", icon: "→" },
  { type: "star", label: "Star", icon: "★" },
];

let elementIdCounter = 1;

function createElement(type, x, y, w, h) {
  const id = elementIdCounter++;
  const color = ELEMENT_COLORS[Math.floor(Math.random() * ELEMENT_COLORS.length)];
  if (type === "text") {
    return { id, type: "text", x, y, w: Math.max(120, w), h: Math.max(40, h), text: "Text", fontSize: 18, color: "#1f2937" };
  }
  return { id, type, x, y, w: Math.max(40, w), h: Math.max(40, h), color };
}

function CanvasElement({ element, isSelected, onSelect, onUpdate, onDelete }) {
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const dragStart = useRef(null);

  const handlePointerDown = (e) => {
    if (e.target.closest(".editor-toolbar") || e.target.closest("input, textarea")) return;
    e.stopPropagation();
    onSelect(element.id);
    setDragging(true);
    dragStart.current = { x: e.clientX - element.x, y: e.clientY - element.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      onUpdate(element.id, { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, element.id, onUpdate]);

  const style = {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
    cursor: dragging ? "grabbing" : "grab",
    outline: isSelected ? "2px solid #7c3aed" : "none",
    outlineOffset: 2,
    zIndex: isSelected ? 20 : 10,
  };

  if (element.type === "rect") {
    return (
      <div
        style={{ ...style, background: element.color, borderRadius: 8 }}
        onPointerDown={handlePointerDown}
      />
    );
  }
  if (element.type === "circle") {
    return (
      <div
        style={{ ...style, background: element.color, borderRadius: "50%" }}
        onPointerDown={handlePointerDown}
      />
    );
  }
  if (element.type === "arrow") {
    return (
      <div
        style={{
          ...style,
          background: element.color,
          clipPath: "polygon(0% 30%, 70% 30%, 70% 0%, 100% 50%, 70% 100%, 70% 70%, 0% 70%)",
        }}
        onPointerDown={handlePointerDown}
      />
    );
  }
  if (element.type === "star") {
    return (
      <div
        style={{
          ...style,
          background: element.color,
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }}
        onPointerDown={handlePointerDown}
      />
    );
  }
  if (element.type === "text") {
    return (
      <div
        style={style}
        onPointerDown={handlePointerDown}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
      >
        {editing ? (
          <input
            autoFocus
            value={element.text}
            onChange={(e) => onUpdate(element.id, { text: e.target.value })}
            onBlur={() => setEditing(false)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: element.fontSize || 18,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              color: element.color || "#1f2937",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: element.fontSize || 18,
              fontWeight: 600,
              color: element.color || "#1f2937",
            }}
          >
            {element.text || "Text"}
          </span>
        )}
      </div>
    );
  }
  return null;
}

export default function DesignEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { shapeId, shapeName, width: initW, height: initH } = location.state || {};
  const canvasRef = useRef(null);

  const [design, setDesign] = useState(() => {
    const saved = loadDesign(shapeId);
    if (saved && saved.pages?.length) return saved;
    const w = initW || 800;
    const h = initH || 600;
    return {
      shapeId,
      title: shapeName || "Untitled design",
      pages: [{ id: "p1", width: w, height: h, elements: [] }],
      nextElementId: 1,
    };
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [sidebarPanel, setSidebarPanel] = useState("elements"); // elements | templates | text | uploads
  const [zoom, setZoom] = useState(0.8);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pageIndex = Math.min(currentPageIndex, Math.max(0, design.pages.length - 1));
  const page = design.pages[pageIndex] ?? design.pages[0];
  const elements = page?.elements || [];

  useEffect(() => {
    if (currentPageIndex >= design.pages.length && design.pages.length > 0) {
      setCurrentPageIndex(design.pages.length - 1);
    }
  }, [design.pages.length, currentPageIndex]);

  const pushHistory = useCallback((nextDesign) => {
    setHistory((prev) => prev.slice(0, historyIndex + 1).concat([JSON.stringify(nextDesign)]));
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  useEffect(() => {
    const t = setTimeout(() => saveDesign(shapeId, design), 500);
    return () => clearTimeout(t);
  }, [design, shapeId]);

  const addElement = useCallback(
    (type, defaultW = 120, defaultH = 60) => {
      if (!page) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      const cx = rect ? rect.width / 2 : 400;
      const cy = rect ? rect.height / 2 : 300;
      const x = cx - defaultW / 2 + (Math.random() * 80 - 40);
      const y = cy - defaultH / 2 + (Math.random() * 80 - 40);
      const el = createElement(type, Math.max(0, x), Math.max(0, y), defaultW, defaultH);
      const nextPages = design.pages.map((p, i) =>
        i === pageIndex ? { ...p, elements: [...p.elements, el] } : p
      );
      const nextDesign = { ...design, pages: nextPages };
      setDesign(nextDesign);
      pushHistory(nextDesign);
      setSelectedElementId(el.id);
    },
    [design, pageIndex, page, pushHistory]
  );

  const updateElement = useCallback(
    (id, updates) => {
      const nextPages = design.pages.map((p, i) =>
        i === pageIndex
          ? { ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)) }
          : p
      );
      setDesign((d) => ({ ...d, pages: nextPages }));
    },
    [design, pageIndex]
  );

  const deleteElement = useCallback(() => {
    if (selectedElementId == null) return;
    const nextPages = design.pages.map((p, i) =>
      i === pageIndex ? { ...p, elements: p.elements.filter((e) => e.id !== selectedElementId) } : p
    );
    const nextDesign = { ...design, pages: nextPages };
    setDesign(nextDesign);
    pushHistory(nextDesign);
    setSelectedElementId(null);
  }, [design, pageIndex, selectedElementId, pushHistory]);

  const duplicateElement = useCallback(() => {
    if (selectedElementId == null) return;
    const el = elements.find((e) => e.id === selectedElementId);
    if (!el) return;
    const newEl = { ...el, id: ++elementIdCounter, x: el.x + 20, y: el.y + 20 };
    const nextPages = design.pages.map((p, i) =>
      i === pageIndex ? { ...p, elements: [...p.elements, newEl] } : p
    );
    setDesign((d) => ({ ...d, pages: nextPages }));
    setSelectedElementId(newEl.id);
  }, [design, pageIndex, elements, selectedElementId]);

  const addPage = useCallback(() => {
    const w = page?.width || 800;
    const h = page?.height || 600;
    const newPage = { id: `p${Date.now()}`, width: w, height: h, elements: [] };
    setDesign((d) => ({ ...d, pages: [...d.pages, newPage] }));
    setCurrentPageIndex(design.pages.length);
  }, [design.pages.length, page]);

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1 && history.length > 0;
  const handleUndo = () => {
    if (!canUndo) return;
    const prev = JSON.parse(history[historyIndex - 1]);
    setDesign(prev);
    setHistoryIndex((i) => i - 1);
  };
  const handleRedo = () => {
    if (!canRedo) return;
    const next = JSON.parse(history[historyIndex + 1]);
    setDesign(next);
    setHistoryIndex((i) => i + 1);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');`}</style>

      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 20px",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 14px",
            background: "#f3f4f6",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          ← Dashboard
        </button>
        <button onClick={handleUndo} disabled={!canUndo} style={{ padding: "8px", border: "none", background: "transparent", cursor: canUndo ? "pointer" : "not-allowed", opacity: canUndo ? 1 : 0.4 }}>
          ↩ Undo
        </button>
        <button onClick={handleRedo} disabled={!canRedo} style={{ padding: "8px", border: "none", background: "transparent", cursor: canRedo ? "pointer" : "not-allowed", opacity: canRedo ? 1 : 0.4 }}>
          ↪ Redo
        </button>
        <span style={{ flex: 1, fontWeight: 800, fontSize: 16, color: "#1f2937" }}>{design.title}</span>
        <button
          onClick={() => saveDesign(shapeId, design)}
          style={{
            padding: "8px 18px",
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Save
        </button>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Left sidebar */}
        <aside
          style={{
            width: 280,
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", display: "flex", gap: 4 }}>
            {["elements", "templates", "text", "uploads"].map((p) => (
              <button
                key={p}
                onClick={() => setSidebarPanel(p)}
                style={{
                  padding: "8px 12px",
                  background: sidebarPanel === p ? "#ede9fe" : "transparent",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "capitalize",
                  cursor: "pointer",
                  color: sidebarPanel === p ? "#6d28d9" : "#6b7280",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            {sidebarPanel === "elements" && (
              <>
                <input
                  type="text"
                  placeholder="Search elements"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                />
                <p style={{ fontWeight: 700, fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Quick shapes</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {QUICK_SHAPES.map((s) => (
                    <button
                      key={s.type}
                      onClick={() => addElement(s.type, 100, 80)}
                      style={{
                        padding: "12px 16px",
                        background: "#f3f4f6",
                        border: "2px solid transparent",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontWeight: 700, fontSize: 12, color: "#6b7280", margin: "16px 0 8px" }}>Browse categories</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["Shapes", "Graphics", "Photos", "Videos"].map((cat) => (
                    <div
                      key={cat}
                      style={{
                        padding: 12,
                        background: "#f9fafb",
                        borderRadius: 8,
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </>
            )}
            {sidebarPanel === "text" && (
              <>
                <button
                  onClick={() => addElement("text", 200, 48)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Add heading
                </button>
                <button
                  onClick={() => addElement("text", 280, 60)}
                  style={{
                    width: "100%",
                    marginTop: 8,
                    padding: "12px",
                    background: "#e9d5ff",
                    color: "#6d28d9",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Add body text
                </button>
              </>
            )}
            {sidebarPanel === "templates" && (
              <p style={{ color: "#6b7280", fontSize: 14 }}>Browse templates to add to this page. (Coming soon)</p>
            )}
            {sidebarPanel === "uploads" && (
              <p style={{ color: "#6b7280", fontSize: 14 }}>Upload images to use on the canvas. (Coming soon)</p>
            )}
          </div>
        </aside>

        {/* Canvas area */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            background: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            ref={canvasRef}
            style={{
              width: page?.width || 800,
              height: page?.height || 600,
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              background: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              position: "relative",
              flexShrink: 0,
            }}
            onClick={() => setSelectedElementId(null)}
          >
            {elements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                isSelected={el.id === selectedElementId}
                onSelect={setSelectedElementId}
                onUpdate={updateElement}
                onDelete={deleteElement}
              />
            ))}
          </div>
        </div>

        {/* Contextual toolbar (when element selected) */}
        {selectedElement && (
          <div
            className="editor-toolbar"
            style={{
              position: "absolute",
              top: 60,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              border: "1px solid #e5e7eb",
              zIndex: 100,
            }}
          >
            {ELEMENT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateElement(selectedElement.id, { color: c })}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: c,
                  border: selectedElement.color === c ? "2px solid #1f2937" : "2px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
            <button onClick={duplicateElement} style={{ padding: "6px 12px", border: "none", background: "#f3f4f6", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
              Duplicate
            </button>
            <button onClick={deleteElement} style={{ padding: "6px 12px", border: "none", background: "#fee2e2", color: "#dc2626", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "8px 20px",
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {design.pages.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrentPageIndex(i)}
              style={{
                width: 80,
                height: 48,
                padding: 0,
                background: currentPageIndex === i ? "#ede9fe" : "#f3f4f6",
                border: currentPageIndex === i ? "2px solid #7c3aed" : "2px solid transparent",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
              }}
            >
              Page {i + 1}
            </button>
          ))}
          <button
            onClick={addPage}
            style={{
              width: 48,
              height: 48,
              background: "#f3f4f6",
              border: "2px dashed #9ca3af",
              borderRadius: 6,
              fontSize: 24,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            +
          </button>
        </div>
        <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>
          Pages {currentPageIndex + 1}/{design.pages.length}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min="0.25"
            max="1.5"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#374151", minWidth: 40 }}>{Math.round(zoom * 100)}%</span>
        </div>
      </footer>
    </div>
  );
}
