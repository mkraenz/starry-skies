import { Geom, Input, Physics, Scene } from "phaser";
import { DEV } from "../dev-config";
import { Color, toHex } from "../styles/Color";

type Pointer = Input.Pointer;

const cfg = {
    speed: 300,
    scale: window.devicePixelRatio / 4,
    bodyScale: 1 / 3,
    bodyOffset: 0.18,
    initRelX: 1 / 2,
    initRelY: 1 / 2,
};

export class Player extends Physics.Arcade.Sprite {
    private particleEmitZone!: Geom.Rectangle;

    constructor(scene: Scene) {
        super(
            scene,
            scene.scale.width * cfg.initRelX,
            scene.scale.height * cfg.initRelY,
            "sun"
        );
        scene.add.existing(this);
        scene.physics.add.existing(this);

        (this.body as Physics.Arcade.Body).setAllowGravity(false);
        this.setScale(cfg.scale);
        this.setCircle(this.width * cfg.bodyScale);
        this.body.setOffset(
            this.width * cfg.bodyOffset,
            this.height * cfg.bodyOffset
        );
        this.addControls();
        this.addParticles();
    }

    public update() {
        this.particleEmitZone.centerX = this.x;
        this.particleEmitZone.centerY = this.y;
    }

    private addControls() {
        this.scene.input
            .on("pointerdown", (pointer: Pointer) => this.moveTo(pointer))
            .on(
                "pointermove",
                (pointer: Pointer) => pointer.isDown && this.moveTo(pointer)
            )
            .on("pointerup", () => this.body.stop());
    }

    private addParticles() {
        const offScreen = -1000;
        this.particleEmitZone = new Geom.Rectangle(
            offScreen,
            offScreen,
            (this.width * cfg.scale) / 5,
            (this.height * cfg.scale) / 2
        );
        const particles = this.scene.add.particles("star").createEmitter({
            ...sparksParticleCfg,
            emitZone: {
                source: this.particleEmitZone,
                type: "random",
            },
        });

        if (DEV.disableParticles) {
            particles.pause();
        }
    }

    private moveTo({ x, y }: { x: number; y: number }) {
        this.scene.physics.moveTo(this, x, y, cfg.speed);
    }
}

const sparksParticleCfg = {
    active: true,
    x: 0,
    y: 0,
    blendMode: 3,
    collideBottom: false,
    collideLeft: false,
    collideRight: false,
    collideTop: false,
    frequency: 5,
    gravityX: 0,
    gravityY: 0,
    maxParticles: 0,
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
    alpha: { start: 1, end: 0, ease: "Expo.easeOut" },
    bounce: 0,
    delay: 0,
    lifespan: 500,
    maxVelocityX: 10000,
    maxVelocityY: 10000,
    moveToX: 0,
    moveToY: 0,
    quantity: 1,
    rotate: 0,
    tint: toHex(Color.Yellow), // todo try making yellow
    speed: { min: 0, max: 110 },
    scale: { start: 0.25, end: 0, ease: "Linear" },
};
