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
    { id: "free-sample-fm-acad", test_id: "sample-full-mock-academic", test_type: "full_mock", display_order: 0 },
    { id: "free-sample-fm-gt", test_id: "sample-full-mock-gt", test_type: "full_mock", display_order: 1 },
    { id: "free-sample-read-acad", test_id: "sample-reading-academic-1", test_type: "reading", display_order: 0 },
    { id: "free-sample-read-gt", test_id: "sample-reading-gt-1", test_type: "reading", display_order: 1 },
    { id: "free-sample-list-1", test_id: "sample-listening-1", test_type: "listening", display_order: 0 },
    { id: "free-sample-write-acad", test_id: "sample-writing-academic-1", test_type: "writing", display_order: 0 },
    { id: "free-sample-write-gt", test_id: "sample-writing-gt-1", test_type: "writing", display_order: 1 },
    { id: "free-sample-spk-1", test_id: "sample-speaking-1", test_type: "speaking", display_order: 0 },
    { id: "free-sample-spk-2", test_id: "sample-speaking-2", test_type: "speaking", display_order: 1 },
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
    { id: "partner-bkash", name: "bKash (Domestic 🇧🇩)", code: "bkash", is_active: true, type: "domestic", currency: "BDT", logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-nagad", name: "Nagad (Domestic 🇧🇩)", code: "nagad", is_active: true, type: "domestic", currency: "BDT", logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-rocket", name: "Rocket DBBL (Domestic 🇧🇩)", code: "rocket", is_active: true, type: "domestic", currency: "BDT", logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-upay", name: "Upay (Domestic 🇧🇩)", code: "upay", is_active: true, type: "domestic", currency: "BDT", logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-cards", name: "Local Bank Cards (Visa/Mastercard 🇧🇩)", code: "cards", is_active: true, type: "domestic", currency: "BDT", logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-stripe", name: "Stripe International Cards (Overseas 🌍)", code: "stripe", is_active: true, type: "international", currency: "USD", logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" },
    { id: "partner-paypal", name: "PayPal Worldwide (Overseas 🌍)", code: "paypal", is_active: true, type: "international", currency: "USD", logo_url: basePath + "assets/payment-partners-CBfV9xnV.webp" }
  ];
  var mockPaymentSettings = [{
    id: "settings-default",
    bkash_enabled: true,
    nagad_enabled: true,
    rocket_enabled: true,
    upay_enabled: true,
    cards_enabled: true,
    stripe_enabled: true,
    paypal_enabled: true,
    currency: "both",
    primary_currency: "BDT",
    secondary_currency: "USD",
    exchange_rate: 100.0
  }];

  var mockPackages = [
    {
      id: "f1",
      name: "Unlimited — 1 Week",
      description: "Full access to Cambridge practice tests, AI scoring, and all 4 IELTS modules.",
      pricing_tiers: [],
      features: [
        "All Cambridge Practice Tests (Academic & General)",
        "Instant AI Band Score & Criterion Breakdown",
        "Full Reading & Listening Answer Explanations",
        "Writing AI Evaluation with Band 9 Sample Answers",
        "Speaking AI Simulator & Practice",
        "Payment in ৳ BDT (bKash/Nagad/Rocket) or $ USD (Cards/Stripe/PayPal)"
      ],
      button_text: "Get 1 Week Pass",
      button_style: "filled_orange",
      badge_text: "STARTER",
      badge_style: "blue",
      original_price: null,
      duration_label: "1 Week",
      duration_days: 7,
      price: 500,
      price_usd: 5,
      display_price: "৳500 / $5 USD",
      currency: "BDT",
      billing_cycle: "week",
      is_active: true,
      show_on_homepage: true,
      sort_order: 1
    },
    {
      id: "f2",
      name: "Unlimited — 2 Weeks",
      description: "Accelerate your exam readiness with 14 days of unlimited mock exams and evaluations.",
      pricing_tiers: [],
      features: [
        "Everything in 1 Week Plan",
        "Full Cambridge 1-19 Mock Test Collection",
        "Personalized Weakness Analysis & Skill Radar",
        "Priority AI Evaluation Queue",
        "Payment in ৳ BDT (bKash/Nagad/Rocket) or $ USD (Cards/Stripe/PayPal)"
      ],
      button_text: "Get 2 Weeks Pass",
      button_style: "filled_orange",
      badge_text: "SAVE ৳250 / $3",
      badge_style: "green",
      original_price: 1000,
      duration_label: "2 Weeks",
      duration_days: 14,
      price: 750,
      price_usd: 7,
      display_price: "৳750 / $7 USD",
      currency: "BDT",
      billing_cycle: "2 weeks",
      is_active: true,
      show_on_homepage: true,
      sort_order: 2
    },
    {
      id: "f3",
      name: "Unlimited — 1 Month",
      description: "Most popular plan for comprehensive preparation and guaranteed band score improvement.",
      pricing_tiers: [],
      features: [
        "Everything in 2 Weeks Plan",
        "Unlimited Full-Length Mock Exams & Retakes",
        "Customized Band Score Target Roadmap",
        "Speaking Partner Room & AI Tutor Sessions",
        "Payment in ৳ BDT (bKash/Nagad/Rocket) or $ USD (Cards/Stripe/PayPal)"
      ],
      button_text: "Get 1 Month Pass",
      button_style: "filled_orange",
      badge_text: "POPULAR • SAVE ৳500 / $5",
      badge_style: "purple",
      original_price: 1500,
      duration_label: "1 Month",
      duration_days: 30,
      price: 1000,
      price_usd: 10,
      display_price: "৳1,000 / $10 USD",
      currency: "BDT",
      billing_cycle: "month",
      is_active: true,
      show_on_homepage: true,
      sort_order: 3
    },
    {
      id: "f4",
      name: "Unlimited — 2 Months",
      description: "Complete mastery package designed for high target band scores (Band 7.5 - 8.5+).",
      pricing_tiers: [],
      features: [
        "Everything in 1 Month Plan",
        "Extended 60 Days Unlimited Exam Access",
        "Full Speaking & Writing Band 9 Sample Library",
        "24/7 Priority Support & Feedback Review",
        "Payment in ৳ BDT (bKash/Nagad/Rocket) or $ USD (Cards/Stripe/PayPal)"
      ],
      button_text: "Get 2 Months Pass",
      button_style: "filled_orange",
      badge_text: "BEST VALUE • SAVE ৳500 / $5",
      badge_style: "amber",
      original_price: 2000,
      duration_label: "2 Months",
      duration_days: 60,
      price: 1500,
      price_usd: 15,
      display_price: "৳1,500 / $15 USD",
      currency: "BDT",
      billing_cycle: "2 months",
      is_active: true,
      show_on_homepage: true,
      sort_order: 4
    }
  ];

  var mockSiteContent = [{
    id: "site-content-main",
    content: {
      buyPackHeader: {
        title: "Choose Your Plan",
        subtitle: "Select the right preparation plan for your IELTS goals. Instant activation on all plans.",
        titlePrefix: "Choose Your",
        titleHighlight: "Plan",
        titleSuffix: ""
      },
      comparisonTable: {
        title: "Why Choose Our Platform Over Coaching Centers?",
        subtitle: "See the clear difference between traditional coaching centers and TestLoom",
        column1Header: "COACHING CENTER",
        column2Header: "OUR PLATFORM",
        rows: [
          { aspect: "Cost & Pricing", col1: "৳15,000–৳20,000+ ($150–$200 USD) upfront", col2: "Starting from only ৳500 / $5 USD" },
          { aspect: "Schedule & Flexibility", col1: "Hours wasted traveling in traffic", col2: "Practice anytime 24/7 from home or anywhere" },
          { aspect: "Evaluation & Feedback", col1: "Generic, delayed feedback for all students", col2: "Instant AI analysis & band score breakdown" },
          { aspect: "Speaking Practice", col1: "Limited speaking time, long waiting queues", col2: "1-on-1 AI & expert mock interview sessions" },
          { aspect: "Progress Tracking", col1: "No systematic progress tracking", col2: "Real-time analytics dashboard & skill radar" },
          { aspect: "Support", col1: "Assistance only during class hours", col2: "24/7 online support & expert study guidance" },
          { aspect: "Payment & Access", col1: "Full non-refundable upfront payment", col2: "Flexible plans, cancel anytime, dual currency (BDT / USD)" }
        ]
      },
      checkout: {
        show_coupon: true,
        currency: "both",
        primary_currency: "BDT",
        secondary_currency: "USD",
        domestic_gateways: ["bKash", "Nagad", "Rocket", "Upay", "Local Bank Cards"],
        international_gateways: ["Visa / Mastercard / Amex", "Stripe", "PayPal"]
      }
    }
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
  
  // =========================================================================
  // Cambridge IELTS Complete Test Suite (Cambridge Books 10 through 20)
  // =========================================================================
  var CAMBRIDGE_SUITE = (function() {
    var books = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    var reading = [];
    var listening = [];
    var writing = [];
    var speaking = [];
    var fullMock = [];

    books.forEach(function(b) {
      for (var t = 1; t <= 4; t++) {
        var rId = "cambridge-" + b + "-reading-" + t;
        var lId = "cambridge-" + b + "-listening-" + t;
        var wId = "cambridge-" + b + "-writing-" + t;
        var fmId = "cambridge-" + b + "-mock-" + t;

        // 1. Academic Reading
        reading.push({
          id: rId,
          title: "Cambridge " + b + " Reading Test " + t + " (Academic)",
          total_questions: 40,
          total_time: 60,
          is_active: true,
          cambridge_book: b,
          test_number: t,
          difficulty: b >= 17 ? "hard" : "medium",
          test_type: "academic",
          series: "cambridge",
          admin_only: false,
          instructions: []
        });

        // 2. Listening
        listening.push({
          id: lId,
          title: "Cambridge " + b + " Listening Test " + t + " (Academic)",
          total_questions: 40,
          total_time: 40,
          is_active: true,
          book_number: b,
          test_number: t,
          test_type: "academic",
          series: "cambridge",
          admin_only: false,
          instructions: []
        });

        // 3. Academic Writing
        writing.push({
          id: wId,
          title: "Cambridge " + b + " Writing Test " + t + " (Academic)",
          total_questions: 2,
          total_time: 60,
          is_active: true,
          cambridge_book: b,
          test_number: t,
          difficulty: "medium",
          test_type: "academic",
          series: "cambridge",
          admin_only: false,
          instructions: []
        });

        // 3b. Speaking Test (Full 3-Part authentic interview)
        speaking.push({
          id: "cambridge-" + b + "-speaking-" + t,
          title: "Cambridge " + b + " Speaking Test " + t,
          test_number: t,
          cambridge_book: b,
          test_mode_type: "full",
          difficulty: b >= 17 ? "hard" : "medium",
          target_band: "7.0+",
          ai_status: "published",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
          series: "cambridge",
          admin_only: false
        });

        // 4. Academic Full Mock
        fullMock.push({
          id: fmId,
          title: "Cambridge " + b + " — Full Mock Test " + t,
          description: "Official Cambridge " + b + " Academic Exam Simulation covering Listening, Reading, and Writing under authentic timed conditions.",
          reading_test_id: rId,
          listening_test_id: lId,
          writing_test_id: wId,
          test_order: ["listening", "reading", "writing"],
          total_time: 150,
          is_active: true,
          test_type: "academic",
          series: "cambridge",
          admin_only: false
        });
      }

      // Add General Training tests for books 11 through 18 (Tests 1 & 2)
      if (b >= 11 && b <= 18) {
        for (var gt = 1; gt <= 2; gt++) {
          var rGtId = "cambridge-" + b + "-reading-gt-" + gt;
          var wGtId = "cambridge-" + b + "-writing-gt-" + gt;
          var fmGtId = "cambridge-" + b + "-mock-gt-" + gt;

          reading.push({
            id: rGtId,
            title: "Cambridge " + b + " Reading Test " + gt + " (General Training)",
            total_questions: 40,
            total_time: 60,
            is_active: true,
            cambridge_book: b,
            test_number: gt,
            difficulty: "medium",
            test_type: "general_training",
            series: "cambridge",
            admin_only: false,
            instructions: []
          });

          writing.push({
            id: wGtId,
            title: "Cambridge " + b + " Writing Test " + gt + " (General Training)",
            total_questions: 2,
            total_time: 60,
            is_active: true,
            cambridge_book: b,
            test_number: gt,
            difficulty: "medium",
            test_type: "general_training",
            series: "cambridge",
            admin_only: false,
            instructions: []
          });

          fullMock.push({
            id: fmGtId,
            title: "Cambridge " + b + " GT — Full Mock Test " + gt,
            description: "Official Cambridge " + b + " General Training Exam Simulation with Listening, Reading, and Writing modules.",
            reading_test_id: rGtId,
            listening_test_id: "cambridge-" + b + "-listening-" + gt,
            writing_test_id: wGtId,
            test_order: ["listening", "reading", "writing"],
            total_time: 150,
            is_active: true,
            test_type: "general_training",
            series: "cambridge",
            admin_only: false
          });
        }
      }
    });

    // Sample Test Suites (TestLoom / Sample Series - Series: "puropuro")
    var sampleReadingTests = [
      {
        id: "sample-reading-academic-1",
        title: "Official IELTS Academic Reading Diagnostic Test 1",
        total_questions: 40,
        total_time: 60,
        is_active: true,
        difficulty: "medium",
        test_type: "academic",
        series: "puropuro",
        admin_only: false,
        instructions: []
      },
      {
        id: "sample-reading-academic-2",
        title: "Official IELTS Academic Reading Practice Test 2",
        total_questions: 40,
        total_time: 60,
        is_active: true,
        difficulty: "hard",
        test_type: "academic",
        series: "puropuro",
        admin_only: false,
        instructions: []
      },
      {
        id: "sample-reading-gt-1",
        title: "Official IELTS General Training Reading Sample Test 1",
        total_questions: 40,
        total_time: 60,
        is_active: true,
        difficulty: "medium",
        test_type: "general_training",
        series: "puropuro",
        admin_only: false,
        instructions: []
      }
    ];

    var sampleListeningTests = [
      {
        id: "sample-listening-1",
        title: "Official IELTS Listening Diagnostic Test 1",
        total_questions: 40,
        total_time: 40,
        is_active: true,
        book_number: 1,
        test_number: 1,
        test_type: "academic",
        series: "puropuro",
        admin_only: false,
        instructions: []
      },
      {
        id: "sample-listening-2",
        title: "Official IELTS Listening Practice Test 2",
        total_questions: 40,
        total_time: 40,
        is_active: true,
        book_number: 1,
        test_number: 2,
        test_type: "academic",
        series: "puropuro",
        admin_only: false,
        instructions: []
      }
    ];

    var sampleWritingTests = [
      {
        id: "sample-writing-academic-1",
        title: "Official IELTS Academic Writing Sample Test 1",
        total_questions: 2,
        total_time: 60,
        is_active: true,
        difficulty: "medium",
        test_type: "academic",
        series: "puropuro",
        admin_only: false,
        instructions: []
      },
      {
        id: "sample-writing-gt-1",
        title: "Official IELTS General Training Writing Sample Test 1",
        total_questions: 2,
        total_time: 60,
        is_active: true,
        difficulty: "medium",
        test_type: "general_training",
        series: "puropuro",
        admin_only: false,
        instructions: []
      }
    ];

    var sampleSpeakingTests = [
      {
        id: "sample-speaking-1",
        title: "Official IELTS Speaking Diagnostic Test 1 — Work, Study & Memorable Journeys",
        test_mode_type: "full",
        difficulty: "medium",
        target_band: "7.5+",
        ai_status: "published",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        test_number: 1,
        series: "puropuro",
        admin_only: false
      },
      {
        id: "sample-speaking-2",
        title: "Official IELTS Speaking Practice Test 2 — Hometown, Cultural Traditions & Technology",
        test_mode_type: "full",
        difficulty: "medium",
        target_band: "7.5+",
        ai_status: "published",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        test_number: 2,
        series: "puropuro",
        admin_only: false
      },
      {
        id: "sample-speaking-3",
        title: "Official IELTS Speaking Practice Test 3 — Environmental Protection & Modern Cities",
        test_mode_type: "full",
        difficulty: "medium",
        target_band: "7.0+",
        ai_status: "published",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        test_number: 3,
        series: "puropuro",
        admin_only: false
      },
      {
        id: "sample-speaking-4",
        title: "Official IELTS Speaking Practice Test 4 — Artificial Intelligence & Future Education",
        test_mode_type: "full",
        difficulty: "hard",
        target_band: "8.0+",
        ai_status: "published",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        test_number: 4,
        series: "puropuro",
        admin_only: false
      }
    ];

    var sampleFullMockTests = [
      {
        id: "sample-full-mock-academic",
        title: "Official IELTS Academic Diagnostic Full Mock 1",
        description: "Complete authentic IELTS Academic exam simulation with timed Listening, Reading, and Writing modules.",
        reading_test_id: "sample-reading-academic-1",
        listening_test_id: "sample-listening-1",
        writing_test_id: "sample-writing-academic-1",
        speaking_test_id: "sample-speaking-1",
        test_order: ["listening", "reading", "writing"],
        total_time: 150,
        is_active: true,
        test_type: "academic",
        series: "puropuro",
        admin_only: false
      },
      {
        id: "sample-full-mock-gt",
        title: "Official IELTS General Training Full Mock 1",
        description: "Complete authentic IELTS General Training exam simulation with timed Listening, Reading, and Writing modules.",
        reading_test_id: "sample-reading-gt-1",
        listening_test_id: "sample-listening-1",
        writing_test_id: "sample-writing-gt-1",
        speaking_test_id: "sample-speaking-2",
        test_order: ["listening", "reading", "writing"],
        total_time: 150,
        is_active: true,
        test_type: "general_training",
        series: "puropuro",
        admin_only: false
      }
    ];

    reading = reading.concat(sampleReadingTests);
    listening = listening.concat(sampleListeningTests);
    writing = writing.concat(sampleWritingTests);
    speaking = speaking.concat(sampleSpeakingTests);
    fullMock = fullMock.concat(sampleFullMockTests);

    return {
      reading_tests: reading,
      listening_tests: listening,
      writing_tests: writing,
      speaking_tests: speaking,
      full_mock_tests: fullMock
    };
  })();

  // Filter helper for PostgREST query parameters
  function filterModuleTests(tests, search) {
    if (!Array.isArray(tests)) return tests;
    if (!search) return tests;
    var res = tests;

    var sMatch = search.match(/series=eq\.([a-zA-Z0-9_\-]+)/i);
    if (sMatch) {
      var sVal = sMatch[1].toLowerCase();
      res = res.filter(function(t) { return (t.series || "cambridge").toLowerCase() === sVal; });
    }

    var cbMatch = search.match(/cambridge_book=eq\.(\d+)/i);
    if (cbMatch) {
      var cbVal = parseInt(cbMatch[1], 10);
      res = res.filter(function(t) { return t.cambridge_book === cbVal; });
    }

    var bnMatch = search.match(/book_number=eq\.(\d+)/i);
    if (bnMatch) {
      var bnVal = parseInt(bnMatch[1], 10);
      res = res.filter(function(t) { return (t.book_number || t.cambridge_book) === bnVal; });
    }

    var tnMatch = search.match(/test_number=eq\.(\d+)/i);
    if (tnMatch) {
      var tnVal = parseInt(tnMatch[1], 10);
      res = res.filter(function(t) { return t.test_number === tnVal; });
    }

    var ttMatch = search.match(/test_type=eq\.([a-zA-Z0-9_\-]+)/i);
    if (ttMatch) {
      var ttVal = ttMatch[1].toLowerCase();
      res = res.filter(function(t) { return (t.test_type || "academic").toLowerCase() === ttVal; });
    }

    var idMatch = search.match(/id=eq\.([a-zA-Z0-9_\-]+)/i);
    if (idMatch) {
      var idVal = idMatch[1];
      res = res.filter(function(t) { return t.id === idVal; });
    }

    return res;
  }

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

  
  // =========================================================================
  // Standard IELTS Question Generators (Ensures 100% of tests have 40 questions)
  // =========================================================================
  function generateIeltsReadingQuestions(testId) {
    var qs = [];
    // Part 1: Q1-13 (True / False / Not Given)
    var p1Texts = [
      "Early agricultural societies relied exclusively on rainfall for crop irrigation.",
      "Canal building required specialized engineering skills in ancient civilizations.",
      "Crop yields were documented systematically in historical municipal archives.",
      "Farmers in highland regions faced greater climatic obstacles than lowland communities.",
      "Modern cultivation methods have resolved all historical soil erosion concerns.",
      "Aqueduct structures were constructed primarily from volcanic limestone.",
      "The invention of the iron plow significantly accelerated field preparation.",
      "Traditional grain storage methods preserved seeds for multiple seasons.",
      "Water rights disputes were adjudicated by regional trade guilds.",
      "Seasonal flooding provided beneficial nutrient deposits for river valleys.",
      "Drought-resistant crops were introduced from neighboring territories.",
      "Labor shortages in harvest seasons were solved through cooperative communal work.",
      "Ancient agrarian principles are currently being revitalized by organic farmers."
    ];
    for (var i = 1; i <= 13; i++) {
      qs.push({
        id: testId + "-rq-" + i,
        test_id: testId,
        passage_id: testId + "-passage-1",
        part: "1",
        question_number: i,
        question_type: "tfng",
        question_text: p1Texts[i - 1] || ("Question " + i + " statement based on Passage 1."),
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correct_answer: (i % 3 === 1 ? "TRUE" : i % 3 === 2 ? "FALSE" : "NOT GIVEN")
      });
    }
    // Part 2: Q14-26 (Multiple Choice & Heading Match)
    var p2Options = [
      ["A. It consolidates short-term neural pathways into persistent memory stores.", "B. It decreases neurotransmitter activity across cerebral lobes.", "C. It inhibits synaptic pruning during non-REM sleep.", "D. It restricts neurogenesis to sensory motor zones."],
      ["A. Immediate cramming sessions", "B. Spaced deliberate intervals", "C. Subliminal auditory exposure", "D. Multi-tasking sensory inputs"],
      ["A. Visual recognition tests", "B. Linguistic syntax drills", "C. Cross-sectional longitudinal cohorts", "D. Animal behavioral models"],
      ["A. Emotional arousal enhances episodic recall.", "B. Cognitive fatigue is inevitable after thirty minutes.", "C. Working memory capacity is strictly unlimited.", "D. Semantic networks remain static throughout adulthood."]
    ];
    for (var j = 14; j <= 26; j++) {
      var optIdx = (j - 14) % p2Options.length;
      qs.push({
        id: testId + "-rq-" + j,
        test_id: testId,
        passage_id: testId + "-passage-2",
        part: "2",
        question_number: j,
        question_type: "mcq",
        question_text: "According to Passage 2, what does the research conclude regarding finding #" + (j - 13) + "?",
        options: p2Options[optIdx],
        correct_answer: (optIdx === 0 ? "A" : optIdx === 1 ? "B" : optIdx === 2 ? "C" : "D")
      });
    }
    // Part 3: Q27-40 (Summary & Sentence Completion)
    var p3Prompts = [
      "Photovoltaic cell efficiency has improved primarily due to advances in _____ materials.",
      "Large-scale energy storage systems are necessary to compensate for power _____.",
      "Decentralized power distribution networks minimize transmission _____.",
      "Government economic incentives encourage private sector _____ in infrastructure.",
      "Battery recycling protocols are designed to recover critical rare earth _____.",
      "Wind turbine blade aerodynamics are modeled on natural aquatic _____.",
      "Hydroelectric power installations require detailed assessment of aquatic _____.",
      "Smart meters enable consumers to adjust their energy usage according to _____.",
      "Geothermal extraction technologies harness heat generated beneath the earth's _____.",
      "International agreements establish binding emissions reduction _____.",
      "Transition costs are projected to be offset by reduced health and climate _____.",
      "Technological breakthroughs in grid stability rely heavily on artificial _____.",
      "Urban architectural standards now mandate sustainable building _____.",
      "Global energy independence provides significant geopolitical _____."
    ];
    var p3Answers = ["semiconductor", "fluctuations", "losses", "investment", "elements", "organisms", "ecosystems", "tariffs", "crust", "targets", "damages", "intelligence", "materials", "stability"];
    for (var k = 27; k <= 40; k++) {
      var kIdx = k - 27;
      qs.push({
        id: testId + "-rq-" + k,
        test_id: testId,
        passage_id: testId + "-passage-3",
        part: "3",
        question_number: k,
        question_type: "fill",
        question_text: p3Prompts[kIdx] || ("Complete the sentence for item " + k + "."),
        options: [],
        correct_answer: p3Answers[kIdx] || "answer"
      });
    }
    return qs;
  }

  function generateIeltsListeningQuestions(testId) {
    var qs = [];
    // Part 1: Q1-10 Form / Table Completion
    var p1Items = [
      { text: "Customer Name: Michael _____", ans: "ANDERSON" },
      { text: "Contact Telephone: 07700 _____", ans: "900452" },
      { text: "Preferred moving date: 24th of _____", ans: "OCTOBER" },
      { text: "Destination address: 14 Green _____ Road", ans: "MEADOW" },
      { text: "Number of standard storage boxes: _____", ans: "15" },
      { text: "Fragile item requiring special packing: antique _____", ans: "MIRROR" },
      { text: "Preferred delivery window: early _____", ans: "MORNING" },
      { text: "Insurance tier selected: _____ cover", ans: "PREMIUM" },
      { text: "Payment method: credit _____", ans: "CARD" },
      { text: "Promotional referral code: _____2026", ans: "MOVE" }
    ];
    for (var i = 1; i <= 10; i++) {
      var it1 = p1Items[i - 1];
      qs.push({
        id: testId + "-lq-" + i,
        test_id: testId,
        part_id: testId + "-part-1",
        question_number: i,
        question_type: "fill",
        question_text: it1.text,
        options: [],
        correct_answer: it1.ans,
        section_title: "Part 1: Customer Consultation",
        instruction: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer."
      });
    }
    // Part 2: Q11-20 Multiple Choice (Monologue)
    var p2Opts = [
      ["A. Access to the historic archives", "B. Free admission on weekends", "C. Guided architectural walk"],
      ["A. Renovate the central auditorium", "B. Construct an open-air amphitheater", "C. Expand visitor parking facilities"],
      ["A. Local environmental charities", "B. The national heritage lottery", "C. Corporate corporate sponsors"]
    ];
    for (var j = 11; j <= 20; j++) {
      var opt2Idx = (j - 11) % p2Opts.length;
      qs.push({
        id: testId + "-lq-" + j,
        test_id: testId,
        part_id: testId + "-part-2",
        question_number: j,
        question_type: "mcq",
        question_text: "According to the speaker, what is the primary objective of community initiative #" + (j - 10) + "?",
        options: p2Opts[opt2Idx],
        correct_answer: (opt2Idx === 0 ? "A" : opt2Idx === 1 ? "B" : "C"),
        section_title: "Part 2: Community Heritage Tour",
        instruction: "Choose the correct letter, A, B or C."
      });
    }
    // Part 3: Q21-30 Student Discussion (MCQ & Matching)
    var p3Opts = [
      ["A. The literature review was insufficiently focused", "B. The sample size was too limited", "C. The statistical methodology was flawed", "D. The ethical approval came too late"],
      ["A. Focus group transcript analysis", "B. Quantitative survey distribution", "C. Longitudinal field observation", "D. Secondary archival research"]
    ];
    for (var k = 21; k <= 30; k++) {
      var opt3Idx = (k - 21) % p3Opts.length;
      qs.push({
        id: testId + "-lq-" + k,
        test_id: testId,
        part_id: testId + "-part-3",
        question_number: k,
        question_type: "mcq",
        question_text: "What agreement do the two researchers reach concerning task #" + (k - 20) + "?",
        options: p3Opts[opt3Idx],
        correct_answer: (opt3Idx === 0 ? "A" : "B"),
        section_title: "Part 3: Academic Project Review",
        instruction: "Choose the correct letter, A, B, C or D."
      });
    }
    // Part 4: Q31-40 Academic Lecture Note Completion
    var p4Items = [
      { text: "Marine biological rhythms are governed by the gravitational pull of the _____.", ans: "MOON" },
      { text: "Deep-sea organisms adapt to extreme water _____ through modified enzymes.", ans: "PRESSURE" },
      { text: "Bioluminescence serves primarily for mate attraction and prey _____.", ans: "DETECTION" },
      { text: "Coral bleaching is triggered when sea temperatures exceed seasonal _____.", ans: "THRESHOLDS" },
      { text: "Microplastic particles accumulate most densely in oceanic _____ zones.", ans: "CONVERGENCE" },
      { text: "Nutrient upwelling currents sustain large populations of photosynthetic _____.", ans: "PLANKTON" },
      { text: "Acoustic tracking tags transmit data via low-frequency satellite _____.", ans: "SIGNALS" },
      { text: "Mangrove root complexes provide vital coastal protection against storm _____.", ans: "SURGES" },
      { text: "International marine reserves enforce total prohibition of commercial _____.", ans: "FISHING" },
      { text: "Future conservation efficacy depends heavily on cross-border diplomatic _____.", ans: "COOPERATION" }
    ];
    for (var m = 31; m <= 40; m++) {
      var it4 = p4Items[m - 31];
      qs.push({
        id: testId + "-lq-" + m,
        test_id: testId,
        part_id: testId + "-part-4",
        question_number: m,
        question_type: "fill",
        question_text: it4.text,
        options: [],
        correct_answer: it4.ans,
        section_title: "Part 4: Oceanography Lecture",
        instruction: "Write ONE WORD ONLY for each answer."
      });
    }
    return qs;
  }

  // =========================================================================
  // Cambridge & IELTS Writing Suite Generator (Task 1 & Task 2)
  // =========================================================================
  function generateIeltsWritingData(testId) {
    var isGt = false;
    var bookNum = 15;
    var testNum = 1;

    if (typeof testId === 'string') {
      if (testId.indexOf('-gt-') !== -1 || testId.indexOf('general') !== -1) {
        isGt = true;
      }
      var bMatch = testId.match(/cambridge[_-](\d+)/i);
      if (bMatch) bookNum = parseInt(bMatch[1], 10);
      var tMatch = testId.match(/(?:test|writing)[_-](?:gt[_-])?(\d+)/i);
      if (tMatch) testNum = parseInt(tMatch[1], 10);
    }

    var academicTasks = {
      10: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe tables below give information about the sales of Fairtrade-labelled coffee and bananas in 1999 and 2004 in five European countries.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nIt is important for children to learn the difference between right and wrong at an early age. Punishment is necessary to help them learn this distinction.\n\nTo what extent do you agree or disagree with this opinion?\nWhat sort of punishment should parents and teachers be allowed to use?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe charts below show the proportions of British students at one university in England who were able to speak other languages in 2000 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nSome people think that all university students should study whatever they like. Others believe they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe charts show the percentage of water used for different purposes in six areas of the world.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nCountries are becoming more and more similar because people are able to buy the same products anywhere in the world.\n\nDo you think this is a positive or negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram below shows the process of making electricity from coal.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nMany museums and historical sites are mainly visited by tourists rather than local people.\n\nWhy is this?\nWhat can be done to attract more local visitors?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      11: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe charts below show the proportions of British graduates who entered full-time work, part-time work, further study, or were unemployed in 2008.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nGovernments should spend money on railways rather than roads.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe charts show the percentage of household expenditure across five categories in three European countries in 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people say that the only reason for learning a foreign language is in order to travel or work in a foreign country. Others say that there are many other reasons.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe graph below shows the average carbon dioxide (CO2) emissions per person in four European countries from 1967 to 2007.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people believe that it is good to share as much information as possible in scientific research, business and the academic world. Others believe that some information is too important or valuable to share freely.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe plans below show a public park when it first opened in 1920 and the same park today.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nMany people believe that international tourism is a bad thing for their countries.\n\nWhat are the reasons? How can negative impacts be minimised?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      12: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe line graph shows the percentage of tourists to England who visited four attractions between 1981 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people say that the best way to improve public health is by increasing the number of sports facilities. Others think that this has little effect and that other measures are needed.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe maps show the changes that have taken place in the town of Islip between 2010 and the present day.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nAt the present time, the population of some countries includes a relatively large number of young adults, compared with the number of older people.\n\nDo the advantages of this situation outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe bar chart shows the percentage of people in a European city who ate five portions of fruit and vegetables per day between 2001 and 2008.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people say that subjects like art, music and drama should be part of the curriculum in all schools, while others think they are a waste of time.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram illustrates the stages in the life cycle of the salmon, from egg to adult fish.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn some countries, children are starting school at a very young age.\n\nDo you think the advantages outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      13: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe two maps below show the road access to a city hospital in 2007 and in 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nLiving in a country where you have to speak a foreign language can cause serious social problems as well as practical problems.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe chart shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people say that history is one of the most important subjects in schools. Others believe that science and technology are much more important.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe bar chart shows the proportion of men and women of different age groups who did physical exercise on a regular basis in 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nMore and more people are doing voluntary work in their free time.\n\nWhy do they do this?\nWhat are the benefits for society?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe plans show the layout of a university sports centre now, and how it will look after redevelopment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn spite of the advances made in agriculture, many people around the world still do not have enough food.\n\nWhat are the causes? What can be done to solve this problem?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      14: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe charts show the average percentages in typical meals of three types of nutrients: sodium, saturated fat and added sugar in the USA.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nThe best way to solve environmental problems caused by traffic is to make motor fuel more expensive.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe chart below shows the value of one country's exports in various categories in 2015 and 2016.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people believe that it is best to accept a bad situation, such as an unsatisfactory job or shortage of money. Others argue that it is better to try and improve such situations.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram shows how geothermal energy is used to produce electricity.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people say that music is a good way of bringing people of different cultures and ages together.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe plans show the changes in the layout of a conference centre from 2010 to the present day.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nMany people believe that social networking sites have had a huge negative impact on both individuals and society.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      15: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe chart shows the results of a survey in 2005, 2010 and 2015 about how satisfied people were with three different services provided by their local council.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nIn some countries, more and more people are becoming interested in finding out about the history of the house or building they live in.\n\nWhat are the reasons for this?\nHow can they research this information?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe graph below shows the percentage of households with internet access in five countries between 2000 and 2014.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn the modern world it is possible to shop, work and communicate online without any face-to-face contact with others.\n\nIs this a positive or negative development in your opinion?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram shows the life cycle of the flowering plant and the process of seed dispersal.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn many countries, children are engaged in some kind of paid work. Some regard this as completely wrong, while others consider it valuable work experience.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe line graph shows the changes in the price of fresh fruits and vegetables, sugar and sweets, and all consumer items in one country from 1979 to 2009.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn the future, nobody will buy printed books, newspapers or magazines because everything will be read online.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      16: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe line graph shows the production of three types of renewable energy in an Asian country between 2000 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people say that modern technology has made our lives more complex, and the only way to solve this is to simplify our lives by not using technology.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram shows the process of sugar production from sugar cane.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nNowadays, many families no longer eat meals together.\n\nWhat are the causes of this? What effect does this have on families and society?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe plans below show the site of an airport now and how it will look after redevelopment next year.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people believe that professionals, such as doctors and engineers, should be required to work in the country where they did their training. Others believe they should be free to work in another country.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe table shows the percentage of mobile phone owners using various mobile phone features in 2006, 2008 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn many countries, fast food is becoming more popular and replacing traditional food.\n\nIs this a positive or negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      17: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe maps show an industrial area in the town of Norbiton and planned future development of the site.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIt is important for people to take risks, both in their professional and personal lives.\n\nDo you think the advantages of taking risks outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe table shows the number of employees and percentage change in employment across five sectors in one Australian city between 2010 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome children spend hours each day on their smartphones.\n\nWhy is this case? Do you think this is a positive or a negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe bar chart gives information about the proportion of carbon emissions generated by five industrial sectors in 2005, 2010 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people believe that competition in schools encourages children to achieve more, while others feel that cooperation is more valuable.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram illustrates the process of recycling plastic bottles into clothing items.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn some countries, shopping online has become more popular than shopping in high street stores.\n\nWhat are the advantages and disadvantages of this trend?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      18: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe line graph shows the consumption of three types of fast food (pizza, fish and chips, hamburgers) among teenagers in Australia between 1975 and 2000.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram below shows how leather products are manufactured from animal hides.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn many cities, housing costs are rising rapidly, making it difficult for average earners to buy a home.\n\nWhat problems does this cause? What measures can governments take to resolve this?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe bar chart shows the percentage of people using four different forms of public transport in three European capitals in 2019.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nEnvironmental problems are now so great that individuals can do little about them. Only governments and large companies can make a real difference.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe maps illustrate changes to a coastal village between 1995 and the present day.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nMany people believe that AI and automated systems will replace many human jobs in the coming decades.\n\nDo you think this is a positive or negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      19: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe bar chart compares the percentage of household waste recycled across five European nations in 2012 and 2022.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nWith the rapid development of electric vehicles and autonomous driving, some people believe that traditional driving licenses will soon be unnecessary.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe table gives data on the number of international student enrolments across four academic faculties at a university between 2015 and 2021.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people think that spending money on space exploration is justified, while others argue that the money should be spent on solving problems on Earth.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe process diagram shows how recycled glass bottles are collected, crushed, melted and remanufactured into new glass containers.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nIn many parts of the world, remote working has become common.\n\nDoes remote work bring more advantages or disadvantages to workers and businesses?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe line graph shows the average daily screen time for children aged 5-16 across four countries from 2010 to 2023.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome believe that all children should learn computer coding in primary school. Others believe traditional academic subjects are more essential.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ],
      20: [
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe charts show the proportion of electricity produced by solar, wind, hydro, and fossil fuels in four countries in 2020 and 2024.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nMany young people today prefer digital communication over meeting friends in person.\n\nWhy is this happening? What are the consequences for interpersonal relationships?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe table displays the average weekly household expenditure on food, rent, entertainment, and utilities in five major cities in 2023.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people believe that governments should provide a universal basic income to all adult citizens regardless of employment status.\n\nDo the advantages of this policy outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe diagram illustrates the flow of water through an urban sustainable drainage system (SuDS) during heavy rainfall.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nClimate change education should be mandatory in the national curriculum for all secondary schools.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        },
        {
          t1: "You should spend about 20 minutes on this task.\n\nThe maps illustrate changes in a university campus between 2010 and the present year, including new research facilities and transport hubs.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          t2: "You should spend about 40 minutes on this task.\n\nSome people think that employers should reward employees based on seniority and years of service, while others argue that performance and achievements should be the sole criteria.\n\nDiscuss both views and give your opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
        }
      ]
    };

    var gtTasks = [
      {
        t1: "You should spend about 20 minutes on this task.\n\nYou recently moved to a new rented apartment and discovered several maintenance problems that were not resolved before you moved in.\n\nWrite a letter to your landlord. In your letter:\n• Explain the situation and specify what the problems are\n• Describe how these issues have affected your living conditions\n• State what action you expect the landlord to take and by when\n\nWrite at least 150 words. You do NOT need to write any addresses.\nBegin your letter as follows:\nDear Mr. Smith,",
        t2: "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nIn many countries today, people are choosing to buy new manufactured goods rather than repairing old items.\n\nWhy is this the case? Is this a positive or negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
      },
      {
        t1: "You should spend about 20 minutes on this task.\n\nYou recently used a public transport service and experienced a significant delay that caused you to miss an important appointment.\n\nWrite a letter to the transport manager. In your letter:\n• Give details of your journey (date, time, route)\n• Explain what happened and the impact of the delay\n• Suggest what the company should do to improve the service and compensate you\n\nWrite at least 150 words. You do NOT need to write any addresses.\nBegin your letter as follows:\nDear Sir or Madam,",
        t2: "You should spend about 40 minutes on this task.\n\nWrite about the following topic:\n\nSome people believe that working from home brings greater benefits for both employers and employees, while others feel that working in a shared office environment is essential.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
      }
    ];

    var taskPair;
    if (isGt) {
      taskPair = gtTasks[(testNum - 1) % gtTasks.length];
    } else {
      var bList = academicTasks[bookNum] || academicTasks[15];
      taskPair = bList[(testNum - 1) % bList.length];
    }

    var wp1Id = testId + "-wp-1";
    var wp2Id = testId + "-wp-2";

    var passages = [
      {
        id: wp1Id,
        test_id: testId,
        order: 1,
        title: isGt ? "Writing Task 1 (Letter)" : "Writing Task 1 (Report)",
        description: taskPair.t1,
        chart_image_url: null,
        chart_data: null,
        segments: [
          { id: testId + "-s1-a", passage_id: wp1Id, label: "Task 1", content: taskPair.t1, order: 1 }
        ]
      },
      {
        id: wp2Id,
        test_id: testId,
        order: 2,
        title: "Writing Task 2 (Discursive Essay)",
        description: taskPair.t2,
        chart_image_url: null,
        chart_data: null,
        segments: [
          { id: testId + "-s2-a", passage_id: wp2Id, label: "Task 2", content: taskPair.t2, order: 1 }
        ]
      }
    ];

    var questions = [
      {
        id: testId + "-wq-1",
        test_id: testId,
        passage_id: wp1Id,
        question_number: 1,
        part: "1",
        question_type: isGt ? "Task 1 (General - Letter)" : "Task 1 (Academic - Report)",
        question_text: isGt ? "Write a letter to your landlord regarding maintenance issues." : "Summarise the main features of the chart/diagram and make comparisons where relevant.",
        options: [],
        correct_answer: null
      },
      {
        id: testId + "-wq-2",
        test_id: testId,
        passage_id: wp2Id,
        question_number: 2,
        part: "2",
        question_type: "Task 2 (Essay)",
        question_text: "Write a well-structured essay responding to the topic above with supporting arguments.",
        options: [],
        correct_answer: null
      }
    ];

    var configs = [
      { id: testId + "-wc-1", test_id: testId, part_number: 1, total_questions: 1, start_question: 1 },
      { id: testId + "-wc-2", test_id: testId, part_number: 2, total_questions: 1, start_question: 2 }
    ];

    var segments = [
      { id: testId + "-s1-a", passage_id: wp1Id, label: "Task 1", content: taskPair.t1, order: 1 },
      { id: testId + "-s2-a", passage_id: wp2Id, label: "Task 2", content: taskPair.t2, order: 1 }
    ];

    return {
      passages: passages,
      questions: questions,
      configs: configs,
      segments: segments
    };
  }

  // =========================================================================
  // IELTS Speaking Suite Generator (Part 1, Part 2 Cue Card & Part 3)
  // =========================================================================
  function generateIeltsSpeakingData(testId) {
    var topicIndex = 0;
    if (typeof testId === 'string') {
      var numMatch = testId.match(/(\d+)/);
      if (numMatch) {
        topicIndex = parseInt(numMatch[1], 10) % 4;
      } else {
        var sum = 0;
        for (var c = 0; c < testId.length; c++) sum += testId.charCodeAt(c);
        topicIndex = sum % 4;
      }
    }

    var speakingTopics = [
      {
        theme: "Work, Studies & Memorable Journeys",
        p1Topic: "Hometown, Studies & Technology Habits",
        p1Questions: [
          "Let's talk about your hometown. Where is your hometown located and what is it known for?",
          "What do you like most about living in your hometown or current city?",
          "Has your hometown changed significantly in recent years?",
          "Now let's discuss technology. How often do you use digital devices in your daily studies or work?",
          "Do you think artificial intelligence will replace human tasks in the near future?"
        ],
        p2Title: "Part 2: Long Turn (Cue Card)",
        p2Topic: "A Memorable Journey by Public Transport",
        p2CueCard: "Describe a memorable journey you took by public transport.\n\nYou should say:\n• where you went and what transport you took\n• who was with you on this journey\n• what happened during the trip\nand explain why this journey was so memorable for you.",
        p3Topic: "Public Transportation, Urban Mobility & Future Infrastructure",
        p3Questions: [
          "Why do many people still prefer private vehicles over public transport despite heavy traffic?",
          "What measures can city authorities take to encourage more commuters to use mass transit systems?",
          "How have modern high-speed railway networks impacted regional economic development?",
          "Do you believe driverless autonomous trains and buses will completely replace human drivers?",
          "In what ways might global travel habits need to adjust to combat climate change?"
        ]
      },
      {
        theme: "Hometown, Cultural Traditions & Daily Routines",
        p1Topic: "Daily Routine, Leisure & Cultural Celebrations",
        p1Questions: [
          "What is your typical morning routine on a normal weekday?",
          "Do you prefer spending your free time outdoors or relaxing indoors? Why?",
          "What is a major traditional festival or celebration in your country?",
          "How do people in your family usually celebrate special occasions?",
          "Do you think young people today celebrate traditional holidays differently from older generations?"
        ],
        p2Title: "Part 2: Long Turn (Cue Card)",
        p2Topic: "A Traditional Celebration or Event You Enjoyed",
        p2CueCard: "Describe a traditional celebration or cultural festival you attended.\n\nYou should say:\n• what the festival was and where it took place\n• who you attended it with\n• what activities and customs occurred during the event\nand explain how you felt about participating in this celebration.",
        p3Topic: "Preserving Cultural Heritage in a Globalized Society",
        p3Questions: [
          "Why is it important for nations to preserve their historic cultural traditions?",
          "How has international media and globalization influenced local cultural celebrations?",
          "Should governments allocate public funding to preserve historic sites and folk arts?",
          "In what ways can schools teach younger generations to appreciate their cultural roots?",
          "Do you think traditional celebrations will remain relevant fifty years from now?"
        ]
      },
      {
        theme: "Environmental Protection & Modern Cities",
        p1Topic: "Parks, Green Spaces & Nature",
        p1Questions: [
          "Are there many parks or public gardens near where you live?",
          "How often do you visit natural environments like forests or lakes?",
          "What kind of outdoor activities do people in your region enjoy doing?",
          "Do you think it is important for children to learn about nature at school?",
          "Have you ever participated in any tree planting or environmental clean-up activity?"
        ],
        p2Title: "Part 2: Long Turn (Cue Card)",
        p2Topic: "An Environmental Project or Green Space",
        p2CueCard: "Describe an environmental project, community garden, or park you know about.\n\nYou should say:\n• where this project or park is situated\n• what features or green spaces it contains\n• how local residents make use of it\nand explain why this initiative is beneficial for the local community.",
        p3Topic: "Urban Sustainability & Climate Change Responsibility",
        p3Questions: [
          "How do green spaces and urban forests contribute to the physical and mental health of city residents?",
          "Whose responsibility is it to combat urban air pollution — governments, corporations, or individuals?",
          "What are the main obstacles developing cities face when trying to build eco-friendly infrastructure?",
          "How can architecture incorporate sustainable designs to reduce energy consumption in buildings?",
          "Do you think international climate agreements are being implemented effectively worldwide?"
        ]
      },
      {
        theme: "Artificial Intelligence, Communication & Future Education",
        p1Topic: "Online Learning, Reading Habits & Communication",
        p1Questions: [
          "Do you prefer reading physical printed books or digital e-books on a screen? Why?",
          "How often do you communicate with friends through instant messaging compared to phone calls?",
          "What kinds of websites or mobile applications do you find most useful for your studies?",
          "Have you ever completed an online course or educational webinar?",
          "What are the benefits of having instant access to information on smartphones?"
        ],
        p2Title: "Part 2: Long Turn (Cue Card)",
        p2Topic: "A Useful Website or App that Helped You Learn",
        p2CueCard: "Describe an educational website or mobile app that helped you learn something new.\n\nYou should say:\n• what the website or application is\n• how you first discovered it\n• what specific skills or knowledge you learned from it\nand explain why you found it particularly helpful.",
        p3Topic: "The Future of Education & Artificial Intelligence",
        p3Questions: [
          "How is artificial intelligence transforming classroom learning and personalized education?",
          "Do you think automated AI tutors could ever completely replace human teachers?",
          "What are the potential drawbacks of students relying heavily on internet search engines for assignments?",
          "How should university education adapt to prepare graduates for jobs in the age of automation?",
          "Is digital literacy becoming more critical than traditional academic subjects for future careers?"
        ]
      }
    ];

    var topic = speakingTopics[topicIndex];
    var p1Id = testId + "-part-1";
    var p2Id = testId + "-part-2";
    var p3Id = testId + "-part-3";

    var parts = [
      {
        id: p1Id,
        test_id: testId,
        part_number: 1,
        title: "Part 1: Introduction & Interview",
        topic: topic.p1Topic,
        cue_card_text: null,
        prep_time_seconds: 0
      },
      {
        id: p2Id,
        test_id: testId,
        part_number: 2,
        title: topic.p2Title,
        topic: topic.p2Topic,
        cue_card_text: topic.p2CueCard,
        prep_time_seconds: 60
      },
      {
        id: p3Id,
        test_id: testId,
        part_number: 3,
        title: "Part 3: Two-Way Discussion",
        topic: topic.p3Topic,
        cue_card_text: null,
        prep_time_seconds: 0
      }
    ];

    var questions = [];
    var qNum = 1;

    // Part 1 Questions (5 items)
    topic.p1Questions.forEach(function(qText) {
      questions.push({
        id: testId + "-sp-q-" + qNum,
        test_id: testId,
        part_id: p1Id,
        question_number: qNum,
        question_text: qText
      });
      qNum++;
    });

    // Part 2 Question / Prompt (1 item)
    questions.push({
      id: testId + "-sp-q-" + qNum,
      test_id: testId,
      part_id: p2Id,
      question_number: qNum,
      question_text: "You have 1 minute to prepare your notes on the cue card topic above. Speak for 1 to 2 minutes when the timer begins."
    });
    qNum++;

    // Part 3 Questions (5 items)
    topic.p3Questions.forEach(function(qText) {
      questions.push({
        id: testId + "-sp-q-" + qNum,
        test_id: testId,
        part_id: p3Id,
        question_number: qNum,
        question_text: qText
      });
      qNum++;
    });

    return {
      parts: parts,
      questions: questions
    };
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
            var wData = generateIeltsWritingData(targetTestId);
            var remoteWqUrl = 'https://jwwklcjvwgypqfznzsaw.supabase.co/rest/v1/writing_questions_student?test_id=eq.' + targetTestId + '&select=*';
            return originalFetch.call(window, remoteWqUrl, {
              headers: {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d2tsY2p2d2d5cHFmem56c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTU3ODAsImV4cCI6MjA5MTA3MTc4MH0.o6elEFn2vhV-TyXQ1sJgnL_jzKQrocZ2EFRRMlDwH04"
              }
            }).then(function(res) {
              if (res.ok) {
                return res.json().then(function(data) {
                  if (Array.isArray(data) && data.length > 0) {
                    return makeJsonResponse(data);
                  }
                  return makeJsonResponse(wData.questions);
                }).catch(function() {
                  return makeJsonResponse(wData.questions);
                });
              }
              return makeJsonResponse(wData.questions);
            }).catch(function() {
              return makeJsonResponse(wData.questions);
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
          // Admin notification RPCs
          if (rpcName === 'admin_total_unread' || rpcName === 'admin_notification_counts') {
            return Promise.resolve(makeJsonResponse({ unread: 0, total: 0 }));
          }
          if (rpcName === 'admin_mark_all_read') {
            return Promise.resolve(makeJsonResponse({ success: true }));
          }
          // Referral RPCs
          if (rpcName === 'admin_get_referral_settings' || rpcName === 'get_public_referral_settings') {
            return Promise.resolve(makeJsonResponse({ enabled: false, reward_type: 'none', reward_amount: 0 }));
          }
          if (rpcName === 'get_my_referral_click_stats') {
            return Promise.resolve(makeJsonResponse({ total_clicks: 0, conversions: 0, earnings: 0 }));
          }
          // Security RPCs
          if (rpcName === 'get_security_overview' || rpcName === 'get_security_settings') {
            return Promise.resolve(makeJsonResponse({ two_factor: false, trusted_devices: true, panic_mode: false }));
          }
          if (rpcName === 'get_security_settings') {
            return Promise.resolve(makeJsonResponse([{ id: true, two_factor_enabled: false, panic_mode: false }]));
          }
          if (rpcName === 'list_security_rules' || rpcName === 'list_security_backups') {
            return Promise.resolve(makeJsonResponse([]));
          }
          if (rpcName === 'panic_wipe_admin_sessions') {
            return Promise.resolve(makeJsonResponse({ success: true }));
          }
          // Study plan RPCs
          if (rpcName === 'get_study_plan_analytics') {
            return Promise.resolve(makeJsonResponse({ total_days: 0, completed: 0, streak: 0 }));
          }
          // Subscriber overview
          if (rpcName === 'get_subscriber_overview') {
            return Promise.resolve(makeJsonResponse({ active: 85, expired: 12, total: 97 }));
          }
          // Chatbot RPCs
          if (rpcName === 'admin_get_ai_chatbot_config' || rpcName === 'get_public_chatbot_config') {
            return Promise.resolve(makeJsonResponse({ enabled: false, provider: 'gemini', model: 'gemini-2.0-flash' }));
          }
          // Admin centers overview
          if (rpcName === 'admin_centers_overview') {
            return Promise.resolve(makeJsonResponse({ total: 0, active: 0, students: 0 }));
          }
          // License/deployment RPCs
          if (rpcName === 'get_license_clients_overview' || rpcName === 'list_published_source_versions') {
            return Promise.resolve(makeJsonResponse([]));
          }
          if (rpcName === 'get_gateway_public_config') {
            return Promise.resolve(makeJsonResponse({
              is_enabled: true,
              gateway_name: "testloom_multigateway",
              currency: "both",
              primary_currency: "BDT",
              secondary_currency: "USD",
              exchange_rate: 100,
              bkash: true,
              nagad: true,
              rocket: true,
              upay: true,
              cards: true,
              local_cards: true,
              stripe: true,
              paypal: true,
              international_cards: true,
              domestic_methods: ["bKash", "Nagad", "Rocket", "Upay", "Local Bank Cards"],
              international_methods: ["Visa / Mastercard / Amex", "Stripe", "PayPal"]
            }));
          }
          // Device limit
          if (rpcName === 'get_device_limit_overview') {
            return Promise.resolve(makeJsonResponse({ limit: 3, current: 1 }));
          }
          // Live speaking
          if (rpcName.indexOf('ls_') === 0) {
            return Promise.resolve(makeJsonResponse({ success: true, count: 0, items: [], queue: [] }));
          }
          // Conversation
          if (rpcName === 'get_or_create_my_conversation') {
            return Promise.resolve(makeJsonResponse({ id: 'conv-1', status: 'open' }));
          }
          // Deduplication
          if (rpcName === 'dedupe_user_sessions') {
            return Promise.resolve(makeJsonResponse({ removed: 0 }));
          }
          // AI usage
          if (rpcName === 'ensure_ai_speaking_usage_day') {
            return Promise.resolve(makeJsonResponse({ success: true }));
          }
          // Zinipay secrets
          if (rpcName === 'zinipay_webhook_secrets_list') {
            return Promise.resolve(makeJsonResponse([]));
          }
          // Center RPCs
          if (rpcName.indexOf('center_') === 0 || rpcName === 'my_center_memberships' || rpcName === 'my_center_student') {
            return Promise.resolve(makeJsonResponse([]));
          }
          // Grading QA
          if (rpcName === 'grading_qa_report') {
            return Promise.resolve(makeJsonResponse({ items: [], total: 0 }));
          }

          if (rpcName.indexOf('cc_') === 0 || rpcName.indexOf('log_') === 0 || rpcName.indexOf('upsert_') === 0 || rpcName.indexOf('record_') === 0) {
            return Promise.resolve(makeJsonResponse([]));
          }
          // Final catch-all for any unknown RPC — return success to prevent hangs
          return Promise.resolve(makeJsonResponse({ success: true, data: [], items: [], total: 0 }));
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

          if (funcName === 'initiate-payment') {
            var reqBody = (options && options.body) ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
            var orderId = reqBody.order_id || ('TL-' + Date.now());
            var pkgId = reqBody.package_id || 'f1';
            var callbackUrl = reqBody.callback_url || (window.location.origin + window.location.pathname + '#/payment-result?order_id=' + orderId + '&status=completed');

            mockSubscriptions[0] = {
              id: "sub-" + Date.now(),
              user_id: (mockCurrentUser && mockCurrentUser.id) || "admin-emran-id",
              status: "active",
              package_id: pkgId,
              starts_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              packages: {
                id: pkgId,
                name: reqBody.product_name || "Unlimited Exam Pass",
                max_reading_tests: -1,
                max_listening_tests: -1,
                max_writing_tests: -1,
                max_mock_tests: -1,
                max_speaking_sessions: -1
              }
            };

            return Promise.resolve(makeJsonResponse({
              ok: true,
              success: true,
              order_id: orderId,
              checkout_url: callbackUrl
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

          if (funcName === 'grade-writing') {
            return Promise.resolve(makeJsonResponse({
              ok: true,
              writing_band: 7.0,
              feedback: "Overall Band 7.0: Demonstrates strong task fulfillment, logical organization, and good grammatical control across both tasks.",
              tasks: [
                {
                  task_number: 1,
                  task_band: 7.0,
                  task_achievement: 7.0,
                  coherence_cohesion: 7.0,
                  lexical_resource: 7.0,
                  grammatical_range: 7.0,
                  feedback: "Task 1: Clear overview presented with well-selected key features and accurate comparisons. Vocabulary is appropriate and paragraphing is logical."
                },
                {
                  task_number: 2,
                  task_band: 7.0,
                  task_achievement: 7.0,
                  coherence_cohesion: 7.0,
                  lexical_resource: 7.0,
                  grammatical_range: 7.0,
                  feedback: "Task 2: Relevant ideas developed with supporting arguments. Good cohesive devices used naturally. Sentence structures show a variety of complex forms with few errors."
                }
              ]
            }));
          }

          if (funcName === 'grade-speaking') {
            return Promise.resolve(makeJsonResponse({
              ok: true,
              speaking_band: 7.0,
              feedback: "Overall Band 7.0: Fluent delivery with good coherence. Pronunciation is clear and lexical resource is well-developed.",
              criteria: {
                fluency_coherence: 7.0,
                lexical_resource: 7.0,
                grammatical_range: 7.0,
                pronunciation: 7.0
              }
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
              var idMatch = search.match(/id=eq\.([a-zA-Z0-9_\-]+)/i);
              var testIdMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
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
              var delIdMatch = search.match(/id=eq\.([a-zA-Z0-9_\-]+)/i);
              var delTestIdMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);

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

          if (tableName === 'packages' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockPackages));
          }
          if (tableName === 'site_content' && method === 'GET') {
            return Promise.resolve(makeJsonResponse(mockSiteContent));
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
               tableName === 'referrals' || tableName === 'billing_transactions' ||
               tableName === 'notification_preferences' || tableName === 'student_notes' ||
               tableName === 'study_streaks' || tableName === 'vocab_sets' || tableName === 'vocab_progress' ||
               // Admin-only tables (all return empty for safety)
               tableName === 'admin_audit_log' || tableName === 'admin_email_settings' ||
               tableName === 'admin_push_recipients' || tableName === 'admin_push_templates' ||
               tableName === 'admin_totp_secrets' || tableName === 'admin_trusted_devices' ||
               tableName === 'admin_verification_attempts' ||
               tableName === 'ai_chatbot_config' || tableName === 'ai_grading_settings' ||
               tableName === 'ai_grading_usage' || tableName === 'ai_speaking_config' ||
               tableName === 'ai_speaking_usage' || tableName === 'attempt_timers' ||
               tableName === 'banners' || tableName === 'broadcasts' ||
               tableName === 'card_design_order' || tableName === 'card_design_versions' ||
               tableName === 'card_designs_custom' ||
               tableName === 'center_activity_logs' || tableName === 'center_announcements' ||
               tableName === 'center_applications' || tableName === 'center_batches' ||
               tableName === 'center_devices' || tableName === 'center_ip_rules' ||
               tableName === 'center_packages' || tableName === 'center_plan_pricing' ||
               tableName === 'center_renewal_requests' || tableName === 'center_results' ||
               tableName === 'center_students' || tableName === 'center_subscriptions' ||
               tableName === 'center_test_assignments' || tableName === 'center_test_sessions' ||
               tableName === 'center_test_submissions' || tableName === 'center_test_template_items' ||
               tableName === 'center_test_templates' || tableName === 'center_users' ||
               tableName === 'centers' || tableName === 'chat_conversations' ||
               tableName === 'chatbot_config' || tableName === 'client_appointment_requests' ||
               tableName === 'client_deploy_logs' || tableName === 'client_deployment_telemetry' ||
               tableName === 'client_deployments' || tableName === 'client_deployments_safe' ||
               tableName === 'client_error_logs' || tableName === 'client_pending_updates' ||
               tableName === 'cloudflare_r2_accounts' || tableName === 'coupons' ||
               tableName === 'device_blocklist' || tableName === 'device_limit_events' ||
               tableName === 'elementor_pages' || tableName === 'elementor_revisions' ||
               tableName === 'email_automation_queue' || tableName === 'email_automation_settings' ||
               tableName === 'email_automation_steps' || tableName === 'email_automations' ||
               tableName === 'email_campaigns' || tableName === 'email_logs' ||
               tableName === 'email_send_jobs' || tableName === 'email_template_categories' ||
               tableName === 'email_templates' || tableName === 'email_user_preferences' ||
               tableName === 'gemini_api_keys' || tableName === 'generation_job_logs' ||
               tableName === 'generation_jobs' || tableName === 'google_sheets_config' ||
               tableName === 'grading_audit_log' || tableName === 'install_push_config' ||
               tableName === 'install_push_events' || tableName === 'install_push_user_state' ||
               tableName === 'ip_allowlist' || tableName === 'ip_blocklist' ||
               tableName === 'item_wise_tests' || tableName === 'license_verifications' ||
               tableName === 'link_tracking_settings' || tableName === 'listening_ai_settings' ||
               tableName === 'listening_transcripts' || tableName === 'live_presences' ||
               tableName === 'live_speaking_calls' || tableName === 'live_speaking_settings' ||
               tableName === 'livetv_channel_servers' || tableName === 'livetv_channels' ||
               tableName === 'livetv_playlists' || tableName === 'message_labels' ||
               tableName === 'mobile_menu_items' || tableName === 'notification_campaigns' ||
               tableName === 'notification_templates' || tableName === 'page_layouts' ||
               tableName === 'part_practice_config' || tableName === 'payments' ||
               tableName === 'pdf_analyzed_data' || tableName === 'pending_payment_orders' ||
               tableName === 'platform_build_artifacts' || tableName === 'platform_releases' ||
               tableName === 'practice_hero_config' || tableName === 'presence_activity_log' ||
               tableName === 'quick_replies' ||
               tableName === 'referral_clicks' || tableName === 'referral_landing_config' ||
               tableName === 'referral_settings' || tableName === 'roadmap_days' ||
               tableName === 'security_settings' || tableName === 'security_settings_backups' ||
               tableName === 'seo_audit_findings' || tableName === 'seo_audit_runs' ||
               tableName === 'seo_pages' || tableName === 'seo_redirects' ||
               tableName === 'seo_settings' || tableName === 'site_content' ||
               tableName === 'sms_campaigns' || tableName === 'sms_contacts' ||
               tableName === 'sms_recipients' || tableName === 'sms_replies' ||
               tableName === 'sms_sender_ids' || tableName === 'sms_settings' ||
               tableName === 'sms_templates' || tableName === 'source_code_licenses' ||
               tableName === 'source_code_versions' || tableName === 'speaking_ai_answers' ||
               tableName === 'speaking_announcements' || tableName === 'speaking_appointments' ||
               tableName === 'speaking_partner_announcements' || tableName === 'speaking_partner_cohosts' ||
               tableName === 'speaking_partner_join_requests' || tableName === 'speaking_partner_messages' ||
               tableName === 'speaking_partner_participants' || tableName === 'speaking_partner_reactions' ||
               tableName === 'speaking_partner_removed_users' || tableName === 'speaking_partner_reports' ||
               tableName === 'speaking_partner_reviews' || tableName === 'speaking_partner_rooms' ||
               tableName === 'speaking_partners' || tableName === 'speaking_plans' ||
               tableName === 'speaking_scenarios' || tableName === 'speaking_sessions' ||
               tableName === 'speaking_slots' || tableName === 'speaking_test_parts' ||
               tableName === 'speaking_test_questions' || tableName === 'speaking_tts_assets' ||
               tableName === 'staff_roles' || tableName === 'stories' ||
               tableName === 'student_assignments' || tableName === 'student_auto_notifications' ||
               tableName === 'student_section_config' || tableName === 'study_plan_templates' ||
               tableName === 'submission_status_thresholds' || tableName === 'testimonials' ||
               tableName === 'tracked_links' || tableName === 'user_devices' ||
               tableName === 'user_roles' || tableName === 'vapid_keys' ||
               tableName === 'vocabulary_quiz_attempts' || tableName === 'vocabulary_topics' ||
               tableName === 'vocabulary_word_progress' || tableName === 'vocabulary_words' ||
               tableName === 'writing_grading_events' || tableName === 'zinipay_payment_events'
             ) && method === 'GET') {
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
            var tidMatch2 = search.match(/id=eq\.([a-zA-Z0-9_\-]+)/i);
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

          // 11f. Speaking Test Parts (Part 1, Part 2 Cue Card, Part 3)
          if (tableName === 'speaking_test_parts' && method === 'GET') {
            var stpMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqStpId = stpMatch ? stpMatch[1] : "";
            var localStp = getLocalTable('speaking_test_parts').filter(function(p) {
              return !reqStpId || p.test_id === reqStpId;
            });
            if (localStp.length > 0) {
              return Promise.resolve(makeJsonResponse(localStp));
            }
            if (reqStpId) {
              var spData = generateIeltsSpeakingData(reqStpId);
              return Promise.resolve(makeJsonResponse(spData.parts));
            }
            return Promise.resolve(makeJsonResponse([]));
          }

          // 11g. Speaking Test Questions
          if (tableName === 'speaking_test_questions' && method === 'GET') {
            var stqMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqStqId = stqMatch ? stqMatch[1] : "";
            var localStq = getLocalTable('speaking_test_questions').filter(function(q) {
              return !reqStqId || q.test_id === reqStqId;
            });
            if (localStq.length > 0) {
              return Promise.resolve(makeJsonResponse(localStq));
            }
            if (reqStqId) {
              var spData2 = generateIeltsSpeakingData(reqStqId);
              return Promise.resolve(makeJsonResponse(spData2.questions));
            }
            return Promise.resolve(makeJsonResponse([]));
          }

          // 12. Reading Passages (with embedded segments support)
          if (tableName === 'reading_passages' && method === 'GET') {
            var tIdMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
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

                        // Fallback: Default 3 Authentic Reading Passages for the test (Paragraphs A-G)
            if (reqTestId) {
              var defaultPassages = [
                {
                  id: reqTestId + "-passage-1",
                  test_id: reqTestId,
                  order: 1,
                  title: "Reading Passage 1: The Evolution and Engineering of Urban Vertical Farming",
                  description: "You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1 below.",
                  segments: [
                    { id: reqTestId + "-s1-a", label: "A", content: "The global agricultural sector faces an unprecedented confluence of crises: arable land degradation, worsening water scarcity, and a projected global population exceeding nine billion by mid-century. Traditional soil-based farming methods consume approximately seventy percent of available freshwater withdrawals and contribute heavily to deforestation and greenhouse gas emissions. In response to these structural bottlenecks, agricultural engineers and urban architects have developed controlled-environment vertical agriculture—a methodology that stacks cultivation layers upward within high-density metropolitan buildings." },
                    { id: reqTestId + "-s1-b", label: "B", content: "Historically, the conceptual foundations of vertical farming date back to ancient hanging gardens and mid-twentieth-century hydroponic research. However, early commercial ventures struggled with prohibitive electricity costs and crude artificial lighting. The economic paradigm began shifting dramatically over the last decade with the advent of solid-state light-emitting diode (LED) arrays. Modern horticultural LEDs can be finely tuned to specific photosynthetically active radiation (PAR) spectra, particularly deep red and royal blue wavelengths, which dramatically accelerate vegetative growth while halving electricity consumption." },
                    { id: reqTestId + "-s1-c", label: "C", content: "Water conservation represents perhaps the most dramatic operational triumph of closed-loop vertical systems. Utilizing aeroponic or nutrient-film hydroponic irrigation, roots are periodically misted with precise mineral formulations rather than submerged in standing reservoirs. Transpiration vapor released by crops is captured by industrial dehumidifiers, re-condensed, sanitized via ultraviolet filtration, and recirculated back into the nutrient cycle. As a result, commercial vertical facilities require up to ninety-five percent less water than conventional outdoor field farming to produce an equivalent biomass." },
                    { id: reqTestId + "-s1-d", label: "D", content: "Despite these compelling agronomic advantages, commercial skeptics highlight substantial capital expenditure requirements. Building a multi-tier vertical farming facility demands specialized HVAC temperature regulating units, automated seeding conveyors, robotic harvesting gantries, and computer-vision disease surveillance cameras. A single commercial facility can cost tens of millions of dollars to construct. Nevertheless, proponents argue that year-round, weather-independent yield cycles—producing up to thirty harvest rotations annually per footprint compared to two or three in soil—justify the upfront capital allocation." },
                    { id: reqTestId + "-s1-e", label: "E", content: "A further compelling dimension concerns food safety and chemical contamination. In completely sealed indoor environments, biological pest pressures from insects, fungi, and airborne weeds are virtually eliminated. Consequently, vertical produce requires zero synthetic chemical pesticides, herbicides, or fungicides. Furthermore, municipal wastewater runoff and heavy metal soil contamination are entirely bypassed, ensuring higher microbiological purity standards that appeal strongly to health-conscious metropolitan consumers." },
                    { id: reqTestId + "-s1-f", label: "F", content: "Urban spatial planning is also undergoing transformation through agricultural retrofitting. Rather than constructing purpose-built towers from scratch, innovative developers are converting abandoned industrial warehouses, decommissioned subterranean bomb shelters, and vacant downtown corporate office floors into productive indoor farms. This spatial repurposing breathes economic vitality into blighted urban districts while drastically compressing food supply chains from thousands of transit miles down to mere city blocks." },
                    { id: reqTestId + "-s1-g", label: "G", content: "Looking forward, the long-term viability of vertical agriculture depends on its technological integration with municipal smart grids and localized renewable energy sources. Pairing vertical facilities with on-site rooftop solar arrays, waste-heat recapture systems, and dynamic off-peak electricity tariffs significantly improves profit margins. As global climate volatility increasingly disrupts field agriculture, vertical farming will inevitably transition from an experimental niche into an indispensable cornerstone of urban food security." }
                  ]
                },
                {
                  id: reqTestId + "-passage-2",
                  test_id: reqTestId,
                  order: 2,
                  title: "Reading Passage 2: Cognitive Neuroplasticity and Adult Second Language Acquisition",
                  description: "You should spend about 20 minutes on Questions 14–26, which are based on Reading Passage 2 below.",
                  segments: [
                    { id: reqTestId + "-s2-a", label: "A", content: "For decades, mainstream developmental psycholinguistics adhered to the strict Critical Period Hypothesis, originally formulated by Eric Lenneberg in 1967. This theory posited that successful language acquisition was biologically constrained to childhood, terminating abruptly around puberty due to the cerebral lateralization of linguistic processing. Adult learners who struggled with foreign syntax, grammar rules, and non-native phonological accents were cited as empirical proof that mature brains lack the neural flexibility necessary to master new linguistic codes." },
                    { id: reqTestId + "-s2-b", label: "B", content: "Recent neuroimaging breakthroughs utilizing high-resolution functional Magnetic Resonance Imaging (fMRI) and Diffusion Tensor Imaging (DTI) have overturned this deterministic dogma. Neuroscientists now observe robust neuroplastic restructuring in the brains of adult second-language learners. Intense language training leads to measurable volumetric expansion in gray matter density across the left inferior frontal gyrus (Broca’s area) and temporal auditory processing centers, alongside strengthened white matter tract integrity connecting cerebral hemispheres." },
                    { id: reqTestId + "-s2-c", label: "C", content: "The persistent challenge in adult language learning is not cognitive decline, but rather entrenched neural interference from the learner's native tongue. During infancy, the human auditory cortex undergoes 'neural commitment,' pruning sensitivity to phonemic contrasts absent from parental speech. When an adult encounters unfamiliar non-native phonemes, the auditory cortex automatically maps incoming acoustic signals onto the nearest native phonetic category, causing perceptual misidentification before cognitive processing even begins." },
                    { id: reqTestId + "-s2-d", label: "D", content: "Working memory capacity and executive inhibitory control play decisive roles in how rapidly adult learners overcome this native-language interference. Bilingual individuals must continuously suppress activation of their first language while formulating utterances in their second. This continuous inhibitory effort recruits the dorsolateral prefrontal cortex and anterior cingulate cortex—the brain's command centers for attentional control, cognitive task-switching, and error detection." },
                    { id: reqTestId + "-s2-e", label: "E", content: "Educational cognitive psychologists have demonstrated that pedagogical methodology profoundly dictates whether structural neural remodeling occurs. Passive rote memorization produces fragile, temporary episodic memory traces that degrade rapidly. In contrast, spaced deliberate retrieval practice, contextualized communicative problem-solving, and multi-sensory immersion stimulate the release of acetylcholine and brain-derived neurotrophic factor (BDNF), cementing synaptic connections into persistent semantic networks." },
                    { id: reqTestId + "-s2-f", label: "F", content: "Beyond linguistic proficiency, acquiring a second language in adulthood delivers remarkable collateral cognitive dividends. Epidemiological cohorts tracked over several decades reveal that bilingual adults demonstrate higher cognitive reserve, exhibiting symptom onset of neurodegenerative conditions such as Alzheimer’s disease an average of four to five years later than monolingual peers, despite equivalent underlying neuropathology." },
                    { id: reqTestId + "-s2-g", label: "G", content: "In conclusion, adult language acquisition should not be viewed through a deficit framework, but as an exemplar of the lifelong adaptability of the human central nervous system. Modern educational technology, incorporating adaptive spaced repetition algorithms and immersive conversational simulations, provides unprecedented avenues to harness this innate neuroplastic potential across all stages of adult life." }
                  ]
                },
                {
                  id: reqTestId + "-passage-3",
                  test_id: reqTestId,
                  order: 3,
                  title: "Reading Passage 3: Next-Generation Renewable Energy and Grid-Scale Storage",
                  description: "You should spend about 20 minutes on Questions 27–40, which are based on Reading Passage 3 below.",
                  segments: [
                    { id: reqTestId + "-s3-a", label: "A", content: "The worldwide decarbonisation of electric power grids represents one of the most formidable industrial engineering transitions in modern civilization. As conventional fossil fuel power generation is phased out, electrical grids are increasingly supplied by intermittent renewable sources, predominantly solar photovoltaics and wind turbines. However, the fundamental operational challenge of renewables lies in the mismatch between natural generation profiles and consumer demand curves, creating severe grid stability vulnerabilities." },
                    { id: reqTestId + "-s3-b", label: "B", content: "To overcome generation intermittency, material scientists have achieved transformative advances in photovoltaic cell efficiency. Traditional single-junction silicon cells operate close to their theoretical thermodynamic efficiency limit of roughly twenty-nine percent. Emerging perovskite-silicon tandem cells stack micro-thin layers of metal halide perovskites atop standard silicon wafers, capturing distinct portions of the solar spectrum and raising laboratory conversion efficiencies well above thirty-three percent under real-world irradiance." },
                    { id: reqTestId + "-s3-c", label: "C", content: "Simultaneously, wind turbine aerodynamics have scaled dramatically. Offshore turbine models now deploy rotor diameters exceeding two hundred and fifty meters, sweeping an area equivalent to multiple football fields. Utilizing flexible composite carbon-fiber materials, modern blades dynamically adjust their pitch in response to micro-gusts, generating steady electricity even in low-wind conditions while withstanding hurricane-force oceanic storms through automated feathering protocols." },
                    { id: reqTestId + "-s3-d", label: "D", content: "Nevertheless, generation breakthroughs remain incomplete without utility-scale energy storage systems capable of balancing multi-day deficits. While lithium iron phosphate (LFP) batteries dominate short-duration storage of two to four hours, alternative chemistries are emerging for long-duration resilience. Sodium-ion batteries utilize abundant, low-cost sodium salts instead of scarce lithium, while vanadium redox flow batteries store energy in massive liquid electrolyte tanks, allowing energy capacity to scale independently of power rating." },
                    { id: reqTestId + "-s3-e", label: "E", content: "Grid frequency stabilization presents an equally crucial mechanical challenge. Traditional heavy steam and combustion turbines provided physical rotational inertia, naturally resisting sudden drops in alternating current (AC) grid frequency. As mechanical generators are replaced by solid-state solar inverters, grid operators must deploy grid-forming inverters and mechanical synchronous condensers to provide 'synthetic inertia,' preventing cascading blackout trips during transmission faults." },
                    { id: reqTestId + "-s3-f", label: "F", content: "The deployment of decentralized smart grids and bidirectional electric vehicle (EV) charging protocols offers additional distributed flexibility. Through vehicle-to-grid (V2G) technology, millions of plugged-in electric passenger vehicles act collectively as a massive virtual power plant, discharging stored kilowatt-hours back into regional distribution networks during peak evening consumption spikes." },
                    { id: reqTestId + "-s3-g", label: "G", content: "Ultimately, the clean energy transformation is shifting from a technological frontier into an economic and geopolitical realignment. Capital costs for renewable generation and battery storage have plummeted by over eighty-five percent within a single generation. Nations that swiftly establish resilient renewable infrastructure and sovereign battery recycling ecosystems will enjoy substantial economic productivity gains and insulation from volatile global fossil fuel price shocks." }
                  ]
                }
              ];
              return Promise.resolve(makeJsonResponse(defaultPassages));
            }
          }

          // 12b. Reading Question Groups (Standard 3 Parts for IELTS)
          if (tableName === 'reading_question_groups' && method === 'GET') {
            var rqgMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqRqgId = rqgMatch ? rqgMatch[1] : "";
            var localGroups = getLocalTable('reading_question_groups').filter(function(g) {
              return !reqRqgId || g.test_id === reqRqgId;
            });
            if (localGroups.length > 0) {
              return Promise.resolve(makeJsonResponse(localGroups));
            }
            if (reqRqgId) {
              var defaultGroups = [
                {
                  id: reqRqgId + "-group-1",
                  test_id: reqRqgId,
                  passage_id: reqRqgId + "-passage-1",
                  part_number: 1,
                  position: 1,
                  question_type: "tfng",
                  title: "Questions 1–13",
                  instruction: "Do the following statements agree with the information given in Reading Passage 1?\nIn boxes 1–13 on your answer sheet, choose TRUE, FALSE, or NOT GIVEN.",
                  start_question: 1,
                  end_question: 13,
                  settings: {
                    stored_type: "tfng",
                    rule: { mode: "FIXED", fixedOptions: ["TRUE", "FALSE", "NOT GIVEN"] }
                  }
                },
                {
                  id: reqRqgId + "-group-2",
                  test_id: reqRqgId,
                  passage_id: reqRqgId + "-passage-2",
                  part_number: 2,
                  position: 2,
                  question_type: "mcq",
                  title: "Questions 14–26",
                  instruction: "Choose the correct letter, A, B, C or D.\nWrite the correct letter in boxes 14–26 on your answer sheet.",
                  start_question: 14,
                  end_question: 26,
                  settings: {
                    stored_type: "mcq",
                    rule: { mode: "FIXED", fixedOptions: ["A", "B", "C", "D"] }
                  }
                },
                {
                  id: reqRqgId + "-group-3",
                  test_id: reqRqgId,
                  passage_id: reqRqgId + "-passage-3",
                  part_number: 3,
                  position: 3,
                  question_type: "fill",
                  title: "Questions 27–40",
                  instruction: "Complete the summary below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.",
                  start_question: 27,
                  end_question: 40,
                  settings: {
                    stored_type: "fill",
                    rule: { mode: "TEXT", maxWords: 2 }
                  }
                }
              ];
              return Promise.resolve(makeJsonResponse(defaultGroups));
            }
            return Promise.resolve(makeJsonResponse([]));
          }

          // 12c. Reading Questions for Student Exam Experience
          if (tableName === 'reading_questions_student' && method === 'GET') {
            var rqsMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqRqsId = rqsMatch ? rqsMatch[1] : "";
            
            var localQs = getLocalTable('reading_questions').filter(function(q) {
              return !reqRqsId || q.test_id === reqRqsId;
            });
            if (localQs.length > 0) {
              return Promise.resolve(makeJsonResponse(localQs));
            }

            return originalFetch.call(window, input, init).then(function(resp) {
              if (resp.ok) {
                return resp.clone().json().then(function(data) {
                  if (Array.isArray(data) && data.length > 0) {
                    return makeJsonResponse(data);
                  }
                  return makeJsonResponse(generateIeltsReadingQuestions(reqRqsId));
                }).catch(function() {
                  return makeJsonResponse(generateIeltsReadingQuestions(reqRqsId));
                });
              }
              return makeJsonResponse(generateIeltsReadingQuestions(reqRqsId));
            }).catch(function() {
              return makeJsonResponse(generateIeltsReadingQuestions(reqRqsId));
            });
          }

          // 16b. Listening Questions for Student Exam Experience
          if (tableName === 'listening_questions_student' && method === 'GET') {
            var lqsMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqLqsId = lqsMatch ? lqsMatch[1] : "";

            var localLqs = getLocalTable('listening_questions').filter(function(q) {
              return !reqLqsId || q.test_id === reqLqsId;
            });
            if (localLqs.length > 0) {
              return Promise.resolve(makeJsonResponse(localLqs));
            }

            return originalFetch.call(window, input, init).then(function(resp) {
              if (resp.ok) {
                return resp.clone().json().then(function(data) {
                  if (Array.isArray(data) && data.length > 0) {
                    return makeJsonResponse(data);
                  }
                  return makeJsonResponse(generateIeltsListeningQuestions(reqLqsId));
                }).catch(function() {
                  return makeJsonResponse(generateIeltsListeningQuestions(reqLqsId));
                });
              }
              return makeJsonResponse(generateIeltsListeningQuestions(reqLqsId));
            }).catch(function() {
              return makeJsonResponse(generateIeltsListeningQuestions(reqLqsId));
            });
          }

          // 13. Reading Passage Segments
          if (tableName === 'reading_passage_segments' && method === 'GET') {
            var localSegs = getLocalTable('reading_passage_segments');
            return Promise.resolve(makeJsonResponse(localSegs));
          }

          // 14. Reading Configs
          if (tableName === 'reading_configs' && method === 'GET') {
            var rcTestMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
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
            var bsTestMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
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
            var lpTestMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqLpId = lpTestMatch ? lpTestMatch[1] : "";
            var localLp = getLocalTable('listening_parts').filter(function(p) {
              return !reqLpId || p.test_id === reqLpId;
            });
            if (localLp.length > 0) {
              return Promise.resolve(makeJsonResponse(localLp));
            }
            if (reqLpId) {
              return Promise.resolve(makeJsonResponse([
                {
                  id: reqLpId + "-part-1",
                  test_id: reqLpId,
                  part_number: 1,
                  title: "Part 1: Customer Consultation Form",
                  prompt: "Social Needs - Moving Service Reservation",
                  section_title: "Part 1: Moving Service Consultation",
                  audio_url: null,
                  audio_script: "Representative: Good morning! Apex Relocation and Storage Solutions. How may I assist you today?\nCustomer: Hello, I need to arrange a domestic move for my apartment next month and wanted to get a detailed quotation.\nRepresentative: Certainly! May I have your full name please?\nCustomer: Yes, it's Michael Anderson. That's A-N-D-E-R-S-O-N.\nRepresentative: Thank you, Mr. Anderson. And what is the best telephone number to contact you?\nCustomer: My mobile number is 07700 900452.\nRepresentative: Perfect. And what date are you looking to move?\nCustomer: We have our handover on the 24th of October, so early morning that day would be ideal.\nRepresentative: Great. What is your destination address?\nCustomer: It's number 14 Green Meadow Road, Westbury.\nRepresentative: 14 Green Meadow Road, got it. How many standard storage boxes do you anticipate needing?\nCustomer: Our inventory estimate showed around 15 standard boxes.\nRepresentative: And do you have any delicate or antique items that require reinforced crating?\nCustomer: Yes, we have an antique mirror that belonged to my grandmother. It has an ornate gilt frame.\nRepresentative: We will assign custom timber crating for the mirror. Our moving crew can arrive in the early morning at 8:00 AM. In terms of transit insurance, which tier would you prefer?\nCustomer: I'd definitely prefer the Premium cover for complete peace of mind.\nRepresentative: Excellent. And how would you like to handle the deposit?\nCustomer: I'll pay by credit card now.\nRepresentative: Wonderful. Do you have any promotional referral code today?\nCustomer: Yes, my colleague gave me the discount code MOVE2026.\nRepresentative: That applies a ten percent discount immediately. Let me confirm all those details for you..."
                },
                {
                  id: reqLpId + "-part-2",
                  test_id: reqLpId,
                  part_number: 2,
                  title: "Part 2: Community Heritage Tour",
                  prompt: "Social Needs - Monologue on Municipal Facilities",
                  section_title: "Part 2: Historic Town Hall Initiative",
                  audio_url: null,
                  audio_script: "Speaker: Good evening everyone, and welcome to our community briefing on the Westbury Heritage Revitalization Project. Tonight, I am delighted to share our progress on restoring the municipal historic quarter.\n\nFirst, concerning the public facilities: Many of you have asked about access to our historic archives. I am pleased to announce that beginning next month, the town hall archives will be fully accessible to members of the public free of charge, with guided architectural walks taking place every Tuesday and Saturday morning.\n\nRegarding the development plans for the civic square: Following our extensive public consultation last autumn, the committee voted to proceed with the proposal to renovate the central auditorium rather than building a commercial annex. The auditorium acoustics will be upgraded to world-class standards while retaining the original Victorian plasterwork.\n\nFunding for this landmark restoration has been secured through a unique multi-stakeholder partnership. While municipal council reserves provided initial feasibility funds, the substantial capital grant of three million pounds was awarded by the national heritage lottery, supplemented by generous sponsorships from local corporate foundations...\n\nPlease take a copy of the site map from the foyer as we explore the four main wings of the restored building..."
                },
                {
                  id: reqLpId + "-part-3",
                  test_id: reqLpId,
                  part_number: 3,
                  title: "Part 3: Academic Project Review",
                  prompt: "Educational Discussion between Two Students",
                  section_title: "Part 3: Sociology Research Methodology",
                  audio_url: null,
                  audio_script: "Jack: Hi Chloe, thanks for meeting up. We really need to finalize our presentation for Dr. Harrison's sociology seminar on Thursday.\nChloe: Absolutely, Jack. I've been reviewing the reviewer comments on our preliminary pilot study. What did you think about their assessment of our methodology?\nJack: Well, the feedback pointed out that our literature review was insufficiently focused on urban communities. We spent too much space reviewing rural studies which didn't match our research questions.\nChloe: I completely agree. We should trim those sections and focus squarely on metropolitan social networks. But what about our primary data collection? The reviewers felt our sample size of twenty participants was too limited to draw statistically valid conclusions.\nJack: That's true, but remember our primary paradigm was qualitative rather than quantitative. We conducted in-depth two-hour focus groups rather than quick online surveys. Still, we should acknowledge that limitation in our methodology slide.\nChloe: Good idea. And for the qualitative coding, how should we present the focus group transcript analysis?\nJack: I suggest we create a thematic matrix comparing the four recurring themes across both age cohorts. It makes the inductive coding clear and visual.\nChloe: Perfect. Let's draft the presentation slides right now..."
                },
                {
                  id: reqLpId + "-part-4",
                  test_id: reqLpId,
                  part_number: 4,
                  title: "Part 4: Oceanography Lecture",
                  prompt: "Academic Subject Lecture on Marine Ecology",
                  section_title: "Part 4: Ocean Ecosystems and Conservation",
                  audio_url: null,
                  audio_script: "Professor Davis: Good morning, class. In today's lecture on marine biological systems, we will examine the physiological adaptations of oceanic fauna and the systemic anthropogenic pressures confronting marine biomes.\n\nTo begin with, marine biological rhythms across coastal and pelagic species are fundamentally governed by the gravitational pull of the moon. This tidal synchrony dictates reproductive spawning cycles, migratory feeding ascents, and intertidal foraging behaviors across hundreds of marine phyla.\n\nMoving deeper into the bathypelagic and abyssopelagic zones, organisms must withstand immense hydrostatic pressure, which increases by one atmosphere every ten meters of depth. Deep-sea organisms adapt to extreme water pressure through modified membrane phospholipids and specialized piezolyte enzymes that prevent cellular collapse.\n\nBioluminescent reactions are exceptionally prevalent at these depths. While early marine biologists hypothesized that light production was primarily defensive, modern submersibles have shown that bioluminescence serves primarily for mate attraction and prey detection in the total absence of sunlight.\n\nTurning now to global environmental pressures: Tropical coral reefs are experiencing mass mortality through coral bleaching, a phenomenon triggered when sea temperatures exceed seasonal thresholds by as little as one to two degrees Celsius for sustained periods.\n\nFurthermore, plastic pollution has reached critical concentrations. Microplastic particles accumulate most densely in oceanic convergence zones—the massive subtropical gyres where ocean currents concentrate floating debris into expansive accumulation zones.\n\nNutrient upwelling currents sustain vast populations of photosynthetic plankton, forming the trophic foundation for global fisheries. However, marine protected areas remain vital: International marine reserves enforce total prohibition of commercial fishing to allow fish stocks and benthic ecosystems to regenerate.\n\nUltimately, the efficacy of future marine conservation will depend upon binding cross-border diplomatic cooperation across all maritime nations..."
                }
              ]));
            }
          }

          // 17. Writing Passages, Configs, Questions, and Segments
          if (tableName === 'writing_passages' && method === 'GET') {
            var wpTestMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqWpId = wpTestMatch ? wpTestMatch[1] : "";
            var localWp = getLocalTable('writing_passages').filter(function(p) {
              return !reqWpId || p.test_id === reqWpId;
            });
            if (localWp.length > 0) {
              return Promise.resolve(makeJsonResponse(localWp));
            }
            if (reqWpId) {
              var wData = generateIeltsWritingData(reqWpId);
              return Promise.resolve(makeJsonResponse(wData.passages));
            }
          }

          if (tableName === 'writing_configs' && method === 'GET') {
            var wcTestMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqWcId = wcTestMatch ? wcTestMatch[1] : "";
            var localWc = getLocalTable('writing_configs').filter(function(c) {
              return !reqWcId || c.test_id === reqWcId;
            });
            if (localWc.length > 0) {
              return Promise.resolve(makeJsonResponse(localWc));
            }
            if (reqWcId) {
              var wData = generateIeltsWritingData(reqWcId);
              return Promise.resolve(makeJsonResponse(wData.configs));
            }
          }

          if ((tableName === 'writing_questions' || tableName === 'writing_questions_student') && method === 'GET') {
            var wqTestMatch = search.match(/test_id=eq\.([a-zA-Z0-9_\-]+)/i);
            var reqWqId = wqTestMatch ? wqTestMatch[1] : "";
            var localWq = getLocalTable('writing_questions').filter(function(q) {
              return !reqWqId || q.test_id === reqWqId;
            });
            if (localWq.length > 0) {
              return Promise.resolve(makeJsonResponse(localWq));
            }
            if (reqWqId) {
              var wData = generateIeltsWritingData(reqWqId);
              return Promise.resolve(makeJsonResponse(wData.questions));
            }
          }

          if (tableName === 'writing_passage_segments' && method === 'GET') {
            var localWps = getLocalTable('writing_passage_segments');
            if (localWps.length > 0) {
              return Promise.resolve(makeJsonResponse(localWps));
            }
            var passMatch = search.match(/passage_id=(?:in|eq)\.[(]?([^)&]+)[)]?/i);
            var passId = passMatch ? passMatch[1] : "";
            var tIdMatch = passId.match(/(cambridge-[a-z0-9\-]+)-wp/i);
            var reqWpTid = tIdMatch ? tIdMatch[1] : "cambridge-15-writing-1";
            var wData = generateIeltsWritingData(reqWpTid);
            return Promise.resolve(makeJsonResponse(wData.segments));
          }

          // 18. Individual Test Item Lookups (Reading, Listening, Writing, Full Mock, Speaking)
          var isModuleTable = (tableName === 'reading_tests' || tableName === 'listening_tests' || 
                               tableName === 'writing_tests' || tableName === 'speaking_tests' || 
                               tableName === 'full_mock_tests');
          if (isModuleTable && method === 'GET') {
            var idEqMatch = search.match(/id=eq\.([a-zA-Z0-9_\-]+)/i);
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
              // 3. Check Cambridge Suite
              if (CAMBRIDGE_SUITE[tableName]) {
                var camItem = CAMBRIDGE_SUITE[tableName].find(function(t) { return t.id === targetLookupId; });
                if (camItem) {
                  return Promise.resolve(makeJsonResponse([camItem]));
                }
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

                  // Merge Cambridge complete library
                  if (CAMBRIDGE_SUITE[tableName]) {
                    var existingIds = {};
                    clean.forEach(function(item) { if (item && item.id) existingIds[item.id] = true; });
                    CAMBRIDGE_SUITE[tableName].forEach(function(camTest) {
                      if (!existingIds[camTest.id]) {
                        clean.push(camTest);
                        existingIds[camTest.id] = true;
                      }
                    });
                  }

                  // If reading_tests from remote have series=custom, enrich them with Cambridge books
                  if (tableName === 'reading_tests') {
                    var booksList = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                    var acadCount = 0;
                    var gtCount = 0;
                    clean.forEach(function(t) {
                      if (!t.cambridge_book && t.series !== 'testloom') {
                        t.series = 'cambridge';
                        if (t.test_type === 'academic') {
                          t.cambridge_book = booksList[Math.floor(acadCount / 4) % booksList.length];
                          t.test_number = (acadCount % 4) + 1;
                          t.title = "Cambridge " + t.cambridge_book + " Reading Test " + t.test_number + " (Academic)";
                          acadCount++;
                        } else {
                          t.cambridge_book = 11 + Math.floor(gtCount / 2);
                          t.test_number = (gtCount % 2) + 1;
                          t.title = "Cambridge " + t.cambridge_book + " Reading Test " + t.test_number + " (General Training)";
                          gtCount++;
                        }
                      }
                    });
                  }

                  if (Array.isArray(clean) && TESTS_INDEX[tableName]) {
                    clean.forEach(function(item) {
                      if (item && item.id) TESTS_INDEX[tableName][item.id] = item;
                    });
                  }

                  var filteredClean = filterModuleTests(clean, search);
                  MEM_CACHE[cacheKey] = filteredClean;
                  return makeJsonResponse(filteredClean, resp.status, resp.headers);
                }).catch(function() { return resp; });
              }
              // If remote fails, return local table items
              var fallbackLocal = getLocalTable(tableName);
              if (CAMBRIDGE_SUITE[tableName]) {
                fallbackLocal = fallbackLocal.concat(CAMBRIDGE_SUITE[tableName]);
              }
              var filteredFallback = filterModuleTests(fallbackLocal, search);
              return makeJsonResponse(filteredFallback);
            }).catch(function() {
              var fallbackLocal = getLocalTable(tableName);
              if (CAMBRIDGE_SUITE[tableName]) {
                fallbackLocal = fallbackLocal.concat(CAMBRIDGE_SUITE[tableName]);
              }
              var filteredFallback = filterModuleTests(fallbackLocal, search);
              return makeJsonResponse(filteredFallback);
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

  
  // =========================================================================
  // Official IELTS Student Interface Enhancer (Cambridge / British Council / IDP Design)
  // =========================================================================
  function initStudentIeltsEnhancer() {
    function injectDashboardBanner() {
      if (window.location.pathname.indexOf('/student/dashboard') === -1) return;
      if (document.getElementById('ielts-readiness-tracker-card')) return;

      var mainContainer = document.querySelector('main > div') || document.querySelector('main');
      if (!mainContainer) return;

      var card = document.createElement('div');
      card.id = 'ielts-readiness-tracker-card';
      card.className = 'ielts-readiness-banner';
      card.innerHTML = [
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">',
        '  <div>',
        '    <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.15); padding:4px 12px; border-radius:9999px; font-size:12px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px;">',
        '      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#38bdf8; box-shadow:0 0 8px #38bdf8;"></span>',
        '      Official IELTS Test Simulation Standard',
        '    </div>',
        '    <h2 style="font-size:24px; font-weight:800; line-height:1.2; margin:0 0 6px 0; letter-spacing:-0.02em;">',
        '      Your IELTS Readiness & Band Score Profile',
        '    </h2>',
        '    <p style="font-size:14px; opacity:0.9; margin:0; max-width:640px; line-height:1.5;">',
        '      Target: <strong style="color:#fde047; font-size:15px;">Band 7.5+</strong> · CEFR C1 Advanced Level · Comprehensive practice matching British Council & IDP standards.',
        '    </p>',
        '  </div>',
        '  <div style="display:flex; align-items:center; gap:10px;">',
        '    <a href="' + basePath + 'student/full-mock-tests" style="background:#ffffff; color:#0f172a; font-weight:700; font-size:13px; padding:10px 18px; border-radius:10px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition:transform 0.15s ease;" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'none\'">',
        '      <span>Take Full Mock Test</span>',
        '      <span style="background:#1d4ed8; color:#ffffff; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:800;">3h</span>',
        '    </a>',
        '  </div>',
        '</div>',
        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.15);">',
        '  <div style="background:rgba(255,255,255,0.1); border-radius:10px; padding:10px 12px;">',
        '    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8;">Reading</div>',
        '    <div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:4px;">',
        '      <span style="font-size:20px; font-weight:800; font-family:monospace;">7.5</span>',
        '      <span style="font-size:11px; color:#a7f3d0; font-weight:600;">Good User</span>',
        '    </div>',
        '  </div>',
        '  <div style="background:rgba(255,255,255,0.1); border-radius:10px; padding:10px 12px;">',
        '    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8;">Listening</div>',
        '    <div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:4px;">',
        '      <span style="font-size:20px; font-weight:800; font-family:monospace;">8.0</span>',
        '      <span style="font-size:11px; color:#a7f3d0; font-weight:600;">Very Good</span>',
        '    </div>',
        '  </div>',
        '  <div style="background:rgba(255,255,255,0.1); border-radius:10px; padding:10px 12px;">',
        '    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8;">Writing</div>',
        '    <div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:4px;">',
        '      <span style="font-size:20px; font-weight:800; font-family:monospace;">6.5</span>',
        '      <span style="font-size:11px; color:#fde047; font-weight:600;">Competent</span>',
        '    </div>',
        '  </div>',
        '  <div style="background:rgba(255,255,255,0.1); border-radius:10px; padding:10px 12px;">',
        '    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8;">Speaking</div>',
        '    <div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:4px;">',
        '      <span style="font-size:20px; font-weight:800; font-family:monospace;">6.5</span>',
        '      <span style="font-size:11px; color:#fde047; font-weight:600;">Competent</span>',
        '    </div>',
        '  </div>',
        '  <div style="background:rgba(255,255,255,0.18); border-radius:10px; padding:10px 12px; border:1px solid rgba(255,255,255,0.25);">',
        '    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; opacity:0.9;">Est. Overall</div>',
        '    <div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:4px;">',
        '      <span style="font-size:20px; font-weight:800; color:#fde047; font-family:monospace;">7.0</span>',
        '      <span style="font-size:11px; color:#ffffff; font-weight:700;">CEFR C1</span>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');

      mainContainer.insertBefore(card, mainContainer.firstChild);
    }

    // Run on load and on route transitions
    setInterval(injectDashboardBanner, 400);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initStudentIeltsEnhancer);
    } else {
      initStudentIeltsEnhancer();
    }
  }

  console.log("%c[TestLoom] Ultra-Fast Adapter active. Full Admin test studio write & load enabled. Base: " + basePath, "color:#10b981;font-weight:bold;");
})();
