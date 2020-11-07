import { Scene } from "phaser";

const cfg = {
    interval: 5000, // ms
    step: 20,
};

export class GravityIncreaser {
    private intervalTimer: number;

    constructor(scene: Scene) {
        const speedUpTimer = window.setInterval(() => {
            const gravity = scene.physics.world.gravity;
            gravity.set(gravity.x, gravity.y + cfg.step);
        }, cfg.interval);
        this.intervalTimer = speedUpTimer;
    }

    public destroy() {
        clearInterval(this.intervalTimer);
    }
}
