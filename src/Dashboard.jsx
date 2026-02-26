import { useEffect, useMemo, useRef, useState } from "react";

const DASHBOARD_STORAGE_KEY = "concept-dock-dashboard-v2";
const DESIGN_STORAGE_KEY = "concept-dock-designs-v1";

const SHAPE_TYPES = [
  { id: "rounded-square", label: "Rounded Square", icon: "⬜" },
  { id: "square", label: "Square", icon: "🟦" },
  { id: "circle", label: "Circle", icon: "⭕" },
  { id: "post-it", label: "Sticky", icon: "📝" },
  { id: "arrow-right", label: "Arrow →", icon: "➡️" },
  { id: "arrow-left", label: "Arrow ←", icon: "⬅️" },
  { id: "line", label: "Line", icon: "—" },
  { id: "dotted-line", label: "Dotted", icon: "· · ·" },
];

const TEMPLATE_LIBRARY = [
  {
    id: "template-launch",
    name: "Product Launch Deck",
    type: "presentation",
    preview: "linear-gradient(120deg,#c9d6ff,#e2e2e2)",
    pages: [
      {
        name: "Intro",
        background: "#f3f4ff",
        elements: [
          { id: "t1", type: "text", x: 80, y: 90, w: 550, h: 80, text: "Launch Strategy", fontSize: 54, color: "#111827", fontWeight: 800 },
          { id: "t2", type: "text", x: 84, y: 190, w: 500, h: 40, text: "Q2 campaign and GTM planning", fontSize: 26, color: "#4b5563", fontWeight: 500 },
        ],
      },
    ],
  },
  {
    id: "template-social",
    name: "Social Promo",
    type: "social",
    preview: "linear-gradient(120deg,#f97316,#fb7185)",
    pages: [
      {
        name: "Post",
        background: "#fff7ed",
        elements: [
          { id: "s1", type: "shape", shape: "rounded", x: 70, y: 70, w: 720, h: 380, fill: "#fb923c", radius: 28 },
          { id: "s2", type: "text", x: 140, y: 190, w: 560, h: 80, text: "SALE 50% OFF", fontSize: 64, color: "#ffffff", fontWeight: 900 },
        ],
      },
    ],
  },
  {
    id: "template-business",
    name: "Business Proposal",
    type: "presentation",
    preview: "linear-gradient(120deg,#c7f9cc,#80ed99)",
    pages: [
      {
        name: "Cover",
        background: "#ecfdf5",
        elements: [
          { id: "b1", type: "text", x: 90, y: 120, w: 620, h: 70, text: "Business Proposal", fontSize: 52, color: "#064e3b", fontWeight: 800 },
          { id: "b2", type: "text", x: 95, y: 200, w: 620, h: 36, text: "Prepared for executive review", fontSize: 24, color: "#047857", fontWeight: 500 },
        ],
      },
    ],
  },
];

const ELEMENT_BUTTONS = [
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
];

const DASHBOARD_COLORS = ["#fde68a", "#bfdbfe", "#bbf7d0", "#fbcfe8", "#ddd6fe", "#fecaca"];

function getInitialDashboard() {
  return [
    { id: 1, type: "rounded-square", text: "Marketing deck", x: 120, y: 100, w: 240, h: 130, color: "#fde68a", enterLabel: "Enter", destinationType: "project", destinationValue: "marketing" },
    { id: 2, type: "circle", text: "Design Lab", x: 460, y: 80, w: 170, h: 170, color: "#bfdbfe", enterLabel: "Go", destinationType: "project", destinationValue: "design-lab" },
    { id: 3, type: "post-it", text: "Client\nBrand Kit", x: 740, y: 180, w: 200, h: 170, color: "#bbf7d0", enterLabel: "Edit", destinationType: "project", destinationValue: "brand" },
  ];
}

function loadDashboardState() {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!raw) return getInitialDashboard();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getInitialDashboard();
  } catch {
    return getInitialDashboard();
  }
}

