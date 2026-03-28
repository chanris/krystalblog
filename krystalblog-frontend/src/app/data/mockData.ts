// ====================== IMAGES ======================
export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1646054791640-62e00f540457?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwd2FybSUyMHdyaXRpbmclMjBkZXNrJTIwYmxvZ3xlbnwxfHx8fDE3NzQ0OTUwODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  tech: "https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwcHJvZ3JhbW1pbmclMjBjb2RpbmclMjBhcnRpY2xlfGVufDF8fHx8MTc3NDQ5NTA4OHww&ixlib=rb-4.1.0&q=80&w=1080",
  travel: "https://images.unsplash.com/photo-1571406252288-cc9c25bb4a44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjB0cmF2ZWwlMjBwaG90b2dyYXBoeSUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzQ0OTUwODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  film: "https://images.unsplash.com/photo-1768885513772-2963bd07ec93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwY2luZW1hJTIwdmlkZW8lMjBwcm9kdWN0aW9ufGVufDF8fHx8MTc3NDQ5NTA4OHww&ixlib=rb-4.1.0&q=80&w=1080",
  music1: "https://images.unsplash.com/photo-1770172482899-7546f101118d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHZpbnlsJTIwcmVjb3JkJTIwd2FybSUyMGFtYmllbnR8ZW58MXx8fHwxNzc0NDk1MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  coffee: "https://images.unsplash.com/photo-1719464636416-97cbe2f8a172?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBsaWZlc3R5bGUlMjBtb3JuaW5nJTIwd2FybXxlbnwxfHx8fDE3NzQ0OTUwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  design: "https://images.unsplash.com/photo-1766802981949-3a577f87a2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzQ0OTUwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  mountain: "https://images.unsplash.com/photo-1767909599777-f73144edcfc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMGFkdmVudHVyZSUyMG91dGRvb3J8ZW58MXx8fHwxNzc0NDk1MDkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  jazz: "https://images.unsplash.com/photo-1654176549962-83649b3bd821?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwcGlhbm8lMjBtdXNpY2lhbiUyMGNvbmNlcnR8ZW58MXx8fHwxNzc0NDk1MDkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  albumArt: "https://images.unsplash.com/photo-1676068368612-1c8b3e2afed0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwbXVzaWMlMjBhbGJ1bSUyMGFydHxlbnwxfHx8fDE3NzQ0NzQ2NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
};

// ====================== TYPES ======================
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  author: string;
  archive: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  tags: string[];
  date: string;
  views: number;
  likes: number;
  comments: number;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  artistName?: string;
  album: string;
  cover: string;
  audioUrl?: string;
  duration: string | number;
  durationSec: number;
  category: string;
  tags: string[];
  date: string;
  plays: number;
}

export interface DriveFile {
  id: number;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  date: string;
  icon: string;
  parentId?: number | null;
}

export interface DriveFolder {
  id: number;
  name: string;
  parentId?: number | null;
  date: string;
  itemCount: number;
}

export interface Friend {
  id: number;
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: string;
  status: "active" | "inactive";
}

