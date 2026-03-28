package com.krystalblog.module.music.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArtistVO {
    private Long id;
    private String name;
    private String bio;
    private String avatar;
    private Long songCount;
}
