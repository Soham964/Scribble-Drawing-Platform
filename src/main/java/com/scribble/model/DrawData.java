package com.scribble.model;

public class DrawData{

    private double x;
    private double y;
    private String color;
    private int brushSize;
    private boolean drawing;

    private String sender;
    private String roomId;

    public DrawData(){

    }

    public double getX(){
        return x;
    }

    public void setX(double x){
        this.x = x;
    }
    public double getY(){
        return y;
    }

    public void setY(double y){
        this.y = y;
    }

    public String getColor(){
        return color;
    }

    public void setColor(String color){
        this.color = color;
    }

    public int brushSize(){
        return brushSize;
    }

    public int getBrushSize(){
        return brushSize;
    }

    public void setBrushSize(int brushSize){
        this.brushSize = brushSize;
    } 

    public boolean isDrawing(){
        return drawing;
    }

    public void setDrawing(boolean drawing){
        this.drawing = drawing;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
}    


