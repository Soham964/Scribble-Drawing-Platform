package com.scribble.model;

public class ChatMessage{
    private String sender;
    private String content;
    private String roomId;

    public ChatMessage(){
    }

    public String getSender(){
        return sender;
    }

    public void setSender(String sender){
        this.sender = sender;
    }

    public String getContent(){
        return content;
    }

    public void setContent(String content){
        this.content = content;
    } 
    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }      
}