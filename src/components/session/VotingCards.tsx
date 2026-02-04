'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { FIBONACCI_SCALE } from '@/lib/constants/voting-scales';

interface VotingCardsProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function VotingCards({ selectedValue, onSelect, disabled }: VotingCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-4 justify-center p-6">
      {FIBONACCI_SCALE.map((card) => {
        const isSelected = selectedValue === card.value;
        const isHovered = hoveredCard === card.value;

        return (
          <motion.button
            key={card.value}
            onClick={() => !disabled && onSelect(card.value)}
            onHoverStart={() => setHoveredCard(card.value)}
            onHoverEnd={() => setHoveredCard(null)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={cn(
              // Base styles
              'relative w-20 h-28 rounded-xl border-2 shadow-lg transition-all duration-200',
              'flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',

              // State-based styles
              isSelected
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-500'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',

              isHovered && !isSelected && !disabled
                ? 'border-gray-400 dark:border-gray-500'
                : '',

              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Card value */}
            <span
              className={cn(
                'text-4xl font-bold transition-colors',
                isSelected
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200'
              )}
            >
              {card.display}
            </span>

            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}

            {/* Keyboard hint */}
            {card.numeric !== null && (
              <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                {card.value}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
