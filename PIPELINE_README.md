# Bitcoin Education Pipeline System

## Overview

This automated pipeline system transforms your Bitcoin education workflow from manual to fully automated. The agents do the work while maintaining quality, brand consistency, and educational effectiveness.

## Quick Start

### One-Command Lesson Creation
```bash
npm run lesson:new
```
This runs the complete pipeline: brand learning → course building → revision → marketing → evaluation.

### Individual Pipeline Commands
```bash
npm run brand:learn    # Extract brand DNA from Canva/sources
npm run course:build   # Generate new lesson with simulations
npm run course:revise  # Readability pass + fact checking
npm run marketing:run  # Create platform hooks + micro-challenges
npm run eval:run       # Comprehensive quality evaluation
npm run export:pack    # Generate teacher/student materials
```

## Pipeline Architecture

```
[Sources] → [Brand Learning] → [Course Building] → [Course Revision] → [Marketing] → [Evaluation] → [Export]
    ↓              ↓                 ↓                 ↓               ↓            ↓           ↓
Canva/Web    Brand Profile    Lesson Drafts    Approved Lessons   Marketing    Quality     Final
Content      Templates        Simulations      [VERIFY] Tags      Assets       Reports     Materials
```

## Directory Structure

```
workspace/
├── brand/           # Brand profile and templates
├── drafts/         # Lessons needing revision
├── approved/       # Quality-verified lessons
├── marketing/      # Platform hooks and campaigns
├── eval/           # Quality evaluation reports
├── assets/         # Simulations and supporting files
└── exports/        # Final teacher/student materials
```

## Pipeline Details

### 1. Brand Learning (`brand:learn`)
**What it does:** Extracts your brand DNA from Canva designs and existing content
**Outputs:** `workspace/brand/brand_profile.json`
**Run when:** First time setup or brand updates

### 2. Course Building (`course:build`)
**What it does:** Generates lessons using personalized learning paths and interactive simulations
**Outputs:** Draft lessons in `workspace/drafts/`
**Uses:** LearningPathOptimizer, InteractiveSimulationEngine

### 3. Course Revision (`course:revise`)
**What it does:** Readability analysis, fact-checking with [VERIFY] flags, brand consistency
**Outputs:** Approved lessons in `workspace/approved/`
**Quality gates:** Readability ≥70, Accuracy ≥95%, Brand consistency ≥80%

### 4. Marketing Generation (`marketing:run`)
**What it does:** Creates platform-specific content + 2-3 micro-challenges per lesson
**Outputs:** Social media hooks, engagement campaigns in `workspace/marketing/`
**Platforms:** Twitter, LinkedIn, Instagram, YouTube

### 5. Evaluation (`eval:run`)
**What it does:** Comprehensive quality scoring and improvement recommendations
**Outputs:** Detailed reports in `workspace/eval/`
**Metrics:** Overall quality score, certification readiness, learner feedback simulation

### 6. Export Pack (`export:pack`)
**What it does:** Generates final teacher guides, student workbooks, and presentation slides
**Outputs:** PDF-ready materials in `workspace/exports/`
**Formats:** Teacher guides, student workbooks, presentation slides

## Configuration

Edit `config/app.config.json` to customize:

```json
{
  "sources": {
    "canva": { "enabled": true, "folders": ["YOUR_FOLDER_ID"] },
    "web": { "allow": ["your-trusted-sources.com"] }
  },
  "style_rules": {
    "readability_target_fk": 70,
    "brand_voice": "clear, simple, witty, no jargon",
    "bilingual": ["en", "es"]
  },
  "fact_rules": {
    "bitcoin_only": true,
    "must_cite": ["numbers", "laws", "dates", "security claims"]
  }
}
```

## Quality Standards

### Automatic Quality Gates
- **Readability:** Flesch-Kincaid ≥70 (appropriate for target audience)
- **Technical Accuracy:** ≥95% with cross-referenced sources
- **Brand Consistency:** ≥80% alignment with established voice
- **Learning Effectiveness:** Clear objectives, assessments, practical application
- **Fact Verification:** [VERIFY] flags on claims requiring citation

