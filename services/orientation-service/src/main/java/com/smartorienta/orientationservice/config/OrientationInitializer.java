package com.smartorienta.orientationservice.config;

import com.smartorienta.orientationservice.entity.Orientation;
import com.smartorienta.orientationservice.repository.OrientationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Charge le référentiel des filières d'orientation : 45 branches
 * réparties en 9 catégories, conformes au jeu de données du modèle
 * de prédiction.
 */
@Component
@RequiredArgsConstructor
public class OrientationInitializer implements CommandLineRunner {

    private final OrientationRepository orientationRepository;

    @Override
    public void run(String... args) {

        if (orientationRepository.count() > 0) {
            return;
        }

        // --- Agriculture & Environnement ---
        creer("Agroalimentaire", "Agriculture & Environnement");
        creer("Agronomie", "Agriculture & Environnement");
        creer("Environnement & Dév. Durable", "Agriculture & Environnement");
        creer("Génie Rural & Hydraulique", "Agriculture & Environnement");
        creer("Élevage", "Agriculture & Environnement");

        // --- Arts & Culture ---
        creer("Beaux-Arts", "Arts & Culture");
        creer("Musique", "Arts & Culture");
        creer("Patrimoine Culturel", "Arts & Culture");
        creer("Théâtre & Arts du spectacle", "Arts & Culture");

        // --- Droit & Sciences Politiques ---
        creer("Droit Privé", "Droit & Sciences Politiques");
        creer("Droit Public", "Droit & Sciences Politiques");
        creer("Relations Internationales", "Droit & Sciences Politiques");
        creer("Sciences Politiques", "Droit & Sciences Politiques");

        // --- Lettres & Communication ---
        creer("Communication & RP", "Lettres & Communication");
        creer("Journalisme", "Lettres & Communication");
        creer("Langues Étrangères Appliquées", "Lettres & Communication");
        creer("Traduction & Interprétation", "Lettres & Communication");

        // --- Multimédia & Création Numérique ---
        creer("Animation 3D & Jeux Vidéo", "Multimédia & Création Numérique");
        creer("Design Graphique", "Multimédia & Création Numérique");
        creer("Photographie & Médias Numériques", "Multimédia & Création Numérique");
        creer("Production Audiovisuelle", "Multimédia & Création Numérique");
        creer("UX/UI Design", "Multimédia & Création Numérique");

        // --- Sciences & Technologies ---
        creer("Cybersécurité", "Sciences & Technologies");
        creer("Développement Web & Mobile", "Sciences & Technologies");
        creer("Génie Civil", "Sciences & Technologies");
        creer("Génie Logiciel", "Sciences & Technologies");
        creer("Génie Mécanique", "Sciences & Technologies");
        creer("Intelligence Artificielle", "Sciences & Technologies");
        creer("Réseaux & Télécommunications", "Sciences & Technologies");
        creer("Électrotechnique", "Sciences & Technologies");

        // --- Sciences Humaines & Sociales ---
        creer("Histoire-Géographie", "Sciences Humaines & Sociales");
        creer("Psychologie", "Sciences Humaines & Sociales");
        creer("Sociologie", "Sciences Humaines & Sociales");
        creer("Travail Social", "Sciences Humaines & Sociales");

        // --- Sciences de la Santé ---
        creer("Biotechnologie", "Sciences de la Santé");
        creer("Médecine", "Sciences de la Santé");
        creer("Nutrition & Diététique", "Sciences de la Santé");
        creer("Odontologie", "Sciences de la Santé");
        creer("Pharmacie", "Sciences de la Santé");
        creer("Sage-femme", "Sciences de la Santé");
        creer("Sciences Infirmières", "Sciences de la Santé");

        // --- Sciences Économiques & Gestion ---
        creer("Commerce International", "Sciences Économiques & Gestion");
        creer("Entrepreneuriat & Management", "Sciences Économiques & Gestion");
        creer("Finance & Comptabilité", "Sciences Économiques & Gestion");
        creer("Marketing Digital", "Sciences Économiques & Gestion");

        System.out.println(">>> Référentiel des filières initialisé : 45 branches, 9 catégories");
    }

    private void creer(String libelle, String categorie) {
        Orientation o = new Orientation();
        o.setLibelle(libelle);
        o.setCategorie(categorie);
        orientationRepository.save(o);
    }
}