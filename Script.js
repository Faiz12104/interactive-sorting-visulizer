"use strict";

// --- Helper Class ---
class Helper {
    constructor(time, container) {
        this.time = parseInt(400/time);
        this.container = container;
        this.list = container.querySelectorAll(".cell");
        this.comparisonCount = 0;
        this.swapCount = 0;
        this.compsSpan = container.parentElement.querySelector('.comps');
        this.swapsSpan = container.parentElement.querySelector('.swaps');
    }

    mark = async (index) => { if(this.list[index]) this.list[index].className = "cell current"; }
    markSpl = async (index) => { if(this.list[index]) this.list[index].className = "cell min"; }
    unmark = async (index) => { if(this.list[index]) this.list[index].className = "cell"; }
    
    pause = async() => new Promise(resolve => setTimeout(resolve, this.time));

    compare = async (index1, index2) => {
        await this.pause();
        if(!this.list[index1] || !this.list[index2]) return false;
        this.comparisonCount++;
        if(this.compsSpan) this.compsSpan.textContent = this.comparisonCount;
        let value1 = Number(this.list[index1].getAttribute("value"));
        let value2 = Number(this.list[index2].getAttribute("value"));
        return value1 > value2;
    }

    swap = async (index1, index2) => {
        await this.pause();
        if(!this.list[index1] || !this.list[index2]) return;
        this.swapCount++;
        if(this.swapsSpan) this.swapsSpan.textContent = this.swapCount;
        let value1 = this.list[index1].getAttribute("value");
        let value2 = this.list[index2].getAttribute("value");
        this.list[index1].setAttribute("value", value2);
        this.list[index1].style.height = `${3.8*value2}px`;
        this.list[index2].setAttribute("value", value1);
        this.list[index2].style.height = `${3.8*value1}px`;
        
        let val1Span = this.list[index1].querySelector('.cell-value');
        let val2Span = this.list[index2].querySelector('.cell-value');
        if(val1Span) val1Span.textContent = value2;
        if(val2Span) val2Span.textContent = value1;
    }
};

// --- Sorting Algorithms Class ---
class sortAlgorithms {
    constructor(time, container) {
        this.container = container;
        this.list = this.container.querySelectorAll(".cell");
        this.size = this.list.length;
        this.time = time;
        this.help = new Helper(this.time, this.container);
    }

    finishSort = async (timeComplexity) => {
        for (let counter = 0; counter < this.size; ++counter) {
            this.list[counter].className = "cell done";
        }
        if (!isComparisonMode) {
            document.getElementById('time').innerHTML = timeComplexity;
            document.querySelector(".footer > p").style.visibility = "visible";
            document.getElementById('status-message').textContent = "Successfully Sorted!";
            await updateExplanation(`Sorting complete. Final time complexity: ${timeComplexity}.`);
        }
    }

    run = async (algoValue) => {
        const algoMap = {
            1: this.BubbleSort, 2: this.SelectionSort, 3: this.InsertionSort,
            4: this.MergeSort, 5: this.QuickSort
        };
        if (algoMap[algoValue]) {
            await algoMap[algoValue]();
        }
        return true;
    }

    BubbleSort = async () => {
        for (let i = 0; i < this.size - 1; ++i) {
            for (let j = 0; j < this.size - i - 1; ++j) {
                await this.help.mark(j);
                await this.help.mark(j + 1);
                let val1 = Number(this.list[j].getAttribute("value"));
                let val2 = Number(this.list[j+1].getAttribute("value"));
                await updateExplanation(`Bubble Sort: Comparing ${val1} and ${val2}.`);
                if (await this.help.compare(j, j + 1)) {
                    await updateExplanation(`Since ${val1} > ${val2}, swapping them.`);
                    await this.help.swap(j, j + 1);
                }
                await this.help.unmark(j);
                await this.help.unmark(j + 1);
            }
            this.list[this.size - i - 1].className = "cell done";
        }
        await this.finishSort("O(n^2)");
    }

    SelectionSort = async () => {
        for (let i = 0; i < this.size; ++i) {
            let minIndex = i;
            await updateExplanation(`Finding minimum from index ${i}. Current min: ${this.list[minIndex].getAttribute("value")}.`);
            await this.help.markSpl(minIndex);
            for (let j = i + 1; j < this.size; ++j) {
                await this.help.mark(j);
                if (await this.help.compare(minIndex, j)) {
                    await updateExplanation(`Found new minimum: ${this.list[j].getAttribute("value")}.`);
                    await this.help.unmark(minIndex);
                    minIndex = j;
                    await this.help.markSpl(minIndex);
                }
                await this.help.unmark(j);
            }
            if(minIndex !== i) {
                await updateExplanation(`Swapping minimum (${this.list[minIndex].getAttribute("value")}) with element at index ${i} (${this.list[i].getAttribute("value")}).`);
                await this.help.swap(minIndex, i);
            }
            this.list[i].className = "cell done";
        }
        await this.finishSort("O(n^2)");
    }
    
