/**
 * ============================================================================
 * LEKHAFLOW - HELP PANEL
 * ============================================================================
 * 
 * Bottom-right keyboard shortcuts help panel.
 */

"use client";

import React, { useState } from "react";
import { Keyboard, X, HelpCircle } from "lucide-react";

const SHORTCUTS = [
  { keys: ["V"], action: "Select", color: "#8b5cf6" },
  { keys: ["H"], action: "Pan", color: "#6366f1" },
  { keys: ["R"], action: "Rectangle", color: "#ec4899" },
  { keys: ["O"], action: "Ellipse", color: "#f43f5e" },
  { keys: ["L"], action: "Line", color: "#f97316" },
  { keys: ["A"], action: "Arrow", color: "#eab308" },
  { keys: ["P"], action: "Pencil", color: "#22c55e" },
  { keys: ["T"], action: "Text", color: "#06b6d4" },
  { keys: ["E"], action: "Eraser", color: "#64748b" },
  { keys: ["⌘", "Z"], action: "Undo", color: "#8b5cf6" },
  { keys: ["⌘", "⇧", "Z"], action: "Redo", color: "#8b5cf6" },
  { keys: ["Del"], action: "Delete", color: "#ef4444" },
  { keys: ["Esc"], action: "Deselect", color: "#64748b" },
];

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const containerStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  };

  return (
    <div style={{ position: "absolute", bottom: "16px", right: "16px", zIndex: 50 }}>
      {isOpen ? (
        <div style={{ ...containerStyle, padding: "16px", width: "240px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#8b5cf615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Keyboard size={16} color="#8b5cf6" />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Shortcuts
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <X size={16} color="#9ca3af" />
            </button>
          </div>

          {/* Shortcuts List */}
          <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {SHORTCUTS.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: index < SHORTCUTS.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <span style={{ fontSize: "13px", color: "#4b5563", fontWeight: 500 }}>{shortcut.action}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: shortcut.color,
                        backgroundColor: `${shortcut.color}10`,
                        border: `1px solid ${shortcut.color}30`,
                        borderRadius: "6px",
                      }}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          title="Keyboard shortcuts (?)"
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
          <HelpCircle size={20} color="#64748b" />
        </button>
      )}
    </div>
  );
}
