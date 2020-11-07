import { GameObjects, Scene } from "phaser";
import { Event } from "../events/Event";
import { Color, toHex } from "../styles/Color";

const cfg = {};

export class ThermometerColorController {
    constructor(private scene: Scene, private fluid: GameObjects.Rectangle) {
        this.scene.events
            .on(Event.TooHot, () => this.set(Color.HotRed))
            .on(Event.Hot, () => this.set(Color.Green))
            .on(Event.Cold, () => this.set(Color.Blue))
            .on(Event.Freezing, () => this.set(Color.IceBlue));
    }

    private set(color: Color) {
        this.fluid.setFillStyle(toHex(color));
    }
}