    InsertionSort = async () => {
        for (let i = 1; i < this.size; ++i) {
            let j = i - 1;
            let key = Number(this.list[i].getAttribute("value"));
            await updateExplanation(`Picking key ${key}. Comparing with elements to its left.`);
            await this.help.mark(i);
            while (j >= 0 && Number(this.list[j].getAttribute("value")) > key) {
                await updateExplanation(`Shifting ${this.list[j].getAttribute("value")} to the right.`);
                await this.help.mark(j);
                this.list[j+1].setAttribute("value", this.list[j].getAttribute("value"));
                this.list[j+1].style.height = this.list[j].style.height;
                this.list[j+1].querySelector('.cell-value').textContent = this.list[j].getAttribute("value");
                await this.help.pause();
                await this.help.unmark(j);
                j -= 1;
            }
            await updateExplanation(`Placing key ${key} at its correct sorted position.`);
            this.list[j+1].setAttribute("value", key);
            this.list[j+1].style.height = `${3.8 * key}px`;
            this.list[j+1].querySelector('.cell-value').textContent = key;
            await this.help.unmark(i);
        }
        await this.finishSort("O(n^2)");
    }

    MergeSort = async () => {
        await updateExplanation("Merge Sort: Dividing the array into smaller sub-arrays.");
        await this.MergeDivider(0, this.size - 1);
        await this.finishSort("O(n log n)");
    }

    MergeDivider = async (start, end) => {
        if (start < end) {
            let mid = start + Math.floor((end - start) / 2);
            await this.MergeDivider(start, mid);
            await this.MergeDivider(mid + 1, end);
            await updateExplanation(`Merging sub-arrays from index ${start} to ${end}.`);
            await this.Merge(start, mid, end);
        }
    }

    Merge = async (start, mid, end) => {
        let newList = [];
        let frontcounter = start;
        let midcounter = mid + 1;
        while (frontcounter <= mid && midcounter <= end) {
            await this.help.mark(frontcounter);
            await this.help.mark(midcounter);
            let fvalue = Number(this.list[frontcounter].getAttribute("value"));
            let svalue = Number(this.list[midcounter].getAttribute("value"));
            if (fvalue >= svalue) {
                newList.push(svalue);
                midcounter++;
            } else {
                newList.push(fvalue);
                frontcounter++;
            }
            await this.help.unmark(frontcounter);
            await this.help.unmark(midcounter);
        }
        while (frontcounter <= mid) newList.push(Number(this.list[frontcounter++].getAttribute("value")));
        while (midcounter <= end) newList.push(Number(this.list[midcounter++].getAttribute("value")));

        for (let c = start, p = 0; c <= end; c++, p++) {
            this.list[c].setAttribute("value", newList[p]);
            this.list[c].style.height = `${3.8 * newList[p]}px`;
            this.list[c].querySelector('.cell-value').textContent = newList[p];
            await this.help.mark(c);
            await this.help.pause();
            await this.help.unmark(c);
        }
    }

    QuickSort = async () => {
        await updateExplanation("Quick Sort: Partitioning the array around a pivot.");
        await this.QuickDivider(0, this.size - 1);
        await this.finishSort("O(n log n)");
    }

    QuickDivider = async (start, end) => {
        if (start < end) {
            let pivotIndex = await this.Partition(start, end);
            await this.QuickDivider(start, pivotIndex - 1);
            await this.QuickDivider(pivotIndex + 1, end);
        }
    }

    Partition = async (start, end) => {
        let pivot = Number(this.list[end].getAttribute("value"));
        await updateExplanation(`Choosing pivot ${pivot} (at index ${end}).`);
        let prev_index = start - 1;
        await this.help.markSpl(end);
        for (let c = start; c < end; ++c) {
            await this.help.mark(c);
            if (Number(this.list[c].getAttribute("value")) < pivot) {
                prev_index++;
                await this.help.swap(c, prev_index);
            }
            await this.help.unmark(c);
        }
        await updateExplanation(`Placing pivot ${pivot} at its final sorted position (index ${prev_index + 1}).`);
        await this.help.swap(prev_index + 1, end);
        await this.help.unmark(end);
        return prev_index + 1;
    }
};

// --- Main Application Logic ---
"use strict";

let isSorting = false;
let isComparisonMode = false;
let masterList = [];

