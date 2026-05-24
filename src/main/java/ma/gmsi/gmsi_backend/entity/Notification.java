package ma.gmsi.gmsi_backend.entity;

import ma.gmsi.gmsi_backend.entity.enums.TypeNotification;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_destinataire", nullable = false)
    private Utilisateur destinataire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_intervention")
    private Intervention intervention;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeNotification type;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "lu", nullable = false)
    @Builder.Default
    private boolean lu = false;

    @CreatedDate
    @Column(name = "date_envoi", updatable = false)
    private LocalDateTime dateEnvoi;
}
