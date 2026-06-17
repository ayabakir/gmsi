// src/main/java/ma/gmsi/gmsi_backend/audit/Auditable.java
package ma.gmsi.gmsi_backend.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String action();           // ex: "CREATION_CATEGORIE"
    String entiteType();       // ex: "CATEGORIE"
}