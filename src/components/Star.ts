import { Physics, Scene } from "phaser";
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
    }

    public onCollide() {
        const eventData: IStarCollectedEvent = { color: this.color };
        this.scene.events.emit(Event.StarCollected, eventData);
    }

    public update() {
        const outOfRightBound =
            this.x > this.scene.scale.width + cfg.horizontalOutOfBoundsOffset;
        const outOfLeftBound = this.x < -cfg.horizontalOutOfBoundsOffset;
        const outOfBottomBound =
            this.y > this.scene.scale.height + cfg.verticalOutOfBoundsOffset;

        const outOfBounds =
            outOfBottomBound || outOfRightBound || outOfLeftBound;
        if (outOfBounds) {
            this.setState(Star.OutOfBounds);
        }
    }

    public disablePhysics() {
        (this.body as Physics.Arcade.Body).allowGravity = false;
    }

    private colorize() {
        switch (this.color) {
            case StarColor.Green:
                this.setTint(toHex(Color.LawnGreen));
                break;
            case StarColor.Yellow:
                this.setTint(toHex(Color.Yellow));
                break;
            default:
                break;
        }
    }
}
