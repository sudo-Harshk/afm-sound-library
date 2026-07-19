const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

export const features = {
  showDocs: !isDemo,
  showTracker: !isDemo,
};
