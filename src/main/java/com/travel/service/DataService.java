package com.travel.service;

import com.travel.model.UserData;
import com.travel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DataService {

    @Autowired
    private UserRepository userRepository;

    public Map<String, UserData> getAllUsers() {
        List<UserData> userList = userRepository.findAll();
        // 转换 List 为 Map，方便前端通过 ID 查找
        return userList.stream()
                .collect(Collectors.toMap(UserData::getUsername, Function.identity()));
    }

    public UserData getUser(String username) {
        return userRepository.findById(username).orElse(null);
    }

    public void saveUser(UserData userData) {
        // 设置服务器时间戳
        userData.setTimestamp(System.currentTimeMillis());
        
        // 确保 Map 不为 null，防止数据库报错
        if (userData.getAnswers() == null) userData.setAnswers(java.util.Collections.emptyMap());
        if (userData.getNotes() == null) userData.setNotes(java.util.Collections.emptyMap());

        // 保存到 PostgreSQL
        userRepository.save(userData);
    }
}