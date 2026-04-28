const { CherrySDK } = require('@cherry-fun/sdk');

// 配置參數 (對應你 v6.9 的設定)
const CONFIG = {
    prefix: "3hk",        // 你的地址前綴
    atkGap: 3000,         // 進攻門檻
    funGap: 4500,         // 娛樂門檻
    betAmount: 0.001       // 每次下注金額
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
            console.log(`⚔️ 第 #${new Date().getMinutes()} 分鐘戰鬥：打包 9 格下注...`);
            
            // 建立 9 格下注的任務陣列
            // CONFIG.betAmount 是 0.001
            const betPromises = Array.from({ length: 9 }, (_, i) => {
                return cherry.bet(i, CONFIG.betAmount).catch(err => {
                    console.log(`⚠️ 第 ${i+1} 格發送失敗: ${err.message}`);
                });
            });

            // 同時併發送出，確保紀錄留在這一回合
            await Promise.all(betPromises);
            console.log("✅ 本回合 9 格已全數完成打包下注");

        } else if (mode === "fun") {
            // 娛樂模式：維持單點下注
            const target = Math.floor(Math.random() * 9);
            await cherry.bet(target, CONFIG.betAmount);
        }

        // 等待下一輪 (約 25-30 秒)
        await new Promise(r => setTimeout(r, 25000));
    }
}

main();
