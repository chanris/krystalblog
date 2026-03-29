package com.krystalblog.module.music.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.entity.*;
import com.krystalblog.mapper.*;
import com.krystalblog.module.music.dto.MusicDTO;
import com.krystalblog.module.music.vo.ArtistVO;
import com.krystalblog.module.music.vo.MusicVO;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MusicService {

    private final MusicMapper musicMapper;
    private final ArtistMapper artistMapper;
    private final AlbumMapper albumMapper;
    private final SongCategoryMapper songCategoryMapper;
    private final SongTagMapper songTagMapper;
    private final PlaylistMapper playlistMapper;
    private final PlaylistMusicMapper playlistMusicMapper;

    /**
     * 分页查询音乐列表，支持多种筛选条件
     */
    public IPage<MusicVO> listMusic(int page, int size, String genre, String keyword,
                                     Long artistId, Long categoryId, String tag, String sortBy) {
        LambdaQueryWrapper<Music> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Music::getStatus, "PUBLISHED");

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Music::getTitle, keyword));
        }
        if (artistId != null) {
            wrapper.eq(Music::getArtistId, artistId);
        }
        if (categoryId != null) {
            wrapper.eq(Music::getCategoryId, categoryId);
        }

        // 如果按标签筛选，先查出符合条件的歌曲ID
        if (StringUtils.hasText(tag)) {
            List<Long> songIds = songTagMapper.selectSongIdsByTag(tag);
            if (songIds.isEmpty()) {
                return new Page<MusicVO>(page, size).setRecords(List.of()).setTotal(0);
            }
            wrapper.in(Music::getId, songIds);
        }

        // 排序
        if ("popular".equals(sortBy)) {
            wrapper.orderByDesc(Music::getPlays);
        } else {
            wrapper.orderByDesc(Music::getCreatedAt);
        }

        IPage<Music> musicPage = musicMapper.selectPage(new Page<>(page, size), wrapper);
        return musicPage.convert(this::toVO);
    }

    /**
     * 获取音乐详情（同时增加播放量）
     */
    public MusicVO getMusicById(Long id) {
        Music music = musicMapper.selectById(id);
        if (music == null) return null;
        musicMapper.incrementPlayCount(id);
        return toVO(music);
    }

    /**
     * 获取热门音乐（按播放量降序）
     */
    public List<MusicVO> getHotMusic(int limit) {
        LambdaQueryWrapper<Music> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Music::getStatus, "PUBLISHED")
                .orderByDesc(Music::getPlays)
                .last("LIMIT " + limit);
        List<Music> songs = musicMapper.selectList(wrapper);
        return songs.stream().map(this::toVO).toList();
    }

    /**
     * 获取所有歌手列表（含歌曲数量）
     */
    public List<ArtistVO> getArtists() {
        List<Artist> artists = artistMapper.selectList(
                new LambdaQueryWrapper<Artist>().orderByAsc(Artist::getName));
        return artists.stream().map(a -> {
            Long songCount = musicMapper.selectCount(
                    new LambdaQueryWrapper<Music>()
                            .eq(Music::getArtistId, a.getId()));
            return ArtistVO.builder()
                    .id(a.getId())
                    .name(a.getName())
                    .bio(a.getBio())
                    .avatar(a.getAvatar())
                    .songCount(songCount)
                    .build();
        }).toList();
    }

    /**
     * 获取所有歌曲分类
     */
    public List<SongCategory> getCategories() {
        return songCategoryMapper.selectList(
                new LambdaQueryWrapper<SongCategory>().orderByAsc(SongCategory::getId));
    }

    /**
     * 获取所有不重复的标签名
     */
    public List<String> getAllTags() {
        return songTagMapper.selectAllDistinctTags();
    }

    /**
     * 根据 artistName 查找已有歌手，不存在则自动创建
     */
    private Long resolveArtistId(MusicDTO dto) {
        if (dto.getArtistId() != null) {
            return dto.getArtistId();
        }
        if (StringUtils.hasText(dto.getArtistName())) {
            String name = dto.getArtistName().trim();
            Artist existing = artistMapper.selectOne(
                    new LambdaQueryWrapper<Artist>().eq(Artist::getName, name));
            if (existing != null) {
                return existing.getId();
            }
            Artist newArtist = new Artist();
            newArtist.setName(name);
            artistMapper.insert(newArtist);
            return newArtist.getId();
        }
        return null;
    }

    @Transactional
    public MusicVO createMusic(MusicDTO dto) {
        Music music = new Music();
        music.setTitle(dto.getTitle());
        music.setSlug(dto.getSlug() != null ? dto.getSlug() : dto.getTitle());
        music.setDescription(dto.getDescription());
        music.setCover(dto.getCover());
        music.setAudioUrl(dto.getAudioUrl());
        music.setDuration(dto.getDuration());
        music.setLyrics(dto.getLyrics());
        music.setLyricsUrl(dto.getLyricsUrl());
        music.setArtistId(resolveArtistId(dto));
        music.setAlbumId(dto.getAlbumId());
        music.setCategoryId(dto.getCategoryId());
        music.setPlays(0L);
        music.setStatus(dto.getStatus() != null ? dto.getStatus() : "PUBLISHED");
        musicMapper.insert(music);

        // 保存标签
        if (dto.getTags() != null) {
            saveTags(music.getId(), dto.getTags());
        }

        return toVO(musicMapper.selectById(music.getId()));
    }

    @Transactional
    public MusicVO updateMusic(Long id, MusicDTO dto) {
        Music music = musicMapper.selectById(id);
        if (music == null) return null;

        if (dto.getTitle() != null) music.setTitle(dto.getTitle());
        if (dto.getSlug() != null) music.setSlug(dto.getSlug());
        if (dto.getDescription() != null) music.setDescription(dto.getDescription());
        if (dto.getCover() != null) music.setCover(dto.getCover());
        if (dto.getAudioUrl() != null) music.setAudioUrl(dto.getAudioUrl());
        if (dto.getDuration() != null) music.setDuration(dto.getDuration());
        if (dto.getLyrics() != null) music.setLyrics(dto.getLyrics());
        if (dto.getLyricsUrl() != null) music.setLyricsUrl(dto.getLyricsUrl());
        Long resolvedArtistId = resolveArtistId(dto);
        if (resolvedArtistId != null) music.setArtistId(resolvedArtistId);
        if (dto.getAlbumId() != null) music.setAlbumId(dto.getAlbumId());
        if (dto.getCategoryId() != null) music.setCategoryId(dto.getCategoryId());
        if (dto.getStatus() != null) music.setStatus(dto.getStatus());
        musicMapper.updateById(music);

        // 更新标签
        if (dto.getTags() != null) {
            songTagMapper.delete(
                    new LambdaQueryWrapper<SongTag>().eq(SongTag::getSongId, id));
            saveTags(id, dto.getTags());
        }

        return toVO(musicMapper.selectById(id));
    }

    @Transactional
    public void deleteMusic(Long id) {
        songTagMapper.delete(
                new LambdaQueryWrapper<SongTag>().eq(SongTag::getSongId, id));
        musicMapper.deleteById(id);
    }

    /**
     * 删除歌手（需检查是否有歌曲或专辑关联）
     */
    public void deleteArtist(Long artistId) {
        Artist artist = artistMapper.selectById(artistId);
        if (artist == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "歌手不存在");
        }
        Long songCount = musicMapper.selectCount(
                new LambdaQueryWrapper<Music>().eq(Music::getArtistId, artistId));
        if (songCount > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "该歌手下有 " + songCount + " 首歌曲，无法删除");
        }
        Long albumCount = albumMapper.selectCount(
                new LambdaQueryWrapper<Album>().eq(Album::getArtistId, artistId));
        if (albumCount > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "该歌手下有 " + albumCount + " 张专辑，无法删除");
        }
        artistMapper.deleteById(artistId);
    }

    /**
     * 删除标签（需检查是否有歌曲使用）
     */
    public void deleteTag(String tag) {
        List<Long> songIds = songTagMapper.selectSongIdsByTag(tag);
        if (!songIds.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "该标签被 " + songIds.size() + " 首歌曲使用，无法删除");
        }
        songTagMapper.delete(
                new LambdaQueryWrapper<SongTag>().eq(SongTag::getTag, tag));
    }

    public IPage<MusicVO> getLikedMusic(Long userId, int page, int size) {
        Playlist liked = playlistMapper.selectOne(new LambdaQueryWrapper<Playlist>()
                .eq(Playlist::getUserId, userId)
                .eq(Playlist::getType, "LIKED"));

        if (liked == null) {
            return new Page<MusicVO>(page, size).setRecords(List.of()).setTotal(0);
        }

        List<Long> likedIds = playlistMusicMapper.selectList(new LambdaQueryWrapper<PlaylistMusic>()
                        .eq(PlaylistMusic::getPlaylistId, liked.getId()))
                .stream()
                .map(PlaylistMusic::getMusicId)
                .toList();

        if (likedIds.isEmpty()) {
            return new Page<MusicVO>(page, size).setRecords(List.of()).setTotal(0);
        }

        LambdaQueryWrapper<Music> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Music::getId, likedIds).orderByDesc(Music::getCreatedAt);

        IPage<Music> musicPage = musicMapper.selectPage(new Page<>(page, size), wrapper);
        return musicPage.convert(this::toVO);
    }

    private void saveTags(Long songId, List<String> tags) {
        if (tags == null || tags.isEmpty()) return;
        for (String tag : tags) {
            SongTag songTag = new SongTag();
            songTag.setSongId(songId);
            songTag.setTag(tag);
            songTagMapper.insert(songTag);
        }
    }

    public MusicVO toVO(Music m) {
        // 查询关联数据
        String artistName = null;
        if (m.getArtistId() != null) {
            Artist artist = artistMapper.selectById(m.getArtistId());
            if (artist != null) artistName = artist.getName();
        }

        String albumTitle = null;
        if (m.getAlbumId() != null) {
            Album album = albumMapper.selectById(m.getAlbumId());
            if (album != null) albumTitle = album.getTitle();
        }

        String categoryName = null;
        if (m.getCategoryId() != null) {
            SongCategory category = songCategoryMapper.selectById(m.getCategoryId());
            if (category != null) categoryName = category.getName();
        }

        List<String> tags = songTagMapper.selectTagsBySongId(m.getId());

        return MusicVO.builder()
                .id(m.getId())
                .title(m.getTitle())
                .slug(m.getSlug())
                .description(m.getDescription())
                .cover(m.getCover())
                .audioUrl(m.getAudioUrl())
                .duration(m.getDuration())
                .lyrics(m.getLyrics())
                .lyricsUrl(m.getLyricsUrl())
                .artistId(m.getArtistId())
                .artistName(artistName)
                .albumId(m.getAlbumId())
                .albumTitle(albumTitle)
                .categoryId(m.getCategoryId())
                .categoryName(categoryName)
                .plays(m.getPlays())
                .status(m.getStatus())
                .tags(tags)
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
