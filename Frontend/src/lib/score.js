export function scoreBand(score) {
    return score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'
}

export function scoreSummary(score) {
    if (score >= 80) return 'A strong match for this role.'
    if (score >= 60) return 'A good match, with a few gaps to close.'
    if (score >= 40) return 'A partial match. Focus on the gaps below.'
    return 'A stretch. The gaps below matter most.'
}
