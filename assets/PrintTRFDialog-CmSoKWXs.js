import{u as O,r as z,s as A,j as e,I as d,B as E,z as k}from"./index-D9TqrYCw.js";import{D as $,a as L,b as I,c as _,d as M,e as P}from"./dialog-WdJlzcfm.js";import{L as n}from"./label-Dy8dWBea.js";import{b as U}from"./ieltsBand-CgNOVqMY.js";function H(t){return t==null?"—":t>=9?"C2":t>=7?"C1":t>=5.5?"B2":t>=4?"B1":t>=2.5?"A2":"A1"}function h(t){if(t==null||t===""||t==="pending"||t==="Pending")return"—";if(typeof t=="number")return t.toFixed(1);const l=parseFloat(t);return isNaN(l)?t:l.toFixed(1)}function a(t){return t==null?"—":String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function F(t){if(!t)return"";const l=String(t).trim();return/^https?:\/\//i.test(l)?a(l):""}function W(t){const l=window.open("","_blank");if(!l)return;const b=h(t.listeningBand),y=h(t.readingBand),w=h(t.writingBand),j=h(t.speakingBand),x=h(t.overallBand),m=t.overallBand!=null?H(t.overallBand):"—",g=t.testType==="full_mock"||t.testType==="mock"?"ACADEMIC":t.testType?.toUpperCase()||"ACADEMIC",C=a(g),u=F(t.centreStampUrl),B=u?`<img src="${u}" style="max-width:100px;max-height:90px;object-fit:contain;" />`:'<div style="width:100px;height:90px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:9px;">Centre Stamp</div>',N=F(t.validationStampUrl),T=N?`<img src="${N}" style="max-width:100px;max-height:90px;object-fit:contain;" />`:'<div style="width:100px;height:90px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:9px;">Validation Stamp</div>',p=`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Test Report Form</title>
<style>
  @page { size: A4 portrait; margin: 12mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; background: #fff; }
  .page { width: 100%; max-width: 210mm; margin: 0 auto; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 4px; }
  .header-left {}
  .header-left h1 { font-size: 36px; font-weight: 900; letter-spacing: 3px; font-style: italic; line-height: 1; }
  .header-left .subtitle { font-size: 18px; font-weight: bold; margin-top: 0; }
  .module-box { border: 2px solid #000; padding: 4px 18px; font-size: 13px; font-weight: bold; display: inline-block; margin-top: 8px; background: #f0f0f0; }

  /* Note */
  .note { padding: 5px 8px; font-size: 8px; border: 1px solid #000; margin: 6px 0; background: #fff; line-height: 1.4; }
  .note b { font-weight: bold; }

  /* Info row: Centre Number | Date | Candidate Number */
  .info-row { display: flex; border: 1px solid #000; margin-bottom: 8px; }
  .info-cell { flex: 1; padding: 5px 8px; border-right: 1px solid #000; }
  .info-cell:last-child { border-right: none; }
  .info-cell .label { font-size: 9px; font-weight: bold; }
  .info-cell .value { font-size: 11px; margin-top: 2px; }

  /* Candidate Details */
  .section-title { font-size: 13px; font-weight: bold; margin: 8px 0 4px; }
  .candidate-section { display: flex; border: 1px solid #000; border-bottom: 2px solid #000; }
  .candidate-left { flex: 1; }
  .candidate-left table { width: 100%; border-collapse: collapse; }
  .candidate-left td { border: 1px solid #999; padding: 4px 8px; font-size: 10px; vertical-align: middle; }
  .candidate-left td.lbl { font-weight: bold; width: 110px; font-size: 9px; background: #fff; }
  .candidate-left td.val { font-size: 11px; }
  .photo-box { width: 105px; border-left: 2px solid #000; display: flex; align-items: center; justify-content: center; background: #f8f8f8; }
  .photo-box-inner { width: 85px; height: 105px; border: 1px solid #ccc; }

  /* Details row: DOB | Sex | Scheme Code */
  .details-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 0; }
  .details-table td { border: 1px solid #999; padding: 4px 8px; font-size: 10px; vertical-align: middle; }
  .details-table td.lbl { font-weight: bold; font-size: 9px; width: 110px; }
  .details-table td.val { font-size: 11px; }

  /* Test Results */
  .results-section { margin-top: 10px; }
  .results-title { font-size: 13px; font-weight: bold; margin-bottom: 6px; }
  .scores-row { display: flex; align-items: stretch; border: 2px solid #000; }
  .score-item { display: flex; align-items: center; border-right: 1px solid #000; }
  .score-item:last-child { border-right: none; }
  .score-label { font-size: 9px; font-weight: bold; padding: 4px 8px; }
  .score-value { font-size: 16px; font-weight: bold; padding: 4px 10px; border-left: 2px solid #000; min-width: 36px; text-align: center; background: #fff; }
  .score-item.overall .score-label { font-size: 9px; text-align: center; line-height: 1.2; }
  .score-item.cefr .score-label { font-size: 9px; text-align: center; line-height: 1.2; }

  /* Bottom section */
  .bottom-section { display: flex; border: 1px solid #000; border-top: none; margin-top: 10px; min-height: 130px; }
  .admin-comments { flex: 1; border-right: 1px solid #000; padding: 6px 8px; }
  .admin-comments .ac-title { font-size: 10px; font-weight: bold; margin-bottom: 4px; }
  .admin-comments .ac-box { border: 1px solid #999; min-height: 90px; }
  .stamp-area { width: 140px; border-right: 1px solid #000; padding: 6px; text-align: center; }
  .stamp-area:last-child { border-right: none; }
  .stamp-area .stamp-title { font-size: 9px; font-weight: bold; text-align: center; margin-bottom: 6px; }

  /* Signature section */
  .sig-section { margin-top: 10px; }
  .sig-row { display: flex; align-items: flex-end; justify-content: center; gap: 20px; margin-bottom: 8px; }
  .sig-row .sig-label { font-size: 9px; font-weight: bold; text-align: center; }
  .sig-row .sig-line { width: 180px; border-bottom: 1px solid #000; height: 20px; }
  .date-row { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 8px; }
  .date-row .label { font-size: 10px; font-weight: bold; }
  .date-row .value-box { border: 1px solid #000; padding: 4px 16px; font-size: 11px; min-width: 120px; text-align: center; }

  /* Footer */
  .footer { margin-top: 20px; padding: 6px 0; border-top: 2px solid #000; font-size: 8px; text-align: center; color: #333; }
</style>
</head><body>
<div class="page">
  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <h1>IELTS<sup style="font-size:14px;vertical-align:super;">™</sup></h1>
      <div class="subtitle">Test Report Form</div>
    </div>
    <div style="text-align:right;">
      <div class="module-box">${C}</div>
    </div>
  </div>

  <!-- NOTE -->
  <div class="note">
    <b>NOTE</b>&nbsp;&nbsp;
    <i>Admission to undergraduate and post graduate courses should be based on the <b>ACADEMIC</b> Reading and Writing Modules.<br>
    <b>GENERAL TRAINING</b> Reading and Writing Modules are <b>not</b> designed to test the full range of language skills required for academic purposes.<br>
    It is recommended that the candidate's language ability as indicated in this Test Report Form be re-assessed <b>after two years</b> from the date of the test.</i>
  </div>

  <!-- CENTRE / DATE / CANDIDATE NUMBER ROW -->
  <div class="info-row">
    <div class="info-cell"><div class="label">Centre Number</div><div class="value">${a(t.platformName)}</div></div>
    <div class="info-cell"><div class="label">Date</div><div class="value">${a(t.testDate)}</div></div>
    <div class="info-cell"><div class="label">Candidate Number</div><div class="value">${a(t.candidateNumber)}</div></div>
  </div>

  <!-- CANDIDATE DETAILS -->
  <div class="section-title">Candidate Details</div>
  <div class="candidate-section">
    <div class="candidate-left">
      <table>
        <tr><td class="lbl">Family Name</td><td class="val">${a(t.familyName)}</td></tr>
        <tr><td class="lbl">First Name</td><td class="val">${a(t.firstName)}</td></tr>
        <tr><td class="lbl">Candidate ID</td><td class="val">${a(t.candidateNumber)}</td></tr>
      </table>
    </div>
    <div class="photo-box"><div class="photo-box-inner"></div></div>
  </div>

  <!-- DOB / SEX / SCHEME CODE ROW -->
  <table class="details-table">
    <tr>
      <td class="lbl">Date of Birth</td>
      <td class="val" style="width:140px;">${a(t.dateOfBirth)}</td>
      <td class="lbl" style="width:60px;">Sex (M/F)</td>
      <td class="val" style="width:40px;text-align:center;">${a(t.sex)}</td>
      <td class="lbl" style="width:85px;">Scheme Code</td>
      <td class="val">Private Candidate</td>
    </tr>
    <tr>
      <td class="lbl">Country or Region<br>of Origin</td>
      <td class="val" colspan="5">${a(t.countryOfOrigin)}</td>
    </tr>
    <tr>
      <td class="lbl">Country of<br>Nationality</td>
      <td class="val" colspan="5">${a(t.nationality)}</td>
    </tr>
    <tr>
      <td class="lbl">First Language</td>
      <td class="val" colspan="5">${a(t.firstLanguage)}</td>
    </tr>
  </table>

  <!-- TEST RESULTS -->
  <div class="results-section">
    <div class="results-title">Test Results</div>
    <div class="scores-row">
      <div class="score-item"><div class="score-label">Listening</div><div class="score-value">${a(b)}</div></div>
      <div class="score-item"><div class="score-label">Reading</div><div class="score-value">${a(y)}</div></div>
      <div class="score-item"><div class="score-label">Writing</div><div class="score-value">${a(w)}</div></div>
      <div class="score-item"><div class="score-label">Speaking</div><div class="score-value">${a(j)}</div></div>
      <div class="score-item overall"><div class="score-label">Overall<br>Band<br>Score</div><div class="score-value">${a(x)}</div></div>
      <div class="score-item cefr"><div class="score-label">CEFR<br>Level</div><div class="score-value">${a(m)}</div></div>
    </div>
  </div>

  <!-- BOTTOM: Admin Comments + Stamps -->
  <div class="bottom-section">
    <div class="admin-comments">
      <div class="ac-title">Administrator Comments</div>
      <div class="ac-box"></div>
    </div>
    <div class="stamp-area">
      <div class="stamp-title">Centre stamp</div>
      ${B}
    </div>
    <div class="stamp-area">
      <div class="stamp-title">Validation stamp</div>
      ${T}
    </div>
  </div>

  <!-- SIGNATURE -->
  <div class="sig-section">
    <div class="sig-row">
      <div>
        <div class="sig-label">Administrator's<br>Signature</div>
      </div>
      <div class="sig-line"></div>
    </div>
    <div class="date-row">
      <div class="label">Date</div>
      <div class="value-box">${a(t.testDate)}</div>
      <div class="label" style="margin-left:30px;">Test Report Form<br>Number</div>
      <div class="value-box"></div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    The validity of this IELTS Test Report Form can be verified online by recognising organisations at ${a(t.platformName)}
  </div>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;l.document.write(p),l.document.close()}function Y({open:t,onOpenChange:l,platformName:b,studentName:y,testDate:w,testType:j,readingBand:x,listeningBand:m,writingStatus:g,overallBand:C,centreStampUrl:u,validationStampUrl:B,targetUserId:N}){const{user:T}=O(),p=N||T?.id,f=y.split(" "),[s,D]=z.useState({familyName:f.length>1?f.slice(-1).join(" "):f[0]||"",firstName:f.length>1?f.slice(0,-1).join(" "):"",candidateNumber:"",dateOfBirth:"",nationality:"Bangladeshi",firstLanguage:"",writingBand:g==="pending"?"":g||"",speakingBand:"",sex:""});z.useEffect(()=>{!t||!p||A.from("profiles").select("candidate_number, date_of_birth, full_name, nationality, first_language, sex").eq("id",p).maybeSingle().then(({data:i})=>{if(!i)return;const o=i;D(r=>({...r,candidateNumber:o.candidate_number||r.candidateNumber,dateOfBirth:o.date_of_birth||r.dateOfBirth,nationality:o.nationality||r.nationality,firstLanguage:o.first_language||r.firstLanguage,sex:o.sex||r.sex,...o.full_name?(()=>{const v=o.full_name.split(" ");return{familyName:v.length>1?v.slice(-1).join(" "):v[0]||r.familyName,firstName:v.length>1?v.slice(0,-1).join(" "):r.firstName}})():{}}))})},[t,p]);const c=(i,o)=>D(r=>({...r,[i]:o})),S=()=>{const i=U({listening:m,reading:x,writing:s.writingBand,speaking:s.speakingBand});return i>0?i:C},R=()=>{const i=S();W({platformName:b,familyName:s.familyName,firstName:s.firstName,candidateNumber:s.candidateNumber,dateOfBirth:s.dateOfBirth,nationality:s.nationality,firstLanguage:s.firstLanguage,testDate:w,testType:j,listeningBand:m,readingBand:x,writingBand:s.writingBand||(g==="pending"?"Pending":g),speakingBand:s.speakingBand||null,overallBand:i,centreStampUrl:u,validationStampUrl:B,sex:s.sex}),l(!1)};return e.jsx($,{open:t,onOpenChange:l,children:e.jsxs(L,{className:"sm:max-w-md max-h-[90vh] overflow-y-auto",children:[e.jsxs(I,{children:[e.jsx(_,{children:"Print Test Report Form"}),e.jsx(M,{children:"Review candidate details before printing the official-style TRF."})]}),e.jsxs("div",{className:"grid gap-3 py-2",children:[e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Centre Name"}),e.jsx(d,{value:b,disabled:!0,className:"bg-muted"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Family Name"}),e.jsx(d,{value:s.familyName,onChange:i=>c("familyName",i.target.value),placeholder:"Family name"})]}),e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"First Name(s)"}),e.jsx(d,{value:s.firstName,onChange:i=>c("firstName",i.target.value),placeholder:"First name"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Candidate Number"}),e.jsx(d,{value:s.candidateNumber,disabled:!0,className:"bg-muted"})]}),e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Nationality"}),e.jsx(d,{value:s.nationality,disabled:!0,className:"bg-muted"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Date of Birth"}),e.jsx(d,{type:"date",value:s.dateOfBirth,onChange:i=>c("dateOfBirth",i.target.value)})]}),e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Sex"}),e.jsx(d,{value:s.sex,onChange:i=>c("sex",i.target.value),placeholder:"e.g. Male"})]})]}),e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"First Language"}),e.jsx(d,{value:s.firstLanguage,onChange:i=>c("firstLanguage",i.target.value),placeholder:"e.g. Bengali"})]}),e.jsxs("div",{className:"border-t pt-3 mt-1",children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground mb-2",children:"Band Scores"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Listening"}),e.jsx(d,{value:m!=null?m.toFixed(1):"—",disabled:!0,className:"bg-muted"})]}),e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Reading"}),e.jsx(d,{value:x!=null?x.toFixed(1):"—",disabled:!0,className:"bg-muted"})]}),e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Writing"}),e.jsx(d,{value:s.writingBand,onChange:i=>c("writingBand",i.target.value),placeholder:"e.g. 6.5"})]}),e.jsxs("div",{children:[e.jsx(n,{className:"text-xs",children:"Speaking"}),e.jsx(d,{value:s.speakingBand,onChange:i=>c("speakingBand",i.target.value),placeholder:"e.g. 7.0"})]})]}),e.jsxs("div",{className:"mt-2",children:[e.jsx(n,{className:"text-xs",children:"Overall Band (auto-calculated)"}),e.jsx(d,{value:S()?.toFixed(1)??"—",disabled:!0,className:"bg-muted font-bold"})]})]})]}),e.jsxs(P,{children:[e.jsx(E,{variant:"outline",onClick:()=>l(!1),children:"Cancel"}),e.jsxs(E,{onClick:R,className:"gap-2",children:[e.jsx(k,{className:"h-4 w-4"}),"Print TRF"]})]})]})})}export{Y as P};
