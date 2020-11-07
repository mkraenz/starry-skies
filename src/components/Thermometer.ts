import { inRange } from "lodash";
import { GameObjects, Scene } from "phaser";
import { DEV } from "../dev-config";
import { Event } from "../events/Event";
import { IStarCollectedEvent } from "../events/interfaces";
import { StarColor } from "../events/StarColor";
import { Color, toHex } from "../styles/Color";
import { ThermometerColorController } from "./ThermometerColorController";
import { ThermometerSoundController } from "./ThermometerSoundController";

const cfg = {
    x: 1 / 12,
    y: 1 / 2,
    temperature: {
        min: 0,
        freezing: 15, // below this, warn about to die from frost
        max: 100, // temperature is in percent
        init: 20,
        idealMin: 22,
        idealMax: 28, // // above this, warn about to die from heat
    },
    scale: 3,
    fluid: {
        scaleX: 0.4,
        scaleY: 0.9,
        offsetY: 0.03,
    },
};

const colorToTemperatureIncrease: { [key in StarColor]: number } = {
    [StarColor.Blue]: -2,
    [StarColor.Green]: 1,
    [StarColor.Yellow]: 3,
};

export class Thermometer extends GameObjects.Sprite {
    private temperature = cfg.temperature.init;
    private fluid!: GameObjects.Rectangle;

    constructor(scene: Scene) {
        super(
            scene,
            scene.scale.width * cfg.x,
            scene.scale.height * cfg.y,
            "thermometer"
        );
        this.setOrigin(0.5, 0);
        this.setY(this.y - this.height); // centered
        scene.add.existing(this);
        this.setScale(cfg.scale);

        scene.events.on(Event.StarCollected, (event: IStarCollectedEvent) =>
            this.onStarCollected(event)
        );

        const innerBackground = this.scene.add
            .rectangle(
                this.x,
                this.getBottomCenter().y * (1 - cfg.fluid.offsetY),
                this.width * this.scaleX * cfg.fluid.scaleX,
                -(this.height * this.scaleY * cfg.fluid.scaleY),
                toHex(Color.WhiteSilver)
            )
            .setOrigin(0.5, 0)
            .setAlpha(0.4);
        this.fluid = this.scene.add
            .rectangle(
                this.x,
                this.getBottomCenter().y * (1 - cfg.fluid.offsetY),
                this.width * this.scaleX * cfg.fluid.scaleX,
                this.getFluidHeight(),
                toHex(Color.Blue)
            )
            .setAlpha(1)
            .setOrigin(0.5, 0);
        innerBackground.setDepth(10);
        this.fluid.setDepth(11);
        this.setDepth(12);
        new ThermometerColorController(this.scene, this.fluid);
        new ThermometerSoundController(this.scene);
    }

    private onStarCollected(event: IStarCollectedEvent) {
        const tempDiff = colorToTemperatureIncrease[event.color];
        this.temperature += tempDiff;
        this.emitTemperatureEvents();
        this.redrawFluid();
    }

    private getFluidHeight() {
        const relativeTemperature = this.temperature / cfg.temperature.max;
        // negative number to grow upwards
        return -(
            this.height *
            this.scaleY *
            cfg.fluid.scaleY *
            relativeTemperature
        );
    }

    private redrawFluid() {
        this.fluid.setDisplaySize(this.fluid.width, this.getFluidHeight());
    }

    private emitTemperatureEvents() {
        const event = this.currentState();
        this.scene.events.emit(event);
    }

    private currentState() {
        if (DEV.instantKill) {
            return Event.TooHot;
        }

        const isFrozen = this.temperature < cfg.temperature.min;
        const isFreezing = inRange(
            this.temperature,
            cfg.temperature.min,
            cfg.temperature.freezing + 1 // in range excludes end
        );
        const isHot = inRange(
            this.temperature,
            cfg.temperature.idealMin,
            cfg.temperature.idealMax + 1 // in range excludes end
        );
        const isTooHot = inRange(
            this.temperature,
            cfg.temperature.idealMax,
            cfg.temperature.max + 1 // in range excludes end
        );
        const isExplodinglyHot = this.temperature > cfg.temperature.max;

        if (isFrozen) {
            return Event.Frozen;
        }
        if (isFreezing) {
            return Event.Freezing;
        }
        if (isHot) {
            return Event.Hot;
        }
        if (isTooHot) {
            return Event.TooHot;
        }
        if (isExplodinglyHot) {
            return Event.ExplodinglyHot;
        }
        return Event.Cold; // between freezing and idealMin
    }
}