// ====================== BLOG POSTS ======================
export const BLOG_CATEGORIES = ["全部", "前端技术", "后端技术", "生活随笔", "旅行游记", "读书笔记", "设计思考"];
export const BLOG_TAGS = ["Vue3", "React", "TypeScript", "JavaScript", "Spring Boot", "MySQL", "Redis", "Docker", "旅行", "摄影", "读书", "CSS", "设计"];
export const BLOG_ARCHIVES = ["2025-03", "2025-02", "2025-01", "2024-12", "2024-11", "2024-10"];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "深入理解 Vue 3 响应式原理",
    excerpt: "Vue 3 的响应式系统基于 Proxy，相比 Vue 2 的 Object.defineProperty 有了很大的改进，带来了更好的性能和更完整的响应式支持。本文将深入分析其实现原理。",
    content: `# 深入理解 Vue 3 响应式原理

## 前言

Vue 3 的响应式系统是整个框架的核心，它使用了 ES6 的 \`Proxy\` API 来实现数据的响应式追踪。相比 Vue 2 使用的 \`Object.defineProperty\`，Proxy 能够拦截对象上的所有操作，包括属性的添加和删除。

## 核心概念

### reactive()

\`reactive()\` 函数返回一个对象的响应式代理：

\`\`\`javascript
import { reactive } from 'vue'

const state = reactive({ count: 0 })
state.count++
\`\`\`

### ref()

\`ref()\` 接受一个内部值并返回一个响应式的、可更改的 ref 对象：

\`\`\`javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
\`\`\`

## 实现原理

Vue 3 的响应式系统主要由以下几部分组成：

1. **track** - 在 getter 中追踪依赖
2. **trigger** - 在 setter 中触发更新
3. **effect** - 响应式副作用函数

## 总结

Vue 3 的响应式系统通过 Proxy 实现了更完善的响应式追踪，解决了 Vue 2 中的诸多限制。理解这些原理对于编写高效的 Vue 应用至关重要。`,
    cover: IMAGES.tech,
    category: "前端技术",
    tags: ["Vue3", "JavaScript", "TypeScript"],
    date: "2025-03-15",
    readTime: "8 分钟",
    views: 2341,
    likes: 128,
    comments: 34,
    author: "Krystal",
    archive: "2025-03",
  },
  {
    id: 2,
    title: "Spring Boot 整合 Redis 实现分布式缓存",
    excerpt: "在高并发场景下，数据库往往成为系统的瓶颈。通过引入 Redis 作为缓存层，可以大幅提升系统性能。本文介绍如何在 Spring Boot 中整合 Redis。",
    content: `# Spring Boot 整合 Redis 实现分布式缓存

## 为什么需要缓存？

在高并发场景下，频繁查询数据库会导致性能瓶颈。Redis 作为内存数据库，读写速度极快，非常适合用作缓存层。

## 引入依赖

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
\`\`\`

## 配置 Redis

\`\`\`yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: your_password
    database: 0
\`\`\`

## 使用 @Cacheable 注解

\`\`\`java
@Service
public class ArticleService {
    
    @Cacheable(value = "articles", key = "#id")
    public Article findById(Long id) {
        return articleRepository.findById(id).orElse(null);
    }
    
    @CacheEvict(value = "articles", key = "#id")
    public void delete(Long id) {
        articleRepository.deleteById(id);
    }
}
\`\`\`

## 总结

Redis 缓存能够显著提升系统性能，但需要注意缓存一致性、缓存穿透、缓存雪崩等问题。`,
    cover: IMAGES.design,
    category: "后端技术",
    tags: ["Spring Boot", "Redis", "MySQL"],
    date: "2025-03-08",
    readTime: "12 分钟",
    views: 1876,
    likes: 95,
    comments: 28,
    author: "Krystal",
    archive: "2025-03",
  },
  {
    id: 3,
    title: "云南十日游 | 大理、丽江、香格里拉",
    excerpt: "趁着假期，踏上了梦寐以求的云南之旅。苍山洱海的壮阔，古城小巷的幽静，香格里拉的神秘，让人流连忘返。用文字和照片记录下这段美好旅程。",
    content: `# 云南十日游 | 大理、丽江、香格里拉

## Day 1-3：大理

抵达大理，第一感受是空气的清新和天空的湛蓝。洱海边漫步，远处苍山白雪皑皑，与湖水交相辉映，美不胜收。

古城里的小巷蜿蜒曲折，咖啡馆、手工艺品店、客栈鳞次栉比。在一家小院里喝着当地的玫瑰花茶，感受时间流逝的缓慢。

## Day 4-6：丽江

丽江古城是纳西族的聚居地，古老的建筑和流淌的小河让人仿佛穿越到了另一个时代。玉龙雪山在阳光下闪闪发光，那是神圣的存在。

## Day 7-10：香格里拉

香格里拉是心中的净土。普达措国家公园的清晨，薄雾笼罩着碧塔海，宁静而神秘。松赞林寺的暮色中，僧侣们的诵经声飘荡在山谷之间。

## 旅行感悟

旅行不仅仅是去看风景，更是去感受不同的生活方式和文化。云南之行让我重新思考了生活的节奏和意义。`,
    cover: IMAGES.mountain,
    category: "旅行游记",
    tags: ["旅行", "摄影", "云南"],
    date: "2025-02-20",
    readTime: "10 分钟",
    views: 3456,
    likes: 234,
    comments: 67,
    author: "Krystal",
    archive: "2025-02",
  },
  {
    id: 4,
    title: "《人生》读后感 - 路遥的深情叙事",
    excerpt: "路遥的《人生》以上世纪80年代中国农村为背景，讲述了农村青年高加林的人生起伏。书中对命运、选择与责任的探讨，让人深思。",
    content: `# 《人生》读后感 - 路遥的深情叙事

## 故事梗概

高加林，一个有才华的农村青年，在命运的波折中几度浮沉。他与善良淳朴的刘巧珍、知性独立的黄亚萍之间的感情纠葛，折射出那个时代城乡之间的矛盾与张力。

## 命运与选择

路遥用质朴的语言描绘了人在命运面前的渺小与挣扎。高加林的每一次选择，都充满了现实的重量。他渴望飞翔，却始终被大地牵绊。这不仅是他个人的故事，更是那个时代无数青年的缩影。

## 情感的温度

书中最打动我的是刘巧珍这个角色。她的爱是那么纯粹，那么无私，让人心疼。即便被高加林抛弃，她依然善良地继续生活。这种人性的光辉，是路遥对人物最深情的刻画。

## 结语

读完《人生》，心中五味杂陈。人生路上，我们都会面临选择与取舍。重要的是，在追逐梦想的同时，不要失去最初的善良与真诚。`,
    cover: IMAGES.coffee,
    category: "读书笔记",
    tags: ["读书", "文学", "感悟"],
    date: "2025-02-10",
    readTime: "6 分钟",
    views: 1234,
    likes: 89,
    comments: 21,
    author: "Krystal",
    archive: "2025-02",
  },
  {
    id: 5,
    title: "TypeScript 高级类型编程技巧",
    excerpt: "TypeScript 的类型系统非常强大，掌握条件类型、映射类型、模板字面量类型等高级特性，可以让你的代码更加类型安全且优雅。",
    content: `# TypeScript 高级类型编程技巧

## 条件类型

条件类型是 TypeScript 中最强大的特性之一：

\`\`\`typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false
\`\`\`

## 映射类型

映射类型允许你基于旧类型创建新类型：

\`\`\`typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K]
}

type Partial<T> = {
  [K in keyof T]?: T[K]
}
\`\`\`

## 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`

type ClickEvent = EventName<'click'>  // 'onClick'
\`\`\`

## 实用工具类型

TypeScript 内置了很多实用工具类型，如 Pick、Omit、Required、ReturnType 等，合理利用这些工具类型可以大幅提升开发效率。`,
    cover: IMAGES.tech,
    category: "前端技术",
    tags: ["TypeScript", "JavaScript", "CSS"],
    date: "2025-01-25",
    readTime: "15 分钟",
    views: 2890,
    likes: 167,
    comments: 45,
    author: "Krystal",
    archive: "2025-01",
  },
  {
    id: 6,
    title: "打造极致用户体验的设计原则",
    excerpt: "好的设计不仅是视觉上的美观，更是用户体验的流畅与直觉。从信息层级、交互反馈到视觉一致性，这些原则指导着优秀产品的诞生。",
    content: `# 打造极致用户体验的设计原则

## 以用户为中心

设计的首要原则是理解用户。用户调研、可用性测试、数据分析，都是了解用户需求的有效手段。设计师需要站在用户的角度思考问题。

## 简洁胜于复杂

"Less is more" 是设计界的经典哲学。去掉所有不必要的元素，让每个设计决策都有其存在的理由。简洁的设计不仅更美观，也更容易使用。

## 一致性原则

界面中的视觉元素、交互模式、文案风格都应保持一致。一致性让用户建立心智模型，降低学习成本，提升使用效率。

## 反馈与响应

用户的每一次操作都应该得到及时的反馈。无论是按钮点击、表单提交还是页面加载，清晰的状态反馈能大大降低用户的焦虑感。`,
    cover: IMAGES.design,
    category: "设计思考",
    tags: ["设计", "CSS", "TypeScript"],
    date: "2025-01-12",
    readTime: "7 分钟",
    views: 1567,
    likes: 112,
    comments: 29,
    author: "Krystal",
    archive: "2025-01",
  },
];

