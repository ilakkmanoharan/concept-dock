import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DESIGN_FORMATS = [
  { id: "presentation", name: "Presentation", width: 1920, height: 1080, icon: "📊" },
  { id: "website", name: "Website", width: 1200, height: 800, icon: "🌐" },
  { id: "logo", name: "Logo", width: 400, height: 400, icon: "✨" },
  { id: "whiteboard", name: "Whiteboard", width: 1600, height: 900, icon: "📋" },
  { id: "business", name: "Business", width: 1000, height: 600, icon: "💼" },
  { id: "business-card", name: "Business Card (Landscape)", width: 1050, height: 600, icon: "📇" },
  { id: "instagram-post", name: "Instagram Post (4:5)", width: 1080, height: 1350, icon: "📷" },
  { id: "facebook-cover", name: "Facebook Cover", width: 820, height: 312, icon: "📘" },
  { id: "youtube-banner", name: "YouTube Banner", width: 2560, height: 1440, icon: "▶️" },
  { id: "poster", name: "Poster", width: 800, height: 1200, icon: "🖼️" },
];

const NAV_ITEMS = [
  { id: "for-you", label: "For you", icon: "✨" },
  { id: "emails", label: "Emails", icon: "✉️", badge: "New" },
  { id: "sheets", label: "Sheets", icon: "📊" },
  { id: "docs", label: "Docs", icon: "📄" },
  { id: "whiteboards", label: "Whiteboards", icon: "📋" },
  { id: "presentations", label: "Presentations", icon: "🎤" },
  { id: "social", label: "Social media", icon: "❤️" },
  { id: "videos", label: "Videos", icon: "🎬" },
  { id: "print", label: "Print", icon: "🖨️" },
  { id: "websites", label: "Websites", icon: "🌐" },
  { id: "custom-size", label: "Custom size", icon: "📐" },
  { id: "upload", label: "Upload", icon: "☁️" },
];

const TEMPLATES = [
  { id: "t1", name: "BOLD Agency", width: 800, height: 1000, color: "#e8e0d5" },
  { id: "t2", name: "DESIRE Creative", width: 800, height: 1000, color: "#ff9a56" },
  { id: "t3", name: "ELECTRIC Music", width: 800, height: 1000, color: "#c41e3a" },
  { id: "t4", name: "LOVE AGAIN", width: 800, height: 1000, color: "#1a1a1a" },
  { id: "t5", name: "Marketing Plan", width: 1920, height: 1080, color: "#2d2d2d" },
  { id: "t6", name: "Who We Are", width: 1200, height: 800, color: "#1e3a5f" },
];

export default function CreateDesign() {
  const location = useLocation();
  const navigate = useNavigate();
  const { shapeId, shapeName } = location.state || {};
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("for-you");
  const [customSize, setCustomSize] = useState({ w: 800, h: 600 });
  const [showCustomSize, setShowCustomSize] = useState(false);

  const openEditor = (options) => {
    navigate("/design/editor", {
      state: {
        shapeId,
        shapeName: shapeName || "Untitled design",
        ...options,
      },
    });
  };

  const filteredFormats = search
    ? DESIGN_FORMATS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : DESIGN_FORMATS;
  const filteredTemplates = search
    ? TEMPLATES.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : TEMPLATES;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f5f3ff 0%, #fff 20%)",
        fontFamily: "'Nunito', sans-serif",
        display: "flex",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
      `}</style>

      {/* Left nav */}
      <nav
        style={{
          width: 220,
          minHeight: "100vh",
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            margin: "0 16px 16px",
            padding: "10px 16px",
            background: "#f3f4f6",
            border: "none",
            borderRadius: 12,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#374151",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          ← Back to Dashboard
        </button>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveNav(item.id);
              if (item.id === "custom-size") setShowCustomSize(true);
            }}
            style={{
              margin: "0 12px",
              padding: "10px 14px",
              background: activeNav === item.id ? "#ede9fe" : "transparent",
              border: "none",
              borderRadius: 10,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: activeNav === item.id ? "#6d28d9" : "#374151",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
            {item.badge && (
              <span style={{ marginLeft: "auto", background: "#8b5cf6", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 6 }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 48px", maxWidth: 1200 }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 800, color: "#1f2937" }}>
          Create a design
        </h1>
        <input
          type="text"
          placeholder="What would you like to create?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 560,
            padding: "14px 20px 14px 44px",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            fontSize: 16,
            marginBottom: 32,
            background: "#fff url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%239ca3af%22 stroke-width=%222%22%3E%3Ccircle cx=%2211%22 cy=%2211%22 r=%228%22/%3E%3Cpath d=%22m21 21-4.35-4.35%22/%3E%3C/svg%3E') no-repeat 12px center",
          }}
        />

        {showCustomSize && (
          <div
            style={{
              marginBottom: 24,
              padding: 20,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <label style={{ fontWeight: 700, color: "#374151" }}>Width</label>
            <input
              type="number"
              value={customSize.w}
              onChange={(e) => setCustomSize((s) => ({ ...s, w: Number(e.target.value) || 800 }))}
              style={{ width: 80, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <label style={{ fontWeight: 700, color: "#374151" }}>Height</label>
            <input
              type="number"
              value={customSize.h}
              onChange={(e) => setCustomSize((s) => ({ ...s, h: Number(e.target.value) || 600 }))}
              style={{ width: 80, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <button
              onClick={() => openEditor({ width: customSize.w, height: customSize.h })}
              style={{
                padding: "10px 20px",
                background: "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Create
            </button>
            <button
              onClick={() => setShowCustomSize(false)}
              style={{
                padding: "10px 16px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "#374151" }}>
            Create new
          </h2>
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
            }}
          >
            {filteredFormats.map((f) => (
              <button
                key={f.id}
                onClick={() => openEditor({ width: f.width, height: f.height, formatName: f.name })}
                style={{
                  flex: "0 0 160px",
                  padding: 20,
                  background: "#fff",
                  border: "2px solid #e5e7eb",
                  borderRadius: 16,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a78bfa";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{f.name}</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#374151" }}>
              Templates for you
            </h2>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#7c3aed", cursor: "pointer" }}>See all</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => openEditor({ width: t.width, height: t.height, templateId: t.id, templateName: t.name })}
                style={{
                  aspectRatio: "3/4",
                  background: t.color,
                  border: "2px solid #e5e7eb",
                  borderRadius: 12,
                  cursor: "pointer",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
              >
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 12,
                  }}
                >
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                    {t.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
