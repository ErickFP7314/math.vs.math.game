export type Language = 'en' | 'es' | 'ko';

export interface LevelTranslation {
  title: string;
  subtitle: string;
  description: string;
  leftName: string;
  rightName: string;
  leftLabel: string;
  rightLabel: string;
}

export interface Translations {
  gameTitle: string;
  gameSubtitle: string;
  selectLevel: string;
  levelBadge: string;
  levelsList: string;
  controlsTip: string;
  playerBadge: string;
  skillReady: string;
  recharging: string;
  nextLevel: string;
  retry: string;
  backToLevels: string;
  victory: string;
  defeat: string;
  remainingHp: string;
  vs: string;
  ready: string;
  onFire: string;
  immune: string;
  graphInvoke: string;
  expBlade: string;
  sectorSlash: string;
  sineWave: string;
  cosineWave: string;
  integralWhip: string;
  integralWhipReady: string;
  partialYReady: string;
  spheresCount: string;
  derivationsCount: string;
  derivativeAttempt: string;
  nextSector: string;
  blade: string;
  phaseI: string;
  phaseMinus1: string;
  phaseMinusI: string;
  phase1: string;
  fight: string;
  mathGuide: string;
  theoryTitle: string;
  interactiveDemo: string;
  playLevel: string;
  formulaBreakdown: string;
  gameplayConnection: string;
  levels: Record<number, LevelTranslation>;
}

