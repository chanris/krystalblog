package com.krystalblog.module.music.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.Music;
import com.krystalblog.entity.Playlist;
import com.krystalblog.entity.PlaylistMusic;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.PlaylistMapper;
import com.krystalblog.mapper.PlaylistMusicMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.music.dto.PlaylistDTO;
import com.krystalblog.module.music.vo.PlaylistVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistMapper playlistMapper;
    private final PlaylistMusicMapper playlistMusicMapper;
    private final UserMapper userMapper;
    private final MusicService musicService;
    private final SecurityUtil securityUtil;

    public List<PlaylistVO> listPlaylists() {
        return playlistMapper.selectList(new LambdaQueryWrapper<Playlist>()
                .eq(Playlist::getIsPublic, true)
                .orderByDesc(Playlist::getCreatedAt))
                .stream().map(this::toVO).toList();
    }

    public PlaylistVO getPlaylistById(Long id) {
        Playlist playlist = playlistMapper.selectById(id);
        return playlist != null ? toVO(playlist) : null;
    }

    @Transactional
    public PlaylistVO createPlaylist(PlaylistDTO dto) {
        Playlist playlist = new Playlist();
        playlist.setName(dto.getName());
        playlist.setDescription(dto.getDescription());
        playlist.setCoverImage(dto.getCoverImage());
        playlist.setUserId(securityUtil.getCurrentUserId());
        playlist.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : true);
        playlistMapper.insert(playlist);

        if (dto.getMusicIds() != null && !dto.getMusicIds().isEmpty()) {
            addMusicToPlaylist(playlist.getId(), dto.getMusicIds());
        }
        return toVO(playlistMapper.selectById(playlist.getId()));
    }

    @Transactional
    public PlaylistVO updatePlaylist(Long id, PlaylistDTO dto) {
        Playlist playlist = playlistMapper.selectById(id);
        if (playlist == null) return null;

        if (dto.getName() != null) playlist.setName(dto.getName());
        if (dto.getDescription() != null) playlist.setDescription(dto.getDescription());
        if (dto.getCoverImage() != null) playlist.setCoverImage(dto.getCoverImage());
        if (dto.getIsPublic() != null) playlist.setIsPublic(dto.getIsPublic());
        playlistMapper.updateById(playlist);

        if (dto.getMusicIds() != null) {
            playlistMusicMapper.delete(new LambdaQueryWrapper<PlaylistMusic>()
                    .eq(PlaylistMusic::getPlaylistId, id));
            if (!dto.getMusicIds().isEmpty()) {
                addMusicToPlaylist(id, dto.getMusicIds());
            }
        }
        return toVO(playlistMapper.selectById(id));
    }

    @Transactional
    public void deletePlaylist(Long id) {
        playlistMusicMapper.delete(new LambdaQueryWrapper<PlaylistMusic>()
                .eq(PlaylistMusic::getPlaylistId, id));
        playlistMapper.deleteById(id);
    }

    private void addMusicToPlaylist(Long playlistId, List<Long> musicIds) {
        for (int i = 0; i < musicIds.size(); i++) {
            PlaylistMusic pm = new PlaylistMusic();
            pm.setPlaylistId(playlistId);
            pm.setMusicId(musicIds.get(i));
            pm.setSortOrder(i);
            playlistMusicMapper.insert(pm);
        }
    }

    @Transactional
    public Playlist getOrCreateLikedPlaylist(Long userId) {
        Playlist liked = playlistMapper.selectOne(new LambdaQueryWrapper<Playlist>()
                .eq(Playlist::getUserId, userId)
                .eq(Playlist::getType, "LIKED"));

        if (liked == null) {
            liked = new Playlist();
            liked.setName("我的喜欢");
            liked.setUserId(userId);
            liked.setType("LIKED");
            liked.setIsPublic(false);
            playlistMapper.insert(liked);
        }
        return liked;
    }

    public List<Long> getLikedMusicIds(Long userId) {
        Playlist liked = playlistMapper.selectOne(new LambdaQueryWrapper<Playlist>()
                .eq(Playlist::getUserId, userId)
                .eq(Playlist::getType, "LIKED"));

        if (liked == null) return List.of();

        return playlistMusicMapper.selectList(new LambdaQueryWrapper<PlaylistMusic>()
                .eq(PlaylistMusic::getPlaylistId, liked.getId()))
                .stream().map(PlaylistMusic::getMusicId).toList();
    }

    @Transactional
    public boolean addMusicToLiked(Long userId, Long musicId) {
        Playlist liked = getOrCreateLikedPlaylist(userId);

        Long count = playlistMusicMapper.selectCount(new LambdaQueryWrapper<PlaylistMusic>()
                .eq(PlaylistMusic::getPlaylistId, liked.getId())
                .eq(PlaylistMusic::getMusicId, musicId));

        if (count > 0) return true;

        PlaylistMusic pm = new PlaylistMusic();
        pm.setPlaylistId(liked.getId());
        pm.setMusicId(musicId);
        pm.setSortOrder(0);
        playlistMusicMapper.insert(pm);
        return true;
    }

    @Transactional
    public boolean removeMusicFromLiked(Long userId, Long musicId) {
        Playlist liked = playlistMapper.selectOne(new LambdaQueryWrapper<Playlist>()
                .eq(Playlist::getUserId, userId)
                .eq(Playlist::getType, "LIKED"));

        if (liked == null) return false;

        playlistMusicMapper.delete(new LambdaQueryWrapper<PlaylistMusic>()
                .eq(PlaylistMusic::getPlaylistId, liked.getId())
                .eq(PlaylistMusic::getMusicId, musicId));
        return true;
    }

    private PlaylistVO toVO(Playlist p) {
        User user = userMapper.selectById(p.getUserId());
        List<Music> musicList = playlistMusicMapper.selectMusicByPlaylistId(p.getId());

        return PlaylistVO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .coverImage(p.getCoverImage())
                .userId(p.getUserId())
                .userName(user != null ? user.getNickname() : null)
                .isPublic(p.getIsPublic())
                .musicList(musicList.stream().map(musicService::toVO).toList())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
