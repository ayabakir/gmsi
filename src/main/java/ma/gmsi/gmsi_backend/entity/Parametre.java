package ma.gmsi.gmsi_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "parametre")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Parametre {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Ex: COEFF_FACILE, COEFF_MOYEN, COEFF_DIFFICILE, COEFF_CRITIQUE, ANONYMAT_EVALUATION
    @Column(name = "cle", nullable = false, unique = true)
    private String cle;

    @Column(name = "valeur", nullable = false)
    private String valeur;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @LastModifiedDate
    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modifie_par")
    private Utilisateur modifiePar;
}
