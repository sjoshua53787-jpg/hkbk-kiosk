// Helpers for Chart.js
window.renderBar=function(id, labels, data, label=''){
  if(!window.Chart) return;
  new Chart(document.getElementById(id), {
    type:'bar',
    data:{ labels, datasets:[{ label, data }] },
    options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  });
};
window.renderPie=function(id, placedPct){
  if(!window.Chart) return;
  new Chart(document.getElementById(id), {
    type:'pie',
    data:{ labels:[`Placed (${placedPct}%)`,`Remaining (${(100-placedPct).toFixed(1)}%)`], datasets:[{ data:[placedPct, 100-placedPct] }] },
    options:{ responsive:true }
  });
};
