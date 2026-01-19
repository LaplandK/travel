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
            const res = await fetch(`${API_BASE}/save`, {
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