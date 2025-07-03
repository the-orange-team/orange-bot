import { scheduleFreeGamesJob } from './free-epic-games';
import { CronJob } from 'cron';
import {
    fetchTodaysMatchesAllCompetitions,
    saveMatchesCache,
    getScoredMatches,
    markMatchAsScored,
} from '../bolao/commands';
import { scorePrediction } from '../bolao/scoring';
import fs from 'fs';
import path from 'path';
import { Score } from '../bolao/types';
import { App } from '@slack/bolt';

const PREDICTIONS_PATH = path.join(__dirname, '../bolao/predictions.json');
const SCORES_PATH = path.join(__dirname, '../bolao/scores.json');
const ANNOUNCE_CHANNEL = 'C5HRT2Q9H';

function loadPredictions() {
    const data = fs.readFileSync(PREDICTIONS_PATH, 'utf8');
    return JSON.parse(data).predictions;
}

function saveScores(scores: Score[]) {
    fs.writeFileSync(SCORES_PATH, JSON.stringify({ scores }, null, 2));
}

function loadScores(): Score[] {
    const data = fs.readFileSync(SCORES_PATH, 'utf8');
    return JSON.parse(data).scores;
}

export async function initializeCronJobs(app?: App) {
    await scheduleFreeGamesJob();

    // At midnight UTC, fetch and cache today's matches, and schedule polling if matches exist
    new CronJob(
        '0 0 * * *', // every day at midnight UTC
        async () => {
            try {
                const matchesByComp = await fetchTodaysMatchesAllCompetitions();
                saveMatchesCache(matchesByComp);
                const allMatches = Object.values(matchesByComp).flat();
                if (!allMatches.length) return;
                // Announce matches 10 minutes before kickoff
                for (const match of allMatches) {
                    if (!match.kickoff) continue;
                    const kickoffTime = new Date(match.kickoff).getTime();
                    const now = Date.now();
                    const msUntilAnnounce = kickoffTime - 10 * 60 * 1000 - now;
                    if (msUntilAnnounce > 0) {
                        setTimeout(async () => {
                            if (app) {
                                await app.client.chat.postMessage({
                                    channel: ANNOUNCE_CHANNEL,
                                    text: `:soccer: *${match.teamA} vs ${match.teamB}* is about to begin! (<${match.kickoff}|Kickoff>)`,
                                });
                            }
                        }, msUntilAnnounce);
                    }
                }
                // Find first and last kickoff
                const kickoffs = allMatches
                    .map((m) => new Date(m.kickoff).getTime())
                    .sort((a, b) => a - b);
                const firstKickoff = kickoffs[0];
                const lastKickoff = kickoffs[kickoffs.length - 1];
                const now = Date.now();
                const msUntilFirst = Math.max(0, firstKickoff - now);
                // Schedule polling to start at first match kickoff
                setTimeout(() => {
                    const poll = setInterval(async () => {
                        const matchesByCompPoll = await fetchTodaysMatchesAllCompetitions();
                        const allMatchesPoll = Object.values(matchesByCompPoll).flat();
                        const scored = getScoredMatches();
                        let allFinished = true;
                        for (const match of allMatchesPoll as any[]) {
                            // Only score if match is finished and not already scored
                            if (
                                match.kickoff &&
                                match.strStatus === 'Match Finished' &&
                                !scored.includes(match.id)
                            ) {
                                // Get actual score
                                const actualScore = `${match.intHomeScore}-${match.intAwayScore}`;
                                // Score all predictions for this match
                                const predictions = loadPredictions().filter(
                                    (p: any) => p.matchId === match.id
                                );
                                let scores = loadScores();
                                for (const pred of predictions) {
                                    const pts = scorePrediction(pred.score, actualScore);
                                    let userScore = scores.find((s: Score) => s.user === pred.user);
                                    if (!userScore) {
                                        userScore = { user: pred.user, points: 0 };
                                        scores.push(userScore);
                                    }
                                    userScore.points += pts;
                                }
                                saveScores(scores);
                                markMatchAsScored(match.id);
                            }
                            if (match.strStatus !== 'Match Finished') {
                                allFinished = false;
                            }
                        }
                        // Stop polling if all matches are finished and scored
                        if (allFinished) {
                            clearInterval(poll);
                        }
                    }, 60 * 60 * 1000); // every hour
                }, msUntilFirst);
            } catch (err) {
                console.error("[Bolao] Failed to cache today's matches or schedule polling:", err);
            }
        },
        null,
        true,
        'UTC'
    );
}
