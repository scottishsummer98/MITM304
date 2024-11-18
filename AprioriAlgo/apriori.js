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
const minConfidence = 0.5;
//#endregion

//#region Helper functions
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

function aprioriGen(frequentItemsets) {
  const candidates = [];
  const items = [...frequentItemsets];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const itemset1 = items[i].split(",");
      const itemset2 = items[j].split(",");
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

function hasInfrequentSubset(candidate, frequentItemsets) {
  const subsets = getSubsets(candidate, candidate.length - 1);
  return subsets.some((subset) => !frequentItemsets.has(subset.join(",")));
}

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

function calculateConfidence(allFrequentItemsets) {
  const rules = [];
  allFrequentItemsets.forEach((level) => {
    level.forEach((support, itemset) => {
      const items = itemset.split(",");
      const subsets = getSubsets(items, items.length - 1);

      subsets.forEach((subset) => {
        const subsetKey = subset.join(",");
        const subsetSupport =
          allFrequentItemsets[subset.length - 1]?.get(subsetKey);
        if (subsetSupport) {
          const confidence = support / subsetSupport;
          if (confidence >= minConfidence) {
            rules.push({
              rule: `${subsetKey} => ${items
                .filter((item) => !subset.includes(item))
                .join(",")}`,
              confidence: confidence.toFixed(2),
            });
          }
        }
      });
    });
  });
  return rules;
}
//#endregion

//#region main function and executable
function main(transactions, minSupport) {
  const allFrequentItemsets = [];
  let frequentItemsets = new Map();

  const items = [...new Set(transactions.flat())];
  const candidates = items.map((item) => [item]);
  const counts = countSupport(transactions, candidates);

  counts.forEach((count, key) => {
    if (count >= minSupport) {
      frequentItemsets.set(key, count);
    }
  });
  allFrequentItemsets.push(frequentItemsets);

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

  const rules = calculateConfidence(allFrequentItemsets);

  return { allFrequentItemsets, rules };
}

const results = main(transactions, minSupport);

console.log("Frequent Itemsets:");
results.allFrequentItemsets.forEach((level, index) => {
  console.log(`Level ${index + 1}:`);
  level.forEach((count, itemset) => {
    console.log(`  ${itemset}: ${count}`);
  });
});

console.log("\nAssociation Rules:");
results.rules.forEach((rule) => {
  console.log(`${rule.rule} (Confidence: ${rule.confidence})`);
});
//#endregion
