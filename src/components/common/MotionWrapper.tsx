'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export { motion, AnimatePresence };

export interface MotionRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export const MotionReveal: React.FC<MotionRevealProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) => {
  const initial =
    direction === 'up'
      ? { opacity: 0, y: 20 }
      : direction === 'down'
      ? { opacity: 0, y: -20 }
      : direction === 'left'
      ? { opacity: 0, x: 20 }
      : direction === 'right'
      ? { opacity: 0, x: -20 }
      : { opacity: 0 };

  const animate =
    direction === 'none'
      ? { opacity: 1 }
      : { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
