/**
 * config.js — Variables de entorno / configuración global
 * Ajusta estos valores para personalizar la experiencia.
 */
const CONFIG = {

  /* ─── Tipo de flor ─────────────────────────────────────────────────────────
   *  Opciones: 'gerbera' | 'sunflower' | 'rose'
   * ─────────────────────────────────────────────────────────────────────── */
  flowerType: 'gerbera',

  /* ─── Cantidad y distribución ────────────────────────────────────────────── */
  flowerCount: 7,          // Cuántas flores aparecen en la escena
  spreadRadius: 6,         // Radio de distribución del jardín (unidades 3D)

  /* ─── Colores de la flor ─────────────────────────────────────────────────── */
  petalColor:    '#FF6B9D', // Color principal de los pétalos
  petalColor2:   '#FF3366', // Color interior / segunda capa de pétalos
  centerColor:   '#FFD700', // Color del centro / semillas
  stemColor:     '#2E8B22', // Color del tallo
  leafColor:     '#3CB371', // Color de las hojas

  /* ─── Escena ─────────────────────────────────────────────────────────────── */
  backgroundColor: '#0d0520',  // Color de fondo de la escena
  fogColor:        '#0d0520',  // Color de la niebla
  fogNear:         10,          // Inicio de la niebla
  fogFar:          40,          // Fin de la niebla

  /* ─── Iluminación ────────────────────────────────────────────────────────── */
  ambientIntensity:     0.4,    // Intensidad de luz ambiental (0–1)
  directionalIntensity: 1.2,    // Intensidad de luz direccional (sol)
  pointLightColor:      '#FFB6C1', // Color de la luz puntual suave

  /* ─── Animación ──────────────────────────────────────────────────────────── */
  windStrength:   0.35,  // Qué tan fuerte "sopla" el viento (0 = sin viento)
  windSpeed:      0.8,   // Velocidad de oscilación del viento
  rotationSpeed:  0.15,  // Velocidad de rotación lenta de la cámara
  cameraHeight:   4.5,   // Altura de la cámara
  cameraDistance: 12,    // Distancia de la cámara al centro

  /* ─── Partículas (brillos flotantes) ─────────────────────────────────────── */
  showParticles:  true,
  particleCount:  280,
  particleColor:  '#FFD6FF',  // Color de las partículas / destellos
  particleSize:   0.06,

  /* ─── Carta / Card ───────────────────────────────────────────────────────── */
  recipientName: 'Para ti',
  senderName:    'Con todo mi cariño ♡',
  letterTitle:   'Un pequeño jardín para ti...',
  letterContent: `Cada flor que ves aquí fue plantada con un pedacito de mi corazón.
Hice esta pequeña página porque hay personas que inspiran cosas bonitas sin darse cuenta. A veces una flor no alcanza para explicar lo que uno siente al ver sonreír a alguien, así que quise crear un pequeño espacio donde esa sensación pudiera quedarse un poco más de tiempo. No es algo grande, pero está hecho con dedicación, porque hay presencias que merecen detalles que nazcan desde lo más sincero.

Gracias por existir y por ser parte de mi vida.
Eres mi flor favorita de todo el jardín. 🌸`,

  /* ─── UI ─────────────────────────────────────────────────────────────────── */
  buttonText:     'Abrir carta',
  pageTitle:      'Jardín para ti',
};
