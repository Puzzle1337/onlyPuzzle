//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.system.login.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long userId;
    private String username;
    private String token;
}
