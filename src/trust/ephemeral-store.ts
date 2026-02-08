import { randomBytes } from 'crypto';

export class EphemeralStore<T> {
  private data = new Map<string, { expires: number; item: T }>();
  private timer: ReturnType<typeof setInterval>;

  constructor(private ttlMs = 15 * 60 * 1000) {
    this.timer = setInterval(() => this.gc(), 5000);
    this.timer.unref();
  }

  create(item: T): string {
    const id = randomBytes(16).toString('hex');
    this.data.set(id, { expires: Date.now() + this.ttlMs, item });
    return id;
  }

  get(id: string): T | undefined {
    const rec = this.data.get(id);
    if (!rec) return undefined;
    if (Date.now() > rec.expires) {
      this.data.delete(id);
      return undefined;
    }
    return rec.item;
  }

  purgeAll(): void {
    this.data.clear();
  }

  dispose(): void {
    clearInterval(this.timer);
    this.data.clear();
  }

  get size(): number {
    return this.data.size;
  }

  private gc(): void {
    const now = Date.now();
    for (const [id, rec] of this.data.entries()) {
      if (rec.expires < now) {
        this.data.delete(id);
      }
    }
  }
}
