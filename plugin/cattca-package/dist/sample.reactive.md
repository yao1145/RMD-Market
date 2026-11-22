# Cattca interactive story sample

<checkbox bind="show" label="Show story" initial="true">
<checkbox bind="lock" label="Lock story">
<checkbox bind="debug" label="Show debug state">

<if when="{{ show }}">

<panel title="Cattca story">

<cattca label="床与晨光" height="460" disabled="{{ lock }}" debug="{{ debug }}">

```cattca
你叫莱莉菥。
现在是早上六点，你醒了。
你躺在床上，窗帘缝里漏进一线灰白的光。

</let 赖床次数 = 0; label 故事开始;/>
你要怎么做？
</input case 选择:
  '继续睡觉' -> goto 睡觉:
  '起床' -> goto 起床;
/>

</label 睡觉; set 赖床次数 = 赖床次数 + 1;
apply "这是第 " + 赖床次数 + " 次赖床。";
if 赖床次数 > 2 -> goto 睡过头/>
你翻了个身，被子把你裹得更紧了一些。
</goto 故事开始;/>
</label 睡过头/>
结局：你终于睡过了头。
再醒来时，阳光已经铺满了整张床。
</exit/>

</label 起床/>
</apply "你选择了：" + 选择 + "。";/>
又是阳光明媚的一天。
你掀开被子，脚落到地板上，凉意清醒地从脚心爬上来。
拉开窗帘的那一下，整个房间忽然亮了一格。

</input case 起床后:
  '在窗前站一会儿' -> goto 窗前:
  '去厨房泡一杯茶' -> goto 泡茶:
  '翻开昨晚没读完的书' -> goto 读书;
/>

</label 窗前/>
窗台上的风轻轻撞进来，把窗帘吹起一个弧度。
你看见远处屋顶上镶着一层金色的边。
</goto 起床之后/>

</label 泡茶/>
水壶开始发出细小的声响。
茶叶在杯底慢慢舒展开，像一群刚醒来的小鱼。
</goto 起床之后/>

</label 读书/>
书页还停在你昨夜读到的那一行。
晨光落在纸上，字句忽然比昨晚温柔了一些。
</goto 起床之后/>

</label 起床之后/>
接下来，你想怎么度过这个早晨？
</input case:
  '出门，走进这一天' -> goto 出门:
  '留在屋里，把安静过完' -> goto 留在屋里;
/>

</label 出门/>
你换好鞋，推门出去。
楼道里有邻居家早餐的味道，街角的树把影子铺在人行道上。
你踩过去，影子碎了一下，又慢慢合拢。

> 又是阳光明媚的一天。你决定把它好好用掉。
</exit/>

</label 留在屋里/>
你没有出门。房间继续安静，光从地板的一端慢慢挪到另一端。
你什么也没错过，只是把这一小段早晨完整地留给了自己。

> 又是阳光明媚的一天。你决定先不急着去哪里。
</exit/>
```

</cattca>

</panel>

</if>
