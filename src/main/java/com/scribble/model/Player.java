package com.scribble.model;

public class Player {

    private String id;
    private String name;
    private int score;

    // Required by Jackson for deserialization
    public Player() {}

    public Player(String id, String name) {
        this.id    = id;
        this.name  = name;
        this.score = 0;
    }

    public String getId()    { return id; }
    public String getName()  { return name; }
    public int    getScore() { return score; }

    public void setId(String id)     { this.id    = id; }
    public void setName(String name) { this.name  = name; }
    public void setScore(int score)  { this.score = score; }

    public void addScore(int points) { this.score += points; }
}
