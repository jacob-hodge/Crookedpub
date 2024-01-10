package com.thecrookedpub.scavengerhunt.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import com.thecrookedpub.scavengerhunt.controller.model.Lobby;


public class LobbyHelper {

    public Lobby findLobbyByCode(String lobbyCode, List<Lobby> lobbies) {
        return lobbies.stream()
                .filter(lobby -> lobby.getLobbyCode().equals(lobbyCode))
                .findFirst()
                .orElse(null);
    }

    public List<List<Integer>> generateDefaultAnswers() {
    List<List<Integer>> defaultAnswers = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        List<Integer> answer = new ArrayList<>(Collections.nCopies(3, 0));
        defaultAnswers.add(answer);
    }
    return defaultAnswers;
    }
    
    public static List<List<Integer>> initializeCorrectAnswers() {
        List<List<Integer>> correctAnswers = new ArrayList<>();

        correctAnswers.add(List.of(9, 2, 6));
        correctAnswers.add(List.of(0, 0, 1));
        correctAnswers.add(List.of(1, 2, 3));
        correctAnswers.add(List.of(4, 5, 6));
        correctAnswers.add(List.of(1, 2, 3));
        correctAnswers.add(List.of(4, 5, 6));
        correctAnswers.add(List.of(1, 2, 3));
        correctAnswers.add(List.of(4, 5, 6));
        correctAnswers.add(List.of(1, 2, 3));
        correctAnswers.add(List.of(4, 5, 6));

        return correctAnswers;
    }



}
