//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.mapper;

import com.example.onlypuzzle.post.model.Post;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PostMapper {
    // 查某用户的帖子列表，分页
    List<Post> selectByUserId(@Param("userId") Long userId,
                              @Param("status") Byte status,
                              @Param("offset") int offset,
                              @Param("size") int size);

    // 总数，分页必须要
    int countByUserId(@Param("userId") Long userId,
                      @Param("status") Byte status);

    // 主页：所有已发布帖子，按时间倒序
    List<Post> selectAll(@Param("offset") int offset, @Param("size") int size);

    int countAll();

    // 按主键查单条（删前校验归属用）
    Post selectById(@Param("id") Long id);

    // 发帖：useGeneratedKeys 把自增主键回填到 post.id
    int insert(Post post);

    // 删帖
    int deleteById(@Param("id") Long id);
}
