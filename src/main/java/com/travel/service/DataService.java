package com.travel.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travel.model.UserData;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DataService {

    private static final String DB_FILE = "travel_data.json";
    private final ObjectMapper objectMapper = new ObjectMapper();
    // 内存缓存
    private Map<String, UserData> dataCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // 启动时加载数据
        File file = new File(DB_FILE);
        if (file.exists()) {
            try {
                dataCache = objectMapper.readValue(file, new TypeReference<ConcurrentHashMap<String, UserData>>() {
                });
                System.out.println("数据已加载，共 " + dataCache.size() + " 位用户。");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public Map<String, UserData> getAllUsers() {
        return dataCache;
    }

    public UserData getUser(String username) {
        return dataCache.get(username);
    }

    public synchronized void saveUser(UserData userData) {
        userData.setTimestamp(System.currentTimeMillis());
        dataCache.put(userData.getUsername(), userData);
        persist();
    }

    // 持久化到文件
    private void persist() {
        try {
            objectMapper.writeValue(new File(DB_FILE), dataCache);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}