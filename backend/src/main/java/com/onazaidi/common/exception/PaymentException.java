package com.onazaidi.common.exception;

public class PaymentException extends BusinessException{
    public PaymentException(String message){
        super("PAYMENT_ERROR", message);
    }
    
}
