package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.Music;
import com.krystalblog.entity.PlaylistMusic;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PlaylistMusicMapper extends BaseMapper<PlaylistMusic> {

    @Select("SELECT m.* FROM songs m INNER JOIN playlist_music pm ON m.id = pm.music_id WHERE pm.playlist_id = #{playlistId} ORDER BY pm.sort_order")
    List<Music> selectMusicByPlaylistId(@Param("playlistId") Long playlistId);
}
