// game.js
export function runGame(players) {
  console.log("=== 🎅 산타 잡기 게임 시작! ===\n");
  const scores = {};
  const promises = [];
  let gameEnded = false;

  players.forEach((player) => {
    const code = player.play.toString();

    // 1. 코드 길이 체크
    if (code.length > 300) {
      console.log(`⛔ ${player.name}: 코드가 300자를 초과! (${code.length}자)`);
      scores[player.name] = -1;
      return;
    }

    // 2. 숫자 제한 체크
    const numbers = code.match(/\d+/g) || [];
    for (const num of numbers) {
      if (parseInt(num) >= 1000) {
        console.log(`⛔ ${player.name}: 1000 이상의 숫자 사용!`);
        scores[player.name] = -1;
        return;
      }
    }

    // 3. 금지된 키워드 체크
    const forbiddenKeywords = [
      "while",
      "eval",
      "function",
      "Function",
      "import",
      "require",
      "Promise.all",
      "Promise.race",
      "Promise.any",
      "map",
      "reduce",
      "filter",
    ];

    // 추가: setTimeout/setInterval 사용 횟수 및 시간 체크
    // setTimeout과 setInterval 각각 체크
    const setTimeoutCount = (code.match(/setTimeout/g) || []).length;
    const setIntervalCount = (code.match(/setInterval/g) || []).length;

    if (setTimeoutCount > 1) {
      console.log(`⛔ ${player.name}: setTimeout을 2번 이상 사용!`);
      scores[player.name] = -1;
      return;
    }

    if (setIntervalCount > 1) {
      console.log(`⛔ ${player.name}: setInterval을 2번 이상 사용!`);
      scores[player.name] = -1;
      return;
    }

    // 타이머 시간 체크
    const timerMatches = code.match(
      /set(Timeout|Interval)\s*\(\s*[^,]*,\s*(\d+)/g
    );
    if (timerMatches) {
      for (const match of timerMatches) {
        const time = parseInt(match.match(/\d+$/)[0]);
        if (time < 500) {
          console.log(`⛔ ${player.name}: 타이머 시간이 500ms 미만!`);
          scores[player.name] = -1;
          return;
        }
      }
    }

    for (const keyword of forbiddenKeywords) {
      if (code.includes(keyword)) {
        console.log(`⛔ ${player.name}: 금지된 키워드(${keyword}) 사용!`);
        scores[player.name] = -1;
        return;
      }
    }

    // 4. for문 체크 - 중첩된 for문만 체크
    const functionBody = code.match(/{([^}]*)}/)?.[1] || "";

    // 중첩 for문 체크
    const hasNestedLoop = /for\s*\([^{]*\{[^}]*for\s*\(/.test(functionBody);

    if (hasNestedLoop) {
      console.log(`⛔ ${player.name}: 중첩 for문 사용!`);
      scores[player.name] = -1;
      return;
    }

    // 5. 각 for문의 반복 횟수 제한
    const forLoops = code.match(/for\s*\([^)]*\)/g) || [];
    for (const forLoop of forLoops) {
      const numbers = forLoop.match(/\d+/g) || [];
      for (const num of numbers) {
        if (parseInt(num) > 100) {
          console.log(`⛔ ${player.name}: for문 100회 초과!`);
          scores[player.name] = -1;
          return;
        }
      }
    }

    // 6. 메서드 체이닝 제한
    if ((code.match(/\./g) || []).length > 5) {
      console.log(`⛔ ${player.name}: 메서드 체이닝 과다 사용!`);
      scores[player.name] = -1;
      return;
    }

    scores[player.name] = 0;
  });

  const validPlayers = players.filter((player) => scores[player.name] !== -1);
  validPlayers.forEach((player) => {
    const promise = new Promise(async (resolve) => {
      try {
        await player.play(async () => {
          if (gameEnded) return;

          // 1% 확률로 잭팟
          if (Math.random() < 0.01 && Math.random() < 0.3) {
            const jackpot = Math.floor(Math.random() * 301) + 100;
            scores[player.name] += jackpot;
            console.log(
              `🎊 잭팟! ${player.name}이(가) 산타 ${jackpot}마리를 한번에 잡았다! 🎊`
            );
            return;
          }

          const caughtCount = Math.floor(Math.random() * 3) + 1;
          scores[player.name] += caughtCount;
        });
      } catch (error) {
        console.log(`❌ ${player.name}: 에러 발생! (${error.message})`);
        scores[player.name] = -1;
      } finally {
        resolve();
      }
    });
    promises.push(promise);
  });

  // 5초 후에 게임 종료
  setTimeout(() => {
    gameEnded = true;

    console.log("\n=== 🎄 최종 결과 🎄 ===");
    const validResults = Object.entries(scores)
      .filter(([, score]) => score !== -1)
      .sort(([, a], [, b]) => b - a);

    validResults.forEach(([name, score], index) => {
      const rank = index + 1;
      const medal =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "  ";
      console.log(`${medal} ${rank}등: ${name} (산타 ${score}마리 잡음!)`);
    });

    // 실격자들
    const disqualified = Object.entries(scores)
      .filter(([, score]) => score === -1)
      .map(([name]) => name);

    if (disqualified.length > 0) {
      console.log("\n=== ⛔ 실격자 명단 ===");
      disqualified.forEach((name) => {
        console.log(`${name}`);
      });
    }
    process.exit(0);
  }, 5000);
}
