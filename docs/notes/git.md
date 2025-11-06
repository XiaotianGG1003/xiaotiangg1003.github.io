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
// 重命名分支为main
git branch -M main
// 推送main分支到远程仓库
git push -u origin main
```

**本地分支改名同步到远程分支**
本地改名不会自动影响远程分支
```bash
// 重命名本地分支
git branch -m old-name new-name
// : 表示“推送空分支”，即删除远程分支
git push origin :old-name
// 推送新分支
git push origin new-name
// 关联本地分支与远程新分支,否则本地git push/git pull可能会报错
git branch -u origin/new-name
```
