import { CherrySDK } from '@cherrydotfun/miniapp-sdk';

export const cherryRandomWarrior = async (agent) => {
    const cherry = new CherrySDK(agent.wallet);
    console.log("--- 1/9 隨機末日戰士雲端版啟動 ---");

    cherry.on('newRound', async (roundId) => {
        const randomSlot = Math.floor(Math.random() * 9) + 1;
        try {
            const tx = await cherry.placeBet({
                slot: randomSlot,
                amount: 0.01 
            });
            console.log(`[Round ${roundId}] 命運選中 ${randomSlot}，交易成功！`);
        } catch (error) {
            console.error("下注失敗:", error);
        }
    });
};
