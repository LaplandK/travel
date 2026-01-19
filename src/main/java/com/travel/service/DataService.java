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

    // 不再需要 init() 方法，Spring Boot 启动时会自动连接数据库

    /**
     * 获取所有用户
     * 说明：从数据库查出 List，转换成 Map 返回，以兼容你的 Controller
     */
    public Map<String, UserData> getAllUsers() {
        // 1. 从数据库获取所有列表
        List<UserData> userList = userRepository.findAll();

        // 2. 将 List<UserData> 转换为 Map<String, UserData>
        // Key 是 username, Value 是 UserData 对象
        return userList.stream()
                .collect(Collectors.toMap(UserData::getUsername, Function.identity()));
    }

    /**
     * 获取单个用户
     */
    public UserData getUser(String username) {
        // findById 返回的是 Optional，如果没找到返回 null
        return userRepository.findById(username).orElse(null);
    }

    /**
     * 保存用户
     * 说明：不再写入 json 文件，而是直接存入数据库文件 (data/travel_db.mv.db)
     */
    public void saveUser(UserData userData) {
        // 更新时间戳
        userData.setTimestamp(System.currentTimeMillis());

        // JpaRepository 的 save 方法会自动判断：
        // 如果 username 已存在 -> 更新数据
        // 如果 username 不存在 -> 插入新数据
        userRepository.save(userData);
    }
}