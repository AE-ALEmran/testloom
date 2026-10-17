import{e as ve,c2 as je,r as N,j as e,I as U,l as Oe,T as q,B as _,L as Se,gU as X,dg as Ee,A as Te,ej as ke,ei as B,de as Ae,C as K,f as H,dG as Ce,F as J,G as V,bV as z,d as g}from"./index-D9TqrYCw.js";import{L as C}from"./label-Dy8dWBea.js";import{T as Z}from"./textarea-B7CyIFKs.js";import{B as R}from"./badge-BeQuoRTd.js";import{T as Re,a as Pe,b as ee,c as se}from"./tabs-BHt639D6.js";import{S as te,a as re,b as ae,c as ne,d as I}from"./select-9NjK7sy8.js";import{D as $e,a as Le,b as Ie,c as Me,e as De}from"./dialog-WdJlzcfm.js";import{p as F,t as We,b as qe,s as Be}from"./jsonTemplate-C0JYJjvb.js";import{v as Je,i as Ye,y as Fe}from"./jsonToModel-BtFKkWao.js";import{D as ce,e as de,g as me,M as ue,K as oe,f as Ge,L as ie}from"./inlineBlanks-N0iVEL6g.js";import{J as Qe}from"./JsonImportPanel-DInxldKN.js";import"./types-B0h6lYwR.js";const Y="reading-ai-prompt-template:v3",Ue="reading-ai-prompt-template:v2",Xe=`═════════ WORKED EXAMPLE FOR EVERY TYPE ═════════
Copy these shapes exactly; only the wording changes.

1) multiple_choice
{ "type": "multiple_choice", "start": 1, "end": 2, "instruction": "auto", "rule": "LETTER_ABCD",
  "questions": [ { "number": 1, "text": "What does the writer say about cork?",
    "options": ["A. It is rare.", "B. It is light.", "C. It is costly.", "D. It is new."], "answer": "B" } ] }

2) multiple_choice_multi  ("Choose TWO letters")
{ "type": "multiple_choice_multi", "start": 3, "end": 4, "required_choices": 2, "rule": "TWO_LETTERS",
  "questions": [ { "number": 3, "text": "Which TWO uses are mentioned?",
    "options": ["A. flooring", "B. bottles", "C. shoes", "D. paint", "E. boats"], "answer": "A, E" } ] }
  • A "choose TWO" question printed as one item with two numbers (3 and 4) still gets ONE entry per number,
    each with the same stem and options; put the first letter on the first number, the second on the next.

3) tfng / 4) ynng
{ "type": "tfng", "start": 5, "end": 7, "instruction": "auto",
  "questions": [ { "number": 5, "text": "Cork oaks grow only in Portugal.", "answer": "FALSE" } ] }

5) matching_headings  (keys printed as roman numerals are fine)
{ "type": "matching_headings", "start": 8, "end": 11, "allow_reuse": false,
  "options": ["i. Early uses", "ii. Modern factories", "iii. Harvest cycle", "iv. Future demand"],
  "questions": [ { "number": 8, "text": "Paragraph A", "answer": "iii" } ] }

6) matching_information  (answer = paragraph letter)
{ "type": "matching_information", "start": 12, "end": 14, "allow_reuse": true,
  "questions": [ { "number": 12, "text": "a reference to a legal change", "answer": "D" } ] }

7) matching_features
{ "type": "matching_features", "start": 15, "end": 17,
  "options": ["A. Dr Lin", "B. Prof Adams", "C. Ms Ortiz"],
  "questions": [ { "number": 15, "text": "warned about over-harvesting", "answer": "B" } ] }

8) matching_sentence_endings
{ "type": "matching_sentence_endings", "start": 18, "end": 20,
  "options": ["A. because demand fell.", "B. after the war.", "C. once machines arrived."],
  "questions": [ { "number": 18, "text": "Production slowed", "answer": "A" } ] }

9) sentence_completion
{ "type": "sentence_completion", "start": 21, "end": 22, "rule": "MAX_2_WORDS",
  "body": { "paragraph": "Bark is stripped with a [[21]] and stacked to dry for at least [[22]]." },
  "questions": [ { "number": 21, "answer": "hand axe" }, { "number": 22, "answer": "six months" } ] }

10) summary_completion  (from the passage)
{ "type": "summary_completion", "start": 23, "end": 25, "rule": "ONE_WORD_ONLY",
  "body": { "title": "Cork production", "paragraph": "Cork was first [[23]] in the valley, then [[24]] by traders and finally [[25]] abroad." },
  "questions": [ { "number": 23, "answer": "harvested" } ] }

11) summary_completion with a word bank
  Use "layout": "summary_bank" plus: "body": { "paragraph": "...[[26]]...", "word_bank": ["arrived", "traded", "stored"], "word_bank_title": "List of Words", "word_bank_labels": "letters" }
  Answers are then the WORD, unless the paper says "Write the correct letter" — in that case give the letter.

12) note_completion
{ "type": "note_completion", "start": 27, "end": 29, "rule": "MAX_2_WORDS",
  "body": { "title": "Cork factory visit", "subheading": "Main hall", "lines": ["Location — [[27]]", "Opened in [[28]]", "Staff — about [[29]]"] } }

13) table_completion
{ "type": "table_completion", "start": 30, "end": 32, "rule": "ONE_WORD_AND_NUMBER",
  "body": { "title": "Stages", "table_header": true,
    "table": [["Stage", "Year", "Result"], ["Stage 1", "1822", "[[30]]"], ["Stage 2", "[[31]]", "export"], ["Stage 3", "1901", "[[32]]"]] } }

14) flow_chart_completion
{ "type": "flow_chart_completion", "start": 33, "end": 34, "rule": "MAX_3_WORDS",
  "body": { "steps": ["Sample collected", "Sample [[33]] in the lab", "Report sent to the [[34]]"], "orientation": "vertical" } }

15) diagram_label_completion
{ "type": "diagram_label_completion", "start": 35, "end": 36, "rule": "ONE_WORD_ONLY",
  "body": { "title": "Cork press", "image_url": "", "image_caption": "Figure 2",
    "lines": ["top plate — [[35]]", "base — [[36]]"] } }
  • Leave "image_url" as "" when you have no picture file; the admin adds it in the builder.

16) short_answer
{ "type": "short_answer", "start": 37, "end": 38, "rule": "MAX_3_WORDS",
  "questions": [ { "number": 37, "text": "What tool is used to strip the bark?", "answer": "an axe", "accepted": ["axe"] } ] }`;function M(i){const d=i.series==="cambridge"?"Cambridge":"TestLoom",n=i.test_type==="general_training";return`You are an IELTS Reading paper → JSON converter for TestLoom Mocktest.

I am attaching an IELTS Reading test (${n?"General Training":"Academic"}, ${d}, Book ${i.book_number}, Test ${i.test_number}) — passages, all question pages, and the Answers page.

Convert it into ONE JSON object in the format below. Output ONLY the JSON: no markdown fences, no comments, no text before or after.

═════════ GOLDEN RULES ═════════
1. Copy every word verbatim — passages, titles, sub-titles, question stems, options, table cells, note lines, captions. Never paraphrase, shorten, translate or "fix" anything.
2. Question numbers run continuously (normally 1–40) and match the paper exactly.
3. EVERY printed "Questions X–Y" header becomes exactly ONE entry in "groups". Never merge two headers, never split one.
4. Instructions: write "instruction": "auto" and the site prints the correct official IELTS wording itself. Only write real text when the paper says something unusual.
5. Answer boxes: inside body text mark each box as [[7]] using that question's number. Do not use underscores, dots or asterisks.
6. Never put instruction sentences ("Choose the correct letter…", "Write NO MORE THAN TWO WORDS…", "Questions 14–18") inside a question stem or body — they belong to the group, not the question.
7. Valid JSON only: straight quotes, escaped \\" inside strings, \\n for line breaks, no trailing commas, no smart quotes.

═════════ KEEP THE PRINTED FORMATTING ═════════
• Keep CAPITALS, italic lead lines, sub-titles and NB notes exactly as printed. Put an NB line in the group's "nb" field, not in a stem.
• Bold words inside a passage or note line: wrap them as <b>word</b>. Bullet characters (•, –) at the start of a note line: drop the bullet, keep the words; each bullet is one entry of "lines".
• A paragraph letter that is printed (A, B, C…) goes in "segments[].label". Unlabelled paragraphs use "·".
• Examples printed before real question rows are NOT questions. Preserve them in "examples", e.g. "examples": [{"label":"Section A","answer":"vi"}], so they display but never affect scoring.
• A data table printed inside the PASSAGE (not a question body) stays in that passage segment as "table": {"caption":"Table 1: ...","header_rows":1,"rows":[["","Column 1"],["Row 1","40.1"]]}. Preserve every heading, blank corner cell, number, percent sign, row, column and caption. Never flatten it into prose or move it into a question group.
• Keep numbers, units, hyphens and spelling exactly (e.g. "20th century", "sub-Saharan", "colour").

═════════ SHAPE ═════════
{
  "version": 2,
  "title": "${n?"GT ":""}Reading Test ${i.test_number}",
  "series": "${i.series}",
  "book_number": ${i.book_number},
  "test_number": ${i.test_number},
  "test_type": "${i.test_type}",
  "total_time": 60,
  "passages": [
    {
      "order": 1,
      "title": "verbatim passage title",
      "subtitle": "italic lead line or omit",
      "segments": [ { "label": "A", "content": "full paragraph text", "table": { "caption": "optional printed caption", "header_rows": 1, "rows": [["Heading 1", "Heading 2"], ["value", "value"]] } } ],
      "groups": [ ...see below... ]
    }
  ],
  "band_scores": [ { "min": 39, "band": 9 } ]
}
${n?'• General Training: Section 1 and Section 2 may each hold two or three short texts. Give ONE passage entry per printed Section (3 entries in total), put every text of that section in "segments", and use "title" for the section heading.':'• 3 passages for Academic; use "label": "·" when paragraphs are not lettered.'}
• Never merge or split paragraphs; keep their letters exactly as printed.

═════════ ONE GROUP = ONE "Questions X–Y" BLOCK ═════════
{
  "type": "<one of the type names below>",
  "start": 27, "end": 31,
  "instruction": "auto",
  "nb": "You may use any letter more than once.",   // only when the paper prints an NB line
  "rule": "MAX_2_WORDS",            // answer rule, see list; omit if not a completion type
  "options": ["heading one", "heading two"],   // shared list for matching / word-bank types
  "examples": [{ "label": "Section A", "answer": "vi" }], // printed example rows only, not questions
  "allow_reuse": false,
  "required_choices": 2,            // only for "choose TWO letters"
  "body": { ... },                  // only for completion types (summary, notes, table, flow-chart, diagram)
  "questions": [
    { "number": 27, "text": "stem (choice / TFNG / matching types only)",
      "options": ["A. ...", "B. ..."],          // per-question options for multiple choice
      "answer": "cotton", "accepted": ["cotton fibre"],
      "paragraph_ref": "C" }
  ]
}

TYPE NAMES (use exactly): multiple_choice, multiple_choice_multi, tfng, ynng,
matching_headings, matching_information, matching_features, matching_sentence_endings,
sentence_completion, summary_completion, note_completion, table_completion,
flow_chart_completion, diagram_label_completion, short_answer.

ANSWER RULES (use exactly): ONE_WORD_ONLY, TWO_WORDS_ONLY, MAX_1_WORD, MAX_2_WORDS, MAX_3_WORDS,
ONE_WORD_AND_NUMBER, MAX_1_WORD_NUMBER, MAX_2_WORDS_NUMBER, MAX_3_WORDS_NUMBER, ONE_NUMBER_ONLY,
ONE_LETTER, TWO_LETTERS, THREE_LETTERS, LETTER_ABCD, TFNG, YNNG.

${Xe}

═════════ BODY RULES FOR COMPLETION TYPES ═════════
• Reproduce the printed body ONCE inside "body"; do NOT repeat it inside "questions". For those numbers just give the answer.
• Table rows are arrays of cells in printed order, including empty corner cells ("").
• Every completion number must appear exactly once as [[n]] in that group's body.

═════════ ANSWERS ═════════
• One entry per question number, taken from the Answers page.
• Alternatives from the key: "answer": "theatre", "accepted": ["theater"].
• Anything printed as "A/B", "A or C", "(a) taxi" or "fire(s)" → put one value in "answer" and every other valid form in "accepted". Never discard an accepted variant.
• tfng → "TRUE" | "FALSE" | "NOT GIVEN". ynng → "YES" | "NO" | "NOT GIVEN". Write NOT GIVEN in full — never "NG", "N" or "NOT".
• Letter types → the letter(s) only, e.g. "B" or "B, D". matching_headings printed as roman numerals may stay roman ("iii"); the site converts them.
• matching_information → the paragraph letter.
• Shared "options" lists carry the option text only, in printed order — no "A", "A.", "iii)" label in front of it; the site prints the labels.
• Every answer must obey its own group "rule" (never 3 words under MAX_2_WORDS).

═════════ FINAL SELF-CHECK BEFORE YOU ANSWER ═════════
1. Numbers 1→N continuous, no gaps, no duplicates, and every group's start/end matches its questions.
2. One group per printed "Questions X–Y" header, types never mixed inside a group.
3. Every completion question number appears exactly once as [[n]] in that group's body.
4. Every number has an answer; matching groups have their full "options" list.
5. No instruction sentences inside stems or bodies; NB lines are in "nb".
6. Passage text is complete — every paragraph of every passage, nothing summarised.
7. JSON.parse succeeds on the first try.`}function Ke(i,d,n=3){const a=M(i),b=d>=n;return`IMPORTANT — PART ${d} OF ${n} ONLY.
Return JSON for Passage ${d} and its questions ONLY. Do not include the other passages.
Keep "passages" as an array with exactly ONE entry and set "order": ${d}.
Keep the original question numbers of that passage (do not renumber from 1).
${b?'Include "band_scores" in this last part.':'Omit "band_scores" in this part.'}
Your reply must be JSON only — never a message explaining that the paper is too long. If it is long, still return only this one passage.

`+a}function He(i=""){return`You are editing an existing TestLoom Mocktest IELTS Reading test that is stored as JSON.

WHAT I WANT CHANGED:
${i.trim()||'<describe your change here — e.g. "fix the answers for questions 14–20", "rebuild the table in Passage 2", "add the missing instruction for Questions 27–31">'}

RULES
1. Return the COMPLETE JSON object again — same shape, same keys, same order of passages and groups. Output ONLY JSON, no fences, no commentary.
2. Change ONLY what I asked for. Every other character stays identical, including passage text, ids inside "blocks", answers and instructions.
3. Keep "schema", "version", "passage_index", "start" and "end" as they are unless the change is about numbering.
4. Answer boxes stay in the same style they already use: [[7]] inside "body", or {{Q7}} inside "blocks".
5. "instruction_resolved" and "rule_printed" are read-only previews of what students see — do not rely on them, and it is fine to leave them unchanged.
6. If the change makes a group's answer rule or option list wrong, update those fields too, so the test stays consistent.
7. JSON.parse must succeed on the first try: straight quotes, escaped \\" inside strings, \\n for line breaks, no trailing commas.

THE TEST JSON FOLLOWS — paste it after this line:
`}function Ve(i){return Array.isArray(i?.passages)?i.passages:i&&(Array.isArray(i.segments)||Array.isArray(i.groups))?[i]:[]}function ze(i){let d=0;for(const n of i){for(const a of Array.isArray(n?.groups)?n.groups:[])Array.isArray(a?.questions)?d+=a.questions.length:Number.isFinite(Number(a?.start))&&Number.isFinite(Number(a?.end))&&(d+=Number(a.end)-Number(a.start)+1);!Array.isArray(n?.groups)&&Array.isArray(n?.questions)&&(d+=n.questions.length)}return d}function le(i){const d={},n=[],a=[],b=[];if(i.forEach((t,l)=>{if(!t||!t.trim())return;let p;try{p=F(t)}catch(h){throw new Error(`Part ${l+1}: ${h?.message||"could not read this JSON"}`)}const y=Ve(p);if(!y.length)throw new Error(`Part ${l+1}: no passage found in this JSON`);for(const h of["version","title","series","book_number","test_number","test_type","total_time"])d[h]===void 0&&p?.[h]!==void 0&&p[h]!==null&&p[h]!==""&&(d[h]=p[h]);!n.length&&Array.isArray(p?.band_scores)&&p.band_scores.length&&n.push(...p.band_scores),y.forEach((h,w)=>{const E=Number(h?.order);a.push({order:Number.isFinite(E)&&E>0?E:l+1+w*.01,passage:h})}),b.push(l+1)}),!a.length)throw new Error("Paste at least one part before combining");a.sort((t,l)=>t.order-l.order);const c=a.map((t,l)=>({...t.passage,order:l+1})),m={version:2,...d,passages:c};return n.length&&(m.band_scores=n),{json:JSON.stringify(m,null,2),passages:c.length,questions:ze(c),usedParts:b}}const Ze=/(choose the correct letter|write no more than|one word only|in boxes?\s+\d+|answer sheet|questions?\s+\d+\s*[–-]\s*\d+)/i;function es(i){const d=[],n=(c,m,t)=>d.push({level:c,message:m,question:t}),a=new Map;i.parts.forEach(c=>{const m=`Passage ${c.number}`;c.segments.some(t=>t.content.trim())||n("error",`${m}: no passage text found.`),c.passageTitle.trim()||n("warning",`${m}: passage title is empty.`),c.groups.forEach(t=>{const l=me(t.typeKey),p=t.start===t.end?`${t.start}`:`${t.start}–${t.end}`,y=`${m} · Questions ${p}`,h=t.sharedOptions.filter(o=>o.trim());t.questions.forEach(o=>a.set(o.number,(a.get(o.number)||0)+1));const w=de(t.content||[]);if(w.length){const o=ce(w),x=t.questions.map(O=>O.number),v=x.filter(O=>!o.includes(O)),S=o.filter(O=>!x.includes(O)),j=o.filter((O,P)=>o.indexOf(O)!==P);v.length&&n("error",`${y}: no answer box for ${v.join(", ")}.`),S.length&&n("warning",`${y}: answer box ${S.join(", ")} is outside this block's range.`),j.length&&n("warning",`${y}: answer box ${[...new Set(j)].join(", ")} appears more than once.`)}l.sharedOptions&&!h.length&&!oe(t.content||[])&&n("error",`${y}: this type needs its list of options (headings, features, endings…).`),t.typeKey==="diagram_label_completion"&&!(t.content||[]).some(o=>o.kind==="image"&&o.url.trim())&&n("warning",`${y}: diagram labelling has no image URL yet.`);const E=new Map;t.questions.forEach(o=>{const x=String(o.answer||"").trim();if(!x){n("error",`Question ${o.number}: no answer in the key.`,o.number);return}if(Ze.test(o.text||"")&&n("warning",`Question ${o.number}: the stem still contains printed instruction text.`,o.number),l.answerMode==="text"&&t.rule&&(Ge(x,t.rule).ok||n("warning",`Question ${o.number}: answer "${x}" breaks its own rule (${ue(t.rule)}).`,o.number)),l.answerMode==="letter"||l.answerMode==="multi_letter"){const v=x.toUpperCase().replace(/[^A-Z]/g,"").split(""),S=h.length||oe(t.content||[])?.options.length||o.options.filter(j=>j.trim()).length;v.forEach(j=>{S&&ie.indexOf(j)>=S&&n("warning",`Question ${o.number}: answer "${j}" is outside the option list (A–${ie[S-1]}).`,o.number),E.set(j,[...E.get(j)||[],o.number])}),l.answerMode==="multi_letter"&&t.requiredChoices&&v.length!==t.requiredChoices&&n("warning",`Question ${o.number}: ${t.requiredChoices} letters expected, key has ${v.length}.`,o.number)}l.perQuestionOptions&&o.options.filter(v=>v.trim()).length<2&&n("error",`Question ${o.number}: multiple choice needs its own options.`,o.number),l.answerMode!=="text"&&!l.fixedOptions&&!o.text.trim()&&l.perQuestionOptions&&n("warning",`Question ${o.number}: the question stem is empty.`,o.number)}),t.allowReuse||E.forEach((o,x)=>{o.length>1&&n("warning",`${y}: option ${x} is the answer for ${o.join(", ")} but re-use is off.`)})})});const b=[...a.keys()].sort((c,m)=>c-m);a.forEach((c,m)=>{c>1&&n("error",`Question ${m} appears ${c} times.`,m)});for(let c=1;c<b.length;c++){const m=b[c]-b[c-1];m>1&&n("warning",`Numbers jump from ${b[c-1]} to ${b[c]} — ${m-1} missing.`)}return d}function ss(i,d){const n=[...Je(i),...es(i)],a=new Set,b=n.filter(t=>{const l=`${t.level}|${t.message}`;return a.has(l)?!1:(a.add(l),!0)}),c=[];let m=0;return i.parts.forEach(t=>{t.groups.forEach(l=>{const p=l.questions.filter(h=>String(h.answer).trim()).length;m+=p;const y=ce(de(l.content||[])).length;c.push({part:t.number,range:l.start===l.end?`${l.start}`:`${l.start}–${l.end}`,type:me(l.typeKey).label,rule:l.rule&&ue(l.rule)||"—",answers:`${p}/${l.questions.length}`,layoutBoxes:y})})}),{test:i,repaired:d,passages:i.parts.length,paragraphs:i.parts.reduce((t,l)=>t+l.segments.filter(p=>p.content.trim()).length,0),questions:Ye(i.parts),answered:m,blocks:c,errors:b.filter(t=>t.level==="error"),warnings:b.filter(t=>t.level==="warning")}}function ts(i,d){const n=d.series==="cambridge"?"Cambridge":"TestLoom",a=d.test_type==="general_training"?"General Training":"Academic";return i.replace(/\{\{series\}\}/g,d.series).replace(/\{\{series_label\}\}/g,n).replace(/\{\{test_type\}\}/g,d.test_type).replace(/\{\{test_type_label\}\}/g,a).replace(/\{\{book_number\}\}/g,String(d.book_number)).replace(/\{\{test_number\}\}/g,String(d.test_number))}function gs(){const i=ve(),[d]=je(),n=d.get("mode")??null,[a,b]=N.useState({test_type:"academic",series:"cambridge",book_number:1,test_number:1}),[c,m]=N.useState(""),[t,l]=N.useState(!1),[p,y]=N.useState(!1),[h,w]=N.useState(null),[E,o]=N.useState(!1),[x,v]=N.useState(null),[S,j]=N.useState(""),[O,P]=N.useState(!1),[D,$]=N.useState(["","",""]),[pe,G]=N.useState(null),he=async s=>{try{await navigator.clipboard.writeText(Ke(a,s,D.length)),G(s),setTimeout(()=>G(null),2e3),g.success(`Prompt for Passage ${s} copied`)}catch{g.error("Could not copy to clipboard")}},ge=()=>{try{const s=le(D);m(s.json),w(null),g.success(`Combined ${s.usedParts.length} part(s) — ${s.passages} passages, ${s.questions} questions`)}catch(s){const r=s?.message||"Could not combine the parts";w(r),g.error(r,{duration:8e3})}};N.useEffect(()=>{try{const s=localStorage.getItem(Y)||localStorage.getItem(Ue);s&&v(s)}catch{}},[]);const be=async()=>{try{await navigator.clipboard.writeText(He()),g.success("Edit prompt copied — paste it with an exported test JSON")}catch{g.error("Could not copy to clipboard")}},xe=s=>{P(!0),$(s);try{const r=le(s);m(r.json),w(null),g.success(`Combined ${r.usedParts.length} file(s) — ${r.passages} passages, ${r.questions} questions`)}catch(r){const u=r?.message||"Could not combine those files";w(u),g.error(u,{duration:8e3})}};N.useEffect(()=>{if(c.trim())try{const s=F(c),r={},u=String(s?.test_type||"").toLowerCase();(u==="academic"||u==="general_training")&&(r.test_type=u);const T=String(s?.series||"").toLowerCase();(T==="cambridge"||T==="puropuro")&&(r.series=T);const k=Number(s?.book_number);Number.isFinite(k)&&k>0&&(r.book_number=k);const A=Number(s?.test_number);Number.isFinite(A)&&A>0&&(r.test_number=A),Object.keys(r).length&&b(_e=>({..._e,...r}))}catch{}},[c]);const L=s=>b(r=>({...r,...s})),fe=()=>x?ts(x,a):M(a),ye=async()=>{try{await navigator.clipboard.writeText(fe()),y(!0),setTimeout(()=>y(!1),2e3),g.success("Prompt copied — paste it into Gemini/ChatGPT with your reading test")}catch{g.error("Could not copy to clipboard")}},f=N.useMemo(()=>{if(!c.trim())return null;try{const s=F(c),{payload:r,repaired:u}=We(s),T=Fe(r,{series:a.series,book_number:a.book_number,test_number:a.test_number});return T.meta.title.trim()||(T.meta.title=`${a.test_type==="general_training"?"GT ":""}Reading Test ${a.test_number}`),{report:ss(T,u)}}catch(s){return{error:s?.message||"Could not read this JSON"}}},[c,a]),we=()=>{if(!f)return{ok:!1,error:"Paste the JSON first"};if(!f.report)return{ok:!1,error:f.error||"Parse error"};const s=f.report;return{ok:!0,parsed:s.test,meta:[{label:"Title",value:s.test.meta.title||"—"},{label:"Passages",value:s.passages},{label:"Blocks",value:s.blocks.length},{label:"Questions",value:s.questions},{label:"Answers",value:`${s.answered}/${s.questions}`}]}},W=async s=>{if(!f){g.error("Paste the JSON first");return}if(!f.report){const r=f.error||"Could not read this JSON";w(r),g.error(r);return}l(!0),w(null);try{const r=f.report.test,u=await Be(r);g.success(`Reading test created — ${f.report.passages} passages, ${f.report.questions} questions`),i(s?`/admin/reading-tests/${u}/edit`:"/admin/reading-tests")}catch(r){const u=r?.message||"Import failed";w(u),g.error(u,{duration:1e4})}finally{l(!1)}},Q=e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-sm font-semibold uppercase tracking-wide text-muted-foreground",children:"1. Test Details"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(C,{children:"Type"}),e.jsxs(te,{value:a.test_type,onValueChange:s=>L({test_type:s}),children:[e.jsx(re,{children:e.jsx(ae,{})}),e.jsxs(ne,{children:[e.jsx(I,{value:"academic",children:"Academic"}),e.jsx(I,{value:"general_training",children:"General Training"})]})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(C,{children:"Series"}),e.jsxs(te,{value:a.series,onValueChange:s=>L({series:s}),children:[e.jsx(re,{children:e.jsx(ae,{})}),e.jsxs(ne,{children:[e.jsx(I,{value:"cambridge",children:"Cambridge (CB)"}),e.jsx(I,{value:"puropuro",children:"TestLoom"})]})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(C,{children:"Book No."}),e.jsx(U,{type:"number",min:1,value:a.book_number,onChange:s=>L({book_number:parseInt(s.target.value)||1})})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(C,{children:"Test No."}),e.jsx(U,{type:"number",min:1,max:4,value:a.test_number,onChange:s=>L({test_number:parseInt(s.target.value)||1})})]})]})]}),Ne=f?.report?(()=>{const s=f.report;return e.jsxs("section",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-2",children:[e.jsx("h3",{className:"text-sm font-semibold uppercase tracking-wide text-muted-foreground",children:"3. Preflight check"}),e.jsxs("div",{className:"flex items-center gap-2 text-xs",children:[s.repaired&&e.jsx(R,{variant:"secondary",children:"Old format auto-upgraded"}),s.errors.length===0?e.jsxs(R,{className:"bg-emerald-600 hover:bg-emerald-600",children:[e.jsx(Oe,{className:"mr-1 h-3 w-3"})," Ready"]}):e.jsxs(R,{variant:"destructive",children:[e.jsx(q,{className:"mr-1 h-3 w-3"})," ",s.errors.length," to fix"]}),s.warnings.length>0&&e.jsxs(R,{variant:"outline",children:[s.warnings.length," warnings"]})]})]}),e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2 text-center",children:[{label:"Passages",value:s.passages},{label:"Paragraphs",value:s.paragraphs},{label:"Questions",value:s.questions},{label:"Answers",value:`${s.answered}/${s.questions}`}].map(r=>e.jsxs("div",{className:"rounded-lg border bg-muted/30 p-2",children:[e.jsx("div",{className:"text-lg font-semibold",children:r.value}),e.jsx("div",{className:"text-[11px] uppercase tracking-wide text-muted-foreground",children:r.label})]},r.label))}),e.jsx("div",{className:"rounded-lg border overflow-hidden",children:e.jsxs("table",{className:"w-full text-xs",children:[e.jsx("thead",{className:"bg-muted/50 text-muted-foreground",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-2 py-1.5 text-left font-medium",children:"Questions"}),e.jsx("th",{className:"px-2 py-1.5 text-left font-medium",children:"Type"}),e.jsx("th",{className:"px-2 py-1.5 text-left font-medium",children:"Answer rule"}),e.jsx("th",{className:"px-2 py-1.5 text-left font-medium",children:"Answers"}),e.jsx("th",{className:"px-2 py-1.5 text-left font-medium",children:"Answer boxes"})]})}),e.jsxs("tbody",{children:[s.blocks.map((r,u)=>e.jsxs("tr",{className:"border-t",children:[e.jsxs("td",{className:"px-2 py-1.5 whitespace-nowrap",children:["P",r.part," · ",r.range]}),e.jsx("td",{className:"px-2 py-1.5",children:r.type}),e.jsx("td",{className:"px-2 py-1.5 text-muted-foreground",children:r.rule}),e.jsx("td",{className:"px-2 py-1.5",children:r.answers}),e.jsx("td",{className:"px-2 py-1.5 text-muted-foreground",children:r.layoutBoxes||"—"})]},u)),!s.blocks.length&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,className:"px-2 py-3 text-center text-muted-foreground",children:"No question blocks found in this JSON."})})]})]})}),(s.errors.length>0||s.warnings.length>0)&&e.jsx("div",{className:"space-y-1 rounded-lg border bg-muted/20 p-3 max-h-56 overflow-y-auto",children:[...s.errors,...s.warnings].slice(0,40).map((r,u)=>e.jsxs("p",{className:`text-xs flex items-start gap-1.5 ${r.level==="error"?"text-destructive":"text-amber-700"}`,children:[e.jsx(q,{className:"h-3 w-3 mt-0.5 shrink-0"})," ",r.message]},u))}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs(_,{onClick:()=>void W(!0),disabled:t,children:[t?e.jsx(Se,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(X,{className:"mr-2 h-4 w-4"}),"Import & open in builder"]}),e.jsxs(_,{variant:"outline",onClick:()=>void W(!1),disabled:t,children:[e.jsx(Ee,{className:"mr-2 h-4 w-4"})," Import & save"]})]})]})})():null;return e.jsxs("div",{className:"max-w-4xl mx-auto space-y-6 pb-12",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs(_,{variant:"ghost",onClick:()=>i("/admin/reading-tests"),className:"gap-2",children:[e.jsx(Te,{className:"h-4 w-4"})," Back"]}),e.jsxs("h1",{className:"text-2xl font-bold flex items-center gap-2",children:[e.jsx(ke,{className:"h-6 w-6"}),n==="import"?"Import Reading Test JSON":n==="create"?"Create Reading Test JSON":"Reading Test — JSON Workflow"]})]}),e.jsxs(Re,{defaultValue:n??"create",className:"w-full",children:[e.jsxs(Pe,{className:"grid grid-cols-2 w-full max-w-md mx-auto",children:[e.jsxs(ee,{value:"create",className:"gap-2",children:[e.jsx(B,{className:"h-4 w-4"})," Create"]}),e.jsxs(ee,{value:"import",className:"gap-2",children:[e.jsx(Ae,{className:"h-4 w-4"})," Import"]})]}),e.jsx(se,{value:"create",className:"mt-4",children:e.jsx(K,{children:e.jsxs(H,{className:"p-6 space-y-6",children:[Q,e.jsxs("section",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-2",children:[e.jsx("h2",{className:"text-sm font-semibold uppercase tracking-wide text-muted-foreground",children:"2. Generate JSON with AI"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(_,{onClick:()=>{j(x??M(a)),o(!0)},variant:"ghost",size:"sm",children:[e.jsx(Ce,{className:"h-4 w-4 mr-2"}),x?"Edit Template":"Customize Template"]}),e.jsxs(_,{onClick:be,variant:"ghost",size:"sm",title:"For fixing a test you already exported",children:[e.jsx(X,{className:"h-4 w-4 mr-2"})," Copy “edit a test” prompt"]}),e.jsxs(_,{onClick:ye,variant:"outline",size:"sm",children:[p?e.jsx(J,{className:"h-4 w-4 mr-2"}):e.jsx(V,{className:"h-4 w-4 mr-2"}),"Copy AI Prompt"]})]})]}),e.jsxs("div",{className:"rounded-md border border-dashed bg-muted/30 p-4 text-sm",children:[e.jsxs("p",{className:"flex items-start gap-2",children:[e.jsx(B,{className:"h-4 w-4 mt-0.5 text-violet-600 shrink-0"}),e.jsxs("span",{children:[e.jsx("strong",{children:"How it works:"})," Click ",e.jsx("em",{children:"Copy AI Prompt"}),", paste it into Gemini / ChatGPT with the Reading test pages (including the Answers page), then open the ",e.jsx("strong",{children:"Import"})," tab, paste the JSON and check the preflight report. Instructions, answer boxes, option lists and answer rules are filled in for you."]})]}),x&&e.jsxs("p",{className:"text-xs text-emerald-700 flex items-center gap-1.5 mt-2",children:[e.jsx(J,{className:"h-3.5 w-3.5"})," Using your saved custom template."]})]}),e.jsxs("div",{className:"rounded-md border bg-muted/20 p-4 space-y-2",children:[e.jsx("p",{className:"text-sm font-medium",children:"Paper too long for one reply?"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"If the AI answers “this exceeds the maximum response size”, ask it one passage at a time. Copy each prompt below in a new chat, then combine the three answers in the Import tab."}),e.jsx("div",{className:"flex flex-wrap gap-2 pt-1",children:[1,2,3].map(s=>e.jsxs(_,{size:"sm",variant:"secondary",onClick:()=>void he(s),children:[pe===s?e.jsx(J,{className:"h-4 w-4 mr-2"}):e.jsx(V,{className:"h-4 w-4 mr-2"}),"Copy prompt — Passage ",s]},s))})]})]})]})})}),e.jsx(se,{value:"import",className:"mt-4",children:e.jsx(K,{children:e.jsxs(H,{className:"p-6 space-y-6",children:[Q,e.jsxs("section",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-2",children:[e.jsx("h2",{className:"text-sm font-semibold uppercase tracking-wide text-muted-foreground",children:"2. Paste the JSON"}),e.jsx(_,{variant:O?"default":"outline",size:"sm",onClick:()=>P(s=>!s),children:O?"Whole test in one paste":"Paste part by part"})]}),O&&e.jsxs("div",{className:"rounded-lg border bg-muted/20 p-4 space-y-3",children:[e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Paste each passage’s JSON in its own box (one passage per AI reply), then press",e.jsx("strong",{children:" Combine parts"}),". Question numbers and the answer key are kept as they are."]}),D.map((s,r)=>e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(C,{className:"text-xs",children:["Passage ",r+1]}),s.trim()&&e.jsxs(R,{variant:"secondary",className:"text-[10px]",children:[s.trim().length," chars"]})]}),e.jsx(Z,{rows:4,className:"font-mono text-[11px]",value:s,onChange:u=>$(T=>T.map((k,A)=>A===r?u.target.value:k)),placeholder:`{ "passages": [ { "order": ${r+1}, "title": "...", "segments": [...], "groups": [...] } ] }`})]},r)),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs(_,{size:"sm",onClick:ge,children:[e.jsx(B,{className:"h-4 w-4 mr-2"})," Combine parts"]}),e.jsx(_,{size:"sm",variant:"ghost",onClick:()=>$(s=>[...s,""]),children:"+ Add another part"}),e.jsxs(_,{size:"sm",variant:"ghost",onClick:()=>{$(["","",""]),m(""),w(null)},children:[e.jsx(z,{className:"h-4 w-4 mr-2"})," Clear parts"]})]})]})]}),e.jsx(Qe,{value:c,onChange:s=>{m(s),w(null)},onImport:()=>void W(!0),importing:t,parse:we,exampleJson:qe(a),exampleFilename:`reading-${a.series}-b${a.book_number}-t${a.test_number}-example.json`,parseError:h,ctaLabel:"Import & open in builder",placeholder:'{ "version": 2, "title": "...", "passages": [ { "segments": [...], "groups": [...] } ] }',onMultipleFiles:xe}),f&&!f.report&&e.jsxs("p",{className:"text-xs text-destructive flex items-start gap-1.5",children:[e.jsx(q,{className:"h-3.5 w-3.5 mt-0.5 shrink-0"})," ",f.error]}),Ne]})})})]}),e.jsx($e,{open:E,onOpenChange:o,children:e.jsxs(Le,{className:"max-w-3xl",children:[e.jsx(Ie,{children:e.jsx(Me,{children:"AI Prompt Template — Reading"})}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Available placeholders:"," ",e.jsx("code",{className:"px-1 bg-muted rounded",children:"{{series_label}}"})," ",e.jsx("code",{className:"px-1 bg-muted rounded",children:"{{test_type_label}}"})," ",e.jsx("code",{className:"px-1 bg-muted rounded",children:"{{book_number}}"})," ",e.jsx("code",{className:"px-1 bg-muted rounded",children:"{{test_number}}"}),". Saved locally on this device."]}),e.jsx(Z,{value:S,onChange:s=>j(s.target.value),rows:20,className:"font-mono text-[11px]"})]}),e.jsxs(De,{className:"gap-2 sm:gap-2",children:[e.jsxs(_,{variant:"ghost",onClick:()=>{j(M(a)),g.info("Reset to default — click Save to confirm")},children:[e.jsx(z,{className:"h-4 w-4 mr-2"})," Reset to default"]}),x&&e.jsx(_,{variant:"outline",onClick:()=>{try{localStorage.removeItem(Y)}catch{}v(null),g.success("Custom template cleared"),o(!1)},children:"Clear custom"}),e.jsx(_,{onClick:()=>{try{localStorage.setItem(Y,S)}catch{}v(S),g.success("Template saved"),o(!1)},children:"Save template"})]})]})})]})}export{gs as default};
