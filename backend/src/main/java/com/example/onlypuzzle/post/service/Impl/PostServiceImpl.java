//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.service.Impl;

import com.example.onlypuzzle.post.mapper.CommentMapper;
import com.example.onlypuzzle.post.mapper.PostMapper;
import com.example.onlypuzzle.post.model.Post;
import com.example.onlypuzzle.post.service.PostService;
import com.example.onlypuzzle.system.exception.ExceptionClass;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    // final + 构造器注入：不可变、循环依赖早发现、单元测试好 mock
    private final PostMapper postMapper;
    private final CommentMapper commentMapper;

    public PostServiceImpl(PostMapper postMapper, CommentMapper commentMapper) {
        this.postMapper = postMapper;
        this.commentMapper = commentMapper;
    }

    @Override
    public List<Post> listByUser(Long userId, Byte status, int page, int size) {
        // 前端 page 从 1 开始，MySQL LIMIT offset 从 0 开始，这里做换算
        int offset = (page - 1) * size;
        return postMapper.selectByUserId(userId, status, offset, size);
    }

    @Override
    public int countByUser(Long userId, Byte status) {
        return postMapper.countByUserId(userId, status);
    }

    @Override
    public List<Post> listAll(int page, int size) {
        int offset = (page - 1) * size;
        return postMapper.selectAll(offset, size);
    }

    @Override
    public int countAll() {
        return postMapper.countAll();
    }

    /**
     * 发帖：只有一条 INSERT，天然原子，不需要 @Transactional。
     * 加了也不会错，但别养成"每个方法都加事务"的习惯 —— 事务会占用数据库连接、
     * 延长锁持有时间，能不加就不加。
     */
    @Override
    public Long createPost(Post post) {
        postMapper.insert(post);
        return post.getId();   // useGeneratedKeys 已把自增主键回填进来
    }

    /**
     * 删帖：先删评论、再删帖子。两条 DELETE 必须同一个事务，
     * 否则删完评论、删帖子失败时，评论就永久丢了（数据不一致）。
     *
     * rollbackFor = Exception.class：默认只回滚 RuntimeException，
     * 加上它让受检异常也回滚（等以后真的抛出 IOException 时不会踩坑）。
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePost(Long postId, Long currentUserId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new ExceptionClass(404, "帖子不存在");
        }
        // 只能删自己的帖子（越权校验必须放在 Service，别只靠前端）
        if (!post.getUserId().equals(currentUserId)) {
            throw new ExceptionClass(403, "无权删除他人的帖子");
        }

        commentMapper.deleteByPostId(postId);
        postMapper.deleteById(postId);
    }
}
