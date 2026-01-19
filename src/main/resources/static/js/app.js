// 全局状态
let currentUser = "";
let myAnswers = {}; // 格式: { "全局题号": "YES/NO" }
let myNotes = {};
let cachedUsersData = {};

let currentCategoryIndex = 0; // 当前正在填写的模块索引

// --- 视图切换 ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        setTimeout(() => { if (!v.classList.contains('active')) v.style.display = 'none'; }, 300);
    });
    const target = document.getElementById(viewId);
    target.style.display = 'block';
    setTimeout(() => target.classList.add('active'), 10);
    window.scrollTo(0, 0);
}

// --- 1. 初始化与登录 ---
async function startApp() {
    const nameInput = document.getElementById('username');
    const name = nameInput.value.trim();
    if (!name) return alert("请输入昵称");

    currentUser = name;

    // 拉取数据
    cachedUsersData = await api.getAllUsers();

    if (cachedUsersData[currentUser]) {
        // 老用户：恢复数据 -> 去看板
        myAnswers = cachedUsersData[currentUser].answers || {};
        myNotes = cachedUsersData[currentUser].notes || {};
        alert(`欢迎回来，${currentUser}！`);
        renderDashboard();
        showView('view-dashboard');
    } else {
        // 新用户：去菜单页
        renderMenu();
        showView('view-menu');
    }
}

// --- 2. 菜单页逻辑 ---
function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    let totalAnswered = 0;
    let totalQuestions = 0;

    let globalIdx = 0; // 全局题目计数器

    SURVEY_DATA.forEach((cat, index) => {
        const catQCount = cat.questions.length;
        let catAnswered = 0;

        // 计算该分类已答题数
        for (let i = 0; i < catQCount; i++) {
            if (myAnswers[globalIdx + i]) catAnswered++;
        }

        totalQuestions += catQCount;
        totalAnswered += catAnswered;

        // 生成卡片
        const isDone = catAnswered === catQCount;
        const div = document.createElement('div');
        div.className = `menu-card ${isDone ? 'done' : ''}`;
        div.onclick = () => openCategory(index); // 点击进入分类
        div.innerHTML = `
            <h4>${cat.name}</h4>
            <div class="status">${isDone ? '已完成 ✅' : `进度: ${catAnswered}/${catQCount}`}</div>
        `;
        container.appendChild(div);

        // 更新全局索引
        globalIdx += catQCount;
    });

    // 更新总进度文本
    const totalPercent = Math.round((totalAnswered / totalQuestions) * 100);
    document.getElementById('total-percent').innerText = `${totalPercent}%`;

    // 提交按钮状态控制
    const btn = document.getElementById('submit-all-btn');
    if (totalAnswered === totalQuestions) {
        btn.disabled = false;
        btn.innerText = "全部填完啦，提交保存！";
        btn.style.background = "var(--primary-yes)";
        btn.style.cursor = "pointer";
    } else {
        btn.disabled = true;
        btn.innerText = `还剩 ${totalQuestions - totalAnswered} 道题没填`;
        btn.style.background = "#ccc";
        btn.style.cursor = "not-allowed";
    }
}

// --- 3. 问卷填写逻辑 (按分类) ---
function openCategory(catIndex) {
    currentCategoryIndex = catIndex;
    renderCategoryQuestions();
    showView('view-survey');
}

function backToMenu() {
    renderMenu();
    showView('view-menu');
}

function renderCategoryQuestions() {
    const cat = SURVEY_DATA[currentCategoryIndex];
    document.getElementById('current-cat-name').innerText = cat.name;

    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    // 计算全局起始索引，确保 answers key 唯一
    let startIdx = 0;
    for (let i = 0; i < currentCategoryIndex; i++) {
        startIdx += SURVEY_DATA[i].questions.length;
    }

    cat.questions.forEach((q, i) => {
        const absoluteIdx = startIdx + i;
        const div = document.createElement('div');
        div.className = 'card';

        // 渲染选项状态
        const currentVal = myAnswers[absoluteIdx];
        const yesClass = currentVal === 'YES' ? 'selected-yes' : '';
        const noClass = currentVal === 'NO' ? 'selected-no' : '';
        const noteVal = myNotes[absoluteIdx] || '';

        div.innerHTML = `
            <div style="margin-bottom:10px; font-weight:500;">${i + 1}. ${q}</div>
            <div class="options">
                <button class="option-btn ${yesClass}" onclick="selectOpt(${absoluteIdx}, 'YES', this)">YES</button>
                <button class="option-btn ${noClass}" onclick="selectOpt(${absoluteIdx}, 'NO', this)">NO</button>
            </div>
            <input type="text" class="note-input" value="${noteVal}" placeholder="备注(可选)..." onchange="recordNote(${absoluteIdx}, this.value)">
        `;
        container.appendChild(div);
    });

    updateCategoryProgressBar();
}

function selectOpt(absIdx, val, btn) {
    myAnswers[absIdx] = val;

    // UI 更新
    const parent = btn.parentElement;
    parent.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected-yes', 'selected-no');
    });
    if (val === 'YES') btn.classList.add('selected-yes');
    else btn.classList.add('selected-no');

    updateCategoryProgressBar();
}

function recordNote(absIdx, val) {
    if (val.trim()) myNotes[absIdx] = val.trim();
    else delete myNotes[absIdx];
}

function updateCategoryProgressBar() {
    const cat = SURVEY_DATA[currentCategoryIndex];
    let startIdx = 0;
    for (let i = 0; i < currentCategoryIndex; i++) {
        startIdx += SURVEY_DATA[i].questions.length;
    }

    let answeredCount = 0;
    for (let i = 0; i < cat.questions.length; i++) {
        if (myAnswers[startIdx + i]) answeredCount++;
    }

    const pct = (answeredCount / cat.questions.length) * 100;
    document.getElementById('cat-progress-bar').style.width = pct + '%';
}

