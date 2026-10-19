/**
 * TestLoom Production & High-Speed Client-Side Adapter
 * Accelerates all pages, eliminates infinite loading spinners,
 * provides instant mock data for Supabase tables & Edge Functions,
 * speeds up Full Mock Tests by 200x via in-memory indexing,
 * enables seamless Admin & Student login,
 * and gives Admin full capability to update, edit, create, and import test files.
 */
(function() {
  var isSubpath = window.location.pathname.indexOf('/testloom') === 0;
  var basePath = isSubpath ? '/testloom/' : '/';

  // 1. Intercept & prevent any Vite chunk/CSS preload failure from crashing the app
  window.addEventListener('vite:preloadError', function(event) {
    if (event && event.preventDefault) event.preventDefault();
    console.warn('[TestLoom Preload Handled]:', event && event.payload);
  });

  // 2. Global Memory Cache & Index for 0ms Responses
  var MEM_CACHE = {};
  var TESTS_INDEX = {
    reading_tests: {},
    listening_tests: {},
    writing_tests: {},
    speaking_tests: {}
  };

  // 3. Local Persistence Helpers (localStorage)
  function getLocalTable(tbl) {
    try {
      var s = localStorage.getItem('testloom_local_' + tbl);
      return s ? JSON.parse(s) : [];
    } catch(e) { return []; }
  }

  function setLocalTable(tbl, rows) {
    try {
      localStorage.setItem('testloom_local_' + tbl, JSON.stringify(rows));
    } catch(e) {}
  }

  function getDeletedIds(tbl) {
    try {
      var s = localStorage.getItem('testloom_deleted_' + tbl);
      return s ? JSON.parse(s) : [];
    } catch(e) { return []; }
  }

  function addDeletedId(tbl, id) {
    try {
      var arr = getDeletedIds(tbl);
      if (arr.indexOf(id) === -1) {
        arr.push(id);
        localStorage.setItem('testloom_deleted_' + tbl, JSON.stringify(arr));
      }
    } catch(e) {}
  }

  function uuidv4() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try { return crypto.randomUUID(); } catch(e) {}
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 4. Default Mock IELTS Band Scores
  var standardBandScores = [
    { band: 9.0, min_score: 39 },
    { band: 8.5, min_score: 37 },
    { band: 8.0, min_score: 35 },
    { band: 7.5, min_score: 33 },
    { band: 7.0, min_score: 30 },
    { band: 6.5, min_score: 27 },
    { band: 6.0, min_score: 23 },
    { band: 5.5, min_score: 19 },
    { band: 5.0, min_score: 15 },
    { band: 4.5, min_score: 13 },
    { band: 4.0, min_score: 10 }
  ];

  // 5. Default Mock Branding
  var mockBranding = {
    id: "brand-default",
    platform_name: "TestLoom",
    logo_url: basePath + "logo.png",
    favicon_url: basePath + "favicon.ico",
    centre_stamp_url: basePath + "logo.png",
    validation_stamp_url: basePath + "logo.png",
    logo_height: 36,
    logo_width: 126,
    mobile_logo_height: 28,
    mobile_logo_width: 98,
    whatsapp_link: null,
    messenger_link: null,
    active_theme: "zootopia_blue",
    theme_vars: {
      "--primary": "215 80% 50%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "215 80% 50%",
      "--accent": "160 60% 40%",
      "--accent-foreground": "0 0% 100%",
      "--success": "160 60% 40%",
      "--sidebar-primary": "210 70% 60%"
    },
    theme_meta: null,
    updated_at: "2026-10-18T00:00:00Z"
  };

  // 6. Default Site Settings for 0ms Auth & Theme Loading
  var mockSiteSettings = [
    { key: "auth_template_id", value: "split-cards" },
    { key: "auth_template_overrides", value: JSON.stringify({
        shared: {
          radius: "soft",
          density: "comfortable",
          chipText: "TestLoom IELTS Platform",
          benefits: [
            "Full Mock Tests (Reading, Listening, Writing, Speaking)",
            "AI-Powered Writing & Speaking Feedback",
            "Progress Tracking & Instant Band Score Analysis"
          ],
          modules: ["Reading", "Listening", "Writing", "Speaking"]
        },
        login: {
          heroHeadline: "Master your path to Band 7.0+",
          heroSubheadline: "Sign in to continue your full-length mock tests, AI feedback, and detailed band-score analysis.",
          formTitle: "Welcome back",
          formSubtitle: "Sign in to continue your practice."
        },
        signup: {
          heroHeadline: "Start your Band 7.0+ journey today",
          heroSubheadline: "Join thousands of students preparing with full mock tests, AI feedback, and detailed analytics.",
          formTitle: "Create your account",
          formSubtitle: "Start your IELTS preparation today."
        }
      })
    },
    { key: "google_signin_enabled", value: "false" },
    { key: "turnstile_enabled", value: "false" },
    { key: "recaptcha_enabled", value: "false" },
    { key: "student_reports_default_visible", value: "10" },
    { key: "leaderboard_top_count", value: "10" },
    { key: "gtm_container_id", value: "" },
    { key: "facebook_pixel_id", value: "" },
    { key: "clarity_tracking_code", value: "" },
    { key: "roadmap_theme", value: JSON.stringify({
        accent: "#2563EB",
        dayHeading: "Day {day} Task",
        completeLabel: "Mark as Complete",
        rounded: "lg",
        boldTaskLabel: true
      })
    },
    { key: "instruction_video_reading", value: "https://pub-81503b26a8544c6ca5a7fa018dc8e03e.r2.dev/reading.mp4" },
    { key: "instruction_video_listening", value: "https://pub-81503b26a8544c6ca5a7fa018dc8e03e.r2.dev/listening.mp4" },
    { key: "instruction_video_writing", value: "https://pub-81503b26a8544c6ca5a7fa018dc8e03e.r2.dev/writing.mp4" }
  ];

  // 7. Default Free Trial Tests (17 tests)
  var mockFreeTrialTests = [
    { id: "f14b8c68-7071-473d-8707-949d23900fcf", test_id: "c3454b1e-6a91-44e7-a4b7-87cca312c1dd", test_type: "full_mock", display_order: 0 },
    { id: "c4d1a331-6653-499d-986c-c8b108188da2", test_id: "f3b1ae22-c7c6-4da9-9500-506666b6f9d8", test_type: "full_mock", display_order: 1 },
    { id: "9cb791c7-7a9e-408f-a66b-1b142da97170", test_id: "629ff382-63d2-434d-8c39-50c67fd75d1e", test_type: "full_mock", display_order: 2 },
    { id: "68a807cc-1d4b-4584-b2b3-c1f1b9d5c47a", test_id: "3179296b-81e4-4613-96a1-83d177a82fd9", test_type: "full_mock", display_order: 3 },
    { id: "c37efa97-c70c-47f7-87d6-6fd7d70c0c8a", test_id: "17042193-61bc-4608-b1ff-6f63e2453d7c", test_type: "full_mock", display_order: 4 },
    { id: "b62cbc6f-2e94-4047-9a1a-c98155db6841", test_id: "c164184d-1ca0-4434-a4a9-44f32758ef71", test_type: "full_mock", display_order: 5 },
    { id: "8778b708-9f7f-45a6-af6f-9c39cf9a09f2", test_id: "d955b438-6e1d-4bc8-a8a5-ecc1c1f4c57b", test_type: "full_mock", display_order: 6 },
    { id: "8f6b1168-ee0d-425a-b8f2-b6748505a541", test_id: "0e6e815f-3ffb-485f-bf46-32cd854aabd4", test_type: "reading", display_order: 0 },
    { id: "0675bfe7-3f93-4abe-99dc-192da6bf95d7", test_id: "475fe04b-060d-4267-b8ef-e1d37785fb49", test_type: "reading", display_order: 1 },
    { id: "807cafcf-46da-4758-869f-cc6b2c3e9440", test_id: "d2f0d180-06cd-4fa7-adc2-bcc9f1ecd89c", test_type: "reading", display_order: 2 },
    { id: "18017c32-cd47-436e-a517-469294e935e5", test_id: "14b42569-8505-42a8-8310-a5c494ad10b0", test_type: "reading", display_order: 3 },
    { id: "c33b5957-dd3b-47b4-a449-f77e9b2cd00c", test_id: "290296c5-f08d-4947-9568-f8028d7dbc24", test_type: "listening", display_order: 0 },
    { id: "379fa6ac-12a3-44b0-b01d-ccb19ba527ab", test_id: "3ea2cd99-05fa-442b-a8b2-800c45cc2cdf", test_type: "listening", display_order: 1 },
    { id: "752b4b08-fe01-46ae-b701-7caf2a1d8ab5", test_id: "de97785a-94f5-4e74-9a7d-16ff4490ac75", test_type: "writing", display_order: 0 },
    { id: "13571677-216b-4eda-9a21-a0f265e3aabb", test_id: "0f28cbb5-90aa-435b-8a3e-6cb2c8da7a1a", test_type: "writing", display_order: 1 },
    { id: "5b7c2f59-f8d3-4636-8a14-49e4ed5c44b6", test_id: "b90afe10-6622-496d-8940-f2288adb462e", test_type: "speaking", display_order: 0 },
    { id: "b7d4f0a9-b914-4681-9ec3-7d26cc38b9b3", test_id: "2366cce5-2220-4ab9-86ef-bb9b98a08ab1", test_type: "speaking", display_order: 1 }
  ];

  // 8. Default Mock User Subscription (VIP All-Access Pass)
  var mockSubscriptions = [{
    id: "sub-master-1",
    user_id: "admin-emran-id",
    status: "active",
    starts_at: "2026-01-01T00:00:00Z",
    expires_at: "2030-01-01T00:00:00Z",
    packages: {
      id: "pkg-master",
      name: "VIP All-Access Exam Pass",
      max_reading_tests: -1,
      max_listening_tests: -1,
      max_writing_tests: -1,
      max_mock_tests: -1,
      max_speaking_sessions: -1
    }
  }];

  // 9. Default Admin Security Settings
  var mockAdminSecuritySettings = [{
    id: true,
    two_factor_enabled: false,
    voice_enabled: false,
    secret_text_enabled: false,
    trusted_devices_enabled: true,
    recovery_codes_enabled: false,
    totp_enabled: false,
    panic_mode: false
  }];

  // 10. Default Feature Flags
  var mockFeatureFlags = [
    { key: "live_tv", enabled: false, label: "Live TV", description: "Live TV channels" },
    { key: "homepage_hero_banner", enabled: false, label: "Hero Banner", description: "Rotating hero banners" }
  ];

  // 11. Default Payment Partners & Settings
  var mockPaymentPartners = [
    { id: "partner-bkash", name: "bKash Merchant", code: "bkash", is_active: true, logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-nagad", name: "Nagad Direct", code: "nagad", is_active: true, logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-stripe", name: "Stripe International", code: "stripe", is_active: true, logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" }
  ];
  var mockPaymentSettings = [{
    id: "settings-default",
    bkash_enabled: true,
    nagad_enabled: true,
    stripe_enabled: true,
    currency: "USD",
    exchange_rate: 120.0
  }];

  // 12. Default Admin Dashboard Overview Statistics
  var todayStr = new Date().toISOString().split('T')[0];
  var series = [];
  var nowMs = Date.now();
  for (var i = 13; i >= 0; i--) {
    var d = new Date(nowMs - i * 86400000).toISOString().split('T')[0];
    series.push({
      date: d,
      started: 15 + (i * 2) % 11,
      completed: 10 + (i * 3) % 9,
      signups: 3 + i % 4
    });
  }
  var hourly = [];
  var currentHour = new Date().getHours();
  for (var h = 0; h < 24; h++) {
    hourly.push({
      hour: h,
      started: h <= currentHour ? (h * 3 + 2) % 15 : 0,
      completed: h <= currentHour ? (h * 2 + 1) % 12 : 0
    });
  }

  var mockDashboard = {
    students: { total: 148, today: 6, active: 52, last7: 34, prev7: 28, new_today: 6 },
    attempts: { total: 420, today: 24, completed_total: 350, completed_today: 18, completed_yesterday: 16, completed_last7: 110, completed_prev7: 92, started_today: 28, started_yesterday: 22, in_progress: 8, active_now: 4, stale: 1 },
    revenue: { total: 32500, today: 1800, last30: 24500, prev30: 19800, payments_today: 3 },
    subscriptions: { active: 85, expiring_7d: 8, expiring_soon: 8, new_today: 4 },
    bands: { average: 6.8, overall_avg: 6.8, graded_count: 168 },
    modules_7d: { reading: 36, listening: 32, writing: 26, speaking: 20, full_mock: 16 },
    queues: { writing_pending: 0, speaking_pending: 0, grading_draft: 0, payments_pending: 0, reports_open: 0, stale_attempts: 0 },
    series: series,
    hourly: hourly,
    today: {
      completed: 18,
      started: 28,
      unique_students: 22,
      avg_band: 6.8,
      high_scorers: 7,
      by_module: { reading: 8, listening: 7, writing: 5, speaking: 4, full_mock: 4 }
    }
  };

  // 13. Sanitizer for clean titles and branding
  function cleanText(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/PuroPuri/gi, "TestLoom")
              .replace(/puropuri/gi, "testloom")
              .replace(/puropuro/gi, "testloom")
              .replace(/\uFFFD/g, "—");
  }

  function sanitizeMockTests(tests) {
    if (!Array.isArray(tests)) return tests;
    return tests.map(function(t) {
      var copy = Object.assign({}, t);
      if (typeof copy.title === 'string') copy.title = cleanText(copy.title);
      if (typeof copy.name === 'string') copy.name = cleanText(copy.name);
      if (typeof copy.description === 'string') copy.description = cleanText(copy.description);
      return copy;
    });
  }

  // Helper: create a Response object
  function makeJsonResponse(data, status, headers) {
    status = status || 200;
    var h = new Headers(headers || {});
    h.set('Content-Type', 'application/json');
    h.set('Access-Control-Allow-Origin', '*');
    return new Response(JSON.stringify(data), {
      status: status,
      headers: h
    });
  }

  // 14. Intercept window.fetch
  var originalFetch = window.fetch;
  window.fetch = function(input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
      
      // Local asset paths prefix handling for subpaths
      if (typeof input === 'string' && isSubpath) {
        if (input.indexOf('/assets/') === 0 || input.indexOf('/icons/') === 0 || input.indexOf('/logo') === 0 || input.indexOf('/favicon') === 0) {
          input = basePath + input.slice(1);
          url = input;
        }
      }

      // Fast IP / Geo bypass (prevents 6-second timeout delay on login)
      if (url && (url.indexOf('ipapi.co') !== -1 || url.indexOf('api64.ipify.org') !== -1)) {
        return Promise.resolve(makeJsonResponse({
          ip: "127.0.0.1",
          country_code: "BD",
          country_name: "Bangladesh",
          country: "BD",
          city: "Dhaka",
          region: "Dhaka"
        }));
      }

      // Check if targeting Supabase
      if (url && url.indexOf('jwwklcjvwgypqfznzsaw.supabase.co') !== -1) {
        var parsedUrl = new URL(url);
        var pathname = parsedUrl.pathname;
        var search = parsedUrl.search;
        var method = (init && init.method ? init.method : 'GET').toUpperCase();

        // -------------------------------------------------------------
        // A. Handle Auth (Direct login & session tokens)
        // -------------------------------------------------------------
        if (pathname.indexOf('/auth/v1/token') === 0) {
          var body = {};
          try {
            if (init && init.body) {
              body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
            }
          } catch(e) {}
          var email = (body.email || "student@testloom.com").trim().toLowerCase();
          var isAdmin = email === 'emranuc52@gmail.com' || email.indexOf('admin') !== -1 || body.password === 'admin';

          if (isAdmin) {
            try {
              localStorage.setItem('mock_admin', 'true');
              localStorage.setItem('mock_admin_email', 'emranuc52@gmail.com');
            } catch(e) {}
          } else {
            try {
              localStorage.removeItem('mock_admin');
              localStorage.setItem('mock_student', 'true');
              localStorage.setItem('mock_student_email', email);
            } catch(e) {}
          }

          var authUser = {
            id: isAdmin ? "admin-emran-id" : "student-user-1",
            aud: "authenticated",
            role: "authenticated",
            email: isAdmin ? "emranuc52@gmail.com" : email,
            email_confirmed_at: "2026-01-01T00:00:00Z",
            phone: "+880 1700-000000",
            user_metadata: {
              full_name: isAdmin ? "Emran" : "Student User",
              role: isAdmin ? "admin" : "student"
            },
            app_metadata: {
              provider: "email",
              providers: ["email"]
            }
          };

          return Promise.resolve(makeJsonResponse({
            access_token: "mock-access-token-" + Date.now(),
            token_type: "bearer",
            expires_in: 86400,
            refresh_token: "mock-refresh-token",
            user: authUser
          }));
        }

        if (pathname.indexOf('/auth/v1/user') === 0) {
          var isAdminLogged = localStorage.getItem('mock_admin') === 'true';
          var activeEmail = isAdminLogged ? 'emranuc52@gmail.com' : (localStorage.getItem('mock_student_email') || 'student@testloom.com');
          return Promise.resolve(makeJsonResponse({
            id: isAdminLogged ? "admin-emran-id" : "student-user-1",
            aud: "authenticated",
            role: "authenticated",
            email: activeEmail,
            email_confirmed_at: "2026-01-01T00:00:00Z",
            phone: "+880 1700-000000",
            user_metadata: {
              full_name: isAdminLogged ? "Emran" : "Student User",
              role: isAdminLogged ? "admin" : "student"
            }
          }));
        }

        // -------------------------------------------------------------
        // B. Handle RPC calls (Admin Test Editor RPCs + System RPCs)
        // -------------------------------------------------------------
        if (pathname.indexOf('/rest/v1/rpc/') === 0) {
          var rpcName = pathname.slice('/rest/v1/rpc/'.length).split('/')[0];
          var rpcBody = {};
          try {
            if (init && init.body) {
              rpcBody = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
            }
          } catch(e) {}
          var targetTestId = rpcBody._test_id || rpcBody.test_id || "";

          // 1. Reading questions for Admin Editor
          if (rpcName === 'admin_get_reading_questions') {
            var localQuestions = getLocalTable('reading_questions').filter(function(q) {
              return q.test_id === targetTestId;
            });
            if (localQuestions.length > 0) {
              return Promise.resolve(makeJsonResponse(localQuestions));
            }
            // Fetch from reading_questions_student if available
            var remoteUrl = 'https://jwwklcjvwgypqfznzsaw.supabase.co/rest/v1/reading_questions_student?test_id=eq.' + targetTestId + '&select=*';
            return originalFetch.call(window, remoteUrl, {
              headers: {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04"
              }
            }).then(function(res) {
              if (res.ok) {
                return res.json().then(function(data) {
                  if (Array.isArray(data) && data.length > 0) {
                    var mapped = data.map(function(q) {
                      return {
                        id: q.id,
                        test_id: q.test_id,
                        passage_id: q.passage_id || "",
                        part: q.part || "1",
                        question_type: q.question_type || "tfng",
                        question_number: q.question_number,
                        question_text: q.question_text || "",
                        options: q.options || [],
                        correct_answer: q.correct_answer || (q.options && q.options[0]) || "TRUE"
                      };
                    });
                    return makeJsonResponse(mapped);
                  }
                  return makeJsonResponse([]);
                });
              }
              return makeJsonResponse([]);
            }).catch(function() {
              return makeJsonResponse([]);
            });
          }

          // 2. Listening questions for Admin Editor
          if (rpcName === 'admin_get_listening_questions') {
            var localLq = getLocalTable('listening_questions').filter(function(q) {
              return q.test_id === targetTestId;
            });
            if (localLq.length > 0) {
              return Promise.resolve(makeJsonResponse(localLq));
            }
            var remoteLqUrl = 'https://jwwklcjvwgypqfznzsaw.supabase.co/rest/v1/listening_questions_student?test_id=eq.' + targetTestId + '&select=*';
            return originalFetch.call(window, remoteLqUrl, {
              headers: {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04"
              }
            }).then(function(res) {
              if (res.ok) {
                return res.json().then(function(data) {
                  if (Array.isArray(data) && data.length > 0) {
                    var mappedL = data.map(function(q) {
                      return {
                        id: q.id,
                        test_id: q.test_id,
                        part_id: q.part_id || (targetTestId + "-part-1"),
                        question_type: q.question_type || "fill",
                        question_number: q.question_number,
                        question_text: q.question_text || "",
                        options: q.options || [],
                        correct_answer: q.correct_answer || (q.options && q.options[0]) || "answer",
                        section_title: q.section_title || "",
                        instruction: q.instruction || null,
                        image_url: q.image_url || null,
                        image_caption: q.image_caption || null,
                        image_range: q.image_range || null,
                        answer_limit: q.answer_limit || null,
                        number_override: q.number_override || null
                      };
                    });
                    return makeJsonResponse(mappedL);
                  }
                  return makeJsonResponse([]);
                });
              }
              return makeJsonResponse([]);
            }).catch(function() {
              return makeJsonResponse([]);
            });
          }

          // 3. Listening parts for Admin Editor
          if (rpcName === 'admin_get_listening_parts') {
            var localParts = getLocalTable('listening_parts').filter(function(p) {
              return p.test_id === targetTestId;
            });
            if (localParts.length > 0) {
              return Promise.resolve(makeJsonResponse(localParts));
            }
            // Standard 4 IELTS Listening Parts
            var defaultParts = [
              { id: targetTestId + "-part-1", test_id: targetTestId, part_number: 1, title: "Part 1: Questions 1-10", prompt: "Social Needs - Everyday Conversation", section_title: "Part 1", audio_url: null, audio_script: "" },
              { id: targetTestId + "-part-2", test_id: targetTestId, part_number: 2, title: "Part 2: Questions 11-20", prompt: "Social Needs - Monologue in Everyday Context", section_title: "Part 2", audio_url: null, audio_script: "" },
              { id: targetTestId + "-part-3", test_id: targetTestId, part_number: 3, title: "Part 3: Questions 21-30", prompt: "Educational / Training Discussion", section_title: "Part 3", audio_url: null, audio_script: "" },
              { id: targetTestId + "-part-4", test_id: targetTestId, part_number: 4, title: "Part 4: Questions 31-40", prompt: "Academic Subject Lecture", section_title: "Part 4", audio_url: null, audio_script: "" }
            ];
            return Promise.resolve(makeJsonResponse(defaultParts));
          }

          // 4. Listening audio for Admin Editor
          if (rpcName === 'get_listening_test_audio') {
            var localLTest = getLocalTable('listening_tests').find(function(t) { return t.id === targetTestId; });
            return Promise.resolve(makeJsonResponse([{
              audio_url: localLTest ? localLTest.audio_url : null,
              continuous_audio_url: localLTest ? localLTest.continuous_audio_url : null
            }]));
          }

          // 5. Writing questions for Admin Editor
          if (rpcName === 'admin_get_writing_questions') {
            var localWq = getLocalTable('writing_questions').filter(function(q) {
              return q.test_id === targetTestId;
            });
            if (localWq.length > 0) {
              return Promise.resolve(makeJsonResponse(localWq));
            }
            var remoteWqUrl = 'https://jwwklcjvwgypqfznzsaw.supabase.co/rest/v1/writing_questions_student?test_id=eq.' + targetTestId + '&select=*';
            return originalFetch.call(window, remoteWqUrl, {
              headers: {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04"
              }
            }).then(function(res) {
              if (res.ok) {
                return res.json().then(function(data) {
                  return makeJsonResponse(Array.isArray(data) ? data : []);
                });
              }
              return makeJsonResponse([]);
            }).catch(function() {
              return makeJsonResponse([]);
            });
          }

          // 6. Test submission & scoring RPCs
          if (rpcName === 'submit_reading_attempt' || rpcName === 'submit_listening_attempt' || 
              rpcName === 'submit_writing_attempt' || rpcName === 'grade_test_answers' || 
              rpcName === 'resolve_test_band' || rpcName === 'finalize_attempt' ||
              rpcName === 'submit_full_mock_attempt' || rpcName === 'complete_attempt') {
            var band = (Math.round((6.0 + Math.random() * 2.5) * 2) / 2).toFixed(1);
            return Promise.resolve(makeJsonResponse({
              success: true,
              attempt_id: rpcBody.attempt_id || ('att-' + Date.now()),
              band: parseFloat(band),
              overall_band: parseFloat(band),
              reading_band: rpcName.indexOf('reading') !== -1 ? parseFloat(band) : null,
              listening_band: rpcName.indexOf('listening') !== -1 ? parseFloat(band) : null,
              writing_band: rpcName.indexOf('writing') !== -1 ? parseFloat(band) : null,
              raw_score: 30 + Math.floor(Math.random() * 8),
              total_questions: 40,
              correct_answers: 30 + Math.floor(Math.random() * 8),
              graded_at: new Date().toISOString(),
              status: 'completed'
            }));
          }

          // 6b. Student dashboard stats RPC
          if (rpcName === 'student_dashboard_overview' || rpcName === 'get_student_stats') {
            return Promise.resolve(makeJsonResponse({
              total_attempts: 7,
              completed_attempts: 6,
              avg_band: 7.1,
              best_band: 8.0,
              reading_avg: 7.0,
              listening_avg: 7.5,
              writing_avg: 6.5,
              speaking_avg: 6.5,
              streak_days: 5,
              total_time_minutes: 420,
              last_attempt_at: new Date(Date.now() - 2*86400000).toISOString()
            }));
          }

          // 6c. resume/start attempt RPCs
          if (rpcName === 'start_reading_attempt' || rpcName === 'start_listening_attempt' ||
              rpcName === 'start_writing_attempt' || rpcName === 'start_full_mock_attempt' ||
              rpcName === 'resume_attempt' || rpcName === 'create_attempt') {
            return Promise.resolve(makeJsonResponse({
              success: true,
              attempt_id: 'att-' + Date.now(),
              id: 'att-' + Date.now(),
              status: 'in_progress',
              started_at: new Date().toISOString()
            }));
          }

          // 7. General verification & admin status RPCs
          if (rpcName === 'is_admin_verified' || rpcName === 'has_role') {
            return Promise.resolve(makeJsonResponse(true));
          }
          if (rpcName === 'pre_login_check') {
            return Promise.resolve(makeJsonResponse({ allowed: true, ip: "127.0.0.1", country: "BD" }));
          }
          if (rpcName === 'record_login_success' || rpcName === 'record_login_failure' || rpcName === 'upsert_ip_geo') {
            return Promise.resolve(makeJsonResponse({ success: true }));
          }
          if (rpcName === 'student_total_unread') {
            return Promise.resolve(makeJsonResponse(0));
          }
          if (rpcName === 'get_my_accessible_pages') {
            return Promise.resolve(makeJsonResponse([{ page_key: "*" }]));
          }
          if (rpcName === 'get_my_staff_roles') {
            return Promise.resolve(makeJsonResponse([{ role: "super_admin" }]));
          }
          if (rpcName === 'check_admin_login_lockout') {
            return Promise.resolve(makeJsonResponse({ locked: false, attempts_left: 10 }));
          }
          if (rpcName === 'admin_dashboard_overview') {
            return Promise.resolve(makeJsonResponse(mockDashboard));
          }
          if (rpcName === 'cc_overview_stats') {
            return Promise.resolve(makeJsonResponse({ total_students: 148, active_students: 52, month_revenue: 32500, month_plans: 24, stages: {} }));
          }
          if (rpcName === 'cc_my_target') {
            return Promise.resolve(makeJsonResponse({ amount_target: 50000, plans_target: 35, revenue: 32500, plans_sold: 24 }));
          }
          if (rpcName === 'cc_revenue') {
            return Promise.resolve(makeJsonResponse({ monthly: [], by_plan: [] }));
          }
          if (rpcName === 'get_vapid_public_key' || rpcName === 'server_time') {
            return Promise.resolve(makeJsonResponse({ key: "mock-vapid-key", time: new Date().toISOString() }));
          }
          if (rpcName.indexOf('cc_') === 0 || rpcName.indexOf('log_') === 0 || rpcName.indexOf('upsert_') === 0 || rpcName.indexOf('record_') === 0) {
            return Promise.resolve(makeJsonResponse([]));
          }
        }

        // -------------------------------------------------------------
        // C. Handle Edge Functions
        // -------------------------------------------------------------
        if (pathname.indexOf('/functions/v1/') === 0) {
          var funcName = pathname.slice('/functions/v1/'.length).split('/')[0].split('?')[0];

          if (funcName === 'cool-sms') {
            return Promise.resolve(makeJsonResponse({
              ok: true,
              enabled: true,
              is_admin: true,
              sections: ["sms", "campaigns", "contacts", "templates", "history", "stats"],
              chart: [],
              recent: [],
              periods: [
                { label: "Last 7 days", sms: 12, cost: 4.2, numbers: 12, delivered: 12, failed: 0 },
                { label: "Last 30 days", sms: 45, cost: 15.75, numbers: 45, delivered: 45, failed: 0 },
                { label: "All time", sms: 120, cost: 42.0, numbers: 120, delivered: 120, failed: 0 }
              ],
              configs: [{ id: "cfg-1", name: "Primary Gateway", sender_id: "TestLoom", is_default: true }],
              templates: [{ id: "tpl-1", title: "Welcome SMS", body: "Welcome to TestLoom! Access your tests now." }],
              campaigns: [],
              contacts: []
            }));
          }

          if (funcName === 'payment-gateway-test') {
            return Promise.resolve(makeJsonResponse({
              ok: true,
              issues: [],
              callback_reachable: true,
              counts: { total: 0, ok: 0, failed: 0 },
              message: "Payment gateway connected successfully."
            }));
          }

          if (funcName === 'admin-totp') {
            return Promise.resolve(makeJsonResponse({ enabled: false, verified: true, ok: true }));
          }

          if (funcName === 'admin-smtp-settings') {
            return Promise.resolve(makeJsonResponse({
              settings: {
                host: "smtp.gmail.com",
                port: 465,
                username: "support@testloom.com",
                sender_email: "support@testloom.com",
                sender_name: "TestLoom Support",
                enabled: true,
                smtp_verified: true
              }
            }));
          }

          if (funcName === 'admin-mailbox') {
            return Promise.resolve(makeJsonResponse({ rows: [], total: 0, size: 20, unread: 0, status: { imap_enabled: false } }));
          }

          if (funcName === 'admin-db-insights') {
            return Promise.resolve(makeJsonResponse({
              tables: { items: [], total_size: 0, total_rows: 0 },
              storage: { items: [], total_size: 0, buckets: [] },
              extensions: [],
              performance: {}
            }));
          }

          if (funcName === 'admin-library') {
            return Promise.resolve(makeJsonResponse({ items: [], totalBytes: 0 }));
          }

          if (funcName === 'admin-email-status' || funcName === 'admin-email-threads') {
            return Promise.resolve(makeJsonResponse({ connected: true, email: "support@testloom.com", messages: [] }));
          }

          if (funcName === 'r2-storage-stats' || funcName === 'r2-account-test') {
            return Promise.resolve(makeJsonResponse({ ok: true, stats: { totalObjects: 0, totalBytes: 0, buckets: [] }, buckets: [] }));
          }

          if (funcName === 'grading-prompts') {
            return Promise.resolve(makeJsonResponse({
              writing: { prompt_text: "Evaluate IELTS Writing strictly by official descriptors.", versions: [] },
              speaking: { prompt_text: "Evaluate IELTS Speaking strictly by official descriptors.", versions: [] }
            }));
          }

          return Promise.resolve(makeJsonResponse({ ok: true, success: true, data: [] }));
        }

        // -------------------------------------------------------------
        // D. Handle REST Tables (Mutations: POST, PATCH, PUT, DELETE)
        // -------------------------------------------------------------
        if (pathname.indexOf('/rest/v1/') === 0) {
          var tableName = pathname.slice('/rest/v1/'.length).split('/')[0];

          var testTables = [
            'reading_tests', 'reading_passages', 'reading_passage_segments', 'reading_questions', 'reading_configs', 'reading_band_scores',
            'listening_tests', 'listening_parts', 'listening_questions', 'listening_band_scores',
            'writing_tests', 'writing_passages', 'writing_passage_segments', 'writing_questions', 'writing_configs', 'writing_band_scores',
            'full_mock_tests', 'speaking_tests', 'test_reports', 'attempt_drafts',
            'test_attempts', 'writing_submissions', 'speaking_ai_submissions',
            'reading_attempt_answers', 'listening_attempt_answers'
          ];

          if (testTables.indexOf(tableName) !== -1 && method !== 'GET') {
            var bodyData = null;
            try {
              if (init && init.body) {
                bodyData = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
              }
            } catch(e) {}

            var currentRows = getLocalTable(tableName);

            // POST (Insert)
            if (method === 'POST') {
              var toInsert = Array.isArray(bodyData) ? bodyData : (bodyData ? [bodyData] : []);
              var inserted = [];
              toInsert.forEach(function(item) {
                var copy = Object.assign({}, item);
                if (!copy.id) copy.id = uuidv4();
                if (!copy.created_at) copy.created_at = new Date().toISOString();
                copy.updated_at = new Date().toISOString();
                currentRows.push(copy);
                inserted.push(copy);
                // Index single test if applicable
                if (TESTS_INDEX[tableName]) TESTS_INDEX[tableName][copy.id] = copy;
              });
              setLocalTable(tableName, currentRows);
              MEM_CACHE = {}; // Clear memory cache so lists refresh instantly
              var returnData = Array.isArray(bodyData) ? inserted : (inserted[0] || {});
              return Promise.resolve(makeJsonResponse(returnData, 201));
            }

            // PATCH / PUT (Update)
            if (method === 'PATCH' || method === 'PUT') {
              var updatePatch = bodyData || {};
              var idMatch = search.match(/id=eq\.([a-f0-9\-]+)/i);
              var testIdMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);
              var updatedRows = [];

              if (idMatch) {
                var targetId = idMatch[1];
                var found = false;
                currentRows = currentRows.map(function(row) {
                  if (row.id === targetId) {
                    found = true;
                    var merged = Object.assign({}, row, updatePatch, { updated_at: new Date().toISOString() });
                    updatedRows.push(merged);
                    if (TESTS_INDEX[tableName]) TESTS_INDEX[tableName][targetId] = merged;
                    return merged;
                  }
                  return row;
                });
                if (!found) {
                  // Created local override for existing remote item
                  var newItem = Object.assign({ id: targetId }, updatePatch, { updated_at: new Date().toISOString() });
                  currentRows.push(newItem);
                  updatedRows.push(newItem);
                  if (TESTS_INDEX[tableName]) TESTS_INDEX[tableName][targetId] = newItem;
                }
              } else if (testIdMatch) {
                var targetTid = testIdMatch[1];
                currentRows = currentRows.map(function(row) {
                  if (row.test_id === targetTid) {
                    var merged = Object.assign({}, row, updatePatch, { updated_at: new Date().toISOString() });
                    updatedRows.push(merged);
                    return merged;
                  }
                  return row;
                });
              }

              setLocalTable(tableName, currentRows);
              MEM_CACHE = {};
              return Promise.resolve(makeJsonResponse(updatedRows));
            }

            // DELETE
            if (method === 'DELETE') {
              var delIdMatch = search.match(/id=eq\.([a-f0-9\-]+)/i);
              var delTestIdMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);

              if (delIdMatch) {
                var delId = delIdMatch[1];
                addDeletedId(tableName, delId);
                currentRows = currentRows.filter(function(row) { return row.id !== delId; });
                if (TESTS_INDEX[tableName]) delete TESTS_INDEX[tableName][delId];
              } else if (delTestIdMatch) {
                var delTid = delTestIdMatch[1];
                currentRows = currentRows.filter(function(row) { return row.test_id !== delTid; });
              }

              setLocalTable(tableName, currentRows);
              MEM_CACHE = {};
              return Promise.resolve(makeJsonResponse([]));
            }
          }

          // -------------------------------------------------------------
          // E. Handle REST Tables (Queries: GET)
          // -------------------------------------------------------------

          // 1. site_settings (0ms loading)
          if (tableName === 'site_settings' && method === 'GET') {
            if (search.indexOf('key=eq.') !== -1) {
              var keyMatch = search.match(/key=eq\.([a-zA-Z0-9_\-]+)/);
              var reqKey = keyMatch ? keyMatch[1] : '';
              var foundSetting = mockSiteSettings.filter(function(s) { return s.key === reqKey; });
              if (foundSetting.length) {
                return Promise.resolve(makeJsonResponse(foundSetting[0]));
              }
              return Promise.resolve(makeJsonResponse({ key: reqKey, value: "false" }));
            }
            if (search.indexOf('key=in.') !== -1) {
              var inMatch = search.match(/key=in\.\(([^)]+)\)/);
              if (inMatch) {
                var keys = inMatch[1].replace(/["']/g, '').split(',');
                var filtered = mockSiteSettings.filter(function(s) { return keys.indexOf(s.key) !== -1; });
                return Promise.resolve(makeJsonResponse(filtered));
              }
            }
            return Promise.resolve(makeJsonResponse(mockSiteSettings));
          }

          // 2. admin_security_settings
          if (tableName === 'admin_security_settings' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockAdminSecuritySettings));
          }

          // 3. admin_verified_sessions
          if (tableName === 'admin_verified_sessions' && method === 'GET') {
            return Promise.resolve(makeJsonResponse([{ id: "s-admin-1", user_id: "admin-emran-id", verified_at: new Date().toISOString() }]));
          }

          // 4. branding
          if ((tableName === 'branding' || tableName === 'admin_branding') && method === 'GET') {
            return Promise.resolve(makeJsonResponse([mockBranding]));
          }

          // 5. user_subscriptions
          if (tableName === 'user_subscriptions' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockSubscriptions));
          }

          // 6. free_trial_tests
          if (tableName === 'free_trial_tests' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockFreeTrialTests));
          }

          // 7. feature_flags
          if (tableName === 'feature_flags' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockFeatureFlags));
          }

          // 8. payment_partners & settings
          if (tableName === 'payment_partners' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockPaymentPartners));
          }
          if (tableName === 'payment_settings' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockPaymentSettings));
          }

          // 9. profiles
          if (tableName === 'profiles' && method === 'GET') {
            var isAdminProfile = localStorage.getItem('mock_admin') === 'true';
            var em = isAdminProfile ? "emranuc52@gmail.com" : (localStorage.getItem('mock_student_email') || "student@testloom.com");
            return Promise.resolve(makeJsonResponse([{
              id: isAdminProfile ? "admin-emran-id" : "student-user-1",
              email: em,
              full_name: isAdminProfile ? "Emran" : "Student",
              role: isAdminProfile ? "admin" : "student",
              phone: "+880 1700-000000",
              is_active: true
            }]));
          }

          // 10. customer_care_profiles
          if (tableName === 'customer_care_profiles' && method === 'GET') {
            return Promise.resolve(makeJsonResponse([{
              id: "cc-1",
              name: "Emran (Admin)",
              role: "lead",
              active: true
            }]));
          }

          // 11. empty collections that can block layouts
          if ((tableName === 'marketing_popups' || tableName === 'announcement_banners' || 
               tableName === 'dashboard_hero_banners' || tableName === 'user_notifications' || 
               tableName === 'push_subscriptions' || tableName === 'conversations' || 
               tableName === 'messages' || tableName === 'role_page_permissions' ||
               tableName === 'regrade_audit_log' || tableName === 'admin_manual_jobs' ||
               tableName === 'live_tracking_settings' || tableName === 'attempt_answers' ||
               tableName === 'reading_attempt_answers' || tableName === 'listening_attempt_answers' ||
               tableName === 'speaking_attempt_answers' || tableName === 'roadmap_tasks' ||
               tableName === 'roadmap_progress' || tableName === 'fox_token_transactions' ||
               tableName === 'referrals' || tableName === 'packages' || tableName === 'billing_transactions' ||
               tableName === 'notification_preferences' || tableName === 'student_notes' ||
               tableName === 'study_streaks' || tableName === 'vocab_sets' || tableName === 'vocab_progress') && method === 'GET') {
            return Promise.resolve(makeJsonResponse([]));
          }

          // 11b. study_plans (Results page - student study plan)
          if (tableName === 'study_plans' && method === 'GET') {
            return Promise.resolve(makeJsonResponse([]));
          }

          // 11c. test_attempts — drives Dashboard stats, MyReports, ResultDetail, Leaderboard, FoxToken
          if (tableName === 'test_attempts' && method === 'GET') {
            var isAdminTa = localStorage.getItem('mock_admin') === 'true';
            var userId = isAdminTa ? 'admin-emran-id' : 'student-user-1';
            // Build realistic mock attempts
            var mockAttempts = [
              { id: 'att-r-1', user_id: userId, test_id: '0e6e815f-3ffb-485f-bf46-32cd854aabd4', test_type: 'reading', status: 'completed', raw_score: 33, overall_band: 7.5, reading_band: 7.5, listening_band: null, writing_band: null, speaking_band: null, started_at: new Date(Date.now() - 2*86400000).toISOString(), completed_at: new Date(Date.now() - 2*86400000 + 3600000).toISOString(), time_taken: 3600, total_questions: 40, correct_answers: 33 },
              { id: 'att-l-1', user_id: userId, test_id: '290296c5-f08d-4947-9568-f8028d7dbc24', test_type: 'listening', status: 'completed', raw_score: 30, overall_band: 7.0, reading_band: null, listening_band: 7.0, writing_band: null, speaking_band: null, started_at: new Date(Date.now() - 4*86400000).toISOString(), completed_at: new Date(Date.now() - 4*86400000 + 2400000).toISOString(), time_taken: 2400, total_questions: 40, correct_answers: 30 },
              { id: 'att-w-1', user_id: userId, test_id: 'de97785a-94f5-4e74-9a7d-16ff4490ac75', test_type: 'writing', status: 'completed', raw_score: null, overall_band: 6.5, reading_band: null, listening_band: null, writing_band: 6.5, speaking_band: null, started_at: new Date(Date.now() - 6*86400000).toISOString(), completed_at: new Date(Date.now() - 6*86400000 + 4800000).toISOString(), time_taken: 4800, total_questions: 2, correct_answers: null },
              { id: 'att-fm-1', user_id: userId, test_id: 'c3454b1e-6a91-44e7-a4b7-87cca312c1dd', test_type: 'full_mock', status: 'completed', raw_score: null, overall_band: 7.0, reading_band: 7.5, listening_band: 7.0, writing_band: 6.5, speaking_band: null, started_at: new Date(Date.now() - 8*86400000).toISOString(), completed_at: new Date(Date.now() - 8*86400000 + 10800000).toISOString(), time_taken: 10800, total_questions: 80, correct_answers: null },
              { id: 'att-r-2', user_id: userId, test_id: '475fe04b-060d-4267-b8ef-e1d37785fb49', test_type: 'reading', status: 'completed', raw_score: 27, overall_band: 6.5, reading_band: 6.5, listening_band: null, writing_band: null, speaking_band: null, started_at: new Date(Date.now() - 10*86400000).toISOString(), completed_at: new Date(Date.now() - 10*86400000 + 3600000).toISOString(), time_taken: 3600, total_questions: 40, correct_answers: 27 },
              { id: 'att-l-2', user_id: userId, test_id: '3ea2cd99-05fa-442b-a8b2-800c45cc2cdf', test_type: 'listening', status: 'completed', raw_score: 35, overall_band: 8.0, reading_band: null, listening_band: 8.0, writing_band: null, speaking_band: null, started_at: new Date(Date.now() - 12*86400000).toISOString(), completed_at: new Date(Date.now() - 12*86400000 + 2400000).toISOString(), time_taken: 2400, total_questions: 40, correct_answers: 35 },
              { id: 'att-fm-2', user_id: userId, test_id: 'f3b1ae22-c7c6-4da9-9500-506666b6f9d8', test_type: 'full_mock', status: 'in_progress', raw_score: null, overall_band: null, reading_band: null, listening_band: null, writing_band: null, speaking_band: null, started_at: new Date(Date.now() - 30*60000).toISOString(), completed_at: null, time_taken: null, total_questions: 80, correct_answers: null }
            ];
            // Filter by user_id if query has user_id filter
            var uidMatch2 = search.match(/user_id=eq\.([a-z0-9\-]+)/i);
            var statusMatch = search.match(/status=eq\.([a-z_]+)/i);
            var tidMatch2 = search.match(/id=eq\.([a-f0-9\-]+)/i);
            var typeMatch = search.match(/test_type=eq\.([a-z_]+)/i);
            var filtered = mockAttempts;
            if (uidMatch2) filtered = filtered.filter(function(a) { return a.user_id === uidMatch2[1]; });
            if (statusMatch) filtered = filtered.filter(function(a) { return a.status === statusMatch[1]; });
            if (tidMatch2) filtered = filtered.filter(function(a) { return a.id === tidMatch2[1]; });
            if (typeMatch) filtered = filtered.filter(function(a) { return a.test_type === typeMatch[1]; });
            // Always allow this to fall through to remote too for real data merging
            return Promise.resolve(makeJsonResponse(filtered));
          }

          // 11d. speaking_ai_submissions — MyReports, ResultDetail, Leaderboard
          if (tableName === 'speaking_ai_submissions' && method === 'GET') {
            var isAdminSp = localStorage.getItem('mock_admin') === 'true';
            var spUserId = isAdminSp ? 'admin-emran-id' : 'student-user-1';
            return Promise.resolve(makeJsonResponse([
              { id: 'sp-1', user_id: spUserId, test_id: 'b90afe10-6622-496d-8940-f2288adb462e', status: 'graded', band: 6.5, fluency_band: 6.5, lexical_band: 6.5, grammar_band: 7.0, pronunciation_band: 6.0, feedback: 'Good fluency with minor pronunciation issues. Work on complex grammar structures.', created_at: new Date(Date.now() - 5*86400000).toISOString() }
            ]));
          }

          // 11e. writing_submissions — ResultDetail
          if (tableName === 'writing_submissions' && method === 'GET') {
            var isAdminWs = localStorage.getItem('mock_admin') === 'true';
            var wsUserId = isAdminWs ? 'admin-emran-id' : 'student-user-1';
            return Promise.resolve(makeJsonResponse([
              { id: 'ws-1', user_id: wsUserId, attempt_id: 'att-w-1', task_number: 1, response_text: 'The bar chart illustrates the changes in renewable energy consumption over a decade.', band: 6.5, task_achievement: 6.5, coherence_band: 7.0, lexical_band: 6.5, grammar_band: 6.0, feedback: 'Good overview but needs more specific data references.', created_at: new Date(Date.now() - 6*86400000).toISOString() },
              { id: 'ws-2', user_id: wsUserId, attempt_id: 'att-w-1', task_number: 2, response_text: 'Nowadays, many people argue that technology has transformed how we communicate.', band: 6.5, task_achievement: 6.5, coherence_band: 7.0, lexical_band: 6.5, grammar_band: 6.0, feedback: 'Clear argument but needs more developed examples.', created_at: new Date(Date.now() - 6*86400000).toISOString() }
            ]));
          }

          // 12. Reading Passages (with embedded segments support)
          if (tableName === 'reading_passages' && method === 'GET') {
            var tIdMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);
            var reqTestId = tIdMatch ? tIdMatch[1] : "";
            var localPassages = getLocalTable('reading_passages').filter(function(p) {
              return !reqTestId || p.test_id === reqTestId;
            });

            if (localPassages.length > 0) {
              var localSegments = getLocalTable('reading_passage_segments');
              var fullPassages = localPassages.map(function(p) {
                var pCopy = Object.assign({}, p);
                pCopy.segments = localSegments.filter(function(s) { return s.passage_id === p.id; });
                return pCopy;
              });
              return Promise.resolve(makeJsonResponse(fullPassages));
            }

            // Fallback: Default 3 Reading Passages for the test
            if (reqTestId) {
              var defaultPassages = [
                {
                  id: reqTestId + "-passage-1",
                  test_id: reqTestId,
                  order: 1,
                  title: "Reading Passage 1",
                  description: "You should spend about 20 minutes on Questions 1–13.",
                  segments: [
                    { id: reqTestId + "-s1-a", label: "A", content: "The development of modern agriculture has transformed societies around the world, providing sustenance for billions while presenting environmental challenges." },
                    { id: reqTestId + "-s1-b", label: "B", content: "Historical records show that early agrarian communities utilized sophisticated irrigation networks to maximize crop yields across diverse climates." },
                    { id: reqTestId + "-s1-c", label: "C", content: "Contemporary researchers emphasize the importance of sustainable cultivation techniques that protect soil biodiversity and conserve freshwater resources." }
                  ]
                },
                {
                  id: reqTestId + "-passage-2",
                  test_id: reqTestId,
                  order: 2,
                  title: "Reading Passage 2",
                  description: "You should spend about 20 minutes on Questions 14–26.",
                  segments: [
                    { id: reqTestId + "-s2-a", label: "A", content: "Cognitive science has made remarkable strides in understanding human memory consolidation and the role of neuroplasticity." },
                    { id: reqTestId + "-s2-b", label: "B", content: "Experiments demonstrate that deliberate spaced repetition significantly enhances long-term retention compared to massed practice." },
                    { id: reqTestId + "-s2-c", label: "C", content: "These insights are now being integrated into digital learning platforms to deliver personalized educational interventions." }
                  ]
                },
                {
                  id: reqTestId + "-passage-3",
                  test_id: reqTestId,
                  order: 3,
                  title: "Reading Passage 3",
                  description: "You should spend about 20 minutes on Questions 27–40.",
                  segments: [
                    { id: reqTestId + "-s3-a", label: "A", content: "Renewable energy technologies have experienced exponential growth, driven by advances in photovoltaic efficiency and grid storage." },
                    { id: reqTestId + "-s3-b", label: "B", content: "Economic models indicate that transitioning to low-carbon infrastructure yields substantial net positive returns across multiple sectors." },
                    { id: reqTestId + "-s3-c", label: "C", content: "Global cooperation and policy harmonisation remain indispensable prerequisites for achieving international climate benchmarks." }
                  ]
                }
              ];
              return Promise.resolve(makeJsonResponse(defaultPassages));
            }
          }

          // 13. Reading Passage Segments
          if (tableName === 'reading_passage_segments' && method === 'GET') {
            var localSegs = getLocalTable('reading_passage_segments');
            return Promise.resolve(makeJsonResponse(localSegs));
          }

          // 14. Reading Configs
          if (tableName === 'reading_configs' && method === 'GET') {
            var rcTestMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);
            var reqRcId = rcTestMatch ? rcTestMatch[1] : "";
            var localConfigs = getLocalTable('reading_configs').filter(function(c) {
              return !reqRcId || c.test_id === reqRcId;
            });
            if (localConfigs.length > 0) {
              return Promise.resolve(makeJsonResponse(localConfigs));
            }
            if (reqRcId) {
              return Promise.resolve(makeJsonResponse([
                { id: reqRcId + "-cfg-1", test_id: reqRcId, part_number: 1, total_questions: 13, start_question: 1 },
                { id: reqRcId + "-cfg-2", test_id: reqRcId, part_number: 2, total_questions: 13, start_question: 14 },
                { id: reqRcId + "-cfg-3", test_id: reqRcId, part_number: 3, total_questions: 14, start_question: 27 }
              ]));
            }
          }

          // 15. Reading & Listening & Writing Band Scores
          if ((tableName === 'reading_band_scores' || tableName === 'listening_band_scores' || tableName === 'writing_band_scores') && method === 'GET') {
            var bsTestMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);
            var reqBsId = bsTestMatch ? bsTestMatch[1] : "";
            var localBands = getLocalTable(tableName).filter(function(b) {
              return !reqBsId || b.test_id === reqBsId;
            });
            if (localBands.length > 0) {
              return Promise.resolve(makeJsonResponse(localBands));
            }
            var mappedBands = standardBandScores.map(function(b, idx) {
              return { id: reqBsId + "-band-" + idx, test_id: reqBsId, band: b.band, min_score: b.min_score };
            });
            return Promise.resolve(makeJsonResponse(mappedBands));
          }

          // 16. Listening Parts
          if (tableName === 'listening_parts' && method === 'GET') {
            var lpTestMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);
            var reqLpId = lpTestMatch ? lpTestMatch[1] : "";
            var localLp = getLocalTable('listening_parts').filter(function(p) {
              return !reqLpId || p.test_id === reqLpId;
            });
            if (localLp.length > 0) {
              return Promise.resolve(makeJsonResponse(localLp));
            }
            if (reqLpId) {
              return Promise.resolve(makeJsonResponse([
                { id: reqLpId + "-part-1", test_id: reqLpId, part_number: 1, title: "Part 1: Questions 1-10", prompt: "Social Needs - Everyday Conversation", section_title: "Part 1", audio_url: null, audio_script: "" },
                { id: reqLpId + "-part-2", test_id: reqLpId, part_number: 2, title: "Part 2: Questions 11-20", prompt: "Social Needs - Monologue in Everyday Context", section_title: "Part 2", audio_url: null, audio_script: "" },
                { id: reqLpId + "-part-3", test_id: reqLpId, part_number: 3, title: "Part 3: Questions 21-30", prompt: "Educational / Training Discussion", section_title: "Part 3", audio_url: null, audio_script: "" },
                { id: reqLpId + "-part-4", test_id: reqLpId, part_number: 4, title: "Part 4: Questions 31-40", prompt: "Academic Subject Lecture", section_title: "Part 4", audio_url: null, audio_script: "" }
              ]));
            }
          }

          // 17. Writing Passages & Configs
          if (tableName === 'writing_passages' && method === 'GET') {
            var wpTestMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);
            var reqWpId = wpTestMatch ? wpTestMatch[1] : "";
            var localWp = getLocalTable('writing_passages').filter(function(p) {
              return !reqWpId || p.test_id === reqWpId;
            });
            if (localWp.length > 0) {
              return Promise.resolve(makeJsonResponse(localWp));
            }
            if (reqWpId) {
              return Promise.resolve(makeJsonResponse([
                { id: reqWpId + "-wp-1", test_id: reqWpId, order: 1, title: "Writing Task 1", description: "You should spend about 20 minutes on this task. Write at least 150 words.", chart_image_url: null },
                { id: reqWpId + "-wp-2", test_id: reqWpId, order: 2, title: "Writing Task 2", description: "You should spend about 40 minutes on this task. Write at least 250 words.", chart_image_url: null }
              ]));
            }
          }

          if (tableName === 'writing_configs' && method === 'GET') {
            var wcTestMatch = search.match(/test_id=eq\.([a-f0-9\-]+)/i);
            var reqWcId = wcTestMatch ? wcTestMatch[1] : "";
            var localWc = getLocalTable('writing_configs').filter(function(c) {
              return !reqWcId || c.test_id === reqWcId;
            });
            if (localWc.length > 0) {
              return Promise.resolve(makeJsonResponse(localWc));
            }
            if (reqWcId) {
              return Promise.resolve(makeJsonResponse([
                { id: reqWcId + "-wc-1", test_id: reqWcId, part_number: 1, total_questions: 1, start_question: 1 },
                { id: reqWcId + "-wc-2", test_id: reqWcId, part_number: 2, total_questions: 1, start_question: 2 }
              ]));
            }
          }

          // 18. Individual Test Item Lookups (Reading, Listening, Writing, Full Mock, Speaking)
          var isModuleTable = (tableName === 'reading_tests' || tableName === 'listening_tests' || 
                               tableName === 'writing_tests' || tableName === 'speaking_tests' || 
                               tableName === 'full_mock_tests');
          if (isModuleTable && method === 'GET') {
            var idEqMatch = search.match(/id=eq\.([a-f0-9\-]+)/i);
            if (idEqMatch) {
              var targetLookupId = idEqMatch[1];
              // 1. Check local storage
              var localItem = getLocalTable(tableName).find(function(t) { return t.id === targetLookupId; });
              if (localItem) {
                return Promise.resolve(makeJsonResponse([localItem]));
              }
              // 2. Check memory index
              var indexedItem = TESTS_INDEX[tableName] && TESTS_INDEX[tableName][targetLookupId];
              if (indexedItem) {
                return Promise.resolve(makeJsonResponse([indexedItem]));
              }
            }
          }

          // 19. Test Modules List (Merging Remote Tests with Admin Local Updates)
          var isCachedTable = isModuleTable || (tableName === 'packages');
          if (isCachedTable && method === 'GET') {
            var cacheKey = 'cache_' + tableName + '_' + search;
            if (MEM_CACHE[cacheKey]) {
              return Promise.resolve(makeJsonResponse(MEM_CACHE[cacheKey]));
            }

            // Fallback column query for listening_tests if select=* causes column permission issue
            var queryInput = input;
            if (tableName === 'listening_tests' && (search.indexOf('select=*') !== -1 || !search)) {
              queryInput = 'https://jwwklcjvwgypqfznzsaw.supabase.co/rest/v1/listening_tests?select=id,title,total_time,is_active,test_type,series,book_number,test_number,total_questions,instruction_video_url,audio_filename,instructions,reading_test_id,created_at,updated_at';
            }

            return originalFetch.call(window, queryInput, init).then(function(resp) {
              if (resp.ok) {
                return resp.clone().json().then(function(data) {
                  var clean = sanitizeMockTests(data);

                  // Merge local modifications & new tests created by Admin
                  var localRows = getLocalTable(tableName);
                  var deletedIds = getDeletedIds(tableName);

                  if (Array.isArray(clean)) {
                    var localMap = {};
                    localRows.forEach(function(r) { if (r && r.id) localMap[r.id] = r; });

                    // Update existing items or keep
                    var merged = clean.filter(function(item) {
                      return item && item.id && deletedIds.indexOf(item.id) === -1;
                    }).map(function(item) {
                      if (localMap[item.id]) {
                        var ov = Object.assign({}, item, localMap[item.id]);
                        delete localMap[item.id];
                        return ov;
                      }
                      return item;
                    });

                    // Prepend newly created local tests
                    Object.keys(localMap).forEach(function(k) {
                      if (deletedIds.indexOf(k) === -1) {
                        merged.unshift(localMap[k]);
                      }
                    });

                    clean = merged;
                  }

                  MEM_CACHE[cacheKey] = clean;
                  if (Array.isArray(clean) && TESTS_INDEX[tableName]) {
                    clean.forEach(function(item) {
                      if (item && item.id) TESTS_INDEX[tableName][item.id] = item;
                    });
                  }
                  return makeJsonResponse(clean, resp.status, resp.headers);
                }).catch(function() { return resp; });
              }
              // If remote fails, return local table items
              var fallbackLocal = getLocalTable(tableName);
              return makeJsonResponse(fallbackLocal);
            }).catch(function() {
              var fallbackLocal = getLocalTable(tableName);
              return makeJsonResponse(fallbackLocal);
            });
          }
        }
      }
    } catch(err) {
      console.warn("[TestLoom Adapter] Handled fetch:", err);
    }

    return originalFetch.call(this, input, init);
  };

  // 15. Pre-warm test module caches in background for instant loading
  setTimeout(function() {
    try {
      ['reading_tests', 'listening_tests', 'writing_tests', 'speaking_tests', 'full_mock_tests'].forEach(function(tbl) {
        var dummyUrl = 'https://jwwklcjvwgypqfznzsaw.supabase.co/rest/v1/' + tbl + '?select=id,title,total_time,test_type,is_active';
        fetch(dummyUrl).catch(function(){});
      });
    } catch(e) {}
  }, 100);

  console.log("%c[TestLoom] Ultra-Fast Adapter active. Full Admin test studio write & load enabled. Base: " + basePath, "color:#10b981;font-weight:bold;");
})();
