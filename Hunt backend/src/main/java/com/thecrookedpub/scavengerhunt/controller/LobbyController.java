package com.thecrookedpub.scavengerhunt.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import com.thecrookedpub.scavengerhunt.controller.model.*;
import com.thecrookedpub.scavengerhunt.service.*;


@Controller
public class LobbyController {
    private final List<Lobby> lobbies = new ArrayList<>(); // This list holds all the lobbies

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    LobbyHelper helper = new LobbyHelper();
    private final List<List<Integer>> correctAnswers = LobbyHelper.initializeCorrectAnswers();

    @MessageMapping("/lobby/create")
    @SendTo("/topic/lobbyState")
    public Lobby createLobby(Lobby lobby) {
        lobby.setAnswers(helper.generateDefaultAnswers());
        lobbies.add(lobby);
        return lobby;
    }

    @MessageMapping("/lobby/join")
    public void joinLobby(Lobby lobby) {
        System.out.println("Received request to join lobby with code: " + lobby.getLobbyCode());

        String lobbyCode = lobby.getLobbyCode();
        Lobby existingLobby = helper.findLobbyByCode(lobbyCode, lobbies);
        if (existingLobby != null) {
            System.out.println("Found existing lobby with code: " + lobbyCode);

            List<String> players = existingLobby.getPlayers();
            players.addAll(lobby.getPlayers());
            existingLobby.setPlayers(players);

            List<String> playerIds = existingLobby.getPlayerIds();
            playerIds.addAll(lobby.getPlayerIds());
            existingLobby.setPlayerIds(playerIds);

            System.out.println(playerIds);

            System.out.println("User(s) joined lobby: " + lobbyCode);
            existingLobby.setStatus("JOINED");
            simpMessagingTemplate.convertAndSendToUser(lobby.getLobbyCode(), "/private", existingLobby);
        } else {
            System.out.println("No existing lobby found for code: " + lobbyCode);
        }
    }

    @MessageMapping("/lobby/update")
    public void updateLobby(@Payload Lobby lobby) {
        String lobbyCode = lobby.getLobbyCode();
        Lobby existingLobby = helper.findLobbyByCode(lobbyCode, lobbies);
        
        if (existingLobby != null) {
            List<List<Integer>> lobbyAnswers = lobby.getAnswers();
            int rowNum = lobby.getQuestion();
            
            if (lobbyAnswers.size() == 1 && lobbyAnswers.get(0).size() == 3) {
                List<Integer> lobbyRow = lobbyAnswers.get(0);
                List<Integer> correctRow = correctAnswers.get(rowNum);
                existingLobby.setQuestion(rowNum);
                if (lobbyRow.equals(correctRow)) {
                    existingLobby.setAnswers(Collections.singletonList(correctRow));
                    existingLobby.setStatus("SUCCESS");
                    
                } else {
                    existingLobby.setStatus("FAILED");
                }
            }

            simpMessagingTemplate.convertAndSendToUser(lobby.getLobbyCode(), "/private", existingLobby);
            System.out.println("Sent lobby update to all users in lobby: " + lobbyCode);
        }
    }
}