package ma.gmsi.gmsi_backend.entity;

import ma.gmsi.gmsi_backend.entity.enums.NiveauDifficulte;
import ma.gmsi.gmsi_backend.entity.enums.NiveauPriorite;
import ma.gmsi.gmsi_backend.entity.enums.StatutIntervention;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "intervention")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "reference", nullable = false, unique = true)
    private String reference;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_demande", nullable = false, unique = true)
    private DemandeIntervention demande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_responsable", nullable = false)
    private Utilisateur responsable;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private StatutIntervention statut = StatutIntervention.PLANIFIEE;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_priorite", nullable = false)
    private NiveauPriorite niveauPriorite;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_difficulte", nullable = false)
    private NiveauDifficulte niveauDifficulte;

    @Column(name = "date_planifiee")
    private LocalDateTime datePlanifiee;

    @Column(name = "date_debut_reelle")
    private LocalDateTime dateDebutReelle;

    @Column(name = "date_fin_reelle")
    private LocalDateTime dateFinReelle;

    @Column(name = "cloture_validee", nullable = false)
    @Builder.Default
    private boolean clotureValidee = false;

    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;
}