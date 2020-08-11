import { GameObjects, Scene } from "phaser";
import { DEV } from "../dev-config";
import { locals } from "../localizations";
import { Color, toHex } from "../styles/Color";
import { setDefaultTextStyle, TextConfig } from "../styles/Text";
import { MainScene } from "./MainScene";
import { Scenes } from "./Scenes";

export class LoadingScene extends Scene {
    private halfWidth!: number;
    private halfHeight!: number;

    constructor() {
        super({ key: Scenes.Loading });
    }

    public preload() {
        this.halfWidth = this.scale.width / 2;
        this.halfHeight = this.scale.height / 2;

        this.preloadAssets();
        this.addTitles();
        this.makeLoadingBar();
    }

    private preloadAssets() {
        const img = (filename: string) => `./assets/images/${filename}`;
        this.load
            .image("bg", img("space_rt.png"))
            .image("star", img("star.png"))
            .image("thermometer", img("thermometer.png"))
            .image("sun", img("sun_shiny.png"));
    }

    private makeLoadingBar() {
        const loadingText = this.make.text({
            x: this.halfWidth,
            y: this.halfHeight - 50,
            text: locals.loading,
            style: {
                font: "30px Metamorphous",
                fill: Color.White,
            },
        });
        loadingText.setOrigin(0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(toHex(Color.DarkGrey), 0.8);
        progressBox.fillRect(
            this.halfWidth - 320 / 2,
            this.halfHeight,
            320,
            50
        );

        const assetText = this.make.text({
            x: this.halfWidth,
            y: this.halfHeight + 65,
            text: "",
            style: {
                font: "18px Metamorphous",
                fill: Color.White,
            },
        });
        assetText.setOrigin(0.5);

        this.load.on("progress", this.getProgressBarFiller(progressBar));
        this.load.on("fileprogress", this.getAssetTextWriter(assetText));
        this.load.on("complete", () => {
            if (DEV.startInWinScene) {
                //
            } else if (DEV.skipTitle) {
                this.scene.add(Scenes.Main, MainScene, true);
            } else {
                //
            }
            this.scene.remove(this);
        });
    }

    private getAssetTextWriter(
        assetText: GameObjects.Text
    ): (file: { key: string }) => void {
        return (file: { key: string }) => {
            assetText.setText(`${locals.loadingAsset}${file.key}`);
        };
    }

    private getProgressBarFiller(
        progressBar: GameObjects.Graphics
    ): (count: number) => void {
        return (count: number) => {
            progressBar.clear();
            progressBar.fillStyle(toHex(Color.White));
            progressBar.fillRect(
                this.halfWidth + 10 - 320 / 2,
                this.halfHeight + 10,
                300 * count,
                30
            );
        };
    }

    private addTitles() {
        this.add
            .text(
                this.halfWidth,
                this.halfHeight - 200,
                locals.title,
                TextConfig.title
            )
            .setOrigin(0.5);

        const subtitle = this.add
            .text(
                this.halfWidth,
                this.halfHeight - 120,
                "This world is dying. Can you save us?"
            )
            .setOrigin(0.5);
        setDefaultTextStyle(subtitle);
        subtitle.setColor(Color.White);
    }
}
