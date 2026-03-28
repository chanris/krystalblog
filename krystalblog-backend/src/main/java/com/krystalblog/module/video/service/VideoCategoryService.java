package com.krystalblog.module.video.service;

import cn.hutool.core.text.CharSequenceUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.entity.VideoCategory;
import com.krystalblog.mapper.VideoCategoryMapper;
import com.krystalblog.module.video.dto.VideoCategoryDTO;
import com.krystalblog.module.video.vo.VideoCategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoCategoryService {

    private final VideoCategoryMapper categoryMapper;

    public List<VideoCategoryVO> listCategories() {
        return categoryMapper.selectList(new LambdaQueryWrapper<VideoCategory>()
                .orderByAsc(VideoCategory::getSortOrder))
                .stream().map(this::toVO).toList();
    }

    @Transactional
    public VideoCategoryVO createCategory(VideoCategoryDTO dto) {
        VideoCategory category = new VideoCategory();
        category.setName(dto.getName());
        category.setSlug(CharSequenceUtil.toUnderlineCase(dto.getName()).replace(" ", "-").toLowerCase());
        category.setDescription(dto.getDescription());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        categoryMapper.insert(category);
        return toVO(categoryMapper.selectById(category.getId()));
    }

    @Transactional
    public VideoCategoryVO updateCategory(Long id, VideoCategoryDTO dto) {
        VideoCategory category = categoryMapper.selectById(id);
        if (category == null) return null;
        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        if (dto.getSortOrder() != null) category.setSortOrder(dto.getSortOrder());
        categoryMapper.updateById(category);
        return toVO(categoryMapper.selectById(id));
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryMapper.deleteById(id);
    }

    private VideoCategoryVO toVO(VideoCategory c) {
        return VideoCategoryVO.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .sortOrder(c.getSortOrder())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