// ====================== VIDEOS ======================
export const VIDEO_CATEGORIES = ["全部", "旅行", "技术", "生活", "音乐", "美食", "运动"];
export const VIDEO_TAGS = ["Vlog", "旅行", "编程", "美食", "健身", "摄影", "音乐", "生活"];

export const videos: Video[] = [
  {
    id: 1,
    title: "云南大理旅行 Vlog | 苍山洱海日落",
    description: "记录了在大理苍山洱海边欣赏日落的美好时光，古城漫步，品尝当地美食，感受慢生活的惬意。",
    thumbnail: IMAGES.mountain,
    duration: "14:32",
    category: "旅行",
    tags: ["Vlog", "旅行", "摄影"],
    date: "2025-03-10",
    views: 12456,
    likes: 892,
    comments: 134,
  },
  {
    id: 2,
    title: "Vue 3 + TypeScript 项目实战教程",
    description: "从零搭建一个 Vue 3 + TypeScript 项目，包含 Vite 配置、组件封装、状态管理、路由配置等完整流程。",
    thumbnail: IMAGES.tech,
    duration: "58:24",
    category: "技术",
    tags: ["编程", "Vlog"],
    date: "2025-03-05",
    views: 8934,
    likes: 567,
    comments: 89,
  },
  {
    id: 3,
    title: "周末咖啡馆 | 一个人的悠闲下午",
    description: "在附近发现了一家超级有氛围的咖啡馆，点上一杯拿铁，带着书坐了一个下午，分享给大家。",
    thumbnail: IMAGES.coffee,
    duration: "8:15",
    category: "生活",
    tags: ["生活", "Vlog", "美食"],
    date: "2025-02-28",
    views: 6781,
    likes: 423,
    comments: 56,
  },
  {
    id: 4,
    title: "春日清晨户外跑步记录",
    description: "坚持晨跑已经三个月了，分享我的跑步计划和感受，以及早晨公园里的美景。",
    thumbnail: IMAGES.travel,
    duration: "6:48",
    category: "运动",
    tags: ["健身", "生活"],
    date: "2025-02-20",
    views: 4532,
    likes: 312,
    comments: 41,
  },
  {
    id: 5,
    title: "家常菜教程 | 三道快手晚餐",
    description: "工作日下班后30分钟内完成三道菜，简单好吃，营养均衡，适合单身或小家庭的快手食谱。",
    thumbnail: IMAGES.film,
    duration: "22:10",
    category: "美食",
    tags: ["美食", "生活"],
    date: "2025-02-10",
    views: 9876,
    likes: 678,
    comments: 123,
  },
  {
    id: 6,
    title: "室内钢琴演奏 | 《月光》德彪西",
    description: "窗边的钢琴，午后的阳光，用音乐诠释德彪西的《月光》，希望带给大家宁静的片刻。",
    thumbnail: IMAGES.jazz,
    duration: "5:23",
    category: "音乐",
    tags: ["音乐", "摄影"],
    date: "2025-01-28",
    views: 15234,
    likes: 1234,
    comments: 201,
  },
];

