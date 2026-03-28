package com.krystalblog.module.music.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class MusicDTO {
    @NotBlank(message = "标题不能为空")
    private String title;
    private String slug;
    private String description;
    private String cover;
    @NotBlank(message = "音频URL不能为空")
    private String audioUrl;
    private Integer duration;
    private String lyrics;
    private String lyricsUrl;
    private Long artistId;
    /**
     * 歌手名称，当 artistId 为空时可通过名称自动查找或创建歌手
     */
    private String artistName;
    private Long albumId;
    private Long categoryId;
    private String status;
    private List<String> tags;
}
