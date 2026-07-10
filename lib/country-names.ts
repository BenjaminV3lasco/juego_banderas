const SPANISH_NAME_OVERRIDES: Record<string, string> = {
  "Faroe Islands": "Islas Feroe",
  "Saint Martin": "San Martín (parte francesa)",
  "Sint Maarten": "San Martín (parte neerlandesa)",
  "DR Congo": "República Democrática del Congo",
  "Curaçao": "Curazao",
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  "United States": ["EEUU", "EE. UU.", "Estados Unidos de América", "USA", "US", "United States of America"],
  "Falkland Islands": ["Malvinas", "Falklands", "Islas Falkland"],
  "Netherlands": ["Holanda"],
  "United Kingdom": ["Reino Unido", "Gran Bretaña", "UK", "Great Britain"],
  "United Arab Emirates": ["Emiratos", "EAU", "UAE"],
  "Dominican Republic": ["República Dominicana", "RD"],
  "Central African Republic": ["República Centroafricana", "Centroáfrica"],
  "DR Congo": ["Congo Democrático", "Congo Kinshasa", "RDC", "RD Congo"],
  "Congo": ["República del Congo", "Congo Brazzaville"],
  "Czechia": ["República Checa"],
  "Myanmar": ["Birmania"],
  "Eswatini": ["Suazilandia", "Swaziland"],
  "Timor-Leste": ["Timor", "Timor Leste"],
  "Vatican City": ["Vaticano", "Santa Sede", "Holy See"],
  "Palestine": ["Estado de Palestina"],
  "Saudi Arabia": ["Arabia Saudita", "Arabia"],
  "Cape Verde": ["Cabo Verde"],
  "Ivory Coast": ["Costa de Marfil", "Côte d'Ivoire"],
  "South Korea": ["Corea del Sur", "República de Corea"],
  "North Korea": ["Corea del Norte", "RPDC"],
  "Russia": ["Federación Rusa"],
  "Bolivia": ["Estado Plurinacional de Bolivia"],
  "Venezuela": ["República Bolivariana de Venezuela"],
  "Syria": ["Siria", "República Árabe Siria"],
  "Laos": ["República Democrática Popular Lao"],
  "Vietnam": ["Viet Nam"],
  "Brunei": ["Brunéi", "Brunei Darussalam"],
  "Saint Martin": ["San Martín", "Saint-Martin", "San Martin francés"],
  "Sint Maarten": ["San Martín", "Saint Maarten", "Saint Marteen", "Sint Martin", "San Martin neerlandés"],
  "Saint Barthélemy": ["San Bartolomé", "St Barth", "St. Barthélemy"],
  "Saint Kitts and Nevis": ["San Cristóbal y Nieves", "Saint Kitts"],
  "Saint Vincent and the Grenadines": ["San Vicente", "San Vicente y las Granadinas", "Granadinas"],
  "Cocos (Keeling) Islands": ["Islas Cocos", "Islas Keeling", "Cocos"],
  "Faroe Islands": ["Islas Feroe", "Feroe", "Faroes"],
  "British Virgin Islands": ["Islas Vírgenes Británicas", "Vírgenes Británicas"],
  "United States Virgin Islands": ["Islas Vírgenes Estadounidenses", "Vírgenes de Estados Unidos"],
  "Türkiye": ["Turquía", "Turkey"],
};

export function getSpanishCountryName(englishName: string, datasetName: string) {
  return SPANISH_NAME_OVERRIDES[englishName] || datasetName.split("(")[0].trim();
}

export function getCountryAliases(englishName: string) {
  return COUNTRY_ALIASES[englishName] || [];
}
