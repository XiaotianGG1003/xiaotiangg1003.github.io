---
title: Linux系统编程
---

# Linux 系统编程

## vim编辑器
### 视图切换
![vim](../assets/notes/linux/QQ20251031-154553.jpg)

### 常用命令
* 正常模式
  ```bash
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
  ```bash
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
```bash
// 用户
sudo useradd test // 添加用户
sudo userdel test // 删除用户
sudo password test // 设置密码
su test // 切换用户
exit // 退出切换用户
```

### 文件、目录
```bash
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
```bash
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
```bash
target: prerequisites
  commands
# target: 即为要生成的目标。
# prerequisites: 生成目标所依赖的其它文件。
# commands: 一般情况下为生成该目标所需执行的命令(可以是任意的shell命令)

# 如果prerequisites不写，则每次都会执行命令
clean:
  rm -f test 

# 如果存在名字为clean的文件，那么就不起作用了
# 将 clean 和 rebuild 添加到 .PHONY 的序列中，可以避免这种情况发生
# 即使目录下有clean文件，也会执行命令，target即为伪目标
.PHONY: clean
clean:
  rm -f test 
```


## 目录
学会使用`man [命令]`看文档，重点看SYNOPSIS概要，参数，返回值

### 查看当前工作目录
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

### 切换目录
```cpp
#include <unistd.h>
#include <error.h>
#include <iostream>
using namespace std;

int main(int argc, char* argv[]) {
    if (argc != 2) {
        error(1, 0, "Usage: %s <directory_path>", argv[0]);
    }
    
    char* cwd = getcwd(nullptr, 0);
    puts(cwd);

    if (chdir(argv[1]) != 0) {
        error(1, errno, "chdir to %s failed", argv[1]);
    }

    cwd = getcwd(nullptr, 0);
    puts(cwd);
    free(cwd);
    return 0;
}
```
运行程序时，bash进程会fork一个子进程。子进程继承bash的工作目录，执行切换目录后，子进程目录改变，然后子进程退出，bash进程还是原来的工作目录
![chdir](../assets/notes/linux/QQ20251106-125748.jpg)

### 目录流
```cpp
// 打开一个目录，得到指向一个目录流的指针
DIR *opendir(const char *name);
DIR *fdopendir(int fd);
// 读取当前指向的目录项，返回一个struct dirent *，把读取位置移动到下一个位置
struct dirent *readdir(DIR *dirp);
// 关闭目录流
int closedir(DIR *dirp);
```
![dir_stream](../assets/notes/linux/QQ20251106-131255.jpg)


## 文件
### Linux管理文件的数据结构
![file_struct](../assets/notes/linux/QQ20251106-132022.jpg)
1. `inode`存放在磁盘上，记录了文件的元信息，如大小，权限，类型，所属文件系统等
2. `vnode`属于在内核，在内存中，是对`inode`的封装，一一对应，为文件系统提供统一的操作接口，包含文件状态信息，如`inode`指针、文件类型，同步锁等。
3. `open file table`，所有文件共享系统打开表，与`vnode`对应，包含打开模式，读写指针位置，引用(打开)次数，`vnode`指针，可以多个fd或多个进程共享。
4. `file descriptor`文件描述符，每个进程独有，保存打开文件的引用，系统通过它，进程就能访问文件、管道、socket、设备等所有I/O对象。
:::tip
一般fd索引0，1，2分别指向内核标准输入stdin、标准输出stdout、标准错误stderr
:::

### 打开文件
**打开文件过程**
1. 内核找到文件的`inode/vnode`,如果`vnode`不存在，则创建
2. 在系统**打开文件表**中创建表项，设置打开模式，读写指针位置，vnode指针
3. 在进程的**文件描述符表**中找到最小的可用项，指向打开文件表项
4. 返回`fd`表的索引

**释放文件**
1. fd 表，删除 fd 表项，断开到 open file entry 的指针
2. Open File Table，引用计数 -1；若为 0，释放该条目 
3. Vnode Table，引用计数 -1；若为 0，释放 vnode
4. Inode (Filesystem)不变，除非文件被 unlink 删除

```cpp
#include <fcntl.h>
#include <iostream>
using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " <filename>" << endl;
        return 1;
    }
    // 三选一O_RDONLY只读 O_WRONLY只写 O_RDWR读写
    // O_CREAT文件不存在则创建 O_EXCL若文件已存在则报错 
    // 有写权限 O_TRUNC清空文件内容 O_APPEND写操作追加到文件末尾
    int fd = open(argv[1], O_RDWR | O_CREAT | O_TRUNC, 0666);
    if (fd < 0) {
        cerr << "Failed to open file: " << argv[1] << endl;
        return 1;
    }
    cout << "File opened successfully, fd: " << fd << endl;
    close(fd);
    return 0;
}   
```

### 文件描述符复制dup&dup2
```cpp
int dup(int oldfd); // 返回新的文件描述符
int dup2(int oldfd, int newfd); // 指定新的文件描述符，会关闭newfd指向的文件
```
* 复制完成后，新的文件描述符和旧的都会指向同一个打开文件表项，即表项的引用 + 1

