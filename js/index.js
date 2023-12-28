var dom = document.getElementById('chart-container');

var myChart = echarts.init(dom, 'dark', {
  renderer: 'canvas',
  useDirtyRect: false
});
const heatmapChart = echarts.init(document.getElementById("heatmapChart"));

var app = {};

var option;
var x=10,y=10,z=10;
//梯形坐标如下
const A = { x: 0, z: 0 };
const B = { x: 5, z: 10 };
const C = { x: 6, z: 10 };
const D = { x: 10, z: 0 };
var formatData
var yAxisData

$.getScript(
  './js/simplex-noise.js'
).done(function () {
  var noise = new SimplexNoise(Math.random);
  function generateData(theta, min, max) {
    var data = [];
    for (var i = 0; i <= x; i++) {
      for (var j = 0; j <= y; j++) {
        for (var k = 0; k <= z; k++) {
          var value = noise.noise3D(i / 10, j / 10, k / 10);
          valMax = Math.max(valMax, value);
          valMin = Math.min(valMin, value);
          data.push([i, j, k, value * 2 + 4]);  //ijk->XYZ
        }
      }
    }
    return data;
  }

  //叉积
  function crossProduct(point1, point2, x, z) {
    return (point2.x - point1.x) * (z - point1.z) - (point2.z - point1.z) * (x - point1.x);
  }

  function isPointInTrapezoid(A, B, C, D,  x, z) {
    const crossProductPA_AB = crossProduct(A, B,  x, z);
    const crossProductPB_BC = crossProduct(B, C,  x, z);
    const crossProductPC_CD = crossProduct(C, D,  x, z);
    const crossProductPD_DA = crossProduct(D, A,  x, z);
    // 如果所有叉积符号相同（均大于0或均小于0），则点在梯形内部
    if ((crossProductPA_AB >=0 && crossProductPB_BC >= 0 && crossProductPC_CD >= 0 && crossProductPD_DA >=0) ||
        (crossProductPA_AB <= 0 && crossProductPB_BC <= 0 && crossProductPC_CD <= 0 && crossProductPD_DA <= 0)) {
        return true;
    } else {
        return false;
    }
    // const slopeAB = (B.z - A.z) / (B.x - A.x);
    // const slopeCD = (D.z - C.z) / (D.x - C.x);
    // console.log(slopeAB,slopeCD)

    // // Check if the point is within the y-range of the trapezoid
    // if (z >= A.z && z <= C.z) {
    //     // Calculate x-values at P's y-value for trapezoid's left and right sides
    //     const xLeft = A.x + (z - A.z) / slopeAB;
    //     const xRight = C.x + (z - C.z) / slopeCD;
    //     // Check if P's x-coordinate is within the x-range of the trapezoid at its current y-value
    //     return x >= xLeft && x <= xRight;
    // }
    // return false;
  }

  function formTrapezoid(){
    const matrix = []
    let value
    for (var i = 0; i <= x; i++) {
      for (var j = 0; j <= y; j++) {
        for (var k = 0; k <= z; k++) {
          // console.log(isPointInTrapezoid(A,C,C,D,i,k))
          if(isPointInTrapezoid(A,B,C,D,i,k)){
            value = 1
          }else {
            value = 0
          }
          matrix.push(value)
        }
      }
    }
    return matrix
  }

  function isTrapezoid(data, matrix){
    var i
    var newData = []
    for(i=0; i<data.length; i++){
      data[i][3] = matrix[i]&&data[i][3]
      newData.push(data[i])
    }
    return newData
  }
  

  var valMin = Infinity;
  var valMax = -Infinity;
  var data = generateData(2, -5, 5);
  var matrixTrapezoid = formTrapezoid()
  formatData = isTrapezoid(data,matrixTrapezoid)

  // console.log(data)
  // console.log(valMin, valMax);
  myChart.setOption(
    (option = {
      visualMap: {
        show: true,
        min: 2,
        max: 6,
        inRange: {
          symbolSize: [0.5, 25],
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026'
          ],
          colorAlpha: [0.2, 1]
        }
      },
      xAxis3D: {
        type: 'value',
      },
      yAxis3D: {
        type: 'value'
      },
      zAxis3D: {
        type: 'value'
      },
    
      grid3D: {
        axisLine: {
          lineStyle: { color: '#fff' }
        },
        axisPointer: {
          lineStyle: { color: '#fff' }
        },
        viewControl: {
          // autoRotate: true
        },
        boxWidth: 200,
        boxHeight: 20,
        boxWidth: 30
      },
      series: [
        {
          type: 'scatter3D',
          data: formatData
        }
      ]
    })
  );

  //配置
  const heatmapOpt = {
    tooltip: {},
      grid: {
        top: 10,
        bottom: 25,
        left: 150,
          right: 10,
          backgroundColor: '#f00'
      },
      xAxis: {
          type: 'category',
          data: heatmapXData
      },
      yAxis: {
          type: 'category',
          data: heatmapYData
      },
      axisLabel: {
          color: '#fff'
        },
      visualMap: {
          type: 'piecewise', //分段型
          top: 0,
          left: 0,
          calculable: true,
          realtime: false, //拖拽时，是否实时更新
          min: 0,
          max: 6,
          splitNumber: 8,
          textStyle: {
            color: '#fff'
          },
          inRange: {
              color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          }
      },
      series: [{
          name: 'Y轴截面热力图',
          type: 'heatmap',
          progressive: 1000,
          animation: false,
          itemStyle: {
              emphasis: {
                  borderColor: '#333',
                  borderWidth: 1
              }
          }
      }]
  };
  heatmapChart.setOption(heatmapOpt);

  yAxisData = filterYaxis(formatData, 0)
  console.log(yAxisData)
  heatmapChart.setOption({
    series: [{
      name: 'Y轴截面热力图',
      data: yAxisData
    }]
  });
});

