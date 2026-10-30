# Python常用库函数

## Numpy

numpy是 Python 生态中最核心的**开源数值计算基础库**，常用操作如下

1. 数组属性与视图：`ndim`、`shape`、`size`、`dtype` 等核心属性；直接赋值、切片、`copy()` 三种方式下数据是否共享
2. 创建数组：`array()`，批量创建 `zeros/ones/full/empty`等
3. 数组操作：形状变换 `reshape/transpose/flatten`，增删维度 `squeeze/expand_dims`，拼接拆分 `concatenate/stack/split`，复制 `tile/repeat`。
4. 数值计算：广播规则，算术与矩阵运算，常用数学函数（`exp/log/sqrt/round` 等），`clip/maximum/minimum`。
5. 统计分析：`sum/mean/median`、`std/var`、`min/max` 及其索引 `argmin/argmax`，集合运算，`np.linalg` 范数计算。
6. 排序、去重、判断：Numpy与Python 排序，`np.unique` 去重计数，`any/all` 条件判断。
7. 随机数：设置种子复现结果，均匀/正态/整数分布的随机生成，`np.random.choice` 随机抽样。

### 数组核心属性

```python
a = np.array([[1, 2, 3],
              [4, 5, 6]])

print(a.ndim)   # 2：维度数量
print(a.shape)  # (2, 3)：2 行 3 列
print(a.size)   # 6：元素总数
print(a.dtype)  # 数据类型
```

### 数组复制与视图

NumPy 中两个数组有时会共享底层数据。修改一个数组，可能导致另一个数组也发生变化。

* 直接赋值：共享数组对象

```python
a = np.array([1, 2, 3])
b = a

b[0] = 100

print(a)
# [100, 2, 3]
```

* 切片：通常得到视图，修改视图也会影响原数组。

```python
a = np.array([1, 2, 3, 4])
b = a[1:3]

b[0] = 100

print(a)
# [1, 100, 3, 4]
```

* `copy()`：显式复制

```python
a = np.array([1, 2, 3])
b = a.copy()

b[0] = 100

print(a)  # [1, 2, 3]
print(b)  # [100, 2, 3]
```

### 创建数组

```python
import numpy as np

# object:列表、元组或其他数组
# dtype:指定元素类型,如 np.float32、np.int64(ML中经常要显式指定,避免 int 溢出或精度问题)
# ndmin:最少维度,np.array([1,2], ndmin=2) 得到 [[1, 2]]
np.array(object, dtype=None, copy=True, ndmin=0)

np.zeros(shape, dtype=float)      		# 全 0,shape 是元组,如 (2, 3)
np.ones(shape, dtype)             		# 全 1
np.full(shape, fill_value)        		# 填充指定值,如 np.full((2,2), 7)
np.empty(shape)                   		# 只分配内存不初始化,值是随机的,不一定是0
np.zeros_like(a) / np.ones_like(a)      # 按数组 a的形状和类型创建,常用于初始化输出
np.arange(start, stop, step, dtype=None)# 左闭右开,类似 range,支持浮点步长:np.arange(0, 1, 0.2)

# num:取多少个点
# endpoint:是否包含stop(默认True,包含)
np.linspace(start, stop, num=50, endpoint=True)

np.eye(N, M=None, k=0)   # N×M 单位矩阵; k=1 表示主对角线上移一条
```

### 数组操作

```python
# 形状与维度变换
# order 参数:'C' 按行展开(默认)、'F' 按列展开
np.reshape(a, newshape, order="C")
a.reshape(2, 3)			# 不改变原数组
a.reshape(2, -1)		# -1 表示该维度自动推断,只能有一个 -1
a.reshape(-1)			# 展平成一维

a.T						# 转置,等价 np.transpose(a)
np.transpose(a, axes)	# axes 指定维度顺序,如 (1, 0, 2) 把 0、1维交换

# 把多维数组转换成一维数组。
a.flatten(order='C')	# 返回副本(改它不影响原数组)
a.ravel(order='C')		# 尽量返回视图(后续改数组可能影响原数组，建议直接使用flatten() )

np.squeeze(a, axis=None)		# 去掉长度为 1 的维度,如 (3,1) →(3,);axis 指定了但该维长度≠1会报错
np.expand_dims(a, axis)			# 在axis处增加一个长度为 1 的维度
# a = np.array([1, 2, 3])
# np.expand_dims(a, axis=0).shape  # (1, 3)
# np.expand_dims(a, axis=1).shape  # (3, 1)
a[:, np.newaxis]				# 同上,(n,) → (n,1)
a[:, None]						# 同上,(n,) → (n,1)

# dtype：目标数据类型 np.round(a).astype(int)
astype(dtype)
```

