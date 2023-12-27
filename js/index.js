var dom = document.getElementById('chart-container');
var myChart = echarts.init(dom, 'dark', {
  renderer: 'canvas',
  useDirtyRect: false
});
var app = {};

var option;
var x=10,y=10,z=10;
//梯形坐标如下
const A = { x: 0, z: 0 };
const B = { x: 5, z: 10 };
const C = { x: 6, z: 10 };
const D = { x: 10, z: 0 };

$.getScript(
  './js/simplex-noise.js'
).done(function () {
  var noise = new SimplexNoise(Math.random);
  console.log(noise)
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
    console.log(crossProductPA_AB,crossProductPB_BC,crossProductPC_CD,crossProductPD_DA)
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
  var formatData = isTrapezoid(data,matrixTrapezoid)

  console.log(data)
  console.log(valMin, valMax);
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
});

if (option && typeof option === 'object') {
  myChart.setOption(option);
}

window.addEventListener('resize', myChart.resize);