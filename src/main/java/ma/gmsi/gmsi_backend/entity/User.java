package ma.gmsi.gmsi_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/*
 * SANS SPRING (approche classique) :
 * - Création manuelle de la table SQL + requêtes JDBC
 * - ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = ?")
 * AVEC SPRING DATA JPA :
 * - @Entity génère automatiquement la table
 * - Pas de SQL manuel, Hibernate gère tout
 */

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean actif = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}