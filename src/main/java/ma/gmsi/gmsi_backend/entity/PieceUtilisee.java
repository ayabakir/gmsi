package com.gmsi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "piece_utilisee")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieceUtilisee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rapport", nullable = false)
    private RapportTechnique rapport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_piece", nullable = false)
    private PieceRechange piece;

    @Column(name = "quantite", nullable = false)
    private int quantite;
}
