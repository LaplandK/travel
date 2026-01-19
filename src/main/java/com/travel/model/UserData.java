package com.travel.model;

import lombok.Data;
import javax.persistence.*; // 如果是 Spring Boot 3.x，请使用 jakarta.persistence.*
import java.util.HashMap;
import java.util.Map;

@Data
@Entity // 1. 标记为实体类
@Table(name = "travel_users") // 数据库表名
public class UserData {

    @Id // 2. 主键，这里直接用 username 作为主键（假设用户ID不重复）
    @Column(nullable = false, unique = true)
    private String username;

    // 3. 处理 Map 类型的答案存储
    // 数据库会自动创建一张名为 user_answers 的附表
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_answers", joinColumns = @JoinColumn(name = "username"))
    @MapKeyColumn(name = "question_id") // Map 的 Key (题目ID)
    @Column(name = "answer_value")      // Map 的 Value (YES/NO)
    private Map<Integer, String> answers = new HashMap<>();

    // 4. 处理 Map 类型的备注存储
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_notes", joinColumns = @JoinColumn(name = "username"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "note_content", length = 500) // 备注可能比较长
    private Map<Integer, String> notes = new HashMap<>();

    private Long timestamp;
}