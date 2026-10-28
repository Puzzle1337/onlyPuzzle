package com.example.onlypuzzle.system.login.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;   // 加上JsonIgnore注解，密码字段不会被序列化到 JSON 中
import java.time.LocalDateTime;


@Data
public class User {
    private Long id;
    private String username;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private LocalDateTime createTime;
}
