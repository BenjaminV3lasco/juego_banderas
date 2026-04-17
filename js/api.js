// Diccionario para países en español/latinoamérica
 
const COUNTRY_ALIASES = {
    "Arabia Saudí": ["Arabia Saudita", "Arabia"],
    "Congo": ["Republica Democratica del Congo", "RD Congo", "Congo Belga"],
    "Estados Unidos": ["EEUU", "EE. UU.", "Estados Unidos de America", "USA"],
    "Países Bajos": ["Holanda"],
    "Chequia": ["República Checa"],
    "Djibouti": ["Yibuti"],
    "Myanmar": ["Birmania"],
    "Cabo Verde": ["Cabo Verde", "Cabo Verde"],
    "Lesotho": ["Lesoto"],
    "Timor Oriental": ["Timor Leste", "Timor"],
    "Vaticano": ["Ciudad del Vaticano"],
    "Emiratos Árabes Unidos": ["Emiratos Árabes", "EAU"],
    "Brunei": ["Brunei Darussalam"],
    "Siria": ["República Árabe Siria", "Siria"],
    "Grenada": ["Granada"],
    "San Vicente y las Granadinas": ["San Vicente", "Granadinas"],
    "Santa Lucía": ["Santa Lucía"],
    "Bosnia y Herzegovina": ["Bosnia", "Herzegovina"],
    "Islas Cocos o Islas Keeling": ["Islas Cocos", "Keeling"],
    "Islas Malvinas": ["Malvinas", "Falkland Islands"],
    "Islas Salomón": ["Salomón", "Solomon Islands"],
    "Sierra Leone": ["Sierra Leona"],
    "Kirguztán": ["Kirguistán", "Kirgizistán"],
    "Anguilla": ["Anguila"],
    "Islas Turks y Caicos": ["Turks y Caicos", "Islas Turcas y Caicos"],
    "Islas Vírgenes Británicas": ["Vírgenes Británicas", "Islas Vírgenes"],
    "Islas Vírgenes de los Estados Unidos": ["Vírgenes de los Estados Unidos", "Islas Vírgenes"],
    "Islas de Navidad": ["Navidad", "Islas Navidad"],
    "Wallis y Futuna": ["Wallis y Futuna", "Wallis", "Futuna"],
    "Catar": ["Qatar"],
    "San Bartolomé": ["Bartolomé", "St. Barthélemy"],
    "Saint Marteen": ["San Martín", "Sint Maarten"],
    "San Pedro y Miquelón": ["San Pedro", "Miquelón", "Saint Pierre and Miquelon"],
    "Islas Heard y McDonald": ["Heard y McDonald", "Islas Heard"],
    "Islas Faroe": ["Islas Feroe", "Faroes"],
    "Palau": ["Palaos"],
    "Bahrein": ["Baréin"],
    "Botswana": ["Botsuana"],
    "Guinea-Bissau": ["Guinea-Bisáu","Guinea Bissau"],
    "Alandia": ["Islas Åland", "Åland"],
    "Suazilandia": ["Eswatini"],
    "Republica Eslovaca": ["Eslovaquia"],
    "Republica Dominicana": ["RD"],
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
    "Ciudad del Vaticano": ["Ciudad del Vaticano", "Vaticano","Ciudad de Vaticano"],
    "San Marino": ["San Marino", "San Marino"],
    "Tokyo": ["Tokio"],
    "Seoul": ["Seúl"],
    "Beijing": ["Pekín", "Beijing"],
    "Hanoi": ["Hanói"],
    "Rangoon": ["Yangón"],
    "Pretoria": ["Pretoria", "Ciudad del Cabo", "Bloemfontein"],
    "Tehran": ["Teherán"],
    "Baghdad": ["Bagdad"],
    "Kuwait City": ["Ciudad de Kuwait", "Kuwait"],
    "Doha": ["Doha", "Dohá"],
    "Muscat": ["Mascate"],
    "London": ["Londres"],
    "Paris": ["París"],
    "Berlin": ["Berlín"],
    "Madrid": ["Madrid"],
    "Abudabi": ["Abu Dabi"],
 
};
 
export async function fetchCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations,capital,flags,region,subregion');
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
                allCapitals: capitalValidNames,
                flag: c.flags?.svg || '',
                region: c.region || 'Other',
                subregion: c.subregion || 'Other'
            };
        });
    } catch (err) {
        console.error("Error cargando países:", err);
        return [];
    }
}