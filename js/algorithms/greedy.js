/**
 * Greedy Interval Scheduling Algorithm
 * Refactored for file:// support
 */
(function (global) {
    global.AppAlgorithms = {
        /**
         * Selects the maximum number of non-overlapping intervals.
         */
        maximizeNonOverlappingIntervals(intervals) {
            if (!intervals || intervals.length === 0) {
                return { selected: [], rejected: [] };
            }

            // 1. Sort by End Time ASC, then Start Time ASC
            const sorted = [...intervals].sort((a, b) => {
                if (a.end !== b.end) {
                    return a.end - b.end;
                }
                return a.start - b.start;
            });

            const selected = [];
            const rejected = [];
            let lastEnd = -Infinity;

            // 2. Greedy Selection
            for (const interval of sorted) {
                // "Back-to-back intervals ARE allowed" -> start >= lastEnd
                if (interval.start >= lastEnd) {
                    selected.push(interval);
                    lastEnd = interval.end;
                } else {
                    rejected.push(interval);
                }
            }

            return { selected, rejected };
        }
    };
})(window);
