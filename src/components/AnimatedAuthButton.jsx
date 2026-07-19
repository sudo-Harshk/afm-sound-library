import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function AnimatedAuthButton({ variant = 'desktop', isLoggedIn, isAdmin, onLogin, onLogout }) {
  const [pending, setPending] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleLogout = async () => {
    setPending(true);
    try {
      await onLogout();
    } finally {
      setPending(false);
    }
  };

  const initial = { opacity: 0, scale: prefersReduced ? 1 : 0.95 };
  const animate = { opacity: 1, scale: 1 };
  const exit = { opacity: 0, scale: prefersReduced ? 1 : 0.95 };
  const transition = { duration: 0.28 };

  if (variant === 'mobile') {
    return (
      <AnimatePresence mode="wait" initial={false}>
        {isLoggedIn ? (
          <motion.button
            key="logout"
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            onClick={handleLogout}
            disabled={pending}
            aria-label={isAdmin ? 'Admin — click to sign out' : 'Sign out'}
            title="Sign out"
            className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors duration-150 disabled:opacity-50 ${isAdmin ? 'bg-accent-soft border-accent text-accent' : 'border-line bg-paper text-ink-faint hover:text-accent hover:border-accent/50'}`}
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </motion.button>
        ) : (
          <motion.button
            key="login"
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            onClick={onLogin}
            aria-label="Admin login"
            title="Admin login"
            className="shrink-0 w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center text-ink-faint hover:text-accent hover:border-accent/50 transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoggedIn ? (
        <motion.button
          key="logout"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          onClick={handleLogout}
          disabled={pending}
          aria-label={isAdmin ? 'Admin — click to sign out' : 'Sign out'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] transition-colors disabled:opacity-50 ${isAdmin ? 'bg-accent-soft border-accent text-accent' : 'border-line text-ink-faint hover:text-accent hover:border-accent/50'}`}
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Logout
        </motion.button>
      ) : (
        <motion.button
          key="login"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          onClick={onLogin}
          aria-label="Admin login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-[13px] text-ink-faint hover:text-accent hover:border-accent/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">login</span>
          Login
        </motion.button>
      )}
    </AnimatePresence>
  );
}
