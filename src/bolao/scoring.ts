import { Match, Prediction } from './types';

/**
 * Returns points for a prediction given the actual score.
 * @param predicted e.g. "1-3"
 * @param actual e.g. "1-3"
 */
export function scorePrediction(predicted: string, actual: string): number {
    if (predicted === actual) return 5;
    const [pa, pb] = predicted.split('-').map(Number);
    const [aa, ab] = actual.split('-').map(Number);
    if ((pa > pb && aa > ab) || (pa < pb && aa < ab) || (pa === pb && aa === ab)) {
        return 2;
    }
    return 0;
}
