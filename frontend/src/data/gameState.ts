//人类寻找意义，而世界沉默不语。
//puzzle
// MAGA 游戏核心数据模型

// ========== 单个州的属性 ==========
export interface StateStats {
    fips: string;
    prestige: number;    // 声望力 0~100
    support: number;     // 支持度 0~100 （= 该州选票比例）
    trust: number;       // 民众信任度 0~100
    owner: string | null; // 控制派系 id，null = 中立
}

// ========== 支持度决策分支 ==========
export type SupportBranch = 'lower' | 'middle' | 'oligarch';

// ========== 全局游戏状态 ==========
export interface GameState {
    day: number;          // 当前天数 0~730
    funds: number;        // 资金
    paused: boolean;
    speed: 1 | 2 | 4;     // 倍速
    states: Record<string, StateStats>;  // key = FIPS
    upgrades: {
        prestige: number;   // 声望力等级
        support: number;    // 支持度等级
        trust: number;      // 信任度等级
    };
    factionId: string;     // 当前派系
    investigation: number; // 调查度 0~100，到 100 游戏结束
    triggeredEvents: string[]; // 已触发的事件 id
    completedDecisions: string[]; // 已完成的决策节点 id
    gameOver: null | { type: 'win' | 'lose'; reason: string };
}

// ========== 升级配置（单位：十亿美元 B） ==========
export interface UpgradeConfig {
    key: 'prestige' | 'support' | 'trust';
    label: string;
    desc: string;
    baseCost: number;
    costMul: number;
    maxLevel: number;
    effect: string;
}

export const UPGRADES: UpgradeConfig[] = [
    {
        key: 'prestige',
        label: '声望力',
        desc: '加快理念在邻州的辐射扩散速度',
        baseCost: 1.0,
        costMul: 1.25,
        maxLevel: 8,
        effect: '+25% 辐射速度/级',
    },
    {
        key: 'support',
        label: '支持度',
        desc: '巩固选民基础，提升资金产出',
        baseCost: 1.2,
        costMul: 1.30,
        maxLevel: 8,
        effect: '+15% 资金产出/级',
    },
    {
        key: 'trust',
        label: '民众信任度',
        desc: '降低摇摆概率，减缓选票流失',
        baseCost: 1.0,
        costMul: 1.28,
        maxLevel: 8,
        effect: '+10% 信任稳固/级',
    },
];

export function upgradeCost(cfg: UpgradeConfig, level: number): number {
    return Math.round(cfg.baseCost * Math.pow(cfg.costMul, level) * 100) / 100;
}

// 资金格式化：内部数值即"十亿 B"，显示保留一位小数
export function formatFunds(v: number): string {
    if (v >= 1000) return (v / 1000).toFixed(1) + 'T';
    return v.toFixed(1) + 'B';
}

// 总天数（约 2 年）
export const TOTAL_DAYS = 730;
// 全速 1x 时 730 天 ≈ 20 分钟
export const SECONDS_PER_DAY = (20 * 60) / TOTAL_DAYS;

// 胜利阈值
export const WIN_LANDSLIDE = 100; // 大获全胜：全国选票 100%
export const WIN_NORMAL = 60;     // 普通结局：全国选票 ≥ 60%
export const LOSE_INVESTIGATION = 100; // 调查度满 → 游戏结束

