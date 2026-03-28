package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("drive_folders")
public class DriveFolder extends BaseEntity {
    private String name;
    private Long parentId;

    @TableField("created_by_id")
    private Long userId;
}
