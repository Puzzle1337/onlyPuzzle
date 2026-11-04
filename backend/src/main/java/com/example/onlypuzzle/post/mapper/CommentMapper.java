//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.mapper;

import com.example.onlypuzzle.post.model.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CommentMapper {
    // 删帖时连带删除该帖下所有评论
    int deleteByPostId(@Param("postId") Long postId);

    // 发表评论
    int insert(Comment comment);

    // 查某帖子下的评论，按时间正序（楼层顺序）
    List<Comment> selectByPostId(@Param("postId") Long postId,
                                 @Param("offset") int offset,
                                 @Param("size") int size);

    int countByPostId(@Param("postId") Long postId);
}
