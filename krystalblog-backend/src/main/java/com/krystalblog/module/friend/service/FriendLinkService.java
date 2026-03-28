package com.krystalblog.module.friend.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.entity.FriendLink;
import com.krystalblog.entity.FriendLinkCategory;
import com.krystalblog.mapper.FriendLinkCategoryMapper;
import com.krystalblog.mapper.FriendLinkMapper;
import com.krystalblog.module.friend.dto.FriendLinkDTO;
import com.krystalblog.module.friend.vo.FriendLinkVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendLinkService {

    private final FriendLinkMapper friendLinkMapper;
    private final FriendLinkCategoryMapper friendLinkCategoryMapper;

    public List<FriendLinkVO> listFriendLinks(String status) {
        LambdaQueryWrapper<FriendLink> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(FriendLink::getStatus, status);
        } else {
            wrapper.in(FriendLink::getStatus, "APPROVED", "INACTIVE");
        }
        wrapper.orderByAsc(FriendLink::getSortOrder);
        List<FriendLink> links = friendLinkMapper.selectList(wrapper);

        Map<Long, String> categoryMap = getCategoryMap();
        return links.stream().map(f -> toVO(f, categoryMap)).toList();
    }

    public List<FriendLinkCategory> listCategories() {
        return friendLinkCategoryMapper.selectList(new LambdaQueryWrapper<FriendLinkCategory>()
                .orderByAsc(FriendLinkCategory::getSortOrder)
                .orderByAsc(FriendLinkCategory::getId));
    }

    @Transactional
    public FriendLinkVO createFriendLink(FriendLinkDTO dto) {
        FriendLink link = new FriendLink();
        link.setName(dto.getName());
        link.setUrl(dto.getUrl());
        link.setLogo(dto.getLogo());
        link.setDescription(dto.getDescription());
        link.setCategoryId(dto.getCategoryId());
        link.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        link.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        friendLinkMapper.insert(link);
        return toVO(friendLinkMapper.selectById(link.getId()), getCategoryMap());
    }

    @Transactional
    public FriendLinkVO updateFriendLink(Long id, FriendLinkDTO dto) {
        FriendLink link = friendLinkMapper.selectById(id);
        if (link == null) return null;

        if (dto.getName() != null) link.setName(dto.getName());
        if (dto.getUrl() != null) link.setUrl(dto.getUrl());
        if (dto.getLogo() != null) link.setLogo(dto.getLogo());
        if (dto.getDescription() != null) link.setDescription(dto.getDescription());
        if (dto.getCategoryId() != null) link.setCategoryId(dto.getCategoryId());
        if (dto.getStatus() != null) link.setStatus(dto.getStatus());
        if (dto.getSortOrder() != null) link.setSortOrder(dto.getSortOrder());
        friendLinkMapper.updateById(link);
        return toVO(friendLinkMapper.selectById(id), getCategoryMap());
    }

    @Transactional
    public FriendLinkVO reviewFriendLink(Long id, String status) {
        FriendLink link = friendLinkMapper.selectById(id);
        if (link == null) return null;
        link.setStatus(status);
        friendLinkMapper.updateById(link);
        return toVO(friendLinkMapper.selectById(id), getCategoryMap());
    }

    @Transactional
    public void deleteFriendLink(Long id) {
        friendLinkMapper.deleteById(id);
    }

    private Map<Long, String> getCategoryMap() {
        return friendLinkCategoryMapper.selectList(null)
                .stream()
                .collect(Collectors.toMap(FriendLinkCategory::getId, FriendLinkCategory::getName));
    }

    private FriendLinkVO toVO(FriendLink f, Map<Long, String> categoryMap) {
        return FriendLinkVO.builder()
                .id(f.getId())
                .name(f.getName())
                .url(f.getUrl())
                .logo(f.getLogo())
                .description(f.getDescription())
                .categoryId(f.getCategoryId())
                .categoryName(f.getCategoryId() != null ? categoryMap.get(f.getCategoryId()) : null)
                .status(f.getStatus())
                .sortOrder(f.getSortOrder())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
