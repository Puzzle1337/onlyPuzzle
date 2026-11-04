//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.service;

import com.example.onlypuzzle.post.model.Comment;
import java.util.List;

public interface CommentService {
    Long createComment(Comment comment, Long currentUserId);
    List<Comment> listByPost(Long postId, int page, int size);
    int countByPost(Long postId);
}
