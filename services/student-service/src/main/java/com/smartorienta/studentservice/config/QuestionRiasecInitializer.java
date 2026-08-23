package com.smartorienta.studentservice.config;

import com.smartorienta.studentservice.entity.QuestionRiasec;
import com.smartorienta.studentservice.repository.QuestionRiasecRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Charge le questionnaire RIASEC : 30 questions réparties sur les six
 * dimensions de Holland, complétées par quatre questions mesurant
 * des traits comportementaux.
 * La numérotation est fixe et partagée avec le client.
 */
@Component
@Order(2)
@RequiredArgsConstructor
public class QuestionRiasecInitializer implements CommandLineRunner {

    private final QuestionRiasecRepository questionRepository;

    @Override
    public void run(String... args) {

        if (questionRepository.count() > 0) {
            return;
        }

        // --- R : Réaliste ---
        creer(1, "R", "J'apprécie travailler sur des tâches concrètes nécessitant des manipulations ou l'utilisation d'outils.");
        creer(2, "R", "Je me sens à l'aise dans des activités techniques ou pratiques (réparer, construire, expérimenter).");
        creer(3, "R", "Je préfère apprendre en faisant plutôt qu'en lisant ou en écoutant uniquement.");
        creer(4, "R", "J'aime travailler avec des machines, des équipements ou des objets physiques.");
        creer(5, "R", "Je préfère les solutions concrètes et pratiques aux théories abstraites.");

        // --- I : Investigateur ---
        creer(6, "I", "J'aime analyser des problèmes complexes et chercher des solutions logiques.");
        creer(7, "I", "Je suis attiré(e) par les matières scientifiques et la compréhension des phénomènes.");
        creer(8, "I", "J'apprécie les activités qui demandent de la réflexion approfondie et de la recherche.");
        creer(9, "I", "Je lis volontiers des livres ou articles scientifiques pour approfondir mes connaissances.");
        creer(10, "I", "J'aime formuler des hypothèses et les tester pour comprendre comment les choses fonctionnent.");

        // --- A : Artistique ---
        creer(11, "A", "J'aime exprimer ma créativité à travers le dessin, l'écriture, la musique ou d'autres formes artistiques.");
        creer(12, "A", "Je préfère les activités qui me permettent d'innover plutôt que de suivre des règles strictes.");
        creer(13, "A", "Je suis sensible à l'esthétique, au design et à l'originalité.");
        creer(14, "A", "J'aime imaginer de nouvelles idées ou concevoir des projets originaux.");
        creer(15, "A", "Les environnements créatifs et non conventionnels me motivent davantage que les cadres rigides.");

        // --- S : Social ---
        creer(16, "S", "J'aime aider les autres et contribuer à leur bien-être.");
        creer(17, "S", "Je me sens à l'aise dans les activités impliquant l'écoute et la communication.");
        creer(18, "S", "Je préfère travailler en équipe plutôt que seul(e).");
        creer(19, "S", "J'aime enseigner, expliquer ou transmettre des connaissances aux autres.");
        creer(20, "S", "Je me soucie du bien-être des personnes autour de moi et cherche à les soutenir.");

        // --- E : Entrepreneur ---
        creer(21, "E", "J'aime prendre des initiatives et diriger des projets.");
        creer(22, "E", "Je suis motivé(e) par les défis, la prise de décision et la gestion de responsabilités.");
        creer(23, "E", "Je suis à l'aise pour convaincre ou influencer les autres.");
        creer(24, "E", "J'aime négocier, vendre ou défendre mes idées devant un groupe.");
        creer(25, "E", "Je me projette facilement dans un rôle de leadership ou de gestion d'équipe.");

        // --- C : Conventionnel ---
        creer(26, "C", "J'aime organiser, planifier et structurer des informations ou des tâches.");
        creer(27, "C", "Je suis à l'aise avec les activités nécessitant rigueur, précision et respect des consignes.");
        creer(28, "C", "Je préfère travailler dans un cadre bien défini avec des règles claires.");
        creer(29, "C", "J'apprécie les tâches qui demandent de la méthode, de l'ordre et de l'exactitude.");
        creer(30, "C", "Je me sens plus efficace quand les objectifs et les procédures sont clairement établis.");

        // --- Traits comportementaux ---
        creerInversee(31, "STRESS", "Je reste calme et efficace même sous pression.");
        creer(32, "SOCIAL", "Je me sens à l'aise pour interagir avec de nouvelles personnes.");
        creer(33, "AUTONOMIE", "Je préfère travailler de manière autonome sans dépendre des autres.");
        creer(34, "ADAPTABILITE", "Je m'adapte facilement à de nouvelles situations ou environnements.");

        System.out.println(">>> Questionnaire RIASEC initialisé : 34 questions");
    }

    private void creer(int id, String dimension, String texte) {
        enregistrer(id, dimension, texte, false);
    }

    private void creerInversee(int id, String dimension, String texte) {
        enregistrer(id, dimension, texte, true);
    }

    private void enregistrer(int id, String dimension, String texte, boolean inversee) {
        QuestionRiasec q = new QuestionRiasec();
        q.setId(id);
        q.setDimension(dimension);
        q.setTexte(texte);
        q.setInversee(inversee);
        questionRepository.save(q);
    }
}