import type { QcmQuestion } from "@/types";

interface BankQuestion extends QcmQuestion {
  topic: string;
  difficulty: "Standard" | "Avancé" | "Concours";
}

const ENSAE_QUESTION_BANK: BankQuestion[] = [
  {
    id: "eco-1",
    topic: "Économétrie",
    difficulty: "Avancé",
    question:
      "Dans un modèle de données de panel dynamique (Arellano-Bond), pourquoi l'estimateur OLS classique en présence d'effet fixe individuel est-il biaisé ?",
    options: [
      "La variable retardée y_{i,t-1} est corrélée avec le terme d'erreur transformé (biais de Nickell)",
      "Les erreurs sont toujours homoscédastiques en panel",
      "La matrice X'X n'est jamais inversible lorsque N > T",
      "La transformation Within supprime uniquement la constante",
    ],
    correctIndex: 0,
    explanation:
      "Après transformation Within ou en différences premières, la variable dépendante retardée reste corrélée avec le terme d'erreur transformé, générant le biais de Nickell.",
  },
  {
    id: "eco-2",
    topic: "Économétrie",
    difficulty: "Standard",
    question:
      "Quel test permet de choisir entre un modèle à effets fixes (Within) et un modèle à effets aléatoires (GLS) en données de panel ?",
    options: [
      "Le test de Dickey-Fuller Augmenté",
      "Le test de spécification d'Hausman",
      "Le test de Breusch-Pagan",
      "Le test de Chow",
    ],
    correctIndex: 1,
    explanation:
      "Le test d'Hausman compare l'estimateur convergent sous H0 et H1 (effets fixes) à l'estimateur efficient sous H0 uniquement (effets aléatoires).",
  },
  {
    id: "eco-3",
    topic: "Économétrie",
    difficulty: "Concours",
    question:
      "Lors d'une estimation par Variables Instrumentales (2SLS), que vérifie le test de Sargan-Hansen ?",
    options: [
      "La normalité des résidus structurels",
      "La validité des restrictions de suridentification (exogénéité des instruments)",
      "L'absence d'autocorrélation d'ordre 2",
      "La stationnarité des régresseurs",
    ],
    correctIndex: 1,
    explanation:
      "Lorsque le nombre d'instruments dépasse le nombre de variables endogènes, le test J de Hansen / Sargan teste l'orthogonalité des instruments excédentaires aux erreurs.",
  },
  {
    id: "eco-4",
    topic: "Économétrie",
    difficulty: "Standard",
    question:
      "En séries temporelles, si une série est intégrée d'ordre 1 — I(1) — et qu'une combinaison linéaire de deux séries I(1) est I(0), on parle de :",
    options: [
      "Hétéroscédasticité conditionnelle (ARCH)",
      "Cointégration (au sens d'Engle et Granger)",
      "Saisonnalité stochastique",
      "Bruit blanc gaussien",
    ],
    correctIndex: 1,
    explanation:
      "Deux séries non stationnaires I(1) sont cointégrées s'il existe une combinaison linéaire stationnaire I(0), traduisant un équilibre de long terme.",
  },
  {
    id: "pr-1",
    topic: "Python / R",
    difficulty: "Standard",
    question:
      "En R, quelle fonction du package `forecast` sélectionne automatiquement les ordres (p,d,q)(P,D,Q)[s] d'un modèle SARIMA selon le critère AICc ?",
    options: [
      "sarima.fit()",
      "auto.arima()",
      "arima.select()",
      "ts.decompose()",
    ],
    correctIndex: 1,
    explanation:
      "`forecast::auto.arima()` explore l'espace des modèles ARIMA/SARIMA et retient la spécification minimisant AICc.",
  },
  {
    id: "pr-2",
    topic: "Python / R",
    difficulty: "Standard",
    question:
      "En Python avec `pandas`, quelle méthode permet d'agréger un DataFrame par groupe tout en conservant le même nombre de lignes que le DataFrame initial ?",
    options: [
      "df.groupby('promo').agg('mean')",
      "df.groupby('promo')['note'].transform('mean')",
      "df.pivot_table(index='promo')",
      "df.resample('M').sum()",
    ],
    correctIndex: 1,
    explanation:
      "`.transform()` renvoie une Series indexée comme le DataFrame original, idéale pour calculer des écarts à la moyenne de groupe.",
  },
  {
    id: "pr-3",
    topic: "Python / R",
    difficulty: "Avancé",
    question:
      "En R avec `dplyr` / `tidyverse`, quel opérateur ou fonction évite l'évaluation non standard ambiguë lors de l'écriture de fonctions génériques ?",
    options: [
      "L'opérateur d'embrassement {{ var }} (curly-curly)",
      "L'opérateur %>% uniquement",
      "La fonction attach()",
      "Le signe $ à l'intérieur de mutate()",
    ],
    correctIndex: 0,
    explanation:
      "L'opérateur `{{ }}` (embrace) de `rlang` capture et injecte proprement les noms de colonnes passés en argument dans les verbes `dplyr`.",
  },
  {
    id: "ds-1",
    topic: "Data Science",
    difficulty: "Avancé",
    question:
      "Pour un modèle de credit scoring fortement déséquilibré (3% de défauts), quelle métrique évalue le mieux la capacité discriminante ?",
    options: [
      "L'Accuracy brute",
      "Le R² ajusté",
      "L'aire sous la courbe Precision-Recall (PR-AUC) et la statistique KS",
      "La MSE sur les probabilités",
    ],
    correctIndex: 2,
    explanation:
      "L'accuracy est biaisée par la classe majoritaire. La PR-AUC et le KS mesurent la séparation réelle entre bons et mauvais payeurs.",
  },
  {
    id: "ds-2",
    topic: "Data Science",
    difficulty: "Standard",
    question:
      "En `scikit-learn`, quel risque survient si l'on applique `StandardScaler().fit_transform(X)` avant `train_test_split` ?",
    options: [
      "Une erreur de dimensionnement",
      "Une fuite de données (Data Leakage) du jeu de test vers l'entraînement",
      "Une perte de précision IEEE-754",
      "Un blocage du solveur L-BFGS",
    ],
    correctIndex: 1,
    explanation:
      "Le scaler utiliserait la moyenne et la variance du jeu de test. Il faut `fit` uniquement sur `X_train` (ou via un `Pipeline`).",
  },
  {
    id: "ds-3",
    topic: "Data Science",
    difficulty: "Concours",
    question:
      "Sur quoi repose le calcul des valeurs de Shapley (SHAP) pour expliquer la prédiction d'un modèle XGBoost ?",
    options: [
      "La décomposition en valeurs singulières (SVD)",
      "La contribution marginale moyenne de chaque variable sur toutes les coalitions possibles",
      "Les poids de la dernière couche dense",
      "La corrélation de Pearson entre features et cible",
    ],
    correctIndex: 1,
    explanation:
      "Les valeurs de Shapley issues de la théorie des jeux coopératifs attribuent équitablement le gain de prédiction à chaque variable.",
  },
  {
    id: "stat-1",
    topic: "Statistiques",
    difficulty: "Avancé",
    question:
      "En statistique bayésienne, si le prior sur p est Beta(α, β) et la vraisemblance est Binomiale(n, p) avec k succès, quel est le posterior ?",
    options: [
      "Normale(α + k, β + n)",
      "Beta(α + k, β + n - k)",
      "Gamma(α + k, β + n - k)",
      "Binomiale(n, α / (α + β))",
    ],
    correctIndex: 1,
    explanation:
      "La loi Beta est conjuguée à la Binomiale : les hyperparamètres s'actualisent en (α + k, β + n - k).",
  },
  {
    id: "stat-2",
    topic: "Statistiques",
    difficulty: "Standard",
    question:
      "Dans un plan de sondage stratifié à allocation proportionnelle (ENSAE / ANSD), quelle propriété garantit la réduction de variance par rapport au SAS ?",
    options: [
      "Les strates sont homogènes en interne et hétérogènes entre elles",
      "Les unités sont tirées avec remise",
      "La taille d'échantillon est inférieure à 30",
      "Les poids de sondage sont tous nuls",
    ],
    correctIndex: 0,
    explanation:
      "La stratification élimine la variance inter-strates : plus les strates sont homogènes, plus la précision de l'estimateur augmente.",
  },
  {
    id: "stat-3",
    topic: "Statistiques",
    difficulty: "Concours",
    question:
      "D'après le théorème de Rao-Blackwell, que produit le conditionnement d'un estimateur sans biais T par une statistique exhaustive S ?",
    options: [
      "Un estimateur biaisé mais convergent",
      "Un nouvel estimateur sans biais de variance inférieure ou égale à celle de T",
      "Une statistique de test asymptotiquement normale",
      "L'estimateur du maximum de vraisemblance dans tous les cas",
    ],
    correctIndex: 1,
    explanation:
      "E[T | S] conserve l'absence de biais et réduit (ou maintient) la variance grâce à l'inégalité de Jensen / décomposition de la variance.",
  },
  {
    id: "prob-1",
    topic: "Probabilités",
    difficulty: "Avancé",
    question:
      "Quelle condition caractérise une martingale (M_n) par rapport à une filtration (F_n) ?",
    options: [
      "M_n est intégrable, adaptée à F_n, et E[M_{n+1} | F_n] = M_n p.s.",
      "M_n est une suite croissante presque sûrement",
      "Les accroissements M_{n+1} - M_n sont toujours gaussiens",
      "Var(M_n) = 0 pour tout n",
    ],
    correctIndex: 0,
    explanation:
      "Une martingale modélise un jeu équitable : l'espérance conditionnelle de la valeur future sachant l'information présente égale la valeur présente.",
  },
  {
    id: "prob-2",
    topic: "Probabilités",
    difficulty: "Standard",
    question:
      "Si (X_n) converge en loi vers X et (Y_n) converge en probabilité vers une constante c, que dit le lemme de Slutsky sur X_n + Y_n ?",
    options: [
      "Convergence presque sûre vers X + c",
      "Convergence en loi vers X + c",
      "Convergence en moyenne quadratique vers c",
      "Aucune convergence n'est garantie",
    ],
    correctIndex: 1,
    explanation:
      "Le lemme de Slutsky assure que X_n + Y_n → X + c en loi et X_n · Y_n → cX en loi lorsque Y_n → c en probabilité.",
  },
  {
    id: "fr-1",
    topic: "Français",
    difficulty: "Standard",
    question:
      "Dans une note de synthèse de concours ENSAE, quelle est la règle fondamentale concernant l'apport de connaissances personnelles ?",
    options: [
      "Intégrer un maximum de références théoriques extérieures au dossier",
      "S'en tenir strictement aux faits, chiffres et arguments présents dans le dossier documentaire",
      "Donner son opinion personnelle dès l'introduction",
      "Recopier intégralement les titres des documents sources",
    ],
    correctIndex: 1,
    explanation:
      "La note de synthèse exige neutralité, objectivité et fidélité exclusive au dossier fourni, sans ajout d'informations extérieures.",
  },
  {
    id: "fr-2",
    topic: "Français",
    difficulty: "Avancé",
    question:
      "Parmi ces connecteurs logiques, lequel introduit rigoureusement une concession suivie d'une réfutation dans une dissertation ?",
    options: [
      "Par conséquent... en outre...",
      "Certes... toutefois...",
      "D'une part... de plus...",
      "C'est pourquoi... ainsi...",
    ],
    correctIndex: 1,
    explanation:
      "« Certes » concède un point valide, tandis que « toutefois » (ou « néanmoins ») introduit la nuance ou l'objection structurante.",
  },
  {
    id: "fr-3",
    topic: "Français",
    difficulty: "Concours",
    question:
      "Quelle formulation respecte la syntaxe soutenue attendue dans un rapport administratif ou économique ?",
    options: [
      "Malgré que les données soient incomplètes, on a conclu...",
      "Bien que les données soient incomplètes, l'analyse permet de conclure...",
      "Suite à que l'enquête ait fini, les résultats...",
      "Au jour d'aujourd'hui, il s'avère que les chiffres...",
    ],
    correctIndex: 1,
    explanation:
      "« Bien que » suivi du subjonctif est correct ; « malgré que » (hors « malgré qu'il en ait ») et « au jour d'aujourd'hui » sont à proscrire.",
  },
  {
    id: "en-1",
    topic: "Anglais",
    difficulty: "Standard",
    question:
      "In an economic briefing for an international institution, which verb accurately describes a sharp, sudden decline in inflation?",
    options: [
      "Plummeted",
      "Plateaued",
      "Skyrocketed",
      "Stagnated",
    ],
    correctIndex: 0,
    explanation:
      "'To plummet' means to fall or drop straight down at high speed, whereas 'plateaued' means stabilized and 'skyrocketed' means rose sharply.",
  },
  {
    id: "en-2",
    topic: "Anglais",
    difficulty: "Avancé",
    question:
      "Which sentence uses the conditional and inversion structure correctly for formal academic writing?",
    options: [
      "Had the central bank raised rates earlier, inflation would have been contained.",
      "If the central bank would have raised rates earlier, inflation was contained.",
      "Were the central bank raised rates earlier, inflation had been contained.",
      "Should the central bank had raised rates, inflation would contain.",
    ],
    correctIndex: 0,
    explanation:
      "Third conditional inversion ('Had + subject + past participle, ... would have + past participle') is standard in formal academic and policy prose.",
  },
  {
    id: "en-3",
    topic: "Anglais",
    difficulty: "Concours",
    question:
      "In statistical reporting, what does the phrase 'controlling for confounding variables' mean?",
    options: [
      "Deleting all outliers from the sample",
      "Isolating the effect of the variable of interest by holding other relevant factors constant",
      "Replacing missing values with the sample maximum",
      "Translating the questionnaire into another language",
    ],
    correctIndex: 1,
    explanation:
      "Controlling for confounders means including them in the model (or stratifying) so the estimated relationship is not distorted by omitted factors.",
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionOptions(q: QcmQuestion): QcmQuestion {
  const indexed = q.options.map((opt, idx) => ({
    opt,
    isCorrect: idx === q.correctIndex,
  }));
  const shuffled = shuffleArray(indexed);
  return {
    ...q,
    options: shuffled.map((item) => item.opt),
    correctIndex: shuffled.findIndex((item) => item.isCorrect),
  };
}

export function inferSubjectFromText(docName: string, docText: string): string {
  const combined = `${docName} ${docText}`.toLowerCase();
  if (/panel|arima|sarima|econometr|gmm|hausman|coint/.test(combined)) {
    return "Économétrie";
  }
  if (/\.r\b|\.py\b|pandas|dplyr|forecast|ggplot|tidyverse|python/.test(combined)) {
    return "Python / R";
  }
  if (/xgboost|shap|scoring|sklearn|pytorch|machine learning|neural/.test(combined)) {
    return "Data Science";
  }
  if (/martingale|poisson|slutsky|stochast|mesure|proba/.test(combined)) {
    return "Probabilités";
  }
  if (/fran[cç]ais|synth[eè]se|dissertation|litt[eé]rature|r[eé]daction/.test(combined)) {
    return "Français";
  }
  if (/anglais|english|grammar|essay|toefl|ielts|reporting/.test(combined)) {
    return "Anglais";
  }
  if (/bayes|sondage|rao|estimateur|statistiq/.test(combined)) {
    return "Statistiques";
  }
  return "Tous";
}

function extractCandidateTerms(docText: string): string[] {
  const words = docText.match(/[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ0-9_-]{4,24}/g) ?? [];
  const stopWords = new Set([
    "cette",
    "comme",
    "entre",
    "dans",
    "pour",
    "avec",
    "sans",
    "sous",
    "plus",
    "moins",
    "autre",
    "autres",
    "donc",
    "ainsi",
    "alors",
    "lorsque",
    "pendant",
    "depuis",
    "chaque",
    "toutes",
    "tous",
    "elle",
    "elles",
    "nous",
    "vous",
    "leur",
    "leurs",
    "sont",
    "être",
    "avoir",
    "faire",
    "peut",
    "peuvent",
    "soit",
    "page",
    "chapitre",
    "section",
    "exercice",
    "tableau",
    "figure",
  ]);
  const unique = new Set<string>();
  for (const w of words) {
    if (!stopWords.has(w.toLowerCase())) {
      unique.add(w);
    }
  }
  return Array.from(unique);
}

function buildTextDerivedQuestions(
  docName: string,
  docText: string,
  maxQuestions: number
): QcmQuestion[] {
  if (!docText || docText.trim().length < 40) return [];

  const results: QcmQuestion[] = [];
  const allTerms = extractCandidateTerms(docText);

  // 1. Code-anchored question if R/Python code is detected
  const codeLines = docText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length >= 15 &&
        l.length <= 120 &&
        /^(import |from |library\(|def |function\(|[a-zA-Z_]\w*\s*(<-|=)\s*\w+\()/.test(
          l
        )
    );

  if (codeLines.length > 0 && results.length < maxQuestions) {
    const line = codeLines[Math.floor(Math.random() * codeLines.length)];
    const isImport = /^(import |from |library\()/.test(line);
    const isDef = /^(def |.*function\()/.test(line);

    results.push(
      shuffleQuestionOptions({
        id: `doc-code-${Date.now()}-0`,
        question: `Dans votre script "${docName}", quel est le rôle principal de l'instruction suivante : \`${line}\` ?`,
        options: isImport
          ? [
              "Charger un module ou package externe requis pour l'analyse",
              "Exporter les résultats finaux au format PDF",
              "Supprimer les valeurs manquantes du jeu de données",
              "Initialiser une boucle de validation croisée",
            ]
          : isDef
            ? [
                "Définir une fonction réutilisable encapsulant un traitement",
                "Importer un jeu de données CSV depuis le disque",
                "Tracer automatiquement un corrélogramme ACF/PACF",
                "Convertir un objet R en DataFrame pandas",
              ]
            : [
                "Affecter le résultat d'un appel de fonction ou d'une transformation à une variable",
                "Clôturer la session de calcul et libérer la mémoire vive",
                "Compiler le script en binaire natif sans interpréteur",
                "Désactiver la graine aléatoire du générateur",
              ],
        correctIndex: 0,
        explanation: `Instruction extraite directement de "${docName}" : \`${line}\`.`,
      })
    );
  }

  // 2. Cloze (fill-in-the-blank) questions built directly from real sentences in the document
  const sentences = docText
    .replace(/\r?\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length >= 55 &&
        s.length <= 210 &&
        !/\.{4,}|…{2,}/.test(s) &&
        !/^\d{1,3}[A-ZÀ-ÖØ-Ý]/.test(s)
    );

  const shuffledSentences = shuffleArray(sentences);

  for (const sentence of shuffledSentences) {
    if (results.length >= maxQuestions) break;

    const candidatesInSentence = extractCandidateTerms(sentence).filter(
      (t) => t.length >= 6 && t.length <= 22 && !/^\d+$/.test(t)
    );
    if (candidatesInSentence.length === 0) continue;

    const targetTerm =
      candidatesInSentence[
        Math.floor(Math.random() * candidatesInSentence.length)
      ];
    const masked = sentence.replace(
      new RegExp(`\\b${targetTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`),
      "[ ______ ]"
    );

    if (masked === sentence) continue;

    const distractorsPool = shuffleArray(
      allTerms.filter(
        (t) =>
          t.toLowerCase() !== targetTerm.toLowerCase() &&
          t.length >= 5 &&
          !sentence.toLowerCase().includes(t.toLowerCase())
      )
    );

    const fallbackDistractors = [
      "Hétéroscédasticité",
      "Multicolinéarité",
      "Stationnarité",
      "Convergence",
      "Endogénéité",
      "Maximum de vraisemblance",
    ].filter((d) => d.toLowerCase() !== targetTerm.toLowerCase());

    const distractors = [...distractorsPool, ...fallbackDistractors].slice(
      0,
      3
    );

    results.push(
      shuffleQuestionOptions({
        id: `doc-cloze-${Date.now()}-${results.length}`,
        question: `D'après votre document "${docName}", quel terme complète exactement l'énoncé suivant ? « ${masked} »`,
        options: [targetTerm, ...distractors],
        correctIndex: 0,
        explanation: `Extrait exact du document "${docName}" : « ${sentence} »`,
      })
    );
  }

  return results;
}

export function generateDynamicFallbackQcm(params: {
  documentName: string;
  documentText: string;
  subject?: string;
  difficulty?: string;
  count?: number;
}): QcmQuestion[] {
  const targetCount = Math.min(Math.max(params.count ?? 5, 3), 7);
  const detectedTopic =
    params.subject && params.subject !== "Auto"
      ? params.subject
      : inferSubjectFromText(params.documentName, params.documentText);

  const hasRichDocumentText = params.documentText.trim().length >= 120;
  // If the uploaded document doesn't match any ENSAE bank subject (e.g. HTML5/CSS3),
  // derive all questions strictly from the document text instead of injecting unrelated R/Econometrics questions.
  const maxTextDerived =
    hasRichDocumentText && detectedTopic === "Tous"
      ? targetCount
      : Math.min(targetCount, 4);

  const textQuestions = buildTextDerivedQuestions(
    params.documentName,
    params.documentText,
    maxTextDerived
  );

  let pool =
    detectedTopic === "Tous"
      ? ENSAE_QUESTION_BANK
      : ENSAE_QUESTION_BANK.filter((q) => q.topic === detectedTopic);

  if (pool.length < targetCount) {
    const others = ENSAE_QUESTION_BANK.filter((q) => q.topic !== detectedTopic);
    pool = [...shuffleArray(pool), ...shuffleArray(others)];
  } else {
    pool = shuffleArray(pool);
  }

  if (params.difficulty && params.difficulty !== "Mixte") {
    const exactDiff = pool.filter((q) => q.difficulty === params.difficulty);
    const rest = pool.filter((q) => q.difficulty !== params.difficulty);
    pool = [...exactDiff, ...rest];
  }

  const remainingNeeded = Math.max(0, targetCount - textQuestions.length);
  const bankQuestions = pool.slice(0, remainingNeeded).map((q, idx) =>
    shuffleQuestionOptions({
      id: `${q.id}-${Date.now()}-${idx}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })
  );

  return shuffleArray([...textQuestions, ...bankQuestions]);
}
