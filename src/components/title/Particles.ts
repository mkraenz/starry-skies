import { GameObjects, Scale, Scene } from "phaser";
import { Star } from "../Star";

const cfg = {
    count: 150,
    relOffsetX: 0.1,
    relOffsetY: 0.2,
    scale: 0.5,
    minSpeed: 2,
    speedMultiplier: 6,
};

export class Particles {
    private particles: Array<{
        particle: GameObjects.Image;
        step: number;
    }> = [];

    private scale: Scale.ScaleManager;

    constructor(private scene: Scene) {
        this.scale = scene.scale;
        for (let i = 0; i < cfg.count; i++) {
            const width = this.scale.width;
            const xOffset = cfg.relOffsetX;
            const x = Phaser.Math.Between(
                -width * xOffset,
                width * (1 + xOffset)
            );
            const y = Phaser.Math.Between(
                -this.scale.height * cfg.relOffsetY,
                this.scale.height
            );

            const particle = new Star(scene, x, y);
            particle.disablePhysics();
            particle.setBlendMode(Phaser.BlendModes.ADD);

            this.particles.push({
                particle,
                step: cfg.minSpeed + Math.random() * cfg.speedMultiplier,
            });
        }
    }

    public update() {
        this.particles.forEach(({ particle, step }) => {
            particle.y += step;
            const isBelowBottom =
                particle.y > this.scale.height * (1 + cfg.relOffsetY);
            if (isBelowBottom) {
                const aboveTop = -this.scale.height * cfg.relOffsetY;
                particle.y = aboveTop;
            }
        });
    }
}
