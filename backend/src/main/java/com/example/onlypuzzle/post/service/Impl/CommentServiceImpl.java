//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.service.Impl;

import com.example.onlypuzzle.post.mapper.CommentMapper;
import com.example.onlypuzzle.post.mapper.PostMapper;
import com.example.onlypuzzle.post.model.Comment;
import com.example.onlypuzzle.post.model.Post;
import com.example.onlypuzzle.post.service.CommentService;
import com.example.onlypuzzle.system.exception.ExceptionClass;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final PostMapper postMapper;

    public CommentServiceImpl(CommentMapper commentMapper, PostMapper postMapper) {
        this.commentMapper = commentMapper;
        this.postMapper = postMapper;
    }

    /**
     * 发评论：一条 INSERT，不需要事务。
     * 但必须先确认帖子存在 —— 否则只能等数据库外键报错，
     * 前端拿到的是 500 而不是可读的"帖子不存在"。
     */
    @Override
    public Long createComment(Comment comment, Long currentUserId) {
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new ExceptionClass(400, "评论内容不能为空");
        }
        Post post = postMapper.selectById(comment.getPostId());
        if (post == null) {
            throw new ExceptionClass(404, "帖子不存在");
        }

        comment.setUserId(currentUserId);
        comment.setCreateBy(String.valueOf(currentUserId));
        comment.setUpdateBy(String.valueOf(currentUserId));
        commentMapper.insert(comment);
        return comment.getId();
    }

    @Override
    public List<Comment> listByPost(Long postId, int page, int size) {
        int offset = (page - 1) * size;
        return commentMapper.selectByPostId(postId, offset, size);
    }

    @Override
    public int countByPost(Long postId) {
        return commentMapper.countByPostId(postId);
    }
}
