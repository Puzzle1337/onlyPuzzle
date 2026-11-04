//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.config.Web;

import com.example.onlypuzzle.config.JwtAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173")   // ← 允许这个前端地址
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new JwtAuthInterceptor())
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/user/login",
                "/user/register",
                "/post/list",        // 帖子列表是公开接口，不需要登录
                "/post/all",         // 主页帖子流，公开
                "/comment/list"      // 评论列表，公开
            );
    }
}
