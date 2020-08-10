import { Input, Physics, Scene } from "phaser";

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

    private moveTo({ x, y }: { x: number; y: number }) {
        this.scene.physics.moveTo(this, x, y, cfg.speed);
    }
}
