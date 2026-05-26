// TimelineAnimation.js - Timeline & simulation clock manager

export class SimulationClock {
  constructor() {
    this.isActive = false;
    this.time = 0; // Accumulated simulation time
    this.speed = 1.0;
    this.lastTimestamp = 0;
    this.listeners = new Set();
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  stop() {
    this.isActive = false;
  }

  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
  }

  setSpeed(value) {
    this.speed = Math.max(0.1, Math.min(value, 5.0));
  }

  reset() {
    this.time = 0;
    this.triggerListeners(0);
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  triggerListeners(dt) {
    for (const cb of this.listeners) {
      cb(this.time, dt);
    }
  }

  loop() {
    if (!this.isActive) return;

    const now = performance.now();
    const dt = ((now - this.lastTimestamp) / 1000) * this.speed;
    this.lastTimestamp = now;

    // Cap dt to prevent massive jumps when tab loses focus
    const cappedDt = Math.min(dt, 0.1);
    this.time += cappedDt;

    this.triggerListeners(cappedDt);

    requestAnimationFrame(() => this.loop());
  }
}
