import { Scene } from "phaser";
import { BackgroundImage } from "../components/BackgroundImage";
import { Particles } from "../components/title/Particles";
import { ButtonSm } from "../components/ui/ButtonSm";
import { locals } from "../localizations";
import { Color } from "../styles/Color";
import { TextConfig } from "../styles/Text";
import { MainScene } from "./MainScene";
import { Scenes } from "./Scenes";

const cfg = {
    fadeIn: 200,
    title: {
        relY: 0.4,
    },
    playButton: {
        relY: 0.62,
    },
    copyright: {
        relY: 0.95,
    },
    version: {
        relY: 0.93,
    },
};

export class TitleScene extends Scene {
    private particles!: Particles;

    constructor() {
        super({
            key: Scenes.Title,
        });
    }

    public create(): void {
        this.cameras.main.fadeIn(cfg.fadeIn);
        new BackgroundImage(this, "bg");
        this.particles = new Particles(this);
        this.addTitle();
        this.addPlayButton();
        this.addLegals();
    }

    public update() {
        this.particles.update();
    }

    private addTitle() {
        this.add
            .text(
                this.scale.width / 2,
                this.scale.height * cfg.title.relY,
                locals.title,
                TextConfig.title
            )
            .setOrigin(0.5)
            .setShadow(4, 6, Color.Grey, 2, true, true)
            .setAlpha(1);
    }

    private addPlayButton() {
        const bannerStartHeight = this.scale.height * cfg.playButton.relY;
        new ButtonSm(this, bannerStartHeight, locals.play, () =>
            this.goto(Scenes.Main, MainScene)
        );
    }

    private addLegals() {
        this.add
            .text(
                this.scale.width / 2,
                this.scale.height * cfg.copyright.relY,
                locals.copyright,
                TextConfig.version
            )
            .setOrigin(0.5);
        this.add
            .text(
                this.scale.width / 2,
                this.scale.height * cfg.version.relY,
                locals.version,
                TextConfig.version
            )
            .setOrigin(0.5);
    }

    private goto(key: string, sceneClass: new (name: string) => Scene) {
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.add(key, sceneClass, true);
            this.scene.remove(this);
        });
        this.cameras.main.fadeOut(500);
    }
}