### Content Standards
- **Bitcoin-only focus** - no altcoins or misleading information
- **Security-first approach** - emphasis on safe learning environments
- **Practical application** - hands-on simulations and real-world examples
- **Accessibility** - appropriate for complete beginners
- **Bilingual support** - English and Spanish content options

## Workflow Examples

### Daily Content Creation
```bash
# Generate a new lesson
npm run course:build

# Review and revise
npm run course:revise

# Create marketing materials
npm run marketing:run

# Export for distribution
npm run export:pack
```

### Quality Improvement Cycle
```bash
# Run comprehensive evaluation
npm run eval:run

# Review reports in workspace/eval/
# Address recommendations

# Re-run revision pipeline
npm run course:revise

# Verify improvements
npm run eval:run
```

### Brand Update Workflow
```bash
# Update brand profile from latest Canva designs
npm run brand:learn

# Re-process existing content with new brand
npm run course:revise

# Regenerate marketing with updated voice
npm run marketing:run
```

## Agent Integration

The pipeline seamlessly integrates your 49 specialized agents:

### Core Pipeline Agents
- **EnhancedBrandAgent**: Brand consistency and style learning
- **MasterAccuracySystem**: Technical accuracy and fact-checking
- **LearningPathOptimizer**: Personalized educational experiences
- **InteractiveSimulationEngine**: Safe, hands-on practice environments
- **GamificationEngine**: Engagement and micro-challenges

### Supporting Agents
- **AccessibilityOptimizer**: WCAG compliance and inclusive design
- **MultilanguageCourseAdapter**: Bilingual content and cultural adaptation
- **EconomicModelingAgent**: Complex Bitcoin economic concepts
- **HistoryTimelineBuilder**: Historical context and narratives

## Error Handling

### Pipeline Failures
- **Brand profile missing**: Run `npm run brand:learn` first
- **No draft lessons**: Run `npm run course:build` to generate content
- **Quality gates failed**: Review recommendations in evaluation reports
- **Export issues**: Ensure approved lessons exist in `workspace/approved/`

### Recovery Commands
```bash
# Reset and start fresh
rm -rf workspace/
npm run lesson:new

# Skip brand learning if profile exists
npm run course:build

# Force revision without quality gates
npm run course:revise --skip-gates
```

## Customization

### Adding New Content Sources
1. Edit `config/app.config.json` sources section
2. Update brand learning pipeline to include new sources
3. Run `npm run brand:learn` to incorporate changes

### Modifying Quality Standards
1. Edit readability targets in config
2. Adjust accuracy thresholds in MasterAccuracySystem
3. Update brand consistency requirements

### Platform-Specific Marketing
1. Add new platform templates in marketing pipeline
2. Customize voice and format for each platform
3. Include platform-specific engagement strategies

## Monitoring and Analytics

### Pipeline Performance
- Track lesson creation time and quality scores
- Monitor approval rates and revision cycles
- Analyze learner engagement with marketing materials

### Quality Metrics
- Readability scores and trends
- Technical accuracy ratings
- Brand consistency measurements
- Learning effectiveness indicators

## Support and Development

### Getting Help
- Review pipeline logs for detailed error information
- Check `workspace/eval/` for quality improvement suggestions
- Examine individual agent outputs in respective directories

### Contributing Improvements
1. Test changes with individual pipeline commands
2. Run full pipeline with `npm run lesson:new`
3. Verify quality standards are maintained
4. Update documentation for new features

---

## Next Steps

1. **Setup**: Configure `config/app.config.json` with your sources
2. **Initialize**: Run `npm run lesson:new` to create your first automated lesson
3. **Review**: Examine outputs in `workspace/` directories
4. **Iterate**: Use individual commands for fine-tuning
5. **Scale**: Set up automated scheduling for continuous content creation

**The agents do the work. You focus on strategy and results.**