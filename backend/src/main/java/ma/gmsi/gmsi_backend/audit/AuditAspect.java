// src/main/java/ma/gmsi/gmsi_backend/audit/AuditAspect.java

package ma.gmsi.gmsi_backend.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.gmsi.gmsi_backend.entity.AuditLog;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.repository.AuditLogRepository;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @Around("@annotation(auditable)")
    public Object auditer(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {

        // Récupérer l'utilisateur connecté
        String emailConnecte = null;
        UUID idUtilisateur = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && !auth.getPrincipal().equals("anonymousUser")
                && auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
            emailConnecte = userPrincipal.getUsername();
            idUtilisateur = userPrincipal.getId();
        }

        // Exécuter la méthode réelle
        Object resultat = joinPoint.proceed();

        // Enregistrer dans audit_log (après succès uniquement), seulement si on a un utilisateur identifié
        if (idUtilisateur != null) {
            try {
                AuditLog log = AuditLog.builder()
                        .action(auditable.action())
                        .entiteType(auditable.entiteType())
                        .utilisateur(Utilisateur.builder().id(idUtilisateur).build())
                        .dateAction(LocalDateTime.now())
                        .details("Méthode : " + joinPoint.getSignature().getName()
                                + " | Utilisateur : " + emailConnecte)
                        .build();

                auditLogRepository.save(log);

            } catch (Exception e) {
                // L'audit ne doit jamais faire échouer l'opération métier
                log.warn("Impossible d'enregistrer l'audit : {}", e.getMessage());
            }
        } else {
            log.warn("Audit ignoré : aucun utilisateur authentifié pour l'action {}", auditable.action());
        }

        return resultat;
    }
}