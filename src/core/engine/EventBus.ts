export type GameEventType =
  | 'MATCH_START'
  | 'MATCH_COUNTDOWN'
  | 'MATCH_OVER'
  | 'COLLISION'
  | 'DAMAGE_DEALT'
  | 'STATUS_APPLIED'
  | 'MATH_FORMULA'
  | 'SKILL_ACTIVATED'
  | 'SKILL_READY'
  | 'ORB_COLLECTED'
  | 'SPAWN_ENTITY'
  | 'DESPAWN_ENTITY'
  | 'LASER_FIRED';

export interface GameEventPayloads {
  MATCH_START: { levelId: number };
  MATCH_COUNTDOWN: { count: number };
  MATCH_OVER: { winner: 'LEFT' | 'RIGHT'; remainingHp: number; symbol: string };
  COLLISION: { entityAId: string; entityBId: string; position: { x: number; y: number } };
  DAMAGE_DEALT: { targetId: string; amount: number; isCrit?: boolean; color: string; position: { x: number; y: number } };
  STATUS_APPLIED: { targetId: string; status: string };
  MATH_FORMULA: { latex: string; position: { x: number; y: number }; color?: string };
  SKILL_ACTIVATED: { entityId: string; skillName: string };
  SKILL_READY: { entityId: string };
  ORB_COLLECTED: { entityId: string; orbType: string };
  SPAWN_ENTITY: { entityId: string };
  DESPAWN_ENTITY: { entityId: string };
  LASER_FIRED: { laserId: string; ownerId: string; curveType: string };
}

type EventCallback<T extends GameEventType> = (payload: GameEventPayloads[T]) => void;

export class EventBus {
  private listeners: { [K in GameEventType]?: Array<EventCallback<K>> } = {};

  on<T extends GameEventType>(event: T, callback: EventCallback<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback as any);

    return () => {
      this.off(event, callback);
    };
  }

  off<T extends GameEventType>(event: T, callback: EventCallback<T>): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter((cb) => cb !== callback) as any;
  }

  emit<T extends GameEventType>(event: T, payload: GameEventPayloads[T]): void {
    if (!this.listeners[event]) return;
    for (const listener of this.listeners[event]!) {
      listener(payload);
    }
  }

  clear(): void {
    this.listeners = {};
  }
}

export const globalEventBus = new EventBus();