```python
# 拼接与拆分
np.concatenate([a, b], axis=0)  # 沿axis维度拼接,(2,3)+(2,3) axis=0 → (4,3)
np.stack([a, b], axis=0)        # 新增一个维度,(2,3)+(2,3) → (2,2,3)
np.vstack / np.hstack           # vstack()：按垂直方向堆叠	hstack()：按水平方向堆叠
np.r_ / np.c_					# np.r_ 沿行方向拼接 np.c_沿列方向拼接

np.split(a, 3, axis=0)        # 等分,不能整除会报错
np.array_split(a, 3, axis=0)  # 允许不均分

np.tile(a, (2, 3)) 					# 整块复制:把 a 当元素铺 2×3 块 (3,) → (2, 9)
# axis=None 展平后重复每个元素;repeats 不一定是一个整数，也可以是一个数组，分别指定每个元素重复几次。
np.repeat(a, repeats, axis=None)	# 沿着某一维度逐元素重复repeat次
V = np.array([[10, 20]])
np.repeat(V, 2, axis=1)
# array([[10, 10, 20, 20]]) 沿着第二维重复2次 (1,2) -> (1,4)
```

### 数值计算

* 广播规则：两个数组从最后一维向前对齐，每对维度满足“相等，或其中一个是 1”(或某方缺少该维)即可广播

```python
# 运算
+
-
*
/
//	除法并向下取整
%	取余
**	幂次计算   np.power(a, 2)
a @ b / np.matmul(a, b)		# 矩阵乘,等价 np.matmul(a, b)
np.dot(a, b)				# 一维:内积(标量);二维:矩阵乘;高维行为特殊,慎用


np.abs(x)			绝对值					np.abs([-2, 3])
np.sqrt(x)			平方根					np.sqrt([4, 9])
np.square(x)		平方			 		np.square([2, 3])
np.exp(x)			指数e^x		 	    np.exp([0, 1])
np.log(x)			自然对数			  np.log([1, np.e])
np.log2(x)			以 2 为底的对数		 np.log2([2, 8])
np.log10(x)			以 10 为底的对数		 np.log10([10, 100])
np.sin(x)			正弦					np.sin(np.pi / 2)
np.cos(x)			余弦					np.cos(0)
np.tan(x)			正切					np.tan(0)
np.floor(x)			向负无穷取整			 np.floor([1.8, -1.2])
np.ceil(x)			向正无穷取整			 np.ceil([1.2, -1.8])
np.round(x, decimals=0)	四舍六入五取偶 	np.round([1.234], 2)
np.round()用的是“银行家舍入”(四舍六入五取偶)

# a：输入数组。a_min：下限。a_max：上限。out：可选的输出数组,梯度裁剪常用
np.clip(a, a_min, a_max, out=None)

# 比较两个输入在对应位置上的值，逐元素取最大值或最小值
np.maximum() / np.minimum()
a = np.array([1, 5, 9])
b = np.array([3, 4, 7])
np.maximum(a, b)	# [3, 5, 9]
np.minimum(a, b)	# [1, 4, 7]

# 计算一个数组整体或某个轴上的最大值。
# a: ndarray数组对象
# axis 指定沿某个轴运算，默认输入展平（视为一维数组）进行处理。
# out ndarray，用于存放结果的输出数组。
# keepdims 若设为 True，则被约减的轴将保留在结果中，且维度大小为 1，可用于后续广播
np.max(a, axis=None, out=None, keepdims=False)
```

### 统计分析

统计函数经常用于数据分析、机器学习、科学计算。

这里的 `axis` 参数尤其重要，沿哪个轴压缩，该维就消失，对于形状为 `(2, 3)` 的二维数组：

