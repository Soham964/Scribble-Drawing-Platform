package com.scribble.dto;

import java.util.List;

import com.scribble.model.Player;

public class RoomStateDTO {

    private String roomId;
    private List<Player> players;
    private String maskedWord;
    private String currentWord;
    private String drawerName;
    private int maxPlayers;

    public RoomStateDTO(String roomId, List<Player> players, String maskedWord, String currentWord, String drawerName, int maxPlayers) {
        this.roomId = roomId;
        this.players = players;
        this.maskedWord = maskedWord;
        this.currentWord = currentWord;
        this.drawerName = drawerName;
        this.maxPlayers = maxPlayers;
    }

    public String getRoomId() {
        return roomId;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public String getMaskedWord() {
        return maskedWord;
    }

    public String getCurrentWord() {
        return currentWord;
    }

    public String getDrawerName() {
        return drawerName;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }
}
