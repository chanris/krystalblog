package com.krystalblog.module.drive.controller;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DriveControllerPermissionTest {

    @Test
    void driveFilePickerShouldRequireAuthentication() throws Exception {
        Method method = DriveFileController.class.getMethod(
                "listFilesForPicker",
                int.class,
                int.class,
                Long.class,
                String.class,
                String.class,
                String.class,
                Long.class,
                Long.class,
                String.class
        );
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuthorize);
        assertEquals("isAuthenticated()", preAuthorize.value());
    }

    @Test
    void driveFoldersEndpointsShouldRequireAuthentication() throws Exception {
        Method listMethod = DriveFolderController.class.getMethod("listFolders", Long.class, String.class);
        PreAuthorize listAuth = listMethod.getAnnotation(PreAuthorize.class);
        assertNotNull(listAuth);
        assertEquals("isAuthenticated()", listAuth.value());

        Method pathMethod = DriveFolderController.class.getMethod("getFolderPath", Long.class);
        PreAuthorize pathAuth = pathMethod.getAnnotation(PreAuthorize.class);
        assertNotNull(pathAuth);
        assertEquals("isAuthenticated()", pathAuth.value());
    }
}

