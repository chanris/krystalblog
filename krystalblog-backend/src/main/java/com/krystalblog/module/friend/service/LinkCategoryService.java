package com.krystalblog.module.friend.service;

import cn.hutool.core.text.CharSequenceUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.PageResult;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.FriendLink;
import com.krystalblog.entity.FriendLinkCategory;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.FriendLinkCategoryMapper;
import com.krystalblog.mapper.FriendLinkMapper;
import com.krystalblog.module.friend.dto.LinkCategoryDTO;
import com.krystalblog.module.friend.vo.LinkCategoryVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LinkCategoryService {

    private static final long PAGE_SIZE = 20L;

    private final FriendLinkCategoryMapper friendLinkCategoryMapper;
    private final FriendLinkMapper friendLinkMapper;
    private final SecurityUtil securityUtil;

    public PageResult<LinkCategoryVO> listCategories(Long page, String keyword) {
        long currentPage = page == null || page < 1 ? 1 : page;
        Page<FriendLinkCategory> mpPage = new Page<>(currentPage, PAGE_SIZE);
        LambdaQueryWrapper<FriendLinkCategory> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(FriendLinkCategory::getName, keyword)
                    .or()
                    .like(FriendLinkCategory::getDescription, keyword));
        }
        wrapper.orderByAsc(FriendLinkCategory::getSortOrder)
                .orderByAsc(FriendLinkCategory::getId);
        Page<FriendLinkCategory> categoryPage = friendLinkCategoryMapper.selectPage(mpPage, wrapper);

        List<LinkCategoryVO> records = categoryPage.getRecords().stream().map(this::toVO).toList();
        PageResult<LinkCategoryVO> result = new PageResult<>();
        result.setRecords(records);
        result.setTotal(categoryPage.getTotal());
        result.setPage(categoryPage.getCurrent());
        result.setSize(categoryPage.getSize());
        result.setPages(categoryPage.getPages());
        return result;
    }

    @Transactional
    public LinkCategoryVO createCategory(LinkCategoryDTO dto) {
        String name = dto.getName().trim();
        Long count = friendLinkCategoryMapper.selectCount(new LambdaQueryWrapper<FriendLinkCategory>()
                .eq(FriendLinkCategory::getName, name));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "分类名称已存在");
        }

        FriendLinkCategory category = new FriendLinkCategory();
        category.setName(name);
        category.setDescription(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription().trim());
        category.setSortOrder(dto.getSortOrder() == null ? 0 : dto.getSortOrder());
        friendLinkCategoryMapper.insert(category);
        String legacySlug = CharSequenceUtil.toUnderlineCase(name).replace(" ", "-").toLowerCase() + "-" + category.getId();
        friendLinkCategoryMapper.insertLegacyCategory(category.getId(), name, legacySlug, category.getDescription());
        return toVO(friendLinkCategoryMapper.selectById(category.getId()));
    }

    @Transactional
    public void deleteCategory(Long id) {
        FriendLinkCategory category = friendLinkCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分类不存在");
        }

        Long relationCount = friendLinkMapper.selectCount(new LambdaQueryWrapper<FriendLink>()
                .eq(FriendLink::getCategoryId, id));
        if (relationCount > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该分类下存在友链，无法删除");
        }

        friendLinkCategoryMapper.deleteById(id);
        friendLinkCategoryMapper.deleteLegacyCategory(id);
        User operator = securityUtil.getCurrentUser();
        log.info("友链分类删除操作: operator={}, operationTime={}, categoryId={}, categoryName={}, categoryDescription={}, sortOrder={}",
                operator.getUsername(), LocalDateTime.now(), category.getId(), category.getName(),
                category.getDescription(), category.getSortOrder());
    }

    private LinkCategoryVO toVO(FriendLinkCategory category) {
        return LinkCategoryVO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .sortOrder(category.getSortOrder())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
