"use client";

import { useState } from "react";
import { MorphingModal } from "../components/MorphingModal";
import { DraggableFAB } from "../components/DraggableFAB";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFABHidden, setIsFABHidden] = useState(false);
  // Stores the absolute screen-center pixel of the FAB button for transform-origin
  const [fabCenter, setFabCenter] = useState<{x: number, y: number} | null>(null);
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Morphing Button</h1>
        <p className="text-xl text-gray-400">
          A floating, draggable button that snaps to the screen edges and perfectly expands into a full-screen modal using pure CSS transforms.
        </p>
        <p className="text-gray-500">
          Try dragging the sparkles button in the bottom right corner, or click it to open the modal.
        </p>
      </div>

      <DraggableFAB 
        isHidden={isFABHidden}
        onOpen={(center) => {
          setFabCenter(center);
          setIsFABHidden(true);
          setIsModalOpen(true);
        }}
      />
      
      {isModalOpen && (
        <MorphingModal 
          originPos={fabCenter}
          onStartClose={() => setIsFABHidden(false)} // Fire immediately to sync fade-in
          onClose={() => setIsModalOpen(false)} // Unmount modal after animation
        />
      )}
    </div>
  );
}