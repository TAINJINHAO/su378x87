const { CherrySDK } = require('@cherry-fun/sdk');

// 配置參數 (對應你 v6.9 的設定)
const CONFIG = {
    prefix: "3hk",        // 你的地址前綴
    atkGap: 3000,         // 進攻門檻
    funGap: 4500,         // 娛樂門檻
    betAmount: 0.01       // 每次下注金額
};

async function getLeaderboardStatus() {
    try {
        const response = await fetch("https://sol-miner.cherry.fun/api/leaderboard");
        const data = await response.json();
        const list = data.leaderboard || [];
        
        if (list.length >= 2) {
            const r1 = list[0];
            const isMe = r1.wallet.toLowerCase().startsWith(CONFIG.prefix.toLowerCase());
            const diff = Number(BigInt(r1.points) - BigInt(list[1].points));

            if (!isMe || diff <= CONFIG.atkGap) return "attack";
            if (diff <= CONFIG.funGap) return "fun";
            return "sleep";
        }
    } catch (e) {
        return "attack"; // 異常時預設進攻確保排名
    }
    return "attack";
}

async function main() {
    const cherry = new CherrySDK();
    console.log("🚀 追分模式 v6.9 (雲端版) 啟動");

    while (true) {
        const mode = await getLeaderboardStatus();
        console.log(`📊 當前策略模式: ${mode}`);

        if (mode === "sleep") {
            await new Promise(r => setTimeout(r, 30000)); // 休息 30 秒
            continue;
        }

        if (mode === "attack") {
            // 進攻模式：隨機分散下注 6-8 組 (模擬 v6.9 邏輯)
            const groupCount = Math.floor(Math.random() * 3) + 6;
            for (let i = 0; i < groupCount; i++) {
                const target = Math.floor(Math.random() * 9);
                await cherry.bet(target, CONFIG.betAmount);
                await new Promise(r => setTimeout(r, 2000));
            }
        } else if (mode === "fun") {
            // 娛樂模式：單點下注
            const target = Math.floor(Math.random() * 9);
            await cherry.bet(target, CONFIG.betAmount);
        }

        // 等待下一輪 (約 25-30 秒)
        await new Promise(r => setTimeout(r, 25000));
    }
}

main();
