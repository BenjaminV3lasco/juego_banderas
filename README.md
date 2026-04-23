# Juego de Banderas 🌍

Un juego web interactivo diseñado para poner a prueba tus conocimientos de geografía a través de las banderas del mundo.

**[🎮 ¡Jugar ahora en Firebase!](https://juego-banderas-497b1.web.app)**

## 🛠️ Stack Tecnológico
* **Frontend:** HTML5, CSS3 (con diseño modular y Glassmorphism), Vanilla JavaScript (ES6+).
* **Backend:** Firebase (Firestore Database) para el ranking mundial en tiempo real.
* **Hosting:** Firebase Hosting.
* **Datos:** Integración con la API pública de REST Countries.

## 🏆 Ranking Mundial (Salón de la Fama)
El juego cuenta con un sistema de ranking global conectado a la nube. Los jugadores pueden competir por entrar en el podio (Oro, Plata y Bronce) basándose en sus aciertos y velocidad. El ranking se actualiza automáticamente al finalizar cada partida.

## 🎮 Modalidades de Juego

El juego ofrece dos niveles de desafío:

1.  **Adivina el País**: Modalidad estándar donde debes identificar el país por su bandera.
2.  **País y Capital**: El desafío máximo. Debes acertar tanto el nombre del país como su capital.

## 🚩 ¿De dónde salen las 250 banderas?

Los datos del juego se obtienen en tiempo real desde [REST Countries](https://restcountries.com/). La API devuelve un total aproximado de 250 entidades, clasificadas de la siguiente manera:

- **195 Estados Soberanos**: Países con reconocimiento pleno por la ONU.
- **55 Territorios y Dependencias**: Incluye regiones de ultramar, territorios autónomos (Groenlandia, Aruba, Gibraltar) y zonas en disputa o bases científicas.

## 📂 Estructura del Proyecto

El código está organizado de forma modular para facilitar su mantenimiento:

```text
juego-banderas/
├── index.html          # Estructura principal y contenedores de pantallas
├── css/
│   └── style.css       # Estilos visuales y diseño responsive
├── js/
│   ├── app.js          # Punto de entrada y orquestador de eventos
│   ├── core/           # Lógica central (juego, estado, estadísticas)
│   ├── services/       # Conexiones externas (API, LocalStorage, Firebase)
│   └── ui/             # Interfaz de usuario (pantallas y ranking)
├── firebase.json       # Configuración de despliegue de Firebase
├── .firebaserc         # Referencia al proyecto de Firebase Cloud
└── README.md           # Documentación del proyecto
```

## ✨ Características Principales

-   **Normalización Inteligente**: Acepta variantes con/sin tildes y abreviaturas comunes (ej. "EEUU").
-   **Estadísticas Detalladas**: Desglose por regiones y subregiones geográficas con feedback visual (verde/amarillo/rojo).
-   **Diseño Dark Premium**: Interfaz moderna con efectos de desenfoque (Glassmorphism) y adaptada a móviles.

---
¡Disfruta aprendiendo sobre el mundo y sus banderas!
