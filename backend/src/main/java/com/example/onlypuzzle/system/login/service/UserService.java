//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.system.login.service;

import com.example.onlypuzzle.system.login.model.LoginResponse;
import com.example.onlypuzzle.system.login.model.User;

public interface UserService {
     LoginResponse login(User user);

     User register(User user);

     Integer findByUsername(String username);
}
