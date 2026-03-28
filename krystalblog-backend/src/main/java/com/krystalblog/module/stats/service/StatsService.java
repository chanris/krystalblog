package com.krystalblog.module.stats.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.entity.Article;
import com.krystalblog.entity.Music;
import com.krystalblog.entity.User;
import com.krystalblog.entity.Video;
import com.krystalblog.mapper.ArticleMapper;
import com.krystalblog.mapper.MusicMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.mapper.VideoMapper;
import com.krystalblog.module.stats.vo.SiteStatsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ArticleMapper articleMapper;
    private final VideoMapper videoMapper;
    private final MusicMapper musicMapper;
    private final UserMapper userMapper;

    public SiteStatsVO getSiteStats() {
        Long totalArticles = articleMapper.selectCount(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED"));
        Long totalVideos = videoMapper.selectCount(new LambdaQueryWrapper<Video>()
                .eq(Video::getStatus, "PUBLISHED"));
        Long totalMusic = musicMapper.selectCount(null);
        Long totalUsers = userMapper.selectCount(null);

        Long totalViews = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                        .eq(Article::getStatus, "PUBLISHED"))
                .stream().mapToLong(Article::getViews).sum();

        return SiteStatsVO.builder()
                .totalViews(totalViews)
                .totalArticles(totalArticles)
                .totalVideos(totalVideos)
                .totalMusic(totalMusic)
                .totalUsers(totalUsers)
                .statDate(LocalDate.now())
                .build();
    }
}
