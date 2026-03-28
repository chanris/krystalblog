package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.Music;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface MusicMapper extends BaseMapper<Music> {

    @Update("UPDATE songs SET plays = plays + 1 WHERE id = #{id}")
    void incrementPlayCount(@Param("id") Long id);
}
