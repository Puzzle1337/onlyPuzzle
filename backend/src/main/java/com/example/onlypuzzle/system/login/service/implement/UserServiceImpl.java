//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.system.login.service.implement;

import com.example.onlypuzzle.system.exception.ExceptionClass;
import com.example.onlypuzzle.system.login.mapper.UserMapper;
import com.example.onlypuzzle.system.login.model.LoginResponse;
import com.example.onlypuzzle.system.login.model.User;
import com.example.onlypuzzle.system.login.service.UserService;
import com.example.onlypuzzle.system.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    public UserServiceImpl( UserMapper userMapper, PasswordEncoder passwordEncoder){
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }
    @Override
    public LoginResponse login(User user) {
        User userInfo = userMapper.login(user);
        if(userInfo == null || !passwordEncoder.matches(user.getPassword(), userInfo.getPassword())){
              throw new ExceptionClass(400,"用户不存在或密码错误");
        }
        return new LoginResponse(userInfo.getId(),userInfo.getUsername(),JwtUtil.generateToken(userInfo.getId(),userInfo.getUsername()));
    }
    @Override
    @Transactional
    public User register(User user){
        if(user.getUsername() == null || user.getUsername().isEmpty() || user.getPassword() == null || user.getPassword().isEmpty()){
            throw new ExceptionClass(402,"用户名或密码不可以为空");
        }//如果user.getUsername()为空或user.getPassword()为空，会直接抛出异常（如果isEmpty为空）
        if(findByUsername(user.getUsername()) != 0){
            throw new ExceptionClass(401,"用户名已存在");           
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));//BCrypt 故意慢，顺序反了白浪费 CPU
        userMapper.insert(user);
        return user;
    }
    @Override
    public Integer findByUsername(String username) {
        return userMapper.findByUsername(username);
    }
}
