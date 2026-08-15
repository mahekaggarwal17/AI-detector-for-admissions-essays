"""Sample essays for interactive demonstration and benchmark testing. Includes:
1. Organic Ivy League Human Essay
2. Pure AI Generated Admissions Essay
3. AI-Polished Hybrid Essay (Paragraph machine edits)
4. ESL Student Human Essay (Non-native English writing)
5. Adversarial AI Essay (AI with prompt noise)
"""

SAMPLE_ESSAYS = [
    {
        "id": "human_1",
        "title": "Admitted Ivy League Essay: 'The 4:00 AM Bakery'",
        "category": "Organic Human",
        "expected_verdict": "Likely Human-Written",
        "description": "Raw, personal narrative with uneven sentence lengths, vivid sensory details, and organic conversational pacing.",
        "text": (
            "The smell of burnt sourdough at 4:00 AM is something you never quite get used to. "
            "For three summers, while my high school classmates were sleeping or studying for the SATs, "
            "I was dusting flour off my elbows and trying to fix a thirty-year-old Hobart commercial mixer. "
            "My grandfather bought that mixer in 1984. It makes a clanking noise like a rusty lawnmower every time you throw it into second gear. "
            "People asked why we didn't buy a new machine. The answer was simple: we couldn't afford one. "
            "So instead, I learned the anatomy of steel gears. I spent hours watching YouTube tutorials, grease smeared across my cheeks, "
            "figuring out how planetary gearboxes transfer torque. "
            "That bakery wasn't just a shop; it was an applied mechanics laboratory disguised as a flour mill. "
            "When the dough hook finally turned without screaming, I didn't just feel relief—I knew I wanted to be a mechanical engineer. "
            "Solving problems under pressure with limited resources isn't an abstract academic concept for me. "
            "It's what I did every morning before the sun came up."
        )
    },
    {
        "id": "ai_1",
        "title": "Pure GPT-4 Essay: 'Overcoming Adversity'",
        "category": "Pure AI-Generated",
        "expected_verdict": "Likely AI-Generated",
        "description": "Standard AI admissions prose featuring formulaic transitions, low perplexity, even sentence lengths, and heavy buzzwords.",
        "text": (
            "From a young age, I have always believed that life is a rich tapestry woven from challenges and triumphs. "
            "Growing up in a modest neighborhood, I faced numerous obstacles that tested my resolve and shaped my perspective on resilience. "
            "One pivotal moment in my life occurred during my junior year of high school when I was selected to lead our school's robotics team. "
            "This experience served as a powerful catalyst for personal growth, allowing me to cultivate a deep-seated passion for engineering. "
            "Nestled in the heart of our school workshop, I worked tirelessly to bridge the gap between theoretical knowledge and practical application. "
            "Furthermore, navigating the intricacies of team collaboration provided me with invaluable lessons in leadership and empathy. "
            "Overcoming these challenges played a pivotal role in refining my character and reinforcing my unwavering commitment to academic excellence. "
            "In conclusion, my journey has been a testament to the power of perseverance. "
            "I am eager to bring this multifaceted perspective and passion for innovation to the vibrant academic community at your esteemed institution."
        )
    },
    {
        "id": "hybrid_1",
        "title": "AI-Polished Hybrid Essay: 'The Biology Lab'",
        "category": "AI-Polished Hybrid",
        "expected_verdict": "Mixed / AI-Polished",
        "description": "A human-authored essay where the middle paragraphs were polished by ChatGPT for formal tone.",
        "text": (
            "I spent my tenth-grade summer counting dead fruit flies under a shaky microscope in room 204. "
            "My eyes ached every afternoon, but I couldn't stop looking at their tiny translucent wings. "
            "This experience served as a transformative journey into the realm of genetics, allowing me to delve into the complex mechanisms of heredity. "
            "Furthermore, analyzing phenotypic variations provided me with invaluable insights that underscored the importance of scientific rigor. "
            "It was a testament to how hands-on research can foster a deep-seated passion for cellular biology. "
            "Then one Tuesday, fly number 412 showed up with white eyes instead of red. I jumped out of my chair so fast I knocked over my water bottle. "
            "My advisor laughed, but that single mutation proved that the textbooks weren't just theoretical diagrams—they were describing real life right in front of me."
        )
    },
    {
        "id": "esl_1",
        "title": "ESL Student Essay: 'Immigrant Journey'",
        "category": "ESL Human (Non-Native)",
        "expected_verdict": "Likely Human-Written",
        "description": "Written by a non-native English applicant. Features simpler syntax and localized phrasing, protected by our ESL safeguard.",
        "text": (
            "When my family came to America from Vietnam in 2021, I could not speak good English. "
            "In school every day was very hard for me. The teacher talked very fast and I felt afraid to answer questions. "
            "My father told me every night: you must study hard and never give up. "
            "So I opened the dictionary every night and learned twenty new words. "
            "I joined the math club because numbers do not need English. Math became my quiet place. "
            "In math club, I helped other students with geometry problems on the whiteboard. "
            "Slowly, my friends helped me practice speaking English too. "
            "Now I am president of math club in my senior year. "
            "My language is not perfect yet, but my hard work and love for mathematics show who I really am."
        )
    },
    {
        "id": "adversarial_ai",
        "title": "Adversarial AI Essay: 'Prompted with Noise'",
        "category": "Adversarial AI",
        "expected_verdict": "Mixed / AI-Polished",
        "description": "An AI essay prompted to use informal language and sentence length variation. Still reveals structural signals.",
        "text": (
            "Yeah, so playing the cello wasn't really my idea at first. My mom basically forced me into it when I was seven years old. "
            "I hated the daily practice. It felt like a punishment. "
            "However, as time progressed, this challenging endeavor evolved into a profound vehicle for personal expression and discipline. "
            "Navigating the intricate fingerings of Bach suites allowed me to cultivate an unwavering commitment to musical craftsmanship. "
            "It was a turning point. Suddenly, the wood instrument wasn't an enemy anymore; it was an extensions of my own voice."
        )
    }
]
