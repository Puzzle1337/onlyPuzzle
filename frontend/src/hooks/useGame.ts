//人类寻找意义，而世界沉默不语。
//puzzle
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    type GameState,
    type StateStats,
    createInitialState,
    aggregate,
    UPGRADES,
    upgradeCost,
    SECONDS_PER_DAY,
    TOTAL_DAYS,
    STATE_NEIGHBORS,
    STATE_PROFILE,
    checkEvents,
    checkGameOver,
} from '../data/gameState';
import type { Faction } from './factions';

// 每 tick 推进若干天，每秒 tick 60 次
const TICK_INTERVAL = 1000 / 60;

export function useGame(faction: Faction | null) {
    const [state, setState] = useState<GameState | null>(null);
    const stateRef = useRef<GameState | null>(null);

    // 新触发的事件（供 UI 弹窗）
    const [pendingEvents, setPendingEvents] = useState<string[]>([]);

    useEffect(() => {
        if (faction) {
            const s = createInitialState(faction.id, faction.initialStates);
            setState(s);
            stateRef.current = s;
        } else {
            setState(null);
            stateRef.current = null;
        }
    }, [faction]);

    // 游戏循环
    useEffect(() => {
        if (!state) return;
        const id = setInterval(() => {
            setState(prev => {
                if (!prev || prev.paused || prev.gameOver) return prev;

                const daysPerTick = (TICK_INTERVAL / 1000) * prev.speed / SECONDS_PER_DAY;
                const newDay = Math.min(prev.day + daysPerTick, TOTAL_DAYS);

                const prestigeBoost = 1 + prev.upgrades.prestige * 0.25;
                const supportBoost = 1 + prev.upgrades.support * 0.12;
                const trustBoost = 1 + prev.upgrades.trust * 0.10;

                // 先拷贝所有州
                const newStates: Record<string, StateStats> = {};
                for (const fips in prev.states) {
                    newStates[fips] = { ...prev.states[fips] };
                }

                // 计算全局信任度（用于衰减和调查度）
                const agg = aggregate(prev);
                const trustFactor = agg.trust / 100; // 0~1

                // 1) 控制州的自然增长 + 摇摆衰减
                for (const fips in newStates) {
                    const s = newStates[fips];
                    const owned = s.support >= 51;

                    if (owned) {
                        // 控制州：声望和支持度缓慢增长
                        s.prestige = Math.min(100, s.prestige + 0.04 * prestigeBoost * daysPerTick);
                        s.support = Math.min(100, s.support + 0.03 * supportBoost * daysPerTick);
                        s.trust = Math.min(100, s.trust + 0.02 * trustBoost * daysPerTick);
                    } else {
                        // 中立州：声望自然小幅增长（舆论渗透）
                        s.prestige = Math.min(100, s.prestige + 0.01 * prestigeBoost * daysPerTick);
                    }

                    // 摇摆衰减：信任度越低，支持度流失越快
                    // trustFactor=1 → 无衰减；trustFactor=0 → 最大衰减
                    // 注意 clamp 到 0，避免信任度满级后出现"反向衰减"导致支持度自动上涨
                    const decayMult = Math.max(0, 1 - trustFactor * trustBoost);
                    const decay = 0.025 * decayMult * daysPerTick;
                    s.support = Math.max(0, s.support - decay);
                }

                // 2) 邻接辐射：控制州向接壤州扩散支持度
                // 每天加该控制州支持度的 0.1%（受声望等级加成）
                const radiationRate = 0.001 * prestigeBoost;
                for (const fips in newStates) {
                    const src = newStates[fips];
                    if (src.support < 51) continue;
                    const neighbors = STATE_NEIGHBORS[fips] ?? [];
                    const gain = src.support * radiationRate * daysPerTick;
                    for (const nf of neighbors) {
                        const tgt = newStates[nf];
                        if (tgt) tgt.support = Math.min(100, tgt.support + gain);
                    }
                }

                // 3) 资金产出（单位：十亿 B）
                // 每州每天 = (人口/10) × (支持度/100) × 0.09 × 支持等级加成
                // 例：得州(pop 29.1, support 55%) ≈ 0.144B/天
                let dailyFunds = 0;
                for (const fips in newStates) {
                    const s = newStates[fips];
                    if (s.support >= 51) {
                        const pop = STATE_PROFILE[fips]?.pop ?? 1;
                        dailyFunds += (pop / 10) * (s.support / 100) * 0.09 * supportBoost;
                    }
                }
                // 寡头月金：每完成一个寡头节点，每天 +0.04B（约每月 +1.2B）
                const oligarchCount = prev.completedDecisions.filter(id => id.startsWith('s_o')).length;
                dailyFunds += oligarchCount * 0.04;

                // 4) AI 调查度增长（第 100 天后开始）
                let investigation = prev.investigation;
                if (prev.day >= 100) {
                    const ownedCount = Object.values(newStates).filter(s => s.support >= 51).length;
                    const baseGrowth = 0.015;
                    const statePressure = ownedCount * 0.003;
                    const prestigePressure = prev.upgrades.prestige * 0.008;
                    const oligarchPressure = oligarchCount * 0.04;
                    // 信任度抑制调查度增长
                    const trustSuppression = 1 - trustFactor * 0.7;
                    investigation = Math.min(100,
                        investigation + (baseGrowth + statePressure + prestigePressure + oligarchPressure)
                            * trustSuppression * daysPerTick);
                }

                const next: GameState = {
                    ...prev,
                    day: newDay,
                    states: newStates,
                    funds: Math.round((prev.funds + dailyFunds * daysPerTick) * 100) / 100,
                    investigation: Math.round(investigation * 100) / 100,
                };

                // 5) 胜负判定
                const over = checkGameOver(next);
                if (over) next.gameOver = over;

                return next;
            });
        }, TICK_INTERVAL);

        return () => clearInterval(id);
    }, [state]);

    // 事件检测：每天整数天检查一次
    useEffect(() => {
        if (!state) return;
        const dayFloor = Math.floor(state.day);
        const events = checkEvents(state);
        if (events.length > 0) {
            // 标记已触发
            setState(prev => {
                if (!prev) return prev;
                const newly = events.filter(e => !prev.triggeredEvents.includes(e.id));
                if (newly.length === 0) return prev;
                const updated = { ...prev };
                for (const ev of newly) {
                    updated.triggeredEvents = [...updated.triggeredEvents, ev.id];
                    if (ev.effects) {
                        const patch = ev.effects(updated);
                        Object.assign(updated, patch);
                    }
                }
                return updated;
            });
            setPendingEvents(prev => [...prev, ...events.map(e => e.id)]);
        }
    }, [state?.day ? Math.floor(state.day) : 0]); // eslint-disable-line react-hooks/exhaustive-deps

    // 同步 ref
    useEffect(() => { stateRef.current = state; }, [state]);

    const togglePause = useCallback(() => {
        setState(prev => prev ? { ...prev, paused: !prev.paused } : prev);
    }, []);

    const setSpeed = useCallback((s: 1 | 2 | 4) => {
        setState(prev => prev ? { ...prev, speed: s } : prev);
    }, []);

    const spendFunds = useCallback((amount: number): boolean => {
        const current = stateRef.current;
        if (!current || current.funds < amount) return false;
        setState(prev => {
            if (!prev || prev.funds < amount) return prev;
            return {
                ...prev,
                funds: Math.round((prev.funds - amount) * 100) / 100,
            };
        });
        return true;
    }, []);

    // 决策完成：给全州加某项属性，并记录完成的决策
    const applyDecisionEffect = useCallback((nodeId: string, stat: 'prestige' | 'support' | 'trust', amount: number) => {
        setState(prev => {
            if (!prev) return prev;
            const newStates: Record<string, StateStats> = {};
            for (const fips in prev.states) {
                const s = prev.states[fips];
                newStates[fips] = {
                    ...s,
                    [stat]: Math.min(100, s[stat] + amount),
                };
            }
            return {
                ...prev,
                states: newStates,
                completedDecisions: prev.completedDecisions.includes(nodeId)
                    ? prev.completedDecisions
                    : [...prev.completedDecisions, nodeId],
            };
        });
    }, []);

    const upgrade = useCallback((key: 'prestige' | 'support' | 'trust') => {
        setState(prev => {
            if (!prev) return prev;
            const cfg = UPGRADES.find(u => u.key === key)!;
            const level = prev.upgrades[key];
            if (level >= cfg.maxLevel) return prev;
            const cost = upgradeCost(cfg, level);
            if (prev.funds < cost) return prev;
            return {
                ...prev,
                funds: Math.round((prev.funds - cost) * 100) / 100,
                upgrades: { ...prev.upgrades, [key]: level + 1 },
            };
        });
    }, []);

    const dismissEvent = useCallback((eventId: string) => {
        setPendingEvents(prev => prev.filter(id => id !== eventId));
    }, []);

    const agg = state ? aggregate(state) : null;

    return {
        state, agg, togglePause, setSpeed, upgrade,
        spendFunds, applyDecisionEffect,
        pendingEvents, dismissEvent,
    };
}
