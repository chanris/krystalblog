package com.krystalblog.module.video.service;

import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.DriveFile;
import com.krystalblog.entity.Video;
import com.krystalblog.mapper.DriveFileMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.mapper.VideoCategoryMapper;
import com.krystalblog.mapper.VideoMapper;
import com.krystalblog.module.drive.service.DriveFileService;
import com.krystalblog.module.video.dto.VideoDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoServiceDriveFileReferenceTest {

    @Mock
    private VideoMapper videoMapper;

    @Mock
    private VideoCategoryMapper categoryMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private SecurityUtil securityUtil;

    @Mock
    private DriveFileService driveFileService;

    @Mock
    private DriveFileMapper driveFileMapper;

    @InjectMocks
    private VideoService videoService;

    @Test
    void createVideoWithDriveFileShouldResolveUrlAndIncrementReferenceCount() {
        VideoDTO dto = new VideoDTO();
        dto.setTitle("v");
        dto.setDriveFileId(22L);
        dto.setCategoryId(1L);

        when(securityUtil.getCurrentUserId()).thenReturn(99L);

        DriveFile file = new DriveFile();
        file.setId(22L);
        file.setStatus("ACTIVE");
        file.setFileType("video/mp4");
        file.setFileName("x.mp4");
        file.setFileSize(456L);

        when(driveFileService.getEntityById(22L)).thenReturn(file);
        when(driveFileService.resolvePublicMediaUrl(file)).thenReturn("https://cdn.example/x.mp4");

        doAnswer(invocation -> {
            Video v = invocation.getArgument(0);
            v.setId(3L);
            return 1;
        }).when(videoMapper).insert(any(Video.class));

        Video inserted = new Video();
        inserted.setId(3L);
        inserted.setTitle("v");
        inserted.setVideoUrl("https://cdn.example/x.mp4");
        inserted.setDriveFileId(22L);
        inserted.setVideoMimeType("video/mp4");
        inserted.setVideoSizeBytes(456L);
        when(videoMapper.selectById(3L)).thenReturn(inserted);

        videoService.createVideo(dto);

        ArgumentCaptor<Video> captor = ArgumentCaptor.forClass(Video.class);
        verify(videoMapper).insert(captor.capture());
        Video v = captor.getValue();
        assertEquals(22L, v.getDriveFileId());
        assertEquals("https://cdn.example/x.mp4", v.getVideoUrl());
        assertEquals("video/mp4", v.getVideoMimeType());
        assertEquals(456L, v.getVideoSizeBytes());
        verify(driveFileMapper).incrementReferenceCount(22L);
    }

    @Test
    void deleteVideoShouldDecrementReferenceCountWhenReferenced() {
        Video existing = new Video();
        existing.setId(8L);
        existing.setDriveFileId(11L);
        when(videoMapper.selectById(8L)).thenReturn(existing);

        videoService.deleteVideo(8L);

        verify(driveFileMapper).decrementReferenceCount(11L);
    }
}

