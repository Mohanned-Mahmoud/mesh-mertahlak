import { Server as SocketIOServer, Socket } from "socket.io";
import { db, questionsTable } from "@workspace/db";
import { logger } from "./logger";

export type Player = {
  id: string;
  name: string;
  score: number;
  socketId: string;
};

export type GamePhase = "lobby" | "card-display" | "verbal" | "voting" | "scoring" | "game-over";

export type Room = {
  code: string;
  players: Player[];
  phase: GamePhase;
  currentJudgeIndex: number;
  currentTruthTellerId: string | null;
  currentQuestion: { id: number; question: string; answer: string } | null;
  roundNumber: number;
  hostPlayerId: string | null;
  lastRoundResult: {
    judgeGuessedRight: boolean;
    truthTellerId: string;
    truthTellerName: string;
    votedForId: string;
    votedForName: string;
  } | null;
  usedQuestionIds: Set<number>;
};

const rooms = new Map<string, Room>();

function buildStateForPlayer(room: Room, playerId: string) {
  const player = room.players.find((p) => p.id === playerId);
  const currentJudge = room.players[room.currentJudgeIndex] ?? null;

  let myRole: "judge" | "truth-teller" | "deceiver" | null = null;
  if (room.phase !== "lobby") {
    if (currentJudge?.id === playerId) {
      myRole = "judge";
    } else if (room.currentTruthTellerId === playerId) {
      myRole = "truth-teller";
    } else if (currentJudge?.id !== playerId) {
      myRole = "deceiver";
    }
  }

  return {
    roomCode: room.code,
    players: room.players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
    phase: room.phase,
    currentJudgeId: currentJudge?.id ?? null,
    currentTruthTellerId: room.currentTruthTellerId,
    currentQuestion: room.currentQuestion,
    myRole,
    roundNumber: room.roundNumber,
    lastRoundResult: room.lastRoundResult,
    hostPlayerId: room.hostPlayerId,
  };
}

function emitToRoom(io: SocketIOServer, room: Room, event: string) {
  for (const player of room.players) {
    const state = buildStateForPlayer(room, player.id);
    io.to(player.socketId).emit(event, state);
  }
}

