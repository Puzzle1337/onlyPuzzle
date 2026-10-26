package com.example.onlypuzzle;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.onlypuzzle.**.mapper")
public class OnlypuzzleApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlypuzzleApplication.class, args);
    }

}
