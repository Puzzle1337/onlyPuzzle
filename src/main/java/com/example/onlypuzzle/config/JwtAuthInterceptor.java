package com.example.onlypuzzle.config;

import com.example.onlypuzzle.system.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class JwtAuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler){
        String header = request.getHeader("Authorization");
        if (header == null || header.isEmpty() || !header.startsWith("Bearer ")){
            response.setStatus(401);
            return false;
        }else{
            String token = header.substring(7);
            Claims claims = JwtUtil.parseToken(token);
            request.setAttribute("userId",claims.get("userId"));
            return true;
        }

    }
}