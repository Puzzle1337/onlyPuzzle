package com.example.onlypuzzle.system.login.service.implement;

import com.example.onlypuzzle.system.exception.ExceptionClass;
import com.example.onlypuzzle.system.login.model.User;
import com.example.onlypuzzle.system.login.mapper.UserMapper;
import com.example.onlypuzzle.system.login.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Override
    public User login(User user) {
        User userInfo = userMapper.login(user);
        if(userInfo == null || !passwordEncoder.matches(user.getPassword(), userInfo.getPassword())){
              throw new ExceptionClass(400,"用户不存在或密码错误");
        }
        return userInfo;
    }
    @Override
    public User register(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if(user.getUsername() == "" || user.getUsername() == null){
            throw new ExceptionClass(402,"不可以为空");
        }
        if(findByUsername(user.getUsername()) != 0){
            throw new ExceptionClass(401,"用户名已存在");           
        }
        userMapper.insert(user);
        return user;
    }
    @Override
    public Integer findByUsername(String username) {
        return userMapper.findByUsername(username);
    }
}
