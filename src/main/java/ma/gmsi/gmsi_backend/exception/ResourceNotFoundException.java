// src/main/java/ma/gmsi/gmsi_backend/exception/ResourceNotFoundException.java
package ma.gmsi.gmsi_backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}