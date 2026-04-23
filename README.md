# Juego de Banderas 🌍

Un juego web interactivo diseñado para poner a prueba tus conocimientos de geografía a través de las banderas del mundo.

## 🎮 Modalidades de Juego

El juego ofrece dos niveles de desafío:

1.  **Adivina el País**: Modalidad estándar donde debes identificar el país por su bandera.
2.  **País y Capital**: El desafío máximo. Debes acertar tanto el nombre del país como su capital.

## 🚩 ¿De dónde salen las 250 banderas?

El juego utiliza la API pública [REST Countries](https://restcountries.com/), que proporciona datos de 250 entidades geográficas:

-   **195 Estados Soberanos**: Países con reconocimiento internacional pleno.
-   **55 Territorios y Dependencias**: Banderas de islas, territorios de ultramar y regiones autónomas que, aunque no son estados independientes, poseen identidad propia.

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
    └── ui/             # Módulos de interfaz de usuario
        ├── screens.js  # Control de navegación entre pantallas
        ├── statsView.js # Renderizado de resultados finales
        └── ui.js       # Referencias a elementos y feedback visual
```

## ✨ Características Principales

-   **Sistema de Alias**: Acepta variantes como "EEUU", "Holanda" o "Riad" para que la experiencia sea más fluida.
-   **Estadísticas por Región**: Análisis detallado de tus aciertos en África, América, Asia, Europa y Oceanía.
-   **Diseño Moderno**: Interfaz limpia con feedback inmediato y temporizador integrado.

## 🚀 Próximamente

-   **Persistencia de Datos**: Opción para guardar y acumular tus estadísticas históricas para seguir tu progreso a largo plazo.
-   **Modo por Continentes**: Posibilidad de filtrar las banderas por regiones específicas.

---
¡Disfruta aprendiendo sobre el mundo y sus banderas!
