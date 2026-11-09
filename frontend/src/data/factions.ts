//人类寻找意义，而世界沉默不语。
//puzzle
// 派系数据模型 + 初始派系数据
// 改派系：只动这里，组件不碰

import elonAvatar from '../static/human/ElonMask.png';
import vansAvatar from '../static/human/Vans.png';

export interface Faction {
    id: string;            // 唯一键，路由用
    name: string;          // 派系全称
    short: string;         // 缩写/代号
    leader: string;        // 领袖名
    avatar: string;        // 头像图片路径
    color: string;         // 主题色
    initialStates: string[]; // 初始控制州 FIPS
    tagline: string;       // 一句话标语
    description: string;   // 详细介绍（hover 1s 显示）
}

export const FACTIONS: Faction[] = [
    {
        id: 'musk',
        name: '美国党',
        short: 'USA',
        leader: '伊隆·马斯克',
        avatar: elonAvatar,
        color: '#e04a3a',
        initialStates: ['48'],
        tagline: '不惜一切代价，重建美国',
        description:
            '2026 中选，他在德州砸了超过 2 亿美元支持共和党，结果民主党大获全胜，这被媒体称为马斯克"最大的政治失败"。\n' +
            '得州是他的商业基地，也是他政治投资最重、输得最惨的地方。起初被特朗普挤出政府，再咽下这次失败的滑铁卢，马斯克决心开辟他自己的派系。\n' +
            '失败是成功之母，但马斯克已经有一个母亲了，不需要第二个。',
    },
    {
        id: 'republican',
        name: '共和党',
        short: 'GOP',
        leader: '万斯 / MAGA 路线',
        avatar: vansAvatar,
        color: '#c0392b',
        initialStates: ['39', '12'],
        tagline: '让美国再次伟大',
        description:
            '万斯是俄亥俄州出身的参议员，俄亥俄是他的老家——尽管中选共和党在俄州惨败。\n' +
            '佛罗里达是共和党少数守住的地盘，Byron Donalds 拿下州长，算是给党留了一块能喘气的地方。艾奥瓦和南卡虽然参议院席位被民主党翻掉，但农村白人保守派的基础还在，MAGA 的动员土壤没有消失。\n' +
            '问题是：土壤还在，种子归谁？鲁比奥想改道，特朗普在白宫跛着脚还不肯交权……万斯该如何保持平衡？',
    },
];