// ====================== SONGS ======================
export const SONG_CATEGORIES = ["全部", "轻音乐", "流行", "古典", "爵士", "民谣", "电子"];
export const SONG_TAGS = ["轻音乐", "治愈", "睡前", "工作", "晨间", "爵士", "古典", "民谣"];
export const SONG_ARTISTS = ["全部", "Krystal", "月下弹琴", "静谧时光", "晨曦音乐", "夜风轻抚"];

export const songs: Song[] = [
  {
    id: 1,
    title: "晨光",
    artist: "Krystal",
    album: "清晨的声音",
    cover: IMAGES.albumArt,
    duration: "3:42",
    durationSec: 222,
    category: "轻音乐",
    tags: ["轻音乐", "晨间", "治愈"],
    date: "2025-03-01",
    plays: 23456,
  },
  {
    id: 2,
    title: "秋日私语",
    artist: "月下弹琴",
    album: "四季私语",
    cover: IMAGES.music1,
    duration: "4:18",
    durationSec: 258,
    category: "轻音乐",
    tags: ["轻音乐", "治愈", "睡前"],
    date: "2025-02-15",
    plays: 18934,
  },
  {
    id: 3,
    title: "深夜咖啡馆",
    artist: "静谧时光",
    album: "夜色温柔",
    cover: IMAGES.jazz,
    duration: "5:05",
    durationSec: 305,
    category: "爵士",
    tags: ["爵士", "工作", "治愈"],
    date: "2025-02-08",
    plays: 12765,
  },
  {
    id: 4,
    title: "月光奏鸣曲",
    artist: "晨曦音乐",
    album: "古典精选",
    cover: IMAGES.coffee,
    duration: "6:32",
    durationSec: 392,
    category: "古典",
    tags: ["古典", "睡前", "治愈"],
    date: "2025-01-20",
    plays: 9876,
  },
  {
    id: 5,
    title: "远方",
    artist: "Krystal",
    album: "旅途随想",
    cover: IMAGES.travel,
    duration: "3:55",
    durationSec: 235,
    category: "民谣",
    tags: ["民谣", "晨间", "治愈"],
    date: "2025-01-10",
    plays: 15678,
  },
  {
    id: 6,
    title: "星河入梦",
    artist: "夜风轻抚",
    album: "梦境系列",
    cover: IMAGES.mountain,
    duration: "4:44",
    durationSec: 284,
    category: "电子",
    tags: ["电子", "睡前", "工作"],
    date: "2024-12-25",
    plays: 21345,
  },
  {
    id: 7,
    title: "花间一壶茶",
    artist: "月下弹琴",
    album: "茶语",
    cover: IMAGES.design,
    duration: "3:28",
    durationSec: 208,
    category: "轻音乐",
    tags: ["轻音乐", "治愈", "工作"],
    date: "2024-12-10",
    plays: 8765,
  },
  {
    id: 8,
    title: "雨夜钢琴曲",
    artist: "晨曦音乐",
    album: "雨声私语",
    cover: IMAGES.film,
    duration: "5:16",
    durationSec: 316,
    category: "古典",
    tags: ["古典", "治愈", "睡前"],
    date: "2024-11-28",
    plays: 34567,
  },
];

