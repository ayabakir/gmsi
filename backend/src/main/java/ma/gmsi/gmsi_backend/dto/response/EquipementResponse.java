package ma.gmsi.gmsi_backend.dto.response;

import lombok.*;
import ma.gmsi.gmsi_backend.entity.enums.StatutEquipement;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipementResponse {

    private UUID id;
    private String reference;
    private String nom;
    private String type;
    private StatutEquipement statut;
    private String description;
    private UUID localisationId;
    private String localisationLibelle;
    private LocalDate dateMiseEnService;
    private LocalDateTime dateCreation;
}