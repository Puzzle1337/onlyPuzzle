//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 序列化配置。
 *
 * 为什么必须自己配？Spring Boot 默认给 RedisTemplate 用的是 JDK 序列化，
 * 存进 Redis 的是一串二进制乱码：
 *   1. redis-cli 里肉眼看不懂，排查问题全靠猜；
 *   2. 体积比 JSON 大好几倍；
 *   3. 换语言或 JDK 版本就可能反序列化失败。
 *
 * 所以换成一 key 用 String、value 用 JSON 的组合 —— 这是生产环境的标准做法。
 *
 * 注意：本项目是 Spring Boot 4，自带 Jackson 3（包名 tools.jackson.*）。
 * 网上大量教程写的 com.fasterxml.jackson.* 是 Jackson 2，在这里编译不过。
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        // enableUnsafeDefaultTyping()：把类型信息一起写进 JSON（形如 "@class":"...Post"）。
        // 不加这个，取出来的是 LinkedHashMap 而不是 Post —— 这就是常说的"泛型擦除"坑。
        // 名字里的 unsafe 是因为它放行任意类，生产上应该换成白名单校验的 PolymorphicTypeValidator。
        // 另外 Jackson 3 默认就把 LocalDateTime 写成 ISO-8601 字符串，不需要再注册 JavaTimeModule。
        GenericJacksonJsonRedisSerializer jsonSerializer = GenericJacksonJsonRedisSerializer.builder()
                .enableUnsafeDefaultTyping()
                .build();

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        // key 用纯字符串：redis-cli 里 KEYS post:* 才能正常工作
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        template.afterPropertiesSet();
        return template;
    }
}
