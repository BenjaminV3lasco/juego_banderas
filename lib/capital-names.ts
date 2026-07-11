const SPANISH_CAPITALS: Record<string, string> = {
  "Abu Dhabi": "Abu Dabi", "Addis Ababa": "Adís Abeba", Algiers: "Argel", Ashgabat: "Asjabad",
  Amsterdam: "Ámsterdam", Athens: "Atenas", Baku: "Bakú", Baghdad: "Bagdad", Beijing: "Pekín", Beirut: "Beirut", Belgrade: "Belgrado", Bern: "Berna",
  Bishkek: "Biskek", Brussels: "Bruselas", Bucharest: "Bucarest", Cairo: "El Cairo", "Chișinău": "Chisináu",
  Copenhagen: "Copenhague", Damascus: "Damasco", Djibouti: "Yibuti", Dushanbe: "Dusambé",
  "East Jerusalem": "Jerusalén Este", Gaborone: "Gaborón", Georgetown: "Georgetown",
  Dhaka: "Daca", "Guatemala City": "Ciudad de Guatemala", Hanoi: "Hanói", "Havana": "La Habana", Jakarta: "Yakarta", Jerusalem: "Jerusalén", Kathmandu: "Katmandú", Khartoum: "Jartum", Kyiv: "Kiev", Lisbon: "Lisboa", Ljubljana: "Liubliana", London: "Londres", Malé: "Malé",
  "Mexico City": "Ciudad de México", Minsk: "Minsk", Moscow: "Moscú", "N'Djamena": "Yamena",
  Muscat: "Mascate", "New Delhi": "Nueva Delhi", Nicosia: "Nicosia", Nouakchott: "Nuakchot", Nouméa: "Numea", Ouagadougou: "Uagadugú", "Panama City": "Ciudad de Panamá",
  "Phnom Penh": "Nom Pen", "Port-au-Prince": "Puerto Príncipe", Prague: "Praga", Pyongyang: "Pionyang", Reykjavik: "Reikiavik", Riyadh: "Riad", Rome: "Roma",
  "Saint John's": "Saint John", "Sana'a": "Saná", "São Tomé": "Santo Tomé", Seoul: "Seúl",
  Singapore: "Singapur", Skopje: "Skopie", Sofia: "Sofía", Stockholm: "Estocolmo", Taipei: "Taipéi", Tallinn: "Tallin", Tashkent: "Taskent", Tbilisi: "Tiflis",
  Tehran: "Teherán", Tirana: "Tirana", Tokyo: "Tokio", Tripoli: "Trípoli", Tunis: "Túnez", "Ulan Bator": "Ulán Bator", Ulaanbaatar: "Ulán Bator",
  Valletta: "La Valeta", Vienna: "Viena", Vientiane: "Vientián", Vilnius: "Vilna", Warsaw: "Varsovia", Yamoussoukro: "Yamusukro", Yaoundé: "Yaundé", Yerevan: "Ereván", Zagreb: "Zagreb",
  "Port Louis": "Puerto Luis", "Port Moresby": "Puerto Moresby", "Port of Spain": "Puerto España",
  "Cape Town": "Ciudad del Cabo", "Pretoria": "Pretoria", "Bloemfontein": "Bloemfontein",
  "Washington D.C.": "Washington D. C.", "Washington, D.C.": "Washington D. C.", "Kuwait City": "Ciudad de Kuwait", "City of San Marino": "Ciudad de San Marino",
  "Vatican City": "Ciudad del Vaticano", "Luxembourg": "Luxemburgo", "Monaco": "Mónaco",
};

const EXTRA_ALIASES: Record<string, string[]> = {
  Kyiv: ["Kiev"], Beijing: ["Beijing"], "Ulan Bator": ["Ulaanbaatar", "Ulán Bator"],
  "Washington D.C.": ["Washington", "Washington DC"], "Washington, D.C.": ["Washington", "Washington DC"], "Sana'a": ["Sanaa", "Sana"],
};

export function getSpanishCapitalName(englishName: string) {
  return SPANISH_CAPITALS[englishName] || englishName;
}

export function getCapitalAliases(englishName: string) {
  const spanishName = getSpanishCapitalName(englishName);
  return [...new Set([englishName, spanishName, ...(EXTRA_ALIASES[englishName] || [])])];
}
