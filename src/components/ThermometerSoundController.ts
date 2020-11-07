import { Scene } from "phaser";
import { Event } from "../events/Event";

const cfg = {};

// TODO redo
export class ThermometerSoundController {
    private state: Event = Event.Cold;

    constructor(private scene: Scene) {
        this.scene.events
            .on(Event.TooHot, () => this.onTooHot())
            .on(Event.Hot, () => this.onHot())
            .on(Event.Cold, () => this.onCold())
            .on(Event.Freezing, () => this.onFreezing());
    }

    private onTooHot() {
        if (this.state !== Event.TooHot) {
            this.state = Event.TooHot;
            // this.scene.sound.play("too-hot");
            // will be added on each event but gives great increase effect
        }
        this.scene.sound.play("boiling", { loop: true });
    }

    private onHot() {
        if (this.state !== Event.Hot) {
            this.state = Event.Hot;
            this.scene.sound.stopByKey("boiling");
            this.scene.sound.play("hot");
        }
    }

    private onCold() {
        if (this.state !== Event.Cold) {
            this.state = Event.Cold;
            this.scene.sound.play("too-hot");
        }
    }

    private onFreezing() {
        if (this.state !== Event.Freezing) {
            this.state = Event.Freezing;
            this.scene.sound.play("too-hot");
        }
    }
}
