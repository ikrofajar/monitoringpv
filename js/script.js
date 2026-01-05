const SUPABASE_URL = "https://bryjpjzvsadfvjwqgwak.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWpwanp2c2FkZnZqd3Fnd2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzA0MDUsImV4cCI6MjA3NDAwNjQwNX0.1iWQJhtE02t4JTcutIPkzxmn2qyx-Z7JCKFDQ8itCw8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const dataBody = document.getElementById("data-body");
let lastData = null;
// Mapping posisi panel → sensor
const PANEL_MAP_MONO = {
  p1: null,
  p2: null,
  p3: "ds6",
  p4: "suhu_mono",      // tengah atas
  p5: null,
  p6: null,
  p7: "ds4",

  p8: "ds0",
  p9: null,
  p10: null,
  p11: "suhu_mono",     // tengah bawah
  p12: "ds5",
  p13: null,
  p14: null
};
const PANEL_MAP_POLY = {
  p1: null,
  p2: null,
  p3: "ds2",
  p4: "suhu_poly",       // tengah atas
  p5: null,
  p6: null,
  p7: "ds1",

  p8: "ds7",
  p9: null,
  p10: null,
  p11: "suhu_poly",     // tengah bawah
  p12: "ds3",
  p13: null,
  p14: null
};
const MONO_SENSORS = [
  "ds4",
  "ds5",
  "ds6",
  "ds0",
  "suhu_mono"
];
const POLY_SENSORS = [
  "ds1",
  "ds3",
  "ds2",
  "ds7",
  "suhu_poly"
];
function hitungRataPanel(data, sensorList) {
  const values = sensorList
    .map(k => parseFloat(data[k]))
    .filter(v => !isNaN(v));

  if (!values.length) return null;

  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}
