
// Diccionario para países en español/latinoamérica

const COUNTRY_ALIASES = {
    "Arabia Saudí": ["Arabia Saudita", "Arabia"],
    "Congo": ["Republica Democratica del Congo", "RD Congo", "Congo Belga"],
    "Estados Unidos": ["EEUU", "EE. UU.", "Estados Unidos de America", "USA"],
    "Países Bajos": ["Holanda"],
    "Chequia": ["República Checa", "Republica Checa"],
    "Reino Unido": ["Gran Bretaña", "UK", "United Kingdom"],
    "Vaticano": ["Ciudad del Vaticano"],
    "San Marino": ["San Marino"],
    "Republica Eslovaquia": ["Eslovaquia", "Slovakia"],
    "Granades": ["Granada"],
    "Moldavia": ["Moldova"],
    "Macedonia del Norte": ["Macedonia", "North Macedonia"],
    "Sierra Leone": ["Sierra Leona"],
    "Timor Oriental": ["Timor Leste", "Timor"],
    "Brunei": ["Brunei Darussalam"],
    "Islas Faroe": ["Islas Feroe", "Faroes"],
    "Islas Malvinas": ["Malvinas", "Falkland Islands"],
    "Islas Salomón": ["Salomón", "Solomon Islands"],
    "Djibouti": ["Yibuti"],
    "Guinea-Bisáu": ["Guinea-Bisáu", "Guinea Bissau"],
    "Guinea Ecuatorial": ["Guinea Ecuatorial", "Equatorial Guinea"],

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
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations,capital,flags,region,subregion');
        const data = await response.json();
        
        return data.map(c => {
            const name = (c.translations?.spa?.common || c.name.common).split('(')[0].trim();
            const cap = c.capital?.[0] ? c.capital[0].split('(')[0].trim() : '';
            return {
                name,
                allNames: [name, ...(COUNTRY_ALIASES[name] || [])],
                capital: cap,
                allCapitals: [cap], 
                flag: c.flags?.svg || '',
                region: c.region || 'Otros',
                subregion: c.subregion || 'Otras'
            };
        });
    } catch (e) { return []; }
}