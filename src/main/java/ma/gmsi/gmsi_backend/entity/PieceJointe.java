package com.gmsi.entity;

import com.gmsi.entity.enums.TypePieceJointe;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "piece_jointe")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieceJointe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "url", nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "entite_type", nullable = false)
    private TypePieceJointe entiteType;

    @Column(name = "id_entite", nullable = false)
    private UUID idEntite;

    @CreatedDate
    @Column(name = "date_upload", updatable = false)
    private LocalDateTime dateUpload;
}
