package com.krystalblog.module.friend.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.FriendLinkCategory;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.FriendLinkCategoryMapper;
import com.krystalblog.mapper.FriendLinkMapper;
import com.krystalblog.module.friend.dto.LinkCategoryDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LinkCategoryServiceTest {

    @Mock
    private FriendLinkCategoryMapper friendLinkCategoryMapper;

    @Mock
    private FriendLinkMapper friendLinkMapper;

    @Mock
    private SecurityUtil securityUtil;

    @InjectMocks
    private LinkCategoryService linkCategoryService;

    @Test
    void createCategoryShouldSaveWhenNameUnique() {
        LinkCategoryDTO dto = new LinkCategoryDTO();
        dto.setName("技术");
        dto.setDescription("技术圈");
        dto.setSortOrder(3);

        when(friendLinkCategoryMapper.selectCount(any())).thenReturn(0L);
        doAnswer(invocation -> {
            FriendLinkCategory category = invocation.getArgument(0);
            category.setId(1L);
            return 1;
        }).when(friendLinkCategoryMapper).insert(any(FriendLinkCategory.class));
        FriendLinkCategory saved = new FriendLinkCategory();
        saved.setId(1L);
        saved.setName("技术");
        saved.setDescription("技术圈");
        saved.setSortOrder(3);
        when(friendLinkCategoryMapper.selectById(1L)).thenReturn(saved);

        var result = linkCategoryService.createCategory(dto);

        assertEquals(1L, result.getId());
        assertEquals("技术", result.getName());
        assertEquals(3, result.getSortOrder());
        verify(friendLinkCategoryMapper).insertLegacyCategory(eq(1L), eq("技术"), contains("-1"), eq("技术圈"));
    }

    @Test
    void createCategoryShouldThrowWhenNameDuplicated() {
        LinkCategoryDTO dto = new LinkCategoryDTO();
        dto.setName("技术");
        when(friendLinkCategoryMapper.selectCount(any())).thenReturn(1L);

        BusinessException exception = assertThrows(BusinessException.class, () -> linkCategoryService.createCategory(dto));
        assertEquals("分类名称已存在", exception.getMessage());
    }

    @Test
    void deleteCategoryShouldThrowWhenLinkedFriendExists() {
        FriendLinkCategory category = new FriendLinkCategory();
        category.setId(2L);
        category.setName("生活");
        when(friendLinkCategoryMapper.selectById(2L)).thenReturn(category);
        when(friendLinkMapper.selectCount(any())).thenReturn(1L);

        BusinessException exception = assertThrows(BusinessException.class, () -> linkCategoryService.deleteCategory(2L));
        assertEquals("该分类下存在友链，无法删除", exception.getMessage());
    }

    @Test
    void deleteCategoryShouldDeleteAndWriteLogWhenNoRelation() {
        FriendLinkCategory category = new FriendLinkCategory();
        category.setId(3L);
        category.setName("设计");
        category.setDescription("设计类");
        category.setSortOrder(9);
        when(friendLinkCategoryMapper.selectById(3L)).thenReturn(category);
        when(friendLinkMapper.selectCount(any())).thenReturn(0L);

        User user = new User();
        user.setUsername("admin");
        when(securityUtil.getCurrentUser()).thenReturn(user);

        linkCategoryService.deleteCategory(3L);

        verify(friendLinkCategoryMapper).deleteById(3L);
        verify(friendLinkCategoryMapper).deleteLegacyCategory(3L);
    }

    @Test
    void listCategoriesShouldReturnPageRecords() {
        Page<FriendLinkCategory> page = new Page<>(1, 20);
        FriendLinkCategory category = new FriendLinkCategory();
        category.setId(1L);
        category.setName("技术");
        category.setDescription("desc");
        category.setSortOrder(0);
        page.setRecords(List.of(category));
        page.setTotal(1);
        page.setPages(1);

        when(friendLinkCategoryMapper.selectPage(any(), any())).thenReturn(page);

        var result = linkCategoryService.listCategories(1L, "技");

        assertEquals(1, result.getRecords().size());
        assertEquals(1, result.getTotal());
        assertEquals(1, result.getPage());
    }
}
