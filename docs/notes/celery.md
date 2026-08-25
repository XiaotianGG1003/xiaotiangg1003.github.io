---
title: Celery 框架快速上手
---

# Celery 框架快速上手

---

## 一、Celery 是什么

Celery 是一个**分布式异步任务队列（Distributed Task Queue）**框架，用 Python 写的。

### 核心角色（术语表）

| 术语 | 作用 |
|---|---|
| **Task 任务** | 用 `@app.task` 装饰的普通函数 |
| **Broker 消息代理** | 任务消息的中转站（Redis / RabbitMQ） |
| **Worker 工作者** | 从 Broker 取消息、真正执行任务函数的进程 |
| **Producer 生产者** | 调用 `task.delay(...)` 投递任务的一方 |
| **Result Backend 结果后端** | 保存任务执行结果和状态 |
| **Beat 定时调度器** | 按时间表定时投递任务 |
| **Queue 队列** | 消息的分类通道，支持按队列分配 Worker |

### 整体架构

```
┌──────────────┐  delay() / apply_async()   ┌───────────────────┐
│  FastAPI      │ ─────────────────────────▶│  Redis (Broker)   │
│  (Producer)   │   任务消息(JSON序列化)      │  队列: schedule等   │
│               │                           │                   │
│               │                           └─────────┬─────────┘
│               │                              BRPOP 取消息
└──────┬────────┘                                     │
       │                                ┌─────────────▼─────────────┐
       │ AsyncResult(task_id) 查结果    │  Celery Worker  │
       │                                │  反序列化 → 执行函数         │
       │                                └─────────────┬─────────────┘
       ▼                                              ▼ 存结果/状态
┌──────────────────┐                        ┌───────────────────┐
│  Redis (Backend) │ ◀──────────────────────┘  结果、PENDING/
│  GET task_id     │                          SUCCESS/FAILURE
└──────────────────┘
```

### 一次任务投递的内部流程

1. Producer 调 `add.delay(4, 6)` → Celery 把任务名 + 参数 **JSON 序列化**成一条消息 → `LPUSH` 进 Redis 队列。
2. Worker 启动时注册了所有任务，用 `BRPOP` **阻塞式**监听队列，取出消息。
3. Worker 反序列化 → 找到对应函数 → 执行 → 结果写入 Backend（`celery-task-meta-<task_id>` 键）。
4. Producer 或任何进程通过 `AsyncResult(task_id).get()` 轮询 Backend 拿结果。

**为什么是"取走即删"：** Worker 取消息时会从队列移除，所以一个重要概念是 **ACK（确认）**——只有任务执行成功后才 ACK，否则消息重新入队。

---

## 二、需要理解的 6 个核心机制

### 1. ACK 确认机制（任务不丢失的关键）

- 默认模式：Worker **一取到消息就确认**（任务还没执行）。Worker 中途崩溃 → 任务丢失。
- `task_acks_late=True`：**执行完才确认**，配合 `task_reject_on_worker_lost=True`（Worker 崩溃自动重新排队）。生产环境推荐配置。

### 2. 并发池（Pool）

Worker 以什么方式并发执行任务：

| Pool | 并发方式 | 适用 |
|---|---|---|
| `prefork`（默认） | 多进程 | Linux 生产环境，CPU 密集 |
| `gevent` / `eventlet` | 协程 | IO 密集 |
| `threads` | 多线程 | 简单场景 |
| `solo` | 单线程串行 | 调试 |

### 3. prefetch

默认 Worker 会**一次性预取**多个任务囤在自己手里。`worker_prefetch_multiplier=1` 表示每个并发槽只预取 1 个——避免"某个 Worker 抢了一堆长任务，别的 Worker 闲着"。

### 4. 超时与重试

```python
@app.task(soft_time_limit=240, time_limit=300)
def my_task(): ...
```

- `time_limit`（硬超时）：超时直接杀掉任务。
- `soft_time_limit`（软超时）：抛出 `SoftTimeLimitExceeded` 异常，任务可以捕获后做清理。
- 重试必须在任务内部主动调用：`raise self.retry(...)`

### 5. 队列路由

```python
@app.task(queue="mh3")   # 该任务的消息进 mh3 队列
```

Worker 启动时用 `-Q schedule,mh3` 声明**只消费哪些队列**。不消费的队列里的任务会永远堆积

### 6. 定时任务（Beat）

Beat 本身**不执行任务**，它只是按时间表（`timedelta` 或 `crontab`）把任务消息投递到 Broker，真正执行还是靠 Worker。所以定时任务要正常工作，**Beat 和 Worker 要同时跑**。

