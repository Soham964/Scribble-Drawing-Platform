package com.scribble.controller;

import com.scribble.model.Room;
import com.scribble.service.RoomService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "${app.allowed-origins}")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // POST /api/rooms/create  { "maxPlayers": 6 }
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody Map<String, Object> body) {
        int maxPlayers = 8;
        if (body.containsKey("maxPlayers")) {
            try {
                maxPlayers = Integer.parseInt(body.get("maxPlayers").toString());
                maxPlayers = Math.max(2, Math.min(12, maxPlayers));
            } catch (NumberFormatException ignored) {}
        }

        String roomId = UUID.randomUUID().toString().substring(0, 6).toLowerCase();
        while (roomService.getRoom(roomId) != null) {
            roomId = UUID.randomUUID().toString().substring(0, 6).toLowerCase();
        }

        Room room = roomService.createRoom(roomId, maxPlayers);
        System.out.println("[REST] Created room=" + roomId + " maxPlayers=" + maxPlayers);

        return ResponseEntity.ok(Map.of(
                "roomId",     room.getRoomId(),
                "maxPlayers", room.getMaxPlayers()
        ));
    }

    // GET /api/rooms/{roomId}
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId) {
        Room room = roomService.getRoom(roomId.trim().toLowerCase());
        if (room == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Room not found"));
        }
        return ResponseEntity.ok(Map.of(
                "roomId",         room.getRoomId(),
                "maxPlayers",     room.getMaxPlayers(),
                "currentPlayers", room.getPlayers().size(),
                "isFull",         room.isFull()
        ));
    }
}
