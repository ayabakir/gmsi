package ma.gmsi.gmsi_backend.entity;

import ma.gmsi.gmsi_backend.entity.enums.NiveauSpecialite;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "specialite_technicien",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_technicien", "id_categorie"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialiteTechnicien {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_technicien", nullable = false)
    private Utilisateur technicien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie", nullable = false)
    private Categorie categorie;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau", nullable = false)
    private NiveauSpecialite niveau;
}