// ====================== DRIVE FILES ======================
export const driveFiles: DriveFile[] = [
  { id: 1, name: "KrystalBlog 需求文档 v2.0.pdf", type: "pdf", size: "2.4 MB", sizeBytes: 2516582, date: "2025-03-20", icon: "📄", parentId: null },
  { id: 2, name: "UI设计稿 - 最终版.fig", type: "figma", size: "15.8 MB", sizeBytes: 16567706, date: "2025-03-18", icon: "🎨", parentId: 101 },
  { id: 3, name: "数据库设计文档.xlsx", type: "excel", size: "890 KB", sizeBytes: 911360, date: "2025-03-15", icon: "📊", parentId: 101 },
  { id: 4, name: "系统架构图.png", type: "image", size: "1.2 MB", sizeBytes: 1258291, date: "2025-03-10", icon: "🖼️", parentId: 102 },
  { id: 5, name: "前端代码备份.zip", type: "archive", size: "45.6 MB", sizeBytes: 47814374, date: "2025-03-08", icon: "📦", parentId: null },
  { id: 6, name: "服务器配置文档.md", type: "markdown", size: "24 KB", sizeBytes: 24576, date: "2025-02-28", icon: "📝", parentId: 103 },
  { id: 7, name: "项目演示视频.mp4", type: "video", size: "128 MB", sizeBytes: 134217728, date: "2025-02-20", icon: "🎬", parentId: 104 },
  { id: 8, name: "测试报告.docx", type: "word", size: "3.6 MB", sizeBytes: 3774873, date: "2025-02-15", icon: "📃", parentId: 103 },
  { id: 9, name: "音频素材合集.zip", type: "archive", size: "78.2 MB", sizeBytes: 82000486, date: "2025-01-30", icon: "📦", parentId: null },
  { id: 10, name: "版权证书.pdf", type: "pdf", size: "456 KB", sizeBytes: 467149, date: "2025-01-15", icon: "📄", parentId: 103 },
];

