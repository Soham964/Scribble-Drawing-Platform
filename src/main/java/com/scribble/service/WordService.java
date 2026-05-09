package com.scribble.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;

@Service

public class WordService{

    private final List<String> words = List.of(
            "apple",
            "car",
            "dog",
            "house",
            "tree",
            "phone",
            "pizza",
            "sun",
            "moon",
            "river"
    );

    private final Random random = new Random();

    public String getRandomWord(){
        int index = random.nextInt(words.size());
        return words.get(index);
    }
}