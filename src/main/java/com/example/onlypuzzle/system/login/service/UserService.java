package com.example.onlypuzzle.system.login.service;
import com.example.onlypuzzle.system.login.model.User;
import org.springframework.stereotype.Service;
import com.example.onlypuzzle.system.login.model.LoginResponse;

@Service
public interface UserService {
     LoginResponse login(User user); 

     User register(User user);

     Integer findByUsername(String username);
}
