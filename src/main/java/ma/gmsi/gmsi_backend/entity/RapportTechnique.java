package com.gmsi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rapport_technique")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RapportTechnique {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_intervention", nullable = false, unique = true)
    private Intervention intervention;

    @Column(name = "cause_panne", nullable = false, columnDefinition = "TEXT")
    private String causePanne;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "signature_employe")
    private String signatureEmploye;

    @CreatedDate
    @Column(name = "date_rapport", updatable = false)
    private LocalDateTime dateRapport;
}
