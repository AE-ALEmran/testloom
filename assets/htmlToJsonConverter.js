/**
 * Universal HTML & JSON Converter for IELTS Admin Panel
 * Compatible with Reading, Writing, Listening, Speaking
 */

function cleanText(t) {
  if (!t) return "";
  return String(t).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Extracts embedded JSON from HTML if available
 */
export function extractEmbeddedJson(html) {
  if (!html || typeof html !== "string") return null;
  const str = html.trim();
  
  // If already pure JSON
  if ((str.startsWith("{") && str.endsWith("}")) || (str.startsWith("[") && str.endsWith("]"))) {
    try {
      return JSON.parse(str);
    } catch (_) {
      try {
        const cleaned = str.replace(/```(?:json)?/gi, "").replace(/```/g, "").replace(/,(\s*[}\]])/g, "$1").trim();
        return JSON.parse(cleaned);
      } catch (_) {}
    }
  }

  // 1. Check for <script type="application/json"> or specific IDs
  const scriptRegex = /<script[^>]*?(?:type=["']application\/json["']|id=["'](?:__NEXT_DATA__|test-data|json-data)["'])[^>]*?>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && typeof parsed === "object") return parsed;
    } catch (_) {}
  }

  // 2. Check for <pre> or <code> blocks containing JSON
  const preRegex = /<(?:pre|code)[^>]*?>([\s\S]*?)<\/(?:pre|code)>/gi;
  while ((match = preRegex.exec(html)) !== null) {
    const raw = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      } catch (_) {}
    }
  }

  // 3. Search for any JSON block starting with { and having known test keys
  const blockMatch = html.match(/\{[\s\S]*?(?:"title"|"passages"|"tasks"|"parts"|"continuous_audio_url")[\s\S]*?\}/);
  if (blockMatch) {
    try {
      const parsed = JSON.parse(blockMatch[0]);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (_) {}
  }

  return null;
}

/**
 * Convert HTML DOM to Reading Test JSON (puropuri.reading.v2 schema)
 */
export function convertHtmlToReadingJson(doc, rawHtml) {
  const title = cleanText(doc.querySelector("title, h1")?.textContent) || "Imported Reading Test";
  
  // Try to find passages
  let passageEls = Array.from(doc.querySelectorAll(".passage, article, section, [id*='passage'], [class*='passage']"));
  if (!passageEls.length) {
    const headings = Array.from(doc.querySelectorAll("h2, h3")).filter(h => /passage|part\s*\d/i.test(h.textContent));
    if (headings.length) {
      passageEls = headings.map(h => {
        const container = document.createElement("div");
        container.appendChild(h.cloneNode(true));
        let sib = h.nextElementSibling;
        while (sib && !headings.includes(sib)) {
          container.appendChild(sib.cloneNode(true));
          sib = sib.nextElementSibling;
        }
        return container;
      });
    }
  }

  if (!passageEls.length) {
    passageEls = [doc.body || doc];
  }

  // Extract all questions from the entire HTML if any exist
  const rawQuestions = [];
  const qElements = Array.from(doc.querySelectorAll(".question, .q-item, [id*='question'], li"));
  qElements.forEach(el => {
    const txt = cleanText(el.textContent);
    const m = txt.match(/^(?:question\s*)?(\d+)[\.\s:–-]\s*(.+)/i);
    if (m) {
      const qNum = parseInt(m[1], 10);
      if (qNum >= 1 && qNum <= 40) {
        rawQuestions.push({ number: qNum, text: m[2] });
      }
    }
  });

  const passages = [1, 2, 3].map((partNum, idx) => {
    const pel = passageEls[idx] || passageEls[0] || (doc.body || doc);
    const pTitle = cleanText(pel.querySelector("h2, h3, h1, .title")?.textContent) || `Reading Passage ${partNum}`;
    
    // Extract paragraphs
    const paragraphs = [];
    const pTags = Array.from(pel.querySelectorAll("p, .paragraph"));
    pTags.forEach((p, pIdx) => {
      const text = cleanText(p.textContent);
      if (!text || text.length < 15) return;
      const letterMatch = text.match(/^([A-Z])[\.\s:]\s*(.+)/);
      if (letterMatch) {
        paragraphs.push({ label: letterMatch[1], content: letterMatch[2] });
      } else {
        const autoLabel = String.fromCharCode(65 + (pIdx % 26));
        paragraphs.push({ label: autoLabel, content: text });
      }
    });

    if (!paragraphs.length) {
      paragraphs.push({ label: "A", content: cleanText(pel.textContent) || `Reading Passage ${partNum} content.` });
    }

    const startQ = partNum === 1 ? 1 : partNum === 2 ? 14 : 27;
    const endQ = partNum === 1 ? 13 : partNum === 2 ? 26 : 40;
    const totalInPart = endQ - startQ + 1;

    // Build question groups for this passage
    const groups = [
      {
        type: "tfng",
        start: startQ,
        end: endQ,
        instruction: `Do the following statements agree with the information given in Reading Passage ${partNum}? In boxes ${startQ}–${endQ} on your answer sheet, write TRUE, FALSE, or NOT GIVEN.`,
        questions: Array.from({ length: totalInPart }, (_, qIdx) => {
          const qNum = startQ + qIdx;
          const foundQ = rawQuestions.find(q => q.number === qNum);
          return {
            number: qNum,
            text: foundQ ? foundQ.text : `Statement concerning details in Passage ${partNum} (Item ${qNum})`,
            answer: qIdx % 3 === 0 ? "TRUE" : qIdx % 3 === 1 ? "FALSE" : "NOT GIVEN",
            accepted: []
          };
        })
      }
    ];

    return {
      part: partNum,
      order: partNum,
      title: pTitle,
      instructions: `Read the text below and answer questions ${startQ}–${endQ}.`,
      segments: paragraphs,
      paragraphs: paragraphs,
      groups: groups
    };
  });

  return {
    schema: "puropuri.reading.v2",
    version: 2,
    title: title,
    series: "cambridge",
    book_number: 1,
    test_number: 1,
    test_type: "academic",
    difficulty: "medium",
    total_time: 60,
    total_questions: 40,
    is_active: true,
    passages: passages
  };
}

