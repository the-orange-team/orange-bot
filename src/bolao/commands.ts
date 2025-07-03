import {
    App,
    ViewSubmitAction,
    SlackCommandMiddlewareArgs,
    ModalView,
    AllMiddlewareArgs,
} from '@slack/bolt';
import fs from 'fs';
import path from 'path';
import { Match, Prediction, Score } from './types';
import axios from 'axios';

const MATCHES_PATH = path.join(__dirname, 'matches.json');
const PREDICTIONS_PATH = path.join(__dirname, 'predictions.json');
const SCORES_PATH = path.join(__dirname, 'scores.json');
const MATCHES_CACHE_PATH = path.join(__dirname, 'matches-today.json');
const THESPORTSDB_API_KEY = '123';
const SCORED_MATCHES_PATH = path.join(__dirname, 'scoredMatches.json');

const COMPETITIONS = [
    { id: 4480, name: 'FIFA Club World Cup' },
    { id: 4424, name: 'Brasileirão Série A' },
    { id: 4481, name: 'Copa Libertadores' },
    { id: 4429, name: 'FIFA World Cup' },
    { id: 4482, name: 'UEFA Champions League' },
];

async function fetchTomorrowsMatchesAllCompetitions(): Promise<{ [comp: string]: Match[] }> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 10);
    const results: { [comp: string]: Match[] } = {};
    for (const comp of COMPETITIONS) {
        let allMatches: Match[] = [];
        const url = `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_API_KEY}/eventsday.php?d=${dateString}&l=${encodeURIComponent(
            comp.name
        )}`;
        try {
            const resp = await axios.get(url);
            if (resp.data && resp.data.events) {
                allMatches = allMatches.concat(
                    resp.data.events.map((e: any, idx: number) => ({
                        id: Number(e.idEvent) || idx + 1,
                        teamA: e.strHomeTeam,
                        teamB: e.strAwayTeam,
                        kickoff:
                            e.dateEvent &&
                            e.strTime &&
                            typeof e.strTime === 'string' &&
                            e.strTime.trim()
                                ? (() => {
                                      const time = e.strTime.trim();
                                      if (/^\d{2}:\d{2}$/.test(time)) {
                                          return `${e.dateEvent}T${time}:00Z`;
                                      } else if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
                                          return `${e.dateEvent}T${time}Z`;
                                      } else {
                                          return `${e.dateEvent}T00:00:00Z`;
                                      }
                                  })()
                                : e.dateEvent
                                ? `${e.dateEvent}T00:00:00Z`
                                : null,
                    }))
                );
            }
        } catch {
            // ignore errors for this date
        }
        results[comp.name] = allMatches;
    }
    return results;
}

function saveMatchesCache(matchesByComp: { [comp: string]: Match[] }) {
    fs.writeFileSync(MATCHES_CACHE_PATH, JSON.stringify({ matches: matchesByComp }, null, 2));
}

function loadMatchesCache(): { [comp: string]: Match[] } | null {
    if (fs.existsSync(MATCHES_CACHE_PATH)) {
        const data = fs.readFileSync(MATCHES_CACHE_PATH, 'utf8');
        return JSON.parse(data).matches;
    }
    return null;
}

function loadPredictions(): Prediction[] {
    const data = fs.readFileSync(PREDICTIONS_PATH, 'utf8');
    return JSON.parse(data).predictions;
}

function loadScores(): Score[] {
    const data = fs.readFileSync(SCORES_PATH, 'utf8');
    return JSON.parse(data).scores;
}

function savePredictions(predictions: Prediction[]) {
    fs.writeFileSync(PREDICTIONS_PATH, JSON.stringify({ predictions }, null, 2));
}

function saveScores(scores: Score[]) {
    fs.writeFileSync(SCORES_PATH, JSON.stringify({ scores }, null, 2));
}

