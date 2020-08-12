import { Physics, Scene } from "phaser";
import { BackgroundImage } from "../components/BackgroundImage";
import { GravityIncreaser } from "../components/GravityIncreaser";
import { Player } from "../components/Player";
import { Star } from "../components/Star";
import { StarSpawner } from "../components/StarSpawner";
import { Thermometer } from "../components/Thermometer";
import { DEV } from "../dev-config";
import { Event } from "../events/Event";
import { GRegistry } from "../gRegistry";
import { GameOverScene, IGameOverSceneInitData } from "./GameOverScene";
import { ScoreHud } from "./hud/ScoreHud";
import { Scenes } from "./Scenes";

export class MainScene extends Scene {
    private subScenes: string[] = [];
    private stars!: Physics.Arcade.Group;
    private sun!: Player;
    private spawner!: StarSpawner;
    private gravityIncreaser!: GravityIncreaser;
    private gotoPendingDirtyFlag = false;

    constructor() {
        super({ key: Scenes.Main });
    }

    public create(): void {
        this.cameras.main.fadeIn(200);
        new BackgroundImage(this, "bg");
        this.cameras.main.once("camerafadeincomplete", () => {
            new Thermometer(this);
            this.addHud();
        });
        this.input.keyboard.on("keydown-R", () => this.restart());

        this.sun = new Player(this);
        this.createStars();
        this.gravityIncreaser = new GravityIncreaser(this);

        this.setUpTemperatureHandlers();
    }

    public update() {
        this.updateStars();
        this.sun.update();
    }

    private addHud() {
        this.addSubScene(Scenes.Score, ScoreHud);
    }

    private setUpTemperatureHandlers() {
        if (!DEV.loseDisabled) {
            this.events
                .on(Event.ExplodinglyHot, () => this.gameOver())
                .on(Event.Freezing, () => this.gameOver());
        }
    }

    private gameOver() {
        const data: IGameOverSceneInitData = {
            score: GRegistry.getScore(this),
        };
        this.goto(Scenes.GameOver, GameOverScene, data);
    }

    private createStars() {
        const stars = this.physics.add.group([], {
            active: true,
            enable: true,
        });
        this.spawner = new StarSpawner(this, stars);
        this.spawner.spawnInterval(1, 150);
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
            this.tearDown();
            this.scene.restart();
        });
        this.cameras.main.fadeOut(100);
    }

    private addSubScene<T extends {}>(
        key: string,
        scene: new () => Scene,
        initData?: T
    ) {
        this.scene.add(key, scene, true, initData);
        this.subScenes.push(key);
    }

    private goto(
        key: string,
        sceneClass: new (name: string) => Scene,
        data?: { [key: string]: any }
    ) {
        // consider removing the fadeOut
        if (this.gotoPendingDirtyFlag) {
            // do not trigger scene change twice
            return;
        }
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.tearDown();
            this.scene.add(key, sceneClass, true, data);
            this.scene.remove(this);
        });
        this.gotoPendingDirtyFlag = true;
        this.cameras.main.fadeOut(50);
    }

    private tearDown() {
        this.spawner.destroy();
        this.gravityIncreaser.destroy();
        this.input.removeAllListeners();
        this.children.getAll().forEach(c => c.destroy());
        this.subScenes.forEach(key => {
            this.scene.remove(key);
        });
        this.subScenes = [];
        // prevent "cannot read property 'cut' of null" on scene.events.emit(Event.Type)
        Object.values(Event).forEach(event => this.events.off(event));
    }
}
