let requestedFields = ["Blood group","Critical allergies","Current medications"];
let requestPurpose = "Emergency treatment";
let requestDuration = 30;
let accessTimer = null;
let remainingSeconds = 1800;

function showToast(message){
  const toast=document.getElementById("toast");
  toast.textContent=message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2600);
}

function showPatient(){
  setTab("patient");
  document.getElementById("demo").scrollIntoView({behavior:"smooth",block:"start"});
}

function openHospital(){
  document.getElementById("modal").classList.add("show");
}

function closeModal(){
  document.getElementById("modal").classList.remove("show");
}

function toggleMenu(){
  const nav=document.querySelector(".navbar nav");
  const visible=getComputedStyle(nav).display!=="none";
  if(visible) nav.style.display="none";
  else{
    nav.style.display="flex";
    nav.style.position="absolute";
    nav.style.top="76px";
    nav.style.left="0";
    nav.style.right="0";
    nav.style.padding="20px";
    nav.style.background="#091725";
    nav.style.flexDirection="column";
    nav.style.alignItems="stretch";
  }
}

function setTab(tab){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  document.querySelectorAll(".demo-view").forEach(v=>v.classList.remove("active"));
  const target=document.getElementById("view-"+tab);
  if(target) target.classList.add("active");
  document.getElementById("demo").scrollIntoView({behavior:"smooth",block:"start"});
}

function getSelectedFields(){
  return [...document.querySelectorAll('.check-grid input:checked')].map(x=>x.dataset.field);
}

function sendAccessRequest(){
  requestedFields=getSelectedFields();
  requestPurpose=document.getElementById("purpose").value;
  requestDuration=parseInt(document.getElementById("duration").value,10);

  if(requestedFields.length===0){
    showToast("Select at least one emergency field.");
    return;
  }

  document.getElementById("consentPurpose").textContent=requestPurpose;
  document.getElementById("consentDuration").textContent=requestDuration+" minutes";
  document.getElementById("requestCount").textContent=requestedFields.length+" field"+(requestedFields.length===1?"":"s");

  const list=document.getElementById("requestedList");
  const icons={"Blood group":"🩸","Critical allergies":"⚠","Current medications":"💊","Medical conditions":"🏥","Emergency contact":"📞"};
  list.innerHTML=requestedFields.map(field=>`<div>${icons[field]||"•"} <span>${field}</span><b>Requested</b></div>`).join("");

  setTab("consent");
  showToast("Access request sent to patient.");
}

function allowAccess(){
  remainingSeconds=requestDuration*60;
  document.getElementById("recordPurpose").textContent=requestPurpose;
  document.getElementById("recordFields").textContent=requestedFields.join(", ");
  document.getElementById("recordSummary").textContent=`City General Hospital can view ${requestedFields.length} approved field${requestedFields.length===1?"":"s"}.`;
  document.getElementById("timerLabel").textContent=formatTime(remainingSeconds);
  document.querySelector(".timer-ring").textContent=requestDuration;

  setTab("record");
  startTimer();
  showToast("Consent granted. Temporary access is now active.");
}

function denyAccess(){
  document.querySelector(".pending-pill").textContent="● DENIED";
  document.querySelector(".pending-pill").style.color="#ff8e9b";
  document.querySelector(".pending-pill").style.background="rgba(255,111,126,.08)";
  showToast("Access request denied. No information was released.");
}

function startTimer(){
  clearInterval(accessTimer);
  document.getElementById("accessStatus").textContent="● ACCESS ACTIVE";
  document.getElementById("accessStatus").style.color="var(--green)";
  accessTimer=setInterval(()=>{
    remainingSeconds--;
    if(remainingSeconds<=0){
      clearInterval(accessTimer);
      remainingSeconds=0;
      document.getElementById("accessStatus").textContent="● ACCESS EXPIRED";
      document.getElementById("accessStatus").style.color="#ff9da8";
      document.getElementById("timerLabel").textContent="00:00";
      showToast("Temporary access has expired.");
      return;
    }
    document.getElementById("timerLabel").textContent=formatTime(remainingSeconds);
    const ring=document.querySelector(".timer-ring");
    ring.textContent=Math.ceil(remainingSeconds/60);
  },1000);
}

function formatTime(sec){
  const m=Math.floor(sec/60).toString().padStart(2,"0");
  const s=(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function resetDemo(){
  clearInterval(accessTimer);
  requestedFields=["Blood group","Critical allergies","Current medications"];
  requestPurpose="Emergency treatment";
  requestDuration=30;
  document.querySelectorAll(".check-grid input").forEach((x,i)=>x.checked=i<3);
  document.getElementById("purpose").value="Emergency treatment";
  document.getElementById("duration").value="30";
  document.querySelector(".pending-pill").textContent="● PENDING";
  document.querySelector(".pending-pill").style.color="#ffca78";
  document.querySelector(".pending-pill").style.background="rgba(255,190,89,.08)";
  setTab("patient");
  showToast("Prototype reset.");
}

/* Optional real QR generation.
   If the QRCode.js CDN is reachable, replace the visual placeholder with a real QR. */
window.addEventListener("load",()=>{
  try{
    if(window.QRCode){
      ["heroQr","demoQr"].forEach(id=>{
        const el=document.getElementById(id);
        if(!el) return;
        el.innerHTML="";
        new QRCode(el,{
          text:"https://example.org/emergency-profile/DEMO-7F2A9C",
          width:id==="demoQr"?150:56,
          height:id==="demoQr"?150:56,
          colorDark:"#0b1620",
          colorLight:"#ffffff",
          correctLevel:QRCode.CorrectLevel.M
        });
      });
    }
  }catch(e){/* fallback visual QR remains in place */}
});

document.getElementById("modal").addEventListener("click",e=>{
  if(e.target.id==="modal") closeModal();
});
