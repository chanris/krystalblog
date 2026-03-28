package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.Album;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AlbumMapper extends BaseMapper<Album> {
}
