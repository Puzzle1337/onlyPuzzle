//人类寻找意义，而世界沉默不语。
//puzzle
import { useEffect, useState } from 'react';
import request from '../utils/request';

interface PostItem {
    id: number;
    userId: number;
    title: string;
    content: string;
    createTime: string;
}

export default function BlogHome() {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const res = await request.get<{ list: PostItem[]; total: number }>('/post/all?page=1&size=30');
            if (res.code === 200) {
                setPosts(res.data.list);
                setTotal(res.data.total);
            } else {
                setError(res.msg);
            }
        } catch (e) {
            setError('加载失败：' + (e as Error).message);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="blog-home">
            <h2 className="blog-title">全部帖子 <span className="blog-total">（{total}）</span></h2>
            {error && <p className="blog-error">{error}</p>}
            {posts.length === 0 && !error ? (
                <p className="blog-empty">还没有帖子</p>
            ) : (
                <ul className="blog-list">
                    {posts.map(p => (
                        <li key={p.id} className="blog-item">
                            <span className="blog-id">#{p.id}</span>
                            <span className="blog-head">{p.title}</span>
                            <span className="blog-meta">
                                u{p.userId} · {p.createTime?.replace('T', ' ').slice(0, 16)}
                            </span>
                            <p className="blog-preview">{p.content?.slice(0, 80)}{p.content?.length > 80 ? '…' : ''}</p>
                        </li>
                    ))}
                </ul>
            )}
            <button className="blog-refresh" onClick={load}>刷新</button>
        </div>
    );
}
