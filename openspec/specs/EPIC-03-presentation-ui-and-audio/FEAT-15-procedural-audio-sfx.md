# Feature 15: Sistema de Audio Retro Procedural

**Épica:** `EPIC-03: Presentación Visual, HUD y Audio (Presentation Layer)`  
**Módulo:** `src/audio/WebAudioSynth.ts` y `src/audio/SoundManager.ts`  
**Estado:** Especificado  

## Descripción General
Implementa un sintetizador de audio procedimental ligero utilizando la API nativa `Web Audio API` para generar efectos de sonido de estilo 8-bit / chiptune sin requerir descargas pesadas de archivos `.mp3` ni `.wav`.

---

### Historia de Usuario HU-29: Sintetizador Web Audio para pitidos y fanfarrias retro
*Como jugador,*  
*Quiero escuchar pitidos nítidos en la cuenta regresiva inicial (3, 2, 1) y una fanfarria triunfal al ganar,*  
*Para sentir la emoción retro y la retroalimentación auditiva del desenlace de la partida.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Cuenta regresiva 3, 2, 1
  Durante los primeros 3 segundos de cuenta regresiva
  Cuando el contador marca 3, 2 y 1
  Entonces el oscilador sintetiza un pitido corto de onda cuadrada a 440 Hz (0.15 s)
  Y al llegar a 0 (inicio de combate) emite un tono agudo de inicio a 880 Hz.

Escenario: Fanfarria de victoria retro
  Cuando la salud de un bando llega a 0
  Entonces se reproduce una secuencia polifónica de arpegios retro de victoria
  Y se silencian los efectos de zumbido de combate.
```

---

### Historia de Usuario HU-30: Efectos dinámicos de corte, láser y DoT de fuego
*Como jugador,*  
*Quiero escuchar efectos sonoros diferenciados para cuchillas exponenciales, láseres y quemaduras,*  
*Para identificar táctica y auditivamente las amenazas en pantalla.*

#### Criterios de Aceptación (Gherkin):
```gherkin
Escenario: Sonido de Cuchilla Exponencial
  Cuando se detona la habilidad "지수 칼날!"
  Entonces el sintetizador produce un barrido de frecuencia descendente rápido (1200 Hz -> 200 Hz con modulación de sierra)
  Simulando el corte de una hoja afilada a través del aire.
```
