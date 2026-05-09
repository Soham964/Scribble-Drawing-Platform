package com.scribble.service;

import com.scribble.model.Room;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private static final String KEY_PREFIX = "room:";

    private final RedisTemplate<String, Room> redis;
    private final Duration roomTtl;

    public RoomService(
            RedisTemplate<String, Room> redis,
            @Value("${app.room-ttl-seconds:7200}") long ttlSeconds) {
        this.redis   = redis;
        this.roomTtl = Duration.ofSeconds(ttlSeconds);
    }

    // ── Key helper ──────────────────────────────────────────────────────────

    private String key(String roomId) {
        return KEY_PREFIX + roomId.trim().toLowerCase();
    }

    // ── CRUD ────────────────────────────────────────────────────────────────

    /** Get existing room or create a new one with default maxPlayers. */
    public Room getOrCreateRoom(String roomId) {
        Room existing = getRoom(roomId);
        if (existing != null) return existing;
        Room room = new Room(roomId.trim().toLowerCase());
        save(room);
        return room;
    }

    /** Create a room with a specific player limit. */
    public Room createRoom(String roomId, int maxPlayers) {
        Room room = new Room(roomId.trim().toLowerCase(), maxPlayers);
        save(room);
        return room;
    }

    /** Load room from Redis. Returns null if not found. */
    public Room getRoom(String roomId) {
        return redis.opsForValue().get(key(roomId));
    }

    /**
     * Persist room back to Redis and reset its TTL.
     * Call this after every mutation (player join, draw, guess, etc.).
     */
    public void save(Room room) {
        redis.opsForValue().set(key(room.getRoomId()), room, roomTtl);
    }

    /** Delete a room from Redis. */
    public void removeRoom(String roomId) {
        redis.delete(key(roomId));
    }

    /** List all rooms (used for admin/debug — scans keys). */
    public Collection<Room> getAllRooms() {
        Set<String> keys = redis.keys(KEY_PREFIX + "*");
        if (keys == null || keys.isEmpty()) return java.util.List.of();
        return redis.opsForValue().multiGet(keys)
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