export const translations: Record<Language, Translations> = {
  en: {
    gameTitle: 'MATH VS MATH',
    gameSubtitle: '2D Mathematical Combat Simulator',
    selectLevel: 'Select a Level',
    levelBadge: 'LEVEL',
    levelsList: 'Levels',
    controlsTip: 'Click / Tap to dash • Space or button for skill',
    playerBadge: 'YOU',
    skillReady: 'SKILL READY!',
    recharging: 'Cooldown',
    nextLevel: 'Next Level',
    retry: 'Retry Match',
    backToLevels: 'Level Selector',
    victory: 'Victory!',
    defeat: 'Defeat!',
    remainingHp: 'Remaining HP',
    vs: 'VS',
    ready: 'READY',
    onFire: 'On Fire!',
    immune: 'Immune!',
    graphInvoke: 'Graph Invocation!',
    expBlade: 'Exponential Blade!',
    sectorSlash: 'Sector Slash!',
    sineWave: 'Sine Wave!',
    cosineWave: 'Cosine Wave!',
    integralWhip: 'Integral Whip!',
    integralWhipReady: '∫ Whip Ready!',
    partialYReady: 'Ready for ∂/∂y',
    spheresCount: 'Balls',
    derivationsCount: 'Derivative',
    derivativeAttempt: 'Derivative Attempt',
    nextSector: 'Next Sector',
    blade: 'Blade',
    phaseI: 'i (Pierce)',
    phaseMinus1: '-1 (Reflect)',
    phaseMinusI: '-i (Pierce+Reflect)',
    phase1: '1 (Normal)',
    fight: 'Fight!',
    mathGuide: 'Math Theory & Guide',
    theoryTitle: 'Didactic Math Explanation',
    interactiveDemo: 'Interactive Simulation',
    playLevel: 'Play This Level',
    formulaBreakdown: 'Calculus Breakdown',
    gameplayConnection: 'Gameplay Mechanics Connection',
    levels: {
      1: {
        title: 'Differential Operator vs. Polynomial',
        subtitle: 'd/dx vs. x³',
        description: 'The derivative fragments the polynomial degree by degree (x³ → 3x² → 2x → 1 → 0) while the polynomial team invokes lasers shaped after their mathematical curves.',
        leftName: 'Differential Operator',
        rightName: 'Polynomial Team',
        leftLabel: 'Derivative',
        rightLabel: 'Polynomial',
      },
      2: {
        title: 'Differential Operator vs. Exponential',
        subtitle: 'd/dx vs. eˣ',
        description: 'd/dx(eˣ) = eˣ grants absolute immunity to the exponential function. Direct contact burns the operator, while eˣ strikes with its Exponential Blade.',
        leftName: 'Differential Operator',
        rightName: 'Exponential Function',
        leftLabel: 'Derivative',
        rightLabel: 'Exponential',
      },
      3: {
        title: 'Exponential Function vs. Imaginary Unit',
        subtitle: 'eˣ vs. i',
        description: 'The imaginary unit cycles through power phases (i, -1, -i, 1) every 3 seconds: ghost piercing, damage reflection, and tactical battle against the Exponential Blade.',
        leftName: 'Exponential Function',
        rightName: 'Imaginary Unit',
        leftLabel: 'Exponential',
        rightLabel: 'Imaginary Unit',
      },
      4: {
        title: 'Partial Derivative vs. Exponential',
        subtitle: '∂/∂y vs. eˣ',
        description: '∂/∂y(eˣ) = 0 causes instant critical annihilation (-80 HP One-Shot) on collision. eˣ must evade direct contact and attack from a distance!',
        leftName: 'Partial Derivative',
        rightName: 'Exponential Function',
        leftLabel: 'Partial ∂/∂y',
        rightLabel: 'Exponential',
      },
      5: {
        title: 'Differential Operator vs. Sine Function',
        subtitle: 'd/dx vs. sin(x)',
        description: 'Cyclic differentiation d/dx: sin(x) → cos(x) → -sin(x) → -cos(x) → sin(x). Player takes no contact damage; sin(x) fires wave lasers.',
        leftName: 'Differential Operator',
        rightName: 'Sine Function',
        leftLabel: 'Derivative d/dx',
        rightLabel: 'sin(x)',
      },
      6: {
        title: 'Integral Operator vs. Exponential',
        subtitle: '∫ vs. eˣ',
        description: '∫ eˣ dx = eˣ + Cₙ breeds allied constants and elevates their polynomial degree up to degree 7, unleashing a storm of lasers.',
        leftName: 'Integral Operator',
        rightName: 'Exponential Function',
        leftLabel: 'Integral',
        rightLabel: 'Exponential',
      },
      7: {
        title: 'Trigonometric Duel: Sine vs. Cosine',
        subtitle: 'sin(x) vs. cos(x)',
        description: 'Collect Amplitude (a×2) and Frequency (b×2) orbs. Angular frequency halves cooldown period T = 2π/b for ultra-fast wave shots.',
        leftName: 'Sine Function',
        rightName: 'Cosine Function',
        leftLabel: 'sin(x)',
        rightLabel: 'cos(x)',
      },
      8: {
        title: 'Exponential Function vs. Constant Pi',
        subtitle: 'eˣ vs. π',
        description: 'π strikes with its orbiting decimal digits (3.14159...) and expanding circular sector blade S = ½r²θ doubling in angle up to 2π.',
        leftName: 'Exponential Function',
        rightName: 'Constant Pi',
        leftLabel: 'Exponential',
        rightLabel: 'Pi (π)',
      },
      9: {
        title: 'Imaginary Unit vs. Constant Pi',
        subtitle: 'i vs. π',
        description: 'Phase rotation of i against expanding circular sectors and decimal orbits of π in the prelude to Euler’s identity.',
        leftName: 'Imaginary Unit',
        rightName: 'Constant Pi',
        leftLabel: 'Imaginary i',
        rightLabel: 'Pi (π)',
      },
      10: {
        title: 'Grand Finale: Euler’s Identity',
        subtitle: 'eⁱᵖⁱ + 1 = 0',
        description: 'Rotate as a complex phasor e^(iθ) = cos(θ) + i·sin(θ) on the unit circle and collide with +1 at θ=π for total harmonic annihilation.',
        leftName: 'Euler Phasor',
        rightName: 'Cosmic Operator',
        leftLabel: 'eⁱᶿ',
        rightLabel: 'π ⊗ d/dx',
      },
    },
  },
  es: {
    gameTitle: 'MATH VS MATH',
    gameSubtitle: 'Simulador de Combate Matemático 2D',
    selectLevel: 'Elige un Nivel',
    levelBadge: 'NIVEL',
    levelsList: 'Niveles',
    controlsTip: 'Clic / Tocar para impulso • Espacio o botón para habilidad',
    playerBadge: 'TÚ',
    skillReady: '¡HABILIDAD LISTA!',
    recharging: 'Recarga',
    nextLevel: 'Siguiente Nivel',
    retry: 'Reintentar Partida',
    backToLevels: 'Selector de Niveles',
    victory: '¡Victoria!',
    defeat: '¡Derrota!',
    remainingHp: 'HP Restante',
    vs: 'VS',
    ready: 'LISTO',
    onFire: '¡En llamas!',
    immune: '¡Inmune!',
    graphInvoke: '¡Invocación de Gráfico!',
    expBlade: '¡Cuchilla Exponencial!',
    sectorSlash: '¡Corte de Sector!',
    sineWave: '¡Onda Seno!',
    cosineWave: '¡Onda Coseno!',
    integralWhip: '¡Látigo Integral!',
    integralWhipReady: '¡Látigo ∫ Listo!',
    partialYReady: 'Listo para ∂/∂y',
    spheresCount: 'Bolas',
    derivationsCount: 'Derivada',
    derivativeAttempt: 'Intento de Derivada',
    nextSector: 'Próximo Sector',
    blade: 'Cuchilla',
    phaseI: 'i (Perforación)',
    phaseMinus1: '-1 (Reflexión)',
    phaseMinusI: '-i (Perforación+Reflexión)',
    phase1: '1 (Normal)',
    fight: '¡Pelea!',
    mathGuide: 'Teoría Matemática',
    theoryTitle: 'Explicación Matemática Didáctica',
    interactiveDemo: 'Simulación Interactiva',
    playLevel: 'Jugar este Nivel',
    formulaBreakdown: 'Fundamentos de Cálculo',
    gameplayConnection: 'Conexión con las Mecánicas del Juego',
    levels: {
      1: {
        title: 'Operador Diferencial vs. Polinomio',
        subtitle: 'd/dx vs. x³',
        description: 'La derivada fragmenta el polinomio grado a grado (x³ → 3x² → 2x → 1 → 0) mientras el equipo polinómico invoca láseres según sus curvas.',
        leftName: 'Operador Diferencial',
        rightName: 'Equipo Polinómico',
        leftLabel: 'Derivada',
        rightLabel: 'Polinomio',
      },
      2: {
        title: 'Operador Diferencial vs. Función Exponencial',
        subtitle: 'd/dx vs. eˣ',
        description: 'd/dx(eˣ) = eˣ otorga inmunidad total a la exponencial. El contacto quema al operador y eˣ activa su Cuchilla Exponencial.',
        leftName: 'Operador Diferencial',
        rightName: 'Función Exponencial',
        leftLabel: 'Derivada',
        rightLabel: 'Exponencial',
      },
      3: {
        title: 'Función Exponencial vs. Unidad Imaginaria',
        subtitle: 'eˣ vs. i',
        description: 'i rota cada 3 segundos entre potencias (i, -1, -i, 1): perforación fantasma, reflexión del daño recibido y combate contra la Cuchilla Exponencial.',
        leftName: 'Función Exponencial',
        rightName: 'Unidad Imaginaria',
        leftLabel: 'Exponencial',
        rightLabel: 'Unidad Imaginaria',
      },
      4: {
        title: 'Derivada Parcial vs. Función Exponencial',
        subtitle: '∂/∂y vs. eˣ',
        description: '∂/∂y(eˣ) = 0 provoca la aniquilación instantánea (One-Shot de -80 HP) en caso de colisión directa. ¡eˣ debe esquivar y atacar a distancia!',
        leftName: 'Derivada Parcial',
        rightName: 'Función Exponencial',
        leftLabel: 'Parcial ∂/∂y',
        rightLabel: 'Exponencial',
      },
      5: {
        title: 'Operador Diferencial vs. Función Seno',
        subtitle: 'd/dx vs. sin(x)',
        description: 'Derivación cíclica d/dx: sin(x) → cos(x) → -sin(x) → -cos(x) → sin(x). El jugador no recibe daño de contacto; sin(x) dispara ondas sinusoidales.',
        leftName: 'Operador Diferencial',
        rightName: 'Función Seno',
        leftLabel: 'Derivada d/dx',
        rightLabel: 'sin(x)',
      },
      6: {
        title: 'Operador Integral vs. Función Exponencial',
        subtitle: '∫ vs. eˣ',
        description: '∫ eˣ dx = eˣ + Cₙ engendra constantes aliadas y las eleva de grado sucesivamente hasta grado 7, desatando una lluvia de láseres.',
        leftName: 'Operador Integral',
        rightName: 'Función Exponencial',
        leftLabel: 'Integral',
        rightLabel: 'Exponencial',
      },
      7: {
        title: 'Duelo Trigonométrico: Seno vs. Coseno',
        subtitle: 'sin(x) vs. cos(x)',
        description: 'Orbes a×2 (amplitud) y b×2 (frecuencia) aparecen en la arena. La frecuencia reduce a la mitad el período de recarga T = 2π/b.',
        leftName: 'Función Seno',
        rightName: 'Función Coseno',
        leftLabel: 'sin(x)',
        rightLabel: 'cos(x)',
      },
      8: {
        title: 'Función Exponencial vs. Constante Pi',
        subtitle: 'eˣ vs. π',
        description: 'π ataca con su cola orbital de decimales 3.14159... y su corte de sector circular S = ½r²θ duplicando el ángulo hasta 2π.',
        leftName: 'Función Exponencial',
        rightName: 'Constante Pi',
        leftLabel: 'Exponencial',
        rightLabel: 'Pi (π)',
      },
      9: {
        title: 'Unidad Imaginaria vs. Constante Pi',
        subtitle: 'i vs. π',
        description: 'La rotación de fases de i contra los sectores circulares crecientes y decimales orbitales de π en el preludio a la fórmula de Euler.',
        leftName: 'Unidad Imaginaria',
        rightName: 'Constante Pi',
        leftLabel: 'Imaginaria i',
        rightLabel: 'Pi (π)',
      },
      10: {
        title: 'Gran Final: La Identidad de Euler',
        subtitle: 'eⁱᵖⁱ + 1 = 0',
        description: 'Combate final: Rota en el círculo unitario como fasor e^(iθ) = cos(θ) + i·sin(θ) y conéctate con +1 al llegar a θ=π para la aniquilación total.',
        leftName: 'Fasor de Euler',
        rightName: 'Operador Cósmico',
        leftLabel: 'eⁱᶿ',
        rightLabel: 'π ⊗ d/dx',
      },
    },
  },
  ko: {
    gameTitle: '수학 VS 수학',
    gameSubtitle: '2D 수학 전투 시뮬레이터',
    selectLevel: '레벨을 선택하세요',
    levelBadge: '레벨',
    levelsList: '레벨 목록',
    controlsTip: '클릭 / 터치로 대시 • 스페이스바 또는 버튼으로 스킬',
    playerBadge: '플레이어',
    skillReady: '스킬 준비 완료!',
    recharging: '쿨타임',
    nextLevel: '다음 레벨',
    retry: '다시 도전',
    backToLevels: '레벨 선택 화면',
    victory: '승리!',
    defeat: '패배!',
    remainingHp: '남은 HP',
    vs: 'VS',
    ready: '준비',
    onFire: '화상 중!',
    immune: '미분 면역!',
    graphInvoke: '그래프 소환!',
    expBlade: '지수 칼날!',
    sectorSlash: '부채꼴 베기!',
    sineWave: '사인파!',
    cosineWave: '코사인파!',
    integralWhip: '∫ 채찍!',
    integralWhipReady: '∫ 채찍 준비!',
    partialYReady: 'y 편미분 준비',
    spheresCount: '공',
    derivationsCount: '미분',
    derivativeAttempt: '미분 시도',
    nextSector: '다음 부채꼴',
    blade: '칼날',
    phaseI: 'i (관통)',
    phaseMinus1: '-1 (반사)',
    phaseMinusI: '-i (관통+반사)',
    phase1: '1 (일반)',
    fight: '파이트!',
    mathGuide: '수학 이론 및 가이드',
    theoryTitle: '학습용 수학 설명',
    interactiveDemo: '인터랙티브 시뮬레이션',
    playLevel: '이 레벨 플레이',
    formulaBreakdown: '미적분 원리 분석',
    gameplayConnection: '게임플레이 메커니즘 연계',
    levels: {
      1: {
        title: '미분 연산자 vs. 다항함수',
        subtitle: 'd/dx vs. x³',
        description: '미분 연산자가 다항식을 차수별로 분할하고(x³ → 3x² → 2x → 1 → 0), 다항식 팀은 각 곡선에 맞춰 레이저를 소환합니다.',
        leftName: '미분 연산자',
        rightName: '다항함수 팀',
        leftLabel: '미분',
        rightLabel: '다항함수',
      },
      2: {
        title: '미분 연산자 vs. 지수함수',
        subtitle: 'd/dx vs. eˣ',
        description: 'd/dx(eˣ) = eˣ 로 인해 미분에 완전 면역됩니다. 충돌 시 연산자는 화상을 입고 eˣ는 지수 칼날로 베어냅니다.',
        leftName: '미분 연산자',
        rightName: '지수함수',
        leftLabel: '미분',
        rightLabel: '지수함수',
      },
      3: {
        title: '지수함수 vs. 허수단위 i',
        subtitle: 'eˣ vs. i',
        description: '허수 i가 3초마다 위상을 순환합니다(i, -1, -i, 1): 유령 관통, 데미지 반사 및 지수 칼날과의 전투.',
        leftName: '지수함수',
        rightName: '허수단위 i',
        leftLabel: '지수함수',
        rightLabel: '허수단위',
      },
      4: {
        title: '편미분 연산자 vs. 지수함수',
        subtitle: '∂/∂y vs. eˣ',
        description: '∂/∂y(eˣ) = 0 으로 인해 충돌 시 즉각 치명타(-80 HP 원샷)가 발생합니다. eˣ는 직접 충돌을 피하고 원거리 공격을 해야 합니다!',
        leftName: '편미분 연산자',
        rightName: '지수함수',
        leftLabel: '편미분 ∂/∂y',
        rightLabel: '지수함수',
      },
      5: {
        title: '미분 연산자 vs. 사인 함수',
        subtitle: 'd/dx vs. sin(x)',
        description: '순환 미분 주기 d/dx: sin(x) → cos(x) → -sin(x) → -cos(x) → sin(x). 플레이어는 직접 충돌 피해를 입지 않으며 적은 사인파 레이저를 발사합니다.',
        leftName: '미분 연산자',
        rightName: '사인 함수',
        leftLabel: '미분 d/dx',
        rightLabel: 'sin(x)',
      },
      6: {
        title: '적분 연산자 vs. 지수함수',
        subtitle: '∫ vs. eˣ',
        description: '∫ eˣ dx = eˣ + Cₙ 로 상수구를 번식시키고 7차 다항식까지 차수를 승격시켜 레이저 포격을 퍼붓습니다.',
        leftName: '적분 연산자',
        rightName: '지수함수',
        leftLabel: '적분',
        rightLabel: '지수함수',
      },
      7: {
        title: '삼각함수 대결: 사인 vs. 코사인',
        subtitle: 'sin(x) vs. cos(x)',
        description: '진폭(a×2) 및 각진동수(b×2) 오브를 수집하세요. 진동수가 주기 T = 2π/b 를 절반으로 단축하여 초고속 파동을 발사합니다.',
        leftName: '사인함수',
        rightName: '코사인함수',
        leftLabel: 'sin(x)',
        rightLabel: 'cos(x)',
      },
      8: {
        title: '지수함수 vs. 원주율 파이',
        subtitle: 'eˣ vs. π',
        description: '원주율 π가 궤도 소수점(3.14159...)과 2π까지 각도를 확장하는 부채꼴 베기 S = ½r²θ 로 반격합니다.',
        leftName: '지수함수',
        rightName: '원주율 파이',
        leftLabel: '지수함수',
        rightLabel: '파이 (π)',
      },
      9: {
        title: '허수단위 i vs. 원주율 파이',
        subtitle: 'i vs. π',
        description: '오일러 공식으로 가는 길목에서 i의 위상 순환과 π의 부채꼴 확장이 격돌합니다.',
        leftName: '허수단위 i',
        rightName: '원주율 파이',
        leftLabel: '허수 i',
        rightLabel: '파이 (π)',
      },
      10: {
        title: '최종 결전: 오일러 항등식',
        subtitle: 'eⁱᵖⁱ + 1 = 0',
        description: '단위원을 도는 페이저 e^(iθ) = cos(θ) + i·sin(θ) 로 회전하며 θ=π 도달 시 +1과 결합하여 완전한 조화 소멸을 일으키세요.',
        leftName: '오일러 페이저',
        rightName: '우주 연산자',
        leftLabel: 'eⁱᶿ',
        rightLabel: 'π ⊗ d/dx',
      },
    },
  },
};
