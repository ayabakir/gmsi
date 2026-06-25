package ma.gmsi.gmsi_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.gmsi.gmsi_backend.entity.enums.StatutEquipement;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "equipement")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "reference", unique = true)
    private String reference;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "type", nullable = false)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private StatutEquipement statut = StatutEquipement.OPERATIONNEL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_localisation")
    private Localisation localisation;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_mise_en_service")
    private LocalDate dateMiseEnService;

    @CreatedDate
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
}