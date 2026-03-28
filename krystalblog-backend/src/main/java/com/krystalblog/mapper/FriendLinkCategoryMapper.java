package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.FriendLinkCategory;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FriendLinkCategoryMapper extends BaseMapper<FriendLinkCategory> {
    @Insert("INSERT INTO friend_link_categories (id, name, slug, description) VALUES (#{id}, #{name}, #{slug}, #{description})")
    void insertLegacyCategory(@Param("id") Long id,
                              @Param("name") String name,
                              @Param("slug") String slug,
                              @Param("description") String description);

    @Delete("DELETE FROM friend_link_categories WHERE id = #{id}")
    void deleteLegacyCategory(@Param("id") Long id);
}
