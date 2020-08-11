import { inRange } from "lodash";
import { GameObjects, Scene } from "phaser";
import { DEV } from "../dev-config";
import { Event } from "../events/Event";
import { IStarCollectedEvent } from "../events/interfaces";
import { StarColor } from "../events/StarColor";
import { Color, toHex } from "../styles/Color";

const cfg = {
    x: 1 / 12,
    y: 1 / 2,
    temperature: {
        min: 0,
        max: 100, // temperature is in percent
        init: 10,
        idealMin: 80,
        idealMax: 90,
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
                toHex(Color.HackerGreen)
            )
            .setOrigin(0.5, 0);
        innerBackground.setDepth(10);
        this.fluid.setDepth(11);
        this.setDepth(12);
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
        this.scene.events.emit(this.getCurrentEvent());
    }

    private getCurrentEvent() {
        if (DEV.instantKill) {
            return Event.ExplodinglyHot;
        }

        const isFreezing = this.temperature < cfg.temperature.min;
        const isIdeal = inRange(
            this.temperature,
            cfg.temperature.idealMin,
            cfg.temperature.idealMax + 1 // in range excludes end
        );
        const isExplodinglyHot = this.temperature > cfg.temperature.max;

        if (isFreezing) {
            return Event.Freezing;
        }
        if (isExplodinglyHot) {
            return Event.ExplodinglyHot;
        }
        if (isIdeal) {
            return Event.InIdealTemperature;
        }
        return Event.OutsideIdealTemperature;
    }
}
