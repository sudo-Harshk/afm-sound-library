import { useState, useEffect, useCallback, useRef } from 'react';

const SEARCH_QUERY = 'Applause';

const externalSteps = [
  {
    title: 'Welcome to AFM Sound Catalog',
    content: 'This is a sound taxonomy reference catalog. Let\'s explore by searching for a real sound. Try Applause!',
    placement: 'center',
  },
  {
    target: '[data-tour="sidebar"]',
    title: 'Category Sidebar',
    content: 'Categories on the left let you browse by type. But let\'s try search instead.',
    placement: 'right',
  },
  {
    target: '[data-tour="search"]',
    title: 'Search',
    content: 'Let\'s search for Applause and see what comes up.',
    placement: 'bottom',
    action: 'typeSearch',
  },
  {
    target: '[data-tour="table"]',
    title: 'Search Results',
    content: 'The table filters instantly. There it is. Let\'s open it!',
    placement: 'top',
  },
];

const panelSteps = [
  {
    target: '[data-tour="detail-panel"]',
    title: 'Detail Panel',
    content: 'Here\'s everything about the Applause sound: references, metadata, and taxonomy. Let\'s explore each section.',
    placement: 'left',
  },
  {
    target: '[data-tour="detail-media"]',
    title: 'Media Preview',
    content: 'YouTube videos and audio references play right here. If a sound has a YouTube link, you can watch it inline.',
    placement: 'left',
  },
  {
    target: '[data-tour="detail-references"]',
    title: 'References',
    content: 'All linked references are grouped by type: YouTube, Audio, and Other. You can play, open, or delete them from here.',
    placement: 'left',
  },
  {
    target: '[data-tour="detail-metadata"]',
    title: 'Metadata',
    content: 'Each sound has a typical example, acoustic profile, and list of confusable labels to help distinguish it from similar sounds.',
    placement: 'left',
  },
  {
    target: '[data-tour="detail-taxonomy"]',
    title: 'Taxonomy Path',
    content: 'See exactly where this sound fits in the taxonomy. From section to subcategory, down to the specific label.',
    placement: 'left',
  },
  {
    target: '[data-tour="detail-addref"]',
    title: 'Add Reference',
    content: 'Found a useful YouTube or Pixabay link? Add it here as a reference to help others discover this sound.',
    placement: 'left',
  },
];

const finishStep = {
  title: 'You\'re all set!',
  content: 'You just explored the Applause sound. Try any sound yourself. Search, browse, and discover!',
  placement: 'center',
};

const allSteps = [...externalSteps, ...panelSteps, finishStep];
const PANEL_START = externalSteps.length;
const PANEL_END = PANEL_START + panelSteps.length;
const RESULTS_STEP = externalSteps.length - 1;
const PANEL_ANIM_MS = 350;

export default function HelpTour({ onClose, sounds, setSelectedSound, onQueryChange }) {
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const prevStepRef = useRef(0);
  const timersRef = useRef([]);

  const current = allSteps[step];

  const isPanelStep = step >= PANEL_START && step < PANEL_END;
  const wasPanelStep = prevStepRef.current >= PANEL_START && prevStepRef.current < PANEL_END;
  const enteringPanel = isPanelStep && !wasPanelStep;

  const cleanup = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setSelectedSound(null);
    onQueryChange('');
  }, [setSelectedSound, onQueryChange]);

  const handleClose = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  useEffect(() => {
    if (enteringPanel) {
      const applause = sounds?.find((s) =>
        (s.canonicalLabel || '').toLowerCase().includes(SEARCH_QUERY.toLowerCase())
      );
      if (applause) setSelectedSound(applause);
    }
    if (!isPanelStep && wasPanelStep) {
      setSelectedSound(null);
    }
    prevStepRef.current = step;
  }, [step, isPanelStep, wasPanelStep, enteringPanel, sounds, setSelectedSound]);

  useEffect(() => {
    if (current.action === 'typeSearch') {
      const input = document.querySelector('[data-tour="search"] input');
      if (input) {
        input.focus();
        onQueryChange(SEARCH_QUERY);
      }
    }
  }, [current.action, onQueryChange]);

  useEffect(() => {
    if (enteringPanel) {
      const timer = setTimeout(() => {
        const rows = document.querySelectorAll('[data-tour="table"] tbody tr');
        for (const row of rows) {
          if (row.textContent?.toLowerCase().includes(SEARCH_QUERY.toLowerCase())) {
            row.click();
            break;
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [enteringPanel]);

  const measure = useCallback(() => {
    if (current.target) {
      const el = document.querySelector(current.target);
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;

      setSpotlight(rect);

      const tooltipW = 320;
      const tooltipH = 140;
      const gap = 12;

      let top, left;
      if (current.placement === 'right') {
        top = rect.top + rect.height / 2 - tooltipH / 2;
        left = rect.right + gap;
      } else if (current.placement === 'left') {
        top = rect.top + rect.height / 2 - tooltipH / 2;
        left = rect.left - tooltipW - gap;
      } else if (current.placement === 'top') {
        top = rect.top - tooltipH - gap;
        left = rect.left + rect.width / 2 - tooltipW / 2;
      } else {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipW / 2;
      }

      left = Math.max(16, Math.min(left, window.innerWidth - tooltipW - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipH - 16));

      setTooltipStyle({ position: 'fixed', top, left, width: tooltipW });
      return true;
    } else {
      setSpotlight(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 360,
      });
      return true;
    }
  }, [current]);

  const updateSpotlight = useCallback(() => {
    if (!measure()) {
      setTimeout(updateSpotlight, 80);
    }
  }, [measure]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (current.target) {
      const el = document.querySelector(current.target);
      if (el && isPanelStep) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const delay = isPanelStep ? PANEL_ANIM_MS : 60;
    const timers = [
      setTimeout(updateSpotlight, delay),
      setTimeout(updateSpotlight, delay + 350),
      setTimeout(updateSpotlight, delay + 600),
    ];
    timersRef.current = timers;

    window.addEventListener('resize', updateSpotlight);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', updateSpotlight);
    };
  }, [updateSpotlight, isPanelStep, current.target]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, handleClose]);

  const next = () => {
    if (step < allSteps.length - 1) setStep(step + 1);
    else handleClose();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[9999]" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50" />

      {spotlight && (
        <div
          className="absolute rounded-lg tour-spotlight pointer-events-none"
          style={{
            top: spotlight.top - 6,
            left: spotlight.left - 6,
            width: spotlight.width + 12,
            height: spotlight.height + 12,
          }}
        />
      )}

      <div
        className="absolute bg-paper-raised rounded-xl shadow-2xl border border-line p-5 z-[10000] tour-tooltip"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-semibold text-ink mb-2">{current.title}</h3>
        <p className="text-[13px] text-ink-soft leading-relaxed mb-4">{current.content}</p>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-faint tabular-nums">
            {step + 1} of {allSteps.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-[12px] text-ink-faint hover:text-ink transition-colors"
            >
              Skip
            </button>
            {step > 0 && (
              <button
                onClick={prev}
                className="px-3 py-1.5 text-[12px] font-medium text-ink-soft hover:text-ink border border-line rounded-lg hover:bg-surface-container transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={next}
              className="px-4 py-1.5 text-[12px] font-medium text-on-primary bg-accent rounded-lg hover:opacity-90 transition-opacity"
            >
              {step < allSteps.length - 1 ? 'Next' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