function findMatch(teamA: string, teamB: string): Match | undefined {
    const matchesByComp = loadMatchesCache();
    if (!matchesByComp) return undefined;
    const matches = Object.values(matchesByComp).flat();
    return matches.find(
        (m: Match) =>
            m.teamA.toLowerCase() === teamA.toLowerCase() &&
            m.teamB.toLowerCase() === teamB.toLowerCase()
    );
}

function isLocked(match: Match): boolean {
    const kickoff = new Date(match.kickoff);
    const now = new Date();
    // Lock 10 minutes before kickoff (configurable)
    return now.getTime() > kickoff.getTime() - 10 * 60 * 1000;
}

function buildPredictionModalGrouped(matchesByComp: { [comp: string]: Match[] }): ModalView {
    const blocks: any[] = [];
    let hasMatches = false;
    for (const comp in matchesByComp) {
        const matches = matchesByComp[comp];
        if (!matches.length) continue;
        hasMatches = true;
        blocks.push({
            type: 'header',
            text: { type: 'plain_text', text: comp },
        });
        for (const match of matches) {
            blocks.push({
                type: 'input',
                block_id: `match_${match.id}`,
                label: {
                    type: 'plain_text',
                    text: `${match.teamA} vs ${match.teamB}`,
                },
                element: {
                    type: 'plain_text_input',
                    action_id: 'score',
                    placeholder: { type: 'plain_text', text: 'e.g. 1-3' },
                },
            });
        }
    }
    if (!hasMatches) {
        blocks.push({
            type: 'section',
            text: { type: 'plain_text', text: 'No matches available today.' },
        });
    }
    return {
        type: 'modal',
        callback_id: 'bolao_predict_modal',
        title: { type: 'plain_text', text: 'Bolão: Predict Scores' },
        submit: { type: 'plain_text', text: 'Submit' },
        close: { type: 'plain_text', text: 'Cancel' },
        blocks,
    } as ModalView;
}

function getScoredMatches(): number[] {
    if (!fs.existsSync(SCORED_MATCHES_PATH)) return [];
    const data = fs.readFileSync(SCORED_MATCHES_PATH, 'utf8');
    return JSON.parse(data).scored || [];
}

function markMatchAsScored(matchId: number) {
    const scored = getScoredMatches();
    if (!scored.includes(matchId)) {
        scored.push(matchId);
        fs.writeFileSync(SCORED_MATCHES_PATH, JSON.stringify({ scored }, null, 2));
    }
}

function formatMatchStatus(match: any): string {
    let status = '';
    if (match.strStatus === 'Match Finished') {
        status = `*Final*: ${match.intHomeScore}-${match.intAwayScore}`;
    } else if (match.strStatus && match.strStatus.toLowerCase().includes('half')) {
        status = `*Halftime*: ${match.intHomeScore}-${match.intAwayScore}`;
    } else if (match.strStatus && match.strStatus.toLowerCase().includes('live')) {
        status = `*Live*: ${match.intHomeScore}-${match.intAwayScore}`;
    } else if (match.strStatus && match.strStatus !== '') {
        status = `*${match.strStatus}*`;
    } else {
        if (match.kickoff) {
            const kickoffDate = new Date(match.kickoff);
            if (!isNaN(kickoffDate.getTime())) {
                const unixTimestamp = Math.floor(kickoffDate.getTime() / 1000);
                status = `*Scheduled* (<!date^${unixTimestamp}^{date_short_pretty} {time}|${kickoffDate.toUTCString()}>)`;
            } else {
                status = `*Scheduled* (Unknown time)`;
            }
        } else {
            status = `*Scheduled* (Unknown time)`;
        }
    }
    return `${match.teamA} vs ${match.teamB} — ${status}`;
}

