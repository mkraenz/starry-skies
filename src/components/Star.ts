import { GameObjects, Geom, Physics, Scene } from "phaser";
import { DEV } from "../dev-config";
import { Event } from "../events/Event";
import { IStarCollectedEvent } from "../events/interfaces";
import { StarColor } from "../events/StarColor";
import { Color, toHex } from "../styles/Color";

const cfg = {
    scale: window.devicePixelRatio / 10,
    bodyScale: 1 / 3,
    defaultColor: StarColor.Blue,
    horizontalOutOfBoundsOffset: 200,
    verticalOutOfBoundsOffset: 200,
};

export class Star extends Physics.Arcade.Sprite {
    public static OutOfBounds = "OutOfBounds";

    private particleEmitZone!: Geom.Rectangle;
    private particles!: GameObjects.Particles.ParticleEmitter;

    private get outOfBounds() {
        const outOfRightBound =
            this.x > this.scene.scale.width + cfg.horizontalOutOfBoundsOffset;
        const outOfLeftBound = this.x < -cfg.horizontalOutOfBoundsOffset;
        const outOfBottomBound =
            this.y > this.scene.scale.height + cfg.verticalOutOfBoundsOffset;
        return outOfBottomBound || outOfRightBound || outOfLeftBound;
    }

    constructor(
        scene: Scene,
        x: number,
        y: number,
        private color = cfg.defaultColor
    ) {
        super(scene, x, y, "star");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(cfg.scale);
        this.setSize(this.width * cfg.bodyScale, this.height * cfg.bodyScale);
        this.colorize();
        this.addParticles();
    }

    public onCollide() {
        const eventData: IStarCollectedEvent = { color: this.color };
        this.scene.events.emit(Event.StarCollected, eventData);
    }

    public update() {
        if (this.outOfBounds) {
            this.setState(Star.OutOfBounds);
        }
        this.particleEmitZone.centerX = this.x;
        this.particleEmitZone.centerY = this.y;
    }

    public disablePhysics() {
        (this.body as Physics.Arcade.Body).allowGravity = false;
    }

    public destroy() {
        this.particles.pause();
        this.particles.killAll();
        super.destroy();
    }

    private addParticles() {
        const offScreen = -1000;
        this.particleEmitZone = new Geom.Rectangle(
            offScreen,
            offScreen,
            (this.width * cfg.scale) / 5,
            (this.height * cfg.scale) / 2
        );
        const tint = starColorToTint[this.color];
        this.particles = this.scene.add.particles("star").createEmitter({
            ...sparksParticleCfg,
            ...(tint && { tint: toHex(tint) }),
            emitZone: {
                source: this.particleEmitZone,
                type: "random",
            },
        });

        if (DEV.disableParticles) {
            this.particles.pause();
        }
    }

    private colorize() {
        const tint = starColorToTint[this.color];
        if (tint) {
            this.setTint(toHex(tint));
        }
    }
}

const starColorToTint: { [key in StarColor]: Color | null } = {
    [StarColor.Blue]: null,
    [StarColor.Green]: Color.LawnGreen,
    [StarColor.Yellow]: Color.Yellow,
};

const sparksParticleCfg = {
    active: true,
    x: 0,
    y: 0,
    blendMode: 3,
    collideBottom: false,
    collideLeft: false,
    collideRight: false,
    collideTop: false,
    frequency: 200,
    gravityX: 0,
    gravityY: 0,
    maxParticles: 200,
    name: "sun-sparks",
    on: true,
    particleBringToTop: false,
    radial: true,
    timeScale: 1,
    trackVisible: false,
    visible: true,
    accelerationX: 0,
    accelerationY: 0,
    angle: { min: 0, max: 360 },
    alpha: { start: 1, end: 0, ease: "Linear" },
    bounce: 0,
    delay: 0,
    lifespan: 300,
    maxVelocityX: 10000,
    maxVelocityY: 10000,
    moveToX: 0,
    moveToY: 0,
    quantity: 1,
    rotate: 0,
    speed: { min: 0, max: 110 },
    scale: { start: 0.2, end: 0.1, ease: "Linear" },
};