// ========== 州邻接表（接壤关系，用于辐射扩散） ==========
export const STATE_NEIGHBORS: Record<string, string[]> = {
    '01': ['05','12','13','21','28','47'],           // AL
    '02': [],                                          // AK
    '04': ['08','32','35','49'],                       // AZ
    '05': ['01','22','28','29','40','47','48'],        // AR
    '06': ['32','41','53'],                            // CA
    '08': ['04','16','20','29','31','32','35','41','49','56'], // CO
    '09': ['25','34','36','44'],                       // CT
    '10': ['24','34','42'],                            // DE
    '11': ['24','51','54'],                            // DC
    '12': ['01','13','28'],                            // FL
    '13': ['01','12','28','34','37','45','47'],        // GA
    '15': [],                                          // HI
    '16': ['08','31','41','49','53','56'],             // ID
    '17': ['15','18','19','20','21','26','27','29','54','55'], // IL
    '18': ['17','19','21','26','39','47'],             // IN
    '19': ['17','18','20','25','27','31','38','39','46','55'], // IA
    '20': ['08','17','19','29','31','38','39','40','46','56'], // KS
    '21': ['01','13','17','18','29','36','39','42','47','51','54'], // KY
    '22': ['05','28','40','48'],                       // LA
    '23': ['25','33','50'],                            // ME
    '24': ['10','11','34','42','51','54'],             // MD
    '25': ['09','23','33','36','44','50'],             // MA
    '26': ['17','18','39','55'],                       // MI
    '27': ['17','19','31','38','46','55'],             // MN
    '28': ['01','05','12','13','22','47','48'],        // MS
    '29': ['05','08','17','19','20','21','31','39','40','46','47','56'], // MO
    '30': ['16','31','38','46','49','56'],             // MT
    '31': ['08','16','19','20','27','29','30','46','49','56'], // NE
    '32': ['04','06','08','35','41'],                  // NV
    '33': ['23','25','50'],                            // NH
    '34': ['09','10','13','24','36','42'],             // NJ
    '35': ['04','08','32','40','48','49'],             // NM
    '36': ['09','14','21','25','34','38','39','42','44','50','51','54'], // NY
    '37': ['13','34','36','42','45','51'],             // NC
    '38': ['19','20','27','30','31','46'],             // ND
    '39': ['17','18','19','20','21','26','28','29','42','47','51','54'], // OH
    '40': ['05','20','22','29','35','48'],             // OK
    '41': ['06','08','16','32','53'],                  // OR
    '42': ['10','14','21','24','33','34','36','37','39','51','54'], // PA
    '44': ['09','25','36'],                            // RI
    '45': ['13','37'],                                 // SC
    '46': ['19','20','27','29','30','31','38'],        // SD
    '47': ['01','05','13','18','21','28','29','39','51','54'], // TN
    '48': ['05','22','28','35','40','56'],             // TX
    '49': ['04','08','16','30','31','32','35','56'],   // UT
    '50': ['23','25','33','36'],                       // VT
    '51': ['11','21','24','33','36','37','39','42','47','54'], // VA
    '53': ['06','16','41'],                            // WA
    '54': ['11','17','21','24','36','39','42','47','51'], // WV
    '55': ['17','19','26','27'],                       // WI
    '56': ['08','20','29','30','31','35','46','48','49'], // WY
};

// ========== 州特征表：人口权重 + 保守倾向 ==========
// pop: 人口（百万，2020 普查近似）  lean: 保守倾向 -3(深蓝) ~ +3(深红)
// 声望/支持度/信任度的初始值按 lean 差异化，选票按 pop 加权
export interface StateProfile {
    pop: number;
    lean: number;
}

export const STATE_PROFILE: Record<string, StateProfile> = {
    '01': { pop: 5.0, lean: 2 },  '02': { pop: 0.73, lean: 1 }, '04': { pop: 7.2, lean: 1 },
    '05': { pop: 3.0, lean: 2 },  '06': { pop: 39.5, lean: -2 }, '08': { pop: 5.8, lean: 0 },
    '09': { pop: 3.6, lean: -1 }, '10': { pop: 1.0, lean: 0 },  '11': { pop: 0.69, lean: -3 },
    '12': { pop: 21.5, lean: 1 }, '13': { pop: 10.7, lean: 1 }, '15': { pop: 1.45, lean: -2 },
    '16': { pop: 1.8, lean: 3 },  '17': { pop: 12.8, lean: -1 }, '18': { pop: 6.8, lean: 2 },
    '19': { pop: 3.2, lean: 2 },  '20': { pop: 2.9, lean: 3 },  '21': { pop: 4.5, lean: 2 },
    '22': { pop: 4.7, lean: 2 },  '23': { pop: 1.36, lean: 0 }, '24': { pop: 6.2, lean: -2 },
    '25': { pop: 7.0, lean: -2 }, '26': { pop: 10.1, lean: 0 }, '27': { pop: 5.7, lean: 0 },
    '28': { pop: 2.96, lean: 2 }, '29': { pop: 6.2, lean: 2 },  '30': { pop: 1.08, lean: 2 },
    '31': { pop: 1.96, lean: 3 }, '32': { pop: 3.1, lean: 0 },  '33': { pop: 1.38, lean: 0 },
    '34': { pop: 9.3, lean: -1 }, '35': { pop: 2.1, lean: -1 }, '36': { pop: 20.2, lean: -2 },
    '37': { pop: 10.4, lean: 1 }, '38': { pop: 0.78, lean: 3 }, '39': { pop: 11.8, lean: 1 },
    '40': { pop: 3.96, lean: 3 }, '41': { pop: 4.2, lean: -1 }, '42': { pop: 13.0, lean: 0 },
    '44': { pop: 1.1, lean: -2 }, '45': { pop: 5.1, lean: 2 },  '46': { pop: 0.89, lean: 3 },
    '47': { pop: 6.9, lean: 2 },  '48': { pop: 29.1, lean: 2 }, '49': { pop: 3.3, lean: 3 },
    '50': { pop: 0.64, lean: -2 }, '51': { pop: 8.6, lean: 0 }, '53': { pop: 7.7, lean: -2 },
    '54': { pop: 1.79, lean: 3 }, '55': { pop: 5.9, lean: 0 },  '56': { pop: 0.58, lean: 3 },
};

