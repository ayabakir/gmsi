package com.gmsi.entity;

import com.gmsi.entity.enums.TypeMouvement;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mouvement_stock")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MouvementStock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_piece", nullable = false)
    private PieceRechange piece;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeMouvement type;

    @Column(name = "quantite", nullable = false)
    private int quantite;

    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @CreatedDate
    @Column(name = "date_mouvement", updatable = false)
    private LocalDateTime dateMouvement;
}
