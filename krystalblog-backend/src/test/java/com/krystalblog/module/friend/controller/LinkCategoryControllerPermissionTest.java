package com.krystalblog.module.friend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LinkCategoryControllerPermissionTest {

    @Test
    void createCategoryShouldRequireAdminRole() throws Exception {
        Method method = LinkCategoryController.class.getMethod("createCategory", com.krystalblog.module.friend.dto.LinkCategoryDTO.class);
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuthorize != null);
        assertEquals("hasRole('ADMIN')", preAuthorize.value());
    }

    @Test
    void deleteCategoryShouldRequireAdminRole() throws Exception {
        Method method = LinkCategoryController.class.getMethod("deleteCategory", Long.class);
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertTrue(preAuthorize != null);
        assertEquals("hasRole('ADMIN')", preAuthorize.value());
    }
}