// ========== 事件系统 ==========
export interface GameEvent {
    id: string;
    title: string;        // 新闻标题
    image: string;        // 新闻图片（渐变 css 字符串 或 图片 URL）
    body: string;         // 新闻文案
    condition: (s: GameState) => boolean;
    effects?: (s: GameState) => Partial<GameState>; // 可选效果
    oneShot?: boolean;    // 默认 true，只触发一次
}

// 新闻图片用渐变背景代替真实图片
const grad = (c1: string, c2: string) => `linear-gradient(135deg, ${c1}, ${c2})`;

export const EVENTS: GameEvent[] = [
    {
        id: 'ev_start',
        title: '竞选启程',
        image: grad('#1e3a8a', '#3b82f6'),
        body: '你宣布参选总统，媒体争相报道。支持者在街头挥舞旗帜，一场漫长的征途就此开始。',
        condition: s => s.day >= 1,
        oneShot: true,
    },
    {
        id: 'ev_first_state',
        title: '首州告捷',
        image: grad('#065f46', '#10b981'),
        body: '你的第一个州稳稳落入囊中，支持者欢呼雀跃。选情分析师开始重新评估你的胜算。',
        condition: s => Object.values(s.states).filter(st => st.support >= 51).length >= 2,
        oneShot: true,
    },
    {
        id: 'ev_10states',
        title: '十州在手',
        image: grad('#065f46', '#22c55e'),
        body: '你已控制十个州，竞选势头如虹。对手开始感到压力，媒体舆论逐渐向你倾斜。',
        condition: s => Object.values(s.states).filter(st => st.support >= 51).length >= 10,
        oneShot: true,
    },
    {
        id: 'ev_rival_appear',
        title: '劲敌登场',
        image: grad('#7f1d1d', '#ef4444'),
        body: '你的影响力已引起对手阵营注意。一位强势对手宣布参选，并开始在媒体上攻击你。调查机构也开始盯上你。',
        condition: s => s.day >= 100,
        oneShot: true,
    },
    {
        id: 'ev_low_funds',
        title: '资金告急',
        image: grad('#78350f', '#f59e0b'),
        body: '竞选资金即将耗尽。没有钱，广告、人力、差旅一切都将停摆。是时候想办法开源了。',
        condition: s => s.funds < 1,
        oneShot: false,
    },
    {
        id: 'ev_scandal',
        title: '丑闻风波',
        image: grad('#1f2937', '#6b7280'),
        body: '一家小报爆出你的负面新闻，虽然真假难辨，但选民开始动摇。信任度出现下滑。',
        condition: s => s.investigation >= 40 && s.day > 150,
        oneShot: true,
        effects: s => {
            const ns: Record<string, StateStats> = {};
            for (const fips in s.states) {
                const st = s.states[fips];
                ns[fips] = { ...st, trust: Math.max(0, st.trust - 5) };
            }
            return { states: ns };
        },
    },
    {
        id: 'ev_surge',
        title: '民意飙升',
        image: grad('#064e3b', '#34d399'),
        body: '全国支持率突破 40%！你的竞选策略正在奏效，更多州开始倒向你。',
        condition: s => nationalVoteShare(s) >= 40,
        oneShot: true,
    },
    {
        id: 'ev_halfway',
        title: '选战过半',
        image: grad('#1e40af', '#60a5fa'),
        body: '时间已过去一半。你的选情如何？距离大选还有一半时间，一切皆有可能。',
        condition: s => s.day >= TOTAL_DAYS / 2,
        oneShot: true,
    },
    {
        id: 'ev_oligarch_warn',
        title: '寡头警告',
        image: grad('#450a0a', '#dc2626'),
        body: '你与寡头走得太近，底层民众开始质疑你的立场。工会领袖公开批评你"背叛了工人阶级"。',
        condition: s => s.investigation >= 60,
        oneShot: true,
        effects: s => {
            const ns: Record<string, StateStats> = {};
            for (const fips in s.states) {
                const st = s.states[fips];
                ns[fips] = { ...st, trust: Math.max(0, st.trust - 8) };
            }
            return { states: ns };
        },
    },
    {
        id: 'ev_final_50',
        title: '最后冲刺',
        image: grad('#831843', '#ec4899'),
        body: '距离大选只剩不到 50 天。现在每一个决定都可能改变结局。稳住，或者放手一搏。',
        condition: s => s.day >= TOTAL_DAYS - 50,
        oneShot: true,
    },
];

