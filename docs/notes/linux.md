---
title: Linux系统编程
---

# Linux 系统编程

## vim编辑器
### 视图切换
![vim](../assets/notes/linux/QQ20251031-154553.jpg)

### 常用命令
* 正常模式
  ```shell
  移动光标
  gg 移动到第一行
  G 移动到最后一行

  删除
  dw 删除一个单词
  dd 删除一行

  复制
  yw 复制一个单词
  yy 复制一行

  p/P 粘贴
  u(undo) 撤销
  ctrl + r(recovery) 恢复
  ```
* 命令模式
  ```shell
  :w 将buffer里面的内容写入文本 即保存
  :q 退出
  :q! 不保存退出
  :Wq 保存退出
  /[单词] 查找 n: 切换下一个
  :set nu(number)/ nonu 设置/取消行号
  ```

## Linux 常用命令
* `man [命令]`查看命令手册
### 用户
```shell
// 用户
sudo useradd test // 添加用户
sudo userdel test // 删除用户
sudo password test // 设置密码
su test // 切换用户
exit // 退出切换用户
```

### 文件、目录
```shell
// 文件、目录
pwd(print working directory) // 可以查看当前工作目录
ls // 列出目录内容 -l 详细信息 
mkdir // 创建目录
redir // 删除空目录
touch // 创建文件
mv // 移动文件或目录，重命名文件
rm // 删除文件或目录 -r 递归删除 -f 强制删除
cat // 查看文件
tail // 查看文件后几行 -n 显示几行 -F 显示追加的数据

// 链接
ln [-s] 源文件 目标文件 // 默认硬链接，-s 软链接
硬链接指向相同的inode,当inode引用为0时，文件才会被删除，不能跨文件系统，不能指向目录
软链接有独立的inode,文件内容为源文件路径(可以不存在)，当源文件删除后软链接会失效，访问时提示“No such file or directory”，可跨文件系统，可指向目录
ln test h_link
ls -s test s_link

// 过滤
grep(Global Regular Expression Print)
grep [选项] 模式 [文件...] 
// -i 忽略大小写 -n 显示匹配的行号 -c 统计匹配的行数 -w 完全匹配
grep -ni "(" test.cpp
| // 管道符号，将前面结果输出给后面的命令
cat test.cpp | grep -wn "str"

// 查找
find [范围] 选项
// -name 查找指定文件名
find /home -name "*.cpp"
// -user 查找属于用户的文件
// -size 按照指定文件大小的查找 +n 大于 -n小于 单位k,M,G 
find . -size -500k

// 压缩(text archieve)
tar [主选项+辅选项] 包名 文件或目录
主选项（有且只能选择其中一个）
c：创建
r：追加 
x：释放
t：查看
辅选项：
f：指定包文件的名称
V：显示详细信息,显示打包过程方便查看进度
z：使用gzip算法压缩或解压缩包文件
-C：指定解压路径
压缩
tar czvf test.tar.gz *
解压
tar xvf test.tar.gz -C hh/
查看内容（不解压）
tar tvf test.tar.gz
```

### 权限
* `chmod [数字权限] 文件名/目录`
```shell
如-rw-r--r--
第1个字符：文件类型（- 普通文件、d 目录、l(link) 符号链接、b(block) 块设备、c 字符设备(键盘)、s 本地套接字）。
剩余9字符 三个字符一组，分别为用户所有者，用户所属组，其他用户权限，r 读 w 写 x 执行 - 无权限
文件默认 644 所有者读写，其他只读
目录默认 755 所有者全权限，其他可进入和查看
```
umask 文件创建掩码
原理：设置的是想去掉的权限，文件: (~umask)&666, 目录: (~umask)&777


## 编译
### 编译过程
![complie](../assets/notes/linux/QQ20251101-221014.jpg)
`gcc hello.c -o hello`编译链接，生成可执行程序，通过`./hello`运行
可选项 -g 产生调试信息，-Wall(warning all) 生成所有警告信息

### 条件编译
条件编译，就是在预处理阶段决定包含还是排除某些程序片段
```cpp
#ifdef 标识符
...
#endif
```
* 当标识符有被定义成宏时，保留 #ifdef 与 #endif 之间的代码；否则，在预处理阶段删除 #ifdef 与 #endif 之间的代码。等价于：
```cpp
#if defined(标识符)
...
#endif
```
#ifndef 相反
**作用：**
* 编写可移植的程序
* 为宏提供默认定义
* 避免头文件重复包含
  ```cpp
  #ifndef A
  #define A
  ...code
  #endif
  ```
  如果包含多个头文件，A只会被定义一次
* 临时屏蔽包含注释的代码

### 静态库与动态库
在类 Unix 系统上，静态库一般是以 .a 结尾，Windows 上一般是以 .lib 结尾；
在类 Unix 系统上，动态库一般是以 .so 结尾，Windows 上一般是以 .dll 结尾。
静态库是在链接阶段完成的，文件生成后，运行程序后会在每个进程都会保存一份，即使删除源文件，不会影响程序运行，占内存。
动态库是在程序运行阶段完成的，多个程序运行时共享一份代码，删除动态库后，程序无法运行



### Makefile
makefile定义了编译的规则，可以实现增量编译和自动编译，只编译更改的部分。
```shell
target: prerequisites
  commands
# target: 即为要生成的目标。
# prerequisites: 生成目标所依赖的其它文件。
# commands: 一般情况下为生成该目标所需执行的命令(可以是任意的shell命令)
```


## 目录
学会使用`man [命令]`看文档，重点看SYNOPSIS概要，参数，返回值
```cpp
#include <iostream>
#include <unistd.h>
using namespace std;

int main()
{
  // 查看当前工作目录
    char* cwd = getcwd(nullptr, 0);
    cout << cwd << endl;
    free(cwd);
    return 0;
}
```



