import React, { useRef, useEffect } from "react";

export const swipeDirections = {
  SWIPE_UP: "SWIPE_UP",
  SWIPE_DOWN: "SWIPE_DOWN",
  SWIPE_LEFT: "SWIPE_LEFT",
  SWIPE_RIGHT: "SWIPE_RIGHT",
};

export const keyMap = {
  Space: "SWIPE_UP",
  ArrowUp: "SWIPE_UP",
  KeyW: "SWIPE_UP",
  ArrowDown: "SWIPE_DOWN",
  KeyS: "SWIPE_DOWN",
  ArrowLeft: "SWIPE_LEFT",
  KeyA: "SWIPE_LEFT",
  ArrowRight: "SWIPE_RIGHT",
  KeyD: "SWIPE_RIGHT",
};

interface GestureViewProps {
  onStartGesture?: () => void;
  onResponderGrant?: () => void;
  onSwipe: (direction: string) => void;
  children: React.ReactNode;
}

export default function GestureView({
  onStartGesture,
  onResponderGrant,
  onSwipe,
  children,
}: GestureViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const direction = (keyMap as any)[code];
      if (direction) {
        e.preventDefault();
        onResponderGrant?.();
        onStartGesture?.();
        onSwipe(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onStartGesture, onResponderGrant, onSwipe]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      onResponderGrant?.();
      onStartGesture?.();
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touchEndPos = e.changedTouches[0];
    const dx = touchEndPos.clientX - touchStartPos.current.x;
    const dy = touchEndPos.clientY - touchStartPos.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const minSwipeDistance = 30; // pixels

    if (absX > minSwipeDistance || absY > minSwipeDistance) {
      if (absX > absY) {
        if (dx > 0) {
          onSwipe(swipeDirections.SWIPE_RIGHT);
        } else {
          onSwipe(swipeDirections.SWIPE_LEFT);
        }
      } else {
        if (dy > 0) {
          onSwipe(swipeDirections.SWIPE_DOWN);
        } else {
          onSwipe(swipeDirections.SWIPE_UP);
        }
      }
    } else {
      onSwipe(swipeDirections.SWIPE_UP);
    }
    touchStartPos.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    onResponderGrant?.();
    onStartGesture?.();
    touchStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!touchStartPos.current) return;
    const dx = e.clientX - touchStartPos.current.x;
    const dy = e.clientY - touchStartPos.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const minSwipeDistance = 30; // pixels

    if (absX > minSwipeDistance || absY > minSwipeDistance) {
      if (absX > absY) {
        if (dx > 0) {
          onSwipe(swipeDirections.SWIPE_RIGHT);
        } else {
          onSwipe(swipeDirections.SWIPE_LEFT);
        }
      } else {
        if (dy > 0) {
          onSwipe(swipeDirections.SWIPE_DOWN);
        } else {
          onSwipe(swipeDirections.SWIPE_UP);
        }
      }
    } else {
      onSwipe(swipeDirections.SWIPE_UP);
    }
    touchStartPos.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none cursor-pointer outline-none relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </div>
  );
}
