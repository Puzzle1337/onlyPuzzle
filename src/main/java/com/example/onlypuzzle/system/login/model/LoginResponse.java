package com.example.onlypuzzle.system.login.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long userId;
    private String username;
    private String token;
}