// 初始化全州属性（按州的保守倾向 lean 差异化，不再是统一数值）
export function initStates(factionId: string, initialFips: string[]): Record<string, StateStats> {
    const allFips = Object.keys(STATE_NEIGHBORS);
    const states: Record<string, StateStats> = {};
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    for (const fips of allFips) {
        const owned = initialFips.includes(fips);
        const lean = STATE_PROFILE[fips]?.lean ?? 0;
        states[fips] = {
            fips,
            // 声望：已控制州按倾向小幅波动；中立州差异更大（深红州天生亲和、深蓝州敌视）
            prestige: owned ? clamp(55 + lean * 4) : clamp(20 + lean * 5),
            support: owned ? clamp(55 + lean * 2) : clamp(12 + lean * 3),
            trust: owned ? clamp(50 + lean * 2) : clamp(28 + lean * 3),
            owner: owned ? factionId : null,
        };
    }
    return states;
}

export function createInitialState(factionId: string, initialFips: string[]): GameState {
    return {
        day: 0,
        funds: 8,       // 8B 竞选资金
        paused: false,
        speed: 1,
        states: initStates(factionId, initialFips),
        upgrades: { prestige: 0, support: 0, trust: 0 },
        factionId,
        investigation: 0,
        triggeredEvents: [],
        completedDecisions: [],
        gameOver: null,
    };
}

// 全国选票比例 = 各州支持度按人口加权平均
export function nationalVoteShare(state: GameState): number {
    let weightSum = 0;
    let voteSum = 0;
    for (const fips in state.states) {
        const pop = STATE_PROFILE[fips]?.pop ?? 1;
        weightSum += pop;
        voteSum += state.states[fips].support * pop;
    }
    return Math.round((voteSum / (weightSum || 1)) * 10) / 10;
}

export function aggregate(state: GameState): { prestige: number; support: number; trust: number } {
    const list = Object.values(state.states);
    const n = list.length || 1;
    const sum = list.reduce((acc, s) => {
        acc.prestige += s.prestige;
        acc.support += s.support;
        acc.trust += s.trust;
        return acc;
    }, { prestige: 0, support: 0, trust: 0 });
    return {
        prestige: Math.round(sum.prestige / n),
        support: Math.round(sum.support / n),
        trust: Math.round(sum.trust / n),
    };
}

// 检查并返回应触发的事件（排除已触发的一次性事件）
export function checkEvents(state: GameState): GameEvent[] {
    if (state.gameOver) return [];
    return EVENTS.filter(ev => {
        if (state.triggeredEvents.includes(ev.id)) return false;
        try {
            return ev.condition(state);
        } catch {
            return false;
        }
    });
}

// 胜负判定
export function checkGameOver(state: GameState): { type: 'win' | 'lose'; reason: string } | null {
    if (state.investigation >= LOSE_INVESTIGATION) {
        const deaths = ['被联邦调查局逮捕入狱', '遭遇神秘车祸', '在演讲现场遇刺', '被曝丑闻身败名裂'];
        return { type: 'lose', reason: deaths[Math.floor(Math.random() * deaths.length)] };
    }
    if (state.day >= TOTAL_DAYS) {
        const share = nationalVoteShare(state);
        if (share >= WIN_LANDSLIDE) return { type: 'win', reason: `大获全胜！全国选票 ${share}%，你以压倒性优势当选总统。` };
        if (share >= WIN_NORMAL) return { type: 'win', reason: `胜选！全国选票 ${share}%，你成为新一任总统。` };
        return { type: 'lose', reason: `败选。全国选票仅 ${share}%，未能达到 ${WIN_NORMAL}% 的胜选线。` };
    }
    return null;
}
