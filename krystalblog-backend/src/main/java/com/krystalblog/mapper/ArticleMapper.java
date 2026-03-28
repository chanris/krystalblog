package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ArticleMapper extends BaseMapper<Article> {

    @Update("UPDATE articles SET views = views + 1 WHERE id = #{id}")
    void incrementViews(@Param("id") Long id);

    @Update("UPDATE articles SET likes_count = likes_count + #{delta} WHERE id = #{id}")
    void updateLikesCount(@Param("id") Long id, @Param("delta") int delta);

    @Update("UPDATE articles SET comments_count = comments_count + #{delta} WHERE id = #{id}")
    void updateCommentsCount(@Param("id") Long id, @Param("delta") int delta);
}
