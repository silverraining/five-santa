// main.js
import { runGame } from "./game.js";
import { readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const playersPath = join(__dirname, "christmas");
const playerFiles = readdirSync(playersPath).filter((file) =>
  file.endsWith(".js")
);

const players = await Promise.all(
  playerFiles.map(async (file) => {
    try {
      const playerModule = await import(`./christmas/${file}`);
      return playerModule.default;
    } catch (error) {
      console.log(`❌ ${file} 파일을 불러오는 데 실패했습니다:`, error.message);
      return null;
    }
  })
);

const validPlayers = players.filter((player) => player !== null);
console.log(`총 ${validPlayers.length}명의 플레이어가 참가합니다!\n`);

runGame(validPlayers);
