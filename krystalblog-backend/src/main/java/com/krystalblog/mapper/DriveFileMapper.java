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

    @Update("UPDATE drive_files SET reference_count = reference_count + 1 WHERE id = #{id}")
    void incrementReferenceCount(@Param("id") Long id);

    @Update("UPDATE drive_files SET reference_count = CASE WHEN reference_count > 0 THEN reference_count - 1 ELSE 0 END WHERE id = #{id}")
    void decrementReferenceCount(@Param("id") Long id);
}
