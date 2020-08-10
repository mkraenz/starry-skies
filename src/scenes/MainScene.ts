import { Physics, Scene } from "phaser";
import { BackgroundImage } from "../components/BackgroundImage";
import { Player } from "../components/Player";
import { Star } from "../components/Star";
import { StarSpawner } from "../components/StarSpawner";
import { Event } from "../events/Event";
import { ScoreHud } from "./hud/ScoreHud";
import { Scenes } from "./Scenes";

type Group = Physics.Arcade.Group;

export class MainScene extends Scene {
    private subScenes: string[] = [];
    private stars!: Group;
    private sun!: Player;
    private spawner!: StarSpawner;
    private intervalTimers: number[] = [];

    constructor() {
        super({ key: Scenes.Main });
    }

    public create(): void {
        this.cameras.main.fadeIn(200);
        new BackgroundImage(this, "bg");
        this.cameras.main.once("camerafadeincomplete", () => this.addHud());
        this.input.keyboard.on("keydown-R", () => this.restart());

        this.sun = new Player(this);
        this.createStars();
        this.speedUpGravityOverTime();
    }

    public update() {
        this.updateStars();
    }

    private speedUpGravityOverTime() {
        const speedUpTimer = window.setInterval(() => {
            const gravity = this.physics.world.gravity;
            gravity.set(gravity.x, gravity.y + 10);
        }, 10000);
        this.intervalTimers.push(speedUpTimer);
    }

    private createStars() {
        const stars = this.physics.add.group([], {
            active: true,
            enable: true,
        });
        this.spawner = new StarSpawner(this, stars);
        this.spawner.spawnInterval(1, 300);
        this.physics.add.overlap(this.sun, stars, (_, starX) => {
            (starX as Star).onCollide();
            stars.remove(starX, true, true);
        });
        this.stars = stars;
    }

    private updateStars() {
        const stars = this.stars.getChildren();
        stars.forEach(x => x.update());
        const oobStars = stars.filter(s => s.state === Star.OutOfBounds);
        oobStars.forEach(e => this.stars.remove(e, true, true));
    }

    private restart() {
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.spawner.destroy();
            this.intervalTimers.forEach(interval => clearInterval(interval));
            this.children.getAll().forEach(c => c.destroy());
            this.subScenes.forEach(key => {
                this.scene.remove(key);
            });
            this.subScenes = [];
            // prevent "cannot read property 'cut' of null" on scene.events.emit(Event.Type)
            Object.values(Event).forEach(event => this.events.off(event));
            this.scene.restart();
        });
        this.cameras.main.fadeOut(100);
    }

    private addHud() {
        this.addSubScene(Scenes.Score, ScoreHud);
    }

    private addSubScene<T extends {}>(
        key: string,
        scene: new () => Scene,
        initData?: T
    ) {
        this.scene.add(key, scene, true, initData);
        this.subScenes.push(key);
    }
}