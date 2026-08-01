(function attachData(root) {
  const TYPES = [
    {
      id: "analyseur",
      name: "Analyseur",
      color: "#2f6fb3",
      perception: "Pensées factuelles",
      exchange: "Logique",
      strengths: ["Logique", "Responsable", "Organisé"],
      part: "Ordinateur",
      channel: "Interrogatif",
      styleUse: "Démocratique",
      styleAvoid: "Autocratique",
      environment: "Seul ou en duo, avec des repères clairs",
      needs: ["Reconnaissance du travail productif", "Structuration du temps"],
      stress: {
        driver: "Sois parfait",
        mask: "Attaquant",
        mechanism: "Sur-contrôle",
        entry: "sur-détaille, complique ses explications, garde trop de choses pour soi",
        basement: "critique l'ordre, la logique, les responsabilités ou la qualité de ce qui est fait",
        cave: "se retire dans une impression d'incompétence générale"
      },
      advice: "Clarifier les faits, reconnaître ce qui a été fait avec précision et proposer un cadre concret."
    },
    {
      id: "perseverant",
      name: "Persévérant",
      color: "#7d5bb3",
      perception: "Opinions",
      exchange: "Valeurs",
      strengths: ["Engagé", "Observateur", "Consciencieux"],
      part: "Ordinateur",
      channel: "Interrogatif",
      styleUse: "Démocratique",
      styleAvoid: "Autocratique",
      environment: "Seul ou en duo, relié à ce qui a du sens",
      needs: ["Reconnaissance du travail dévoué", "Conviction"],
      stress: {
        driver: "Sois parfait pour moi",
        mask: "Attaquant",
        mechanism: "Part en croisade",
        entry: "pose des questions complexes, exige une cohérence élevée, repère ce qui cloche",
        basement: "défend ce qui lui semble juste en attaquant ce qui lui semble irresponsable",
        cave: "se sent déçu par le manque d'engagement des autres"
      },
      advice: "Écouter l'opinion, reconnaître la fidélité à ce qui compte et respecter la ligne intérieure."
    },
    {
      id: "empathique",
      name: "Empathique",
      color: "#c45c77",
      perception: "Émotions",
      exchange: "Compassion",
      strengths: ["Compatissant", "Sensible", "Chaleureux"],
      part: "Réconforteur",
      channel: "Nourricier",
      styleUse: "Bienveillant",
      styleAvoid: "Autocratique",
      environment: "Dans un groupe connu et chaleureux",
      needs: ["Reconnaissance de la personne", "Sensoriel"],
      stress: {
        driver: "Fais plaisir",
        mask: "Geignard",
        mechanism: "Fait des erreurs",
        entry: "s'adapte trop, n'ose pas demander directement, évite de dire non",
        basement: "se dénigre, invite la critique, perd en fermeté",
        cave: "se sent mal aimé et rejeté"
      },
      advice: "Reconnaître la personne, soigner l'atmosphère et offrir une présence sincère."
    },
    {
      id: "imagineur",
      name: "Imagineur",
      color: "#6b7b4c",
      perception: "Inactions et réflexions",
      exchange: "Imagination",
      strengths: ["Imaginatif", "Réfléchi", "Calme"],
      part: "Directeur",
      channel: "Directif",
      styleUse: "Autocratique",
      styleAvoid: "Laissez-faire",
      environment: "Seul, avec une direction sobre",
      needs: ["Solitude"],
      stress: {
        driver: "Sois fort",
        mask: "Geignard",
        mechanism: "Attend passivement",
        entry: "se disperse, attend une impulsion extérieure, prend peu d'initiative",
        basement: "se met en retrait et laisse les choses en suspens",
        cave: "se sent oublié ou laissé de côté"
      },
      advice: "Donner une direction simple, laisser du calme et respecter l'espace intérieur."
    },
    {
      id: "energiseur",
      name: "Énergiseur",
      color: "#d08b2f",
      perception: "Réactions",
      exchange: "Humour",
      strengths: ["Spontané", "Créatif", "Ludique"],
      part: "Émoteur",
      channel: "Émotif",
      styleUse: "Laissez-faire",
      styleAvoid: "Autocratique",
      environment: "Dans un groupe stimulant et vivant",
      needs: ["Contact"],
      stress: {
        driver: "Fais des efforts",
        mask: "Blâmeur",
        mechanism: "Blâme",
        entry: "rame, répond de travers, cherche à faire penser ou agir les autres",
        basement: "se plaint, dit oui mais, reporte la faute sur le contexte",
        cave: "se sent censuré ou condamné"
      },
      advice: "Rendre l'échange vivant, créer du contact et garder une énergie légère."
    },
    {
      id: "promoteur",
      name: "Promoteur",
      color: "#b64b3c",
      perception: "Actions",
      exchange: "Initiative",
      strengths: ["Adaptable", "Persuasif", "Charmeur"],
      part: "Directeur",
      channel: "Directif",
      styleUse: "Autocratique",
      styleAvoid: "Démocratique",
      environment: "De groupe en groupe, orienté opportunité",
      needs: ["Excitation"],
      stress: {
        driver: "Sois fort pour moi",
        mask: "Blâmeur",
        mechanism: "Manipule",
        entry: "parle en tu quand il pense je, teste la solidité des autres",
        basement: "provoque, contourne les règles, crée de la tension",
        cave: "organise les conditions de l'abandon"
      },
      advice: "Aller droit au but, proposer un défi court et laisser une marge d'action."
    }
  ];

  const DIMENSION_META = {
    structure: { label: "Structure stable", target: "base", weight: 1 },
    perception: { label: "Perception", target: "base", weight: 1.2 },
    communication: { label: "Communication", target: "base", weight: 0.9 },
    environment: { label: "Environnement préféré", target: "base", weight: 0.75 },
    need: { label: "Besoins actuels", target: "phase", weight: 1.35 },
    stress: { label: "Stress observable", target: "phase", weight: 1.15 },
    situations: { label: "Situations personnelles", target: "base", weight: 1 },
    synthesis: { label: "Synthèse", target: "base", weight: 1.6 }
  };

  const RANKING_PROMPT = {
    id: "self-rank-final",
    title: "Portrait global",
    prompt: "Classe les six descriptions de celle qui te ressemble le plus souvent à celle qui te ressemble le moins souvent.",
    descriptions: {
      analyseur: "Je me sens mieux quand je peux rendre les choses claires, fiables et tenables.",
      perseverant: "Je me repère aux engagements, à la loyauté et à ce que je peux défendre sans me trahir.",
      empathique: "Je vis beaucoup à travers la qualité du lien, les attentions et l'atmosphère autour de moi.",
      imagineur: "J'ai besoin de retrait pour laisser mon monde intérieur faire son travail tranquillement.",
      energiseur: "Je me sens vivant quand il y a du jeu, du contact, du relief et de la spontanéité.",
      promoteur: "Je sens vite les ouvertures et j'aime transformer une occasion en mouvement concret."
    }
  };

  function buildScenario(config) {
    const weight = config.weight || DIMENSION_META[config.dimension]?.weight || 1;
    return {
      id: config.id,
      section: config.section,
      target: config.target,
      dimension: config.dimension,
      weight,
      title: config.title,
      prompt: `${config.prompt} Classe uniquement les réponses qui te ressemblent vraiment.`,
      options: TYPES.map((type) => ({
        id: `${config.id}-${type.id}`,
        typeId: type.id,
        text: config.options[type.id],
        weight
      }))
    };
  }

  const SCENARIO_ITEMS = [
    buildScenario({
      id: "structure-01",
      section: "structure",
      target: "base",
      dimension: "structure",
      title: "Un dimanche prévu dehors tombe à l'eau à cause de la météo",
      prompt: "Ta façon spontanée de sauver la journée :",
      options: {
        analyseur: "Je regarde les contraintes réelles, propose deux options réalistes et réorganise le timing.",
        perseverant: "Je cherche une solution qui respecte ce qui était important dans cette journée, pas juste un plan de secours.",
        empathique: "Je fais attention à la déception de chacun et j'essaie de recréer une ambiance douce.",
        imagineur: "Je me mets un peu en retrait pour laisser venir une idée calme, simple, peut-être à la maison.",
        energiseur: "Je transforme le raté en occasion de faire quelque chose d'imprévu, drôle ou un peu absurde.",
        promoteur: "Je tranche vite, j'embarque les autres et je fais en sorte qu'il se passe quand même quelque chose."
      }
    }),
    buildScenario({
      id: "structure-02",
      section: "structure",
      target: "base",
      dimension: "structure",
      title: "Deux amis que tu aimes se vexent pendant un dîner",
      prompt: "Ce que tu fais le plus naturellement :",
      options: {
        analyseur: "Je reprends calmement ce qui a été dit pour distinguer le malentendu du vrai désaccord.",
        perseverant: "Je ne laisse pas passer ce qui me semble injuste, même si l'ambiance devient moins confortable.",
        empathique: "Je sens où ça fait mal et j'essaie d'adoucir le moment sans humilier personne.",
        imagineur: "Je parle peu d'abord; j'observe, je laisse retomber, puis je glisse une piste simple.",
        energiseur: "Je cherche une respiration, une blague non méchante, un détour qui permet de revenir autrement.",
        promoteur: "Je coupe l'escalade franchement et je pousse à régler ça maintenant plutôt qu'à laisser pourrir."
      }
    }),
    buildScenario({
      id: "structure-03",
      section: "structure",
      target: "base",
      dimension: "structure",
      title: "Un proche te demande de l'aider à déménager, mais rien n'est prêt",
      prompt: "Ta réaction intérieure et pratique :",
      options: {
        analyseur: "Je commence par faire l'inventaire, les cartons, les trajets, les priorités.",
        perseverant: "Je suis prêt à aider, mais j'ai besoin que l'effort soit respecté et que chacun fasse sa part.",
        empathique: "Je vois surtout son stress et j'essaie de l'aider sans le faire se sentir nul.",
        imagineur: "Je préfère qu'on me donne une tâche claire et que je puisse la faire tranquillement.",
        energiseur: "Je mets de l'énergie, de la musique ou du jeu pour rendre le chaos moins lourd.",
        promoteur: "Je prends le point le plus bloquant et je le règle tout de suite, quitte à bousculer."
      }
    }),
    buildScenario({
      id: "structure-04",
      section: "structure",
      target: "base",
      dimension: "structure",
      title: "Tu veux offrir un cadeau à quelqu'un qui compte pour toi",
      prompt: "Ce qui guide le plus ton choix :",
      options: {
        analyseur: "Je cherche quelque chose d'utile, bien choisi, qui correspond vraiment à sa vie.",
        perseverant: "Je veux que le cadeau dise quelque chose de juste sur notre lien ou son histoire.",
        empathique: "Je pense à ce qui va lui faire sentir qu'il est connu, aimé, accueilli.",
        imagineur: "Je laisse venir une idée personnelle, parfois discrète, qui a mûri dans ma tête.",
        energiseur: "J'aime trouver quelque chose qui surprend, amuse ou déclenche une réaction immédiate.",
        promoteur: "Je cherche le cadeau qui marque le coup, crée un effet et ne passe pas inaperçu."
      }
    }),
    buildScenario({
      id: "structure-05",
      section: "structure",
      target: "base",
      dimension: "structure",
      title: "Quelqu'un que tu aimes dit : « Il faut qu'on parle »",
      prompt: "Ce qui se passe d'abord chez toi :",
      options: {
        analyseur: "J'ai besoin de comprendre le sujet, le moment et ce qu'on cherche à résoudre.",
        perseverant: "Je me demande si une limite, une parole donnée ou une confiance a été abîmée.",
        empathique: "Je ressens tout de suite la charge affective et j'ai peur que le lien soit blessé.",
        imagineur: "Je me ferme un peu pour encaisser et j'ai besoin d'un temps intérieur avant de répondre.",
        energiseur: "Je tente de dédramatiser, même maladroitement, parce que la lourdeur me pèse.",
        promoteur: "Je préfère entrer directement dans le sujet plutôt que rester dans l'attente."
      }
    }),
    buildScenario({
      id: "structure-06",
      section: "structure",
      target: "base",
      dimension: "structure",
      title: "Des invités arrivent dans une heure et la maison est en désordre",
      prompt: "Ton mouvement naturel :",
      options: {
        analyseur: "Je décide quoi ranger en premier pour que l'ensemble paraisse propre et fonctionnel.",
        perseverant: "Je veux que l'accueil soit digne de ce qu'on a annoncé, pas fait à moitié.",
        empathique: "Je prépare surtout ce qui rendra le lieu chaleureux : lumière, odeur, confort, petites attentions.",
        imagineur: "Je fais ce qu'on me demande clairement, mais trop d'agitation me coupe.",
        energiseur: "Je mets du rythme, je plaisante, je fais participer les autres sans rendre ça pesant.",
        promoteur: "Je vais à l'essentiel visible et je cache vite ce qui n'a pas besoin d'être traité maintenant."
      }
    }),
    buildScenario({
      id: "structure-07",
      section: "structure",
      target: "base",
      dimension: "structure",
      title: "Tu imagines ton lieu de vie idéal",
      prompt: "Ce qui compte vraiment dans l'image qui vient :",
      options: {
        analyseur: "Un endroit pratique, bien pensé, où le quotidien devient plus simple.",
        perseverant: "Un lieu qui raconte quelque chose, où les objets ont du sens et une certaine tenue.",
        empathique: "Un cocon vivant, doux, accueillant, où les gens se sentent bien.",
        imagineur: "Un espace dépouillé, calme, où je peux disparaître sans être sollicité.",
        energiseur: "Un lieu qui bouge, coloré, avec des coins pour créer, rire, inviter.",
        promoteur: "Un endroit avec du caractère, qui donne de l'allure et ouvre des possibilités."
      }
    }),
    buildScenario({
      id: "perception-01",
      section: "perception",
      target: "base",
      dimension: "perception",
      title: "Après un repas de famille un peu étrange, quelqu'un te demande : « Tu en as pensé quoi ? »",
      prompt: "La réponse qui te vient le plus naturellement :",
      options: {
        analyseur: "Il y a eu trois moments bizarres, et je crois qu'ils ne venaient pas tous du même sujet.",
        perseverant: "Ce qui m'a frappé, c'est l'écart entre ce que certains disent et ce qu'ils font.",
        empathique: "J'ai senti une tristesse ou une tension que personne n'osait vraiment nommer.",
        imagineur: "Je n'ai pas encore une phrase claire; j'ai besoin que ça redescende à l'intérieur.",
        energiseur: "C'était lourd, mais aussi tellement étrange que certaines scènes m'ont presque fait rire.",
        promoteur: "On aurait dû mettre les pieds dans le plat plus tôt au lieu de tourner autour."
      }
    }),
    buildScenario({
      id: "perception-02",
      section: "perception",
      target: "base",
      dimension: "perception",
      title: "Un ami hésite à pardonner à quelqu'un qui l'a blessé",
      prompt: "La question que tu lui poserais le plus spontanément :",
      options: {
        analyseur: "Qu'est-ce qui s'est passé exactement, et qu'est-ce qui a changé depuis ?",
        perseverant: "Est-ce que cette personne a vraiment reconnu ce qu'elle a fait, ou seulement ce qui l'arrange ?",
        empathique: "Quand tu penses à lui reparler, qu'est-ce que tu ressens dans ton corps ?",
        imagineur: "Si tu te projettes avec ou sans cette personne, quelle image est la plus respirable ?",
        energiseur: "Est-ce que tu as encore envie de le voir, ou est-ce que tout en toi dit non ?",
        promoteur: "Qu'est-ce que tu gagnes à rouvrir la porte, et qu'est-ce que tu risques ?"
      }
    }),
    buildScenario({
      id: "perception-03",
      section: "perception",
      target: "base",
      dimension: "perception",
      title: "Tu découvres que ton après-midi est finalement libre",
      prompt: "La première façon dont tu lis cette liberté :",
      options: {
        analyseur: "Je vois le temps disponible et ce que je peux enfin remettre en ordre ou terminer.",
        perseverant: "Je me demande à quoi ce temps mérite d'être consacré pour ne pas le gaspiller.",
        empathique: "Je pense à quelqu'un que j'aimerais voir ou à une manière de me faire du bien.",
        imagineur: "Je sens surtout l'espace qui s'ouvre, le silence possible, le droit de ne rien remplir.",
        energiseur: "Je cherche ce qui me ferait plaisir maintenant, même si ce n'était pas prévu.",
        promoteur: "Je vois une occasion à saisir tout de suite : sortir, tenter, appeler, réserver."
      }
    }),
    buildScenario({
      id: "perception-04",
      section: "perception",
      target: "base",
      dimension: "perception",
      title: "Quelqu'un raconte un voyage qui l'a bouleversé",
      prompt: "Ce que tu captes d'abord dans son récit :",
      options: {
        analyseur: "Le déroulé, les choix qu'il a faits, ce qui a déclenché le changement.",
        perseverant: "La manière dont ce voyage a confirmé ou déplacé ce qui comptait pour lui.",
        empathique: "La vibration émotionnelle de ce qu'il raconte, même dans ses silences.",
        imagineur: "Les images que son récit crée en moi, comme si je voyais le lieu de l'intérieur.",
        energiseur: "Les moments inattendus, les rencontres, les scènes qui donnent envie de réagir.",
        promoteur: "Les portes que ce voyage lui a ouvertes et ce qu'il a osé faire."
      }
    }),
    buildScenario({
      id: "perception-05",
      section: "perception",
      target: "base",
      dimension: "perception",
      title: "Tu dois choisir entre économiser ou te faire un vrai plaisir",
      prompt: "Ton premier filtre intérieur :",
      options: {
        analyseur: "Je regarde ce que ça change concrètement dans mon budget et mes priorités.",
        perseverant: "Je me demande si ce choix est raisonnable au regard de ce que je veux construire.",
        empathique: "Je sens si ce plaisir va vraiment me nourrir ou seulement combler un manque.",
        imagineur: "Je prends du recul, j'imagine les deux options et j'attends que l'une devienne évidente.",
        energiseur: "Je sens très vite si j'en ai envie ou si ça me laisse complètement froid.",
        promoteur: "Je me demande si l'occasion vaut le coup maintenant, parce qu'elle ne reviendra peut-être pas."
      }
    }),
    buildScenario({
      id: "communication-01",
      section: "communication",
      target: "base",
      dimension: "communication",
      title: "Un proche veut changer le programme à la dernière minute",
      prompt: "La manière de te le demander que tu recevrais le mieux :",
      options: {
        analyseur: "Je t'explique ce qui change, pourquoi, et je te propose deux options claires.",
        perseverant: "Je sais qu'on avait prévu autrement; je veux respecter ce qui comptait pour toi.",
        empathique: "Je suis désolé de te bousculer; dis-moi comment tu te sens avec ça.",
        imagineur: "Voilà le nouveau plan; prends un moment pour voir si ça te va.",
        energiseur: "Je sais, c'est imprévu, mais ça peut devenir plus sympa que ce qu'on avait prévu.",
        promoteur: "On a une meilleure option maintenant; viens, on y va et on ajuste."
      }
    }),
    buildScenario({
      id: "communication-02",
      section: "communication",
      target: "base",
      dimension: "communication",
      title: "Tu tournes en rond dans une décision personnelle",
      prompt: "L'aide qui t'ouvrirait le plus :",
      options: {
        analyseur: "Quelqu'un qui m'aide à poser les éléments, les conséquences et les prochaines étapes.",
        perseverant: "Quelqu'un qui me demande ce que je pourrais assumer fièrement dans six mois.",
        empathique: "Quelqu'un qui m'écoute sans me presser et me rappelle que je ne suis pas seul.",
        imagineur: "Quelqu'un qui me donne une question simple puis me laisse réfléchir en paix.",
        energiseur: "Quelqu'un qui me sort de ma boucle avec une idée fraîche ou un changement d'air.",
        promoteur: "Quelqu'un qui me pousse à tester une option au lieu de rester coincé."
      }
    }),
    buildScenario({
      id: "communication-03",
      section: "communication",
      target: "base",
      dimension: "communication",
      title: "Quelqu'un s'excuse après t'avoir blessé",
      prompt: "Ce qui rendrait l'excuse recevable pour toi :",
      options: {
        analyseur: "Qu'il dise précisément ce qu'il a compris et ce qu'il fera différemment.",
        perseverant: "Qu'il assume vraiment sa responsabilité, sans se cacher derrière de belles phrases.",
        empathique: "Qu'il montre qu'il a senti l'impact sur moi, pas seulement qu'il veut être pardonné.",
        imagineur: "Qu'il me laisse du temps après l'excuse, sans exiger une réaction immédiate.",
        energiseur: "Qu'il soit sincère mais pas théâtral, et qu'on puisse retrouver un peu de légèreté.",
        promoteur: "Qu'il aille droit au but et pose un acte concret plutôt que parler longtemps."
      }
    }),
    buildScenario({
      id: "communication-04",
      section: "communication",
      target: "base",
      dimension: "communication",
      title: "Tu demandes à la personne avec qui tu vis de participer davantage à la maison",
      prompt: "Ta formulation naturelle :",
      options: {
        analyseur: "On doit répartir clairement les tâches, sinon ça ne tiendra pas dans la durée.",
        perseverant: "J'ai besoin qu'on tienne nos engagements; je ne veux pas porter ça seul.",
        empathique: "Je me sens fatigué et j'aimerais qu'on prenne soin de notre espace ensemble.",
        imagineur: "Choisis une tâche précise et fais-la à ton rythme, mais j'ai besoin que ce soit fait.",
        energiseur: "On peut rendre ça moins pénible si on le fait maintenant avec de la musique.",
        promoteur: "Prends cette partie tout de suite, moi je fais l'autre, et on règle ça vite."
      }
    }),
    buildScenario({
      id: "communication-05",
      section: "communication",
      target: "base",
      dimension: "communication",
      title: "On t'invite à une soirée où tu connais peu de monde",
      prompt: "L'invitation qui te donne le plus envie de venir :",
      options: {
        analyseur: "Je te dis qui sera là, où c'est, comment ça se passe et à quelle heure ça finit.",
        perseverant: "J'aimerais vraiment ta présence; ce sera un cercle de personnes fiables et intéressantes.",
        empathique: "Je serai là avec toi, et je veux que tu te sentes bien accueilli.",
        imagineur: "Tu peux venir tranquillement, rester un peu en retrait, partir quand tu veux.",
        energiseur: "Viens, ça va être vivant, spontané, pas une soirée figée.",
        promoteur: "Passe au moins une heure; il peut y avoir des rencontres vraiment intéressantes."
      }
    }),
    buildScenario({
      id: "environment-01",
      section: "environment",
      target: "base",
      dimension: "environment",
      title: "Tu as une soirée entière pour toi",
      prompt: "La configuration qui te ferait le plus de bien :",
      options: {
        analyseur: "Un temps calme pour remettre de l'ordre, préparer demain et finir quelque chose.",
        perseverant: "Un moment nourrissant : lire, réfléchir, écrire, ou parler d'un sujet qui compte.",
        empathique: "Une ambiance douce, un repas agréable, des textures, des odeurs, une présence rassurante.",
        imagineur: "Du silence, peu de lumière, personne qui m'attend, rien à justifier.",
        energiseur: "Un appel, une sortie courte, un jeu, quelque chose qui remet du relief.",
        promoteur: "Une décision impulsive mais excitante : réserver, sortir, tenter quelque chose."
      }
    }),
    buildScenario({
      id: "environment-02",
      section: "environment",
      target: "base",
      dimension: "environment",
      title: "Tu pars quelques jours avec des amis",
      prompt: "Le style de voyage qui te convient le mieux :",
      options: {
        analyseur: "Un minimum d'itinéraire, de réservations et de repères pour profiter sans stress.",
        perseverant: "Un voyage choisi pour une vraie raison, avec des lieux qui ont du sens.",
        empathique: "Un rythme qui permet d'être ensemble, de partager, de se sentir proches.",
        imagineur: "Des temps seuls assumés, sans devoir toujours participer au groupe.",
        energiseur: "Un voyage souple, plein de découvertes, de petites folies et d'improvisation.",
        promoteur: "Un voyage avec du mouvement, des occasions à saisir et un peu d'audace."
      }
    }),
    buildScenario({
      id: "environment-03",
      section: "environment",
      target: "base",
      dimension: "environment",
      title: "Tu arrives à une fête déjà bien lancée",
      prompt: "L'endroit où tu vas le plus naturellement :",
      options: {
        analyseur: "Vers une conversation posée où je peux comprendre qui est là et ce qui se passe.",
        perseverant: "Vers quelqu'un avec qui l'échange peut devenir intéressant et pas seulement poli.",
        empathique: "Vers une personne ou un petit groupe où l'accueil semble chaleureux.",
        imagineur: "Vers un coin plus calme pour observer avant d'entrer vraiment.",
        energiseur: "Vers le groupe qui rit, bouge ou invente déjà quelque chose.",
        promoteur: "Vers les nouvelles têtes ou les personnes avec qui quelque chose peut se passer."
      }
    }),
    buildScenario({
      id: "environment-04",
      section: "environment",
      target: "base",
      dimension: "environment",
      title: "Tu organises ton coin personnel chez toi",
      prompt: "Ce que tu veux y sentir :",
      options: {
        analyseur: "Que tout soit accessible, logique, propre, sans friction inutile.",
        perseverant: "Que les objets racontent ce qui compte pour moi et ce que je respecte.",
        empathique: "Que ce soit enveloppant, beau, confortable, presque affectif.",
        imagineur: "Que ce soit simple, peu rempli, protégé du bruit des autres.",
        energiseur: "Que ça donne envie de créer, jouer, réagir, changer les choses de place.",
        promoteur: "Que ça ait du style, du caractère, et que je puisse y passer vite à l'action."
      }
    }),
    buildScenario({
      id: "need-01",
      section: "need",
      target: "phase",
      dimension: "need",
      title: "Une personne proche veut te soutenir cette semaine",
      prompt: "Ce qui te nourrirait le plus aujourd'hui :",
      options: {
        analyseur: "Qu'elle remarque concrètement ce que j'ai réussi à tenir et m'aide à poser la suite.",
        perseverant: "Qu'elle reconnaisse que je me suis vraiment impliqué et qu'elle écoute mon point de vue.",
        empathique: "Qu'elle me montre que je compte pour elle, sans que j'aie besoin de prouver quoi que ce soit.",
        imagineur: "Qu'elle respecte mon besoin d'être seul sans le prendre contre elle.",
        energiseur: "Qu'elle vienne vers moi avec de la légèreté, du contact, une envie de rire.",
        promoteur: "Qu'elle me propose quelque chose qui me réveille : défi, sortie, nouveauté, intensité."
      }
    }),
    buildScenario({
      id: "need-02",
      section: "need",
      target: "phase",
      dimension: "need",
      title: "Après une semaine longue, tu sens que tu es vidé",
      prompt: "Ce qui te ferait récupérer le plus vite :",
      options: {
        analyseur: "Mettre de l'ordre dans ce qui reste en suspens et retrouver une impression de maîtrise.",
        perseverant: "Revenir à une discussion ou une lecture qui me rappelle pourquoi certains efforts valent la peine.",
        empathique: "Être entouré avec douceur, manger quelque chose de bon, sentir que je suis aimé.",
        imagineur: "Me retirer longtemps sans bruit, sans messages, sans devoir expliquer mon absence.",
        energiseur: "Voir quelqu'un, bouger, changer d'air, retrouver une énergie plus joueuse.",
        promoteur: "Faire quelque chose qui tranche avec la semaine : rapide, intense, un peu risqué."
      }
    }),
    buildScenario({
      id: "need-03",
      section: "need",
      target: "phase",
      dimension: "need",
      title: "C'est ton anniversaire ou une journée qui devrait te célébrer",
      prompt: "Ce qui te toucherait le plus :",
      options: {
        analyseur: "Un geste précis qui montre qu'on a vu mes efforts réels, pas une phrase vague.",
        perseverant: "Une parole qui reconnaît ma fidélité, ma tenue, ce que j'ai porté dans le temps.",
        empathique: "Une attention personnelle, tendre, qui me fait sentir aimé pour moi.",
        imagineur: "Qu'on me laisse vivre cette journée simplement, sans me forcer à être au centre.",
        energiseur: "Une surprise vivante, drôle, qui déclenche une vraie réaction.",
        promoteur: "Un moment qui marque, avec de l'effet, du mouvement, quelque chose à raconter."
      }
    }),
    buildScenario({
      id: "need-04",
      section: "need",
      target: "phase",
      dimension: "need",
      title: "Tu te sens un peu éteint depuis quelques jours",
      prompt: "Le manque qui pourrait être le plus vrai :",
      options: {
        analyseur: "Je n'ai plus assez de structure ni de retour clair sur ce que je fais bien.",
        perseverant: "Je ne sens plus assez de sens, de loyauté ou de respect autour de moi.",
        empathique: "Je manque de chaleur, de tendresse, de beauté simple, d'attentions.",
        imagineur: "Je manque de solitude réelle; même seul, je me sens encore sollicité.",
        energiseur: "Je manque de contact vivant, de surprise, de liberté de réagir.",
        promoteur: "Je manque d'enjeu; tout semble trop lent, trop plat, trop sécurisé."
      }
    }),
    buildScenario({
      id: "need-05",
      section: "need",
      target: "phase",
      dimension: "need",
      title: "Tu as un samedi entièrement libre",
      prompt: "Le programme qui te ferait vraiment du bien en ce moment :",
      options: {
        analyseur: "Avancer des choses utiles, ranger, planifier, puis profiter l'esprit clair.",
        perseverant: "Faire quelque chose qui me recentre : engagement personnel, lecture, conversation de fond.",
        empathique: "Voir des proches ou créer une ambiance douce où je me sens relié.",
        imagineur: "Ne rien promettre, rester seul, laisser la journée se dérouler en silence.",
        energiseur: "Improviser, voir du monde, rire, changer de décor plusieurs fois.",
        promoteur: "Me lancer dans une activité qui donne un frisson ou une victoire rapide."
      }
    }),
    buildScenario({
      id: "need-06",
      section: "need",
      target: "phase",
      dimension: "need",
      title: "Tu choisis des vacances pour te régénérer",
      prompt: "Ce qui te ferait dire : « oui, c'est exactement ce qu'il me faut » :",
      options: {
        analyseur: "Un séjour bien préparé où je sais où je vais, avec de bons repères.",
        perseverant: "Un lieu riche de sens, d'histoire, de culture ou d'engagement personnel.",
        empathique: "Un endroit beau, confortable, sensoriel, avec des moments humains doux.",
        imagineur: "Un lieu calme où je peux disparaître, marcher, penser, ne pas parler beaucoup.",
        energiseur: "Un séjour varié, vivant, avec des rencontres, des couleurs, de l'imprévu.",
        promoteur: "Un voyage qui promet de l'intensité, de la vitesse, du jeu ou de la conquête."
      }
    }),
    buildScenario({
      id: "need-07",
      section: "need",
      target: "phase",
      dimension: "need",
      title: "Tu reçois un message qui peut vraiment te remettre de l'énergie",
      prompt: "Lequel aurait le plus d'effet sur toi aujourd'hui ?",
      options: {
        analyseur: "Ce que tu as fait est solide; voilà exactement ce que ça a changé.",
        perseverant: "Ta présence et ta fidélité ont compté; je respecte vraiment la ligne que tu tiens.",
        empathique: "Je pensais à toi; je suis heureux que tu sois dans ma vie.",
        imagineur: "Prends ton temps, je ne t'en veux pas si tu as besoin de silence.",
        energiseur: "Viens, on fait un truc qui n'a aucun sens mais qui va nous faire rire.",
        promoteur: "J'ai une idée un peu folle pour ce soir; tu es partant ?"
      }
    }),
    buildScenario({
      id: "stress-01",
      section: "stress",
      target: "phase",
      dimension: "stress",
      title: "Quelqu'un est très en retard sans prévenir",
      prompt: "Ce qui risque d'apparaître chez toi :",
      options: {
        analyseur: "Je calcule le retard, réorganise mentalement tout, puis je deviens sec.",
        perseverant: "Je le vis comme un manque de considération et je rumine la parole non tenue.",
        empathique: "Je me demande si j'ai moins d'importance pour lui que je ne le pensais.",
        imagineur: "Je me ferme, j'attends, je m'éloigne intérieurement de la situation.",
        energiseur: "Je m'agace, je râle, puis je cherche une distraction pour ne pas subir.",
        promoteur: "Je change le plan sans lui, ou je fais en sorte qu'il sente qu'il a perdu sa place."
      }
    }),
    buildScenario({
      id: "stress-02",
      section: "stress",
      target: "phase",
      dimension: "stress",
      title: "Ton programme change au dernier moment alors que tu étais déjà prêt",
      prompt: "Ton stress prendrait le plus probablement cette forme :",
      options: {
        analyseur: "Je veux immédiatement récupérer un plan clair pour ne pas perdre pied.",
        perseverant: "Je me crispe sur le fait qu'on ne respecte pas ce qui avait été décidé.",
        empathique: "Je dis que ça va, mais je sens la déception et je m'adapte trop vite.",
        imagineur: "J'ai besoin de me retirer; trop de changement d'un coup me fige.",
        energiseur: "Je fais une remarque, je souffle, puis je cherche à transformer ça en autre chose.",
        promoteur: "Je prends la main sur le nouveau plan avant que quelqu'un d'autre ne m'impose le sien."
      }
    }),
    buildScenario({
      id: "stress-03",
      section: "stress",
      target: "phase",
      dimension: "stress",
      title: "Un membre de ta famille te critique devant les autres",
      prompt: "Ce qui ressemble le plus à ton réflexe sous pression :",
      options: {
        analyseur: "Je me justifie point par point pour montrer que la critique ne tient pas.",
        perseverant: "Je réplique parce que je refuse que quelque chose de faux ou d'injuste soit posé sur moi.",
        empathique: "Je ris ou j'encaisse, mais à l'intérieur je me sens blessé et diminué.",
        imagineur: "Je me retire mentalement et j'attends que le moment passe.",
        energiseur: "Je réponds par une pique ou une pirouette, puis je peux bouder.",
        promoteur: "Je renverse le rapport de force, quitte à viser juste là où ça dérange."
      }
    }),
    buildScenario({
      id: "stress-04",
      section: "stress",
      target: "phase",
      dimension: "stress",
      title: "Ton téléphone n'arrête pas de vibrer alors que tu voulais souffler",
      prompt: "La réaction qui te ressemble le plus quand ça déborde :",
      options: {
        analyseur: "Je veux tout traiter proprement et je finis par transformer le repos en liste de tâches.",
        perseverant: "Je m'agace contre les demandes inutiles ou les gens qui ne respectent pas mon temps.",
        empathique: "Je réponds quand même pour ne pas laisser quelqu'un sans attention.",
        imagineur: "Je coupe tout et je disparais, parfois plus longtemps que prévu.",
        energiseur: "Je saute d'un message à l'autre, je m'éparpille et je perds le fil.",
        promoteur: "Je ne réponds qu'à ce qui m'intéresse vraiment et j'ignore le reste sans trop d'état d'âme."
      }
    }),
    buildScenario({
      id: "stress-05",
      section: "stress",
      target: "phase",
      dimension: "stress",
      title: "L'espace partagé chez toi devient vraiment désordonné",
      prompt: "Ce qui monte le plus facilement :",
      options: {
        analyseur: "Je vois tout ce qui ne va pas et je reprends le contrôle du rangement.",
        perseverant: "Je me dis que ce désordre révèle un manque de respect ou de responsabilité.",
        empathique: "Je me sens envahi, mais j'hésite à le dire trop fermement.",
        imagineur: "Je me replie dans mon coin et j'attends que quelqu'un fasse quelque chose.",
        energiseur: "Je râle, je dramatise un peu, puis je laisse aussi traîner des choses.",
        promoteur: "Je déplace le problème vite, je cache, je jette ou je force une solution."
      }
    }),
    buildScenario({
      id: "stress-06",
      section: "stress",
      target: "phase",
      dimension: "stress",
      title: "Dans un groupe, personne ne réagit vraiment à ce que tu viens de dire",
      prompt: "La blessure ou défense qui peut apparaître :",
      options: {
        analyseur: "Je reformule avec plus de précision, comme si je n'avais pas été assez clair.",
        perseverant: "Je me demande s'ils ont seulement écouté ou s'ils prennent le sujet à la légère.",
        empathique: "Je me sens invisible et je peux me demander si ma présence compte.",
        imagineur: "Je me tais davantage; si personne ne vient me chercher, je reste à distance.",
        energiseur: "Je tente une réaction plus forte, plus drôle ou plus provocante.",
        promoteur: "Je change de cible, je capte une autre attention, je refuse de rester ignoré."
      }
    }),
    buildScenario({
      id: "stress-07",
      section: "stress",
      target: "phase",
      dimension: "stress",
      title: "Tu accumules la fatigue sans réussir à récupérer",
      prompt: "Le scénario négatif qui te ressemble le plus :",
      options: {
        analyseur: "Je deviens plus rigide, je vérifie tout, puis je me sens nul de ne pas tenir.",
        perseverant: "Je deviens dur avec les autres et déçu de voir si peu de tenue autour de moi.",
        empathique: "Je fais encore plus plaisir, je m'épuise, puis je me sens mal aimé.",
        imagineur: "Je m'efface, je laisse les choses en plan et je me sens oublié.",
        energiseur: "Je râle, je dis oui mais, je rejette la faute sur ce qui m'ennuie.",
        promoteur: "Je provoque du mouvement, même mauvais, pour ne pas sentir l'enlisement."
      }
    }),
    buildScenario({
      id: "situations-01",
      section: "situations",
      target: "base",
      dimension: "situations",
      title: "Tu envisages de vivre avec quelqu'un",
      prompt: "Ce qui pèserait le plus dans ton choix :",
      options: {
        analyseur: "Savoir comment on organise concrètement l'argent, l'espace, les tâches et les habitudes.",
        perseverant: "Sentir que la personne est fiable, loyale, et qu'elle respecte ce qui est important pour moi.",
        empathique: "Imaginer si la maison peut devenir un lieu tendre, accueillant, où je me sens aimé.",
        imagineur: "Être certain de garder un espace à moi, où je peux me retirer sans culpabilité.",
        energiseur: "Sentir que la vie ensemble ne deviendra pas plate, qu'il restera du jeu et du mouvement.",
        promoteur: "Voir si cette vie commune ouvre quelque chose de plus intense, libre ou excitant."
      }
    }),
    buildScenario({
      id: "situations-02",
      section: "situations",
      target: "base",
      dimension: "situations",
      title: "Tu organises un voyage avec plusieurs amis",
      prompt: "Le rôle que tu prends facilement :",
      options: {
        analyseur: "Je sécurise les réservations, les trajets, les coûts et les horaires essentiels.",
        perseverant: "Je veille à ce que les choix soient cohérents avec l'esprit du voyage et respectent chacun.",
        empathique: "Je fais attention au confort, aux envies discrètes et aux tensions possibles.",
        imagineur: "Je préfère gérer une partie précise ou chercher des idées tranquillement de mon côté.",
        energiseur: "Je propose les détours, les jeux, les moments qui rendent le voyage vivant.",
        promoteur: "Je repère les occasions sur place et j'entraîne les autres quand ça vaut le coup."
      }
    }),
    buildScenario({
      id: "situations-03",
      section: "situations",
      target: "base",
      dimension: "situations",
      title: "Un ami proche traverse une période difficile",
      prompt: "Ta manière naturelle d'être là :",
      options: {
        analyseur: "Je l'aide à démêler la situation et à trouver les prochaines actions possibles.",
        perseverant: "Je reste fidèle, présent dans le temps, et je l'aide à ne pas perdre sa ligne.",
        empathique: "Je l'accueille avec douceur, sans chercher tout de suite à réparer.",
        imagineur: "Je suis là calmement, sans trop parler, en respectant son besoin d'espace.",
        energiseur: "J'essaie de lui rendre un peu d'air, de sourire, de vie, sans nier ce qu'il vit.",
        promoteur: "Je l'aide à sortir de l'immobilité par un geste concret, une décision, un déplacement."
      }
    }),
    buildScenario({
      id: RANKING_PROMPT.id,
      section: "synthesis",
      target: "base",
      dimension: "synthesis",
      weight: 1.6,
      title: RANKING_PROMPT.title,
      prompt: "Pour finir, classe les portraits globaux qui te ressemblent vraiment dans ta manière durable d'être au monde.",
      options: RANKING_PROMPT.descriptions
    })
  ];

  const QUESTIONNAIRE_SECTIONS = [
    { id: "intro", title: "Démarrage", kind: "intro" },
    {
      id: "stable",
      title: "Structure stable",
      kind: "scenarios",
      scenarioSections: ["structure", "perception"]
    },
    {
      id: "communication",
      title: "Communication",
      kind: "scenarios",
      scenarioSections: ["communication", "environment"]
    },
    {
      id: "needs",
      title: "Motivation actuelle",
      kind: "scenarios",
      scenarioSections: ["need"]
    },
    {
      id: "stress",
      title: "Stress",
      kind: "scenarios",
      scenarioSections: ["stress"]
    },
    {
      id: "situations",
      title: "Situations personnelles",
      kind: "scenarios",
      scenarioSections: ["situations", "synthesis"]
    },
    { id: "results", title: "Résultats", kind: "results" }
  ];

  const PCMData = {
    TYPES,
    TYPE_MAP: Object.fromEntries(TYPES.map((type) => [type.id, type])),
    DIMENSION_META,
    SCENARIO_ITEMS,
    QUESTIONNAIRE_SECTIONS,
    RANKING_PROMPT,
    TOTAL_SCENARIOS: SCENARIO_ITEMS.length,
    TOTAL_PROPOSITIONS: SCENARIO_ITEMS.reduce((sum, item) => sum + item.options.length, 0),
    TOTAL_PROMPTS: SCENARIO_ITEMS.length
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = PCMData;
  }
  root.PCMData = PCMData;
})(typeof window !== "undefined" ? window : globalThis);
