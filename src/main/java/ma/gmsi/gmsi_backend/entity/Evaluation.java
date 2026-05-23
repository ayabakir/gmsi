package com.gmsi.entity;

import com.gmsi.entity.enums.NiveauDifficulte;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "evaluation",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_intervention", "id_employe"}))
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_intervention", nullable = false)
    private Intervention intervention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Utilisateur employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_technicien", nullable = false)
    private Utilisateur technicien;

    @Min(1)
    @Max(5)
    @Column(name = "note", nullable = false)
    private int note;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_difficulte", nullable = false)
    private NiveauDifficulte niveauDifficulte;

    @CreatedDate
    @Column(name = "date_evaluation", updatable = false)
    private LocalDateTime dateEvaluation;
}
