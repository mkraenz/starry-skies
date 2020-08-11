import { Scene } from "phaser";
import { Event } from "../../events/Event";
import { IStarCollectedEvent } from "../../events/interfaces";
import { StarColor } from "../../events/StarColor";
import { locals } from "../../localizations";
import { TextConfig } from "../../styles/Text";
import { Scenes } from "../Scenes";

const cfg = {
    bonusMultiplier: 5,
};

const colorsToPoints: { [key in StarColor]: number } = {
    [StarColor.Blue]: 10,
    [StarColor.Green]: 20,
    [StarColor.Yellow]: 50,
};

export class ScoreHud extends Scene {
    private score = 0;
    private bonus = false;

    constructor(key = Scenes.Score) {
        super(key);
    }

    public create() {
        const scoreText = this.add
            .text(
                this.scale.width / 2,
                (this.scale.height * 1) / 24,
                this.getScoreText(),
                TextConfig.xl
            )
            .setOrigin(0.5);
        const mainScene = this.scene.get(Scenes.Main);
        mainScene.events
            .on(Event.StarCollected, (data: IStarCollectedEvent) => {
                const bonusMultiplier = this.bonus ? cfg.bonusMultiplier : 1; // todo this is one-off
                this.score += colorsToPoints[data.color] * bonusMultiplier;
                scoreText.setText(this.getScoreText());
            })
            .on(Event.InIdealTemperature, () => (this.bonus = true))
            .on(Event.OutsideIdealTemperature, () => (this.bonus = false));
    }

    private getScoreText() {
        const bonusMultText = this.bonus ? `x${cfg.bonusMultiplier}` : "";
        return `${locals.score}${this.score}${bonusMultText}`;
    }
}
