# UX de MundoQuiz

## Listas extensas y autocompletado

Cuando una selección contiene más de 20 elementos, no mostrar todas las opciones al enfocar el campo.

Usar un autocompletado con estas reglas:

- Empezar a buscar después de escribir al menos dos caracteres.
- Filtrar por coincidencias normalizadas, sin distinguir mayúsculas ni tildes.
- Priorizar resultados que comienzan con el texto ingresado.
- Limitar la lista visible a un máximo de siete opciones.
- Permitir seleccionar una sugerencia sin enviar el formulario.
- Mantener la posibilidad de escribir una respuesta completa manualmente.
- Adaptar los nombres al idioma activo de la interfaz.

Ejemplo: al escribir `arg`, mostrar primero `Argentina` y luego otras coincidencias relacionadas, sin desplegar la lista completa de países.

## Rachas diarias

Una racha representa únicamente días consecutivos con resultado correcto.

- Un error corta la racha y la deja en cero.
- Un modo sin racha no debe mostrar el icono de fuego.
- Repetir un desafío ya resuelto no modifica la racha.

## Nombres de países y alias

Mostrar siempre un nombre canónico localizado, pero aceptar variantes comunes al evaluar respuestas.

- Aceptar abreviaturas conocidas como `EEUU`, `USA`, `UK` o `EAU`.
- Aceptar nombres históricos o coloquiales como `Holanda`, `Birmania` o `Suazilandia`.
- Aceptar formas cortas de territorios, por ejemplo `Malvinas` o `Islas Feroe`.
- Normalizar mayúsculas, espacios y tildes antes de comparar.
- Mantener los alias centralizados y separados de los componentes visuales.
- Incluir los alias al filtrar el autocompletado, mostrando como resultado el nombre canónico.
