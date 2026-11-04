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

// help 里展示的命令；彩蛋不列出来
const helpList = ['clear', 'whoami', 'whoareyou', 'log', 'posts', 'post', 'del', 'comments', 'cm'];

const timeOf = (t?: string) => (t ? t.replace('T', ' ').slice(0, 16) : '');

// 把接口异常统一成一行可读文本，别让终端里抛出半截 stack
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

    // 拉一遍主页帖子流
    posts: async () => {
        try {
            const res = await request.get<{ list: Post[]; total: number }>('/post/all?page=1&size=20');
            if (res.code !== 200) return { output: res.msg };
            const list = res.data.list;
            if (list.length === 0) return { output: '还没有帖子' };
            return {
                output: `共 ${res.data.total} 条：\n` + list
                    .map(p => `#${p.id}  ${p.title}  (u${p.userId} ${timeOf(p.createTime)})`)
                    .join('\n'),
                refresh: true,
            };
        } catch (err) { return fail(err); }
    },

    // post 标题|正文
    post: async (_ctx, args) => {
        const raw = args.join(' ');
        if (!raw) return { output: '用法：post 标题|正文' };
        const [title, content = ''] = raw.split('|');
        try {
            const res = await request.post<number>('/post/create', { title: title.trim(), content: content.trim(), status: 1 });
            return res.code === 200
                ? { output: `发布成功 #${res.data}`, refresh: true }
                : { output: res.msg };
        } catch (err) { return fail(err); }
    },

    // del 帖子id
    del: async (_ctx, args) => {
        const id = args[0];
        if (!id || isNaN(Number(id))) return { output: '用法：del 帖子id' };
        try {
            const res = await request.del(`/post/${id}`);
            return res.code === 200
                ? { output: `已删除 #${id}`, refresh: true }
                : { output: res.msg };
        } catch (err) { return fail(err); }
    },

    // comments 帖子id —— 看某帖的评论
    comments: async (_ctx, args) => {
        const id = args[0];
        if (!id || isNaN(Number(id))) return { output: '用法：comments 帖子id' };
        try {
            const res = await request.get<{ list: { userId: number; content: string; createTime: string }[]; total: number }>(
                `/comment/list?postId=${id}&page=1&size=20`);
            if (res.code !== 200) return { output: res.msg };
            if (res.data.list.length === 0) return { output: `#${id} 还没有评论` };
            return {
                output: `#${id} 共 ${res.data.total} 条评论：\n` + res.data.list
                    .map(c => `u${c.userId}: ${c.content}`).join('\n'),
            };
        } catch (err) { return fail(err); }
    },

    // cm 帖子id|内容 —— 发评论
    cm: async (_ctx, args) => {
        const raw = args.join(' ');
        if (!raw.includes('|')) return { output: '用法：cm 帖子id|内容' };
        const [id, content] = raw.split('|');
        if (!id || isNaN(Number(id)) || !content) return { output: '用法：cm 帖子id|内容' };
        try {
            const res = await request.post<number>('/comment/create', { postId: Number(id), content: content.trim() });
            return res.code === 200
                ? { output: `评论成功 #${res.data}` }
                : { output: res.msg };
        } catch (err) { return fail(err); }
    },
};

export async function runCommand(input: string, ctx: CommandCtx): Promise<CommandResult> {
    const [name, ...args] = input.split(/\s+/);
    if (!name) return { output: '' };
    // 命令名统一小写，用户敲 Posts 也能认
    const handler = commands[name.toLowerCase()];
    return handler ? await handler(ctx, args) : { output: `command not found: ${name}` };
}
