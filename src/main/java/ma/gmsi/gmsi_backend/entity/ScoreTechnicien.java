package com.gmsi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "score_technicien")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreTechnicien {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_technicien", nullable = false, unique = true)
    private Utilisateur technicien;

    // Score = Somme(note_i * Cd_i) / Somme(Cd_i)
    @Column(name = "score_pondere", precision = 4, scale = 2)
    private BigDecimal scorePondere;

    @Column(name = "note_brute_moyenne", precision = 4, scale = 2)
    private BigDecimal noteBruteMoyenne;

    @Column(name = "nb_evaluations", nullable = false)
    @Builder.Default
    private int nbEvaluations = 0;

    @Column(name = "date_calcul")
    private LocalDateTime dateCalcul;
}
