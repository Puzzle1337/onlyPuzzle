//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.service;

import com.example.onlypuzzle.post.model.Post;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Set;

/**
 * 帖子列表缓存。
 *
 * 采用 Cache-Aside（旁路缓存）模式，这是最常见也最好讲的一种：
 *   读：先查 Redis，命中直接返回；没命中查 MySQL，再回写 Redis。
 *   写：先改 MySQL，再删 Redis（注意是"删"不是"更新"）。
 *
 * 为什么写操作删缓存而不是更新缓存？
 *   1. 更新缓存要处理序列化、并发更新顺序、缓存里可能存的是多字段拼接值；
 *   2. 删缓存更简单，下次读自然回源重建，天然避免"两个请求同时写缓存导致脏数据"。
 *   代价是删完之后第一次读会 miss，多一次 DB 查询 —— 这个代价可以接受。
 */
@Service
public class PostCacheService {

    /** 统一 TTL，5 分钟。太长会导致数据陈旧，太短缓存基本没意义 */
    private static final Duration TTL = Duration.ofMinutes(5);

    /** key 前缀：post:list:u:{userId}:... */
    private static final String USER_LIST_PREFIX = "post:list:u:";

    private final RedisTemplate<String, Object> redisTemplate;

    public PostCacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 读缓存。返回 null 表示未命中，调用方应该回源查库。
     */
    @SuppressWarnings("unchecked")
    public List<Post> getList(Long userId, Byte status, int page, int size) {
        Object value = redisTemplate.opsForValue().get(listKey(userId, status, page, size));
        return value == null ? null : (List<Post>) value;
    }

    /**
     * 回写缓存。注意空列表也要缓存（后面做"缓存穿透"时这就是第一道防线）。
     */
    public void putList(Long userId, Byte status, int page, int size, List<Post> list) {
        redisTemplate.opsForValue().set(listKey(userId, status, page, size), list, TTL);
    }

    /**
     * 删掉某个用户的所有列表缓存。
     *
     * 用户发帖/删帖后，他每一页的缓存都可能是旧的，所以按前缀整体失效。
     *
     * ⚠️ 这里用 KEYS 只是教学项目方便。生产环境千万别用 KEYS ——
     * 它是 O(N) 且会阻塞 Redis 主线程，几百万 key 时会直接把实例卡死。
     * 生产做法是 SCAN 游标遍历，或者用版本号 key（post:ver:u:{userId} 自增，
     * 把版本号拼进缓存 key，查库时比对版本号，旧的自动过期）。
     */
    public void evictUserLists(Long userId) {
        Set<String> keys = redisTemplate.keys(USER_LIST_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    /**
     * 缓存 key 的设计要点：把决定返回结果的所有参数都拼进去，
     * 少拼一个就会导致"翻到第 2 页却拿到第 1 页数据"。
     * status 可能为 null，用 "all" 占位，避免出现 "s:null" 这种歧义 key。
     */
    private String listKey(Long userId, Byte status, int page, int size) {
        String statusPart = status == null ? "all" : String.valueOf(status);
        return USER_LIST_PREFIX + userId + ":s:" + statusPart + ":p:" + page + ":z:" + size;
    }
}
