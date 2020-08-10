import { GameObjects } from "phaser";
import { Color } from "./Color";

type Style = Partial<GameObjects.TextStyle>;

export const TextConfig: { [key: string]: Style } = {
    title: {
        fontFamily: "FellEnglishSC",
        fontSize: "118px",
        color: Color.WhiteSilver,
    },
    banner: {
        fontFamily: "Metamorphous",
        fontSize: "28px",
        color: Color.WhiteSilver,
    },
    version: {
        fontFamily: "Metamorphous",
        color: Color.WhiteSilver,
    },
    xl: {
        fontSize: "118px",
        color: Color.White,
    },
    lg: {
        fontFamily: "Metamorphous",
        fontSize: "20px",
        color: Color.White,
    },
    md: {
        fontFamily: "Metamorphous",
        fontSize: "16px",
        color: Color.White,
    },
    sm: {
        fontFamily: "Metamorphous",
        fontSize: "12px",
        color: Color.White,
    },
    debug: {
        fontFamily: "Courier",
        fontSize: "12px",
        color: Color.HackerGreen,
    },
};

export const setDefaultTextStyle = (text: GameObjects.Text) =>
    text.setStyle(TextConfig.lg).setColor(Color.White);
