package com.krystalblog.module.music.service;

import com.krystalblog.entity.DriveFile;
import com.krystalblog.entity.Music;
import com.krystalblog.mapper.*;
import com.krystalblog.module.drive.service.DriveFileService;
import com.krystalblog.module.music.dto.MusicDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MusicServiceDriveFileReferenceTest {

    @Mock
    private MusicMapper musicMapper;

    @Mock
    private ArtistMapper artistMapper;

    @Mock
    private AlbumMapper albumMapper;

    @Mock
    private SongCategoryMapper songCategoryMapper;

    @Mock
    private SongTagMapper songTagMapper;

    @Mock
    private PlaylistMapper playlistMapper;

    @Mock
    private PlaylistMusicMapper playlistMusicMapper;

    @Mock
    private DriveFileService driveFileService;

    @Mock
    private DriveFileMapper driveFileMapper;

    @InjectMocks
    private MusicService musicService;

    @Test
    void createMusicWithDriveFileShouldResolveUrlAndIncrementReferenceCount() {
        MusicDTO dto = new MusicDTO();
        dto.setTitle("t");
        dto.setDriveFileId(10L);

        DriveFile driveFile = new DriveFile();
        driveFile.setId(10L);
        driveFile.setStatus("ACTIVE");
        driveFile.setFileType("audio/mpeg");
        driveFile.setFileName("a.mp3");
        driveFile.setFileSize(123L);

        when(driveFileService.getEntityById(10L)).thenReturn(driveFile);
        when(driveFileService.resolvePublicMediaUrl(driveFile)).thenReturn("https://cdn.example/a.mp3");
        when(songTagMapper.selectTagsBySongId(anyLong())).thenReturn(List.of());

        doAnswer(invocation -> {
            Music music = invocation.getArgument(0);
            music.setId(1L);
            return 1;
        }).when(musicMapper).insert(any(Music.class));

        when(musicMapper.selectById(1L)).thenReturn(buildInsertedMusic());

        musicService.createMusic(dto);

        ArgumentCaptor<Music> captor = ArgumentCaptor.forClass(Music.class);
        verify(musicMapper).insert(captor.capture());
        Music inserted = captor.getValue();
        assertEquals(10L, inserted.getDriveFileId());
        assertEquals("https://cdn.example/a.mp3", inserted.getAudioUrl());
        assertEquals("audio/mpeg", inserted.getAudioMimeType());
        assertEquals(123L, inserted.getAudioSizeBytes());
        verify(driveFileMapper).incrementReferenceCount(10L);
    }

    @Test
    void updateMusicShouldAdjustReferenceCountWhenSwitchingDriveFile() {
        Music existing = new Music();
        existing.setId(7L);
        existing.setTitle("old");
        existing.setAudioUrl("old");
        existing.setDriveFileId(1L);

        MusicDTO dto = new MusicDTO();
        dto.setDriveFileId(2L);

        DriveFile newFile = new DriveFile();
        newFile.setId(2L);
        newFile.setStatus("ACTIVE");
        newFile.setFileType("audio/mpeg");
        newFile.setFileName("b.mp3");

        when(musicMapper.selectById(7L)).thenReturn(existing, existing);
        when(driveFileService.getEntityById(2L)).thenReturn(newFile);
        when(driveFileService.resolvePublicMediaUrl(newFile)).thenReturn("https://cdn.example/b.mp3");
        when(songTagMapper.selectTagsBySongId(anyLong())).thenReturn(List.of());

        musicService.updateMusic(7L, dto);

        verify(driveFileMapper).decrementReferenceCount(1L);
        verify(driveFileMapper).incrementReferenceCount(2L);
        verify(musicMapper).updateById(existing);
        assertEquals(2L, existing.getDriveFileId());
        assertEquals("https://cdn.example/b.mp3", existing.getAudioUrl());
    }

    @Test
    void deleteMusicShouldDecrementReferenceCountWhenReferenced() {
        Music existing = new Music();
        existing.setId(9L);
        existing.setDriveFileId(5L);

        when(musicMapper.selectById(9L)).thenReturn(existing);

        musicService.deleteMusic(9L);

        verify(driveFileMapper).decrementReferenceCount(5L);
    }

    private static Music buildInsertedMusic() {
        Music m = new Music();
        m.setId(1L);
        m.setTitle("t");
        m.setSlug("t");
        m.setAudioUrl("https://cdn.example/a.mp3");
        m.setDriveFileId(10L);
        m.setAudioMimeType("audio/mpeg");
        m.setAudioSizeBytes(123L);
        return m;
    }
}
