export interface FishingRegulation {
  species: string;
  category1OpenPeriod?: string;
  category2OpenPeriod?: string;
  minSize?: string;
  dailyQuota?: string;
}

export interface DepartmentRegulation {
  id: string;
  name: string;
  code: string;
  regionId: string;
  regulations: FishingRegulation[];
  specificRules?: string[];
  federationUrl?: string;
}

export const commonRegulations: FishingRegulation[] = [
  {
    species: "Truite fario",
    category1OpenPeriod: "2ème samedi de mars au 3ème dimanche de septembre",
    category2OpenPeriod: "2ème samedi de mars au 3ème dimanche de septembre",
    minSize: "23 cm",
    dailyQuota: "6 truites"
  },
  {
    species: "Brochet",
    category1OpenPeriod: "Dernier samedi d'avril au dernier dimanche de janvier",
    category2OpenPeriod: "Dernier samedi d'avril au dernier dimanche de janvier",
    minSize: "60 cm",
    dailyQuota: "3 brochets"
  },
  {
    species: "Sandre",
    category1OpenPeriod: "Dernier samedi d'avril au 31 décembre",
    category2OpenPeriod: "Dernier samedi d'avril au 31 décembre",
    minSize: "50 cm",
    dailyQuota: "3 sandres"
  },
  {
    species: "Black-bass",
    category1OpenPeriod: "1er juin au 31 décembre (no-kill du 1er avril au 31 mai)",
    category2OpenPeriod: "1er juin au 31 décembre (no-kill du 1er avril au 31 mai)",
    minSize: "40 cm",
    dailyQuota: "3 black-bass"
  },
  {
    species: "Ombre commun",
    category1OpenPeriod: "3ème samedi de mai au 31 décembre",
    category2OpenPeriod: "3ème samedi de mai au 31 décembre",
    minSize: "30 cm",
    dailyQuota: "3 ombres"
  },
  {
    species: "Carpe",
    category1OpenPeriod: "Toute l'année",
    category2OpenPeriod: "Toute l'année",
    minSize: "Pas de taille minimale",
    dailyQuota: "Pas de quota"
  }
];

