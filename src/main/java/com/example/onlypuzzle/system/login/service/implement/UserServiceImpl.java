package com.example.onlypuzzle.system.login.service.implement;

import com.example.onlypuzzle.system.login.model.User;
import com.example.onlypuzzle.system.login.mapper.UserMapper;
import com.example.onlypuzzle.system.login.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;
    @Override
    public User login(User user) {
        User userInfo = userMapper.login(user);
        if(userInfo == null){
              throw new RuntimeException("用户不存在或密码错误");
        }
        return userInfo;
    }
}
