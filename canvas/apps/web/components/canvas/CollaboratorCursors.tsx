/**
 * ============================================================================
 * LEKHAFLOW - COLLABORATOR CURSORS
 * ============================================================================
 * 
 * Renders cursor positions and labels for other users.
 * 
 * Each collaborator's cursor shows:
 * - Arrow pointer in their color
 * - Name label
 * - Optional selection highlight
 */

"use client";

import React from "react";

/**
 * Collaborator type - inlined to avoid circular import issues with @repo/common
 * Represents another user's presence in the collaborative session
 */
interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  selectedElementIds: string[];
  isCurrentUser: boolean;
}

// ============================================================================
// CURSOR COMPONENT
// ============================================================================

interface CollaboratorCursorProps {
  collaborator: Collaborator;
}

function CollaboratorCursor({ collaborator }: CollaboratorCursorProps) {
  const { cursor, name, color } = collaborator;
  
  // Don't render if no cursor position
  if (!cursor) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-transform duration-75"
      style={{
        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
      }}
    >
      {/* Cursor Arrow SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          transform: "rotate(-10deg)",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
        }}
      >
        <path
          d="M5.65376 12.4561L5.65376 12.456C5.26145 13.0687 4.54397 13.4253 3.78412 13.3828C3.02428 13.3404 2.35361 12.9056 2.03134 12.2496C1.70907 11.5936 1.78536 10.8214 2.23219 10.2407L9.35167 1.50014C9.76552 0.965629 10.3972 0.651092 11.0669 0.651092C11.7366 0.651092 12.3683 0.965629 12.7822 1.50014L19.9016 10.2407C20.3485 10.8214 20.4248 11.5936 20.1025 12.2496C19.7802 12.9056 19.1096 13.3404 18.3497 13.3828C17.5899 13.4253 16.8724 13.0687 16.4801 12.456L12.0669 6.01954V21.6509C12.0669 22.7555 11.1715 23.6509 10.0669 23.6509C8.96233 23.6509 8.0669 22.7555 8.0669 21.6509V6.01954L5.65376 12.4561Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
        <path
          d="M0 0 L10 24 L14 14 L24 10 Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* Name Label */}
      <div
        className="absolute left-4 top-4 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{
          backgroundColor: color,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {name}
      </div>
    </div>
  );
}

// ============================================================================
// CURSORS LAYER
// ============================================================================

interface CollaboratorCursorsProps {
  collaborators: Collaborator[];
}

export function CollaboratorCursors({ collaborators }: CollaboratorCursorsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {collaborators.map((collaborator) => (
        <CollaboratorCursor
          key={collaborator.id}
          collaborator={collaborator}
        />
      ))}
    </div>
  );
}