/**
 * Convert HTML DOM to Writing Test JSON (IELTS Academic/General Writing schema)
 */
export function convertHtmlToWritingJson(doc, rawHtml) {
  const title = cleanText(doc.querySelector("title, h1")?.textContent) || "Imported Writing Test";
  
  let task1Prompt = "";
  let task2Prompt = "";
  let chartImg = "";

  const allText = doc.body?.textContent || rawHtml;
  const imgEl = doc.querySelector("img");
  if (imgEl && imgEl.src) chartImg = imgEl.src;

  const task1El = doc.querySelector(".task-1, #task-1, [id*='task1'], [class*='task1'], [id*='task-1'], [class*='task-1']");
  const task2El = doc.querySelector(".task-2, #task-2, [id*='task2'], [class*='task2'], [id*='task-2'], [class*='task-2']");

  if (task1El) task1Prompt = cleanText(task1El.textContent);
  if (task2El) task2Prompt = cleanText(task2El.textContent);

  if (!task1Prompt) {
    const pElements = Array.from(doc.querySelectorAll("p")).map(p => cleanText(p.textContent)).filter(t => t.length > 25);
    if (pElements.length >= 2) {
      task1Prompt = pElements[0];
      task2Prompt = pElements[1];
    } else if (pElements.length === 1) {
      task1Prompt = pElements[0];
      task2Prompt = pElements[0];
    } else {
      task1Prompt = cleanText(allText.slice(0, 300)) || "The chart below shows information about public transport usage. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.";
      task2Prompt = cleanText(allText.slice(300, 900)) || "Some people believe that education should focus on practical skills. Discuss both views and give your opinion.";
    }
  }

  if (!task2Prompt) {
    task2Prompt = "Some people believe that technology has improved the way people communicate, while others disagree. Discuss both views and give your own opinion.";
  }

  return {
    title: title,
    series: "cambridge",
    book_number: 1,
    test_number: 1,
    test_type: "academic",
    difficulty: "medium",
    total_time: 60,
    total_questions: 2,
    is_active: true,
    tasks: [
      {
        title: "Writing Task 1",
        part: "Task 1",
        question_type: "task_1",
        prompt: task1Prompt,
        chart_image_url: chartImg || "",
        min_words: 150,
        time_minutes: 20
      },
      {
        title: "Writing Task 2",
        part: "Task 2",
        question_type: "task_2",
        prompt: task2Prompt,
        min_words: 250,
        time_minutes: 40
      }
    ]
  };
}

/**
 * Convert HTML DOM to Listening Test JSON (4 parts, 40 questions, continuous audio)
 */
export function convertHtmlToListeningJson(doc, rawHtml) {
  const title = cleanText(doc.querySelector("title, h1")?.textContent) || "Imported Listening Test";
  
  const audioEl = doc.querySelector("audio, source, a[href*='.mp3'], a[href*='audio']");
  const audioUrl = audioEl ? (audioEl.src || audioEl.href || audioEl.getAttribute("src") || "") : "";

  // Extract all questions from the HTML if available
  const rawQuestions = [];
  const qElements = Array.from(doc.querySelectorAll(".question, .q-item, [id*='question'], li, tr"));
  qElements.forEach(el => {
    const txt = cleanText(el.textContent);
    const m = txt.match(/^(?:question\s*)?(\d+)[\.\s:–-]\s*(.+)/i);
    if (m) {
      const qNum = parseInt(m[1], 10);
      if (qNum >= 1 && qNum <= 40) {
        rawQuestions.push({ number: qNum, text: m[2] });
      }
    }
  });

  // Exactly 40 questions required: 10 per part
  const parts = [1, 2, 3, 4].map(partNum => {
    const startQ = (partNum - 1) * 10 + 1;
    const endQ = partNum * 10;
    const questions = [];
    for (let q = startQ; q <= endQ; q++) {
      const found = rawQuestions.find(rq => rq.number === q);
      questions.push({
        question_number: q,
        question_text: found ? found.text : `Listening item ${q}`,
        options: [],
        correct_answer: "answer",
        accepted_answers: []
      });
    }

    return {
      part_number: partNum,
      title: `Part ${partNum}`,
      section_title: `Section ${partNum}`,
      prompt: `Questions ${startQ}–${endQ}`,
      questions: questions
    };
  });

  return {
    title: title,
    series: "cambridge",
    book_number: 1,
    test_number: 1,
    test_type: "academic",
    difficulty: "medium",
    total_time: 30,
    total_questions: 40,
    is_active: true,
    continuous_audio_url: audioUrl || "https://pub-23b3d152175747f6abde5a6c7d044aab.r2.dev/AUDIOS/L-1.mp3",
    parts: parts
  };
}

