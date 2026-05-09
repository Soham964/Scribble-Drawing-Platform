package com.scribble.dto;

import java.util.List;

import com.scribble.model.Player;

public class ScoreUpdateDTO {

    private String roomId;
    private List<Player> players;
    private String word;

    public ScoreUpdateDTO(String roomId, List<Player> players, String word) {
        this.roomId = roomId;
        this.players = players;
        this.word = word;
    }

    public String getRoomId() {
        return roomId;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public String getWord() {
        return word;
    }
}