---

## 三、快速上手教程

### 第 1 步：写第一个任务

```python
# tasks.py（节选）
import time
from celery import Celery

# broker: 消息队列；backend: 存结果
app = Celery(
    "learn",
    broker="redis://:<password>@<host>:<port>/1",
    backend="redis://:<password>@<host>:<port>/1",
)

@app.task
def add(x, y):                      # 任务 1：最简单
    return x + y

@app.task
def slow_task(seconds):             # 任务 2：模拟耗时
    time.sleep(seconds)
    return f"睡了 {seconds} 秒"

@app.task(bind=True, max_retries=3, default_retry_delay=5)
def flaky_task(self, n):            # 任务 3：失败自动重试
    try:
        if n < 10:
            raise ValueError("n 太小了")
        return n
    except ValueError as exc:
        raise self.retry(exc=exc)
```

### 第 2 步：启动 Worker（Windows）

```bash
cd celery_learn
celery -A tasks worker -P gevent -c 4 --loglevel=info
```

看到这几行就说明成功：

```
[queues] .> celery  exchange=celery(direct) key=celery
[tasks] . add, flaky_task, slow_task
celery@你的主机名 ready.
```

> `-A tasks` 表示加载 `tasks.py` 模块；不加 `-Q` 时默认消费 `celery` 队列。

### 第 3 步：投递任务

```python
>>> from tasks import add, slow_task, flaky_task

# 方式 1：delay() —— 立即投递，立刻返回，不阻塞
>>> r = add.delay(4, 6)
>>> r.id                       # 任务 ID，先记下来

# 方式 2：apply_async() —— 功能更全
>>> add.apply_async(args=(1, 2))                      # 位置参数
>>> add.apply_async(kwargs={"x": 1, "y": 2})          # 关键字参数
>>> add.apply_async(args=(1, 2), countdown=10)        # 10 秒后执行
>>> add.apply_async(args=(1, 2), expires=60)          # 60 秒内没被执行则丢弃
```

### 第 4 步：拿结果

```python
>>> r = add.delay(4, 6)
>>> r.state            # 'PENDING' → 'SUCCESS' / 'FAILURE'
>>> r.ready()          # 是否执行完
>>> r.get(timeout=10)  # 阻塞等待结果（10 秒超时）
10

# 用 task_id 在任何进程里查询
>>> from celery.result import AsyncResult
>>> r2 = AsyncResult(r.id, app=app)
>>> r2.status, r2.result
('SUCCESS', 10)
```

### 第 5 步：观察重试

```python
>>> r = flaky_task.delay(3)     # n=3 会失败，看 Worker 日志里的 retry 信息
```

Worker 日志会打印 `retry: Retry in 5s`，重试 3 次后最终状态变 `FAILURE`。

### 第 6 步：编排任务（group / chain）

```python
from celery import group, chain

# group：并行执行，拿全部结果
>>> group(add.s(i, i) for i in range(5))().get()
[0, 2, 4, 6, 8]

# chain：串行，前一个结果作为后一个的第一个参数
>>> chain(add.s(2, 2), add.s(3))().get()   # (2+2)=4, 然后 4+3
7
```

> `.s()` 是 signature 的缩写，把任务调用"打包"成参数而不是立即执行。

### 第 7 步：定时任务（Beat）

```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    "print-time-every-30s": {
        "task": "tasks.heartbeat",   # 必须用 "模块.函数名" 字符串
        "schedule": 30.0,            # 每 30 秒
    },
    "morning-clean": {
        "task": "tasks.heartbeat",
        "schedule": crontab(hour=9, minute=30),  # 每天 9:30
    },
}
```

保持 Worker 开着，另开终端：

```bash
celery -A tasks beat --loglevel=info
```

### 第 8 步：队列路由

```python
app.conf.task_routes = {"tasks.slow_task": {"queue": "heavy"}}

# 启动两个 Worker：
#   终端A: celery -A tasks worker -Q celery     （普通队列）
#   终端B: celery -A tasks worker -Q heavy      （重任务队列）
```

`slow_task.delay(3)` 只被终端 B 消费，`add.delay(1,2)` 只被终端 A 消费——这就是项目里 `schedule` / `mh3` 两个队列的原理。

### 第 9 步：常用管理命令

```bash
celery -A tasks status                 # 各 Worker 是否在线
celery -A tasks inspect active         # 正在执行的任务
celery -A tasks inspect registered     # Worker 注册了哪些任务
celery -A tasks purge -f               # 清空队列（危险：丢弃所有排队任务）
celery -A tasks flower                 # Web 监控面板 http://localhost:5555
```

