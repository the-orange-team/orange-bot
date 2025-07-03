export interface Match {
    id: number;
    teamA: string;
    teamB: string;
    kickoff: string; // ISO string
}

export interface Prediction {
    user: string; // Slack user ID
    matchId: number;
    score: string; // e.g., "1-3"
}

export interface Score {
    user: string; // Slack user ID
    points: number;
}
