const fs = require("fs");

//#region JSON
const loadData = () => {
  if (!fs.existsSync("endic_short.json")) {
    return [];
  }
  const data = fs.readFileSync("endic_short.json");
  return JSON.parse(data);
};
const saveData = (data) => {
  fs.writeFileSync("endic_short.json", JSON.stringify(data, null, 2));
};
//#endregion

//#region Tree Nodes
class BTreeNode {
  constructor(isLeaf = false) {
    this.isLeaf = isLeaf;
    this.keys = [];
    this.children = [];
  }
}
//#endregion

//#region Tree
class BPlusTree {
  constructor(order = 4) {
    this.root = new BTreeNode(true);
    this.order = order;
  }

  // Search
  search(key, node = this.root) {
    key = key.toLowerCase();

    let i = 0;
    while (i < node.keys.length && key > node.keys[i].Word) {
      i++;
    }

    if (node.isLeaf) {
      if (i < node.keys.length && node.keys[i].Word === key) {
        return node.keys[i].Meaning;
      }
      return null;
    }

    return this.search(key, node.children[i]);
  }

  // Insert
  insert(word, meaning) {
    const newEntry = { Word: word.toLowerCase(), Meaning: meaning }; // Normalize the word
    const root = this.root;

    if (root.keys.length === this.order - 1) {
      const newRoot = new BTreeNode(false);
      newRoot.children.push(this.root);
      this.split(newRoot, 0, this.root);
      this.root = newRoot;
    }

    this.insertNonFull(this.root, newEntry);
  }

  insertNonFull(node, entry) {
    let i = node.keys.length - 1;

    if (node.isLeaf) {
      while (i >= 0 && entry.Word < node.keys[i].Word) {
        i--;
      }
      node.keys.splice(i + 1, 0, entry);
    } else {
      while (i >= 0 && entry.Word < node.keys[i].Word) {
        i--;
      }
      i++;

      if (node.children[i].keys.length === this.order - 1) {
        this.split(node, i, node.children[i]);
        if (entry.Word > node.keys[i].Word) {
          i++;
        }
      }

      this.insertNonFull(node.children[i], entry);
    }
  }

  // Split
  split(parent, index, node) {
    const mid = Math.floor(this.order / 2);
    const rightNode = new BTreeNode(node.isLeaf);

    rightNode.keys = node.keys.splice(mid);
    if (!node.isLeaf) {
      rightNode.children = node.children.splice(mid);
    }

    parent.keys.splice(index, 0, node.keys.pop());
    parent.children.splice(index + 1, 0, rightNode);
  }

  // Display
  display(node = this.root, level = 0) {
    console.log(
      `Level ${level}:`,
      node.keys.map((key) => key.Word)
    );
    if (!node.isLeaf) {
      for (let child of node.children) {
        this.display(child, level + 1);
      }
    }
  }
}
//#endregion

//#region Main
const main = () => {
  const tree = new BPlusTree(4);
  let data = loadData();

  // Insert all preloaded data into the tree
  data.forEach((entry) => tree.insert(entry.Word, entry.Meaning));

  const prompt = require("prompt-sync")();
  while (true) {
    console.log("\nChoose an option:");
    console.log("1. Insert a new word");
    console.log("2. Search for a word");
    console.log("3. View the entire B+ Tree");
    console.log("4. Exit");

    const choice = prompt("Enter your choice: ");

    switch (choice) {
      case "1": {
        const word = prompt("Enter the word: ");
        const meaning = prompt("Enter the meaning: ");

        // Check if the word already exists
        if (tree.search(word)) {
          console.log(`The word "${word}" already exists in the dictionary.`);
        } else {
          tree.insert(word, meaning);
          data.push({ Word: word.toLowerCase(), Meaning: meaning }); // Normalize to lowercase
          saveData(data); // Save updated data to file
          console.log(`The word "${word}" has been added to the dictionary.`);
        }
        break;
      }

      case "2": {
        const searchWord = prompt("Enter the word to search: ");
        const result = tree.search(searchWord);
        if (result) {
          console.log(`Meaning of "${searchWord}": ${result}`);
        } else {
          console.log(`"${searchWord}" not found in the dictionary.`);
        }
        break;
      }

      case "3": {
        console.log("B+ Tree:");
        tree.display();
        break;
      }

      case "4":
        console.log("Exiting...");
        return;

      default:
        console.log("Invalid choice. Try again!");
    }
  }
};
//#endregion

main();
