package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.SongTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SongTagMapper extends BaseMapper<SongTag> {

    @Select("SELECT DISTINCT tag FROM song_tags WHERE song_id = #{songId}")
    List<String> selectTagsBySongId(@Param("songId") Long songId);

    @Select("SELECT DISTINCT tag FROM song_tags ORDER BY tag")
    List<String> selectAllDistinctTags();

    @Select("SELECT DISTINCT song_id FROM song_tags WHERE tag = #{tag}")
    List<Long> selectSongIdsByTag(@Param("tag") String tag);
}
