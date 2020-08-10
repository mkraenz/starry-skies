import { Scene } from "phaser";
import { Event } from "../../events/Event";
import { IStarCollectedEvent } from "../../events/interfaces";
import { StarColor } from "../../events/StarColor";
import { locals } from "../../localizations";
import { TextConfig } from "../../styles/Text";
import { Scenes } from "../Scenes";

const colorsToPoints = {
    [StarColor.Blue]: 10,
    [StarColor.Green]: 20,
    [StarColor.Yellow]: 50,
};

export class ScoreHud extends Scene {
    private score = 0;

    constructor(key = Scenes.Score) {
        super(key);
    }

    public create() {
        const getScoreText = () => `${locals.score}${this.score}`;
        const scoreText = this.add
            .text(
                this.scale.width / 2,
                (this.scale.height * 1) / 24,
                getScoreText(),
                TextConfig.xl
            )
            .setOrigin(0.5);
        const mainScene = this.scene.get(Scenes.Main);
        mainScene.events.on(
            Event.StarCollected,
            (data: IStarCollectedEvent) => {
                this.score += colorsToPoints[data.color];
                scoreText.setText(getScoreText());
            }
        );
    }
}
