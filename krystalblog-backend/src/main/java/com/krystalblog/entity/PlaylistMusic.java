package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("playlist_music")
public class PlaylistMusic extends BaseEntity {
    private Long playlistId;
    private Long musicId;
    private Integer sortOrder;
}