function loadDesignState() {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function ShapeOutline({ shape }) {
  const base = { position: "absolute", inset: 0, background: shape.color, boxShadow: "0 8px 24px rgba(15, 23, 42, .12)" };
  if (shape.type === "circle") return <div style={{ ...base, borderRadius: "50%" }} />;
  if (shape.type === "square") return <div style={{ ...base, borderRadius: 8 }} />;
  if (shape.type === "post-it") {
    return (
      <>
        <div style={{ ...base, borderRadius: 10 }} />
        <div style={{ position: "absolute", top: -8, left: "50%", width: 34, height: 16, marginLeft: -17, borderRadius: 4, background: "rgba(0,0,0,.2)" }} />
      </>
    );
  }
  if (shape.type === "arrow-right") {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${shape.w} ${shape.h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <polygon points={`0,${shape.h * 0.2} ${shape.w * 0.72},${shape.h * 0.2} ${shape.w * 0.72},0 ${shape.w},${shape.h / 2} ${shape.w * 0.72},${shape.h} ${shape.w * 0.72},${shape.h * 0.8} 0,${shape.h * 0.8}`} fill={shape.color} />
      </svg>
    );
  }
  if (shape.type === "arrow-left") {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${shape.w} ${shape.h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <polygon points={`${shape.w},${shape.h * 0.2} ${shape.w * 0.28},${shape.h * 0.2} ${shape.w * 0.28},0 0,${shape.h / 2} ${shape.w * 0.28},${shape.h} ${shape.w * 0.28},${shape.h * 0.8} ${shape.w},${shape.h * 0.8}`} fill={shape.color} />
      </svg>
    );
  }
  if (shape.type === "line") return <div style={{ position: "absolute", top: 8, left: 0, right: 0, height: 4, background: shape.color }} />;
  if (shape.type === "dotted-line") return <div style={{ position: "absolute", top: 8, left: 0, right: 0, borderTop: `4px dotted ${shape.color}` }} />;
  return <div style={{ ...base, borderRadius: 20 }} />;
}

function DashboardShape({ shape, selected, onSelect, onUpdate, onDelete, onEnter }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    const move = (event) => {
      if (dragRef.current) {
        const { sx, sy, mx, my } = dragRef.current;
        onUpdate(shape.id, { x: sx + event.clientX - mx, y: sy + event.clientY - my });
      }
      if (resizeRef.current) {
        const { sw, sh, mx, my } = resizeRef.current;
        onUpdate(shape.id, { w: Math.max(100, sw + event.clientX - mx), h: Math.max(70, sh + event.clientY - my) });
      }
    };
    const stop = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
  }, [shape.id, onUpdate]);

  return (
    <div
      onMouseDown={(event) => {
        if (event.target.closest("button") || event.target.closest("input") || event.target.closest("textarea")) return;
        onSelect(shape.id);
        dragRef.current = { sx: shape.x, sy: shape.y, mx: event.clientX, my: event.clientY };
      }}
      style={{
        position: "absolute",
        left: shape.x,
        top: shape.y,
        width: shape.w,
        height: shape.type.includes("line") ? 20 : shape.h,
        cursor: "grab",
        border: selected ? "2px solid #2563eb" : "2px solid transparent",
        borderRadius: 16,
      }}
    >
      <ShapeOutline shape={shape} />
      {!shape.type.includes("line") && (
        <textarea
          value={shape.text}
          onChange={(event) => onUpdate(shape.id, { text: event.target.value })}
          style={{ position: "absolute", inset: 14, border: "none", resize: "none", background: "transparent", fontWeight: 700, fontSize: 18, textAlign: "center", outline: "none" }}
        />
      )}
      {!shape.type.includes("line") && (
        <button onClick={(event) => { event.stopPropagation(); onEnter(shape); }} style={{ position: "absolute", right: 10, bottom: 10, border: "none", background: "#111827", color: "white", borderRadius: 999, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
          {shape.enterLabel || "Enter"}
        </button>
      )}
      {selected && (
        <>
          <button onClick={(event) => { event.stopPropagation(); onDelete(shape.id); }} style={{ position: "absolute", top: -12, right: -12, width: 26, height: 26, borderRadius: "50%", border: "none", background: "#ef4444", color: "white", cursor: "pointer" }}>×</button>
          <div onMouseDown={(event) => { event.stopPropagation(); resizeRef.current = { sw: shape.w, sh: shape.h, mx: event.clientX, my: event.clientY }; }} style={{ position: "absolute", right: -6, bottom: -6, width: 16, height: 16, borderRadius: 3, background: "#2563eb", cursor: "nwse-resize" }} />
          <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, width: 260, boxShadow: "0 12px 24px rgba(2,6,23,.12)", zIndex: 20 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {DASHBOARD_COLORS.map((color) => (
                <button key={color} onClick={(event) => { event.stopPropagation(); onUpdate(shape.id, { color }); }} style={{ width: 20, height: 20, borderRadius: "50%", border: shape.color === color ? "2px solid #111827" : "1px solid #d1d5db", background: color, cursor: "pointer" }} />
              ))}
            </div>
            <label style={{ fontSize: 12, color: "#4b5563" }}>Enter button label</label>
            <input value={shape.enterLabel || ""} onChange={(event) => onUpdate(shape.id, { enterLabel: event.target.value })} style={{ width: "100%", marginTop: 4, marginBottom: 6, padding: "6px 8px", borderRadius: 8, border: "1px solid #d1d5db" }} />
            <label style={{ fontSize: 12, color: "#4b5563" }}>Destination type</label>
            <select value={shape.destinationType || "project"} onChange={(event) => onUpdate(shape.id, { destinationType: event.target.value })} style={{ width: "100%", marginTop: 4, marginBottom: 6, padding: "6px 8px", borderRadius: 8, border: "1px solid #d1d5db" }}>
              <option value="project">Project</option>
              <option value="design">Design</option>
              <option value="route">Route</option>
              <option value="url">External URL</option>
            </select>
            <input value={shape.destinationValue || ""} onChange={(event) => onUpdate(shape.id, { destinationValue: event.target.value })} placeholder="project slug / URL" style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid #d1d5db" }} />
          </div>
        </>
      )}
    </div>
  );
}

function makeBlankDesign(title = "Untitled design") {
  return {
    title,
    pages: [{ id: crypto.randomUUID(), name: "Page 1", background: "#ffffff", elements: [] }],
    activePageId: null,
    uploads: [],
  };
}

function cloneTemplate(template) {
  return {
    title: template.name,
    pages: template.pages.map((page, index) => ({
      id: crypto.randomUUID(),
      name: `${page.name || "Page"} ${index + 1}`,
      background: page.background,
      elements: page.elements.map((element) => ({ ...element, id: crypto.randomUUID() })),
    })),
    activePageId: null,
    uploads: [],
  };
}

function DesignWorkspace({ shape, model, onChange, onBack }) {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedElementId, setSelectedElementId] = useState(null);
  const dragRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [clipboardElement, setClipboardElement] = useState(null);

  const design = model ?? makeBlankDesign(shape.text || "Design");
  const activePageId = design.activePageId || design.pages[0]?.id;
  const page = design.pages.find((item) => item.id === activePageId) || design.pages[0];

  const updateDesign = (updater) => {
    const next = typeof updater === "function" ? updater(design) : updater;
    onChange({ ...next, activePageId: next.activePageId || next.pages[0]?.id });
  };

  useEffect(() => {
    const move = (event) => {
      if (!dragRef.current) return;
      const { elementId, sx, sy, mx, my } = dragRef.current;
      const dx = (event.clientX - mx) / (zoom / 100);
      const dy = (event.clientY - my) / (zoom / 100);
      updateDesign((current) => ({
        ...current,
        pages: current.pages.map((currentPage) => {
          if (currentPage.id !== activePageId) return currentPage;
          return {
            ...currentPage,
            elements: currentPage.elements.map((element) => (element.id === elementId ? { ...element, x: sx + dx, y: sy + dy } : element)),
          };
        }),
      }));
    };
    const stop = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId, zoom]);

  const addElement = (type, payload = {}) => {
    const base = { id: crypto.randomUUID(), x: 120, y: 110, w: 220, h: 100 };
    let element = { ...base, type: "shape", shape: "rounded", fill: "#60a5fa", radius: 16 };
    if (type === "text") element = { ...base, type: "text", text: "Add heading", fontSize: 42, color: "#111827", fontWeight: 700, w: 460, h: 70 };
    if (type === "circle") element = { ...base, type: "shape", shape: "circle", fill: "#a78bfa", w: 140, h: 140, radius: 999 };
    if (type === "line") element = { ...base, type: "shape", shape: "line", fill: "#334155", h: 4, w: 280 };
    if (type === "arrow") element = { ...base, type: "shape", shape: "arrow", fill: "#f97316", w: 260, h: 110 };
    if (type === "image") element = { ...base, type: "image", src: payload.src, w: 260, h: 180 };

    updateDesign((current) => ({
      ...current,
      pages: current.pages.map((item) => (item.id === activePageId ? { ...item, elements: [...item.elements, element] } : item)),
    }));
    setSelectedElementId(element.id);
  };

  const selectedElement = page?.elements.find((item) => item.id === selectedElementId);

  const updateSelected = (updates) => {
    if (!selectedElementId) return;
    updateDesign((current) => ({
      ...current,
      pages: current.pages.map((currentPage) => {
        if (currentPage.id !== activePageId) return currentPage;
        return {
          ...currentPage,
          elements: currentPage.elements.map((element) => (element.id === selectedElementId ? { ...element, ...updates } : element)),
        };
      }),
    }));
  };

  const removeSelectedElement = () => {
    if (!selectedElementId) return;
    updateDesign((current) => ({
      ...current,
      pages: current.pages.map((currentPage) =>
        currentPage.id === activePageId
          ? { ...currentPage, elements: currentPage.elements.filter((element) => element.id !== selectedElementId) }
          : currentPage
      ),
    }));
    setSelectedElementId(null);
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement) return;
    const duplicate = { ...selectedElement, id: crypto.randomUUID(), x: selectedElement.x + 18, y: selectedElement.y + 18 };
    updateDesign((current) => ({
      ...current,
      pages: current.pages.map((currentPage) =>
        currentPage.id === activePageId
          ? { ...currentPage, elements: [...currentPage.elements, duplicate] }
          : currentPage
      ),
    }));
    setSelectedElementId(duplicate.id);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCmd = event.metaKey || event.ctrlKey;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeSelectedElement();
      }

      if (!selectedElement) return;

      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        if (event.key === "ArrowUp") updateSelected({ y: selectedElement.y - step });
        if (event.key === "ArrowDown") updateSelected({ y: selectedElement.y + step });
        if (event.key === "ArrowLeft") updateSelected({ x: selectedElement.x - step });
        if (event.key === "ArrowRight") updateSelected({ x: selectedElement.x + step });
      }

      if (isCmd && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelectedElement();
      }

      if (isCmd && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setClipboardElement(selectedElement);
      }

      if (isCmd && event.key.toLowerCase() === "v" && clipboardElement) {
        event.preventDefault();
        const pasted = { ...clipboardElement, id: crypto.randomUUID(), x: clipboardElement.x + 24, y: clipboardElement.y + 24 };
        updateDesign((current) => ({
          ...current,
          pages: current.pages.map((currentPage) =>
            currentPage.id === activePageId
              ? { ...currentPage, elements: [...currentPage.elements, pasted] }
              : currentPage
          ),
        }));
        setSelectedElementId(pasted.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId, clipboardElement, selectedElement, selectedElementId]);

  const movePage = (direction) => {
    const index = design.pages.findIndex((currentPage) => currentPage.id === activePageId);
    if (index < 0) return;
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= design.pages.length) return;

    const nextPages = [...design.pages];
    const [current] = nextPages.splice(index, 1);
    nextPages.splice(targetIndex, 0, current);
    updateDesign({ ...design, pages: nextPages, activePageId });
  };

  const uploadAsset = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      updateDesign((current) => ({ ...current, uploads: [{ id: crypto.randomUUID(), name: file.name, src }, ...current.uploads] }));
      addElement("image", { src });
    };
    reader.readAsDataURL(file);
  };

  const exportPNG = () => {
    const canvas = document.createElement("canvas");
    const width = 960;
    const height = 540;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = page.background || "#fff";
    context.fillRect(0, 0, width, height);
    for (const element of page.elements) {
      if (element.type === "shape") {
        context.fillStyle = element.fill || "#0ea5e9";
        if (element.shape === "circle") {
          context.beginPath();
          context.ellipse(element.x + element.w / 2, element.y + element.h / 2, element.w / 2, element.h / 2, 0, 0, Math.PI * 2);
          context.fill();
        } else if (element.shape === "line") {
          context.fillRect(element.x, element.y, element.w, 4);
        } else if (element.shape === "arrow") {
          context.beginPath();
          context.moveTo(element.x, element.y + element.h * 0.2);
          context.lineTo(element.x + element.w * 0.72, element.y + element.h * 0.2);
          context.lineTo(element.x + element.w * 0.72, element.y);
          context.lineTo(element.x + element.w, element.y + element.h / 2);
          context.lineTo(element.x + element.w * 0.72, element.y + element.h);
          context.lineTo(element.x + element.w * 0.72, element.y + element.h * 0.8);
          context.lineTo(element.x, element.y + element.h * 0.8);
          context.closePath();
          context.fill();
        } else {
          context.beginPath();
          context.roundRect(element.x, element.y, element.w, element.h, element.radius || 16);
          context.fill();
        }
      }
      if (element.type === "text") {
        context.fillStyle = element.color || "#111827";
        context.font = `${element.fontWeight || 700} ${element.fontSize || 32}px Inter`;
        context.fillText(element.text || "Text", element.x, element.y + (element.fontSize || 32));
      }
    }
    const link = document.createElement("a");
    link.download = `${(design.title || "design").replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "grid", gridTemplateRows: "64px 1fr 114px", background: "#f1f5f9" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px", background: "linear-gradient(90deg,#06b6d4,#7c3aed)", color: "white" }}>
        <button onClick={onBack} style={{ border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.12)", color: "white", borderRadius: 10, padding: "8px 12px", cursor: "pointer" }}>← Dashboard</button>
        <input value={design.title} onChange={(event) => updateDesign({ ...design, title: event.target.value })} style={{ border: "none", borderRadius: 8, background: "rgba(255,255,255,.16)", color: "white", padding: "9px 12px", width: 280 }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} style={topBtn}>Download PDF</button>
          <button onClick={exportPNG} style={topBtn}>Download PNG</button>
          <button style={{ ...topBtn, background: "#111827" }}>Share</button>
          <button style={{ ...topBtn, background: "#4f46e5" }}>Present</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "284px 1fr" }}>
        <aside style={{ background: "white", borderRight: "1px solid #e2e8f0", overflow: "auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 12, borderBottom: "1px solid #e2e8f0" }}>
            {[
              ["templates", "Templates"],
              ["elements", "Elements"],
              ["text", "Text"],
              ["uploads", "Uploads"],
              ["projects", "Projects"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ border: "1px solid #d1d5db", background: activeTab === id ? "#ede9fe" : "#fff", borderRadius: 999, padding: "6px 10px", cursor: "pointer", fontWeight: 600 }}>{label}</button>
            ))}
          </div>

          {activeTab === "templates" && (
            <div style={{ padding: 12, display: "grid", gap: 10 }}>
              {TEMPLATE_LIBRARY.map((template) => (
                <button key={template.id} onClick={() => updateDesign(cloneTemplate(template))} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", textAlign: "left", background: "white", cursor: "pointer" }}>
                  <div style={{ height: 90, background: template.preview }} />
                  <div style={{ padding: 10, fontWeight: 700 }}>{template.name}</div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "elements" && (
            <div style={{ padding: 12, display: "grid", gap: 8 }}>
              {ELEMENT_BUTTONS.map((item) => (
                <button key={item.id} onClick={() => addElement(item.id)} style={sideBtn}>{item.label}</button>
              ))}
            </div>
          )}

          {activeTab === "text" && (
            <div style={{ padding: 12, display: "grid", gap: 8 }}>
              <button style={sideBtn} onClick={() => addElement("text")}>Add heading</button>
              <button style={sideBtn} onClick={() => addElement("text")}>Add subheading</button>
            </div>
          )}

          {activeTab === "uploads" && (
            <div style={{ padding: 12 }}>
              <label style={{ ...sideBtn, display: "block", textAlign: "center" }}>
                Upload image
                <input type="file" accept="image/*" hidden onChange={uploadAsset} />
              </label>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {design.uploads?.map((asset) => (
                  <button key={asset.id} onClick={() => addElement("image", { src: asset.src })} style={{ ...sideBtn, justifyContent: "flex-start" }}>{asset.name}</button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div style={{ padding: 12, color: "#475569" }}>
              <p style={{ marginTop: 0 }}>Connected from dashboard shape:</p>
              <b>{shape.text}</b>
              <p>Destination: {shape.destinationType} / {shape.destinationValue || "(none)"}</p>
            </div>
          )}
        </aside>

        <main style={{ position: "relative", overflow: "auto", padding: 30 }}>
          {selectedElement && (
            <div style={{ position: "sticky", top: 8, zIndex: 8, display: "flex", gap: 8, padding: 10, background: "white", border: "1px solid #e2e8f0", borderRadius: 12, width: "fit-content", marginBottom: 12 }}>
              {selectedElement.type !== "image" && (
                <input type="color" value={selectedElement.fill || selectedElement.color || "#111827"} onChange={(event) => updateSelected(selectedElement.type === "text" ? { color: event.target.value } : { fill: event.target.value })} />
              )}
              <button style={sideBtn} onClick={() => updateSelected({ x: selectedElement.x - 10 })}>←</button>
              <button style={sideBtn} onClick={() => updateSelected({ x: selectedElement.x + 10 })}>→</button>
              <button style={sideBtn} onClick={duplicateSelectedElement}>Duplicate</button>
              <button style={sideBtn} onClick={removeSelectedElement}>Delete</button>
            </div>
          )}

          <div style={{ margin: "0 auto", width: 960, height: 540, background: page.background || "white", boxShadow: "0 30px 60px rgba(2,6,23,.15)", position: "relative", transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
            {page.elements.map((element) => (
              <div
                key={element.id}
                onMouseDown={(event) => {
                  event.stopPropagation();
                  setSelectedElementId(element.id);
                  dragRef.current = { elementId: element.id, sx: element.x, sy: element.y, mx: event.clientX, my: event.clientY };
                }}
                onDoubleClick={() => setSelectedElementId(element.id)}
                style={{ position: "absolute", left: element.x, top: element.y, width: element.w, height: element.h, cursor: "move", outline: selectedElementId === element.id ? "2px solid #2563eb" : "none" }}
              >
                {element.type === "text" && (
                  <textarea
                    value={element.text}
                    onChange={(event) => {
                      if (selectedElementId !== element.id) return;
                      updateSelected({ text: event.target.value });
                    }}
                    style={{ width: "100%", height: "100%", border: "none", background: "transparent", outline: "none", resize: "none", fontSize: element.fontSize, color: element.color, fontWeight: element.fontWeight, lineHeight: 1.1 }}
                  />
                )}
                {element.type === "image" && <img src={element.src} alt="asset" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />}
                {element.type === "shape" && element.shape === "circle" && <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: element.fill }} />}
                {element.type === "shape" && element.shape === "line" && <div style={{ width: "100%", height: 4, marginTop: element.h / 2, background: element.fill }} />}
                {element.type === "shape" && element.shape === "arrow" && (
                  <svg width="100%" height="100%" viewBox={`0 0 ${element.w} ${element.h}`} preserveAspectRatio="none">
                    <polygon points={`0,${element.h * 0.2} ${element.w * 0.72},${element.h * 0.2} ${element.w * 0.72},0 ${element.w},${element.h / 2} ${element.w * 0.72},${element.h} ${element.w * 0.72},${element.h * 0.8} 0,${element.h * 0.8}`} fill={element.fill} />
                  </svg>
                )}
                {element.type === "shape" && element.shape === "rounded" && <div style={{ width: "100%", height: "100%", borderRadius: element.radius || 16, background: element.fill }} />}
              </div>
            ))}
          </div>

          <div style={{ position: "fixed", bottom: 132, right: 24, background: "white", borderRadius: 10, border: "1px solid #d1d5db", padding: 8, display: "flex", gap: 8 }}>
            <button style={sideBtn} onClick={() => setZoom((current) => Math.max(40, current - 10))}>-</button>
            <span style={{ alignSelf: "center", fontWeight: 600 }}>{zoom}%</span>
            <button style={sideBtn} onClick={() => setZoom((current) => Math.min(180, current + 10))}>+</button>
          </div>
        </main>
      </div>

      <footer style={{ background: "#e2e8f0", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", overflowX: "auto" }}>
        {design.pages.map((currentPage, index) => (
          <button key={currentPage.id} onClick={() => updateDesign({ ...design, activePageId: currentPage.id })} style={{ minWidth: 170, height: 84, borderRadius: 12, border: currentPage.id === activePageId ? "2px solid #4f46e5" : "1px solid #cbd5e1", background: "white", cursor: "pointer", textAlign: "left", padding: 8 }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Page {index + 1}</div>
            <div style={{ fontWeight: 700 }}>{currentPage.name}</div>
          </button>
        ))}
        <button onClick={() => movePage("left")} style={{ ...sideBtn, minWidth: 70, height: 84, justifyContent: "center" }}>←</button>
        <button onClick={() => movePage("right")} style={{ ...sideBtn, minWidth: 70, height: 84, justifyContent: "center" }}>→</button>
        <button onClick={() => updateDesign({ ...design, pages: [...design.pages, { id: crypto.randomUUID(), name: `Page ${design.pages.length + 1}`, background: "#ffffff", elements: [] }], activePageId })} style={{ ...sideBtn, minWidth: 120, height: 84, justifyContent: "center", fontSize: 24 }}>+</button>
        <button onClick={() => {
          if (!activePageId) return;
          const current = design.pages.find((p) => p.id === activePageId);
          if (!current) return;
          const duplicate = { ...current, id: crypto.randomUUID(), name: `${current.name} copy`, elements: current.elements.map((element) => ({ ...element, id: crypto.randomUUID(), x: element.x + 20, y: element.y + 20 })) };
          updateDesign({ ...design, pages: [...design.pages, duplicate] });
        }} style={{ ...sideBtn, minWidth: 130, height: 84, justifyContent: "center" }}>Duplicate</button>
      </footer>
    </div>
  );
}

const sideBtn = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#fff",
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const topBtn = {
  border: "none",
  borderRadius: 10,
  background: "rgba(255,255,255,.2)",
  color: "white",
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function Dashboard() {
  const [shapes, setShapes] = useState(loadDashboardState);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [designsByShape, setDesignsByShape] = useState(loadDesignState);

  const activeShape = useMemo(() => shapes.find((shape) => shape.id === activeShapeId), [activeShapeId, shapes]);

  useEffect(() => {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(shapes));
  }, [shapes]);

  useEffect(() => {
    localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(designsByShape));
  }, [designsByShape]);

  const updateShape = (id, updates) => {
    setShapes((current) => current.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape)));
  };

  if (activeShape) {
    const model = designsByShape[activeShape.id] || makeBlankDesign(activeShape.text || "Untitled design");
    return (
      <DesignWorkspace
        shape={activeShape}
        model={model}
        onBack={() => setActiveShapeId(null)}
        onChange={(next) => setDesignsByShape((current) => ({ ...current, [activeShape.id]: next }))}
      />
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: 14, left: 14, right: 14, zIndex: 30, background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <strong>Dashboard → Canva-style Design Spaces</strong>
        <div style={{ color: "#64748b" }}>Create shapes, customize Enter action, then enter a full template+elements editor.</div>
        <button
          onClick={() => {
            const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)].id;
            const id = Math.max(0, ...shapes.map((shape) => shape.id)) + 1;
            setShapes((current) => [
              ...current,
              { id, type, text: `New ${type}`, x: 120 + (current.length % 5) * 190, y: 180 + (current.length % 3) * 140, w: 220, h: 130, color: DASHBOARD_COLORS[id % DASHBOARD_COLORS.length], enterLabel: "Enter", destinationType: "project", destinationValue: `project-${id}` },
            ]);
          }}
          style={{ marginLeft: "auto", border: "none", borderRadius: 10, background: "#111827", color: "white", padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          + Add Shape
        </button>
      </div>

      <div style={{ position: "absolute", inset: 0, paddingTop: 76, backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "28px 28px" }} onMouseDown={() => setSelectedShapeId(null)}>
        {shapes.map((shape) => (
          <DashboardShape
            key={shape.id}
            shape={shape}
            selected={shape.id === selectedShapeId}
            onSelect={setSelectedShapeId}
            onUpdate={updateShape}
            onDelete={(id) => setShapes((current) => current.filter((shapeItem) => shapeItem.id !== id))}
            onEnter={(item) => {
              if (item.destinationType === "url" && /^https?:\/\//.test(item.destinationValue || "")) {
                window.open(item.destinationValue, "_blank", "noopener,noreferrer");
                return;
              }
              setActiveShapeId(item.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
