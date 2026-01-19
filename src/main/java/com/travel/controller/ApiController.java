package com.travel.controller;

import com.travel.model.UserData;
import com.travel.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private DataService dataService;

    // 获取所有用户数据（用于对比）
    @GetMapping("/users")
    public Map<String, UserData> getAllUsers() {
        return dataService.getAllUsers();
    }

    // 获取特定用户
    @GetMapping("/user/{username}")
    public UserData getUser(@PathVariable String username) {
        return dataService.getUser(username);
    }

    // 提交数据
    @PostMapping("/submit")
    public String submitUserData(@RequestBody UserData userData) {
        if (userData.getUsername() == null || userData.getUsername().trim().isEmpty()) {
            return "Error: ID cannot be empty";
        }
        dataService.saveUser(userData);
        return "Success";
    }
}