const API_BASE = '/api';

const api = {
    // 获取所有用户
    async getAllUsers() {
        try {
            const res = await fetch(`${API_BASE}/users`);
            return await res.json();
        } catch (e) {
            console.error("Fetch error:", e);
            return {};
        }
    },

    // 保存用户数据
    async saveUser(username, answers, notes) {
        const payload = {
            username: username,
            answers: answers,
            notes: notes
        };
        try {
            // 修改点：将 /save 改为 /submit，与后端 Controller 保持一致
            const res = await fetch(`${API_BASE}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return res.ok;
        } catch (e) {
            console.error("Save error:", e);
            return false;
        }
    }
};