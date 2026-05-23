package com.gmsi.entity;

import com.gmsi.entity.enums.TypeNotification;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "notification_template")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Ex: FIN_INTERVENTION, DEMANDE_REJETEE, DEMANDE_ASSIGNEE
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "sujet", nullable = false)
    private String sujet;

    // Variables supportees: {reference}, {technicien}, {employe}, {statut}
    @Column(name = "corps", nullable = false, columnDefinition = "TEXT")
    private String corps;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeNotification type;
}
