//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.service;

import com.example.onlypuzzle.post.model.Post;
import java.util.List;

public interface PostService {
    // 返回列表，Service 层封装分页计算
    List<Post> listByUser(Long userId, Byte status, int page, int size);
    // 总数，分页必须要
    int countByUser(Long userId, Byte status);

    // 主页：所有已发布帖子
    List<Post> listAll(int page, int size);
    int countAll();

    // 发帖，返回新帖子的 id
    Long createPost(Post post);

    // 删帖：删帖 + 删该帖所有评论（多表写，必须事务）
    void deletePost(Long postId, Long currentUserId);
}