// UI Elements
const sortBtn = document.getElementById('sort-btn');
const resetBtn = document.getElementById('reset');
const generateBtn = document.getElementById('generate-array');
const algoMenu = document.querySelector('.algo-menu');
const sizeMenu = document.querySelector('.size-menu');
const speedMenu = document.querySelector('.speed-menu');
const inputMenu = document.querySelector('.input');
const scenarioMenu = document.querySelector('.scenario-menu');
const inputBoxParent = document.querySelector('.inputBoxParent');
const numbersContainer = document.getElementById('numbers-container');
const numbersDisplay = document.getElementById('numbers-display');
const statusMessage = document.getElementById('status-message');
const explanationToggle = document.getElementById('show-explanation');
const explanationContainer = document.getElementById('explanation-container');
const comparisonModeToggle = document.getElementById('comparison-mode');
const singleView = document.getElementById('single-view-container');
const comparisonView = document.getElementById('comparison-view-container');
const singleAlgoControls = document.getElementById('single-algo-controls');
const comparisonAlgoControls = document.getElementById('comparison-algo-controls');

const toggleControls = (disabled) => {
    isSorting = disabled;
    sortBtn.classList.toggle('disabled', disabled);
    generateBtn.classList.toggle('disabled', disabled);
    if(!isComparisonMode) algoMenu.disabled = disabled;
    else document.querySelectorAll('.algo-menu-comparison').forEach(s => s.disabled = disabled);
    sizeMenu.disabled = disabled;
    speedMenu.disabled = disabled;
    inputMenu.disabled = disabled;
    scenarioMenu.disabled = disabled;
    comparisonModeToggle.disabled = disabled;
};

const start = async () => {
  if(isSorting) return;
  statusMessage.textContent = 'Sorting...';
  clearExplanation();
  document.querySelector(".footer > p").style.visibility = "hidden";
  
  let speedValue = Number(speedMenu.value) || 1;
  let now = new Date();
  
  toggleControls(true);

  if (isComparisonMode) {
      if (masterList.length === 0) {
          alert("Please generate an array first.");
          toggleControls(false);
          statusMessage.textContent = '';
          return;
      }
      const algoSelectors = document.querySelectorAll('.algo-menu-comparison');
      const algo1Value = Number(algoSelectors[0].value);
      const algo2Value = Number(algoSelectors[1].value);
      
      if (algo1Value === algo2Value) {
          alert("Please select two different algorithms for comparison.");
          toggleControls(false);
          statusMessage.textContent = '';
          return;
      }

      const view1 = document.querySelector('#view1 .array');
      const view2 = document.querySelector('#view2 .array');

      const sorter1 = new sortAlgorithms(speedValue, view1);
      const sorter2 = new sortAlgorithms(speedValue, view2);

      await Promise.all([sorter1.run(algo1Value), sorter2.run(algo2Value)]);
      statusMessage.textContent = "Comparison Complete!";

  } else {
      let algoValue = Number(algoMenu.value);
      if (algoValue === 0) {
        alert("Please select an algorithm.");
        statusMessage.textContent = '';
        toggleControls(false);
        return;
      }
      const singleArrayContainer = document.querySelector('#single-view-container .array');
      let algorithm = new sortAlgorithms(speedValue, singleArrayContainer);
      if (algorithm.size === 0) {
          alert("Please generate an array first.");
          toggleControls(false);
          statusMessage.textContent = '';
          return;
      }
      await algorithm.run(algoValue);
  }

  let now1 = new Date();
  document.getElementById('Ttime').innerHTML = ((now1 - now) / 1000).toFixed(2);
  
  if(isSorting) {
      toggleControls(false);
  }
};

const RenderInput = async () => {
  if(isSorting) return;
  let inputType = inputMenu.value;
  if(inputType === 'Y'){
    inputBoxParent.style.display = 'block';
    numbersContainer.style.display = 'none';
    scenarioMenu.disabled = true;
    sizeMenu.disabled = true;
    await clearScreen();
  } else {
    inputBoxParent.style.display = 'none';
    numbersContainer.style.display = 'block';
    scenarioMenu.disabled = false;
    sizeMenu.disabled = false;
    await RenderList();
  }
};

