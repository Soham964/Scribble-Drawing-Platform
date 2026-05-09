package com.scribble.config;

import com.scribble.dto.RoomStateDTO;
import com.scribble.model.Player;
import com.scribble.model.Room;
import com.scribble.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    @Autowired private RoomService           roomService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String playerName = (String) accessor.getSessionAttributes().get("playerName");
        String roomId     = (String) accessor.getSessionAttributes().get("roomId");

        if (playerName == null || roomId == null) return;

        Room room = roomService.getRoom(roomId);
        if (room == null) return;

        boolean removed = room.getPlayers().removeIf(p -> p.getName().equalsIgnoreCase(playerName));
        if (!removed) return;

        System.out.println("[Disconnect] Removed " + playerName + " from room " + roomId
                + ". Remaining: " + room.getPlayers().size());

        messagingTemplate.convertAndSend("/topic/chat/" + roomId,
                playerName + " left the game");

        // If drawer left, assign new one
        Player drawer = room.getCurrentDrawer();
        if (drawer != null && drawer.getName().equalsIgnoreCase(playerName)) {
            room.setCurrentDrawer(room.getPlayers().isEmpty() ? null : room.getPlayers().get(0));
        }

        if (room.getPlayers().isEmpty()) {
            roomService.removeRoom(roomId);
        } else {
            room.dedupePlayers();
            roomService.save(room);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, buildDTO(room));
        }
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