export const bolaoCommandHandler = async ({
    command,
    ack,
    respond,
    client,
    body,
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs) => {
    await ack();
    const args = command.text.trim().split(/\s+/);
    const subcommand = args[0];
    if (subcommand === 'predict') {
        // 1. Open loading modal immediately
        const loadingModal: ModalView = {
            type: 'modal',
            callback_id: 'bolao_predict_modal_loading',
            title: { type: 'plain_text', text: 'Bolão: Predict Scores' },
            close: { type: 'plain_text', text: 'Cancel' },
            blocks: [{ type: 'section', text: { type: 'plain_text', text: 'Loading matches...' } }],
        };
        const openRes = await client.views.open({
            trigger_id: body.trigger_id,
            view: loadingModal,
        });
        // 2. Fetch matches for tomorrow in the background
        let matchesByComp: { [comp: string]: Match[] } = {};
        let allMatches: Match[] = [];
        let usedCache = false;
        try {
            matchesByComp = await fetchTomorrowsMatchesAllCompetitions();
            allMatches = Object.values(matchesByComp).flat();
            if (allMatches.length) {
                saveMatchesCache(matchesByComp);
            }
        } catch (err) {
            // On error, try cache
            const cached = loadMatchesCache();
            if (cached) {
                matchesByComp = cached;
                allMatches = Object.values(matchesByComp).flat();
                usedCache = true;
            }
        }
        if (!allMatches.length) {
            // Update modal to show no matches
            await client.views.update({
                view_id: openRes.view?.id,
                view: {
                    type: 'modal',
                    callback_id: 'bolao_predict_modal',
                    title: { type: 'plain_text', text: 'Bolão: Predict Scores' },
                    close: { type: 'plain_text', text: 'Cancel' },
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'plain_text',
                                text: 'No matches available for tomorrow.',
                            },
                        },
                    ],
                } as ModalView,
            });
            return;
        }
        // 3. Update the modal with the real matches
        await client.views.update({
            view_id: openRes.view?.id,
            view: buildPredictionModalGrouped(matchesByComp),
        });
        if (usedCache) {
            await respond(':warning: Using cached matches due to API error.');
        }
        return;
    }
    if (subcommand === 'results') {
        // Fetch all matches for tomorrow (raw, with status and scores)
        const matchesByComp = await fetchTomorrowsMatchesAllCompetitions();
        let blocks: any[] = [];
        let hasMatches = false;
        for (const comp in matchesByComp) {
            const matches = matchesByComp[comp];
            if (!matches.length) continue;
            hasMatches = true;
            blocks.push({ type: 'header', text: { type: 'plain_text', text: comp } });
            for (const match of matches as any[]) {
                blocks.push({
                    type: 'section',
                    text: { type: 'mrkdwn', text: formatMatchStatus(match) },
                });
            }
        }
        if (!hasMatches) {
            blocks = [{ type: 'section', text: { type: 'plain_text', text: 'No matches today.' } }];
        }
        await client.chat.postEphemeral({
            channel: command.channel_id,
            user: command.user_id,
            text: "Tomorrow's Football Results",
            blocks,
        });
        return;
    }
    switch (subcommand) {
        case 'leaderboard': {
            const scores = loadScores();
            if (scores.length === 0) {
                await respond('No scores yet.');
                break;
            }
            const sorted = scores.slice().sort((a, b) => b.points - a.points);
            let leaderboard = '🏆 Bolão Leaderboard:\n';
            for (let i = 0; i < sorted.length; i++) {
                const s = sorted[i];
                let displayName = s.user;
                try {
                    const userInfo = await client.users.info({ user: s.user });
                    displayName =
                        userInfo.user?.profile?.display_name || userInfo.user?.real_name || s.user;
                } catch {}
                leaderboard += `${i + 1}. ${displayName} – ${s.points} pts\n`;
            }
            await respond(leaderboard);
            break;
        }
        case 'refresh': {
            try {
                await fetchTomorrowsMatchesAllCompetitions();
                await respond("Fetched and cached today's matches from the API!");
            } catch (err) {
                await respond("Failed to fetch today's matches.");
            }
            break;
        }
        default:
            await respond('Usage: /bolao [predict|leaderboard|refresh|results] ...');
    }
};

export {
    fetchTomorrowsMatchesAllCompetitions as fetchTodaysMatchesAllCompetitions,
    saveMatchesCache,
    getScoredMatches,
    markMatchAsScored,
};
