package ma.gmsi.gmsi_backend.entity;

import ma.gmsi.gmsi_backend.entity.enums.TypeLocalisation;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "localisation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Localisation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "libelle", nullable = false)
    private String libelle;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeLocalisation type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_parent")
    private Localisation parent;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}