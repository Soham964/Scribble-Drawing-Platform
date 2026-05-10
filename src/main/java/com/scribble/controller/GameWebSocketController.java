package com.scribble.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.scribble.dto.RoomStateDTO;
import com.scribble.dto.ScoreUpdateDTO;
import com.scribble.engine.RoundTimer;
import com.scribble.model.ChatMessage;
import com.scribble.model.DrawData;
import com.scribble.model.Player;
import com.scribble.model.Room;
import com.scribble.service.RoomService;
import com.scribble.service.WordService;

@Controller
public class GameWebSocketController {

    @Autowired private RoomService          roomService;
    @Autowired private WordService          wordService;
    @Autowired private RoundTimer           roundTimer;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    // ═══════════════════════════════════════════════════════════════════════
    // JOIN
    // ═══════════════════════════════════════════════════════════════════════
    @MessageMapping("/join")
    public void joinRoom(ChatMessage message) {
        String playerName = message.getSender();
        String roomId     = message.getRoomId().trim().toLowerCase();

        System.out.println("[WS] join: room=" + roomId + " sender=" + playerName);

        Room room = roomService.getOrCreateRoom(roomId);

        boolean playerExists = room.getPlayers().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(playerName));

        if (!playerExists) {
            if (room.isFull()) {
                System.out.println("[WS] join: room " + roomId + " is full, rejecting " + playerName);
                ChatMessage err = new ChatMessage();
                err.setSender("System");
                err.setContent("ROOM_FULL: Room is full (" + room.getMaxPlayers() + "/" + room.getMaxPlayers() + ")");
                err.setRoomId(roomId);
                messagingTemplate.convertAndSend("/topic/error/" + roomId + "/" + playerName, err);
                return;
            }
            room.addPlayer(new Player(UUID.randomUUID().toString(), playerName));
            System.out.println("[WS] join: added " + playerName + " to room " + roomId);
        }

        room.dedupePlayers();

        // Start game only when we have at least 2 players AND no drawer yet
        if (room.getCurrentDrawer() == null && room.getPlayers().size() >= 2) {
            Player first = room.getPlayers().get(0);
            room.setCurrentDrawer(first);
            room.assignWord(wordService.getRandomWord());
            System.out.println("[WS] join: started game with " + room.getPlayers().size() + " players, drawer=" + first.getName());
            roomService.save(room);
            roundTimer.startNextRound(room);
        } else {
            roomService.save(room);
            if (room.getCurrentDrawer() == null) {
                System.out.println("[WS] join: waiting for more players (" + room.getPlayers().size() + "/" + 2 + " minimum)");
            }
        }

        // Always broadcast to ALL players so everyone sees the updated player list
        broadcast(room);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DRAW
    // ═══════════════════════════════════════════════════════════════════════
    @MessageMapping("/draw")
    public void draw(DrawData drawData) {
        String roomId = drawData.getRoomId().trim().toLowerCase();
        Room   room   = roomService.getRoom(roomId);
        if (room == null) return;

        Player drawer = room.getCurrentDrawer();
        if (drawer != null && drawer.getName().equals(drawData.getSender())) {
            messagingTemplate.convertAndSend("/topic/draw/" + roomId, drawData);
            // No need to save — draw events are transient, not persisted
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CHAT / GUESS
    // ═══════════════════════════════════════════════════════════════════════
    @MessageMapping("/chat")
    public void chat(ChatMessage message) {
        String roomId = message.getRoomId().trim().toLowerCase();
        Room   room   = roomService.getRoom(roomId);
        if (room == null) return;

        Player currentDrawer = room.getCurrentDrawer();
        if (currentDrawer != null && currentDrawer.getName().equals(message.getSender())) return;

        if (room.getCurrentWord() != null &&
                message.getContent().equalsIgnoreCase(room.getCurrentWord())) {

            String guessedWord = room.getCurrentWord();

            // Score guesser
            room.getPlayers().stream()
                    .filter(p -> p.getName().equals(message.getSender()))
                    .findFirst()
                    .ifPresent(p -> p.addScore(10));

            // Score drawer
            if (currentDrawer != null) currentDrawer.addScore(5);

            rotateDrawer(room);   // saves internally

            room.dedupePlayers();
            messagingTemplate.convertAndSend(
                    "/topic/score/" + roomId,
                    new ScoreUpdateDTO(roomId, room.getPlayers(), guessedWord));
            broadcast(room);

            message.setContent(message.getSender() + " guessed the word!");
        }

        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private void rotateDrawer(Room room) {
        var players = room.getPlayers();
        if (players.isEmpty()) return;

        Player current = room.getCurrentDrawer();
        // Match by name — object identity fails after Redis deserialization
        int idx = -1;
        if (current != null) {
            for (int i = 0; i < players.size(); i++) {
                if (players.get(i).getName().equalsIgnoreCase(current.getName())) {
                    idx = i;
                    break;
                }
            }
        }
        Player next = players.get((idx + 1) % players.size());

        room.setCurrentDrawer(next);
        room.assignWord(wordService.getRandomWord());

        roomService.save(room);
        roundTimer.startNextRound(room);
    }

    /** Broadcast current room state to all subscribers. */
    void broadcast(Room room) {
        room.dedupePlayers();
        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomId(), buildDTO(room));
    }

    RoomStateDTO buildDTO(Room room) {
        room.dedupePlayers();
        return new RoomStateDTO(
                room.getRoomId(),
                room.getPlayers(),
                room.getMaskedWord(),
                room.getCurrentWord(),
                room.getCurrentDrawer() != null ? room.getCurrentDrawer().getName() : null,
                room.getMaxPlayers());
    }
}
