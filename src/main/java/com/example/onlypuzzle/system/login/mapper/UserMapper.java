package com.example.onlypuzzle.system.login.mapper;

import com.example.onlypuzzle.system.login.model.User;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
   User login(User user);
   int insert(User user);
   Integer findByUsername(String username);
}