export const departmentRegulations: DepartmentRegulation[] = [
  // Auvergne-Rhône-Alpes
  {
    id: "01",
    name: "Ain",
    code: "01",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Pêche à la carpe de nuit autorisée dans les plans d'eau de 2ème catégorie",
      "Réserves temporaires pendant la fraie des brochets"
    ],
    federationUrl: "https://www.peche01.fr"
  },
  {
    id: "03",
    name: "Allier",
    code: "03",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Taille minimale truite 25 cm sur certains parcours",
      "Quota réduit à 3 truites sur parcours spécifiques"
    ],
    federationUrl: "https://www.federation-peche-allier.fr"
  },
  {
    id: "07",
    name: "Ardèche",
    code: "07",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Parcours no-kill sur plusieurs rivières",
      "Pêche aux leurres uniquement sur certains parcours carnassiers"
    ]
  },
  {
    id: "15",
    name: "Cantal",
    code: "15",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Quota truite réduit à 4 sur certains parcours",
      "Hameçons sans ardillon obligatoires sur parcours spécifiques"
    ]
  },
  {
    id: "26",
    name: "Drôme",
    code: "26",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Parcours passion avec réglementation spécifique",
      "Taille minimale truite 30 cm sur certains parcours"
    ]
  },
  {
    id: "38",
    name: "Isère",
    code: "38",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau spécifiques pour la carpe de nuit",
      "Réserves de pêche sur certains tronçons"
    ]
  },
  {
    id: "42",
    name: "Loire",
    code: "42",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Quota brochet limité à 2 sur certains plans d'eau",
      "Parcours découverte pour jeunes pêcheurs"
    ]
  },
  {
    id: "43",
    name: "Haute-Loire",
    code: "43",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Protection renforcée de la truite fario",
      "Quotas spécifiques sur lacs d'altitude"
    ]
  },
  {
    id: "63",
    name: "Puy-de-Dôme",
    code: "63",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Lacs de montagne avec réglementation spécifique",
      "Parcours mouche uniquement sur certaines rivières"
    ]
  },
  {
    id: "69",
    name: "Rhône",
    code: "69",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Pêche urbaine réglementée à Lyon",
      "Plans d'eau spécifiques pour carpistes"
    ]
  },
  {
    id: "73",
    name: "Savoie",
    code: "73",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Lacs d'altitude avec dates d'ouverture adaptées",
      "Protection des ombles chevaliers"
    ]
  },
  {
    id: "74",
    name: "Haute-Savoie",
    code: "74",
    regionId: "1",
    regulations: commonRegulations,
    specificRules: [
      "Réglementation spécifique Lac Léman",
      "Taille minimale truite 25 cm sur certains lacs"
    ]
  },
  
  // Bourgogne-Franche-Comté
  {
    id: "21",
    name: "Côte-d'Or",
    code: "21",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Parcours no-kill sur l'Ouche",
      "Quota carnassiers adapté sur le canal de Bourgogne"
    ]
  },
  {
    id: "25",
    name: "Doubs",
    code: "25",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Protection spécifique du Doubs franco-suisse",
      "Taille minimale truite 25 cm"
    ]
  },
  {
    id: "39",
    name: "Jura",
    code: "39",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Lacs jurassiens avec règles spécifiques",
      "Quotas réduits sur certains parcours"
    ]
  },
  {
    id: "58",
    name: "Nièvre",
    code: "58",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau du Morvan réglementés",
      "Quota brochet 2 sur certains lacs"
    ]
  },
  {
    id: "70",
    name: "Haute-Saône",
    code: "70",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Parcours carnassiers sur la Saône",
      "Réglementation adaptée aux plans d'eau"
    ]
  },
  {
    id: "71",
    name: "Saône-et-Loire",
    code: "71",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Pêche sur la Saône avec quotas spécifiques",
      "Plans d'eau de barrage réglementés"
    ]
  },
  {
    id: "89",
    name: "Yonne",
    code: "89",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Carnassiers sur les canaux",
      "Quota réduit sur certains plans d'eau"
    ]
  },
  {
    id: "90",
    name: "Territoire de Belfort",
    code: "90",
    regionId: "2",
    regulations: commonRegulations,
    specificRules: [
      "Étangs avec réglementation spécifique",
      "Protection de la truite fario"
    ]
  },

  // Bretagne
  {
    id: "22",
    name: "Côtes-d'Armor",
    code: "22",
    regionId: "3",
    regulations: commonRegulations,
    specificRules: [
      "Protection des salmonidés migrateurs",
      "Quotas saumon et truite de mer"
    ],
    federationUrl: "https://www.federationpeche22.fr"
  },
  {
    id: "29",
    name: "Finistère",
    code: "29",
    regionId: "3",
    regulations: commonRegulations,
    specificRules: [
      "Réglementation stricte saumon atlantique",
      "Protection des zones de fraie"
    ]
  },
  {
    id: "35",
    name: "Ille-et-Vilaine",
    code: "35",
    regionId: "3",
    regulations: commonRegulations,
    specificRules: [
      "Parcours urbains à Rennes",
      "Quotas carnassiers adaptés"
    ]
  },
  {
    id: "56",
    name: "Morbihan",
    code: "56",
    regionId: "3",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau nombreux avec règles locales",
      "Protection des poissons migrateurs"
    ]
  },

  // Centre-Val de Loire
  {
    id: "18",
    name: "Cher",
    code: "18",
    regionId: "4",
    regulations: commonRegulations,
    specificRules: [
      "Pêche sur le Cher et canaux",
      "Plans d'eau de Sologne réglementés"
    ]
  },
  {
    id: "28",
    name: "Eure-et-Loir",
    code: "28",
    regionId: "4",
    regulations: commonRegulations,
    specificRules: [
      "Parcours famille sur plusieurs rivières",
      "Quota carnassiers adapté"
    ]
  },
  {
    id: "36",
    name: "Indre",
    code: "36",
    regionId: "4",
    regulations: commonRegulations,
    specificRules: [
      "Nombreux étangs privés",
      "Réglementation plans d'eau publics"
    ]
  },
  {
    id: "37",
    name: "Indre-et-Loire",
    code: "37",
    regionId: "4",
    regulations: commonRegulations,
    specificRules: [
      "Pêche sur la Loire et affluents",
      "Parcours touristiques aménagés"
    ]
  },
  {
    id: "41",
    name: "Loir-et-Cher",
    code: "41",
    regionId: "4",
    regulations: commonRegulations,
    specificRules: [
      "Étangs de Sologne avec règles privées",
      "Quota brochet variable selon secteurs"
    ]
  },
  {
    id: "45",
    name: "Loiret",
    code: "45",
    regionId: "4",
    regulations: commonRegulations,
    specificRules: [
      "Pêche sur la Loire réglementée",
      "Canaux d'Orléans avec quotas spécifiques"
    ]
  },

  // Corse
  {
    id: "2A",
    name: "Corse-du-Sud",
    code: "2A",
    regionId: "5",
    regulations: [
      {
        species: "Truite macrostigma",
        category1OpenPeriod: "2ème samedi de mars au 30 septembre",
        minSize: "20 cm",
        dailyQuota: "5 truites"
      },
      ...commonRegulations.filter(r => r.species !== "Truite fario")
    ],
    specificRules: [
      "Protection de la truite endémique macrostigma",
      "Rivières de montagne avec accès limité"
    ]
  },
  {
    id: "2B",
    name: "Haute-Corse",
    code: "2B",
    regionId: "5",
    regulations: [
      {
        species: "Truite macrostigma",
        category1OpenPeriod: "2ème samedi de mars au 30 septembre",
        minSize: "20 cm",
        dailyQuota: "5 truites"
      },
      ...commonRegulations.filter(r => r.species !== "Truite fario")
    ],
    specificRules: [
      "Espèces endémiques protégées",
      "Quotas réduits sur tous les cours d'eau"
    ]
  },

  // Grand Est
  {
    id: "08",
    name: "Ardennes",
    code: "08",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau des Ardennes réglementés",
      "Quota carnassiers adapté"
    ]
  },
  {
    id: "10",
    name: "Aube",
    code: "10",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Lacs-réservoirs avec règles spécifiques",
      "Pêche de nuit autorisée sur certains lacs"
    ]
  },
  {
    id: "51",
    name: "Marne",
    code: "51",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Canaux de Champagne réglementés",
      "Quota brochet 2 sur certains secteurs"
    ]
  },
  {
    id: "52",
    name: "Haute-Marne",
    code: "52",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Lac du Der avec réglementation spéciale",
      "Protection truite sur têtes de bassin"
    ]
  },
  {
    id: "54",
    name: "Meurthe-et-Moselle",
    code: "54",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Moselle et affluents réglementés",
      "Plans d'eau périurbains"
    ]
  },
  {
    id: "55",
    name: "Meuse",
    code: "55",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Pêche sur la Meuse canalisée",
      "Étangs de Woëvre avec règles locales"
    ]
  },
  {
    id: "57",
    name: "Moselle",
    code: "57",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Frontière avec l'Allemagne - règles transfrontalières",
      "Canaux industriels réglementés"
    ]
  },
  {
    id: "67",
    name: "Bas-Rhin",
    code: "67",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Rhin avec réglementation internationale",
      "Protection des salmonidés"
    ]
  },
  {
    id: "68",
    name: "Haut-Rhin",
    code: "68",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Canal du Rhône au Rhin",
      "Rivières vosgiennes protégées"
    ]
  },
  {
    id: "88",
    name: "Vosges",
    code: "88",
    regionId: "6",
    regulations: commonRegulations,
    specificRules: [
      "Lacs vosgiens d'altitude",
      "Protection renforcée truites"
    ]
  },

  // Hauts-de-France
  {
    id: "02",
    name: "Aisne",
    code: "02",
    regionId: "7",
    regulations: commonRegulations,
    specificRules: [
      "Canaux avec quotas carnassiers",
      "Plans d'eau de carrières"
    ],
    federationUrl: "https://www.peche02.fr"
  },
  {
    id: "59",
    name: "Nord",
    code: "59",
    regionId: "7",
    regulations: commonRegulations,
    specificRules: [
      "Nombreux canaux réglementés",
      "Pêche urbaine à Lille"
    ]
  },
  {
    id: "60",
    name: "Oise",
    code: "60",
    regionId: "7",
    regulations: commonRegulations,
    specificRules: [
      "Étangs de Compiègne",
      "Rivières à truites protégées"
    ]
  },
  {
    id: "62",
    name: "Pas-de-Calais",
    code: "62",
    regionId: "7",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau de terrils",
      "Pêche maritime et eau douce proche"
    ]
  },
  {
    id: "80",
    name: "Somme",
    code: "80",
    regionId: "7",
    regulations: commonRegulations,
    specificRules: [
      "Étangs de la Somme réglementés",
      "Protection des zones humides"
    ]
  },

  // Île-de-France
  {
    id: "75",
    name: "Paris",
    code: "75",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Pêche sur la Seine en ville",
      "Parcours no-kill obligatoires"
    ],
    federationUrl: "http://www.federation-peche-paris.fr"
  },
  {
    id: "77",
    name: "Seine-et-Marne",
    code: "77",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau nombreux",
      "Marne et Seine avec quotas"
    ]
  },
  {
    id: "78",
    name: "Yvelines",
    code: "78",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Étangs de Versailles",
      "Seine en zone périurbaine"
    ]
  },
  {
    id: "91",
    name: "Essonne",
    code: "91",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau urbains",
      "Protection des petites rivières"
    ]
  },
  {
    id: "92",
    name: "Hauts-de-Seine",
    code: "92",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Pêche urbaine sur Seine",
      "Parcours aménagés"
    ]
  },
  {
    id: "93",
    name: "Seine-Saint-Denis",
    code: "93",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau de loisirs",
      "Canaux réglementés"
    ]
  },
  {
    id: "94",
    name: "Val-de-Marne",
    code: "94",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Marne avec parcours spécifiques",
      "Plans d'eau urbains"
    ]
  },
  {
    id: "95",
    name: "Val-d'Oise",
    code: "95",
    regionId: "8",
    regulations: commonRegulations,
    specificRules: [
      "Oise et affluents",
      "Base de loisirs réglementées"
    ]
  },

  // Normandie
  {
    id: "14",
    name: "Calvados",
    code: "14",
    regionId: "9",
    regulations: commonRegulations,
    specificRules: [
      "Rivières à salmonidés migrateurs",
      "Plans d'eau du bocage normand"
    ]
  },
  {
    id: "27",
    name: "Eure",
    code: "27",
    regionId: "9",
    regulations: commonRegulations,
    specificRules: [
      "Seine normande réglementée",
      "Protection des truites"
    ]
  },
  {
    id: "50",
    name: "Manche",
    code: "50",
    regionId: "9",
    regulations: commonRegulations,
    specificRules: [
      "Rivières côtières à salmonidés",
      "Plans d'eau intérieurs"
    ]
  },
  {
    id: "61",
    name: "Orne",
    code: "61",
    regionId: "9",
    regulations: commonRegulations,
    specificRules: [
      "Étangs du Perche",
      "Rivières à truites protégées"
    ]
  },
  {
    id: "76",
    name: "Seine-Maritime",
    code: "76",
    regionId: "9",
    regulations: commonRegulations,
    specificRules: [
      "Estuaire de la Seine réglementé",
      "Rivières de Normandie"
    ]
  },

  // Nouvelle-Aquitaine
  {
    id: "16",
    name: "Charente",
    code: "16",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Charente avec quotas carnassiers",
      "Plans d'eau charentais"
    ]
  },
  {
    id: "17",
    name: "Charente-Maritime",
    code: "17",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Zone de transition eau douce/salée",
      "Protection des zones humides"
    ]
  },
  {
    id: "19",
    name: "Corrèze",
    code: "19",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau limousins",
      "Protection truites fario"
    ]
  },
  {
    id: "23",
    name: "Creuse",
    code: "23",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Rivières à truites sauvages",
      "Lacs de barrages"
    ]
  },
  {
    id: "24",
    name: "Dordogne",
    code: "24",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Dordogne et affluents",
      "Quota carnassiers adapté"
    ]
  },
  {
    id: "33",
    name: "Gironde",
    code: "33",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Estuaire et lacs médocains",
      "Plans d'eau urbains Bordeaux"
    ]
  },
  {
    id: "40",
    name: "Landes",
    code: "40",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Lacs landais réglementés",
      "Rivières et courants"
    ]
  },
  {
    id: "47",
    name: "Lot-et-Garonne",
    code: "47",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Garonne et Lot",
      "Plans d'eau de gravières"
    ]
  },
  {
    id: "64",
    name: "Pyrénées-Atlantiques",
    code: "64",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Gaves pyrénéens à salmonidés",
      "Quota saumon réglementé"
    ]
  },
  {
    id: "79",
    name: "Deux-Sèvres",
    code: "79",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Marais poitevin réglementé",
      "Plans d'eau de plaine"
    ]
  },
  {
    id: "86",
    name: "Vienne",
    code: "86",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Vienne et affluents",
      "Plans d'eau touristiques"
    ]
  },
  {
    id: "87",
    name: "Haute-Vienne",
    code: "87",
    regionId: "10",
    regulations: commonRegulations,
    specificRules: [
      "Lacs limousins",
      "Protection truites fario"
    ],
    federationUrl: "https://www.federation-peche87.com"
  },

  // Occitanie
  {
    id: "09",
    name: "Ariège",
    code: "09",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Rivières pyrénéennes protégées",
      "Quota truite réduit en altitude"
    ]
  },
  {
    id: "11",
    name: "Aude",
    code: "11",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Canal du Midi réglementé",
      "Plans d'eau languedociens"
    ]
  },
  {
    id: "12",
    name: "Aveyron",
    code: "12",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Lacs du Lévézou",
      "Gorges du Tarn protégées"
    ]
  },
  {
    id: "30",
    name: "Gard",
    code: "30",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau méditerranéens",
      "Protection des truites cévenoles"
    ]
  },
  {
    id: "31",
    name: "Haute-Garonne",
    code: "31",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Garonne toulousaine",
      "Lacs pyrénéens d'altitude"
    ]
  },
  {
    id: "32",
    name: "Gers",
    code: "32",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau gersois",
      "Rivières à carnassiers"
    ]
  },
  {
    id: "34",
    name: "Hérault",
    code: "34",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Lacs du Salagou et Avène",
      "Rivières méditerranéennes"
    ]
  },
  {
    id: "46",
    name: "Lot",
    code: "46",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Vallée du Lot réglementée",
      "Plans d'eau caussenards"
    ]
  },
  {
    id: "48",
    name: "Lozère",
    code: "48",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Lacs d'altitude en Aubrac",
      "Protection truites sauvages"
    ]
  },
  {
    id: "65",
    name: "Hautes-Pyrénées",
    code: "65",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Lacs pyrénéens protégés",
      "Quota truite réduit altitude"
    ]
  },
  {
    id: "66",
    name: "Pyrénées-Orientales",
    code: "66",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau catalans",
      "Rivières méditerranéennes"
    ]
  },
  {
    id: "81",
    name: "Tarn",
    code: "81",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Gorges du Tarn",
      "Plans d'eau de barrages"
    ]
  },
  {
    id: "82",
    name: "Tarn-et-Garonne",
    code: "82",
    regionId: "11",
    regulations: commonRegulations,
    specificRules: [
      "Garonne et Tarn",
      "Plans d'eau de gravières"
    ]
  },

  // Pays de la Loire
  {
    id: "44",
    name: "Loire-Atlantique",
    code: "44",
    regionId: "12",
    regulations: commonRegulations,
    specificRules: [
      "Loire estuarienne",
      "Plans d'eau périurbains Nantes"
    ]
  },
  {
    id: "49",
    name: "Maine-et-Loire",
    code: "49",
    regionId: "12",
    regulations: commonRegulations,
    specificRules: [
      "Loire et affluents",
      "Étangs d'Anjou"
    ],
    federationUrl: "https://www.fedepeche49.fr"
  },
  {
    id: "53",
    name: "Mayenne",
    code: "53",
    regionId: "12",
    regulations: commonRegulations,
    specificRules: [
      "Mayenne et canaux",
      "Plans d'eau bocagers"
    ]
  },
  {
    id: "72",
    name: "Sarthe",
    code: "72",
    regionId: "12",
    regulations: commonRegulations,
    specificRules: [
      "Sarthe et affluents",
      "Plans d'eau sarthois"
    ]
  },
  {
    id: "85",
    name: "Vendée",
    code: "85",
    regionId: "12",
    regulations: commonRegulations,
    specificRules: [
      "Plans d'eau vendéens",
      "Rivières côtières"
    ]
  },

  // Provence-Alpes-Côte d'Azur
  {
    id: "04",
    name: "Alpes-de-Haute-Provence",
    code: "04",
    regionId: "13",
    regulations: commonRegulations,
    specificRules: [
      "Lacs alpins d'altitude",
      "Protection truites fario"
    ]
  },
  {
    id: "05",
    name: "Hautes-Alpes",
    code: "05",
    regionId: "13",
    regulations: commonRegulations,
    specificRules: [
      "Lacs de montagne réglementés",
      "Quota truite réduit"
    ]
  },
  {
    id: "06",
    name: "Alpes-Maritimes",
    code: "06",
    regionId: "13",
    regulations: commonRegulations,
    specificRules: [
      "Rivières méditerranéennes",
      "Plans d'eau de montagne"
    ]
  },
  {
    id: "13",
    name: "Bouches-du-Rhône",
    code: "13",
    regionId: "13",
    regulations: commonRegulations,
    specificRules: [
      "Canal de Provence",
      "Plans d'eau urbains"
    ]
  },
  {
    id: "83",
    name: "Var",
    code: "83",
    regionId: "13",
    regulations: commonRegulations,
    specificRules: [
      "Lacs varois réglementés",
      "Rivières méditerranéennes"
    ]
  },
  {
    id: "84",
    name: "Vaucluse",
    code: "84",
    regionId: "13",
    regulations: commonRegulations,
    specificRules: [
      "Sorgue et affluents",
      "Plans d'eau provençaux"
    ]
  }
];

export const getDepartmentsByRegion = (regionId: string): DepartmentRegulation[] => {
  return departmentRegulations.filter(dept => dept.regionId === regionId);
};

export const getDepartmentByCode = (code: string): DepartmentRegulation | undefined => {
  return departmentRegulations.find(dept => dept.code === code);
};
