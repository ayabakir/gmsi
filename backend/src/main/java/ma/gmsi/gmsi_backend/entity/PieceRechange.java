package ma.gmsi.gmsi_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "piece_rechange")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieceRechange {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "reference", nullable = false, unique = true)
    private String reference;

    @Column(name = "stock_disponible", nullable = false)
    @Builder.Default
    private int stockDisponible = 0;

    @Column(name = "seuil_alerte", nullable = false)
    @Builder.Default
    private int seuilAlerte = 5;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
