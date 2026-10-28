//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.system.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET = "wisphermynamebutdontsayiottooloud";

    // 字符串 → SecretKey 对象，0.12 的类型安全设计：密钥和算法绑定，防止传错
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    private static final long EXPIRATION = 1000L * 60 * 60 * 24; // 24小时

    public static String generateToken(Long userId, String username) {
        return Jwts.builder()
                .claim("userId", userId)
                .claim("username", username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(KEY)
                .compact();
    }

    // 解析即校验：签名被篡改抛 SignatureException，过期抛 ExpiredJwtException
    // 不要 try-catch，让异常往上抛，交给全局异常处理器统一返回错误格式
    public static Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}