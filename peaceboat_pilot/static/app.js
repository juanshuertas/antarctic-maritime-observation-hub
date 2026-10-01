const PILOT="PB124-OLEA-2026";
let token=localStorage.getItem("pb124Token")||"", user=(()=>{try{return JSON.parse(localStorage.getItem("pb124User")||"null")}catch{return null}})(), fieldOn=false, geoWatch=null, position=null, selectedPhoto=null, orient={heading:null,pitch:null,roll:null}, motion={acceleration:null,rotation:null}, snoozeUntil=0;
let deviceId=localStorage.getItem("pb124DeviceId")||crypto.randomUUID();localStorage.setItem("pb124DeviceId",deviceId);
const $=id=>document.getElementById(id);
const DBN="olea-pb124-field", STORE="queue";
function idb(){return new Promise((res,rej)=>{let r=indexedDB.open(DBN,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:"observation_id"});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function putLocal(x){let d=await idb();return new Promise((res,rej)=>{let t=d.transaction(STORE,"readwrite");t.objectStore(STORE).put(x);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
async function allLocal(){let d=await idb();return new Promise((res,rej)=>{let r=d.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function getLocal(id){let d=await idb();return new Promise((res,rej)=>{let r=d.transaction(STORE).objectStore(STORE).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function api(path,opt={}){opt.headers={...(opt.headers||{}),Authorization:`Bearer ${token}`};return fetch(path,opt)}
function net(){return navigator.onLine?"online":"offline"}
function updateNet(){ $("netBadge").textContent=navigator.onLine?"ONLINE":"OFFLINE"; syncAll(); }
addEventListener("online",updateNet);addEventListener("offline",updateNet);
if("serviceWorker"in navigator)navigator.serviceWorker.register("/peaceboat/sw.js").catch(()=>{});
$("loginBtn").onclick=async()=>{try{let r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:$("username").value,password:$("password").value})});let j=await r.json();if(!r.ok)throw Error(j.detail||"Login failed");token=j.access_token;user=j.user;localStorage.setItem("pb124Token",token);localStorage.setItem("pb124User",JSON.stringify(user));$("loginCard").classList.add("hidden");$("fieldApp").classList.remove("hidden");await refreshLocal();updateNet()}catch(e){$("loginMsg").textContent=e.message}};
function enableLocation(){if(!navigator.geolocation){sensorText("Location: NOT_SUPPORTED");return}if(geoWatch!==null)return;geoWatch=navigator.geolocation.watchPosition(p=>{position=p;$("gpsBadge").textContent=`GPS ±${Math.round(p.coords.accuracy)} m`;sensorText();evaluateOpportunity()},e=>{$("gpsBadge").textContent="GPS NO LOCK";sensorText("Location: SUPPORTED_NO_READING")},{enableHighAccuracy:true,maximumAge:5000,timeout:20000})}
function stopLocation(){if(geoWatch!==null){navigator.geolocation.clearWatch(geoWatch);geoWatch=null}position=null;$("gpsBadge").textContent="GPS —"}
function sensorText(prefix){let loc=position?"SUPPORTED_ACTIVE":(geoWatch!==null?"SUPPORTED_NO_READING":"SUPPORTED_NOT_AUTHORIZED");$("sensorLine").textContent=(prefix||`Location: ${loc}`)+` · Orientation: ${window.DeviceOrientationEvent?(orient.pitch!==null?"SUPPORTED_ACTIVE":"SUPPORTED_NOT_AUTHORIZED"):"NOT_SUPPORTED"} · Motion: ${window.DeviceMotionEvent?(motion.acceleration?"SUPPORTED_ACTIVE":"SUPPORTED_NOT_AUTHORIZED"):"NOT_SUPPORTED"}`}
$("enableLocation").onclick=enableLocation;
async function enableSensors(){try{if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function")await DeviceOrientationEvent.requestPermission();if(typeof DeviceMotionEvent!=="undefined"&&typeof DeviceMotionEvent.requestPermission==="function")await DeviceMotionEvent.requestPermission()}catch(e){}
addEventListener("deviceorientation",e=>{orient={heading:e.webkitCompassHeading??(e.alpha!=null?(360-e.alpha)%360:null),pitch:e.beta,roll:e.gamma};sensorText()});
addEventListener("devicemotion",e=>{motion={acceleration:e.acceleration?{x:e.acceleration.x,y:e.acceleration.y,z:e.acceleration.z}:null,rotation:e.rotationRate?{alpha:e.rotationRate.alpha,beta:e.rotationRate.beta,gamma:e.rotationRate.gamma}:null};sensorText()});sensorText()}
$("enableSensors").onclick=enableSensors;
function toggleField(){fieldOn=!fieldOn;$("fieldState").textContent=fieldOn?"FIELD MODE ACTIVE":"FIELD MODE OFF";$("fieldToggle").textContent=fieldOn?"TURN OFF":"TURN ON";if(fieldOn)enableLocation();else stopLocation();evaluateOpportunity()}
$("fieldToggle").onclick=toggleField;
function openCapture(){if(!fieldOn)toggleField();$("obsForm").classList.remove("hidden");$("obsForm").scrollIntoView({behavior:"smooth"})}
$("captureTop").onclick=openCapture;$("cancelCapture").onclick=()=>$("obsForm").classList.add("hidden");
function photoChosen(f){selectedPhoto=f||null;$("photoState").textContent=f?`${f.name} · ${(f.size/1024/1024).toFixed(1)} MB`:"Photo optional"}
async function makePreview(file){
  if(!file) return null;
  try{
    const url=URL.createObjectURL(file);
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
    const max=1600, scale=Math.min(1,max/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
    const c=document.createElement("canvas");c.width=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));c.height=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    return await new Promise(res=>c.toBlob(res,"image/jpeg",0.85));
  }catch(e){return null}
}
$("photoCapture").onchange=e=>photoChosen(e.target.files[0]);$("photoInput").onchange=e=>{photoChosen(e.target.files[0]);openCapture()};
async function hashBlob(blob){let b=await crypto.subtle.digest("SHA-256",await blob.arrayBuffer());return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function stability(){if(!motion.acceleration)return"STABLE";let a=motion.acceleration,m=Math.sqrt((a.x||0)**2+(a.y||0)**2+(a.z||0)**2);return m>3?"HIGH_MOTION":m>1?"MODERATE_MOTION":"STABLE"}
$("obsForm").onsubmit=async e=>{e.preventDefault();if(!position&&!confirm("No GPS lock is available. Save with location uncertainty?"))return;
let id=crypto.randomUUID(), now=new Date(), c=position?.coords||{}, photo=null;
if(selectedPhoto){photo={photo_id:crypto.randomUUID(),blob:selectedPhoto,preview:await makePreview(selectedPhoto),name:selectedPhoto.name,type:selectedPhoto.type||"image/jpeg",sha256:await hashBlob(selectedPhoto)}}
let rec={observation_id:id,device_id:deviceId,observed_at_utc:now.toISOString(),device_local_time:now.toString(),latitude:c.latitude??null,longitude:c.longitude??null,gps_accuracy_m:c.accuracy??null,altitude_m:c.altitude??null,altitude_accuracy_m:c.altitudeAccuracy??null,heading_deg:c.heading??orient.heading??null,speed_mps:c.speed??null,position_timestamp_utc:position?new Date(position.timestamp).toISOString():null,status:"PENDING_SYNC",payload:{visibility:$("visibility").value,sea_state_visual:$("seaState").value,whitecaps:$("whitecaps").value,sea_surface_appearance:$("surface").value,sky_cloud:$("sky").value,observer_corrected_context:$("context").value,wildlife:$("wildlife").value,floating_material:$("floating").value,notes:$("notes").value,network_state_at_capture:net(),device_pitch_deg:orient.pitch,device_roll_deg:orient.roll,device_heading_deg:orient.heading,device_motion_snapshot:motion,derived_capture_stability:stability(),auto_context:"uncertain",sensor_states:{location:position?"SUPPORTED_ACTIVE":"SUPPORTED_NO_READING",orientation:orient.pitch!==null?"SUPPORTED_ACTIVE":(window.DeviceOrientationEvent?"SUPPORTED_NOT_AUTHORIZED":"NOT_SUPPORTED"),motion:motion.acceleration?"SUPPORTED_ACTIVE":(window.DeviceMotionEvent?"SUPPORTED_NOT_AUTHORIZED":"NOT_SUPPORTED")}},photo};
await putLocal(rec);$("saveStatus").textContent=navigator.onLine?"SAVED SAFELY ON THIS PHONE · preparing synchronization":"SAVED SAFELY ON THIS PHONE · WAITING FOR INTERNET";$("obsForm").classList.add("hidden");selectedPhoto=null;photoChosen(null);await refreshLocal();await syncOne(id)};
async function syncOne(id){if(!navigator.onLine||!token)return;let rec=await getLocal(id);if(!rec||rec.synced)return;
try{rec.status="SYNCING";await putLocal(rec);$("saveStatus").textContent="SYNCING";
let body={...rec};delete body.photo;delete body.synced;body.status="PILOT_FIELD_OBSERVATION";
let r=await api(`/api/pilots/${PILOT}/observations/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!r.ok)throw Error(await r.text());
if(rec.photo){let fd=new FormData();fd.append("file",rec.photo.blob,rec.photo.name);if(rec.photo.preview)fd.append("preview",rec.photo.preview,"preview.jpg");fd.append("photo_id",rec.photo.photo_id);fd.append("client_sha256",rec.photo.sha256);fd.append("app_metadata_json",JSON.stringify({device_id:deviceId,app_capture_timestamp_utc:rec.observed_at_utc,device_local_timestamp:rec.device_local_time,device_gps_latitude:rec.latitude,device_gps_longitude:rec.longitude,device_gps_accuracy_m:rec.gps_accuracy_m,device_altitude_m:rec.altitude_m,device_heading_deg:rec.heading_deg,device_speed_mps:rec.speed_mps,device_pitch_deg:rec.payload.device_pitch_deg,device_roll_deg:rec.payload.device_roll_deg}));let pr=await api(`/api/pilots/${PILOT}/observations/${id}/photos`,{method:"POST",body:fd});if(!pr.ok)throw Error(await pr.text())}
rec.synced=true;rec.status="SYNCED";await putLocal(rec);$("saveStatus").textContent="SYNCHRONIZED WITH OLEA";await refreshLocal()
}catch(e){rec.status="SYNC_ERROR";rec.sync_error=String(e);await putLocal(rec);$("saveStatus").textContent="SYNC ERROR · record remains safe on this phone";await refreshLocal()}}
async function syncAll(){if(!navigator.onLine||!token)return;for(let r of await allLocal())if(!r.synced)await syncOne(r.observation_id)}
async function refreshLocal(){let a=await allLocal(),pending=a.filter(x=>!x.synced).length;$("pendingBadge").textContent=`${pending} PENDING`;$("progress").textContent=`${Math.min(a.length,5)} / 5`;let last=[...a].sort((x,y)=>y.observed_at_utc.localeCompare(x.observed_at_utc))[0];$("lastObs").textContent=last?`${last.observed_at_utc} · ${last.status}`:"None";evaluateOpportunity()}
function hav(a,b,c,d){let R=6371e3,p1=a*Math.PI/180,p2=c*Math.PI/180,dp=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180,q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(q))}
async function evaluateOpportunity(){if(Date.now()<snoozeUntil){$("opportunityReason").textContent="Snoozed.";return}if(!fieldOn){$("opportunityReason").textContent="Activate Field Mode when safe and convenient.";return}let a=await allLocal(), last=[...a].sort((x,y)=>y.observed_at_utc.localeCompare(x.observed_at_utc))[0];if(position?.coords?.accuracy<=25&&!last){$("opportunityReason").textContent=`Good GPS ±${Math.round(position.coords.accuracy)} m · first reference opportunity.`;return}if(last){let mins=(Date.now()-Date.parse(last.observed_at_utc))/60000;if(mins>=60){$("opportunityReason").textContent=`${Math.round(mins)} minutes since previous observation.`;return}if(position&&last.latitude!=null){let km=hav(last.latitude,last.longitude,position.coords.latitude,position.coords.longitude)/1000;if(km>=15){$("opportunityReason").textContent=`Good sampling gap · ${km.toFixed(0)} km since previous observation.`;return}}}$("opportunityReason").textContent="No urgent sampling gap. Quality over quantity."}
$("snooze").onclick=()=>{snoozeUntil=Date.now()+60*60*1000;$("opportunityReason").textContent="Snoozed for 60 minutes."};$("dismiss").onclick=()=>{$("opportunityReason").textContent="Opportunity dismissed."};$("notSafe").onclick=()=>{snoozeUntil=Date.now()+60*60*1000;$("opportunityReason").textContent="Safety/convenience noted. No observation required."};
setInterval(evaluateOpportunity,60000);
async function boot(){
  updateNet();
  if(token&&user){
    $("loginCard").classList.add("hidden");
    $("fieldApp").classList.remove("hidden");
    await refreshLocal();
    if(navigator.onLine) syncAll();
  }
}
boot();
