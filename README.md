# Juego de Banderas 🌍

Un juego web interactivo diseñado para poner a prueba tus conocimientos de geografía a través de las banderas del mundo.

[✅ Jugar ahora en Vercel](https://juego-banderas-ivory.vercel.app)

## 🛠️ Stack Tecnológico
* **Frontend:** HTML5, CSS3 (con diseño modular y Glassmorphism), Vanilla JavaScript (ES6+).
* **Arquitectura:** Patrón modular con Separación de Responsabilidades (SoC).
* **Datos:** Integración con REST API externa.

## ❓¿De qué trata?
Se te muestra la bandera de un territorio y tenés que escribir su nombre. Podés equivocarte, saltar o confirmar tu respuesta. Al terminar todas las banderas, el juego te muestra un resumen completo de tu desempeño por región y subregión.

## 🎮 Modalidades de Juego

El juego ofrece dos niveles de desafío:

1.  **Adivina el País**: Modalidad estándar donde debes identificar el país por su bandera.
2.  **País y Capital**: El desafío máximo. Debes acertar tanto el nombre del país como su capital.

## 🚩 ¿De dónde salen las 250 banderas?

Los datos del juego se obtienen en tiempo real desde [REST Countries](https://restcountries.com/), una API pública y gratuita que recopila información geográfica de todos los territorios del mundo.
La API no distingue entre países soberanos y territorios dependientes — devuelve cualquier entidad que tenga bandera, nombre y datos geográficos propios. Por eso el número total ronda los 250 en vez de los 195 países reconocidos por la ONU. Esta base de datos se clasifica de la siguiente manera:

> **195 Estados Soberanos:** Países con reconocimiento pleno por la Organización de las Naciones Unidas (ONU).

#### 🌏 Otros Territorios y Dependencias (55 entidades)
| Tipo | Detalles |
| :--- | :--- |
| **Ultramar y Autónomos** | Territorios como Groenlandia, Islas Feroe, Aruba y Gibraltar. |
| **En Disputa** | Regiones con reconocimiento parcial o disputas territoriales como las Islas Malvinas o Kosovo. |
| **Científicos** | Territorios deshabitados como la Antártida o las Islas Heard y McDonald. |

## 📱 Pantalla de estadísticas
Al completar todas las banderas aparece un resumen con:

- Acierto global — porcentaje total de respuestas correctas
- Por región — Europa, América, África, Asia, Oceanía (acordeón expandible)
- Por subregión — dentro de cada región, el desglose por zona geográfica
- Tiempo total — cuánto tardaste en completar el juego
- Acierto de capitales — solo en el modo País y Capital

Las barras de color indican el nivel de acierto: 🟢 verde ≥ 75%, 🟡 amarillo ≥ 50%, 🔴 rojo < 50%.
## ✨ Normalización de respuestas

El juego es tolerante con los acentos y las mayúsculas — "mexico", "México" y "MÉXICO" se consideran la misma respuesta. Esto se maneja en state.js con la función normalize().
Para los nombres de países y capitales que tienen traducciones muy distintas entre el inglés y el español, hay dos diccionarios en api.js:

1. **COUNTRY_ALIASES** — nombres alternativos para países (ej. "Holanda", "República Checa")
2. **CAPITAL_ALIASES** — traducciones de capitales al español (ej. "Varsovia", "Tokio", "Pekín")

Si encontrás un país que no acepta su nombre en español, podés agregar el alias en el diccionario correspondiente.

## 📂 Estructura del Proyecto

El código está organizado de forma modular para facilitar su mantenimiento:

```text
juego-banderas/
├── index.html          # Estructura principal y contenedores de pantallas
├── css/
│   └── style.css       # Estilos visuales y diseño responsive
└── js/
    ├── api.js          # Gestión de datos (fetch y diccionarios de alias)
    ├── app.js          # Punto de entrada y configuración de eventos
    ├── game.js         # Lógica central del ciclo de juego
    ├── state.js        # Gestión del estado de la partida y temporizador
    ├── stats.js        # Lógica de procesamiento de estadísticas
    ├── storage.js      # Persistencia local (localStorage) del ranking
    └── ui/             # Módulos de interfaz de usuario
        ├── screens.js  # Control de navegación entre pantallas
        ├── statsView.js # Renderizado de resultados finales
        └── ui.js       # Referencias a elementos y feedback visual
```


## 🚀 Próximamente

-   **Persistencia de Datos**: Opción para guardar y acumular tus estadísticas históricas para seguir tu progreso a largo plazo.
-   **Modo por Continentes**: Posibilidad de filtrar las banderas por regiones específicas.

---
¡Disfruta aprendiendo sobre el mundo y sus banderas!
