package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("albums")
public class Album extends BaseEntity {
    private String title;
    private String cover;
    private Long artistId;
    private LocalDate releaseDate;
}
