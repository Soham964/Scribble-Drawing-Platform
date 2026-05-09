package com.scribble.model;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Room is stored as JSON in Redis (via JacksonJsonRedisSerializer / Jackson 3).
 * All fields must be serializable — no final fields, no Random stored.
 */
public class Room {

    private String roomId;
    private List<Player> players    = new ArrayList<>();
    private String currentWord;
    private Player currentDrawer;
    private Set<Integer>  revealedIndexes = new HashSet<>();
    private List<Integer> revealOrder     = new ArrayList<>();
    private int maxPlayers = 8;

    // Required by Jackson
    public Room() {}

    public Room(String roomId) {
        this.roomId = roomId;
    }

    public Room(String roomId, int maxPlayers) {
        this.roomId     = roomId;
        this.maxPlayers = maxPlayers;
    }

    // ── Getters / Setters ──────────────────────────────────────────────────

    public String getRoomId()                      { return roomId; }
    public void   setRoomId(String roomId)         { this.roomId = roomId; }

    public List<Player> getPlayers()               { return players; }
    public void         setPlayers(List<Player> p) { this.players = p; }

    public String getCurrentWord()                 { return currentWord; }
    /** Used by Jackson — does NOT reset reveals so stored hint state is preserved. */
    public void   setCurrentWord(String w)         { this.currentWord = w; }

    public Player getCurrentDrawer()               { return currentDrawer; }
    public void   setCurrentDrawer(Player d)       { this.currentDrawer = d; }

    public Set<Integer>  getRevealedIndexes()                   { return revealedIndexes; }
    public void          setRevealedIndexes(Set<Integer> s)     { this.revealedIndexes = s; }

    public List<Integer> getRevealOrder()                       { return revealOrder; }
    public void          setRevealOrder(List<Integer> o)        { this.revealOrder = o; }

    public int  getMaxPlayers()                    { return maxPlayers; }
    public void setMaxPlayers(int n)               { this.maxPlayers = n; }

    // ── Business logic ─────────────────────────────────────────────────────

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    public void addPlayer(Player player) {
        dedupePlayers();
        this.players.add(player);
        dedupePlayers();
    }

    public void dedupePlayers() {
        Map<String, Player> byName = new LinkedHashMap<>();
        for (Player p : players) {
            if (p == null || p.getName() == null) continue;
            String key = p.getName().trim().toLowerCase();
            if (key.isEmpty()) continue;
            if (!byName.containsKey(key) || p.getScore() > byName.get(key).getScore()) {
                byName.put(key, p);
            }
        }
        players = new ArrayList<>(byName.values());
    }

    public int getMaxRevealCount() {
        if (currentWord == null) return 0;
        return Math.max(0, (int) Math.floor(currentWord.length() * 0.3));
    }

    public boolean revealUpTo(int count) {
        int target = Math.min(Math.max(count, 0), revealOrder.size());
        int before = revealedIndexes.size();
        for (int i = 0; i < target; i++) revealedIndexes.add(revealOrder.get(i));
        return revealedIndexes.size() != before;
    }

    public String getMaskedWord() {
        if (currentWord == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < currentWord.length(); i++) {
            char c = currentWord.charAt(i);
            if (c == ' ')                    { sb.append(' '); continue; }
            if (revealedIndexes.contains(i)) { sb.append(c);  continue; }
            sb.append('_');
        }
        return sb.toString();
    }

    /** Assign a new word and shuffle the reveal order. */
    public void assignWord(String word) {
        this.currentWord = word;
        resetReveals();
    }

    /** Shuffle reveal order for the current word (call after loading from Redis too). */
    public void resetReveals() {
        revealedIndexes.clear();
        if (currentWord == null) { revealOrder = new ArrayList<>(); return; }
        revealOrder = IntStream.range(0, currentWord.length())
                .boxed().collect(Collectors.toList());
        Collections.shuffle(revealOrder, new Random());
    }
}
