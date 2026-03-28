package com.krystalblog.module.music.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PlaylistDTO {
    @NotBlank(message = "播放列表名称不能为空")
    private String name;
    private String description;
    private String coverImage;
    private Boolean isPublic;
    private List<Long> musicIds;
}
