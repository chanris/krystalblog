package com.krystalblog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.krystalblog.entity.DriveFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface DriveFileMapper extends BaseMapper<DriveFile> {

    @Update("UPDATE drive_files SET download_count = download_count + 1 WHERE id = #{id}")
    void incrementDownloadCount(@Param("id") Long id);
}
