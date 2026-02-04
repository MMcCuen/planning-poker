'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, Vote } from '@/types';
import { cn } from '@/lib/utils/cn';

interface EstimationTableProps {
  players: Player[];
  votes: Vote[];
  revealed: boolean;
  currentUserId: string;
}

export function EstimationTable({
  players,
  votes,
  revealed,
  currentUserId,
}: EstimationTableProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      <AnimatePresence mode="popLayout">
        {players.map((player, index) => {
          const vote = votes.find((v) => v.playerId === player.id);
          const hasVoted = !!vote;
          const isCurrentUser = player.id === currentUserId;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'relative transition-all',
                  isCurrentUser && 'ring-2 ring-primary'
                )}
              >
                <CardContent className="p-4 flex flex-col items-center space-y-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarImage src={player.avatarUrl} />
                      <AvatarFallback className="text-lg font-semibold">
                        {player.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Connection status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center">
                      {player.isConnected ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Player name */}
                  <div className="text-center">
                    <p className="font-medium text-sm truncate max-w-[120px]">
                      {player.name}
                    </p>
                    {player.role === 'dealer' && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Dealer
                      </Badge>
                    )}
                  </div>

                  {/* Vote status / card */}
                  <div className="w-full flex justify-center">
                    {revealed && vote ? (
                      // Revealed vote - show card with value
                      <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 180 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="relative w-16 h-20"
                      >
                        {/* Card front */}
                        <div
                          className="absolute inset-0 bg-white dark:bg-gray-800 border-2 border-primary rounded-lg flex items-center justify-center shadow-lg"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          <span className="text-3xl font-bold text-primary">
                            {vote.value}
                          </span>
                        </div>
                      </motion.div>
                    ) : hasVoted ? (
                      // Voted but not revealed - show card back
                      <div className="w-16 h-20 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white text-3xl">?</span>
                      </div>
                    ) : (
                      // Not voted yet - show status
                      <Badge
                        variant="secondary"
                        className="animate-pulse bg-gray-200 dark:bg-gray-700"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Thinking
                      </Badge>
                    )}
                  </div>

                  {/* Vote confirmation (for voted but not revealed) */}
                  {hasVoted && !revealed && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