if (option && typeof option === 'object') {
  myChart.setOption(option);
  
}

function filterYaxis(formatData, y){
  var i
  const arr = []
  console.log(formatData.length)
  for(i=0; i<formatData.length; i++){
    if(formatData[i][1]===y){
      formatData[i].splice(1,1)
      arr.push(formatData[i])
    }
  }
  return arr
}

/*************** 笛卡尔坐标系上的热力图 **************/
//初始化echarts实例
const coordChart= echarts.init(document.getElementById("coordChart"));
//数据
const hours = ['12a', '0a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p',
  '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
const days = ['Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon'];
//配置
const coordOpt = {
  tooltip: {
        position: 'top'
    },
    grid: {
        top: 0,
        bottom: 25,
        left: 100,
        right: 10,
    },
    xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
            show: true
        }
    },
    yAxis: {
        type: 'category',
        data: days,
        splitArea: {
            show: true
        }
    },
    axisLabel: {
      color: '#fff'
    },
    visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        left: 'left',
        bottom: 20,
        itemWidth: 10,
        itemHeight: 80,
        textStyle: {
          color: '#fff'
        }
    },
    series: [{
        name: 'Coord Heatmap',
        type: 'heatmap',
        label: {
            normal: {
                show: true
            }
        },
        itemStyle: {
            emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }] 
};
//渲染图表
coordChart.setOption(coordOpt)
$.getJSON('data/coord.json').done(function(data) {
  let coordData = data.map(function(item) {
    return [item[1], item[0], item[2] || '-'];
  });
  coordChart.setOption({
    series: [{
      name: 'Coord Heatmap',
      data: coordData
    }]
  });
});

/******************* 热力图 **********************/
//初始化echarts实例
//heatmapChart.showLoading();
//数据
const heatmapXData = [];
const heatmapYData = [];
for(let i=0;i<=x;i++) {
  heatmapXData.push(i);
}
for(let i=0;i<=z;i++) {
  heatmapYData.push(i);
}

//渲染图表
// $.getJSON('data/heatmap.json').done(function(data) {
  //heatmapChart.hideLoading();
  
// });

/********** 窗口大小改变时，重置报表大小 ********************/
window.onresize = function() {
  // bmapChart.resize();
  heatmapChart.resize();
  coordChart.resize();
};

window.addEventListener('resize', myChart.resize);