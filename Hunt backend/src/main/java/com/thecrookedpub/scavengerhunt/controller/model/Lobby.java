package com.thecrookedpub.scavengerhunt.controller.model;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Lobby {
    private String lobbyCode;
    private List<String> players;
    private List<String> playerIds;
    private List<List<Integer>> answers;
    private String status;
    private Integer question;
}
