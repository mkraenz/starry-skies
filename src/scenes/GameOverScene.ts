import { Scene } from "phaser";
import { BackgroundImage } from "../components/BackgroundImage";
import { Particles } from "../components/title/Particles";
import { ButtonSm } from "../components/ui/ButtonSm";
import { GRegistry } from "../gRegistry";
import { locals } from "../localizations";
import { TextConfig } from "../styles/Text";
import { MainScene } from "./MainScene";
import { Scenes } from "./Scenes";

const cfg = {
    retry: {
        relY: 0.7,
    },
    window: {
        relY: 0.4,
        scale: 0.6,
    },
    score: {
        relY: 0.47,
        scale: 0.8,
        title: {
            relY: 0.33,
        },
    },
};

export interface IGameOverSceneInitData {
    score: number;
}

export class GameOverScene extends Scene {
    private particles!: Particles;

    constructor() {
        super(Scenes.GameOver);
    }

    public create() {
        new BackgroundImage(this, "bg");
        this.particles = new Particles(this);

        const halfWidth = this.scale.width / 2;
        const height = this.scale.height;
        this.add
            .image(halfWidth, this.scale.height * cfg.window.relY, "ui-window")
            .setScale(cfg.window.scale);

        this.add
            .text(
                halfWidth,
                height * cfg.score.title.relY,
                locals.finalScore,
                TextConfig.gameOverTitle
            )
            .setOrigin(0.5);
        const score = `${GRegistry.getScore(this)}`;
        this.add
            .image(halfWidth, height * cfg.score.relY, "ui-field")
            .setScale(cfg.score.scale);
        this.add
            .text(
                halfWidth,
                height * cfg.score.relY,
                score,
                TextConfig.buttonSm
            )
            .setOrigin(0.5);
        new ButtonSm(this, height * cfg.retry.relY, locals.retry, () => {
            this.scene.add(Scenes.Main, MainScene, true);
            this.scene.remove(this);
        });

        GRegistry.clear(this);
    }

    public update() {
        this.particles.update();
    }
}
