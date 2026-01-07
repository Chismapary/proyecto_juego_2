# PACMAN 3D - Proyecto de Computación Gráfica II

## Descripción

Este proyecto es una implementación completa del clásico juego Pacman en 3D utilizando WebGL puro. El proyecto aplica todos los conceptos aprendidos en las guías de trabajo del curso de Computación Gráfica II.

## Conceptos Aplicados de las Guías

### Hello WebGL
- Inicialización del contexto WebGL
- Configuración básica del canvas
- Manejo de shaders (vertex y fragment)

### Primitivas Geométricas
- Uso de primitivas básicas (cubos, esferas)
- Manejo de buffers de vértices e índices
- Renderizado de geometría 3D

### Transformaciones
- Matrices de transformación (traslación, rotación, escala)
- Composición de transformaciones
- Uso de gl-matrix para operaciones matriciales

### Primitivas Avanzadas
- Implementación de múltiples primitivas geométricas
- Sistema de coordenadas 3D
- Manejo de colores por objeto

### Cámara y Proyección
- Cámara orbital interactiva (coordenadas esféricas)
- Proyección en perspectiva
- Matrices de vista (view matrix)
- Control de cámara con mouse (arrastrar y zoom)
- Depth testing para renderizado correcto

## Características del Juego

### Elementos del Juego
- **Pacman**: Esfera amarilla controlable por el jugador
- **Fantasmas**: 4 fantasmas con IA (Blinky, Pinky, Inky, Clyde)
- **Laberinto**: Estructura 3D con paredes (cubos azules)
- **Puntos**: Esferas amarillas pequeñas para colectar
- **Piso**: Base del laberinto con textura oscura

### Mecánicas de Juego
- Sistema de puntuación
- Sistema de vidas (3 vidas iniciales)
- Niveles progresivos con dificultad creciente
- Detección de colisiones
- IA básica para fantasmas (persiguen a Pacman)
- Game Over y reinicio del juego

### Controles Interactivos
- **Movimiento de Pacman**: W/A/S/D o flechas direccionales
- **Saltar**: Barra espaciadora
- **Cámara**: 
  - Arrastrar mouse: Rotar cámara orbital
  - Rueda del mouse: Zoom in/out
- **Reiniciar**: Tecla R
- **Pantalla completa**: Botón "Pantalla Completa"

## Estructura de Archivos (Modular)

```
Proyecto/
├── index.html          # Página principal con canvas y shaders
├── game.js             # Lógica principal y ciclo del juego
├── escenario.js        # Módulo del laberinto (piso, paredes, puntos)
├── pacman.js           # Módulo de Pacman (movimiento, colisiones)
├── camara.js           # Módulo de cámara orbital 3D
├── fantasmas.js        # Módulo de fantasmas (IA, movimiento)
├── primitivas.js       # Definiciones de primitivas geométricas
├── gl-matrix-min.js    # Librería de matemáticas para WebGL
└── README.md           # Este archivo
```

### Organización Modular

El código está organizado en módulos independientes para facilitar el mantenimiento:

- **`escenario.js`**: Maneja todo lo relacionado con el laberinto
  - Definición del mapa
  - Sistema de puntos colectables
  - Renderizado de piso, paredes y puntos
  - Detección de colisiones con paredes

- **`pacman.js`**: Controla al personaje principal
  - Sistema de movimiento con cola de comandos
  - Animación de la boca
  - Colisión con puntos
  - Lógica de completar niveles

- **`camara.js`**: Sistema de cámara 3D
  - Cámara orbital con coordenadas esféricas
  - Controles de mouse (arrastrar y zoom)
  - Cálculo de matriz de vista

- **`fantasmas.js`**: Enemigos del juego
  - IA de persecución
  - Movimiento autónomo
  - Renderizado con ojos
  - Detección de colisión con Pacman

- **`game.js`**: Lógica central del juego
  - Inicialización de WebGL
  - Ciclo de renderizado
  - Sistema de vidas y puntuación
  - Gestión de niveles
  - Controles de teclado

## Cómo Ejecutar