// ====== PANEL GRID BUILDER (WAJIB ADA) ======
function buildPanelGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  for (let i = 1; i <= 14; i++) {
    const div = document.createElement("div");
    div.className =
      "solar-panel bg-gray-100 rounded-xl p-3 text-center transition";
    div.innerHTML = `
      <div class="text-[10px] text-gray-400">p${i}</div>
      <div class="text-xs text-gray-400">No Sensor</div>
    `;
    container.appendChild(div);
  }
}
function updateSolarPanels(d, type = "mono") {
  const PANEL_MAP = type === "poly" ? PANEL_MAP_POLY : PANEL_MAP_MONO;
  
  document.querySelectorAll(
  type === "poly"
    ? "#polyGrid .solar-panel"
    : "#monoGrid .solar-panel"
  )
    .forEach((panel, i) => {

      const panelIndex = "p" + (i + 1);
      const key = PANEL_MAP[panelIndex];

      if (!key || d[key] === undefined) {
        panel.classList.remove(
          "bg-green-100","bg-yellow-200","bg-orange-200","bg-red-200"
        );
        panel.classList.add("bg-gray-100");
        panel.innerHTML = `
          <div class="text-[10px] text-gray-400">${panelIndex}</div>
          <div class="text-xs text-gray-400">No Sensor</div>
        `;
        return;
      }

      const val = parseFloat(d[key]);
      if (isNaN(val)) return;

      let color = "bg-green-100";
      if (val >= 50) color = "bg-red-200";
      else if (val >= 40) color = "bg-orange-200";
      else if (val >= 30) color = "bg-yellow-200";

      panel.classList.remove(
        "bg-green-100","bg-yellow-200","bg-orange-200","bg-red-200"
      );
      panel.classList.add(color);

      panel.innerHTML = `
        <div class="text-[10px] text-gray-600">${panelIndex} • ${key}</div>
        <div class="text-sm font-bold">${val.toFixed(1)} °C</div>
      `;
    });
}
function updatePopupSolarPanels(d, type = "mono") {
  const PANEL_MAP = type === "poly" ? PANEL_MAP_POLY : PANEL_MAP_MONO;

  document
    .querySelectorAll("#PopupContent .solar-panel")
    .forEach(panel => {
      const panelIndex = panel.dataset.panel;
      const key = PANEL_MAP[panelIndex];

      if (!key || d[key] === undefined) {
        panel.classList.remove(
          "bg-green-100","bg-yellow-200","bg-orange-200","bg-red-200"
        );
        panel.classList.add("bg-gray-100");
        panel.innerHTML = `
          <div class="text-[10px] text-gray-400">${panelIndex}</div>
          <div class="text-xs text-gray-400">No Sensor</div>
        `;
        return;
      }

      const val = parseFloat(d[key]);
      if (isNaN(val)) return;

      let color = "bg-green-100";
      if (val >= 50) color = "bg-red-200";
      else if (val >= 40) color = "bg-orange-200";
      else if (val >= 30) color = "bg-yellow-200";

      panel.classList.remove(
        "bg-green-100","bg-yellow-200","bg-orange-200","bg-red-200"
      );
      panel.classList.add(color);

      panel.innerHTML = `
        <div class="text-[10px] text-gray-600">${panelIndex} • ${key}</div>
        <div class="text-sm font-bold">${val.toFixed(1)} °C</div>
      `;
    });
}
function updateDashboard(d) {
  lastData = d;

  // === UPDATE PANEL MONO & POLY ===
  updateSolarPanels(d, "mono");
  updateSolarPanels(d, "poly");

  document.getElementById("kelembaban_mono").textContent = d.kelembaban_mono + " %";
  document.getElementById("kelembaban_poly").textContent = d.kelembaban_poly + " %";
  document.getElementById("tegangan_mono").textContent = d.tegangan_mono !== null ? d.tegangan_mono + " V" : "-";
  document.getElementById("arus_mono").textContent = d.arus_mono !== null ? d.arus_mono + " A" : "-";
  document.getElementById("tegangan_poly").textContent = d.tegangan_poly !== null ? d.tegangan_poly + " V" : "-";
  document.getElementById("arus_poly").textContent = d.arus_poly !== null ? d.arus_poly + " A" : "-";
  document.getElementById("uv").textContent = d.uv;
  document.getElementById("debu").textContent = d.debu + " µg/m³";
  document.getElementById("curah_hujan").textContent = d.curah_hujan + " mm";
  document.getElementById("kecepatan_angin").textContent = d.kecepatan_angin + " km/h";
  document.getElementById("arah_angin").textContent = d.arah_angin;
  document.getElementById("irradiance").textContent = d.irradiance + " W/m²";

  // ===== RATA-RATA SUHU PANEL =====
  const avgMono = hitungRataPanel(d, MONO_SENSORS);
  const avgPoly = hitungRataPanel(d, POLY_SENSORS);

  if (avgMono !== null) {
    document.getElementById("avg-mono").textContent =
      avgMono.toFixed(1) + " °C";
  }

  if (avgPoly !== null) {
    document.getElementById("avg-poly").textContent =
      avgPoly.toFixed(1) + " °C";
  }
    // === UPDATE POPUP JIKA SEDANG TERBUKA ===
  const popup = document.getElementById("panelPopup");
  if (popup && !popup.classList.contains("hidden")) {
    const title = document.getElementById("PopupTitle").textContent.toLowerCase();
    if (title.includes("mono")) updatePopupSolarPanels(d, "mono");
    if (title.includes("poly")) updatePopupSolarPanels(d, "poly");
  }
}
function toggleGrid(type) {
  const summary = document.getElementById("summary-panel");
  const monoGrid = document.getElementById("grid-mono");
  const polyGrid = document.getElementById("grid-poly");

  if (!summary || !monoGrid || !polyGrid) return;

  monoGrid.classList.add("hidden");
  polyGrid.classList.add("hidden");

  if (type === "mono") monoGrid.classList.remove("hidden");
  if (type === "poly") polyGrid.classList.remove("hidden");

  summary.classList.add("hidden");
}
function openPanelPopup(type) {
  const popup = document.getElementById("panelPopup");
  const title = document.getElementById("PopupTitle");
  const content = document.getElementById("PopupContent");

  if (!popup || !title || !content) return;

  title.textContent = `Detail Panel ${type.toUpperCase()} (2 × 7)`;
  content.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-7 gap-3";

  for (let i = 1; i <= 14; i++) {
    const div = document.createElement("div");
    div.className = "solar-panel bg-gray-100 rounded-xl p-3 text-center";
    div.dataset.panel = "p" + i;

    div.innerHTML = `
      <div class="text-[10px] text-gray-400">p${i}</div>
      <div class="text-xs text-gray-400">No Sensor</div>
    `;

    grid.appendChild(div);
  }

  content.appendChild(grid);

  popup.classList.remove("hidden");
  popup.classList.add("flex");

  if (lastData) updatePopupSolarPanels(lastData, type);
}
function closePanelPopup() {
  const Popup = document.getElementById("panelPopup");
  Popup.classList.add("hidden");
  Popup.classList.remove("flex");
}
document.getElementById("panelPopup").addEventListener("click", e => {
  if (e.target.id === "panelPopup") closePanelPopup();
});


