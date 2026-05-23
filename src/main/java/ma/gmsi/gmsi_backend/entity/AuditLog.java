package com.gmsi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "entite_type", nullable = false)
    private String entiteType;

    @Column(name = "id_entite")
    private UUID idEntite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @CreatedDate
    @Column(name = "date_action", updatable = false)
    private LocalDateTime dateAction;
}
