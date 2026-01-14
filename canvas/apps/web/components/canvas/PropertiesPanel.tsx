/**
 * ============================================================================
 * LEKHAFLOW - PROPERTIES PANEL
 * ============================================================================
 * 
 * Right sidebar for element styling properties.
 */

"use client";

import React, { useState } from "react";
import { ChevronRight, Palette, X } from "lucide-react";
import { useCanvasStore } from "../../store/canvas-store";

type StrokeStyle = "solid" | "dashed" | "dotted";

const STROKE_COLORS = [
  { color: "#1e1e1e", name: "Black" },
  { color: "#e03131", name: "Red" },
  { color: "#2f9e44", name: "Green" },
  { color: "#1971c2", name: "Blue" },
  { color: "#f08c00", name: "Orange" },
  { color: "#9c36b5", name: "Purple" },
  { color: "#868e96", name: "Gray" },
  { color: "#099268", name: "Teal" },
];

const BACKGROUND_COLORS = [
  { color: "transparent", name: "None" },
  { color: "#ffffff", name: "White" },
  { color: "#ffc9c9", name: "Light Red" },
  { color: "#b2f2bb", name: "Light Green" },
  { color: "#a5d8ff", name: "Light Blue" },
  { color: "#ffec99", name: "Light Yellow" },
  { color: "#eebefa", name: "Light Purple" },
  { color: "#ced4da", name: "Light Gray" },
];

const STROKE_WIDTHS = [1, 2, 4, 6];

export function PropertiesPanel() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const {
    currentStrokeColor,
    currentBackgroundColor,
    currentStrokeWidth,
    currentStrokeStyle,
    currentOpacity,
    setStrokeColor,
    setBackgroundColor,
    setStrokeWidth,
    setStrokeStyle,
    setOpacity,
  } = useCanvasStore();

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    top: "80px",
    right: "16px",
    zIndex: 50,
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  };

  if (isCollapsed) {
    return (
      <div style={panelStyle}>
        <button
          onClick={() => setIsCollapsed(false)}
          title="Style Panel"
          style={{
            ...containerStyle,
            padding: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid #e5e7eb",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f8fafc";
            e.currentTarget.style.borderColor = "#8b5cf6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          <Palette size={20} color="#8b5cf6" />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Style</span>
          <ChevronRight size={16} color="#9ca3af" />
        </button>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={{ ...containerStyle, width: "240px", padding: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#8b5cf615", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Palette size={18} color="#8b5cf6" />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>Style</span>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <X size={18} color="#9ca3af" />
          </button>
        </div>

        {/* Stroke Color */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stroke</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {STROKE_COLORS.map(({ color, name }) => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                title={name}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  border: currentStrokeColor === color ? "3px solid #8b5cf6" : "2px solid #e5e7eb",
                  backgroundColor: color,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: currentStrokeColor === color ? "0 0 0 3px #8b5cf630" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fill</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {BACKGROUND_COLORS.map(({ color, name }) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                title={name}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  border: currentBackgroundColor === color ? "3px solid #8b5cf6" : "2px solid #e5e7eb",
                  backgroundColor: color === "transparent" ? "white" : color,
                  backgroundImage: color === "transparent" 
                    ? "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)"
                    : "none",
                  backgroundSize: color === "transparent" ? "8px 8px" : "auto",
                  backgroundPosition: color === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : "0 0",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: currentBackgroundColor === color ? "0 0 0 3px #8b5cf630" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stroke Width</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                title={`${width}px`}
                style={{
                  flex: 1,
                  height: "40px",
                  borderRadius: "10px",
                  border: currentStrokeWidth === width ? "2px solid #8b5cf6" : "2px solid #e5e7eb",
                  backgroundColor: currentStrokeWidth === width ? "#8b5cf610" : "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: Math.max(4, width * 2),
                    height: Math.max(4, width * 2),
                    borderRadius: "50%",
                    backgroundColor: currentStrokeWidth === width ? "#8b5cf6" : "#64748b",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Stroke Style */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Line Style</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["solid", "dashed", "dotted"] as StrokeStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setStrokeStyle(style)}
                title={style.charAt(0).toUpperCase() + style.slice(1)}
                style={{
                  flex: 1,
                  height: "40px",
                  borderRadius: "10px",
                  border: currentStrokeStyle === style ? "2px solid #8b5cf6" : "2px solid #e5e7eb",
                  backgroundColor: currentStrokeStyle === style ? "#8b5cf610" : "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <svg width="32" height="3" viewBox="0 0 32 3">
                  <line
                    x1="0"
                    y1="1.5"
                    x2="32"
                    y2="1.5"
                    stroke={currentStrokeStyle === style ? "#8b5cf6" : "#64748b"}
                    strokeWidth="2"
                    strokeDasharray={style === "dashed" ? "6 4" : style === "dotted" ? "2 3" : "none"}
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Opacity</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#8b5cf6", fontVariantNumeric: "tabular-nums" }}>{currentOpacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={currentOpacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              cursor: "pointer",
              accentColor: "#8b5cf6",
            }}
          />
        </div>
      </div>
    </div>
  );
}
