---
title: Git常用指令
---

# Git常用指令

<!-- more -->

**新建仓库并推送到远程仓库**

```bash
echo "# test" >> README.md
// 初始化仓库
git init

// 添加文件到暂存区
git add README.md

// 提交暂存区文件到分支
git commit -m "first commit"

// 更改分支名为main
git branch -M main

// 添加远程仓库
git remote add origin https://github.com/XiaotianGG1003/test.git

// 推送main分支到远程仓库
git push -u origin main
```

<br />

**推送本地仓库到远程仓库**

```bash
git remote add origin https://github.com/XiaotianGG1003/test.git
git branch -M main
git push -u origin main
```
