import { random } from "lodash";
import { Physics, Scene } from "phaser";
import { StarColor } from "../events/StarColor";
import { Star } from "./Star";

const GLOBAL_MAX_CONCURRENT_ENTITIES_OF_TYPE = 150;

type Group = Physics.Arcade.Group;

const cfg = {
    minXScale: 3 / 12,
};

export class StarSpawner {
    private spawned: Star[] = [];
    private spawnTimers: number[] = [];

    constructor(
        private scene: Scene,
        private group: Group,
        private maxConcurrent: number = 200
    ) {}

    public spawn(n: number) {
        if (this.reachedMaxConcurrent()) {
            return [];
        }
        if (this.reachdGlobalConcurrentEnemyCount()) {
            return [];
        }
        const diffToMax = this.maxConcurrent - this.countActive();
        const newEnemyCount = Math.min(n, diffToMax);
        return Array(newEnemyCount)
            .fill(0)
            .map(() => this.spawnOne());
    }

    public spawnInterval(entitiesPerWave: number, timeout: number) {
        const timer = window.setInterval(() => {
            const entities = this.spawn(entitiesPerWave);
            this.spawned.push(...entities);
            this.group.addMultiple(entities, true);
        }, timeout);
        this.spawnTimers.push(timer);
    }

    public destroy() {
        this.spawnTimers.forEach(timer => clearTimeout(timer));
    }

    private spawnOne() {
        const width = this.scene.scale.width;
        const x = random(Math.ceil(width * cfg.minXScale), width);
        const colors = Object.values(StarColor);
        const randomColor = colors[random(colors.length - 1)];
        return new Star(this.scene, x, -100, randomColor);
    }

    private countActive() {
        return this.spawned.filter(e => e.active).length;
    }

    private reachedMaxConcurrent() {
        return this.countActive() > this.maxConcurrent;
    }

    private reachdGlobalConcurrentEnemyCount() {
        return this.countActive() > GLOBAL_MAX_CONCURRENT_ENTITIES_OF_TYPE;
    }
}