export const driveFolders: DriveFolder[] = [
  { id: 101, name: "设计资料", parentId: null, date: "2025-03-18", itemCount: 2 },
  { id: 102, name: "图片素材", parentId: null, date: "2025-03-10", itemCount: 1 },
  { id: 103, name: "文档", parentId: null, date: "2025-02-28", itemCount: 2 },
  { id: 104, name: "视频", parentId: null, date: "2025-02-20", itemCount: 1 },
];

// ====================== FRIENDS ======================
export const FRIEND_CATEGORIES = ["全部", "技术", "生活", "设计", "旅行", "摄影"];

export const friends: Friend[] = [
  {
    id: 1,
    name: "技术小站",
    url: "https://example1.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    description: "专注于 Web 全栈开发，分享技术干货与实战经验",
    category: "技术",
    status: "active",
  },
  {
    id: 2,
    name: "设计美学",
    url: "https://example2.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    description: "探索美的边界，记录设计路上的点点滴滴",
    category: "设计",
    status: "active",
  },
  {
    id: 3,
    name: "行走世界",
    url: "https://example3.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Simon",
    description: "用脚步丈量世界，用文字记录旅途的感动",
    category: "旅行",
    status: "active",
  },
  {
    id: 4,
    name: "光影日记",
    url: "https://example4.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna",
    description: "摄影爱好者，记录生活中转瞬即逝的美好瞬间",
    category: "摄影",
    status: "active",
  },
  {
    id: 5,
    name: "慢生活日志",
    url: "https://example5.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    description: "慢下来，感受生活的温度，记录平凡中的美好",
    category: "生活",
    status: "active",
  },
  {
    id: 6,
    name: "前端进阶路",
    url: "https://example6.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Max",
    description: "React / Vue 深度研究，前端工程化实践分享",
    category: "技术",
    status: "active",
  },
  {
    id: 7,
    name: "后端架构师",
    url: "https://example7.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zara",
    description: "Java 生态探索，微服务架构设计与实践",
    category: "技术",
    status: "inactive",
  },
  {
    id: 8,
    name: "美食家日记",
    url: "https://example8.com",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia",
    description: "食物是生活最美好的治愈，记录每一口的幸福",
    category: "生活",
    status: "active",
  },
];

// ====================== STATS DATA ======================
export const articleStatsData = [
  { month: "10月", views: 4200, likes: 320, comments: 89 },
  { month: "11月", views: 5800, likes: 445, comments: 112 },
  { month: "12月", views: 4900, likes: 378, comments: 95 },
  { month: "1月", views: 6700, likes: 523, comments: 134 },
  { month: "2月", views: 7200, likes: 612, comments: 156 },
  { month: "3月", views: 8900, likes: 734, comments: 198 },
];

export const videoStatsData = [
  { month: "10月", plays: 12400, likes: 890, comments: 234 },
  { month: "11月", plays: 15600, likes: 1120, comments: 312 },
  { month: "12月", plays: 13800, likes: 978, comments: 267 },
  { month: "1月", plays: 18900, likes: 1456, comments: 389 },
  { month: "2月", plays: 22300, likes: 1789, comments: 445 },
  { month: "3月", plays: 28700, likes: 2234, comments: 567 },
];

export const songStatsData = [
  { month: "10月", plays: 34500, category: "轻音乐", value: 45 },
  { month: "11月", plays: 42300, category: "轻音乐", value: 48 },
  { month: "12月", plays: 38900, category: "古典", value: 42 },
  { month: "1月", plays: 51200, category: "爵士", value: 55 },
  { month: "2月", plays: 67800, category: "民谣", value: 62 },
  { month: "3月", plays: 89400, category: "轻音乐", value: 78 },
];

export const categoryDistribution = [
  { name: "轻音乐", value: 38 },
  { name: "古典", value: 22 },
  { name: "爵士", value: 18 },
  { name: "民谣", value: 12 },
  { name: "电子", value: 10 },
];

export const weeklyVisits = [
  { day: "周一", visits: 1234 },
  { day: "周二", visits: 1890 },
  { day: "周三", visits: 2345 },
  { day: "周四", visits: 1987 },
  { day: "周五", visits: 2678 },
  { day: "周六", visits: 3456 },
  { day: "周日", visits: 2890 },
];