### 文件操作
**文件流和文件描述符**
文件流属于C标准库函数，工作在用户态，拥有用户态缓存，通常更快
文件描述符属于系统调用，工作在内核态，每次执行都要陷入内核，比较慢，直接从内核读写，无缓存
:::tip
fread本质上也是调用了read,一次从内核中读取大块数据，每次fread从缓存中取，提高性能
:::
![file_read](../assets/notes/linux/QQ20251106-175848.jpg)

```cpp
ssize_t read(int fd, void *buf, size_t count);//文件描述符 缓冲区 长度
ssize_t write(int fd, const void *buf, size_t count);
// whence SEEK_SET,文件头开始偏移 offset 必须 > 0
// SEEK_CUR当前位置开始 SEEK_END文件末尾开始
off_t lseek(int fd, off_t offset, int whence);
int close(int fd);

// 当length < fileSize 时直接截断末尾EOF
// 当length > fileSize 时扩充部分为0，不占用空间，即内核不会分配额外的页(文件空洞)
int ftruncate(int fd, off_t length);
```
```cpp
#include <fcntl.h>
#include <unistd.h>
#include <iostream>
#include <sys/stat.h>
using namespace std;

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " <filename>" << endl;
        return 1;
    }
    int fd = open(argv[1], O_RDWR | O_CREAT | O_APPEND, 0666);
    if (fd < 0) {
        cerr << "Failed to open file: " << argv[1] << endl;
        return 1;
    }
    cout << "File opened successfully, fd: " << fd << endl;
    // 获取文件状态
    struct stat* fileInfo = new struct stat();
    fstat(fd, fileInfo);
    // 获取文件大小
    off_t fileSize = fileInfo->st_size;
    cout << "File size: " << fileSize << " bytes" << endl;
    // 读取文件内容
    char* buf = new char[1024];
    read(fd, buf, fileSize);
    cout << buf << endl;

    string data = "追加的内容";
    write(fd, data.c_str(), data.size());
    // 文件偏移量重置到文件开头
    lseek(fd, 0, SEEK_SET);
    // 获取文件更新后的状态
    fstat(fd, fileInfo);
    read(fd, buf, fileInfo->st_size);
    cout << buf << endl;

    close(fd);
    delete[] buf;
    delete fileInfo;
    return 0;
} 
```
![file_op](../assets/notes/linux/QQ20251106-210048.jpg)
:::tip
文件写入后只是写入到内核的缓存区，标记为脏页，由内核决定什么时候刷新到磁盘，可以通过`int fsync(int fd)`将与fd相关的脏页立即刷新到磁盘
:::


### 文件信息
```cpp
//文件名 stat结构体指针
int stat(const char *file_name, struct stat *buf);   
//文件描述词  stat结构体指针
int fstat(int fd, struct stat *buf);      

struct stat {
    dev_t     st_dev;     /* 文件所在设备的设备号 */
    ino_t     st_ino;     /* 索引节点号（inode） */
    mode_t    st_mode;    /* 文件类型 + 访问权限 */
    nlink_t   st_nlink;   /* 硬链接数 */
    uid_t     st_uid;     /* 所有者 UID */
    gid_t     st_gid;     /* 所有者 GID */
    dev_t     st_rdev;    /* 特殊文件的设备号（如设备文件） */
    off_t     st_size;    /* 文件大小（字节） */
    blksize_t st_blksize; /* 最优 I/O 块大小 */
    blkcnt_t  st_blocks;  /* 占用磁盘块数（1块=512字节） */
    struct timespec st_atim;  /* 最后访问时间（秒+纳秒） */
    struct timespec st_mtim;  /* 最后修改时间（秒+纳秒） */
    struct timespec st_ctim;  /* 最后状态改变时间（秒+纳秒） */
#ifdef __USE_XOPEN2K8
    off_t     st_atime_nsec;  /* 访问时间纳秒（扩展成员） */
    off_t     st_mtime_nsec;  /* 修改时间纳秒（扩展成员） */
    off_t     st_ctime_nsec;  /* 状态改变时间纳秒（扩展成员） */
#endif
};
```

### mmap(内存映射)
* mmap(memory map)本质上是建立物理地址与虚拟地址的映射关系
将不同进程的虚拟内存映射到相同的物理内存，相比文件流和文件描述符，只建立映射，不用讲内核中数据拷贝到用户态
![mmap1](../assets/notes/linux/QQ20251106-212506.jpg)
* Linux内核中大部分也是使用虚拟内存，内核和进程的虚拟内存都可以映射到同一物理内存
![mmap2](../assets/notes/linux/QQ20251106-212605.jpg)
**实际应用场景**
* 共享内存：内核分配一块物理内存，同时映射到多个进程的用户虚拟地址空间，且内核自身也会映射该物理内存（用于管理），实现「进程间共享数据」或「内核与进程共享数据」
* 设备驱动的内存映射：硬件设备的 I/O 内存通常会被内核映射到内核虚拟地址（内核操作硬件），同时驱动可通过 mmap() 接口，将**同一块设备物理内存**映射到用户态的虚拟地址，让应用程序直接操作硬件（无需系统调用中转，效率极高）

  