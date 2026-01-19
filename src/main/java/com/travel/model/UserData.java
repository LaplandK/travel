package com.travel.model;

import lombok.Data;
import java.util.Map;

@Data
public class UserData {
    private String username;
    // Key: 题目ID (0, 1, 2...), Value: "YES" / "NO"
    private Map<Integer, String> answers;
    // Key: 题目ID, Value: 备注内容
    private Map<Integer, String> notes;
    private Long timestamp;
}