// --- 4. 提交保存 ---
async function submitSurvey() {
    if (!confirm("确定提交吗？提交后可以生成图片分享。")) return;

    const success = await api.saveUser(currentUser, myAnswers, myNotes);
    if (success) {
        cachedUsersData = await api.getAllUsers(); // 刷新数据
        renderDashboard();
        showView('view-dashboard');
    } else {
        alert("保存失败，请检查网络");
    }
}

// --- 5. 结果看板与图片导出 ---
function renderDashboard() {
    const list = document.getElementById('user-list');
    list.innerHTML = '';

    const friends = Object.keys(cachedUsersData).filter(u => u !== currentUser);

    if (friends.length === 0) {
        list.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#ccc">暂时没有好友数据<br>快去邀请朋友填写吧</p>`;
        return;
    }

    friends.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.onclick = () => doCompare(user);
        div.innerHTML = `
            <div class="avatar-placeholder">${user.charAt(0).toUpperCase()}</div>
            <div style="font-weight:bold">${user}</div>
            <div style="font-size:12px; color:#999; margin-top:5px;">点击查看默契度</div>
        `;
        list.appendChild(div);
    });
}

// 导出图片功能
function exportMyImage() {
    const container = document.getElementById('export-canvas-container');
    container.innerHTML = ''; // 清空

    // 1. 构造图片头部
    const header = document.createElement('div');
    header.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <h2 style="color:#FF8E8E; margin:0;">旅行防闹掰互检表</h2>
            <div style="color:#999; font-size:14px;">填表人：${currentUser}</div>
        </div>
    `;
    container.appendChild(header);

    // 2. 遍历所有题目生成列表
    let globalIdx = 0;
    SURVEY_DATA.forEach(cat => {
        const catTitle = document.createElement('h3');
        catTitle.style.borderBottom = "2px solid #FF8E8E";
        catTitle.style.paddingBottom = "5px";
        catTitle.style.marginTop = "20px";
        catTitle.innerText = cat.name;
        container.appendChild(catTitle);

        cat.questions.forEach((q) => {
            const ans = myAnswers[globalIdx] || '未填';
            const note = myNotes[globalIdx] ? `(${myNotes[globalIdx]})` : '';

            const row = document.createElement('div');
            // 根据答案给不同的样式
            const isYes = ans === 'YES';
            row.className = `export-card ${isYes ? 'yes-card' : 'no-card'}`;

            row.innerHTML = `
                <div style="font-size:14px; font-weight:bold; margin-bottom:5px;">${q}</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:${isYes ? '#FF8E8E' : '#999'}">${ans}</span>
                    <span style="font-size:12px; color:#888;">${note}</span>
                </div>
            `;
            container.appendChild(row);
            globalIdx++;
        });
    });

    // 3. 底部Logo
    const footer = document.createElement('div');
    footer.innerHTML = `<div style="text-align:center; color:#ddd; margin-top:20px; font-weight:bold;">CHECKLIST Vol.08</div>`;
    container.appendChild(footer);

    // 4. 调用 html2canvas 生成图片
    alert("正在生成长图，请稍后...");
    html2canvas(container, {
        useCORS: true,
        scale: 2 // 提高清晰度
    }).then(canvas => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${currentUser}_旅行问卷.png`;
        link.href = canvas.toDataURL();
        link.click();
    }).catch(err => {
        console.error(err);
        alert("图片生成失败，请截图保存");
    });
}

// --- 6. 对比功能 ---
function doCompare(otherUser) {
    const myData = cachedUsersData[currentUser];
    const otherData = cachedUsersData[otherUser];

    document.getElementById('compare-name').innerText = `我和 ${otherUser} 的契合度`;

    const conflictDiv = document.getElementById('conflict-list');
    const matchDiv = document.getElementById('match-list');
    conflictDiv.innerHTML = '';
    matchDiv.innerHTML = '';

    let total = 0;
    let matches = 0;
    let globalIdx = 0;

    SURVEY_DATA.forEach(cat => {
        cat.questions.forEach(q => {
            const idx = globalIdx++;
            const myAns = myData.answers[idx];
            const otherAns = otherData.answers[idx];

            if (!myAns || !otherAns) return;

            total++;
            const isMatch = (myAns === otherAns);
            if (isMatch) matches++;

            const card = document.createElement('div');
            card.className = isMatch ? 'match-card' : 'conflict-card';

            let notesHtml = '';
            if (myData.notes && myData.notes[idx]) notesHtml += `<div class="note-display">我: ${myData.notes[idx]}</div>`;
            if (otherData.notes && otherData.notes[idx]) notesHtml += `<div class="note-display">TA: ${otherData.notes[idx]}</div>`;

            card.innerHTML = `
                <div style="font-weight:bold; font-size:14px; margin-bottom:5px">${q}</div>
                <div class="compare-row">
                    <span style="color:${myAns === 'YES' ? 'var(--primary-yes)' : '#555'}">我: ${myAns}</span>
                    <span style="color:${otherAns === 'YES' ? 'var(--primary-yes)' : '#555'}">TA: ${otherAns}</span>
                </div>
                ${notesHtml}
            `;

            if (isMatch) matchDiv.appendChild(card);
            else conflictDiv.appendChild(card);
        });
    });

    const score = total === 0 ? 0 : Math.round((matches / total) * 100);
    document.getElementById('score-val').innerText = score + "%";

    showView('view-compare');
}

function logout() {
    currentUser = "";
    document.getElementById('username').value = "";
    showView('view-login');
}