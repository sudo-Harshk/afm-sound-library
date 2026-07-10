import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sidebarWidth';
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

function clamp(width) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
}

function getInitialWidth() {
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return stored ? clamp(stored) : DEFAULT_WIDTH;
}

export function useSidebarWidth() {
  const [width, setWidth] = useState(getInitialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, width: 0 });

  const startDrag = useCallback(
    (e) => {
      dragStart.current = { x: e.clientX, width };
      setIsDragging(true);
    },
    [width]
  );

  const resetWidth = useCallback(() => {
    setWidth(DEFAULT_WIDTH);
    localStorage.setItem(STORAGE_KEY, String(DEFAULT_WIDTH));
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const delta = e.clientX - dragStart.current.x;
      setWidth(clamp(dragStart.current.width + delta));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) return;
    localStorage.setItem(STORAGE_KEY, String(width));
  }, [width, isDragging]);

  return { width, isDragging, startDrag, resetWidth };
}
