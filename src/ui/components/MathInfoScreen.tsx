import React, { useState, useMemo } from 'react';
import katex from 'katex';
import {
  ArrowLeft,
  Play,
  BookOpen,
  Sparkles,
  Layers,
  Activity,
  RotateCcw,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { LanguageSelector } from './LanguageSelector';

interface MathInfoScreenProps {
  initialLevelId?: number;
  onBack: () => void;
  onPlayLevel: (levelId: number) => void;
}

const KatexBlock: React.FC<{ formula: string; display?: boolean; className?: string }> = ({
  formula,
  display = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, { displayMode: display, throwOnError: false });
    } catch {
      return formula;
    }
  }, [formula, display]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

export const MathInfoScreen: React.FC<MathInfoScreenProps> = ({
  initialLevelId = 1,
  onBack,
  onPlayLevel,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(initialLevelId);
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Interactive state per level
  const [powerN, setPowerN] = useState<number>(3);
  const [powerX, setPowerX] = useState<number>(1.2);
  const [expX, setExpX] = useState<number>(1.0);
  const [imagPower, setImagPower] = useState<number>(0);
  const [partialY, setPartialY] = useState<number>(2.0);
  const [trigPhase, setTrigPhase] = useState<number>(0);
  const [integralC, setIntegralC] = useState<number>(3);
  const [waveAmp, setWaveAmp] = useState<number>(1.5);
  const [waveFreq, setWaveFreq] = useState<number>(2.0);
  const [archimedesN, setArchimedesN] = useState<number>(6);
  const [eulerTheta, setEulerTheta] = useState<number>(Math.PI * 0.75);
  const [finalTheta, setFinalTheta] = useState<number>(Math.PI * 0.5);

  const levelInfo = t.levels[selectedLevel] || t.levels[1];

  // Theory definitions by language
  const theoryContent = useMemo(() => {
    const isEs = language === 'es';
    const isKo = language === 'ko';

    const dict: Record<
      number,
      {
        mainFormula: string;
        theoremName: string;
        explanation: string;
        breakdownList: { title: string; math: string; desc: string }[];
        mechanicSummary: string;
      }
    > = {
      1: {
        mainFormula: '\\frac{d}{dx}\\left(x^n\\right) = n x^{n-1}',
        theoremName: isEs
          ? 'Regla de la Potencia (Cálculo Diferencial)'
          : isKo
          ? '거듭제곱 미분 공식 (미적분학)'
          : 'Power Rule of Differential Calculus',
        explanation: isEs
          ? 'La derivada mide la tasa de cambio instantánea de una función. Para un monomio x^n, el exponente baja multiplicando al coeficiente y se reduce en una unidad.'
          : isKo
          ? '미분은 함수의 순간 변화율을 측정합니다. 다항식 x^n에서 지수는 계수로 내려와 곱해지고 차수가 1 감소합니다.'
          : 'The derivative measures the instantaneous rate of change. For a power monomial x^n, the exponent steps down to multiply the coefficient and is decremented by 1.',
        breakdownList: [
          {
            title: isEs ? 'Primer Golpe' : isKo ? '첫 번째 충격' : 'First Hit',
            math: '\\frac{d}{dx}(x^3) = 3x^2',
            desc: isEs
              ? 'x³ se fragmenta en 3 esferas de x².'
              : isKo
              ? 'x³가 3개의 x² 구체로 분할됩니다.'
              : 'x³ shatters into 3 spheres of degree x².',
          },
          {
            title: isEs ? 'Segundo Golpe' : isKo ? '두 번째 충격' : 'Second Hit',
            math: '\\frac{d}{dx}(x^2) = 2x',
            desc: isEs
              ? 'Cada x² se divide en 2 esferas de x.'
              : isKo
              ? '각 x²가 2개의 x 구체로 분할됩니다.'
              : 'Each x² splits into 2 spheres of x.',
          },
          {
            title: isEs ? 'Tercer Golpe' : isKo ? '세 번째 충격' : 'Third Hit',
            math: '\\frac{d}{dx}(x) = 1',
            desc: isEs
              ? 'La función lineal se reduce a constante unitaria.'
              : isKo
              ? '선형 함수가 상수 1로 감소합니다.'
              : 'Linear function reduces to constant 1.',
          },
          {
            title: isEs ? 'Aniquilación Final' : isKo ? '최종 소멸' : 'Final Annihilation',
            math: '\\frac{d}{dx}(1) = 0',
            desc: isEs
              ? 'La derivada de una constante es 0; la esfera desaparece.'
              : isKo
              ? '상수의 미분은 0으로 구체가 완전히 소멸합니다.'
              : 'The derivative of a constant is 0; the sphere is destroyed.',
          },
        ],
        mechanicSummary: isEs
          ? 'En el juego, la derivada d/dx descompone paso a paso la jerarquía de los polinomios. El jugador no recibe daño de contacto contra polinomios, pero debe esquivar los láseres parabólicos y cúbicos.'
          : isKo
          ? '게임에서 d/dx는 다항식의 계층을 단계별로 분해합니다. 플레이어는 다항식과의 직접 충돌 피해를 입지 않지만 적의 곡선 레이저를 피해야 합니다.'
          : 'In combat, d/dx breaks down polynomial spheres hierarchically. The player takes zero contact damage from polynomials, but must dodge cubic and parabolic lasers.',
      },
      2: {
        mainFormula: '\\frac{d}{dx}\\left(e^x\\right) = e^x',
        theoremName: isEs
          ? 'Autofunción del Operador Diferencial'
          : isKo
          ? '미분 연산자의 고유함수'
          : 'Eigenfunction of the Differential Operator',
        explanation: isEs
          ? 'La función exponencial natural e^x es su propia derivada. Su tasa de cambio instantáneo en cualquier punto es exactamente idéntica al valor de la propia función.'
          : isKo
          ? '자연 지수 함수 e^x는 자기 자신이 도함수입니다. 어떤 지점에서의 순간 기울기도 그 지점의 함수값과 정확히 일치합니다.'
          : 'The exponential e^x is its own derivative. Its instantaneous slope at any point is identically equal to its own function value.',
        breakdownList: [
          {
            title: isEs ? 'Inmunidad Absoluta' : isKo ? '절대 면역' : 'Absolute Immunity',
            math: '\\mathcal{D}(e^x) = 1 \\cdot e^x',
            desc: isEs
              ? 'El operador diferencial no puede reducir su grado; su autovalor es λ=1.'
              : isKo
              ? '미분 연산자는 차수를 줄일 수 없으며 고유값은 λ=1입니다.'
              : 'The differential operator cannot reduce its degree; eigenvalue λ=1.',
          },
          {
            title: isEs ? 'Quemadura por Rebote' : isKo ? '반동 피해' : 'Reflected Recoil',
            math: '\\Delta \\text{HP}_{\\text{player}} = -4',
            desc: isEs
              ? 'Chocar frontalmente contra e^x quema al operador diferencial.'
              : isKo
              ? 'e^x와 정면 충돌하면 미분 연산자가 화상 피해를 입습니다.'
              : 'Colliding head-on against e^x burns the differential operator.',
          },
        ],
        mechanicSummary: isEs
          ? 'Golpear a e^x no le hace daño ordinario. El jugador debe mantener distancia y utilizar su habilidad de Tangente con precisión.'
          : isKo
          ? 'e^x를 직접 가격해도 데미지를 줄 수 없습니다. 거리를 유지하며 접선 베기 스킬을 활용해야 합니다.'
          : 'Striking e^x inflicts no direct damage. Maintain distance and strike strategically with your Tangent Slash.',
      },
      3: {
        mainFormula: 'i^0 = 1,\\; i^1 = i,\\; i^2 = -1,\\; i^3 = -i,\\; i^4 = 1',
        theoremName: isEs
          ? 'Ciclo Cuaternario en el Plano Complejo'
          : isKo
          ? '복소 평면의 4주기 순환'
          : '4-Periodic Cycle in the Complex Plane',
        explanation: isEs
          ? 'Multiplicar por la unidad imaginaria i equivale a una rotación de 90° (π/2 radianes) en sentido antihorario en el plano complejo de Argand.'
          : isKo
          ? '허수 단위 i를 곱하는 것은 아르강 복소 평면에서 반시계 방향으로 90°(π/2 라디안) 회전하는 것과 같습니다.'
          : 'Multiplying by the imaginary unit i represents a 90° (π/2 rad) counter-clockwise rotation in the complex Argand plane.',
        breakdownList: [
          {
            title: 'Fase i (Pierce)',
            math: 'i^1 = i',
            desc: isEs
              ? 'Modo espectral: atraviesa defensas e inflige daño penetrante.'
              : isKo
              ? '영체 관통 모드: 방어를 무시하고 관통 피해를 입힙니다.'
              : 'Ghost pierce mode: bypasses defenses and deals piercing damage.',
          },
          {
            title: 'Fase -1 (Reflect)',
            math: 'i^2 = -1',
            desc: isEs
              ? 'Inversión de signo: refleja los ataques enemigos.'
              : isKo
              ? '부호 반전: 적의 공격을 반사합니다.'
              : 'Sign reversal: reflects hostile projectile force.',
          },
          {
            title: 'Fase -i',
            math: 'i^3 = -i',
            desc: isEs
              ? 'Rotación de 270°: combinación de penetración y rechazo.'
              : isKo
              ? '270° 회전: 관통과 반사의 복합 상태.'
              : '270° rotation: dual combination of pierce and reflection.',
          },
          {
            title: 'Fase 1',
            math: 'i^4 = 1',
            desc: isEs
              ? 'Ciclo completo (360°): retorno al estado base real.'
              : isKo
              ? '완전한 주기(360°): 실수 기본 상태로 복귀.'
              : 'Full 360° period: returns to the baseline real identity.',
          },
        ],
        mechanicSummary: isEs
          ? 'La esfera de i cambia de fase cada 3 segundos. Su estado de color y aura indica si atraviesa o refleja el daño en combate.'
          : isKo
          ? 'i 구체는 3초마다 위상을 변경합니다. 구체의 색상과 오라가 관통 또는 반사 상태를 시각적으로 알립니다.'
          : 'The i sphere cycles phases every 3 seconds. Aura colors signal ghost piercing vs damage reflection.',
      },
      4: {
        mainFormula: '\\frac{\\partial}{\\partial y}\\left(e^x\\right) = 0',
        theoremName: isEs
          ? 'Ortogonalidad de Variables Independientes'
          : isKo
          ? '독립 변수의 직교 미분'
          : 'Orthogonality of Independent Variables',
        explanation: isEs
          ? 'En cálculo multivariable, al diferenciar parcialmente respecto a y, la variable x se trata como una constante absoluta. La derivada de una constante es 0.'
          : isKo
          ? '다변수 미적분학에서 y에 대해 편미분할 때 x는 엄격한 상수로 취급됩니다. 상수의 미분은 0입니다.'
          : 'In multivariable calculus, differentiating partially with respect to y treats x as a strict constant. The derivative of a constant is identically zero.',
        breakdownList: [
          {
            title: isEs ? 'Aniquilación Crítica' : isKo ? '치명적 절멸' : 'Critical Annihilation',
            math: '\\frac{\\partial}{\\partial y}(e^x) = 0 \\implies -80\\text{ HP}',
            desc: isEs
              ? 'El corte ortogonal desintegra la función exponencial de un solo impacto.'
              : isKo
              ? '직교 편미분 타격으로 지수 함수가 단 한 번에 80 HP 피해를 입고 쓰러집니다.'
              : 'An orthogonal slice instantly annihilates e^x with a massive 80 HP one-shot blow.',
          },
        ],
        mechanicSummary: isEs
          ? 'Juegas como ∂/∂y. Un solo golpe directo a e^x termina la partida con una victoria contundente. Pero ten cuidado: e^x te atacará con proyectiles antes de que puedas tocarlo.'
          : isKo
          ? '플레이어는 ∂/∂y입니다. e^x에 단 한 번만 접촉하면 즉시 승리합니다. 다만 거리를 좁히는 동안 적의 원거리 레이저를 피해야 합니다.'
          : 'You play as ∂/∂y. A single physical touch on e^x triggers a devastating one-shot KO. Dodge its ranged blades to get in close.',
      },
      5: {
        mainFormula: '\\frac{d}{dx}\\sin(x) = \\cos(x),\\quad \\frac{d}{dx}\\cos(x) = -\\sin(x)',
        theoremName: isEs
          ? 'Ciclo Diferencial de Funciones Trigonométricas'
          : isKo
          ? '삼각함수 미분 순환 주기'
          : 'Cyclic Differentiation of Trigonometric Functions',
        explanation: isEs
          ? 'Las derivadas sucesivas de las funciones trigonométricas forman un ciclo cuaternario cerrado de periodo 4: sin(x) → cos(x) → -sin(x) → -cos(x) → sin(x).'
          : isKo
          ? '삼각함수의 순환 미분은 주기 4의 닫힌 순환을 이룹니다: sin(x) → cos(x) → -sin(x) → -cos(x) → sin(x).'
          : 'Successive derivatives of trigonometric functions form a closed 4-periodic cycle: sin(x) → cos(x) → -sin(x) → -cos(x) → sin(x).',
        breakdownList: [
          {
            title: isEs ? '1ª Derivada' : isKo ? '1차 미분' : '1st Derivative',
            math: '\\frac{d}{dx}\\sin(x) = \\cos(x)',
            desc: isEs
              ? 'sin(x) se transforma en cos(x).'
              : isKo
              ? 'sin(x)가 cos(x)로 변환됩니다.'
              : 'sin(x) transforms into cos(x).',
          },
          {
            title: isEs ? '2ª Derivada' : isKo ? '2차 미분' : '2nd Derivative',
            math: '\\frac{d}{dx}\\cos(x) = -\\sin(x)',
            desc: isEs
              ? 'cos(x) se transforma en -sin(x).'
              : isKo
              ? 'cos(x)가 -sin(x)로 변환됩니다.'
              : 'cos(x) transforms into -sin(x).',
          },
          {
            title: isEs ? '3ª Derivada' : isKo ? '3차 미분' : '3rd Derivative',
            math: '\\frac{d}{dx}(-\\sin(x)) = -\\cos(x)',
            desc: isEs
              ? '-sin(x) se transforma en -cos(x).'
              : isKo
              ? '-sin(x)가 -cos(x)로 변환됩니다.'
              : '-sin(x) transforms into -cos(x).',
          },
          {
            title: isEs ? '4ª Derivada (Cierre de Ciclo)' : isKo ? '4차 미분 (주기 완성)' : '4th Derivative (Cycle Reset)',
            math: '\\frac{d}{dx}(-\\cos(x)) = \\sin(x)',
            desc: isEs
              ? '-cos(x) retorna a sin(x), completando el periodo 4.'
              : isKo
              ? '-cos(x)가 sin(x)로 돌아와 주기 4가 완성됩니다.'
              : '-cos(x) returns to sin(x), closing the 4-step cycle.',
          },
        ],
        mechanicSummary: isEs
          ? 'El operador d/dx no recibe daño de contacto al golpear a sin(x). Cada impacto muta la función enemiga por el ciclo trigonométrico e inflige 14 de daño. La enemiga contrataca con ondas sinusoidales.'
          : isKo
          ? 'd/dx 연산자는 sin(x)와 직접 충돌해도 피해를 입지 않습니다. 타격할 때마다 적 함수가 순환 주기에 따라 변환되며 14 데미지를 입힙니다. 적은 파동 레이저로 공격합니다.'
          : 'd/dx takes zero contact damage from sin(x). Each collision transforms the enemy function along the trig cycle and deals 14 damage. The enemy fires wave lasers.',
      },
      6: {
        mainFormula: '\\int e^x dx = e^x + C',
        theoremName: isEs
          ? 'Integral Indefinida y Familia de Curvas'
          : isKo
          ? '부정적분과 적분상수 C'
          : 'Indefinite Integral & Family of Curves',
        explanation: isEs
          ? 'La integración es la operación inversa a la derivación. Al calcular la antiderivada de e^x, surge la constante de integración C ∈ ℝ, generando una familia infinita de curvas paralelas.'
          : isKo
          ? '적분은 미분의 역연산입니다. e^x의 부정적분은 임의의 적분상수 C ∈ ℝ를 생성하며, 평행 이동된 무한한 곡선 족을 형성합니다.'
          : 'Integration is the inverse operation of differentiation. Integrating e^x produces a constant of integration C, giving rise to an infinite family of parallel curves.',
        breakdownList: [
          {
            title: isEs ? 'Engendrar Constantes' : isKo ? '적분 상수 생성' : 'Constant Spawning',
            math: 'C_1, C_2, C_3 \\dots \\in \\mathbb{R}',
            desc: isEs
              ? 'Cada colisión del operador integral crea esferas aliadas de constante C que atacan en conjunto.'
              : isKo
              ? '적분 연산자가 충돌할 때마다 아군 상수 C 구체가 전장에 소환되어 합동 공격을 펼칩니다.'
              : 'Each impact by the integral spawns allied constant spheres C_k that swarm the opponent.',
          },
        ],
        mechanicSummary: isEs
          ? 'Juegas como ∫. A medida que golpeas a e^x, engendras esferas C que disparan ráfagas y aumentan tu superioridad numérica.'
          : isKo
          ? '플레이어는 적분 기호 ∫입니다. e^x를 타격할 때마다 C 구체를 늘려 화력과 수적 우위를 확보하세요.'
          : 'You play as ∫. Hitting e^x breeds allied constant spheres C that fire beams and overwhelm the enemy.',
      },
      7: {
        mainFormula: '\\frac{d}{dx}\\sin(x) = \\cos(x),\\quad \\frac{d}{dx}\\cos(x) = -\\sin(x)',
        theoremName: isEs
          ? 'Dualidad Armónica y Desfase de π/2'
          : isKo
          ? '조화 파동의 쌍대성과 π/2 위상차'
          : 'Harmonic Duality & π/2 Phase Shift',
        explanation: isEs
          ? "Las funciones seno y coseno son soluciones fundamentales del oscilador armónico simple y'' + y = 0. Están desfasadas exactamente 90° (π/2)."
          : isKo
          ? "사인과 코사인은 단순 조화 진동자 y'' + y = 0의 기본 해입니다. 둘은 정확히 90°(π/2)만큼 위상이 어긋나 있습니다."
          : "Sine and cosine are the fundamental orthogonal solutions of the harmonic oscillator y'' + y = 0, separated by a π/2 phase shift.",
        breakdownList: [
          {
            title: isEs ? 'Amplitud (A)' : isKo ? '진폭 (A)' : 'Amplitude (A)',
            math: 'y(x) = A \\sin(\\omega x)',
            desc: isEs
              ? 'Duplica el grosor y el daño de los rayos láser sinusoidales.'
              : isKo
              ? '사인파 레이저의 폭과 공격 데미지를 2배로 강화합니다.'
              : 'Doubles beam thickness and destructive damage.',
          },
          {
            title: isEs ? 'Frecuencia (ω)' : isKo ? '각진동수 (ω)' : 'Frequency (ω)',
            math: 'T = \\frac{2\\pi}{\\omega}',
            desc: isEs
              ? 'Reduce a la mitad el período de recarga para disparar ráfagas ultra veloces.'
              : isKo
              ? '발사 쿨다운 주기 T를 절반으로 단축하여 초고속 파동 연사를 가능하게 합니다.'
              : 'Halves the cooldown interval T for ultra-rapid fire waves.',
          },
        ],
        mechanicSummary: isEs
          ? 'Recolecta los orbes de Amplitud y Frecuencia en el mapa para transformar tu onda en una ráfaga masiva y veloz.'
          : isKo
          ? '경기장에 생성되는 진폭 및 진동수 오브를 획득하여 파동 레이저의 화력과 재사용 시간을 비약적으로 강화하세요.'
          : 'Collect Amplitude and Frequency orbs across the arena to supercharge laser width and fire rate.',
      },
      8: {
        mainFormula: 'C = 2\\pi r,\\quad A = \\pi r^2,\\quad \\pi \\approx 3.14159265\\dots',
        theoremName: isEs
          ? 'Geometría Circular y Trascendencia de Pi'
          : isKo
          ? '원형 기하학과 원주율 π의 초월성'
          : 'Circular Geometry & Transcendence of Pi',
        explanation: isEs
          ? 'π es la constante fundamental que vincula la circunferencia de un círculo con su diámetro. Es un número trascendente: no puede ser raíz de ningún polinomio con coeficientes racionales.'
          : isKo
          ? 'π는 원의 둘레와 지름의 비율을 나타내는 절대적 상수입니다. 유리수 계수 다항식의 근이 될 수 없는 초월수입니다.'
          : 'Pi connects the circumference of any circle to its diameter. It is transcendental—never the root of any non-zero rational polynomial.',
        breakdownList: [
          {
            title: isEs ? 'Ataques por Dígitos' : isKo ? '원주율 자릿수 타격' : 'Decimal Digit Strikes',
            math: '-3,\\; -1,\\; -4,\\; -1,\\; -5,\\; -9\\dots',
            desc: isEs
              ? 'Cada golpe extrae el siguiente decimal exacto de la expansión de π.'
              : isKo
              ? '공격할 때마다 π의 소수점 자릿수(3, 1, 4, 1, 5, 9...)만큼 피해를 입힙니다.'
              : 'Consecutive impacts deal damage proportional to successive digits of π.',
          },
        ],
        mechanicSummary: isEs
          ? 'π ataca con proyectiles en forma de sectores circulares y drena vida según sus decimales infinitos.'
          : isKo
          ? 'π는 부채꼴 섹터 레이저를 방사하며 무한 소수점 자릿수에 비례하는 데미지를 줍니다.'
          : 'Pi attacks with expanding circular sectors and drains health based on its infinite decimal expansion.',
      },
      9: {
        mainFormula: 'e^{i\\theta} = \\cos(\\theta) + i\\sin(\\theta)',
        theoremName: isEs
          ? 'Fórmula de Euler'
          : isKo
          ? '오일러 공식 (Euler\'s Formula)'
          : 'Euler\'s Formula',
        explanation: isEs
          ? 'La fórmula de Euler establece la conexión profunda entre las funciones trigonométricas y la función exponencial compleja. Desplaza un punto continuamente a lo largo de la circunferencia unitaria.'
          : isKo
          ? '오일러 공식은 삼각 함수와 복소 지수 함수 사이의 심오한 연관성을 정의합니다. 복소 평면 단위 원 위를 매끄럽게 회전합니다.'
          : 'Euler\'s formula establishes the fundamental link between trigonometric waves and complex exponentials, tracing the unit circle.',
        breakdownList: [
          {
            title: isEs ? 'Fasor Rotacional' : isKo ? '회전 페이저' : 'Rotational Phasor',
            math: '|e^{i\\theta}| = \\sqrt{\\cos^2\\theta + \\sin^2\\theta} = 1',
            desc: isEs
              ? 'La magnitud se conserva estrictamente unitaria mientras el ángulo θ rota.'
              : isKo
              ? '각도 θ가 회전하는 동안 벡터의 크기는 항상 엄격히 1로 보존됩니다.'
              : 'Magnitude is strictly conserved at 1 while phase angle θ smoothly rotates.',
          },
        ],
        mechanicSummary: isEs
          ? 'Combate de rotación pura: ajusta tu ángulo orbital para desatar rayos combinados de seno y coseno.'
          : isKo
          ? '순수 회전 전투: 궤도 각도를 조정하여 사인과 코사인의 합성 파동 레이저를 방출하세요.'
          : 'Orbital rotation combat: synchronize your phasor angle to unleash unified sine-cosine wave bursts.',
      },
      10: {
        mainFormula: 'e^{i\\pi} + 1 = 0',
        theoremName: isEs
          ? 'Identidad de Euler: La Ecuación Más Bella del Universo'
          : isKo
          ? '오일러 항등식: 세상에서 가장 아름다운 공식'
          : 'Euler\'s Identity: The Most Beautiful Equation',
        explanation: isEs
          ? 'Al evaluar la fórmula de Euler en θ = π, e^(iπ) = cos(π) + i·sin(π) = -1. Al sumar 1, el fasor llega al origen absoluto 0, reuniendo las cinco constantes maestras: e, i, π, 1 y 0.'
          : isKo
          ? '오일러 공식을 θ = π에서 계산하면 e^(iπ) = -1이 됩니다. 여기에 1을 더하면 정확히 0이 되며, 수학의 5대 상수 e, i, π, 1, 0이 하나로 통합됩니다.'
          : 'Evaluating Euler\'s formula at θ = π yields e^(iπ) = -1. Adding 1 cancels out to 0, elegantly linking the 5 fundamental constants: e, i, π, 1, and 0.',
        breakdownList: [
          {
            title: isEs ? 'Colapso al Origen' : isKo ? '원점으로의 붕괴' : 'Collapse to Origin',
            math: 'e^{i\\pi} = -1 \\implies e^{i\\pi} + 1 = 0',
            desc: isEs
              ? 'Al alcanzar θ=π y contactar al +1, toda la energía colapsa al equilibrio perfecto 0.'
              : isKo
              ? '위상이 π에 도달하여 +1 구체와 결합하면 모든 에너지가 완전한 평형 0으로 응축 소멸합니다.'
              : 'Reaching θ=π and contacting +1 triggers total equilibrium cancellation to 0.',
          },
        ],
        mechanicSummary: isEs
          ? 'En la batalla final épica, rota en el círculo unitario hasta alcanzar exactamente π radianes y entra en resonancia con la esfera +1 para la aniquilación cósmica.'
          : isKo
          ? '최종 보스전: 단위 원을 회전하여 정확히 π 라디안에 도달한 뒤 +1 구체와 충돌하여 코스믹 소멸을 달성하세요.'
          : 'The Grand Finale: rotate to exact phase π and collide with the +1 sphere to trigger cosmic cancellation.',
      },
    };

    return dict[selectedLevel] || dict[1];
  }, [selectedLevel, language]);

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 pb-24 flex flex-col space-y-6">
      {/* Top Navigation Bar */}
      <div
        className={`flex items-center justify-between pb-3 border-b transition-colors duration-200 ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs sm:text-sm font-mono font-bold hover:text-cyan-400 transition-colors py-1 px-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToLevels}</span>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all border ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-yellow-400 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
            title={isDark ? 'Light Theme' : 'Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <LanguageSelector />
        </div>
      </div>

      {/* Screen Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.mathGuide}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
          {t.theoryTitle}
        </h1>
        <p
          className={`text-xs sm:text-sm font-mono transition-colors ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {levelInfo.title} ({levelInfo.subtitle})
        </p>
      </div>

      {/* Level Selection Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => {
          const isSelected = selectedLevel === id;
          const info = t.levels[id];
          return (
            <button
              key={id}
              onClick={() => setSelectedLevel(id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all border flex items-center space-x-2 ${
                isSelected
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                  : isDark
                  ? 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                {id}
              </span>
              <span>{info?.subtitle || `L${id}`}</span>
            </button>
          );
        })}
      </div>

      {/* Main Didactic Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Theoretical Explanation & Formulas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          {/* Main Theorem Card */}
          <div
            className={`p-5 rounded-2xl border shadow-xl transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                {theoryContent.theoremName}
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {t.levelBadge} {selectedLevel}
              </span>
            </div>

            {/* Big KaTeX Display */}
            <div
              className={`p-4 rounded-xl border text-center my-3 overflow-x-auto ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <KatexBlock
                formula={theoryContent.mainFormula}
                display={true}
                className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-wide"
              />
            </div>

            <p
              className={`text-sm leading-relaxed mt-3 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              {theoryContent.explanation}
            </p>
          </div>

          {/* Breakdown Steps List */}
          <div
            className={`p-5 rounded-2xl border shadow-xl space-y-3 transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center space-x-1.5">
              <Layers className="w-4 h-4" />
              <span>{t.formulaBreakdown}</span>
            </h3>

            <div className="space-y-2.5">
              {theoryContent.breakdownList.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      {item.title}
                    </span>
                    <p
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                  <div className="font-mono text-sm font-black text-amber-400 self-start sm:self-center">
                    <KatexBlock formula={item.math} display={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gameplay Mechanics Connection */}
          <div
            className={`p-4 rounded-2xl border flex items-start space-x-3 transition-colors ${
              isDark
                ? 'bg-cyan-950/20 border-cyan-900/40 text-slate-300'
                : 'bg-cyan-50/80 border-cyan-200 text-slate-700'
            }`}
          >
            <Activity className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-cyan-400">
                {t.gameplayConnection}
              </h4>
              <p className="text-xs leading-relaxed">{theoryContent.mechanicSummary}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Laboratory & Direct Play Button (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Interactive Simulation Sandbox */}
          <div
            className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-wider text-pink-400 uppercase flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.interactiveDemo}</span>
                </span>
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Live Visualizer
                </span>
              </div>

              {/* Dynamic Interactive Component for Level */}
              <div
                className={`p-4 rounded-xl border my-2 flex flex-col items-center justify-center min-h-[260px] ${
                  isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {selectedLevel === 1 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock
                          formula={`f(x) = x^{${powerN}} \\implies f'(x) = ${powerN}x^{${Math.max(
                            0,
                            powerN - 1
                          )}}`}
                        />
                      </div>
                      <div className="text-xl font-mono font-black text-cyan-400">
                        <KatexBlock
                          formula={`f'(${powerX.toFixed(1)}) = ${(
                            powerN * Math.pow(powerX, Math.max(0, powerN - 1))
                          ).toFixed(2)}`}
                        />
                      </div>
                    </div>

                    {/* SVG Curve Plot */}
                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <line x1="-50" y1="0" x2="50" y2="0" stroke="#475569" strokeWidth="0.8" />
                      <line x1="0" y1="-50" x2="0" y2="50" stroke="#475569" strokeWidth="0.8" />
                      {/* Plot f(x) = x^n */}
                      <path
                        d={Array.from({ length: 41 }, (_, i) => {
                          const px = -2 + (i / 40) * 4;
                          const py = Math.pow(px, powerN);
                          const svgX = px * 20;
                          const svgY = -py * (20 / Math.pow(2, powerN || 1));
                          return `${i === 0 ? 'M' : 'L'} ${svgX} ${Math.max(-48, Math.min(48, svgY))}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#00ACC1"
                        strokeWidth="2.5"
                      />
                      {/* Tangent slope at powerX */}
                      {(() => {
                        const px = powerX;
                        const py = Math.pow(px, powerN);
                        const slope = powerN * Math.pow(px, Math.max(0, powerN - 1));
                        const svgX = px * 20;
                        const scaleY = 20 / Math.pow(2, powerN || 1);
                        const svgY = -py * scaleY;
                        return (
                          <>
                            <circle cx={svgX} cy={svgY} r="3.5" fill="#F4511E" />
                            <line
                              x1={svgX - 18}
                              y1={svgY + slope * 18 * 0.15}
                              x2={svgX + 18}
                              y2={svgY - slope * 18 * 0.15}
                              stroke="#FFD54F"
                              strokeWidth="2"
                              strokeDasharray="2,2"
                            />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span>Grado n (Degree): {powerN}</span>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          step="1"
                          value={powerN}
                          onChange={(e) => setPowerN(parseInt(e.target.value))}
                          className="w-32 accent-cyan-400"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span>Punto x: {powerX.toFixed(1)}</span>
                        <input
                          type="range"
                          min="-1.8"
                          max="1.8"
                          step="0.1"
                          value={powerX}
                          onChange={(e) => setPowerX(parseFloat(e.target.value))}
                          className="w-32 accent-orange-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedLevel === 2 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock formula="f(x) = e^x \implies f'(x) = e^x" />
                      </div>
                      <div className="text-xl font-mono font-black text-amber-400">
                        <KatexBlock
                          formula={`f(${expX.toFixed(1)}) = f'(${expX.toFixed(1)}) = ${Math.exp(
                            expX
                          ).toFixed(3)}`}
                        />
                      </div>
                    </div>

                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <line x1="-50" y1="0" x2="50" y2="0" stroke="#475569" strokeWidth="0.8" />
                      <line x1="0" y1="-50" x2="0" y2="50" stroke="#475569" strokeWidth="0.8" />
                      <path
                        d={Array.from({ length: 41 }, (_, i) => {
                          const px = -2.5 + (i / 40) * 5;
                          const py = Math.exp(px);
                          const svgX = px * 18;
                          const svgY = -py * 3.5;
                          return `${i === 0 ? 'M' : 'L'} ${svgX} ${Math.max(-48, Math.min(48, svgY))}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#F57C00"
                        strokeWidth="2.5"
                      />
                      {(() => {
                        const px = expX;
                        const py = Math.exp(px);
                        const svgX = px * 18;
                        const svgY = -py * 3.5;
                        return (
                          <>
                            <circle cx={svgX} cy={svgY} r="3.5" fill="#00E676" />
                            <line
                              x1={svgX - 15}
                              y1={svgY + py * 0.4}
                              x2={svgX + 15}
                              y2={svgY - py * 0.4}
                              stroke="#00E676"
                              strokeWidth="2"
                              strokeDasharray="2,2"
                            />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Punto x: {expX.toFixed(1)}</span>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={expX}
                        onChange={(e) => setExpX(parseFloat(e.target.value))}
                        className="w-36 accent-amber-400"
                      />
                    </div>
                  </div>
                )}

                {selectedLevel === 3 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock formula={`i^{${imagPower}} = ${['1', 'i', '-1', '-i'][imagPower % 4]}`} />
                      </div>
                      <div className="text-lg font-mono font-black text-pink-400">
                        <KatexBlock
                          formula={`\\text{Fase } ${['1', 'i', '-1', '-i'][imagPower % 4]} \\;(\\theta = ${(
                            (imagPower % 4) * 90
                          )}^\\circ)`}
                        />
                      </div>
                    </div>

                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <circle cx="0" cy="0" r="32" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="-45" y1="0" x2="45" y2="0" stroke="#64748B" strokeWidth="1" />
                      <line x1="0" y1="-45" x2="0" y2="45" stroke="#64748B" strokeWidth="1" />
                      <text x="36" y="-4" fill="#94A3B8" fontSize="8" fontFamily="monospace">Re</text>
                      <text x="4" y="-36" fill="#94A3B8" fontSize="8" fontFamily="monospace">Im</text>
                      {(() => {
                        const phase = imagPower % 4;
                        const angle = phase * (Math.PI / 2);
                        const px = Math.cos(angle) * 32;
                        const py = -Math.sin(angle) * 32;
                        return (
                          <>
                            <line x1="0" y1="0" x2={px} y2={py} stroke="#EC4899" strokeWidth="3" />
                            <circle cx={px} cy={py} r="5" fill="#F43F5E" />
                          </>
                        );
                      })()}
                    </svg>

                    <button
                      onClick={() => setImagPower((p) => (p + 1) % 4)}
                      className="w-full py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/40 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'es' ? 'Rotar 90° (× i)' : language === 'ko' ? '90° 회전 (× i)' : 'Rotate 90° (× i)'}</span>
                    </button>
                  </div>
                )}

                {selectedLevel === 4 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock formula="f(x, y) = e^x \implies \frac{\partial}{\partial y}(e^x) \equiv 0" />
                      </div>
                      <div className="text-xl font-mono font-black text-emerald-400">
                        <KatexBlock formula="\\Delta z / \\Delta y = 0 \\quad \\text{[Plano Horizontal]}" />
                      </div>
                    </div>

                    <div className="relative w-full h-32 bg-slate-900/80 rounded-lg flex items-center justify-center border border-slate-800">
                      <div className="text-center space-y-1">
                        <span className="text-xs font-mono text-emerald-400 font-bold block">
                          Pendiente ∂/∂y = 0.00
                        </span>
                        <div className="w-48 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto" />
                        <span className="text-[11px] font-mono text-slate-400 block">
                          Totalmente plano en el eje Y
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Desplazamiento y: {partialY.toFixed(1)}</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.5"
                        value={partialY}
                        onChange={(e) => setPartialY(parseFloat(e.target.value))}
                        className="w-32 accent-emerald-400"
                      />
                    </div>
                  </div>
                )}

                {selectedLevel === 5 && (
                  <div className="w-full space-y-4">
                    {(() => {
                      const funcs = ['\\sin(x)', '\\cos(x)', '-\\sin(x)', '-\\cos(x)'];
                      const derivs = ['\\cos(x)', '-\\sin(x)', '-\\cos(x)', '\\sin(x)'];
                      const currentFunc = funcs[trigPhase % 4];
                      const currentDeriv = derivs[trigPhase % 4];
                      const colors = ['#7B1FA2', '#9C27B0', '#E91E63', '#FF5722'];
                      const activeColor = colors[trigPhase % 4];

                      return (
                        <>
                          <div className="text-center space-y-1">
                            <div className="text-xs font-mono text-slate-400">
                              <KatexBlock formula={`f(x) = ${currentFunc} \\implies f'(x) = ${currentDeriv}`} />
                            </div>
                            <div className="text-xl font-mono font-black" style={{ color: activeColor }}>
                              <KatexBlock formula={`\\frac{d}{dx}\\left(${currentFunc}\\right) = ${currentDeriv}`} />
                            </div>
                          </div>

                          {/* SVG Wave Plot */}
                          <svg viewBox="-50 -30 100 60" className="w-full h-32 bg-black/30 rounded-lg">
                            <line x1="-50" y1="0" x2="50" y2="0" stroke="#475569" strokeWidth="0.8" />
                            <line x1="0" y1="-30" x2="0" y2="30" stroke="#475569" strokeWidth="0.8" />
                            <path
                              d={Array.from({ length: 61 }, (_, i) => {
                                const xVal = -Math.PI + (i / 60) * 2 * Math.PI;
                                let yVal = 0;
                                if (trigPhase % 4 === 0) yVal = Math.sin(xVal);
                                else if (trigPhase % 4 === 1) yVal = Math.cos(xVal);
                                else if (trigPhase % 4 === 2) yVal = -Math.sin(xVal);
                                else yVal = -Math.cos(xVal);
                                const svgX = (xVal / Math.PI) * 45;
                                const svgY = -yVal * 20;
                                return `${i === 0 ? 'M' : 'L'} ${svgX} ${svgY}`;
                              }).join(' ')}
                              fill="none"
                              stroke={activeColor}
                              strokeWidth="2.5"
                            />
                          </svg>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-400">
                              Paso { (trigPhase % 4) + 1 } / 4
                            </span>
                            <button
                              onClick={() => setTrigPhase((prev) => prev + 1)}
                              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-white transition-all shadow-md flex items-center space-x-1"
                            >
                              <span>Aplicar d/dx</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {selectedLevel === 6 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock formula="\int e^x dx = e^x + C" />
                      </div>
                      <div className="text-xl font-mono font-black text-orange-400">
                        <KatexBlock formula={`C = ${integralC}`} />
                      </div>
                    </div>

                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <line x1="-50" y1="0" x2="50" y2="0" stroke="#475569" strokeWidth="0.8" />
                      <line x1="0" y1="-50" x2="0" y2="50" stroke="#475569" strokeWidth="0.8" />
                      {/* Family of Curves */}
                      {[-4, 0, 4].map((cVal) => (
                        <path
                          key={cVal}
                          d={Array.from({ length: 31 }, (_, i) => {
                            const px = -2 + (i / 30) * 4;
                            const py = Math.exp(px) + cVal;
                            const svgX = px * 20;
                            const svgY = -py * 4;
                            return `${i === 0 ? 'M' : 'L'} ${svgX} ${Math.max(-48, Math.min(48, svgY))}`;
                          }).join(' ')}
                          fill="none"
                          stroke={cVal === integralC ? '#FB8C00' : '#475569'}
                          strokeWidth={cVal === integralC ? '3' : '1'}
                          strokeDasharray={cVal === integralC ? undefined : '2,2'}
                        />
                      ))}
                    </svg>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Constante C: {integralC}</span>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="1"
                        value={integralC}
                        onChange={(e) => setIntegralC(parseInt(e.target.value))}
                        className="w-32 accent-orange-400"
                      />
                    </div>
                  </div>
                )}

                {selectedLevel === 7 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock formula={`y = ${waveAmp.toFixed(1)} \\sin(${waveFreq.toFixed(1)} x)`} />
                      </div>
                      <div className="text-sm font-mono font-black text-cyan-400">
                        <KatexBlock
                          formula={`T = \\frac{2\\pi}{\\omega} = ${(
                            (2 * Math.PI) /
                            waveFreq
                          ).toFixed(2)}\\text{ s}`}
                        />
                      </div>
                    </div>

                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <line x1="-50" y1="0" x2="50" y2="0" stroke="#475569" strokeWidth="0.8" />
                      <line x1="0" y1="-50" x2="0" y2="50" stroke="#475569" strokeWidth="0.8" />
                      <path
                        d={Array.from({ length: 51 }, (_, i) => {
                          const px = -3 + (i / 50) * 6;
                          const py = waveAmp * Math.sin(waveFreq * px);
                          const svgX = px * 15;
                          const svgY = -py * 14;
                          return `${i === 0 ? 'M' : 'L'} ${svgX} ${Math.max(-48, Math.min(48, svgY))}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#00E5FF"
                        strokeWidth="2.5"
                      />
                      <path
                        d={Array.from({ length: 51 }, (_, i) => {
                          const px = -3 + (i / 50) * 6;
                          const py = waveAmp * Math.cos(waveFreq * px);
                          const svgX = px * 15;
                          const svgY = -py * 14;
                          return `${i === 0 ? 'M' : 'L'} ${svgX} ${Math.max(-48, Math.min(48, svgY))}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#FF9100"
                        strokeWidth="1.5"
                        strokeDasharray="2,2"
                      />
                    </svg>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span>Amplitud A: {waveAmp.toFixed(1)}</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={waveAmp}
                          onChange={(e) => setWaveAmp(parseFloat(e.target.value))}
                          className="w-32 accent-cyan-400"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span>Frecuencia ω: {waveFreq.toFixed(1)}</span>
                        <input
                          type="range"
                          min="0.5"
                          max="4.0"
                          step="0.5"
                          value={waveFreq}
                          onChange={(e) => setWaveFreq(parseFloat(e.target.value))}
                          className="w-32 accent-orange-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedLevel === 8 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        {language === 'es'
                          ? 'Polígono Inscrito (Método de Arquímedes)'
                          : language === 'ko'
                          ? '내접 다각형 (아르키메데스 방법)'
                          : 'Inscribed Polygon (Archimedes Method)'}
                      </div>
                      <div className="text-lg font-mono font-black text-cyan-400">
                        <KatexBlock
                          formula={`\\pi \\approx ${(
                            archimedesN * Math.sin(Math.PI / archimedesN)
                          ).toFixed(5)}`}
                        />
                      </div>
                    </div>

                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <circle cx="0" cy="0" r="35" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                      {/* Polygon */}
                      <polygon
                        points={Array.from({ length: archimedesN }, (_, i) => {
                          const angle = (i / archimedesN) * 2 * Math.PI;
                          const px = Math.cos(angle) * 35;
                          const py = Math.sin(angle) * 35;
                          return `${px},${py}`;
                        }).join(' ')}
                        fill="rgba(0, 172, 193, 0.2)"
                        stroke="#00ACC1"
                        strokeWidth="2"
                      />
                    </svg>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Lados N: {archimedesN}</span>
                      <input
                        type="range"
                        min="3"
                        max="32"
                        step="1"
                        value={archimedesN}
                        onChange={(e) => setArchimedesN(parseInt(e.target.value))}
                        className="w-36 accent-cyan-400"
                      />
                    </div>
                  </div>
                )}

                {selectedLevel === 9 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock formula="e^{i\theta} = \cos(\theta) + i\sin(\theta)" />
                      </div>
                      <div className="text-sm font-mono font-black text-indigo-400">
                        <KatexBlock
                          formula={`(${Math.cos(eulerTheta).toFixed(2)}) + i(${Math.sin(
                            eulerTheta
                          ).toFixed(2)})`}
                        />
                      </div>
                    </div>

                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <circle cx="0" cy="0" r="32" fill="none" stroke="#475569" strokeWidth="1" />
                      <line x1="-45" y1="0" x2="45" y2="0" stroke="#64748B" strokeWidth="0.8" />
                      <line x1="0" y1="-45" x2="0" y2="45" stroke="#64748B" strokeWidth="0.8" />
                      {(() => {
                        const px = Math.cos(eulerTheta) * 32;
                        const py = -Math.sin(eulerTheta) * 32;
                        return (
                          <>
                            <line x1="0" y1="0" x2={px} y2={py} stroke="#818CF8" strokeWidth="2.5" />
                            <circle cx={px} cy={py} r="4.5" fill="#C084FC" />
                            {/* Projections */}
                            <line x1={px} y1={py} x2={px} y2="0" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2,2" />
                            <line x1={px} y1={py} x2="0" y2={py} stroke="#F43F5E" strokeWidth="1" strokeDasharray="2,2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Ángulo θ: {(eulerTheta / Math.PI).toFixed(2)}π</span>
                      <input
                        type="range"
                        min="0"
                        max={Math.PI * 2}
                        step="0.05"
                        value={eulerTheta}
                        onChange={(e) => setEulerTheta(parseFloat(e.target.value))}
                        className="w-32 accent-indigo-400"
                      />
                    </div>
                  </div>
                )}

                {selectedLevel === 10 && (
                  <div className="w-full space-y-4">
                    <div className="text-center space-y-1">
                      <div className="text-xs font-mono text-slate-400">
                        <KatexBlock formula="e^{i\pi} + 1 = 0" />
                      </div>
                      <div className="text-lg font-mono font-black text-amber-400">
                        {Math.abs(finalTheta - Math.PI) < 0.08 ? (
                          <span className="text-emerald-400 font-extrabold animate-pulse">
                            ✨ e^(iπ) + 1 = 0 [Aniquilación Total!]
                          </span>
                        ) : (
                          <KatexBlock
                            formula={`e^{i(${((finalTheta / Math.PI) * 180).toFixed(0)}^\\circ)} + 1`}
                          />
                        )}
                      </div>
                    </div>

                    <svg viewBox="-50 -50 100 100" className="w-full h-36 bg-black/30 rounded-lg">
                      <circle cx="0" cy="0" r="30" fill="none" stroke="#475569" strokeWidth="1" />
                      <line x1="-45" y1="0" x2="45" y2="0" stroke="#64748B" strokeWidth="0.8" />
                      <line x1="0" y1="-45" x2="0" y2="45" stroke="#64748B" strokeWidth="0.8" />
                      {(() => {
                        const px = Math.cos(finalTheta) * 30;
                        const py = -Math.sin(finalTheta) * 30;
                        return (
                          <>
                            <line x1="0" y1="0" x2={px} y2={py} stroke="#F59E0B" strokeWidth="3" />
                            <circle cx={px} cy={py} r="4.5" fill="#EF4444" />
                            {/* Target point at (-30, 0) */}
                            <circle cx="-30" cy="0" r="4.5" fill="none" stroke="#10B981" strokeWidth="2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Fasor θ: {(finalTheta / Math.PI).toFixed(2)}π</span>
                      <input
                        type="range"
                        min="0"
                        max={Math.PI}
                        step="0.02"
                        value={finalTheta}
                        onChange={(e) => setFinalTheta(parseFloat(e.target.value))}
                        className="w-32 accent-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Level CTA Button */}
            <button
              onClick={() => onPlayLevel(selectedLevel)}
              className="w-full mt-4 py-3 px-4 rounded-xl font-mono text-sm font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {t.playLevel} {selectedLevel}
              </span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathInfoScreen;
