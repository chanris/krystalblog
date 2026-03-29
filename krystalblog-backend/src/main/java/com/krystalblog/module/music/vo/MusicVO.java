package com.krystalblog.module.music.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MusicVO {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String cover;
    private String audioUrl;
    private Long driveFileId;
    private String audioMimeType;
    private Long audioSizeBytes;
    private Integer audioBitrateKbps;
    private Integer duration;
    private String lyrics;
    private String lyricsUrl;
    private Long artistId;
    private String artistName;
    private Long albumId;
    private String albumTitle;
    private Long categoryId;
    private String categoryName;
    private Long plays;
    private String status;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
