package com.gmsi.entity;

import com.gmsi.entity.enums.NiveauUrgence;
import com.gmsi.entity.enums.StatutDemande;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "demande_intervention")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeIntervention {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "reference", nullable = false, unique = true)
    private String reference;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_urgence", nullable = false)
    private NiveauUrgence niveauUrgence;

    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Utilisateur employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_equipement", nullable = false)
    private Equipement equipement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie")
    private Categorie categorie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_localisation")
    private Localisation localisation;

    @CreatedDate
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
}
