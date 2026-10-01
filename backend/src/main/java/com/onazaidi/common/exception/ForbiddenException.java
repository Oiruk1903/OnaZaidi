package com.onazaidi.common.exception;

import org.springframework.web.client.HttpClientErrorException;

public class ForbiddenException extends BusinessException{
    public ForbiddenException(String message){
        super("FORBBIDEN", message);
    }
    
}
