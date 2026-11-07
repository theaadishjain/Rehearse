// Example plans shown on the landing page. Clearly labelled as examples in the UI.
export const EXAMPLES = [
    {
        id: "engineering",
        label: "Engineering",
        role: "Frontend Engineer, Payments",
        score: 72,
        questionNumber: 3,
        question: "Walk me through how you'd make a checkout form accessible.",
        why: "They want proof you've shipped accessible UI, not just read about it.",
        how: "Name concrete techniques: labels, focus order, announced errors. Then give one real example.",
        gaps: [
            { skill: "Payment provider APIs", severity: "high" },
            { skill: "End-to-end testing", severity: "medium" },
        ],
    },
    {
        id: "product",
        label: "Product",
        role: "Product Manager, Growth",
        score: 64,
        questionNumber: 5,
        question: "Tell me about a feature you decided not to build. How did you decide?",
        why: "They want to see you make hard calls with evidence, not just ship more.",
        how: "Pick a real example. Say what the data showed, who disagreed, and what happened afterwards.",
        gaps: [
            { skill: "Experiment design", severity: "high" },
            { skill: "SQL for self-serve analysis", severity: "medium" },
        ],
    },
    {
        id: "sales",
        label: "Sales",
        role: "Account Executive, Mid-Market",
        score: 81,
        questionNumber: 2,
        question: "How would you run a discovery call with a new lead?",
        why: "They're checking whether you listen before you pitch.",
        how: "Describe your structure: goals, current setup, pain, budget, timeline. Mention one question you always ask.",
        gaps: [
            { skill: "Deals with several decision-makers", severity: "medium" },
            { skill: "CRM reporting", severity: "low" },
        ],
    },
]
