const { test } = require("node:test")
const assert = require("node:assert/strict")
const cleanReport = require("../src/utils/cleanReport")

const question = { question: "Q", intention: "I", answer: "A" }

test("incomplete items from the AI are dropped instead of failing the save", () => {
    const report = cleanReport({
        title: "  ",
        matchScore: 104.6,
        technicalQuestions: [ question, { ...question, answer: "" } ],
        behavioralQuestions: [ { ...question, question: " " }, question ],
        skillGaps: [ { skill: "", severity: "low" }, { skill: "SQL", severity: "high" } ],
        preparationPlan: [
            { day: 1, focus: "Basics", tasks: [ "Read", "", "  " ] },
            { day: 2, focus: "", tasks: [ "Practise" ] }
        ]
    })

    assert.equal(report.title, "Interview plan")
    assert.equal(report.matchScore, 100)
    assert.deepEqual(report.technicalQuestions, [ question ])
    assert.deepEqual(report.behavioralQuestions, [ question ])
    assert.deepEqual(report.skillGaps, [ { skill: "SQL", severity: "high" } ])
    assert.deepEqual(report.preparationPlan, [ { day: 1, focus: "Basics", tasks: [ "Read" ] } ])
})

test("a complete report is kept as it is", () => {
    const input = {
        title: "Backend Engineer",
        matchScore: 72,
        technicalQuestions: [ question ],
        behavioralQuestions: [ question ],
        skillGaps: [ { skill: "Kubernetes", severity: "medium" } ],
        preparationPlan: [ { day: 1, focus: "Databases", tasks: [ "Read about indexes" ] } ]
    }
    assert.deepEqual(cleanReport(input), input)
})