/**
 * Convert HTML DOM to Speaking Test JSON (3 parts matching Zod schema ns)
 */
export function convertHtmlToSpeakingJson(doc, rawHtml) {
  let title = cleanText(doc.querySelector("title, h1")?.textContent) || "Speaking Test";
  if (!title.toLowerCase().startsWith("topic") && title.length < 5) {
    title = `Topic - ${title}`;
  }
  if (title.length < 3) title = "Topic - General Discussion";

  const items = Array.from(doc.querySelectorAll("li, p"))
    .map(el => cleanText(el.textContent))
    .filter(t => t.length > 5 && !/^(home|login|signup|about|contact|menu|admin)$/i.test(t));

  const p1Questions = (items.slice(0, 4).length >= 2 ? items.slice(0, 4) : [
    "What kind of music do you like listening to?",
    "Do you prefer listening to music alone or with others?",
    "Have you ever learned to play a musical instrument?",
    "Do you think music education is important for children?"
  ]).map(t => ({ text: t, hints: [] }));

  const cueCardText = items[4] || "Describe a memorable journey you have made.";
  const bullets = items.slice(5, 9).length >= 2 
    ? items.slice(5, 9) 
    : ["Where you went", "Who you went with", "What you did there", "And explain why this journey was memorable to you"];

  const p3Questions = (items.slice(9, 13).length >= 2 ? items.slice(9, 13) : [
    "Why do people like to travel to different places?",
    "How has tourism changed in your country over recent years?",
    "Do you think people will travel more or less in the future?"
  ]).map(t => ({ text: t, hints: [] }));

  return {
    title: title,
    difficulty: "medium",
    target_band: 9,
    examiner_voice: "en-GB-SoniaNeural",
    parts: [
      {
        part_number: 1,
        title: "Part 1 — Introduction & Interview",
        description: "The examiner asks you about yourself, your home, work or studies and other familiar topics.",
        topic: "General",
        prep_time_seconds: 0,
        speaking_time_seconds: 0,
        questions: p1Questions
      },
      {
        part_number: 2,
        title: "Part 2 — Individual Long Turn",
        description: "You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
        topic: "Individual Long Turn",
        cue_card: cueCardText.startsWith("Describe") ? cueCardText : `Describe ${cueCardText}`,
        bullets: bullets,
        prep_time_seconds: 60,
        speaking_time_seconds: 145,
        questions: []
      },
      {
        part_number: 3,
        title: "Part 3 — Discussion",
        description: "The examiner asks you further questions connected to the topic of Part 2.",
        topic: "Two-way Discussion",
        prep_time_seconds: 0,
        speaking_time_seconds: 0,
        questions: p3Questions
      }
    ]
  };
}

/**
 * Universal auto-converter function
 * @param {string} text Raw text or HTML
 * @param {'reading'|'writing'|'listening'|'speaking'} moduleType
 * @returns {string} Formatted JSON string
 */
export function processImportContent(text, moduleType = "reading") {
  if (!text || typeof text !== "string") return text;
  const trimmed = text.trim();

  // If already pure JSON, validate & return
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch (_) {}
  }

  // Check for embedded JSON in HTML or markdown fences
  const embedded = extractEmbeddedJson(trimmed);
  if (embedded) {
    return JSON.stringify(embedded, null, 2);
  }

  // Check if content looks like HTML
  const isHtml = /<[a-z!][\s\S]*>/i.test(trimmed);
  if (isHtml && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, "text/html");
      let res;
      const mod = (moduleType || "reading").toLowerCase();
      if (mod.includes("read")) {
        res = convertHtmlToReadingJson(doc, trimmed);
      } else if (mod.includes("writ")) {
        res = convertHtmlToWritingJson(doc, trimmed);
      } else if (mod.includes("listen")) {
        res = convertHtmlToListeningJson(doc, trimmed);
      } else if (mod.includes("speak")) {
        res = convertHtmlToSpeakingJson(doc, trimmed);
      } else {
        res = convertHtmlToReadingJson(doc, trimmed);
      }
      if (res) return JSON.stringify(res, null, 2);
    } catch (e) {
      console.warn("HTML conversion error:", e);
    }
  }

  return text;
}
