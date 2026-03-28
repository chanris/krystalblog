package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.ArticleTag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArticleTagMapper extends BaseMapper<ArticleTag> {

    @Delete("DELETE FROM article_tags WHERE article_id = #{articleId}")
    void deleteByArticleId(@Param("articleId") Long articleId);
}
