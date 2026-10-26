package com.example.onlypuzzle.system.util;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class Result<T> {
    private int code;
    private String msg;
    private T data;

    public static <T> Result<T> success(T data) { 
        return new Result<>(200,"success",data);
     }
    public static <T> Result<T> error(int code, String msg) { 
        return new Result<>(code,msg,null);
     }
}