async function getRandomQuestion(usedIds: Set<number>) {
  const allQuestions = await db.select().from(questionsTable);
  const available = allQuestions.filter((q) => !usedIds.has(q.id));
  if (available.length === 0) {
    usedIds.clear();
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

export function initSocketIO(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "Socket connected");

    socket.on("join-room", async ({ roomCode, playerName, playerId }: { roomCode: string; playerName: string; playerId?: string }) => {
      const code = roomCode.toUpperCase();
      const stablePlayerId = playerId || socket.id; // Fallback to socket ID if not provided

      if (!rooms.has(code)) {
        rooms.set(code, {
          code,
          players: [],
          phase: "lobby",
          currentJudgeIndex: 0,
          currentTruthTellerId: null,
          currentQuestion: null,
          roundNumber: 0,
          hostPlayerId: null,
          lastRoundResult: null,
          usedQuestionIds: new Set(),
        });
      }

      const room = rooms.get(code)!;
      const existingPlayer = room.players.find((p) => p.id === stablePlayerId);

      // نمنع الدخول فقط لو هو لاعب جديد واللعبة بدأت بالفعل
      if (!existingPlayer && room.phase !== "lobby") {
        socket.emit("error", { message: "Game already in progress" });
        return;
      }

      if (!existingPlayer) {
        const newPlayer: Player = {
          id: stablePlayerId,
          name: playerName.trim() || "Player",
          score: 0,
          socketId: socket.id,
        };
        room.players.push(newPlayer);
        if (room.players.length === 1) {
          room.hostPlayerId = newPlayer.id;
        }
      } else {
        // Player is reconnecting - update their socket ID
        existingPlayer.socketId = socket.id;
      }

      socket.join(code);
      emitToRoom(io, room, "room-joined");
    });

    socket.on("start-game", async ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      
      // Find the player for this socket connection
      const currentPlayer = room.players.find(p => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== room.hostPlayerId) {
        socket.emit("error", { message: "Only the host can start the game" });
        return;
      }
      if (room.players.length < 3) {
        socket.emit("error", { message: "Need at least 3 players to start" });
        return;
      }

      room.phase = "card-display";
      room.roundNumber = 1;
      room.currentJudgeIndex = Math.floor(Math.random() * room.players.length);

      const nonJudgePlayers = room.players.filter((_, i) => i !== room.currentJudgeIndex);
      const truthTeller = nonJudgePlayers[Math.floor(Math.random() * nonJudgePlayers.length)];
      room.currentTruthTellerId = truthTeller.id;

      const question = await getRandomQuestion(room.usedQuestionIds);
      room.currentQuestion = { id: question.id, question: question.question, answer: question.answer };
      room.usedQuestionIds.add(question.id);
      room.lastRoundResult = null;

      emitToRoom(io, room, "game-started");
    });

    socket.on("next-phase", ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const judge = room.players[room.currentJudgeIndex];
      const currentPlayer = room.players.find(p => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== judge?.id) return;

      room.phase = "verbal";
      emitToRoom(io, room, "phase-changed");
    });

    socket.on("start-voting", ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const judge = room.players[room.currentJudgeIndex];
      const currentPlayer = room.players.find(p => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== judge?.id) return;

      room.phase = "voting";
      emitToRoom(io, room, "voting-started");
    });

    socket.on("submit-vote", ({ roomCode, votedPlayerId }: { roomCode: string; votedPlayerId: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const judge = room.players[room.currentJudgeIndex];
      const currentPlayer = room.players.find(p => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== judge?.id) return;

      const judgeGuessedRight = votedPlayerId === room.currentTruthTellerId;
      const truthTeller = room.players.find((p) => p.id === room.currentTruthTellerId);
      const votedFor = room.players.find((p) => p.id === votedPlayerId);

      room.lastRoundResult = {
        judgeGuessedRight,
        truthTellerId: room.currentTruthTellerId ?? "",
        truthTellerName: truthTeller?.name ?? "Unknown",
        votedForId: votedPlayerId,
        votedForName: votedFor?.name ?? "Unknown",
      };

      if (judgeGuessedRight) {
        if (judge) judge.score += 1;
      } else {
        // When the judge is wrong, only truth-teller and the voted player can score.
        if (truthTeller) truthTeller.score += 1;
        if (votedFor && votedFor.id !== room.currentTruthTellerId) {
          votedFor.score += 1;
        }
      }

      room.phase = "scoring";
      emitToRoom(io, room, "round-ended");
    });

    socket.on("next-round", async ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const judge = room.players[room.currentJudgeIndex];
      const currentPlayer = room.players.find(p => p.socketId === socket.id);
      const isJudge = currentPlayer && currentPlayer.id === judge?.id;
      const isHost = currentPlayer && currentPlayer.id === room.hostPlayerId;
      if (!isJudge && !isHost) return;

      // فحص هل في فائز؟
      const hasWinner = room.players.some(p => p.score >= 6);
      if (hasWinner) {
        room.phase = "game-over";
        emitToRoom(io, room, "phase-changed");
        return;
      }

      room.roundNumber += 1;
      room.currentJudgeIndex = (room.currentJudgeIndex + 1) % room.players.length;

      const nonJudgePlayers = room.players.filter((_, i) => i !== room.currentJudgeIndex);
      const truthTeller = nonJudgePlayers[Math.floor(Math.random() * nonJudgePlayers.length)];
      room.currentTruthTellerId = truthTeller.id;

      const question = await getRandomQuestion(room.usedQuestionIds);
      room.currentQuestion = { id: question.id, question: question.question, answer: question.answer };
      room.usedQuestionIds.add(question.id);
      room.lastRoundResult = null;
      room.phase = "card-display";

      emitToRoom(io, room, "phase-changed");
    });

    // إضافة الحدث الخاص بإعادة اللعب (الذي كان مفقوداً)
    socket.on("play-again", ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const currentPlayer = room.players.find(p => p.socketId === socket.id);
      
      // الهوست بس هو اللي يقدر يعيد اللعبة
      if (!currentPlayer || currentPlayer.id !== room.hostPlayerId) return;

      room.phase = "lobby";
      room.players.forEach(p => p.score = 0); // تصفير النقاط
      room.roundNumber = 0;
      room.usedQuestionIds.clear();
      room.lastRoundResult = null;
      room.currentQuestion = null;
      
      emitToRoom(io, room, "phase-changed");
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket disconnected");
      for (const [code, room] of rooms.entries()) {
        const idx = room.players.findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          const disconnectingPlayer = room.players[idx];
          if (room.phase === "lobby") {
            room.players.splice(idx, 1);
            if (room.players.length === 0) {
              rooms.delete(code);
            } else if (room.hostPlayerId === disconnectingPlayer.id && room.players.length > 0) {
              room.hostPlayerId = room.players[0].id;
            }
            if (rooms.has(code)) {
              emitToRoom(io, room, "room-joined");
            }
          }
        }
      }
    });
  });
}