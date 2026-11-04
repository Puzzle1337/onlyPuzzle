// 终端命令表：命令是数据，不是控制流。加一条命令 = 在对象里加一行。
import request from '../utils/request';
export type CommandCtx = { username: string };
export type CommandResult = { output: string; clear?: boolean; refresh?: boolean };
type Handler = (ctx: CommandCtx, args: string[]) => CommandResult | Promise<CommandResult>;
export interface Post {
    id: number;
    userId: number;
    title: string;
    content: string;
    status: number;
    createTime: string;
}
const helpList = ['clear', 'whoami', 'whoareyou', 'log', 'posts', 'comments'];
const timeOf = (t?: string) => (t ? t.replace('T', ' ').slice(0, 16) : '');
const fail = (err: unknown) => ({ output: '请求失败：' + (err as Error).message });

const commands: Record<string, Handler> = {
    help: () => ({
        output: helpList.map((name, i) => `${i + 1}.${name}`).join('\n'),
    }),
    '1115': () => ({ output: 'thank you my buddy...' }),
    '2004': () => ({ output: 'i Love 2004...Cause I born in 2004' }),
    anwser: () => ({ output: '4_2....42' }),
    whoami: ctx => ({ output: ctx.username }),
    whoareyou: () => ({ output: 'i am Puzzle, a AI Agent created by Puzzle' }),
    log: () => ({
        output: '2026-10-29 update by Zhang. All rights reserved.'
            + '\tI dont know how to say it'
            + '\nBut I think we need to think about and seriously consider the meaning of life.'
            + '\nWhat is the meaning of life? Make more money? Buy a big house? Marry a good person?.'
            + '\nNo ,I dont think so.' + '\nBut I know you can find it. ',
    }),
    fuck: () => ({ output: 'fuck you too' }),
    clear: () => ({ output: '', clear: true }),
};
export async function runCommand(input: string, ctx: CommandCtx): Promise<CommandResult> {
    const [name, ...args] = input.split(/\s+/);
    if (!name) return { output: '' };
    // 命令名统一小写，用户敲 Posts 也能认
    const handler = commands[name.toLowerCase()];
    return handler ? await handler(ctx, args) : { output: `command not found: ${name}` };
}
