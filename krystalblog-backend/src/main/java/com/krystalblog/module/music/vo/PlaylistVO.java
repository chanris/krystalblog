package com.krystalblog.module.music.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PlaylistVO {
    private Long id;
    private String name;
    private String description;
    private String coverImage;
    private Long userId;
    private String userName;
    private Boolean isPublic;
    private List<MusicVO> musicList;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