1. **Opción 1 - Servidor Local (Recomendado)**
   ```bash
   # Usando Python 3
   python -m http.server 8000
   
   # Usando Python 2
   python -m SimpleHTTPServer 8000
   
   # Usando Node.js (si tienes http-server instalado)
   npx http-server -p 8000
   ```
   
   Luego abre tu navegador en: `http://localhost:8000`

2. **Opción 2 - Abrir Directamente**
   - Abre el archivo `index.html` directamente en tu navegador
   - Nota: Algunos navegadores pueden tener restricciones de seguridad

## Detalles Técnicos

### Sistema de Renderizado
- **Shaders**: Vertex shader con transformaciones MVP (Model-View-Projection)
- **Fragment shader**: Coloreado por objeto con uniform variables
- **Primitivas**: Uso de `exampleCube` y `exampleSphere` de primitivas.js
- **Depth Testing**: Habilitado para correcta visualización 3D

### Sistema de Coordenadas
- Laberinto: Grid de 19x24 (ancho x alto)
- Cada celda: 2 unidades de espacio
- Paredes: Altura de 2 unidades
- Personajes: Elevación de 0.5 unidades

### Cámara Orbital
- **Radio**: 20 unidades (ajustable con zoom)
- **Theta**: Ángulo azimutal (rotación horizontal)
- **Phi**: Ángulo de elevación (rotación vertical)
- **Target**: Centro del laberinto [0, 0, 0]

### IA de Fantasmas
- Algoritmo de persecución simple
- 70% del tiempo: Movimiento hacia Pacman
- 30% del tiempo: Movimiento aleatorio
- Velocidades diferentes por fantasma
- Incremento de velocidad por nivel

## Objetivos del Juego

1. **Objetivo Principal**: Comer todos los puntos amarillos del laberinto
2. **Evitar**: No ser atrapado por los fantasmas
3. **Progresión**: Completar niveles aumenta la dificultad
4. **Puntuación**:
   - Punto comido: +10 puntos
   - Nivel completado: +100 puntos

## Requisitos

- Navegador web moderno con soporte para WebGL
- Recomendado: Chrome, Firefox, Edge, Safari (versiones recientes)

## Sistema de Puntuación

- **Puntos por dot**: 10 puntos
- **Puntos por power pellet**: 50 puntos
- **Fantasma comido (modo asustado)**: 200 puntos
- **Bonus por nivel**: 100 puntos
- **Vidas iniciales**: 3
- **Game Over**: Cuando se pierden todas las vidas

## Paleta de Colores

- **Pacman**: Amarillo (1.0, 1.0, 0.0)
- **Blinky (Fantasma Rojo)**: (1.0, 0.0, 0.0)
- **Pinky (Fantasma Rosa)**: (1.0, 0.5, 0.8)
- **Inky (Fantasma Cian)**: (0.0, 1.0, 1.0)
- **Clyde (Fantasma Naranja)**: (1.0, 0.6, 0.0)
- **Paredes**: Azul oscuro (0.1, 0.1, 0.8)
- **Piso**: Azul muy oscuro (0.05, 0.05, 0.15)
- **Puntos**: Amarillo (1.0, 1.0, 0.0)

## Solución de Problemas

### El juego no se carga
- Verifica que todos los archivos estén en la misma carpeta
- Asegúrate de estar usando un servidor local
- Revisa la consola del navegador para errores

### WebGL no está disponible
- Actualiza tu navegador a la última versión
- Verifica que WebGL esté habilitado en la configuración del navegador
- Prueba con otro navegador

### Rendimiento lento
- Reduce el zoom de la cámara
- Cierra otras pestañas del navegador
- Verifica que tu GPU esté siendo utilizada

## Autor

Proyecto desarrollado para el curso de Computación Gráfica II

## Notas Adicionales

Este proyecto demuestra la aplicación práctica de:
- Programación de shaders GLSL
- Álgebra lineal y transformaciones 3D
- Sistemas de coordenadas y proyecciones
- Interacción usuario-aplicación
- Lógica de juego y detección de colisiones
- Renderizado en tiempo real con WebGL

Disfruta jugando Pacman 3D.
