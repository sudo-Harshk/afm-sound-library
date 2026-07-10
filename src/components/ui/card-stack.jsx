import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

const CardStack = forwardRef(function CardStack(
  { items, keyField = 'id', renderItem, onFrontChange, cardHeight = 340, maxVisible = 5 },
  ref
) {
  const [cards, setCards] = useState(items);
  const [dragDirection, setDragDirection] = useState(null);
  const dragY = useMotionValue(0);
  const rotateX = useTransform(dragY, [-200, 0, 200], [10, 0, -10]);

  useEffect(() => {
    setCards(items);
  }, [items]);

  useEffect(() => {
    if (cards.length) onFrontChange?.(cards[0], items.indexOf(cards[0]));
  }, [cards]);

  const offset = 14;
  const scaleStep = 0.045;
  const dimStep = 0.1;
  const spring = { type: 'spring', stiffness: 320, damping: 32 };
  const swipeThreshold = 60;

  const moveToEnd = () => setCards((prev) => (prev.length < 2 ? prev : [...prev.slice(1), prev[0]]));
  const moveToStart = () => setCards((prev) => (prev.length < 2 ? prev : [prev[prev.length - 1], ...prev.slice(0, -1)]));
  const shuffle = () => setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  const reset = () => setCards(items);

  useImperativeHandle(ref, () => ({ next: moveToEnd, prev: moveToStart, shuffle, reset }));

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.y) > swipeThreshold || Math.abs(info.velocity.y) > 500) {
      if (info.offset.y < 0 || info.velocity.y < 0) {
        setDragDirection('up');
        setTimeout(() => { moveToEnd(); setDragDirection(null); }, 120);
      } else {
        setDragDirection('down');
        setTimeout(() => { moveToStart(); setDragDirection(null); }, 120);
      }
    }
    dragY.set(0);
  };

  if (cards.length === 0) return null;

  return (
    <ul className="relative w-full m-0 p-0" style={{ height: cardHeight }}>
      <AnimatePresence>
        {cards.slice(0, maxVisible).map((item, i) => {
          const isFront = i === 0;
          const brightness = Math.max(0.6, 1 - i * dimStep);
          return (
            <motion.li
              key={item[keyField]}
              className="absolute inset-0 list-none"
              style={{
                cursor: isFront ? 'grab' : 'auto',
                touchAction: 'none',
                rotateX: isFront ? rotateX : 0,
                transformPerspective: 1000,
              }}
              animate={{
                top: i * -offset,
                scale: 1 - i * scaleStep,
                filter: `brightness(${brightness})`,
                zIndex: cards.length - i,
                opacity: dragDirection && isFront ? 0 : 1,
              }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              transition={spring}
              drag={isFront ? 'y' : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDrag={(_, info) => isFront && dragY.set(info.offset.y)}
              onDragEnd={handleDragEnd}
              whileDrag={isFront ? { zIndex: cards.length + 1, cursor: 'grabbing', scale: 1.02 } : {}}
            >
              {renderItem(item, isFront)}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
});

export default CardStack;
