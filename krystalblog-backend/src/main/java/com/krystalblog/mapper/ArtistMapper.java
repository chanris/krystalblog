package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.Artist;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ArtistMapper extends BaseMapper<Artist> {
}
