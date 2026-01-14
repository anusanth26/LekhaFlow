/**
 * ============================================================================
 * LEKHAFLOW - HEADER COMPONENT
 * ============================================================================
 * 
 * Top-left header with menu and document name.
 * Top-right collaboration UI with avatars and share button.
 */

"use client";

import React, { useState } from "react";
import { Menu, Share2, Users, Wifi, WifiOff } from "lucide-react";
import { useCanvasStore, useCollaboratorsArray } from "../../store/canvas-store";

// ============================================================================
// HEADER LEFT (Menu & Title)
// ============================================================================

export function HeaderLeft() {
  const [menuOpen, setMenuOpen] = useState(false);
  const roomId = useCanvasStore((state) => state.roomId);

  return (
    <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
      {/* Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="bg-white hover:bg-gray-50 p-2.5 rounded-xl shadow-md border border-gray-200 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Document Title */}
      <div className="bg-white px-4 py-2 rounded-xl shadow-md border border-gray-200">
        <input
          type="text"
          defaultValue={`Untitled-${new Date().toISOString().slice(0, 10)}`}
          className="text-sm font-medium text-gray-700 bg-transparent outline-none min-w-[150px]"
          placeholder="Document name"
        />
      </div>

      {/* Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-14 left-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px]">
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
            New canvas
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
            Export as PNG
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
            Export as SVG
          </button>
          <hr className="my-2 border-gray-200" />
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
            Clear canvas
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HEADER RIGHT (Collaboration)
// ============================================================================

export function HeaderRight() {
  const { myName, myColor, isConnected } = useCanvasStore();
  const collaborators = useCollaboratorsArray();

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Room link copied to clipboard!");
    });
  };

  return (
    <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
      {/* Connection Status */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl shadow-md border
          ${isConnected
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
          }
        `}
      >
        {isConnected ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Collaborator Avatars */}
      <div className="flex -space-x-2">
        {/* My Avatar (always first) */}
        <div
          className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md"
          style={{ backgroundColor: myColor }}
          title={`You (${myName})`}
        >
          {myName[0]}
        </div>

        {/* Other Collaborators */}
        {collaborators.slice(0, 3).map((collab) => (
          <div
            key={collab.id}
            className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md"
            style={{ backgroundColor: collab.color }}
            title={collab.name}
          >
            {collab.name[0]}
          </div>
        ))}

        {/* Overflow indicator */}
        {collaborators.length > 3 && (
          <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-md">
            +{collaborators.length - 3}
          </div>
        )}
      </div>

      {/* Collaborator Count */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{collaborators.length + 1}</span>
        </div>
      )}

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-colors flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}
