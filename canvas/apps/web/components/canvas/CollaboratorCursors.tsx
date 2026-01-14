/**
 * ============================================================================
 * LEKHAFLOW - COLLABORATOR CURSORS
 * ============================================================================
 * 
 * Renders cursor positions and labels for other users in real-time.
 */

"use client";

import React from "react";

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  selectedElementIds: string[];
  isCurrentUser: boolean;
}

interface CollaboratorCursorProps {
  collaborator: Collaborator;
}

function CollaboratorCursor({ collaborator }: CollaboratorCursorProps) {
  const { cursor, name, color } = collaborator;
  
  if (!cursor) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
        pointerEvents: "none",
        zIndex: 999,
        transition: "transform 50ms linear",
      }}
    >
      {/* Cursor Arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.88 2.85a.5.5 0 0 0-.38.36z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Name Label */}
      <div
        style={{
          position: "absolute",
          left: "18px",
          top: "18px",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
          color: "white",
          backgroundColor: color,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
          maxWidth: "120px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </div>
    </div>
  );
}

interface CollaboratorCursorsProps {
  collaborators: Collaborator[];
}

export function CollaboratorCursors({ collaborators }: CollaboratorCursorsProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      {collaborators.map((collaborator) => (
        <CollaboratorCursor
          key={collaborator.id}
          collaborator={collaborator}
        />
      ))}
    </div>
  );
}
