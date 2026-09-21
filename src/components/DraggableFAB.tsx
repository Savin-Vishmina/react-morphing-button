"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";

interface DraggableFABProps {
  onOpen: (center: { x: number; y: number }) => void;
  isHidden?: boolean;
}

export function DraggableFAB({ onOpen, isHidden }: DraggableFABProps) {
  const [mounted, setMounted] = useState(false);
  const [constraints, setConstraints] = useState({ top: -800, left: -400, right: 0, bottom: 0 });
  const btnRef = useRef<HTMLDivElement>(null);
  
  // Offsets relative to the CSS anchor (bottom-6 right-6)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  useEffect(() => {
    // Dynamic constraint calculation based on viewport
    setConstraints({
      top: -(window.innerHeight - 150),
      left: -(window.innerWidth - 72),
      right: 0,
      bottom: 0
    });
    setMounted(true);
  }, []);

  const handleClick = () => {
    // Use getBoundingClientRect to get the EXACT pixel center of the button on screen
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      onOpen(center);
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      style={{ 
        x, 
        y,
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? "none" : "auto",
        transition: "opacity 400ms ease", // Start fading in immediately as modal closes
      }} 
      drag={!isHidden}
      dragConstraints={constraints}
      dragElastic={0.1} 
      dragMomentum={false} 
      onDragEnd={() => {
        const currentX = x.get();
        const midpoint = -(window.innerWidth / 2) + 28;
        
        // Edge Snap Logic
        if (currentX < midpoint) {
          const leftEdgeOffset = -(window.innerWidth - 56 - 48);
          animate(x, leftEdgeOffset, { type: "spring", stiffness: 300, damping: 25 });
        } else {
          animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        }
      }}
      whileHover={!isHidden ? { scale: 1.05 } : {}}
      whileTap={!isHidden ? { scale: 0.9 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      // Anchored to bottom right to glide natively with mobile browser URL bar shifts
      className="fixed z-[9999] touch-none bottom-6 right-6"
      onClick={handleClick}
    >
      <div 
        ref={btnRef}
        className="relative w-14 h-14 p-[1.5px] rounded-full overflow-hidden group cursor-pointer shadow-[0_0_15px_rgba(238,199,119,0.3)]"
      >
        <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1e1e1e_0%,#eec777_50%,#1e1e1e_100%)] opacity-90"></div>
        <div className="relative w-full h-full bg-[#1e1e1e] rounded-full flex items-center justify-center z-10">
          <Sparkles className="w-6 h-6 text-[#eec777]" />
        </div>
      </div>
    </motion.div>
  );
}
