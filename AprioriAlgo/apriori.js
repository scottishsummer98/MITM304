//#region Predefined Datasets
const transactions = [
  ["I1", "I2", "I5"],
  ["I2", "I4"],
  ["I2", "I3"],
  ["I1", "I2", "I4"],
  ["I1", "I3"],
  ["I2", "I3"],
  ["I1", "I3"],
  ["I1", "I2", "I3", "I5"],
  ["I1", "I2", "I3"],
];
const minSupport = 2;
//#endregion

//#region Counting support of candidate items in transactions
function countSupport(transactions, candidates) {
  const counts = new Map();

  candidates.forEach((candidate) => {
    transactions.forEach((transaction) => {
      if (candidate.every((item) => transaction.includes(item))) {
        const key = candidate.join(",");
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    });
  });

  return counts;
}
//#endregion

//#region  Generate candidate itemsets of size k from frequent (k-1)-itemsets
function aprioriGen(frequentItemsets) {
  const candidates = [];
  const items = [...frequentItemsets];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const itemset1 = items[i].split(",");
      const itemset2 = items[j].split(",");

      // Join step: Combine two itemsets if they differ by only the last item
      if (itemset1.slice(0, -1).join(",") === itemset2.slice(0, -1).join(",")) {
        const candidate = [...new Set([...itemset1, ...itemset2])].sort();
        if (!hasInfrequentSubset(candidate, frequentItemsets)) {
          candidates.push(candidate);
        }
      }
    }
  }

  return candidates;
}
//#endregion
//#region  Check if a candidate itemset has any infrequent subset
function hasInfrequentSubset(candidate, frequentItemsets) {
  const subsets = getSubsets(candidate, candidate.length - 1);
  return subsets.some((subset) => !frequentItemsets.has(subset.join(",")));
}
//#endregion

//#region  Generate all subsets of a given size
function getSubsets(array, size) {
  const subsets = [];
  const recurse = (start, subset) => {
    if (subset.length === size) {
      subsets.push([...subset]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      subset.push(array[i]);
      recurse(i + 1, subset);
      subset.pop();
    }
  };
  recurse(0, []);
  return subsets;
}
//#endregion

//#region  Apriori Algorithm
function apriori(transactions, minSupport) {
  const allFrequentItemsets = [];
  let frequentItemsets = new Map();

  // Step 1: Generate frequent 1-itemsets
  const items = [...new Set(transactions.flat())];
  const candidates = items.map((item) => [item]);
  const counts = countSupport(transactions, candidates);

  counts.forEach((count, key) => {
    if (count >= minSupport) {
      frequentItemsets.set(key, count);
    }
  });

  // Collect frequent itemsets for level 1
  allFrequentItemsets.push(frequentItemsets);

  // Step 2: Iteratively generate candidates and find frequent itemsets
  let k = 2;
  while (frequentItemsets.size > 0) {
    const previousFrequentItemsets = new Set(frequentItemsets.keys());
    const candidates = aprioriGen(previousFrequentItemsets);

    frequentItemsets = new Map();
    const counts = countSupport(transactions, candidates);

    counts.forEach((count, key) => {
      if (count >= minSupport) {
        frequentItemsets.set(key, count);
      }
    });

    if (frequentItemsets.size > 0) {
      allFrequentItemsets.push(frequentItemsets);
    }
    k++;
  }

  return allFrequentItemsets;
}
//#endregion

//#region Executable
const results = apriori(transactions, minSupport);

console.log("Frequent Itemsets:");
results.forEach((level, index) => {
  console.log(`Level ${index + 1}:`);
  level.forEach((count, itemset) => {
    console.log(`  ${itemset}: ${count}`);
  });
});
//#endregion
