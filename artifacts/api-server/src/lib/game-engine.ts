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
const pendingDisconnectRemovals = new Map<string, ReturnType<typeof setTimeout>>();
const DISCONNECT_GRACE_MS = 12_000;

function buildStateForPlayer(room: Room, playerId: string) {
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
      const stablePlayerId = playerId || socket.id;

      const pendingKey = `${code}:${stablePlayerId}`;
      const pendingRemoval = pendingDisconnectRemovals.get(pendingKey);
      if (pendingRemoval) {
        clearTimeout(pendingRemoval);
        pendingDisconnectRemovals.delete(pendingKey);
      }

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
        existingPlayer.socketId = socket.id;
      }

      socket.join(code);
      emitToRoom(io, room, "room-joined");
    });

    socket.on("transfer-host", ({ roomCode, newHostPlayerId }: { roomCode: string; newHostPlayerId: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;

      const currentPlayer = room.players.find((p) => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== room.hostPlayerId) {
        socket.emit("error", { message: "Only the host can transfer host role" });
        return;
      }

      const nextHost = room.players.find((p) => p.id === newHostPlayerId);
      if (!nextHost) {
        socket.emit("error", { message: "Selected player not found" });
        return;
      }

      room.hostPlayerId = nextHost.id;
      emitToRoom(io, room, "room-joined");
    });

    socket.on("start-game", async ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      const currentPlayer = room.players.find((p) => p.socketId === socket.id);
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
      const currentPlayer = room.players.find((p) => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== judge?.id) return;

      room.phase = "verbal";
      emitToRoom(io, room, "phase-changed");
    });

    socket.on("change-question", async ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room || room.phase !== "card-display") return;

      const judge = room.players[room.currentJudgeIndex];
      const currentPlayer = room.players.find((p) => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== judge?.id) return;

      const previousQuestionId = room.currentQuestion?.id ?? null;

      let nextQuestion = await getRandomQuestion(room.usedQuestionIds);
      room.usedQuestionIds.add(nextQuestion.id);

      if (previousQuestionId && nextQuestion.id === previousQuestionId) {
        const retryQuestion = await getRandomQuestion(room.usedQuestionIds);
        nextQuestion = retryQuestion;
        room.usedQuestionIds.add(nextQuestion.id);
      }

      room.currentQuestion = {
        id: nextQuestion.id,
        question: nextQuestion.question,
        answer: nextQuestion.answer,
      };

      emitToRoom(io, room, "phase-changed");
    });

    socket.on("start-voting", ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const judge = room.players[room.currentJudgeIndex];
      const currentPlayer = room.players.find((p) => p.socketId === socket.id);
      if (!currentPlayer || currentPlayer.id !== judge?.id) return;

      room.phase = "voting";
      emitToRoom(io, room, "voting-started");
    });

    socket.on("submit-vote", ({ roomCode, votedPlayerId }: { roomCode: string; votedPlayerId: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const judge = room.players[room.currentJudgeIndex];
      const currentPlayer = room.players.find((p) => p.socketId === socket.id);
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
      const currentPlayer = room.players.find((p) => p.socketId === socket.id);
      const isJudge = currentPlayer && currentPlayer.id === judge?.id;
      const isHost = currentPlayer && currentPlayer.id === room.hostPlayerId;
      if (!isJudge && !isHost) return;

      const hasWinner = room.players.some((p) => p.score >= 6);
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

    socket.on("play-again", ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const currentPlayer = room.players.find((p) => p.socketId === socket.id);

      if (!currentPlayer || currentPlayer.id !== room.hostPlayerId) return;

      room.phase = "lobby";
      room.players.forEach((p) => (p.score = 0));
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
        if (idx === -1) continue;

        const disconnectingPlayer = room.players[idx];
        const pendingKey = `${code}:${disconnectingPlayer.id}`;
        if (pendingDisconnectRemovals.has(pendingKey)) continue;

        const disconnectedSocketId = socket.id;
        const timeout = setTimeout(() => {
          pendingDisconnectRemovals.delete(pendingKey);

          const latestRoom = rooms.get(code);
          if (!latestRoom) return;

          const latestIdx = latestRoom.players.findIndex((p) => p.id === disconnectingPlayer.id);
          if (latestIdx === -1) return;

          const latestPlayer = latestRoom.players[latestIdx];
          if (latestPlayer.socketId !== disconnectedSocketId) return;

          latestRoom.players.splice(latestIdx, 1);

          if (latestRoom.players.length === 0) {
            rooms.delete(code);
            return;
          }

          if (latestRoom.hostPlayerId === disconnectingPlayer.id) {
            latestRoom.hostPlayerId = latestRoom.players[0].id;
          }

          emitToRoom(io, latestRoom, "room-joined");
        }, DISCONNECT_GRACE_MS);

        pendingDisconnectRemovals.set(pendingKey, timeout);
      }
    });
  });
}
