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
            return;
        }

        //  Série S1
        Serie s1 = creerSerie("S1", "Sciences 1");
        creerMatiere("Mathématiques", 8, s1);
        creerMatiere("Physique-Chimie", 8, s1);
        creerMatiere("SVT", 2, s1);
        creerMatiere("Français", 3, s1);
        creerMatiere("Philosophie", 2, s1);
        creerMatiere("Anglais", 2, s1);

        //  Série S2
        Serie s2 = creerSerie("S2", "Sciences 2");
        creerMatiere("Mathématiques", 5, s2);
        creerMatiere("Physique-Chimie", 6, s2);
        creerMatiere("SVT", 6, s2);
        creerMatiere("Français", 3, s2);
        creerMatiere("Philosophie", 2, s2);
        creerMatiere("Anglais", 2, s2);

        //  Série L1
        Serie l1 = creerSerie("L1", "Litterature 1");
        creerMatiere("Français", 6, l1);
        creerMatiere("Philosophie", 6, l1);
        creerMatiere("Histoire-Géographie", 4, l1);
        creerMatiere("Anglais", 4, l1);
        creerMatiere("Mathématiques", 2, l1);

        //  Série L2
        Serie l2 = creerSerie("L2", "Litterature 1");
        creerMatiere("Français", 5, l2);
        creerMatiere("Anglais", 6, l2);
        creerMatiere("Espagnol", 5, l2);
        creerMatiere("Philosophie", 4, l2);
        creerMatiere("Histoire-Géographie", 3, l2);

        System.out.println(">>> Référentiel séries/matières initialisé !");
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