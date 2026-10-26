package com.example.onlypuzzle.config.Web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 根路径 → redirect 到 /login.html
        registry.addRedirectViewController("/", "/login.html");
        // 也可以加纯 forward 的
        // registry.addViewController("/home").setViewName("forward:/index.html");
    }
}