/** Recommandations originales, non issues des documents sources (mission §12.1 "Plan d'action"). */
import type { TypeCode } from "@/scoring/types";

export interface ActionPlan {
  daily: string[];
  weekly: string[];
  professional: string[];
  personal: string[];
  communicationStrategy: string;
  stressPrevention: string;
  reflectionQuestions: string[];
}

export const ACTION_PLANS: Record<TypeCode, ActionPlan> = {
  AN: {
    daily: [
      "Nommer une réussite concrète de la journée, même petite.",
      "Réserver un créneau protégé pour avancer sans interruption."
    ],
    weekly: ["Faire un point structuré sur ce qui a été accompli et ce qui reste ouvert."],
    professional: [
      "Demander explicitement un retour factuel sur son travail plutôt que de le deviner."
    ],
    personal: ["S'autoriser une plage de temps sans agenda, sans objectif de productivité."],
    communicationStrategy:
      "Annoncer clairement le sujet et le temps disponible avant d'entrer dans le détail.",
    stressPrevention:
      "Repérer le moment où les explications s'allongent : c'est souvent un signal à écouter plutôt qu'à ignorer.",
    reflectionQuestions: [
      "Qu'est-ce qui serait « assez bien » aujourd'hui, sans viser la perfection ?"
    ]
  },
  PE: {
    daily: ["Formuler une conviction personnelle et le contexte dans lequel elle s'applique."],
    weekly: ["Choisir un engagement concret à honorer dans la semaine et le tenir."],
    professional: ["Exprimer un désaccord tôt, avant qu'il ne prenne trop de place."],
    personal: ["Partager ce qui compte vraiment avec une personne de confiance."],
    communicationStrategy:
      "Inviter l'autre à donner son avis avant de trancher, même si la conviction est déjà formée.",
    stressPrevention:
      "Quand la vigilance sur ce qui ne va pas augmente, prendre un temps pour vérifier si l'exigence reste proportionnée.",
    reflectionQuestions: [
      "Cette bataille mérite-t-elle vraiment l'énergie que j'y mets aujourd'hui ?"
    ]
  },
  EM: {
    daily: ["Prendre un moment sensoriel agréable : un repas soigné, une lumière douce."],
    weekly: ["Passer du temps avec une personne dont la présence fait du bien."],
    professional: ["Dire non à une sollicitation qui dépasse une limite raisonnable."],
    personal: ["Recevoir un compliment sans le minimiser."],
    communicationStrategy:
      "Commencer un échange difficile en reconnaissant l'autre avant d'aborder le sujet qui pose problème.",
    stressPrevention:
      "Si l'envie de dire oui à tout augmente, c'est un bon moment pour vérifier ses propres limites.",
    reflectionQuestions: [
      "Qu'est-ce que je donnerais à quelqu'un que j'aime dans cette même situation, pour moi-même ?"
    ]
  },
  IM: {
    daily: ["Protéger un vrai moment de solitude, sans écran ni sollicitation."],
    weekly: [
      "Planifier à l'avance un temps de retrait, pour ne pas avoir à le justifier après coup."
    ],
    professional: ["Demander une consigne claire plutôt que de deviner ce qui est attendu."],
    personal: ["Accepter de ne pas tout expliquer : le silence n'est pas un problème à résoudre."],
    communicationStrategy:
      "Prévenir en amont qu'une réponse prendra un peu de temps plutôt que de laisser le silence s'installer sans explication.",
    stressPrevention:
      "Repérer la tentation de se disperser : c'est souvent le signe qu'un temps de retrait est nécessaire.",
    reflectionQuestions: [
      "De combien de temps seul ai-je réellement besoin cette semaine, et me l'accorde-t-on ?"
    ]
  },
  EN: {
    daily: ["Provoquer un moment de contact spontané avec quelqu'un."],
    weekly: ["Introduire un peu de nouveauté dans une routine devenue trop prévisible."],
    professional: ["Terminer une tâche engagée avant d'en commencer une nouvelle plus stimulante."],
    personal: ["Rire, jouer, ou simplement changer d'air sans culpabilité."],
    communicationStrategy:
      "Garder une part de légèreté dans les échanges, même sur des sujets sérieux.",
    stressPrevention:
      "Le moment où l'on rame sur une tâche est un signal à ne pas ignorer : il annonce souvent la suite.",
    reflectionQuestions: [
      "Qu'est-ce qui rendrait cette tâche un peu plus vivante, sans en changer le fond ?"
    ]
  },
  PR: {
    daily: ["Identifier une occasion concrète à saisir dans la journée."],
    weekly: ["Se fixer un défi mesurable et se donner les moyens de le relever."],
    professional: ["Traduire une idée en action avant que l'élan ne retombe."],
    personal: ["Accorder à quelqu'un une vraie marge d'autonomie plutôt que de reprendre la main."],
    communicationStrategy:
      "Aller droit au but, en laissant à l'autre une marge d'action réelle plutôt qu'un cadre trop rigide.",
    stressPrevention:
      "Quand l'attente que « les autres se débrouillent » s'installe, c'est le moment de se reconnecter à un objectif concret.",
    reflectionQuestions: ["Quel est le prochain pas concret, réalisable dès aujourd'hui ?"]
  }
};