- `axis=0`：沿第 0 轴运算，即对每一列分别计算，沿行方向聚合(压缩行) -> (3, )。
- `axis=1`：沿第 1 轴运算，即对每一行分别计算，沿列方向聚合(压缩列) -> (2, )。
- `axis=None`：默认，对所有元素整体运算。

```python
# 两种调用方式 np.fun(a) / a.fun()
np.sum(a, axis, dtype, keepdims) / a.sum(axis, dtype, keepdims)	# 求和	
np.mean(a, axis, dtype, keepdims)	# 算术平均数	
np.median(a, axis, keepdims)	# 中位数	

# ddof 表示计算时分母使用 N-ddof 
# ddof=0：总体方差、总体标准差的常见计算方式。
# ddof=1：样本方差、样本标准差的常见无偏估计方式。
np.std(a, axis, ddof, keepdims)	# 标准差	
np.var(a, axis, ddof, keepdims)	# 方差	

np.min(a, axis, keepdims)	# 最小值	
np.max(a, axis, keepdims)	# 最大值	
np.argmin(a, axis, keepdims)	# 最小值的位置	
np.argmax(a, axis, keepdims)	# 最大值的位置	

# 集合运算
np.union1d(a, b)	# 两个一维数组的并集
np.intersect1d(a, b)	# 交集
np.setdiff1d(a, b)	# 在 a 中但不在 b 中的元素
np.setxor1d(a, b)	# 只属于其中一方的元素

# np.linalg 线性算法函数
# ord：指定范数类型,ord=1 对向量计算绝对值之和；ord=2 计算欧几里得范数 平方求和开根号
# axis：指定计算的轴
# keepdims：是否保留被计算的维度
np.linalg.norm(x, ord, axis, keepdims=False) # 向量或矩阵范数
```

### 排序、去重、判断

```python
# numpy 排序
# axis：沿哪个轴排序，默认 -1，即最后一个轴。
# kind：排序算法选项，'quicksort'/'mergesort'/'stable'
a.sort(axis, kind, order)			# 修改原数组
np.sort(a, axis, kind, order)		# 返回排序后的值,不修改原数组
np.argsort(a, axis, kind, order) /a,argsort()	# 返回排序后各元素对应的原始索引。
np.sort(a)[::-1] #降序

# python中的排序
# key：指定排序依据	reverse：是否降序，默认 False
list.sort(key=None, reverse=False) # 列表原地排序，只能用于列表
sorted(iterable, key=None, reverse=False) # 返回排序后的新对象

sorted(students, key=lambda x: x[1]) # 按第一个元素排序
[
    ('Lucy', 78),
    ('Tom', 85),
    ('Jack', 92),
    ('Mike', 95)
]
sorted(students,key=lambda x: (x[1], -x[2])) # 1.先按照第一个元素升序 2.第一个相同时，按照第二个降序。

# 去重
a = np.array([1, 2, 2, 3, 3, 3])
# return_counts	是否返回每个唯一值的出现次数
values, counts = np.unique(a, return_counts=True)
print(values)  # [1, 2, 3]
print(counts)  # [1, 2, 3]

# 判断
any(a > 0, axis) # 至少有一个元素满足条件，就返回 True。
all(a > 0, axis) # 所有元素都满足条件，才返回 True
(a > 0).all()	 # 检查是否全为正
```

### 随机数生成

```python
# 旧 API

np.random.seed(42)                  # 设种子以复现
np.random.rand(d0, d1, ...)         # [0,1)均匀分布,维度直接写在参数里 d0:0维 d1:1维...
np.random.randn(d0, d1, ...)        # 标准正态 N(0,1)
np.random.randint(low, high, size)  # 整数,[low, high)
np.random.normal(loc, scale, size)  # 正态分布,loc均值 scale标准差
np.random.uniform(low, high, size)  # 均匀分布

# a: 数或者数组， size：维度大小
# replace：是否放回
# p：指定各元素被抽到的概率
np.random.choice(a, size, replace=True, p=None)  
# 从[0, 5) 中随机抽取
np.random.choice(5) 等价于 np.random.choice([0, 1, 2, 3, 4])
np.random.choice([10, 20, 30, 40, 50], size=(2, 3))
# 可能输出 [[10 30 20], [50 20 40]]
```

