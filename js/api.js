
// Diccionario para países en español/latinoamérica

const COUNTRY_ALIASES = {
    "Arabia Saudí": ["Arabia Saudita", "Arabia"],
    "Congo": ["Republica Democratica del Congo", "RD Congo", "Congo Belga"],
    "Estados Unidos": ["EEUU", "EE. UU.", "Estados Unidos de America", "USA"],
    "Países Bajos": ["Holanda"],
    "Chequia": ["República Checa"]
};

// Diccionario para capitales en español/latinoamérica
const CAPITAL_ALIASES = {
    "New Delhi": ["Nueva Delhi"],
    "Athens": ["Atenas"],
    "Cairo": ["El Cairo"],
    "Warsaw": ["Varsovia"],
    "Brussels": ["Bruselas"],
    "Bucharest": ["Bucarest"],
    "Prague": ["Praga"],
    "Rome": ["Roma"],
    "Lisbon": ["Lisboa"],
    "Copenhagen": ["Copenhague"],
    "Sucre": ["La Paz"],
    "Panama City": ["Ciudad de Panamá", "Panamá"],
    "Nassau": ["Nasáu","Nasau"],
    "Kuala Lumpur": ["Kuala Lumpur", "Kuala Lampur"],
    "Abu Dhabi": ["Abu Dabi"],
    "Riyadh": ["Riad"],
    "Bangkok": ["Bangkok", "Bangkok"],
    "Helsinki": ["Helsinki", "Helsínki"],
    "Stockholm": ["Estocolmo"],
    "Oslo": ["Oslo", "Óslo"],
    "Bern": ["Berna"],
    "Vienna": ["Viena"],
    "Dublin": ["Dublín"],
    "Zagreb": ["Zagreb", "Zágreb"],
    "Belgrade": ["Belgrado"],
    "Sofia": ["Sofía"],
    "Skopje": ["Skopie"],
    "Podgorica": ["Podgorica", "Podgoritsa"],
    "Sarajevo": ["Sarajevo", "Sarajevo"],
    "Ljubljana": ["Liubliana"],
    "Riga": ["Riga", "Rīga"],
    "Vilnius": ["Vilnius", "Vilna"],
    "Tallinn": ["Tallin", "Tallinn"],
    "Valletta": ["Valletta", "Valeta"],
    "Chisinau": ["Chisinau", "Chisináu"],
    "Pristina": ["Pristina", "Pristina"],
    "Andorra la Vieja": ["Andorra la Vieja", "Andorra"],
    "Ciudad del Vaticano": ["Ciudad del Vaticano", "Vaticano"],
    "San Marino": ["San Marino", "San Marino"],

};

export async function fetchCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations,capital,flags');
        const data = await response.json();
        
        return data.map(c => {
            const nameSpa = c.translations?.spa?.common || c.name.common;
            const cleanName = nameSpa.split('(')[0].trim();
            
            // Lógica para País
            const countryValidNames = [cleanName];
            if (COUNTRY_ALIASES[cleanName]) countryValidNames.push(...COUNTRY_ALIASES[cleanName]);

            // Lógica para Capital
            const rawCapital = c.capital?.[0] ? c.capital[0].split('(')[0].trim() : '';
            const capitalValidNames = [rawCapital];
            if (CAPITAL_ALIASES[rawCapital]) capitalValidNames.push(...CAPITAL_ALIASES[rawCapital]);

            return {
                name: cleanName,
                allNames: countryValidNames,
                capital: rawCapital,
                allCapitals: capitalValidNames, // Guardamos la lista de capitales válidas
                flag: c.flags?.svg || ''
            };
        });
    } catch (err) {
        console.error("Error cargando países:", err);
        return [];
    }
}