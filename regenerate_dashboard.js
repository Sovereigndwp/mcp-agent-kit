#!/usr/bin/env node

/**
 * Regenerate dashboard with analytics and A/B testing
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read existing demo report
const reportPath = 'exports/complete_system_demo/interactive_demo_report.json';
const report = JSON.parse(readFileSync(reportPath, 'utf-8'));

// Generate dashboard HTML with analytics
const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitcoin Education Platform - Interactive Demo</title>

    <!-- Plausible Analytics - Privacy-friendly, GDPR compliant -->
    <script defer data-domain="bitcoinsovereign.academy" src="https://plausible.io/js/script.js"></script>

    <!-- A/B Testing Framework -->
    <script>
(function() {
  // A/B Test: CTA Button Color Test
  const TEST_ID = 'cta-button-color';
  const STORAGE_KEY = 'btc_academy_ab_tests';

  function getStoredTests() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  function storeTestAssignment(testId, variantId) {
    try {
      const tests = getStoredTests();
      tests[testId] = {
        variantId: variantId,
        assignedAt: Date.now(),
        sessionId: getSessionId()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    } catch (e) {
      console.error('Failed to store A/B test assignment:', e);
    }
  }

  function getSessionId() {
    let sessionId = sessionStorage.getItem('btc_academy_session');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('btc_academy_session', sessionId);
    }
    return sessionId;
  }

  function selectVariant(variants) {
    const random = Math.random();
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant;
      }
    }

    return variants[variants.length - 1];
  }

  function trackEvent(eventName, props) {
    if (window.plausible) {
      window.plausible(eventName, { props: props });
    }
  }

  // Check existing assignment
  const stored = getStoredTests();
  let variant;

  if (stored[TEST_ID]) {
    const variantId = stored[TEST_ID].variantId;
    variant = [{"variantId":"control","variantName":"Control (A)","weight":0.5,"config":{"color":"orange","bgColor":"#f7931a"}},{"variantId":"variant","variantName":"Variant (B)","weight":0.5,"config":{"color":"blue","bgColor":"#3b82f6"}}].find(v => v.variantId === variantId);
  }

  // Assign new variant if needed
  if (!variant) {
    // Check traffic allocation
    if (Math.random() > 1) {
      return; // User not in test
    }

    variant = selectVariant([{"variantId":"control","variantName":"Control (A)","weight":0.5,"config":{"color":"orange","bgColor":"#f7931a"}},{"variantId":"variant","variantName":"Variant (B)","weight":0.5,"config":{"color":"blue","bgColor":"#3b82f6"}}]);
    storeTestAssignment(TEST_ID, variant.variantId);

    // Track assignment
    trackEvent('AB_Test_Assignment', {
      test: TEST_ID,
      variant: variant.variantId
    });
  }

  // Apply variant configuration
  window.ABTest_cta_button_color = {
    variant: variant.variantId,
    config: variant.config,
    trackConversion: function(eventName, metadata) {
      trackEvent('AB_Test_Conversion', {
        test: TEST_ID,
        variant: variant.variantId,
        event: eventName,
        ...metadata
      });
    }
  };

  // Expose configuration
  console.log('[A/B Test] Active variant:', variant.variantId, variant.config);
})();
    </script>

    <!-- Event Tracking -->
    <script>
// Event Tracking Utility
window.bitcoinAcademyTracker = {
  track: function(eventName, metadata) {
    if (window.plausible) {
      if (metadata) {
        window.plausible(eventName, { props: metadata });
      } else {
        window.plausible(eventName);
      }
    }
    console.log('[Event]', eventName, metadata);
  },

  // Quick tracking methods
  trackCourseStart: function(courseId, courseName, difficulty) {
    this.track('Course_Started', {
      course_id: courseId,
      course_name: courseName,
      difficulty: difficulty
    });
  },

  trackLessonComplete: function(lessonId, lessonName, timeSpent) {
    this.track('Lesson_Completed', {
      lesson_id: lessonId,
      lesson_name: lessonName,
      time_spent_seconds: timeSpent
    });
  },

  trackAssessmentComplete: function(assessmentId, score, totalPoints, passed) {
    this.track('Assessment_Completed', {
      assessment_id: assessmentId,
      score: score,
      total_points: totalPoints,
      percentage: Math.round((score / totalPoints) * 100),
      passed: passed ? 'yes' : 'no'
    });
  },

  trackToolUsage: function(toolName, action) {
    this.track('Tool_Used', {
      tool: toolName,
      action: action
    });
  },

  trackCTAClick: function(ctaName, location) {
    this.track('CTA_Click', {
      cta: ctaName,
      location: location
    });
  },

  trackVideoPlay: function(videoId, videoTitle) {
    this.track('Video_Play', {
      video_id: videoId,
      video_title: videoTitle
    });
  },

  trackDownload: function(fileName, fileType) {
    this.track('Download', {
      file_name: fileName,
      file_type: fileType
    });
  }
};

// Auto-track outbound links
document.addEventListener('click', function(e) {
  var link = e.target.closest('a');
  if (link && link.hostname !== window.location.hostname) {
    window.bitcoinAcademyTracker.track('Outbound_Link', {
      url: link.href,
      text: link.textContent || link.innerText
    });
  }
});

// Auto-track video plays
document.addEventListener('play', function(e) {
  if (e.target.tagName === 'VIDEO') {
    var video = e.target;
    window.bitcoinAcademyTracker.trackVideoPlay(
      video.id || 'unnamed',
      video.title || video.src
    );
  }
}, true);

console.log('✅ Event tracking initialized');
    </script>

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        .header h1 {
            color: #f7931a;
            font-size: 2.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        .analytics-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            display: inline-block;
            margin-top: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.2s ease;
            cursor: pointer;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-card h3 { color: #f7931a; margin-bottom: 15px; font-size: 1.2em; }
        .big-number { font-size: 2.5em; font-weight: bold; color: #333; margin-bottom: 5px; }
        .tools-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        .tool-card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .tool-card:hover { border-color: #f7931a; transform: translateY(-1px); }
        .cta-section {
            background: #f7931a;
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin-top: 30px;
        }
        .cta-button {
            background: white;
            color: #f7931a;
            padding: 12px 30px;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            margin: 10px;
        }
        .cta-button:hover {
            background: #f0f0f0;
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span>₿</span>
                Bitcoin Sovereign Academy
                <span>⚡</span>
            </h1>
            <p style="font-size: 1.2em; color: #666; margin-top: 10px;">
                Interactive Learning Dashboard
            </p>
            <div class="analytics-badge">
                ✅ Analytics Active · Privacy-First · GDPR Compliant
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>🎓 Learning Progress</h3>
                <div class="big-number">NOVICE</div>
                <p>Mastery Level</p>
            </div>

            <div class="stat-card">
                <h3>⏱️ Study Time</h3>
                <div class="big-number">0.62</div>
                <p>Hours Completed</p>
            </div>

            <div class="stat-card">
                <h3>🎯 Assessment Score</h3>
                <div class="big-number">88%</div>
                <p>Latest Performance</p>
            </div>

            <div class="stat-card">
                <h3>🔥 Learning Streak</h3>
                <div class="big-number">1</div>
                <p>Days Active</p>
            </div>
        </div>

        <div class="tools-section">
            <h2 style="color: #f7931a; margin-bottom: 25px; text-align: center;">🛠️ Interactive Learning Tools</h2>

            <div class="tool-card" onclick="trackToolClick('fee-calculator')">
                <h3>⚡ Real-Time Fee Calculator</h3>
                <p>Calculate Bitcoin transaction fees using live network data</p>
            </div>

            <div class="tool-card" onclick="trackToolClick('mempool-visualizer')">
                <h3>📊 Mempool Congestion Visualizer</h3>
                <p>Understand how network congestion affects transaction fees</p>
            </div>

            <div class="tool-card" onclick="trackToolClick('wallet-security-simulator')">
                <h3>🔐 Wallet Security Simulator</h3>
                <p>Practice Bitcoin security best practices in a safe environment</p>
            </div>
        </div>

        <div class="cta-section" id="cta-section">
            <h2 style="margin-bottom: 15px;">🚀 Ready to Start Learning?</h2>
            <p style="margin-bottom: 25px; font-size: 1.1em;">
                Experience the future of Bitcoin education with our interactive, data-driven learning platform
            </p>
            <button class="cta-button" id="cta-button-primary" onclick="trackCTAClick('course-materials')">
                📚 Access Course Materials
            </button>
            <button class="cta-button" onclick="trackCTAClick('view-courses')">
                🎓 View Full Courses
            </button>
            <button class="cta-button" onclick="trackCTAClick('continue-learning')">
                📈 Continue Learning
            </button>
        </div>
    </div>

    <script>
        // Track page view
        if (window.bitcoinAcademyTracker) {
            window.bitcoinAcademyTracker.track('Page_View', {
                page: 'interactive_dashboard',
                category: 'demo'
            });
        }

        // Apply A/B test variant styling
        window.addEventListener('load', () => {
            if (window.ABTest_cta_button_color) {
                const variant = window.ABTest_cta_button_color;
                const ctaSection = document.getElementById('cta-section');

                if (variant.config.bgColor) {
                    ctaSection.style.background = variant.config.bgColor;
                }

                console.log('✅ A/B Test Applied:', variant.variant, variant.config);
            }
        });

        // Track tool interactions
        function trackToolClick(toolName) {
            if (window.bitcoinAcademyTracker) {
                window.bitcoinAcademyTracker.trackToolUsage(toolName, 'click');
            }
            alert('🎓 Tool: ' + toolName + ' - Would open interactive tool interface');
        }

        // Track CTA clicks
        function trackCTAClick(action) {
            // Track conversion in A/B test
            if (window.ABTest_cta_button_color) {
                window.ABTest_cta_button_color.trackConversion('cta_click', { action: action });
            }

            // Track with event tracker
            if (window.bitcoinAcademyTracker) {
                window.bitcoinAcademyTracker.trackCTAClick(action, 'dashboard');
            }

            // Show success message
            alert('🎉 Great choice! Action: ' + action);
        }

        // Track stat card interactions
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                const cardTitle = card.querySelector('h3').textContent;
                if (window.bitcoinAcademyTracker) {
                    window.bitcoinAcademyTracker.track('User_Engagement', {
                        action: 'click',
                        element: 'stat_card',
                        card_title: cardTitle
                    });
                }

                console.log('📊 Clicked:', cardTitle);
            });
        });

        console.log('🎉 Bitcoin Sovereign Academy Dashboard Loaded!');
        console.log('✅ Plausible Analytics Active');
        console.log('✅ A/B Testing Active');
        console.log('✅ Event Tracking Active');
    </script>
</body>
</html>`;

// Write updated dashboard
const dashboardPath = 'exports/complete_system_demo/interactive_dashboard.html';
writeFileSync(dashboardPath, dashboardHtml);

console.log('✅ Dashboard regenerated with analytics!');
console.log('📁 Location:', dashboardPath);
console.log('');
console.log('🌐 Open in browser:');
console.log('   file://' + join(process.cwd(), dashboardPath));
console.log('');
console.log('✨ Features enabled:');
console.log('   ✅ Plausible Analytics (bitcoinsovereign.academy)');
console.log('   ✅ A/B Testing (CTA button color: Orange vs Blue)');
console.log('   ✅ Event Tracking (Page views, clicks, conversions)');
console.log('   ✅ Privacy-compliant (No cookies, No PII)');