function initCharts() {
  if (!window.allCharts) window.allCharts = {};
  const chartConfigs = [
    {id:'chartSuhu', labels:['Suhu 1','Suhu 2'], colors:[[255,99,132],[255,159,64]]},
    {id:'chartKelembaban', labels:['Kelembaban 1','Kelembaban 2'], colors:[[54,162,235],[75,192,192]]},
    {id:'chartUV', labels:['UV Index'], colors:[[255,206,86]]},
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
  const timeLabel = formatTimestamp(entry.timestamp).split(" ")[1];
  //const timeLabel = new Date(entry.timestamp).toLocaleTimeString('id-ID');
  const charts = [
    {chart:window.allCharts['chartSuhu'], values:[parseFloat(entry.suhu_mono), parseFloat(entry.suhu_poly)]},
    {chart:window.allCharts['chartKelembaban'], values:[parseFloat(entry.kelembaban_mono), parseFloat(entry.kelembaban_poly)]},
    {chart:window.allCharts['chartUV'], values:[parseFloat(entry.uv)]},
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
  //const ts = new Date(d.timestamp);
  //const tanggal = ts.toLocaleDateString('id-ID');
  //const waktu = ts.toLocaleTimeString('id-ID');
  const [tanggal, waktu] = formatTimestamp(d.timestamp).split(" ");
  return `
  <tr class="bg-white">
  <td class="border px-2 py-1">${tanggal}</td>
  <td class="border px-2 py-1">${waktu}</td>
  <td class="border px-2 py-1">${d.tegangan_mono}</td>
  <td class="border px-2 py-1">${d.arus_mono}</td>
  <td class="border px-2 py-1">${d.ds4}</td>
  <td class="border px-2 py-1">${d.ds5}</td>
  <td class="border px-2 py-1">${d.suhu_mono}</td>
  <td class="border px-2 py-1">${d.ds6}</td>
  <td class="border px-2 py-1">${d.ds0}</td>
  <td class="border px-2 py-1">${d.kelembaban_poly}</td>
  <td class="border px-2 py-1">${d.tegangan_poly}</td>
  <td class="border px-2 py-1">${d.arus_poly}</td>
  <td class="border px-2 py-1">${d.ds1}</td>
  <td class="border px-2 py-1">${d.ds3}</td>
  <td class="border px-2 py-1">${d.suhu_poly}</td>
  <td class="border px-2 py-1">${d.ds2}</td>
  <td class="border px-2 py-1">${d.ds7}</td>
  <td class="border px-2 py-1">${d.kelembaban_poly}</td>
  <td class="border px-2 py-1">${d.uv}</td>
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
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const pad = n => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
document.getElementById('downloadCsvBtn').addEventListener('click', async () => {
  const startInput = document.getElementById("startDate").value;
  const endInput = document.getElementById("endDate").value;
  if (!startInput || !endInput) return alert("Pilih tanggal & waktu mulai dan akhir");
  const startISO = new Date(startInput).toISOString();
  let endDate = new Date(endInput);
  endDate.setHours(23, 59, 59, 999);
  const endISO = endDate.toISOString();
  const { data, error } = await supabaseClient
    .from('sensor_data')
    .select('*')
    .gte('timestamp', startISO)
    .lte('timestamp', endISO)
    .order('timestamp', { ascending: true });
  if (error) {
    console.error("Error downloading CSV:", error);
    return;
  }
  if (!data || data.length === 0) {
    alert("Tidak ada data pada rentang waktu tersebut");
    return;
  }
  const formatExcel = confirm("Klik OK untuk Excel (.xlsx), Cancel untuk CSV (.csv)");
  const safeStart = startInput.replace(/:/g, "-").replace("T", "_").replace(/\//g, "-");
  const safeEnd = endInput.replace(/:/g, "-").replace("T", "_").replace(/\//g, "-");
  
  if (formatExcel) {
    const wsData = [
      ["Tanggal","Waktu","Tegangan Mono","Arus Mono",
       "Suhu Mono 1","Suhu Mono 2","Suhu Mono 3","Suhu Mono 4","Suhu Mono 5","RH Mono",
       "Tegangan Poly","Arus Poly",
       "Suhu Poly 1","Suhu Poly 2","Suhu Poly 3","Suhu Poly 4","Suhu Poly 5","RH Poly",
       "UV","Radiasi Matahari","Debu","Curah Hujan","Kecepatan Angin","Arah Angin"]
    ];
    data.forEach(d => {
      const [tanggal, waktu] = formatTimestamp(d.timestamp).split(" ");
      //const ts = new Date(d.timestamp);
      wsData.push([
        //ts.toLocaleDateString('id-ID'),
        //ts.toLocaleTimeString('id-ID'),
        tanggal, waktu, d.tegangan_mono, d.arus_mono,
        d.ds4, d.ds5, d.suhu_mono, d.ds6, d.ds0, d.kelembaban_mono,
        d.tegangan_poly, d.arus_poly,
        d.ds1, d.ds3, d.suhu_poly, d.ds2, d.ds7, d.kelembaban_poly,
        d.uv, d.irradiance, d.debu, d.curah_hujan,d.kecepatan_angin, d.arah_angin
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histori Sensor");
    XLSX.writeFile(wb, `histori_${safeStart}_${safeEnd}.xlsx`);
  } else {
  const csvHeader = [
    "Tanggal","Waktu","Tegangan Mono","Arus Mono","Suhu Mono 1","Suhu Mono 2","Suhu Mono 3","Suhu Mono 4","Suhu Mono 5",
    "RH Mono","Tegangan Poly","Arus Poly","Suhu Poly 1","Suhu Poly 2","Suhu Poly 3","Suhu Poly 4","Suhu Poly 5","RH Poly",
    "UV","Radiasi Matahari","Debu","Curah Hujan","Kecepatan Angin","Arah Angin"
  ];
  const csvRows = data.map(d => {
    const [tanggal, waktu] = formatTimestamp(d.timestamp).split(" ");
    //const ts = new Date(d.timestamp);
    return [
      //ts.toLocaleDateString('id-ID'),
      //ts.toLocaleTimeString('id-ID'),
      tanggal, waktu, d.tegangan_mono, d.arus_mono, d.ds4, d.ds5, d.suhu_mono, d.ds6, d.ds0,
      d.kelembaban_mono, d.tegangan_poly, d.arus_poly, d.ds1, d.ds3, d.suhu_poly, d.ds2, d.ds7, d.kelembaban_poly,
      d.uv, d.irradiance, d.debu, d.curah_hujan, d.kecepatan_angin, d.arah_angin
    ].join(',');
  });
  const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `histori_${safeStart}_${safeEnd}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  }
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
  buildPanelGrid("monoGrid");
  buildPanelGrid("polyGrid");
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
