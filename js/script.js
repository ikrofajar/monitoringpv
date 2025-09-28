const SUPABASE_URL = "https://bryjpjzvsadfvjwqgwak.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWpwanp2c2FkZnZqd3Fnd2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzA0MDUsImV4cCI6MjA3NDAwNjQwNX0.1iWQJhtE02t4JTcutIPkzxmn2qyx-Z7JCKFDQ8itCw8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const dataBody = document.getElementById("data-body");
const water = document.getElementById("water");
const valueDisplay = document.getElementById("valueDisplay");
const radius = 60;
const circumference = 2 * Math.PI * radius;
const arcLength = circumference * (260 / 360);
water.style.strokeDasharray = `${arcLength} ${circumference}`;
water.style.strokeDashoffset = arcLength;

const minTemp = 0;
const maxTemp = 50;

function setLevel(temp) {
  const percent = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
  const offset = arcLength - (percent / 100) * arcLength;
  water.style.strokeDashoffset = offset;
  valueDisplay.textContent = `${temp.toFixed(1)}°C`;
}
function updateDashboard(d) {
  document.getElementById("suhu1").textContent = d.suhu1 + " °C";
  document.getElementById("kelembaban1").textContent = d.kelembaban1 + " %";
  document.getElementById("suhu2").textContent = d.suhu2 + " °C";
  document.getElementById("kelembaban2").textContent = d.kelembaban2 + " %";
  document.getElementById("uv_index").textContent = d.uv_index;
  document.getElementById("uv_intensity").textContent = d.uv_intensity;
  document.getElementById("debu").textContent = d.debu + " µg/m³";
  document.getElementById("curah_hujan").textContent = d.curah_hujan + " mm";
  document.getElementById("kecepatan_angin").textContent = d.kecepatan_angin + " m/s";
  document.getElementById("arah_angin").textContent = d.arah_angin;
  document.getElementById("irradiance").textContent = d.irradiance;
  let rataSuhu = ((d.suhu1 + d.suhu2) / 2).toFixed(1);
  setLevel(parseFloat(rataSuhu));
  let kondisi;
  if (rataSuhu < 18) {kondisi = "Dingin";}
  else if (rataSuhu >= 18 && rataSuhu <= 26) {kondisi = "Normal";}
  else {kondisi = "Panas";}
  document.getElementById("kondisiCuaca").textContent = kondisi;
}
function initCharts() {
  if (!window.allCharts) window.allCharts = {};
  const chartConfigs = [
    {id:'chartSuhu', labels:['Suhu 1','Suhu 2'], colors:[[255,99,132],[255,159,64]]},
    {id:'chartKelembaban', labels:['Kelembaban 1','Kelembaban 2'], colors:[[54,162,235],[75,192,192]]},
    {id:'chartUV', labels:['UV Index','UV Intensity'], colors:[[255,206,86],[255,159,64]]},
    {id:'chartAngin', labels:['Kecepatan Angin'], colors:[[75,192,192]]},
    {id:'chartRadiasi', labels:['Irradiance'], colors:[[255,159,64]]},
    {id:'chartDebu', labels:['Debu'], colors:[[153,102,255]]},
    {id:'chartHujan', labels:['Curah Hujan'], colors:[[54,162,235]]}
  ];
  const createGradient = (ctx, r, g, b) => {
    const grad = ctx.createLinearGradient(0, 0 , 0, ctx.canvas.height);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.4)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},0.15)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    return grad;
  };
  chartConfigs.forEach(cfg => {
    const ctx = document.getElementById(cfg.id).getContext('2d');
    if (window.allCharts[cfg.id]) window.allCharts[cfg.id].destroy();
    const datasets = cfg.labels.map((label,i) => ({
      label,
      data:[],
      borderColor:`rgb(${cfg.colors[i].join(',')})`,
      backgroundColor:createGradient(ctx,...cfg.colors[i]),
      fill:true,
      tension:0.35,
      pointRadius:5,
      pointHoverRadius:7,
      pointBackgroundColor:`rgb(${cfg.colors[i].join(',')})`,
      pointHoverBackgroundColor:'#fff',
      borderWidth:3,
      shadowOffsetX:0,
      shadowOffsetY:4,
      shadowBlur:6,
      shadowColor:`rgba(0,0,0,0.1)`
    }));
    window.allCharts[cfg.id] = new Chart(ctx,{
      type:'line',
      data:{labels:[], datasets},
      options:{
        responsive:true,
        interaction:{mode:'index',intersect:false},
        plugins:{
          legend:{position:'top', labels:{boxWidth:12, padding:15, usePointStyle:true}},
          tooltip:{
            backgroundColor:'rgba(0,0,0,0.7)',
            titleColor:'#fff',
            bodyColor:'#fff',
            padding:10,
            cornerRadius:8
          }
        },
        scales:{
          x:{grid:{display:false}, ticks:{color:'#666', padding:10}},
          y:{grid:{color:'rgba(200,200,200,0.1)'}, ticks:{color:'#666', padding:10}}
        }
      }
    });
  });
}
function arahAnginToRadian(text) {
  const map = {
    "Utara": 0,
    "Timur Laut": 45,
    "Timur": 90,
    "Tenggara": 135,
    "Selatan": 180,
    "Barat Daya": 225,
    "Barat": 270,
    "Barat Laut": 315
  };
  const deg = map[text] !== undefined ? map[text] : 0;
  return deg * Math.PI / 180; // hasil radian
}
function updateAllCharts(entry){
  const timeLabel = new Date(entry.timestamp).toLocaleTimeString('id-ID');
  const charts = [
    {chart:window.allCharts['chartSuhu'], values:[parseFloat(entry.suhu1), parseFloat(entry.suhu2)]},
    {chart:window.allCharts['chartKelembaban'], values:[parseFloat(entry.kelembaban1), parseFloat(entry.kelembaban2)]},
    {chart:window.allCharts['chartUV'], values:[parseFloat(entry.uv_index), parseFloat(entry.uv_intensity)]},
    {chart:window.allCharts['chartAngin'], values:[parseFloat(entry.kecepatan_angin)]},
    {chart:window.allCharts['chartRadiasi'], values:[parseFloat(entry.irradiance)]},
    {chart:window.allCharts['chartDebu'], values:[parseFloat(entry.debu)]},
    {chart:window.allCharts['chartHujan'], values:[parseFloat(entry.curah_hujan)]}
  ];
  charts.forEach(c=>{
    if(c.chart.data.labels.length>=10){
      c.chart.data.labels.shift();
      c.chart.data.datasets.forEach((ds,i)=>{
        if(c.values[i]!==undefined) ds.data.shift();
      });
    }
    if(c.chart.data.labels.length<10) c.chart.data.labels.push(timeLabel);
    c.chart.data.datasets.forEach((ds,i)=>{
      if(c.values[i]!==undefined) ds.data.push(c.values[i]);
    });
    c.chart.update();
  });
  const compass = document.getElementById('compass');
  if(compass){
    const ctx = compass.getContext('2d');
    const angle = arahAnginToRadian(entry.arah_angin);
    const center = 125;
    ctx.clearRect(0,0,250,250);
    ctx.beginPath();
    ctx.arc(center,center,100,0,2*Math.PI);
    ctx.strokeStyle="#bbb";
    ctx.lineWidth=3;
    ctx.shadowColor='rgba(0,0,0,0.08)';
    ctx.shadowBlur=15;
    ctx.stroke();
    for(let i=0;i<360;i+=15){
      const tickLen = (i%45===0)?12:6;
      const rad = i*Math.PI/180;
      ctx.beginPath();
      ctx.moveTo(center + 100 * Math.cos(rad - Math.PI/2), center + 100 * Math.sin(rad - Math.PI/2));
      ctx.lineTo(center + (100-tickLen) * Math.cos(rad - Math.PI/2), center + (100-tickLen) * Math.sin(rad - Math.PI/2));
      ctx.strokeStyle="#aaa";
      ctx.lineWidth=1;
      ctx.stroke();
    }
    const directions = ['U','TL','T','TG','S','BD','B','BL'];
    directions.forEach((dir,i)=>{
      const dirAngle = i * 45 * Math.PI/180;
      const x = center + (100+15) * Math.cos(dirAngle - Math.PI/2);
      const y = center + (100+15) * Math.sin(dirAngle - Math.PI/2);
      ctx.fillStyle=(dir==='U'||dir==='T'||dir==='S'||dir==='B')?'#ff4d4f':'#333';
      ctx.font="bold 14px 'Arial', sans-serif";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillText(dir,x,y);
    });
    ctx.beginPath();
    ctx.moveTo(center,center);
    ctx.lineTo(center+75*Math.cos(angle-Math.PI/2), center+75*Math.sin(angle-Math.PI/2));
    ctx.strokeStyle = '#ff4d4f';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,77,79,0.5)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, center, 10, 0, 2*Math.PI);
    ctx.fillStyle = '#ff4d4f';
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + 75*Math.cos(angle-Math.PI/2), center + 75*Math.sin(angle-Math.PI/2));
    ctx.strokeStyle = 'rgba(255,77,79,0.2)';
    ctx.lineWidth = 12;
    ctx.stroke();
    document.getElementById('chartArahAngin').textContent = `Arah: ${entry.arah_angin}`;
  }
}
function formatRow(d) {
  const ts = new Date(d.timestamp);
  const tanggal = ts.toLocaleDateString('id-ID');
  const waktu = ts.toLocaleTimeString('id-ID');
  return `
  <tr class="bg-white">
  <td class="border px-2 py-1">${tanggal}</td>
  <td class="border px-2 py-1">${waktu}</td>
  <td class="border px-2 py-1">${d.suhu1}</td>
  <td class="border px-2 py-1">${d.kelembaban1}</td>
  <td class="border px-2 py-1">${d.suhu2}</td>
  <td class="border px-2 py-1">${d.kelembaban2}</td>
  <td class="border px-2 py-1">${d.uv_index}</td>
  <td class="border px-2 py-1">${d.uv_intensity}</td>
  <td class="border px-2 py-1">${d.debu}</td>
  <td class="border px-2 py-1">${d.curah_hujan}</td>
  <td class="border px-2 py-1">${d.kecepatan_angin}</td>
  <td class="border px-2 py-1">${d.arah_angin}</td>
  <td class="border px-2 py-1">${d.irradiance}</td>
  </tr>
  `;
}
async function loadData() {
  const { data, error } = await supabaseClient
    .from('sensor_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(20);
  if (error) { console.error("Error loading data:", error); return; }
  dataBody.innerHTML = data.map(d => formatRow(d)).join("");
  if (data.length) updateDashboard(data[0]);
  data.forEach(updateAllCharts);
}
document.getElementById('downloadCsvBtn').addEventListener('click', async () => {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (!start || !end) return alert("Pilih tanggal mulai dan akhir");
  const { data, error } = await supabaseClient
    .from('sensor_data')
    .select('*')
    .gte('timestamp', start)
    .lte('timestamp', end + "T23:59:59")
    .order('timestamp', { ascending: true });
  if (error) { console.error("Error downloading CSV:", error); return; }
  
  const csvHeader = ["Tanggal","Waktu","Suhu Mono","RH Mono","Suhu Poly","RH Poly","UV Index","UV Intensity","Debu","Curah Hujan","Kecepatan Angin","Arah Angin","Radiasi Matahari"];
  const csvRows = data.map(d => {
    const ts = new Date(d.timestamp);
    return [
      ts.toLocaleDateString('id-ID'),
      ts.toLocaleTimeString('id-ID'),
      d.suhu1, d.kelembaban1, d.suhu2, d.kelembaban2,
      d.uv_index, d.uv_intensity, d.debu, d.curah_hujan,
      d.kecepatan_angin, d.arah_angin, d.irradiance
    ].join(',');
  });
  const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `histori_${start}_${end}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
supabaseClient.channel('sensor-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, payload => {
    const entry = payload.new;
    updateAllCharts(entry);
    const tr = document.createElement("tr");
    tr.innerHTML = formatRow(entry);
    tr.classList.add("new-entry");
    dataBody.prepend(tr);
    setTimeout(() => tr.classList.remove("new-entry"), 5000);
    while (dataBody.rows.length > 50) dataBody.removeChild(dataBody.lastChild);
    updateDashboard(entry);
  }).subscribe();
initCharts();
loadData();

function updateClock() {
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  document.getElementById('clock').textContent = now.toLocaleTimeString('id-ID', options);
}
setInterval(updateClock, 1000);
updateClock();
function showPage(page, el) {
  ["utama", "grafik", "histori"].forEach(id => document.getElementById(id).classList.add("hidden"));
  document.getElementById(page).classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.remove("text-blue-600", "font-semibold", "border-b-2", "border-blue-600");
    btn.classList.add("text-gray-600");
  });
  if (el) {
    el.classList.remove("text-gray-600");
    el.classList.add("text-blue-600", "font-semibold", "border-b-2", "border-blue-600");
  }
  adjustContentOffset();
}
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn) menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("hidden"));
});
function adjustContentOffset() {
  const header = document.querySelector("header");
  const pages = document.querySelectorAll("#utama, #grafik, #histori");
  if (header) {
    const offset = header.offsetHeight + 8;
    pages.forEach(page => page.style.paddingTop = offset + "px");
  }
}
window.addEventListener("load", adjustContentOffset);
window.addEventListener("resize", adjustContentOffset);
function toggleFooter(button) {
  const list = button.nextElementSibling;
  if (!list) return;
  list.classList.toggle("hidden");
  const icon = button.querySelector("span");
  if (icon) {
    icon.textContent = list.classList.contains("hidden") ? "+" : "−";
  }
}
