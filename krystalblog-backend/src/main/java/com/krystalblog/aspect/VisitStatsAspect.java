package com.krystalblog.aspect;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class VisitStatsAspect {

    private static final String VISIT_KEY_PREFIX = "stats:visits:daily:";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final StringRedisTemplate redisTemplate;

    @Pointcut("execution(* com.krystalblog.module.article.controller.ArticleController.getArticle(..)) || " +
              "execution(* com.krystalblog.module.video.controller.VideoController.getVideo(..)) || " +
              "execution(* com.krystalblog.module.music.controller.MusicController.getMusic(..))")
    public void contentVisit() {}

    @AfterReturning("contentVisit()")
    public void recordVisit() {
        try {
            String today = LocalDate.now().format(DATE_FORMATTER);
            String key = VISIT_KEY_PREFIX + today;

            redisTemplate.opsForValue().increment(key);
            redisTemplate.expire(key, 30, TimeUnit.DAYS);
        } catch (Exception e) {
            log.error("Failed to record visit", e);
        }
    }
}
