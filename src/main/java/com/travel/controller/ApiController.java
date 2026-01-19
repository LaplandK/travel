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

    // 获取所有用户数据
    @GetMapping("/users")
    public Map<String, UserData> getAllUsers() {
        return dataService.getAllUsers();
    }

    // 保存用户提交
    @PostMapping("/save")
    public String saveUser(@RequestBody UserData userData) {
        if (userData.getUsername() == null || userData.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        dataService.saveUser(userData);
        return "success";
    }
}