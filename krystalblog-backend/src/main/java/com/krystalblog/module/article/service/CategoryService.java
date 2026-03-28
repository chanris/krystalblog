package com.krystalblog.module.article.service;

import cn.hutool.core.text.CharSequenceUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.entity.Category;
import com.krystalblog.mapper.CategoryMapper;
import com.krystalblog.module.article.dto.CategoryDTO;
import com.krystalblog.module.article.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;

    public List<CategoryVO> listCategories() {
        List<Category> categories = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>().orderByAsc(Category::getId));
        return categories.stream().map(this::toVO).toList();
    }

    @Transactional
    public CategoryVO createCategory(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setSlug(dto.getSlug() != null ? dto.getSlug() : CharSequenceUtil.toUnderlineCase(dto.getName()));
        category.setDescription(dto.getDescription());
        categoryMapper.insert(category);
        return toVO(category);
    }

    @Transactional
    public CategoryVO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryMapper.selectById(id);
        if (category == null) throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getSlug() != null) category.setSlug(dto.getSlug());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        categoryMapper.updateById(category);
        return toVO(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (categoryMapper.selectById(id) == null) throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
        categoryMapper.deleteById(id);
    }

    private CategoryVO toVO(Category c) {
        return CategoryVO.builder()
                .id(c.getId()).name(c.getName()).slug(c.getSlug())
                .description(c.getDescription()).createdAt(c.getCreatedAt())
                .build();
    }
}