const RenderList = async () => {
  let sizeValue = Number(sizeMenu.value);
  if (sizeValue === 0 && inputMenu.value !== 'Y') {
      sizeValue = 50; 
  }
  await clearScreen();
  
  masterList = await generateList(sizeValue);
  
  const containers = isComparisonMode 
    ? [document.querySelector('#view1 .array'), document.querySelector('#view2 .array')]
    : [document.querySelector('#single-view-container .array')];

  containers.forEach(container => {
    if (!container) return;
    container.innerHTML = '';
    const showValues = masterList.length <= 40;
    masterList.forEach(element => {
        const node = document.createElement("div");
        node.className = "cell";
        node.setAttribute("value", String(element));
        node.style.height = `${3.8 * element}px`;

        const valueNode = document.createElement('span');
        valueNode.className = 'cell-value';
        valueNode.textContent = element;
        if(showValues) valueNode.style.display = 'block';
        
        node.appendChild(valueNode);
        container.appendChild(node);
    });
  });
};

const generateList = async (Length) => {
  let list = [];
  let scenario = scenarioMenu.value;
  if (scenario === '0') scenario = 'random';

  const lowerBound = 5;
  const upperBound = 100;
  
  if (inputMenu.value === "Y") {
    let inpBox = document.querySelector(".inputBox");
    let inputReceived = inpBox.value;
    if(inputReceived.trim() !== ''){
        list = inputReceived.split(',')
            .map(num => parseInt(num.trim()))
            .filter(num => !isNaN(num) && num >= 1 && num <= 100) 
            .slice(0, 100);
    }
  } else {
    let baseList = [];
    for (let i = 0; i < Length; i++) {
        baseList.push(Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound);
    }
    switch(scenario) {
        case 'random': list = baseList; break;
        case 'nearly-sorted':
            list = baseList.sort((a, b) => a - b);
            for(let k = 0; k < Math.floor(Length / 10); k++) {
                let i = Math.floor(Math.random() * Length);
                let j = Math.floor(Math.random() * Length);
                [list[i], list[j]] = [list[j], list[i]];
            }
            break;
        case 'reversed': list = baseList.sort((a, b) => b - a); break;
        case 'few-unique':
            const uniqueValues = [10, 25, 40, 55, 70, 85];
            for (let i = 0; i < Length; i++) {
                list.push(uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
            }
            break;
    }
    numbersContainer.style.display = 'block';
    numbersDisplay.textContent = list.join(', ');
  }
  return list;
};

const clearScreen = async () => {
  document.querySelectorAll(".array").forEach(arr => arr.innerHTML = "");
  statusMessage.textContent = "";
  document.querySelector(".footer > p").style.visibility = "hidden";
  document.querySelectorAll('.comps, .swaps').forEach(s => s.textContent = '0');
  clearExplanation();
};

const softReset = async () => {
    if (isSorting) return;

    const allBars = document.querySelectorAll('.cell');
    if (allBars.length > 0) {
        allBars.forEach(bar => {
            bar.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out';
            bar.style.height = '0px';
            const valueSpan = bar.querySelector('.cell-value');
            if (valueSpan) {
                valueSpan.style.opacity = '0';
            }
        });
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    await clearScreen();
    toggleControls(false);

    [algoMenu, sizeMenu, speedMenu, inputMenu, scenarioMenu].forEach(menu => {
        menu.selectedIndex = 0;
    });

    inputBoxParent.style.display = 'none';
    document.getElementById('inputArr').value = '';
    numbersContainer.style.display = 'block';
    scenarioMenu.disabled = false;
    sizeMenu.disabled = false;

    await RenderList();
};

const updateExplanation = async (text) => {
    if (explanationToggle.checked) {
        explanationContainer.style.display = 'block';
        document.getElementById('explanation-text').textContent = text;
        await new Promise(resolve => setTimeout(resolve, 1)); // Force repaint
    }
};

const clearExplanation = () => {
    document.getElementById('explanation-text').textContent = '';
};

// --- Event Listeners ---
sortBtn.addEventListener("click", start);
resetBtn.addEventListener("click", softReset);
generateBtn.addEventListener("click", RenderList);
sizeMenu.addEventListener("change", RenderList);
scenarioMenu.addEventListener("change", RenderList);
inputMenu.addEventListener("change", RenderInput);

explanationToggle.addEventListener('change', (e) => {
    explanationContainer.style.display = e.target.checked ? 'block' : 'none';
    if (e.target.checked) {
        updateExplanation("Explanation panel enabled. Start a sort to see real-time updates.");
    }
});

comparisonModeToggle.addEventListener('change', (e) => {
    isComparisonMode = e.target.checked;
    singleView.style.display = isComparisonMode ? 'none' : 'flex';
    comparisonView.style.display = isComparisonMode ? 'flex' : 'none';
    singleAlgoControls.style.display = isComparisonMode ? 'none' : 'inline-block';
    comparisonAlgoControls.style.display = isComparisonMode ? 'inline-block' : 'none';
    explanationToggle.checked = false;
    explanationToggle.disabled = isComparisonMode;
    explanationContainer.style.display = 'none';
    RenderList();
});

