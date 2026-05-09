package com.scribble.engine;

import com.scribble.dto.RoomStateDTO;
import com.scribble.dto.ScoreUpdateDTO;
import com.scribble.model.Player;
import com.scribble.model.Room;
import com.scribble.service.RoomService;
import com.scribble.service.WordService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoundTimer {

    private final WordService            wordService;
    private final SimpMessagingTemplate  messagingTemplate;
    private final RoomService            roomService;
    private final Map<String, Thread>    activeTimers = new ConcurrentHashMap<>();

    public RoundTimer(WordService wordService,
                      SimpMessagingTemplate messagingTemplate,
                      RoomService roomService) {
        this.wordService       = wordService;
        this.messagingTemplate = messagingTemplate;
        this.roomService       = roomService;
    }

    public void startNextRound(Room room) {
        String roomId = room.getRoomId();

        // Cancel existing timer
        Thread old = activeTimers.get(roomId);
        if (old != null && old.isAlive()) {
            old.interrupt();
        }

        Thread timer = new Thread(() -> {
            try {
                int    totalSeconds   = 60;
                int    maxReveal      = room.getMaxRevealCount();
                double revealInterval = maxReveal > 0
                        ? (double) totalSeconds / (maxReveal + 1)
                        : Double.POSITIVE_INFINITY;

                for (int seconds = totalSeconds; seconds >= 0; seconds--) {
                    if (Thread.currentThread().isInterrupted()) return;

                    // Hint reveals
                    int elapsed     = totalSeconds - seconds;
                    int targetReveal = maxReveal > 0
                            ? Math.min(maxReveal, (int) Math.floor(elapsed / revealInterval))
                            : 0;

                    // Re-fetch room from Redis so we work on latest state
                    Room current = roomService.getRoom(roomId);
                    if (current == null) return; // room was deleted

                    boolean revealed = current.revealUpTo(targetReveal);
                    if (revealed) {
                        roomService.save(current);
                        messagingTemplate.convertAndSend("/topic/room/" + roomId, buildDTO(current));
                    }

                    messagingTemplate.convertAndSend("/topic/timer/" + roomId, seconds);

                    Thread.sleep(1000);
                }

                // Time up
                Room current = roomService.getRoom(roomId);
                if (current == null) return;

                current.dedupePlayers();
                messagingTemplate.convertAndSend(
                        "/topic/score/" + roomId,
                        new ScoreUpdateDTO(roomId, current.getPlayers(), current.getCurrentWord()));

                rotateDrawer(current);   // saves to Redis
                assignNewWord(current);
                roomService.save(current);

                messagingTemplate.convertAndSend("/topic/room/" + roomId, buildDTO(current));
                startNextRound(current);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                System.err.println("[RoundTimer] Error in room=" + roomId + ": " + e.getMessage());
            } finally {
                activeTimers.remove(roomId);
            }
        });

        timer.setName("Timer-" + roomId);
        timer.setDaemon(true);
        activeTimers.put(roomId, timer);
        timer.start();
    }

    private void rotateDrawer(Room room) {
        List<Player> players = room.getPlayers();
        Player current = room.getCurrentDrawer();
        if (players.isEmpty() || current == null) return;
        int idx  = players.indexOf(current);
        int next = (idx + 1) % players.size();
        room.setCurrentDrawer(players.get(next));
    }

    private void assignNewWord(Room room) {
        room.assignWord(wordService.getRandomWord());
    }

    private RoomStateDTO buildDTO(Room room) {
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
