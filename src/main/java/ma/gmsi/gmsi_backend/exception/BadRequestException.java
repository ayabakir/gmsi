// src/main/java/ma/gmsi/gmsi_backend/exception/BadRequestException.java
package ma.gmsi.gmsi_backend.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}