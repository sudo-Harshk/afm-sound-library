import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, RotateCcw } from 'lucide-react';
import CardStack from './ui/card-stack';
import SoundCardFace from './SoundCardFace';

export default function CategoryDetail({ category, sounds, onBack, onAddReference }) {
  const stackRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [category]);

  if (sounds.length === 0) {
    return (
      <div>
        <BackButton onBack={onBack} />
        <p className="text-sm text-ink-faint py-8">No sounds in this category.</p>
      </div>
    );
  }

  const total = sounds.length;
  const next = () => stackRef.current?.next();
  const prev = () => stackRef.current?.prev();
  const shuffle = () => stackRef.current?.shuffle();
  const resetOrder = () => stackRef.current?.reset();

  return (
    <div>
      <BackButton onBack={onBack} />
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-ink truncate pr-3">{category}</h2>
        <span className="shrink-0 text-xs font-medium text-ink-faint tabular-nums bg-paper-raised border border-line px-2.5 py-1 rounded-full">
          {index + 1} / {total}
        </span>
      </div>

      <div className="w-full max-w-[300px] sm:max-w-sm mx-auto">
        <CardStack
          ref={stackRef}
          items={sounds}
          aspectRatio="4 / 5"
          onFrontChange={(_, idx) => setIndex(idx)}
          renderItem={(sound, isFront, setDragLocked) => (
            <SoundCardFace sound={sound} isFront={isFront} onAddReference={onAddReference} onLockDrag={setDragLocked} />
          )}
        />

        <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
          <ControlButton onClick={prev} title="Previous">
            <ChevronLeft className="w-4 h-4" />
          </ControlButton>
          <ControlButton onClick={shuffle} title="Shuffle">
            <Shuffle className="w-4 h-4" />
          </ControlButton>
          <ControlButton onClick={resetOrder} title="Reset order">
            <RotateCcw className="w-4 h-4" />
          </ControlButton>
          <ControlButton onClick={next} title="Next">
            <ChevronRight className="w-4 h-4" />
          </ControlButton>
        </div>

        <p className="text-center text-xs text-ink-faint mt-4">Drag a card up or down to cycle through sounds</p>
      </div>
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-accent transition-colors duration-150 mb-4"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      All categories
    </button>
  );
}

function ControlButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-10 h-10 rounded-full border border-line bg-paper-raised text-ink-soft flex items-center justify-center hover:border-accent/50 hover:text-accent transition-colors duration-150"
    >
      {children}
    </button>
  );
}
