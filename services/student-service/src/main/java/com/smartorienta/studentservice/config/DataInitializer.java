package com.smartorienta.studentservice.config;

import com.smartorienta.studentservice.entity.Matiere;
import com.smartorienta.studentservice.entity.Serie;
import com.smartorienta.studentservice.repository.MatiereRepository;
import com.smartorienta.studentservice.repository.SerieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SerieRepository serieRepository;
    private final MatiereRepository matiereRepository;

    @Override
    public void run(String... args) {

        if (serieRepository.count() > 0) {
            return;   // référentiel déjà initialisé
        }

        // --- S1
        Serie s1 = creerSerie("S1", "Mathématiques et Sciences Physiques");
        creerMatiere("Mathématiques", 8, s1);
        creerMatiere("Français", 3, s1);
        creerMatiere("Anglais", 2, s1);
        creerMatiere("Histoire-Géographie", 2, s1);
        creerMatiere("Philosophie", 2, s1);
        // spécialité 1
        creerMatiere("Sciences Physiques", 8, s1);
        // spécialité 2
        creerMatiere("SVT", 2, s1);

        // --- S2
        Serie s2 = creerSerie("S2", "Sciences Expérimentales");
        creerMatiere("Mathématiques", 5, s2);
        creerMatiere("Français", 3, s2);
        creerMatiere("Anglais", 2, s2);
        creerMatiere("Histoire-Géographie", 2, s2);
        creerMatiere("Philosophie", 2, s2);
        // spécialité 1
        creerMatiere("Sciences Physiques", 6, s2);
        // spécialité 1
        creerMatiere("SVT", 6, s2);

        // --- S3
        Serie s3 = creerSerie("S3", "Sciences et Techniques");
        creerMatiere("Mathématiques", 8, s3);
        creerMatiere("Français", 3, s3);
        creerMatiere("Anglais", 2, s3);
        creerMatiere("Philosophie", 2, s3);
        // spécialité 1
        creerMatiere("Sciences Physiques", 8, s3);
        // spécialité 2
        creerMatiere("Construction Mécanique", 8, s3);


        // --- L1
        Serie l1 = creerSerie("L1", "Langues et Civilisations Modernes");
        creerMatiere("Mathématiques", 2, l1);
        creerMatiere("Français", 6, l1);
        creerMatiere("Anglais", 4, l1);
        creerMatiere("Histoire-Géographie", 2, l1);
        creerMatiere("Philosophie", 4, l1);
        // spécialité
        creerMatiere("LV2", 4, l1);

        // --- L2
        Serie l2 = creerSerie("L2", "Sciences Sociales et Humaines");
        creerMatiere("Mathématiques", 2, l2);
        creerMatiere("Français", 5, l2);
        creerMatiere("Anglais", 4, l2);
        creerMatiere("Histoire-Géographie", 6, l2);
        creerMatiere("Philosophie", 6, l2);
        // spécialité 1
        creerMatiere("LV2", 2, l2);
        // spécialité 2
        creerMatiere("Sciences de la Nature", 2, l2);

        // --- G
        Serie g = creerSerie("G", "Techniques Quantitatives d'Économie et de Gestion");
        creerMatiere("Mathématiques", 5, g);
        creerMatiere("Français", 3, g);        // Technique d'expression et de communication
        creerMatiere("Anglais", 3, g);
        creerMatiere("Histoire-Géographie", 2, g);  // Connaissance du monde
        creerMatiere("Philosophie", 2, g);
        // spécialité 1
        creerMatiere("Étude de cas", 6, g);
        // spécialité 2
        creerMatiere("Économie", 6, g);

        System.out.println(">>> Référentiel initialisé : 6 séries du baccalauréat sénégalais");
    }

    private Serie creerSerie(String code, String libelle) {
        Serie serie = new Serie();
        serie.setCode(code);
        serie.setLibelle(libelle);
        return serieRepository.save(serie);
    }

    private void creerMatiere(String nom, int coefficient, Serie serie) {
        Matiere matiere = new Matiere();
        matiere.setNom(nom);
        matiere.setCoefficient(coefficient);
        matiere.setSerie(serie);
        matiereRepository.save(matiere);
    }
}