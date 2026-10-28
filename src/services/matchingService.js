/**
 * Simulated AI matching service.
 * In a real application, this would call a backend vector search or semantic similarity API.
 * The UI is decoupled from the actual implementation via this service wrapper.
 */
export const matchingService = {
  findMatches: (item, allItems) => {
    if (!item) return [];

    const targetType = item.type === "lost" ? "found" : "lost";

    // Filter items of the opposite type that are not already resolved or returned
    const candidates = allItems.filter(candidate =>
      candidate.type === targetType &&
      candidate.status !== "Returned" &&
      candidate.status !== "Resolved" &&
      candidate.id !== item.id
    );

    const matches = candidates.map(candidate => {
      let score = 0;

      // 1. Category match (Highest weight: 40%)
      if (candidate.category && item.category && candidate.category.toLowerCase() === item.category.toLowerCase()) {
        score += 40;
      }

      // 2. Brand match (Weight: 20%)
      if (candidate.brand && item.brand && candidate.brand.toLowerCase().trim() !== "" && item.brand.toLowerCase().trim() !== "") {
        if (candidate.brand.toLowerCase() === item.brand.toLowerCase() ||
          candidate.name.toLowerCase().includes(item.brand.toLowerCase()) ||
          item.name.toLowerCase().includes(candidate.brand.toLowerCase())) {
          score += 20;
        }
      }

      // 3. Location match (Weight: 15%)
      if (candidate.location && item.location && candidate.location.toLowerCase() === item.location.toLowerCase()) {
        score += 15;
      }

      // 4. Color match (Weight: 15%)
      if (candidate.color && item.color && candidate.color.toLowerCase() === item.color.toLowerCase()) {
        score += 15;
      }

      // 5. Text name overlap match (Weight: 10%)
      const itemWords = item.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const candidateWords = candidate.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);

      let wordOverlap = 0;
      itemWords.forEach(w => {
        if (candidateWords.includes(w)) wordOverlap++;
      });

      if (wordOverlap > 0) {
        score += Math.min(10, wordOverlap * 5);
      }

      // Add a slight randomized variation based on item id hash to make scores feel natural and not completely round numbers
      const hash = [...(candidate.id || "")].reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const variance = (hash % 7) - 3; // -3% to +3%
      score = Math.max(10, Math.min(99, score + variance));

      return {
        item: candidate,
        score: Math.round(score)
      };
    });

    // Sort by score descending and filter out poor matches (< 30%)
    return matches
      .filter(m => m.score >= 30)
      .sort((a, b) => b.score - a.score);
  }
};
