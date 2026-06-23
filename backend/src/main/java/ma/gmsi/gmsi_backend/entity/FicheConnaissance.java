package ma.gmsi.gmsi_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "fiche_connaissance")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FicheConnaissance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rapport_source", nullable = true)
    private RapportTechnique rapportSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie")
    private Categorie categorie;

    @Column(name = "type_panne", nullable = false)
    private String typePanne;

    @Column(name = "equipement_cible")
    private String equipementCible;

    @Column(name = "solution", nullable = false, columnDefinition = "TEXT")
    private String solution;

    @ElementCollection
    @CollectionTable(name = "fiche_connaissance_mots_cles",
        joinColumns = @JoinColumn(name = "id_fiche"))
    @Column(name = "mot_cle")
    private List<String> motsCles;

    @CreatedDate
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
}
