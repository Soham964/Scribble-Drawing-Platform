package com.scribble.config;

import com.scribble.model.Room;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class RedisConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    /**
     * RedisTemplate<String, Room>
     * Keys   → plain String  (e.g. "room:abc123")
     * Values → JSON via JacksonJsonRedisSerializer (Spring Data Redis 4.x / Jackson 3)
     */
    @Bean
    public RedisTemplate<String, Room> roomRedisTemplate(
            RedisConnectionFactory factory,
            ObjectMapper objectMapper) {

        JacksonJsonRedisSerializer<Room> valueSerializer =
                new JacksonJsonRedisSerializer<>(objectMapper, Room.class);

        RedisTemplate<String, Room> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(valueSerializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(valueSerializer);
        template.afterPropertiesSet();
        return template;
    }
}
