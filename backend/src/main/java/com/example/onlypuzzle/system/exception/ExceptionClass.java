package com.example.onlypuzzle.system.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExceptionClass extends RuntimeException {
    private  final int exceptionNum;
    private  final String msg;

    public int getExceptionNum(){
        return exceptionNum;
    }
    public String getMsg(){
        return msg;
    }
}
