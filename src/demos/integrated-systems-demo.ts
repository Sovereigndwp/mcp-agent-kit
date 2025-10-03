#!/usr/bin/env tsx

/**
 * Integrated Systems Demo
 *
 * Demonstrates all three new systems working together:
 * 1. Persona Selector
 * 2. Certification Engine
 * 3. White-Label System
 */

import { personaSelector, PERSONA_PROFILES } from '../utils/persona-selector.js';
import { certificationEngine, DEFAULT_ISSUER } from '../utils/certification-engine.js';
import { whiteLabelManager, EXAMPLE_TENANTS, WhiteLabelManager } from '../utils/white-label.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🎯 Integrated Systems Demo');
  console.log('═'.repeat(60));
  console.log('Demonstrating: Persona Selector + Certification + White-Label');
  console.log('');

  // Create demo output directory
  const demoDir = 'exports/integrated_systems_demo';
  mkdirSync(demoDir, { recursive: true });

  // ========================================
  // PART 1: Persona Selector
  // ========================================
  console.log('📋 PART 1: Persona Selector System');
  console.log('─'.repeat(60));

  // Show all available personas
  console.log('Available personas:');
  Object.values(PERSONA_PROFILES).forEach(persona => {
    console.log(`  ${getPersonaIcon(persona.id)} ${persona.name} - ${persona.description}`);
  });
  console.log('');

  // Simulate user selecting "student" persona
  personaSelector.setPersona('student');
  const studentProfile = personaSelector.getProfile();
  console.log(`✅ Selected persona: ${studentProfile!.name}`);
  console.log(`   Learning goals: ${studentProfile!.learningGoals.slice(0, 2).join(', ')}`);
  console.log(`   Preferred formats: ${studentProfile!.preferredFormats.join(', ')}`);
  console.log(`   Difficulty range: ${studentProfile!.difficultyRange.join(', ')}`);
  console.log('');

  // Generate persona selector HTML
  const personaSelectorHTML = personaSelector.generatePersonaSelectorHTML();
  writeFileSync(
    join(demoDir, 'persona_selector.html'),
    personaSelectorHTML
  );
  console.log(`✅ Generated: persona_selector.html`);
  console.log('');

  // ========================================
  // PART 2: White-Label System
  // ========================================
  console.log('🎨 PART 2: White-Label System');
  console.log('─'.repeat(60));

  // Register custom tenant for high school
  const highSchoolTenant = WhiteLabelManager.createTenantTemplate(
    'oakwood-high',
    'Oakwood High School Bitcoin Program',
    'bitcoin.oakwood.edu',
    '#3b82f6'
  );

  whiteLabelManager.registerTenant(highSchoolTenant);
  console.log(`✅ Registered tenant: ${highSchoolTenant.name}`);
  console.log(`   Domain: ${highSchoolTenant.domain}`);
  console.log(`   Primary color: ${highSchoolTenant.branding.colors.primary}`);
  console.log('');

  // Generate environment file for tenant
  const envFile = whiteLabelManager.generateEnvFile('oakwood-high');
  writeFileSync(join(demoDir, '.env.oakwood-high'), envFile);
  console.log(`✅ Generated: .env.oakwood-high`);
  console.log('');

  // Generate themed CSS
  whiteLabelManager.setActiveTenant('oakwood-high');
  const themedCSS = whiteLabelManager.generateThemeCSS('oakwood-high');
  writeFileSync(join(demoDir, 'oakwood-theme.css'), themedCSS);
  console.log(`✅ Generated: oakwood-theme.css`);
  console.log('');

  // ========================================
  // PART 3: Simulate Complete User Journey
  // ========================================
  console.log('🚀 PART 3: Complete User Journey');
  console.log('─'.repeat(60));

  // Student completes course
  console.log('Simulating student completing Bitcoin Fundamentals course...');

  const studentData = {
    name: 'Alex Martinez',
    email: 'alex.martinez@oakwood.edu',
    courseId: 'bitcoin-fundamentals',
    courseName: 'Bitcoin Fundamentals',
    assessments: [
      {
        assessmentId: 'quiz-1',
        assessmentName: 'Bitcoin Basics Quiz',
        score: 18,
        maxScore: 20,
        percentage: 90,
        passed: true,
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        assessmentId: 'quiz-2',
        assessmentName: 'Wallet Security Quiz',
        score: 23,
        maxScore: 25,
        percentage: 92,
        passed: true,
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        assessmentId: 'final-exam',
        assessmentName: 'Final Exam',
        score: 85,
        maxScore: 100,
        percentage: 85,
        passed: true,
        completedDate: new Date().toISOString()
      }
    ],
    totalHours: 12,
    skills: [
      'Bitcoin Basics',
      'Wallet Security',
      'Transaction Fees',
      'Network Fundamentals',
      'Private Keys'
    ]
  };

  console.log(`  Student: ${studentData.name}`);
  console.log(`  Course: ${studentData.courseName}`);
  console.log(`  Assessments passed: ${studentData.assessments.length}/3`);
  console.log(`  Study time: ${studentData.totalHours} hours`);
  console.log('');

  // Calculate final score
  const finalScore = Math.round(
    studentData.assessments.reduce((sum, a) => sum + a.percentage, 0) / studentData.assessments.length
  );

  console.log(`  Final score: ${finalScore}%`);
  console.log('');

  // ========================================
  // PART 4: Certificate Issuance
  // ========================================
  console.log('📜 PART 4: Certificate Issuance');
  console.log('─'.repeat(60));

  // Issue certificate
  const certificate = certificationEngine.issueCertificate({
    recipientName: studentData.name,
    recipientEmail: studentData.email,
    type: 'course-completion',
    title: `${studentData.courseName} - Certificate of Completion`,
    description: `Has successfully completed ${studentData.courseName} with a final score of ${finalScore}%, demonstrating proficiency in Bitcoin fundamentals, wallet security, and network operations.`,
    achievement: {
      courseId: studentData.courseId,
      courseName: studentData.courseName,
      level: 'beginner',
      skills: studentData.skills,
      assessments: studentData.assessments,
      totalHours: studentData.totalHours,
      finalScore: finalScore
    },
    expiresInDays: 365 * 2 // Valid for 2 years
  });

  console.log(`✅ Certificate issued!`);
  console.log(`   ID: ${certificate.id}`);
  console.log(`   Recipient: ${certificate.recipientName}`);
  console.log(`   Level: ${certificate.achievement.level.toUpperCase()}`);
  console.log(`   Skills: ${certificate.achievement.skills.length} skills mastered`);
  console.log(`   Verification hash: ${certificate.verification.certificateHash.substring(0, 32)}...`);
  console.log('');

  // Generate certificate HTML
  const certificateHTML = certificationEngine.generateCertificateHTML(certificate);
  writeFileSync(join(demoDir, 'certificate.html'), certificateHTML);
  console.log(`✅ Generated: certificate.html`);
  console.log('');

  // Generate verification page
  const verificationHTML = certificationEngine.generateVerificationPageHTML();
  writeFileSync(join(demoDir, 'verify_certificate.html'), verificationHTML);
  console.log(`✅ Generated: verify_certificate.html`);
  console.log('');

  // Verify certificate
  console.log('Verifying certificate...');
  const verification = certificationEngine.verifyCertificate(certificate.id);
  if (verification.valid) {
    console.log('✅ Certificate verification: VALID');
  } else {
    console.log(`❌ Certificate verification: INVALID (${verification.reason})`);
  }
  console.log('');

  // ========================================
  // PART 5: White-Labeled Certificate
  // ========================================
  console.log('🎨 PART 5: Tenant-Branded Certificate Page');
  console.log('─'.repeat(60));

  // Wrap certificate in tenant-branded template
  const brandedCertificatePage = whiteLabelManager.generateTenantHTML(
    'oakwood-high',
    `
    <div class="certificate-container" style="max-width: 1000px; margin: 40px auto; padding: 20px;">
        <h1 style="text-align: center; color: var(--brand-primary); margin-bottom: 30px;">
            🎓 Student Achievement
        </h1>

        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <iframe src="certificate.html" style="width: 100%; height: 800px; border: none;"></iframe>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <button class="btn-primary" style="padding: 15px 30px; font-size: 1.1em; border-radius: 8px; cursor: pointer;">
                Download Certificate
            </button>
            <button class="btn-secondary" style="padding: 15px 30px; font-size: 1.1em; border-radius: 8px; cursor: pointer; margin-left: 10px;">
                Share on Social Media
            </button>
        </div>

        <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: var(--brand-primary); margin-bottom: 15px;">Next Steps</h3>
            <ul style="line-height: 2;">
                <li>Continue learning with Intermediate Bitcoin Concepts</li>
                <li>Join the Oakwood Bitcoin Club</li>
                <li>Participate in the Student Bitcoin Summit</li>
                <li>Explore career opportunities in Bitcoin</li>
            </ul>
        </div>
    </div>
    `
  );

  writeFileSync(join(demoDir, 'branded_certificate_page.html'), brandedCertificatePage);
  console.log(`✅ Generated: branded_certificate_page.html`);
  console.log('');

  // ========================================
  // PART 6: Multi-Persona Dashboard
  // ========================================
  console.log('📊 PART 6: Multi-Persona Dashboard');
  console.log('─'.repeat(60));

  // Generate dashboard showing personalization for each persona
  const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitcoin Sovereign Academy - Multi-Persona Demo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #f7931a;
            margin-bottom: 10px;
        }

        .persona-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .persona-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .persona-card h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.3em;
        }

        .persona-card ul {
            list-style: none;
            padding: 0;
        }

        .persona-card li {
            padding: 8px 0;
            color: #666;
            border-bottom: 1px solid #f0f0f0;
        }

        .persona-card li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
        }

        .badge {
            background: #f7931a;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            margin-left: 8px;
        }

        .stats {
            background: white;
            padding: 30px;
            border-radius: 15px;
            margin-top: 30px;
        }

        .stats h2 {
            color: #f7931a;
            margin-bottom: 20px;
        }

        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .stat-item {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #f7931a;
        }

        .stat-label {
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>₿ Bitcoin Sovereign Academy</h1>
            <p>Integrated Systems Demo - Persona Selector + Certification + White-Label</p>
        </div>

        <div class="persona-grid">
            ${Object.values(PERSONA_PROFILES).map(persona => `
                <div class="persona-card">
                    <h3>${getPersonaIcon(persona.id)} ${persona.name}</h3>
                    <p style="color: #666; margin-bottom: 15px;">${persona.description}</p>
                    <ul>
                        <li>Level: <span class="badge">${persona.technicalLevel}</span></li>
                        <li>Time: <span class="badge">${persona.timeCommitment}</span></li>
                        <li>Formats: ${persona.preferredFormats.slice(0, 3).join(', ')}</li>
                    </ul>
                </div>
            `).join('')}
        </div>

        <div class="stats">
            <h2>System Capabilities</h2>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${Object.keys(PERSONA_PROFILES).length}</div>
                    <div class="stat-label">Personas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">5</div>
                    <div class="stat-label">Certification Levels</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Object.keys(EXAMPLE_TENANTS).length}</div>
                    <div class="stat-label">Example Tenants</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">100%</div>
                    <div class="stat-label">Privacy Compliant</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

  writeFileSync(join(demoDir, 'multi_persona_dashboard.html'), dashboardHTML);
  console.log(`✅ Generated: multi_persona_dashboard.html`);
  console.log('');

  // ========================================
  // Summary
  // ========================================
  console.log('🎉 DEMO COMPLETE!');
  console.log('═'.repeat(60));
  console.log('Generated files in:', demoDir);
  console.log('');
  console.log('Files created:');
  console.log('  1. persona_selector.html - Interactive persona selector UI');
  console.log('  2. certificate.html - Professional certificate design');
  console.log('  3. verify_certificate.html - Certificate verification page');
  console.log('  4. branded_certificate_page.html - Tenant-branded certificate');
  console.log('  5. multi_persona_dashboard.html - All personas overview');
  console.log('  6. .env.oakwood-high - Tenant environment config');
  console.log('  7. oakwood-theme.css - Tenant-specific CSS theme');
  console.log('');
  console.log('Key Achievements:');
  console.log('  ✅ Persona system: 8 distinct user personas with personalization');
  console.log('  ✅ Certification: Full certificate lifecycle (issue, verify, share)');
  console.log('  ✅ White-label: Multi-tenant support with theming');
  console.log('  ✅ Integration: All three systems working together seamlessly');
  console.log('');
  console.log(`Open files in browser:`);
  console.log(`  file://${join(process.cwd(), demoDir)}/multi_persona_dashboard.html`);
}

function getPersonaIcon(persona: string): string {
  const icons: Record<string, string> = {
    student: '🎓',
    parent: '👨‍👩‍👧',
    policymaker: '⚖️',
    educator: '👨‍🏫',
    entrepreneur: '💼',
    investor: '📈',
    developer: '💻',
    journalist: '📰'
  };
  return icons[persona] || '👤';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
