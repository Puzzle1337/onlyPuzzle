package com.example.onlypuzzle.system.exception;
import com.example.onlypuzzle.system.util.Result;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import com.example.onlypuzzle.system.util.Result;

@RestControllerAdvice
//更新GlobalExceptionHandler使用Result.error()统一异常处理返回格式
public class GlobalExceptionHandler {
    @ExceptionHandler(ExceptionClass.class)
    public Result<?> handleException(ExceptionClass e){
        return Result.error(e.getExceptionNum(),e.getMsg());
    }
    @ExceptionHandler(JwtException.class)
    public Result<?> handleJwt(JwtException e){
        return Result.error(401,"Token无效");
    }
    @ExceptionHandler(ExpiredJwtException.class)        // 过期：明确的401
    public Result<?> handleExpired(ExpiredJwtException e) {
        return Result.error(401, "登录已过期，请重新登录");
    }
}