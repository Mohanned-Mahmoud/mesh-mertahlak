import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Generate or retrieve a stable player ID that persists across sessions
function getOrCreatePlayerId(): string {
  const key = 'date-judge-player-uuid';
  let id = localStorage.getItem(key);
  if (!id) {
    // Generate a simple UUID-like ID
    id = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export type Player = {
  id: string;
  name: string;
  score: number; // diamonds count
};

export type GamePhase = 'lobby' | 'card-display' | 'verbal' | 'voting' | 'scoring' | 'game-over';

export type GameState = {
  roomCode: string;
  players: Player[];
  phase: GamePhase;
  currentJudgeId: string | null;
  currentTruthTellerId: string | null;
  currentQuestion: { id: number; question: string; answer: string } | null;
  myRole: 'judge' | 'truth-teller' | 'deceiver' | null;
  roundNumber: number;
  lastRoundResult: {
    judgeGuessedRight: boolean;
    truthTellerId: string;
    truthTellerName: string;
    votedForId: string;
    votedForName: string;
  } | null;
  hostPlayerId: string | null;
};

type SocketContextType = {
  socket: Socket | null;
  gameState: GameState | null;
  myPlayerId: string | null;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  nextPhase: () => void;
  startVoting: () => void;
  submitVote: (votedPlayerId: string) => void;
  nextRound: () => void;
  error: string | null;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const backendOrigin =
      import.meta.env.VITE_SOCKET_URL ??
      import.meta.env.VITE_API_BASE_URL ??
      window.location.origin;

    const newSocket = io(backendOrigin, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    const handleStateUpdate = (state: GameState) => {
      setGameState(state);
      setError(null);
    };

    newSocket.on('room-joined', (state) => {
      handleStateUpdate(state);
      const storedId = localStorage.getItem('date-judge-player-id');
      if (!storedId) {
        // Fallback or handle initial join
      }
    });

    newSocket.on('game-started', handleStateUpdate);
    newSocket.on('phase-changed', handleStateUpdate);
    newSocket.on('voting-started', handleStateUpdate);
    newSocket.on('vote-submitted', handleStateUpdate);
    newSocket.on('round-ended', handleStateUpdate);
    
    newSocket.on('error', (err: { message: string }) => {
      setError(err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (roomCode: string, playerName: string) => {
    if (socket) {
      const stablePlayerId = getOrCreatePlayerId();
      socket.emit('join-room', { roomCode, playerName, playerId: stablePlayerId });
      setMyPlayerId(stablePlayerId);
      localStorage.setItem('date-judge-player-id', stablePlayerId);
    }
  };

  const startGame = () => {
    if (socket && gameState) {
      socket.emit('start-game', { roomCode: gameState.roomCode });
    }
  };

  const nextPhase = () => {
    if (socket && gameState) {
      socket.emit('next-phase', { roomCode: gameState.roomCode });
    }
  };

  const startVoting = () => {
    if (socket && gameState) {
      socket.emit('start-voting', { roomCode: gameState.roomCode });
    }
  };

  const submitVote = (votedPlayerId: string) => {
    if (socket && gameState) {
      socket.emit('submit-vote', { roomCode: gameState.roomCode, votedPlayerId });
    }
  };

  const nextRound = () => {
    if (socket && gameState) {
      socket.emit('next-round', { roomCode: gameState.roomCode });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        gameState,
        myPlayerId,
        joinRoom,
        startGame,
        nextPhase,
        startVoting,
        submitVote,
        nextRound,
        error
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
