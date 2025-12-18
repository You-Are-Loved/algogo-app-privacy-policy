import { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    slug: 'sliding-window',
    description: 'Master the technique of maintaining a window that slides through data structures.',
    icon: 'Layers',
    color: '#FF6B6B',
    colorDark: '#E55A5A',
    learnContent: [
      {
        id: 'sw-intro',
        title: 'What is Sliding Window?',
        content: 'The Sliding Window pattern is used to perform operations on a specific window size of an array or linked list. Instead of recalculating from scratch for each position, we "slide" the window and update incrementally. This transforms O(n×k) brute force into O(n).',
      },
      {
        id: 'sw-when',
        title: 'When to Use',
        content: 'Use sliding window when:\n• Finding subarrays/substrings with specific properties\n• Problem mentions "contiguous" elements\n• Need to track a running computation (sum, product, frequency)\n• Keywords: "longest", "shortest", "maximum", "minimum" subarray',
      },
      {
        id: 'sw-fixed',
        title: 'Fixed-Size Window',
        content: 'Window size stays constant throughout. Perfect for "subarray of size K" problems.\n\nPattern:\n1. Build initial window of size K\n2. Slide: add right element, remove left element\n3. Update result at each position',
        codeExample: 'function maxSumSubarray(arr, k) {\n  let windowSum = 0;\n  // Build first window\n  for (let i = 0; i < k; i++) windowSum += arr[i];\n  let maxSum = windowSum;\n  // Slide the window\n  for (let i = k; i < arr.length; i++) {\n    windowSum += arr[i] - arr[i - k];\n    maxSum = Math.max(maxSum, windowSum);\n  }\n  return maxSum;\n}'
      },
      {
        id: 'sw-variable',
        title: 'Variable-Size Window',
        content: 'Window expands and shrinks based on conditions. Used when finding optimal length that satisfies a constraint.\n\nPattern:\n1. Expand right to include more elements\n2. While constraint violated, shrink from left\n3. Update result when constraint satisfied',
        codeExample: 'function minSubarrayLen(target, nums) {\n  let left = 0, sum = 0, minLen = Infinity;\n  for (let right = 0; right < nums.length; right++) {\n    sum += nums[right];\n    while (sum >= target) {\n      minLen = Math.min(minLen, right - left + 1);\n      sum -= nums[left++];\n    }\n  }\n  return minLen === Infinity ? 0 : minLen;\n}'
      },
      {
        id: 'sw-string',
        title: 'String Window with HashMap',
        content: 'For character frequency problems, use a HashMap to track what\'s in the window. The "matches" counter trick avoids comparing entire maps each iteration.',
        codeExample: 'function findAnagrams(s, p) {\n  const result = [], need = {};\n  for (const c of p) need[c] = (need[c] || 0) + 1;\n  let have = 0, required = Object.keys(need).length;\n  const window = {};\n  for (let r = 0; r < s.length; r++) {\n    const c = s[r];\n    window[c] = (window[c] || 0) + 1;\n    if (window[c] === need[c]) have++;\n    if (r >= p.length) {\n      const left = s[r - p.length];\n      if (window[left] === need[left]) have--;\n      window[left]--;\n    }\n    if (have === required) result.push(r - p.length + 1);\n  }\n  return result;\n}'
      },
      {
        id: 'sw-trick',
        title: 'The Shrinking Trick',
        content: 'Key insight: Even with nested while loops, time is still O(n). Each element enters the window once (right pointer) and leaves once (left pointer). Total operations: 2n = O(n).\n\nThis "amortized analysis" is crucial for interview explanations!'
      }
    ],
    flashcards: [
      { id: 'sw-1', front: 'Maximum Sum Subarray of Size K\n\nGiven an array and integer k, find the maximum sum of any contiguous subarray of exactly size k.', back: 'Fixed window. Build first K, then slide: add right, subtract left. Track max.\n\nTime: O(n), Space: O(1)' },
      { id: 'sw-2', front: 'Longest Substring with K Distinct Characters\n\nGiven a string, find the length of the longest substring that contains at most k distinct characters.', back: 'Variable window + HashMap for char frequency. Expand right, shrink left when distinct > K.\n\nTime: O(n), Space: O(K)' },
      { id: 'sw-3', front: 'Fruits Into Baskets (Max 2 Types)\n\nGiven an array of fruits, find the maximum number of fruits you can collect with at most 2 types of fruit in your baskets.', back: 'Same as "longest substring with 2 distinct". Window shrinks when basket types > 2.\n\nReal meaning: longest contiguous subarray with at most 2 distinct values.' },
      { id: 'sw-4', front: 'Longest Substring Without Repeating Characters\n\nGiven a string, find the length of the longest substring without repeating characters.', back: 'Variable window + HashSet/HashMap. On duplicate, shrink left until duplicate removed.\n\nTrick: HashMap stores last index → jump left pointer directly!' },
      { id: 'sw-5', front: 'Minimum Window Substring\n\nGiven two strings s and t, find the minimum window in s which contains all characters of t (including duplicates).', back: 'Expand to include all required chars, shrink to minimize while still valid. Track "have" vs "need" counts.\n\nTime: O(n), Space: O(charset)' },
      { id: 'sw-6', front: 'When to shrink the window?', back: '• Sum exceeds target → shrink\n• Too many distinct chars → shrink\n• Duplicate found → shrink\n• Constraint violated → shrink\n\nAlways shrink from LEFT (FIFO order)' },
      { id: 'sw-7', front: 'Fixed vs Variable Window', back: 'Fixed: Size K stays constant. Use for "exactly K" problems.\n\nVariable: Size changes. Use for "at most K" or "minimum/maximum length" problems.' },
      { id: 'sw-8', front: 'Permutation in String\n\nGiven two strings s1 and s2, return true if s2 contains any permutation of s1 as a substring.', back: 'Fixed window of pattern length. Use frequency map + "matches" counter. Valid when all frequencies match.\n\nSame technique as "Find All Anagrams".' },
      { id: 'sw-9', front: 'Maximum Average Subarray\n\nGiven an array and integer k, find the contiguous subarray of length k that has the maximum average value.', back: 'Fixed window of size K. Track running sum, compute average only for final answer (avoid float operations in loop).' },
      { id: 'sw-10', front: 'Longest Repeating Character Replacement\n\nGiven a string and integer k, find the length of the longest substring with the same letter after replacing at most k characters.', back: 'Window valid when: length - maxFreq <= k (can replace non-max chars). Shrink when invalid.\n\nTrick: maxFreq doesn\'t need to decrease on shrink (doesn\'t affect final answer).' },
      { id: 'sw-11', front: 'Subarray Product Less Than K\n\nGiven an array of positive integers and k, count the number of contiguous subarrays where the product of all elements is less than k.', back: 'Variable window tracking product. Shrink while product >= k. Count subarrays ending at right: (right - left + 1).' },
      { id: 'sw-12', front: 'Max Consecutive Ones III\n\nGiven a binary array and integer k, return the maximum number of consecutive 1s you can get by flipping at most k 0s.', back: 'Rephrase: longest subarray with at most K zeros. Shrink when zero count > K.\n\nTime: O(n), Space: O(1)' },
      { id: 'sw-13', front: 'Sliding Window Maximum\n\nGiven an array and integer k, return an array of the maximum value in each sliding window of size k.', back: 'Use monotonic DECREASING deque. Front = max of window. Remove smaller elements from back, expired indices from front.\n\nTime: O(n), Space: O(k)' },
      { id: 'sw-14', front: 'Why is nested while loop still O(n)?', back: 'Amortized analysis: Each element enters window once (via right), leaves once (via left). Total: 2n operations = O(n).\n\nNot O(n²) because left never moves backward!' },
      { id: 'sw-15', front: 'Count Subarrays with Sum Equals K\n\nGiven an array of integers and k, count the number of contiguous subarrays whose sum equals k.', back: 'NOT sliding window! Use prefix sum + HashMap because elements can be negative.\n\nSliding window needs: shrinking must help (positive numbers only).' },
      { id: 'sw-16', front: 'Minimum Size Subarray Sum\n\nGiven an array of positive integers and target sum, find the minimal length of a contiguous subarray whose sum is greater than or equal to target.', back: 'Variable window. Expand until sum >= target, shrink while valid to minimize.\n\nKey: Track minimum length when constraint satisfied.\n\nTime: O(n), Space: O(1)' },
      { id: 'sw-17', front: 'Contains Duplicate II\n\nGiven an array and integer k, return true if there are two distinct indices i and j where nums[i] == nums[j] and abs(i - j) <= k.', back: 'Fixed window of size k. Use HashSet - add current, remove element k positions back.\n\nReturn true if duplicate found within window.\n\nTime: O(n), Space: O(k)' },
      { id: 'sw-18', front: 'Minimum Window Sliding Technique', back: 'Two-phase approach:\n1. Expand right until valid\n2. Shrink left while still valid\n3. Track minimum during shrink phase\n\nUpdate answer only when window is valid!' },
      { id: 'sw-19', front: 'Longest Subarray of 1s After Deleting One Element\n\nGiven a binary array, find the longest contiguous subarray of 1s after deleting exactly one element from the array.', back: 'Rephrase: longest window with at most 1 zero, then subtract 1 (must delete).\n\nShrink when zero count > 1.\n\nEdge case: all 1s → return length - 1' },
      { id: 'sw-20', front: 'Get Equal Substrings Within Budget\n\nGiven two strings s and t and integer maxCost, find the maximum length of a substring of s that can be changed to match t with cost at most maxCost.', back: 'Cost[i] = |s[i] - t[i]|. Find longest window where sum of costs <= maxCost.\n\nClassic variable window with sum constraint.' },
      { id: 'sw-21', front: 'Number of Substrings Containing All Three Characters\n\nGiven a string consisting only of characters a, b, and c, count how many substrings contain at least one occurrence of all three characters.', back: 'Count valid substrings using: once window has a,b,c → all extensions to right are valid.\n\nAdd (n - right) for each valid window position.' },
      { id: 'sw-22', front: 'Replace the Substring for Balanced String\n\nGiven a string of Q, W, E, R, replace a substring to make each character appear exactly n/4 times. Find minimum length substring to replace.', back: 'Balance means each char appears n/4 times. Window replaces excess chars.\n\nShrink when: remaining string can be balanced (all counts <= n/4).' },
      { id: 'sw-23', front: 'Binary Subarrays With Sum\n\nGiven a binary array and goal, count the number of non-empty subarrays with sum equal to goal.', back: 'atMost(S) - atMost(S-1) technique. Or: prefix sum + count map.\n\nBoth work since elements are 0/1 (non-negative).' },
      { id: 'sw-24', front: 'Frequency of the Most Frequent Element\n\nGiven an array and k operations (increment element by 1), find the maximum frequency achievable for any element.', back: 'Sort first! Then window is valid if: sum + k >= max_element × window_size.\n\nMeaning: can we boost all elements to max using k increments?' },
      { id: 'sw-25', front: 'Count Number of Nice Subarrays\n\nGiven an array of integers and k, count the number of continuous subarrays with exactly k odd numbers.', back: 'Nice = exactly k odd numbers. Use atMost(k) - atMost(k-1).\n\nTreat odd as 1, even as 0 → becomes sum equals k problem.' },
      { id: 'sw-26', front: 'Longest Turbulent Subarray\n\nGiven an array, find the length of the longest turbulent subarray where comparisons alternate between greater than and less than.', back: 'Comparison alternates: >, <, >, < ... Track window of alternating comparisons.\n\nReset when pattern breaks (equal or same direction).' },
      { id: 'sw-27', front: 'Maximum Points from Cards\n\nGiven an array of cards and k, find the maximum points you can obtain by taking exactly k cards from either end of the array.', back: 'Take k cards from ends. Trick: minimize middle subarray of size n-k.\n\nAnswer = totalSum - minMiddleSum. Fixed window!' },
      { id: 'sw-28', front: 'Diet Plan Performance\n\nGiven an array representing calories per day, window k, and thresholds lower and upper, calculate performance points over time.', back: 'Fixed window of size k. Sum < lower → -1 point. Sum > upper → +1 point.\n\nSlide and accumulate score. Classic fixed window.' },
      { id: 'sw-29', front: 'Maximum Erasure Value\n\nGiven an array of positive integers, find the maximum sum of a subarray with all unique elements.', back: 'Maximum sum of subarray with unique elements. Variable window + HashSet.\n\nShrink on duplicate, track max sum of valid windows.' },
      { id: 'sw-30', front: 'K Radius Subarray Averages\n\nGiven an array and integer k, calculate the average of each subarray of radius k centered at each index, or -1 if not possible.', back: 'Window of size 2k+1 centered at each index. Fixed window with boundary checks.\n\nPositions < k or > n-k-1 have no valid window → -1.' }
    ],
    quizQuestions: [
      {
        id: 'sw-q1',
        question: 'What is the time complexity of the sliding window pattern?',
        options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(k × n)'],
        correctAnswer: 1,
        explanation: 'Each element is visited at most twice (once when expanding, once when shrinking). This amortized analysis gives O(n) total.'
      },
      {
        id: 'sw-q2',
        question: 'Which problem is NOT suitable for sliding window?',
        options: ['Maximum sum subarray of size K', 'Find all anagrams in a string', 'Subarray sum equals K (with negatives)', 'Longest substring with K distinct characters'],
        correctAnswer: 2,
        explanation: 'Sliding window requires that shrinking helps reach the goal. With negative numbers, shrinking might increase or decrease the sum unpredictably. Use prefix sum + HashMap instead.'
      },
      {
        id: 'sw-q3',
        question: 'For "Longest Substring Without Repeating Characters", what\'s the clever HashMap optimization?',
        options: ['Store character counts', 'Store last index of each character', 'Store boolean presence', 'Store sorted characters'],
        correctAnswer: 1,
        explanation: 'Storing the last index lets you jump the left pointer directly past the duplicate, instead of incrementing one by one.'
      },
      {
        id: 'sw-q4',
        question: 'In the Sliding Window Maximum problem, why use a monotonic deque?',
        options: ['To sort the window', 'To maintain decreasing order so front is always max', 'To use less memory', 'To handle negative numbers'],
        correctAnswer: 1,
        explanation: 'A monotonic decreasing deque keeps the maximum at the front. Smaller elements are useless if a larger element is to their left in the window.'
      },
      {
        id: 'sw-q5',
        question: 'For "Longest Repeating Character Replacement", why doesn\'t maxFreq need to decrease when shrinking?',
        options: ['It\'s a bug in the algorithm', 'Decreasing maxFreq can only shrink the answer, which we already have', 'The frequency map handles it', 'It does need to decrease'],
        correctAnswer: 1,
        explanation: 'We\'re looking for the MAXIMUM length. If maxFreq was higher before, we already recorded that potential answer. A lower maxFreq won\'t give a longer answer.'
      },
      {
        id: 'sw-q6',
        question: 'What defines when you can use sliding window vs prefix sum?',
        options: ['Array size', 'Whether elements are positive', 'Whether you need indices', 'Whether the array is sorted'],
        correctAnswer: 1,
        explanation: 'Sliding window needs monotonic behavior: shrinking should consistently help (or consistently hurt). With mixed positive/negative, shrinking has unpredictable effects on sum.'
      },
      {
        id: 'sw-q7',
        question: 'How many subarrays end at index "right" in a window from "left" to "right"?',
        options: ['1', 'right - left', 'right - left + 1', 'right'],
        correctAnswer: 2,
        explanation: 'Subarrays ending at right can start at any index from left to right (inclusive). That\'s right - left + 1 subarrays.'
      },
      {
        id: 'sw-q8',
        question: 'For "Minimum Window Substring", what\'s the "matches" counter technique?',
        options: ['Count total characters', 'Count characters that have met their required frequency', 'Count window size', 'Count unique characters'],
        correctAnswer: 1,
        explanation: 'Instead of comparing full frequency maps each time, increment "matches" when a char reaches its required count, decrement when it falls below. Valid when matches equals required unique chars.'
      },
      {
        id: 'sw-q9',
        question: 'Given "Find All Anagrams in a String", what\'s the optimal space complexity?',
        options: ['O(n)', 'O(m) where m is pattern length', 'O(26) for lowercase letters', 'O(n × m)'],
        correctAnswer: 2,
        explanation: 'Since we only track character frequencies and the alphabet is fixed (26 lowercase letters), space is O(26) = O(1). The result array is output, not counted in auxiliary space.'
      },
      {
        id: 'sw-q10',
        question: 'In "Grumpy Bookstore Owner", customers[i] are hidden if grumpy[i]=1 during a k-minute window. What\'s the key insight?',
        options: ['Use two sliding windows', 'First sum all non-grumpy, then maximize extra gained in k-window', 'Sort the arrays first', 'Use dynamic programming'],
        correctAnswer: 1,
        explanation: 'Base satisfaction is sum of customers when owner is not grumpy. The k-window "saves" customers during grumpy minutes. Slide window to find max additional customers saved.'
      },
      {
        id: 'sw-q11',
        question: 'For "Subarrays with K Different Integers", why use atMost(k) - atMost(k-1)?',
        options: ['It\'s faster than direct counting', 'Sliding window can\'t count "exactly K" directly', 'To handle duplicates', 'To avoid overflow'],
        correctAnswer: 1,
        explanation: 'Sliding window naturally counts "at most K" (shrink when > K). "Exactly K" = "at most K" minus "at most K-1". This transforms a hard problem into two easy ones.'
      },
      {
        id: 'sw-q12',
        question: 'What data structure is best for "Sliding Window Median"?',
        options: ['Single heap', 'Two heaps (max-heap + min-heap)', 'Sorted array', 'Hash map'],
        correctAnswer: 1,
        explanation: 'Two heaps maintain the lower and upper halves of the window. Median is top of max-heap (odd size) or average of both tops (even). Lazy deletion handles removals.'
      },
      {
        id: 'sw-q13',
        question: 'In "Maximum Points from Cards", you take k cards from either end. What\'s the key insight?',
        options: ['Dynamic programming on both ends', 'Minimize the middle subarray of size n-k', 'Greedy always take maximum', 'Sort the cards first'],
        correctAnswer: 1,
        explanation: 'Taking k cards from ends is equivalent to leaving n-k contiguous cards in the middle. Find minimum sum of size n-k window, answer is totalSum - minMiddleSum.'
      },
      {
        id: 'sw-q14',
        question: 'When should you use the "atMost(k) - atMost(k-1)" technique?',
        options: ['For "at most k" problems', 'For "exactly k" problems', 'For "at least k" problems', 'Only for string problems'],
        correctAnswer: 1,
        explanation: 'Sliding window naturally counts "at most k". To get "exactly k", subtract: atMost(k) - atMost(k-1). This transforms a hard constraint into two easier ones.'
      },
      {
        id: 'sw-q15',
        question: 'For "Frequency of the Most Frequent Element", why must you sort first?',
        options: ['Sliding window requires sorted input', 'To group similar elements together for efficient incrementing', 'To find the median', 'Sorting is optional'],
        correctAnswer: 1,
        explanation: 'After sorting, a valid window contains consecutive values. We can efficiently check if we can boost all elements to the maximum using k increments: sum + k >= max * windowSize.'
      },
      {
        id: 'sw-q16',
        question: 'In "Longest Substring with At Most Two Distinct Characters", what happens when you encounter a third distinct character?',
        options: ['Start over from beginning', 'Shrink from left until only 2 distinct remain', 'Remove all occurrences of one character', 'The answer is found'],
        correctAnswer: 1,
        explanation: 'Shrink the window from the left, decrementing character counts. When a count reaches zero, remove it from the map. Continue until only 2 distinct characters remain.'
      },
      {
        id: 'sw-q17',
        question: 'For "Minimum Operations to Reduce X to Zero", how does sliding window help?',
        options: ['Directly find elements to remove', 'Find longest middle subarray with sum = totalSum - x', 'Sort and use two pointers', 'Use binary search'],
        correctAnswer: 1,
        explanation: 'Removing from ends means keeping a middle subarray. Find the longest subarray with sum = totalSum - x. Answer is n - maxMiddleLength. Classic problem transformation!'
      },
      {
        id: 'sw-q18',
        question: 'What makes "Max Consecutive Ones III" a sliding window problem?',
        options: ['Fixed window size', 'All positive elements with a flip constraint', 'Need to find minimum', 'Requires sorted input'],
        correctAnswer: 1,
        explanation: 'Rephrase as: find longest subarray with at most k zeros. Shrink when zero count exceeds k. Works because flipping (including) more zeros never helps when limit exceeded.'
      },
      {
        id: 'sw-q19',
        question: 'In "Number of Substrings Containing All Three Characters", once the window is valid (has a, b, c), how do you count?',
        options: ['Add 1', 'Add window size', 'Add (n - right) for all valid extensions', 'Add left pointer value'],
        correctAnswer: 2,
        explanation: 'Once window [left, right] contains all three characters, every extension to the right is also valid. Add (n - right) to count all substrings starting at left with at least these characters.'
      },
      {
        id: 'sw-q20',
        question: 'Why is "Count Subarrays with Sum Equals K" NOT a sliding window problem when array has negative numbers?',
        options: ['Window would be too large', 'Shrinking doesn\'t consistently help or hurt the sum', 'Too slow for negatives', 'HashMap is faster'],
        correctAnswer: 1,
        explanation: 'Sliding window needs monotonic behavior: shrinking should consistently move toward the goal. With negatives, removing an element might increase OR decrease the sum unpredictably.'
      }
    ]
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    slug: 'two-pointers',
    description: 'Use two pointers to efficiently traverse and compare elements in sorted data.',
    icon: 'GitCompare',
    color: '#4ECDC4',
    colorDark: '#3DBDB5',
    learnContent: [
      {
        id: 'tp-intro',
        title: 'What is Two Pointers?',
        content: 'Two Pointers uses two index variables to traverse data structures intelligently. By moving pointers based on conditions, we eliminate redundant comparisons and achieve O(n) instead of O(n²) brute force.',
      },
      {
        id: 'tp-types',
        title: 'Three Types of Two Pointers',
        content: '1. Opposite Direction: Start from both ends, converge (sorted array problems)\n2. Same Direction: Fast/slow or read/write pointers (in-place modifications)\n3. Different Arrays: One pointer per array (merge operations)\n\nRecognize the type to choose the right approach!',
      },
      {
        id: 'tp-opposite',
        title: 'Opposite Direction Pattern',
        content: 'Used when sorted array has a target property. The key insight: moving left pointer increases values, moving right decreases them.',
        codeExample: 'function twoSum(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [left, right];\n    // Too small? Need larger value -> move left\n    if (sum < target) left++;\n    // Too big? Need smaller value -> move right\n    else right--;\n  }\n  return [-1, -1];\n}'
      },
      {
        id: 'tp-same',
        title: 'Same Direction (Read/Write)',
        content: 'One pointer reads, one writes. Perfect for in-place array modifications where you need to keep certain elements.',
        codeExample: 'function removeDuplicates(nums) {\n  if (nums.length === 0) return 0;\n  let write = 1; // Position to write next unique\n  for (let read = 1; read < nums.length; read++) {\n    if (nums[read] !== nums[read - 1]) {\n      nums[write] = nums[read];\n      write++;\n    }\n  }\n  return write;\n}'
      },
      {
        id: 'tp-three',
        title: 'Three Pointers (Dutch Flag)',
        content: 'For partitioning into 3 regions. Maintain: [0...low-1]=first, [low...mid-1]=second, [high+1...n]=third.\n\nProcess mid pointer, swap to correct region, move boundaries.',
        codeExample: 'function sortColors(nums) {\n  let low = 0, mid = 0, high = nums.length - 1;\n  while (mid <= high) {\n    if (nums[mid] === 0) {\n      [nums[low], nums[mid]] = [nums[mid], nums[low]];\n      low++; mid++;\n    } else if (nums[mid] === 1) {\n      mid++;\n    } else {\n      [nums[mid], nums[high]] = [nums[high], nums[mid]];\n      high--; // Don\'t increment mid - need to check swapped value\n    }\n  }\n}'
      },
      {
        id: 'tp-trap',
        title: 'Trapping Rain Water Insight',
        content: 'Water at position i = min(leftMax, rightMax) - height[i].\n\nClever O(1) space: Keep leftMax and rightMax. Process from the smaller max side (guaranteed no taller bar blocking).',
        codeExample: 'function trap(height) {\n  let left = 0, right = height.length - 1;\n  let leftMax = 0, rightMax = 0, water = 0;\n  while (left < right) {\n    if (height[left] < height[right]) {\n      leftMax = Math.max(leftMax, height[left]);\n      water += leftMax - height[left];\n      left++;\n    } else {\n      rightMax = Math.max(rightMax, height[right]);\n      water += rightMax - height[right];\n      right--;\n    }\n  }\n  return water;\n}'
      }
    ],
    flashcards: [
      { id: 'tp-1', front: 'Two Sum II (Sorted Array)\n\nGiven a sorted array and target sum, find two numbers that add up to the target. Return indices (1-indexed).', back: 'Opposite pointers. Sum too small → move left. Sum too big → move right.\n\nWhy it works: Sorted means left++ increases sum, right-- decreases sum. O(n)' },
      { id: 'tp-2', front: '3Sum\n\nGiven an array, find all unique triplets that sum to zero.', back: 'Sort first. Fix element i, use two pointers on remainder.\n\nSkip duplicates: if nums[i] == nums[i-1], continue.\n\nTime: O(n²), cannot do better.' },
      { id: 'tp-3', front: '4Sum\n\nGiven an array and target, find all unique quadruplets that sum to the target.', back: 'Two nested loops + two pointers = O(n³). Same duplicate-skipping logic.\n\nGeneral kSum: recursively reduce to 2Sum. O(n^(k-1))' },
      { id: 'tp-4', front: 'Container With Most Water\n\nGiven an array of heights, find two lines that together with the x-axis form a container that holds the most water.', back: 'Area = min(left, right) × width. Move the SHORTER line inward.\n\nWhy? Moving shorter might find taller. Moving taller can only decrease area.' },
      { id: 'tp-5', front: 'Trapping Rain Water\n\nGiven an elevation map represented by an array of heights, calculate how much rainwater can be trapped after raining.', back: 'Water at i = min(leftMax, rightMax) - height[i].\n\nTwo pointer O(1) space: Process from smaller max side.\n\nAlternative: Monotonic stack O(n) space.' },
      { id: 'tp-6', front: 'Remove Duplicates from Sorted Array\n\nGiven a sorted array, remove duplicates in-place and return the new length with each element appearing at most once.', back: 'Write pointer at position 1. Read pointer scans.\n\nCopy when nums[read] ≠ nums[read-1].\n\nReturn write pointer as new length.' },
      { id: 'tp-7', front: 'Remove Element (in-place)\n\nGiven an array and value val, remove all occurrences of val in-place and return the new length.', back: 'Write pointer for elements to keep. Skip target values.\n\nAlternative: Swap with end, shrink array. Better when few removals.' },
      { id: 'tp-8', front: 'Move Zeroes\n\nGiven an array, move all zeros to the end while maintaining the relative order of non-zero elements.', back: 'Write pointer for non-zeros. Read scans all.\n\nCopy non-zeros to write position, fill rest with zeros.\n\nOr: swap non-zero with write position directly.' },
      { id: 'tp-9', front: 'Valid Palindrome\n\nGiven a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring case.', back: 'Two pointers from ends. Skip non-alphanumeric. Compare lowercase.\n\nEdge case: empty string is palindrome!' },
      { id: 'tp-10', front: 'Valid Palindrome II (remove one char)\n\nGiven a string, return true if it can be a palindrome after deleting at most one character.', back: 'On mismatch, try skipping left OR right. Either resulting substring must be palindrome.\n\nRecursive helper with "removed" flag.' },
      { id: 'tp-11', front: 'Dutch National Flag (Sort Colors)\n\nGiven an array with values 0, 1, and 2, sort it in-place in a single pass.', back: 'Three regions: 0s, 1s, 2s. Three pointers: low, mid, high.\n\nKey: Don\'t advance mid after swapping with high (unknown value swapped in).' },
      { id: 'tp-12', front: 'Merge Sorted Array\n\nGiven two sorted arrays nums1 and nums2, merge nums2 into nums1 as one sorted array (nums1 has enough space).', back: 'Fill from BACK to avoid overwriting. Three pointers: p1 at m-1, p2 at n-1, write at m+n-1.\n\nHandle remaining elements in nums2.' },
      { id: 'tp-13', front: 'Squares of Sorted Array\n\nGiven a sorted array (can have negatives), return an array of the squares of each number, sorted in non-decreasing order.', back: 'Largest square is at either end (negatives!). Two pointers, fill result from back.\n\nO(n) time, O(n) space for result.' },
      { id: 'tp-14', front: 'Reverse String\n\nGiven a character array, reverse it in-place.', back: 'Opposite pointers, swap until they meet.\n\nIn-place O(1) space. Works for arrays and strings (as char arrays).' },
      { id: 'tp-15', front: 'Partition Labels\n\nGiven a string, partition it into as many parts as possible where each letter appears in at most one part. Return the sizes.', back: 'Greedy + two pointers mindset. Track last occurrence of each char. Extend partition end to include all chars.\n\nStart new partition when i reaches current end.' },
      { id: 'tp-16', front: 'Remove Element\n\nGiven an array and value val, remove all occurrences of val in-place and return the new length.', back: 'Read/write pointers. Write pointer tracks valid position. Skip elements equal to val.\n\nReturn write pointer as new length.\n\nTime: O(n), Space: O(1)' },
      { id: 'tp-17', front: 'Move Zeroes\n\nGiven an array, move all zeros to the end while maintaining the relative order of non-zero elements.', back: 'Read/write pattern. Write non-zeros to front, fill rest with zeros.\n\nOr: swap non-zero with write position, advance write.\n\nMaintains relative order!' },
      { id: 'tp-18', front: 'Longest Mountain in Array\n\nGiven an array, find the length of the longest mountain subarray (strictly increasing then strictly decreasing).', back: 'Find peaks (arr[i] > arr[i-1] and arr[i] > arr[i+1]). Expand left/right from peak.\n\nTwo pointers from peak center outward.' },
      { id: 'tp-19', front: 'Boats to Save People\n\nGiven an array of weights and weight limit per boat, return the minimum number of boats needed to carry everyone (2 people max per boat).', back: 'Sort by weight. Pair heaviest with lightest if sum <= limit.\n\nGreedy: heaviest always needs a boat, try to pair with lightest.' },
      { id: 'tp-20', front: 'Next Permutation\n\nGiven an array of integers, rearrange it to the next lexicographically greater permutation. If impossible, rearrange to lowest permutation.', back: '1. Find first decreasing element from right\n2. Find smallest larger element to its right\n3. Swap them\n4. Reverse suffix\n\nTwo pointer reverse at end.' },
      { id: 'tp-21', front: 'Rotate Array\n\nGiven an array, rotate it to the right by k steps in-place.', back: 'Three reverses: reverse all, reverse first k, reverse rest.\n\nOr: cyclic replacements with GCD(n,k) cycles.\n\nTime: O(n), Space: O(1)' },
      { id: 'tp-22', front: 'Sort Array By Parity\n\nGiven an array, move all even integers to the beginning followed by all odd integers, in-place.', back: 'Two pointers from ends. Left seeks odd, right seeks even, swap.\n\nOr: read/write - write evens to front.\n\nTime: O(n), Space: O(1)' },
      { id: 'tp-23', front: 'Longest Word in Dictionary through Deleting\n\nGiven a string s and a dictionary of strings, find the longest string in the dictionary that can be formed by deleting characters from s.', back: 'For each word, use two pointers to check if it\'s subsequence of s.\n\nSort by length desc, then lexicographically. Return first match.' },
      { id: 'tp-24', front: 'Intersection of Two Arrays II\n\nGiven two arrays, return an array of their intersection where each element appears as many times as it shows in both arrays.', back: 'Sort both, use two pointers. Equal? Add to result, advance both. Else advance smaller.\n\nOr: HashMap for one, decrement counts.' },
      { id: 'tp-25', front: 'Backspace String Compare\n\nGiven two strings containing letters and # (backspace), return true if they are equal after processing backspaces. Do it in O(1) space.', back: 'Process from right. Count backspaces, skip characters.\n\nTwo pointers, compare char-by-char after processing.\n\nTime: O(n), Space: O(1)' },
      { id: 'tp-26', front: 'Interval List Intersections\n\nGiven two lists of closed intervals (both sorted), return the intersection of these two interval lists.', back: 'Two pointers on sorted intervals. Find overlap: [max(starts), min(ends)].\n\nAdvance pointer with earlier end time.' },
      { id: 'tp-27', front: '3Sum Closest\n\nGiven an array and integer target, find three integers whose sum is closest to target. Return the sum.', back: 'Sort + fix one element + two pointers. Track closest sum to target.\n\nUpdate closest when |sum - target| decreases.\n\nTime: O(n²)' },
      { id: 'tp-28', front: 'Minimum Difference Between Highest and Lowest of K Scores\n\nGiven an array of scores and integer k, find the minimum possible difference between the highest and lowest of k scores.', back: 'Sort array. Sliding window of size k.\n\nMin diff = min(arr[i+k-1] - arr[i]) for all valid i.\n\nTwo pointers defining window.' },
      { id: 'tp-29', front: 'Two Sum Less Than K\n\nGiven an array and integer k, find the maximum sum of two elements less than k.', back: 'Sort + opposite pointers. Track max sum < k.\n\nIf sum < k: update max, move left. Else: move right.\n\nTime: O(n log n)' },
      { id: 'tp-30', front: 'Bag of Tokens\n\nGiven tokens array and initial power, maximize score by playing tokens face-up (costs power, gains point) or face-down (gains power, costs point).', back: 'Sort tokens. Use smallest to gain points (face up), largest to gain power (face down).\n\nTwo pointers: greedy from both ends.\n\nTrack max score achieved.' }
    ],
    quizQuestions: [
      {
        id: 'tp-q1',
        question: 'What is the main advantage of the two pointers technique?',
        options: ['Uses less memory', 'Reduces O(n²) to O(n)', 'Works on unsorted arrays', 'Handles any data type'],
        correctAnswer: 1,
        explanation: 'Two pointers eliminates redundant comparisons. Instead of checking all pairs O(n²), we use sorted property to make smart decisions about which pointer to move.'
      },
      {
        id: 'tp-q2',
        question: 'In Container With Most Water, why move the shorter line inward?',
        options: ['Random choice', 'Moving taller line might find shorter', 'Moving shorter line might find taller', 'To balance the pointers'],
        correctAnswer: 2,
        explanation: 'Area = min(heights) × width. Moving the shorter line might find a taller one, potentially increasing area. Moving the taller line can only decrease or maintain the min, while reducing width.'
      },
      {
        id: 'tp-q3',
        question: 'In Dutch National Flag, why not advance mid after swapping with high?',
        options: ['It\'s a bug', 'The swapped value is unknown and needs checking', 'To save operations', 'High pointer handles it'],
        correctAnswer: 1,
        explanation: 'When swapping with high, we get an unknown value from the unsorted region. We must check this new value before advancing mid. When swapping with low, we know it\'s a 1 (already processed).'
      },
      {
        id: 'tp-q4',
        question: 'For merging two sorted arrays in-place, why fill from the back?',
        options: ['It\'s faster', 'To avoid overwriting elements we still need', 'Arrays are reversed', 'It uses less memory'],
        correctAnswer: 1,
        explanation: 'Filling from front would overwrite nums1 elements we haven\'t processed. Filling from back uses the empty space at the end of nums1, ensuring we never overwrite unprocessed elements.'
      },
      {
        id: 'tp-q5',
        question: 'What\'s the time complexity of 3Sum?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        correctAnswer: 2,
        explanation: 'We iterate through each element O(n), and for each, we do a two-pointer scan O(n). Total: O(n²). This is optimal - we must examine at least this many triplet candidates.'
      },
      {
        id: 'tp-q6',
        question: 'In the Trapping Rain Water two-pointer solution, why process from the smaller max side?',
        options: ['Arbitrary choice', 'The smaller max is the bottleneck, so water level is determined', 'To balance the pointers', 'It\'s faster'],
        correctAnswer: 1,
        explanation: 'Water level at any position is limited by the smaller of leftMax and rightMax. When leftMax < rightMax, we know the water level on the left is determined by leftMax, regardless of what\'s further right.'
      },
      {
        id: 'tp-q7',
        question: 'For "Squares of Sorted Array" with negative numbers, why use two pointers from ends?',
        options: ['Negatives are at the end', 'Largest squares are at the ends (most negative or most positive)', 'To sort in reverse', 'It\'s the only approach'],
        correctAnswer: 1,
        explanation: 'In a sorted array like [-4,-1,0,3,10], the largest squares come from the extreme values (most negative or most positive). Comparing ends and filling result from back gives O(n) solution.'
      },
      {
        id: 'tp-q8',
        question: 'Which problem CANNOT be efficiently solved with two pointers?',
        options: ['Two Sum on sorted array', 'Longest Substring Without Repeating Characters', 'Find all pairs with given difference', 'Find element in unsorted array'],
        correctAnswer: 3,
        explanation: 'Two pointers requires some ordering or structure to make decisions. Finding an element in an unsorted array requires checking every element - no shortcut possible without sorting first.'
      },
      {
        id: 'tp-q9',
        question: 'In 3Sum, how do you avoid duplicate triplets?',
        options: ['Use a HashSet for results', 'Skip duplicate values when moving pointers', 'Sort results after finding', 'Use three nested loops'],
        correctAnswer: 1,
        explanation: 'After sorting, skip duplicates by checking if current == previous before processing. Do this for the outer loop element and both inner pointers. This avoids duplicates without extra space.'
      },
      {
        id: 'tp-q10',
        question: 'For "Container With Most Water", why move the pointer at the shorter line?',
        options: ['It\'s arbitrary', 'Moving the taller line can only decrease area', 'Moving the shorter line might find a taller line', 'Both pointers should move'],
        correctAnswer: 2,
        explanation: 'Area = min(height) × width. Moving the shorter line might find a taller one, potentially increasing area. Moving the taller line can only keep or decrease the minimum, while also decreasing width.'
      },
      {
        id: 'tp-q11',
        question: 'What\'s the time complexity of "Trapping Rain Water" using two pointers?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(n) with O(n) space'],
        correctAnswer: 2,
        explanation: 'Two pointers from both ends, tracking leftMax and rightMax. Process the smaller side (guaranteed trapped water). Single pass, O(n) time, O(1) space - better than the stack or DP approaches.'
      },
      {
        id: 'tp-q12',
        question: 'For "Dutch National Flag" (sort colors 0,1,2), how many pointers are needed?',
        options: ['Two pointers', 'Three pointers', 'One pointer', 'Four pointers'],
        correctAnswer: 1,
        explanation: 'Three pointers: low (boundary of 0s), high (boundary of 2s), and current. Swap 0s to low, 2s to high, leave 1s in middle. Single pass O(n) sort.'
      },
      {
        id: 'tp-q13',
        question: 'In "Squares of Sorted Array" with negative numbers, where are the largest squares?',
        options: ['Always in the middle', 'At the ends (most negative or most positive)', 'Randomly distributed', 'At the beginning only'],
        correctAnswer: 1,
        explanation: 'In [-4,-1,0,3,10], largest squares are 16 (from -4) and 100 (from 10). Use two pointers from ends, fill result array from back with larger square.'
      },
      {
        id: 'tp-q14',
        question: 'For "Backspace String Compare", how do you achieve O(1) space?',
        options: ['Build new strings', 'Process from right, counting backspaces to skip chars', 'Use a stack', 'Modify strings in place'],
        correctAnswer: 1,
        explanation: 'Process both strings from right. Count # characters and skip that many regular characters. Compare resulting characters at each step. Two pointers, no extra space.'
      },
      {
        id: 'tp-q15',
        question: 'In "Interval List Intersections", how do you decide which pointer to advance?',
        options: ['Always advance both', 'Advance the one with smaller start', 'Advance the one with smaller end time', 'Random choice'],
        correctAnswer: 2,
        explanation: 'After finding intersection [max(starts), min(ends)], advance the pointer whose interval ends first. That interval can\'t intersect with any more intervals from the other list.'
      },
      {
        id: 'tp-q16',
        question: 'What\'s the key insight for "Boats to Save People"?',
        options: ['Always pair adjacent people', 'Sort and pair heaviest with lightest if possible', 'Use dynamic programming', 'Greedy from heaviest only'],
        correctAnswer: 1,
        explanation: 'Sort by weight. The heaviest person always needs a boat. Try to pair them with the lightest (maximize boat usage). If sum > limit, heaviest goes alone. Two pointers from ends.'
      },
      {
        id: 'tp-q17',
        question: 'For "Valid Palindrome II" (can remove at most one char), what\'s the strategy on mismatch?',
        options: ['Return false immediately', 'Try removing left OR right char, check if either creates palindrome', 'Remove both characters', 'Start over from beginning'],
        correctAnswer: 1,
        explanation: 'On first mismatch at positions i,j: try checking if s[i+1..j] is palindrome OR s[i..j-1] is palindrome. If either works, we can remove one char to make it valid.'
      },
      {
        id: 'tp-q18',
        question: 'In "Sort Array By Parity", what\'s the two-pointer approach?',
        options: ['Sort then split', 'Left seeks odds, right seeks evens, swap when found', 'Use counting sort', 'Partition like quicksort pivot'],
        correctAnswer: 1,
        explanation: 'Two pointers from ends. Left pointer finds odd numbers, right pointer finds even numbers, swap them. Continue until pointers meet. O(n) time, O(1) space.'
      },
      {
        id: 'tp-q19',
        question: 'For "3Sum Closest", what do you track differently compared to regular 3Sum?',
        options: ['Track all triplets', 'Track the sum closest to target', 'Track indices instead of values', 'Count of valid triplets'],
        correctAnswer: 1,
        explanation: 'Instead of finding exact target, track the sum with minimum |sum - target|. Update closest sum whenever current sum is nearer to target. Return the closest sum found.'
      },
      {
        id: 'tp-q20',
        question: 'Why is "Partition Labels" considered a two-pointer problem?',
        options: ['Uses left and right pointers', 'Tracks current partition start and extending end based on char last occurrences', 'Compares two strings', 'Merges two arrays'],
        correctAnswer: 1,
        explanation: 'Track partition start and end. For each char, extend end to max(end, lastOccurrence[char]). When index reaches end, partition is complete. Start new partition.'
      }
    ]
  },
  {
    id: 'fast-slow-pointers',
    name: 'Fast & Slow Pointers',
    slug: 'fast-slow-pointers',
    description: 'Detect cycles and find middle elements using the tortoise and hare algorithm.',
    icon: 'Rabbit',
    color: '#45B7D1',
    colorDark: '#38A3BC',
    learnContent: [
      {
        id: 'fs-intro',
        title: 'The Hare & Tortoise Algorithm',
        content: 'Also known as Floyd\'s Cycle Detection. Fast pointer moves 2 steps, slow moves 1. This simple difference enables cycle detection, finding middle elements, and more - all in O(1) space!',
      },
      {
        id: 'fs-why',
        title: 'Why They Must Meet in a Cycle',
        content: 'Think of it as a race track. Fast gains 1 step on slow every iteration (relative speed = 1). If cycle has length L, they\'ll meet within L iterations.\n\nNo cycle? Fast hits null first.',
      },
      {
        id: 'fs-start',
        title: 'Finding Cycle Start (The Magic!)',
        content: 'After meeting, reset one pointer to head. Move both at speed 1. They meet at cycle start!\n\nWhy? Let distance to cycle start = F, meeting point = M steps into cycle. Math shows both pointers travel F more steps to reach start.',
        codeExample: 'function detectCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) {\n      // Found cycle, now find start\n      slow = head;\n      while (slow !== fast) {\n        slow = slow.next;\n        fast = fast.next;\n      }\n      return slow; // Cycle start\n    }\n  }\n  return null;\n}'
      },
      {
        id: 'fs-middle',
        title: 'Finding Middle Element',
        content: 'When fast reaches end, slow is at middle. For odd length: exact middle. For even length: second of two middle nodes.\n\nThis is crucial for divide-and-conquer on linked lists (merge sort, palindrome check).',
        codeExample: 'function middleNode(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow; // Middle node\n}'
      },
      {
        id: 'fs-happy',
        title: 'Happy Number Insight',
        content: 'Sum of squared digits eventually: reaches 1 (happy) OR cycles forever (unhappy).\n\nTreat the sequence as a linked list! Use fast-slow to detect if we reach 1 or enter a cycle.',
        codeExample: 'function isHappy(n) {\n  const getNext = (num) => {\n    let sum = 0;\n    while (num > 0) {\n      const d = num % 10;\n      sum += d * d;\n      num = Math.floor(num / 10);\n    }\n    return sum;\n  };\n  let slow = n, fast = n;\n  do {\n    slow = getNext(slow);\n    fast = getNext(getNext(fast));\n  } while (fast !== 1 && slow !== fast);\n  return fast === 1;\n}'
      },
      {
        id: 'fs-applications',
        title: 'Key Applications',
        content: '1. Cycle detection in linked lists\n2. Find cycle start node\n3. Find middle of linked list\n4. Check if number sequences cycle (Happy Number)\n5. Detect duplicates in array (treat values as pointers)\n6. Palindrome linked list (find middle, reverse half)'
      }
    ],
    flashcards: [
      { id: 'fs-1', front: 'Linked List Cycle Detection\n\nGiven a linked list, determine if it has a cycle in it.', back: 'Fast moves 2, slow moves 1. If meet → cycle exists.\n\nTime: O(n), Space: O(1)\n\nAlternative: HashSet is O(n) space.' },
      { id: 'fs-2', front: 'Find Cycle Start Node\n\nGiven a linked list with a cycle, find the node where the cycle begins.', back: 'After detection (slow == fast), reset slow to head. Move both at speed 1. They meet at cycle start.\n\nMath proof involves distance equations!' },
      { id: 'fs-3', front: 'Find Cycle Length\n\nGiven a linked list with a cycle, find the length of the cycle.', back: 'After detection, keep one pointer fixed. Move other until they meet again. Count steps.\n\nUseful for problems involving cycle properties.' },
      { id: 'fs-4', front: 'Find Middle of Linked List\n\nGiven a linked list, find the middle node. If two middle nodes, return the second one.', back: 'Fast goes 2x. When fast reaches end, slow is at middle.\n\nEven length: slow at 2nd middle.\nFor 1st middle: check fast.next.next instead.' },
      { id: 'fs-5', front: 'Happy Number\n\nGiven a number n, determine if it is a happy number (repeatedly replace n with sum of squares of digits until n=1 or cycles).', back: 'Digit square sum sequence either reaches 1 or cycles.\n\nUse fast-slow on the sequence. Happy if fast reaches 1.' },
      { id: 'fs-6', front: 'Find Duplicate Number (array)\n\nGiven an array of n+1 integers where each integer is between 1 and n (inclusive), find the one repeated number. Do it in O(1) space.', back: 'Treat array as linked list: index → value → next index.\n\nDuplicate creates a cycle. Find cycle start = duplicate value!' },
      { id: 'fs-7', front: 'Palindrome Linked List\n\nGiven a linked list, determine if it is a palindrome.', back: '1. Find middle (fast-slow)\n2. Reverse second half\n3. Compare first and second half\n4. (Optional) Restore list\n\nO(n) time, O(1) space' },
      { id: 'fs-8', front: 'Reorder List (L0→Ln→L1→Ln-1...)\n\nGiven a linked list, reorder it to alternate between first and last nodes.', back: '1. Find middle\n2. Reverse second half\n3. Merge alternating from start and end\n\nAll using fast-slow + reversal.' },
      { id: 'fs-9', front: 'Why relative speed of 1 guarantees meeting?', back: 'In cycle, gap decreases by 1 each step. If gap is G, they meet in G steps.\n\nMax gap is cycle length, so O(cycle length) iterations.' },
      { id: 'fs-10', front: 'Linked List Cycle II (return start node)\n\nGiven a linked list with a cycle, return the node where the cycle begins.', back: 'Phase 1: Detect with fast-slow.\nPhase 2: Reset slow to head, advance both by 1 until meet.\n\nMeeting point = cycle start.' },
      { id: 'fs-11', front: 'Remove Nth Node From End\n\nGiven a linked list, remove the nth node from the end of the list and return its head.', back: 'Fast pointer n steps ahead. When fast reaches end, slow is at n-th from end.\n\nUse dummy node for edge cases!' },
      { id: 'fs-12', front: 'Intersection of Two Linked Lists\n\nGiven two linked lists, find the node at which they intersect. Return null if they don\'t intersect.', back: 'Not exactly fast-slow, but pointer trick: when one reaches end, redirect to other list\'s head.\n\nThey meet at intersection or null together.' },
      { id: 'fs-13', front: 'Sort Linked List (Merge Sort)\n\nGiven a linked list, sort it in O(n log n) time and O(1) space.', back: 'Find middle with fast-slow, recursively sort halves, merge.\n\nO(n log n) time, O(log n) space (recursion stack).' },
      { id: 'fs-14', front: 'Odd Even Linked List\n\nGiven a linked list, group all odd-indexed nodes together followed by even-indexed nodes.', back: 'Similar idea: two pointers for odd and even positions. Traverse and relink.\n\nConnect odd list end to even list start.' },
      { id: 'fs-15', front: 'Why is cycle start finding so elegant?', back: 'Mathematical insight: distance from head to cycle start equals distance from meeting point to cycle start (modulo cycle length).\n\nBoth pointers travel same distance!' },
      { id: 'fs-16', front: 'Reorder List', back: 'Three steps: 1) Find middle 2) Reverse second half 3) Merge alternating.\n\nFast-slow finds middle, then linked list reversal, then interleave.' },
      { id: 'fs-17', front: 'Delete Middle Node of Linked List\n\nGiven a linked list, delete the middle node. If two middle nodes exist, delete the second one.', back: 'Fast-slow with slow starting one behind (or use prev pointer).\n\nWhen fast reaches end, delete slow.next.\n\nEdge: single node returns null.' },
      { id: 'fs-18', front: 'Circular Array Loop\n\nGiven an array of relative jumps, determine if there exists a cycle where all moves are in the same direction.', back: 'For each start, use fast-slow. Check same direction throughout.\n\nCycle length > 1 (not self-loop). Reset visited to avoid reprocessing.' },
      { id: 'fs-19', front: 'Split Linked List in Parts\n\nGiven a linked list and integer k, split the list into k consecutive linked list parts with lengths differing by at most 1.', back: 'Calculate part sizes: n/k with first n%k parts getting +1.\n\nUse slow pointer to traverse and split at correct positions.' },
      { id: 'fs-20', front: 'Remove Duplicates from Sorted List II\n\nGiven a sorted linked list, delete all nodes that have duplicate numbers, leaving only distinct numbers.', back: 'Use dummy node + prev pointer. Skip all nodes with duplicate values.\n\nSimilar to read/write pattern for arrays.' },
      { id: 'fs-21', front: 'Swap Nodes in Pairs\n\nGiven a linked list, swap every two adjacent nodes and return its head.', back: 'Recursive or iterative. Track prev, curr, next. Rewire pointers carefully.\n\nDummy node helps handle head swap.' },
      { id: 'fs-22', front: 'Rotate List\n\nGiven a linked list, rotate the list to the right by k places.', back: 'Find length, compute k % length. Find new tail (length - k from start).\n\nConnect end to head, break at new tail.' },
      { id: 'fs-23', front: 'Add Two Numbers II\n\nGiven two linked lists representing numbers in most-significant-first order, add them and return the sum as a linked list.', back: 'Reverse both lists OR use stacks. Add with carry from least significant.\n\nFast-slow can find list lengths for alignment.' },
      { id: 'fs-24', front: 'Maximum Twin Sum of Linked List\n\nGiven a linked list of even length, return the maximum twin sum where the ith node and (n-1-i)th node are twins.', back: 'Find middle, reverse second half. Twin pairs: i and n-1-i.\n\nAdd corresponding nodes, track maximum.' },
      { id: 'fs-25', front: 'Fast-Slow on Arrays', back: 'Works too! Index as "next pointer". Used in:\n• Find duplicate number\n• Circular array detection\n\nArray index = implicit linked list.' },
      { id: 'fs-26', front: 'Remove Linked List Elements\n\nGiven a linked list and integer val, remove all nodes with value equal to val.', back: 'Dummy node + prev pointer. Skip nodes with target value.\n\nSimpler than handling head removal separately.' },
      { id: 'fs-27', front: 'Merge In Between Linked Lists\n\nGiven two linked lists and indices a and b, remove nodes from index a to b in list1 and insert list2 in their place.', back: 'Find positions a-1 and b+1 in list1. Connect: a-1 → list2 head, list2 tail → b+1.\n\nTwo pointers track positions.' },
      { id: 'fs-28', front: 'Swapping Nodes in Linked List\n\nGiven a linked list and integer k, swap the kth node from the beginning with the kth node from the end.', back: 'Find kth from start and kth from end (fast-slow pattern).\n\nSwap values (easy) or swap nodes (harder - track prev pointers).' },
      { id: 'fs-29', front: 'Why dummy nodes are essential', back: 'Eliminates edge cases: empty list, single node, modifying head.\n\nAlways return dummy.next as new head.\n\nCosts O(1) extra space.' },
      { id: 'fs-30', front: 'Flatten Multilevel Doubly Linked List\n\nGiven a multilevel doubly linked list where nodes may have a child pointer to a separate doubly linked list, flatten it into a single-level doubly linked list.', back: 'DFS with stack or recursion. When child exists: process child, reconnect.\n\nTrack prev for doubly-linked rewiring.' }
    ],
    quizQuestions: [
      {
        id: 'fs-q1',
        question: 'Why does the fast pointer move exactly 2 steps (not 3 or more)?',
        options: ['Arbitrary choice', '2 steps guarantees meeting, 3+ might skip', 'Memory efficiency', 'Simpler code'],
        correctAnswer: 1,
        explanation: 'With 2x speed, relative speed is 1, guaranteeing they\'ll meet. With 3x speed, fast might "jump over" slow in certain cycle sizes, missing the meeting.'
      },
      {
        id: 'fs-q2',
        question: 'What is the space complexity of cycle detection using fast-slow pointers?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(cycle length)'],
        correctAnswer: 2,
        explanation: 'Only two pointer variables are used regardless of list size. This is the key advantage over HashSet-based detection which uses O(n) space.'
      },
      {
        id: 'fs-q3',
        question: 'After cycle detection, why does resetting one pointer to head find the cycle start?',
        options: ['Lucky coincidence', 'Distance to start equals distance from meeting to start', 'The cycle is always at the head', 'It doesn\'t always work'],
        correctAnswer: 1,
        explanation: 'Mathematical proof: Let F = distance to cycle, M = meeting point in cycle. Both pointers need exactly F more steps to reach cycle start from their positions.'
      },
      {
        id: 'fs-q4',
        question: 'In "Find Duplicate Number", why can we use fast-slow on an array?',
        options: ['Arrays are linked lists', 'Values act as next pointers, creating a linked structure', 'It doesn\'t actually work', 'Only works for sorted arrays'],
        correctAnswer: 1,
        explanation: 'If array has values 1 to n, we can treat value at index i as a pointer to next index. Duplicate value means two indices point to same location = cycle!'
      },
      {
        id: 'fs-q5',
        question: 'For "Palindrome Linked List" in O(1) space, what\'s the approach?',
        options: ['Copy to array', 'Find middle, reverse second half, compare', 'Use recursion', 'Two passes with counting'],
        correctAnswer: 1,
        explanation: 'Find middle with fast-slow, reverse the second half in-place, compare both halves. This avoids extra space (recursion stack or array copy).'
      },
      {
        id: 'fs-q6',
        question: 'When finding middle of linked list, if there are two middle nodes, which does slow point to?',
        options: ['First middle', 'Second middle', 'Depends on implementation', 'Neither'],
        correctAnswer: 1,
        explanation: 'With the standard while (fast && fast.next) condition, slow ends at the second middle. For first middle, use while (fast.next && fast.next.next).'
      },
      {
        id: 'fs-q7',
        question: 'For a linked list with cycle of length L, how many iterations until fast and slow meet?',
        options: ['Exactly L', 'At most L', 'Exactly 2L', 'Unpredictable'],
        correctAnswer: 1,
        explanation: 'Once slow enters the cycle, fast gains 1 step per iteration. Maximum gap is L, so they meet within L iterations of slow entering the cycle.'
      },
      {
        id: 'fs-q8',
        question: 'How is "Happy Number" related to cycle detection?',
        options: ['Numbers form a linked list', 'The digit sum sequence either reaches 1 or cycles', 'All numbers are happy', 'It\'s unrelated'],
        correctAnswer: 1,
        explanation: 'The sequence of digit-square sums forms a chain. If it cycles without hitting 1, the number is unhappy. Fast-slow detects this cycle elegantly.'
      },
      {
        id: 'fs-q9',
        question: 'To reorder list as L0→Ln→L1→Ln-1→..., what\'s the approach?',
        options: ['Use a deque', 'Find middle, reverse second half, merge alternating', 'Use recursion only', 'Sort the list'],
        correctAnswer: 1,
        explanation: 'Split at middle with slow-fast, reverse the second half, then interleave merge. Each step uses fast-slow pattern concepts. O(n) time, O(1) space.'
      },
      {
        id: 'fs-q10',
        question: 'For "Linked List Cycle II" (find cycle start), why not just use a HashSet?',
        options: ['HashSet doesn\'t work', 'Fast-slow uses O(1) space vs O(n)', 'Fast-slow is faster', 'There\'s no difference'],
        correctAnswer: 1,
        explanation: 'HashSet works fine with O(n) space. Fast-slow is preferred when O(1) space is required. Time is O(n) for both.'
      },
      {
        id: 'fs-q11',
        question: 'What happens if you use fast = fast.next.next.next (3x speed) for cycle detection?',
        options: ['It\'s faster', 'It still works but slower', 'May miss the cycle', 'It won\'t compile'],
        correctAnswer: 2,
        explanation: 'With 3x speed, fast might "leap over" slow. For example, in a cycle of length 2, they could keep missing each other. 2x speed guarantees meeting.'
      },
      {
        id: 'fs-q12',
        question: 'To find the kth node from the end, which approach is most efficient?',
        options: ['Two passes: count then traverse', 'Fast pointer k steps ahead, then move both', 'Reverse then find kth', 'Use recursion'],
        correctAnswer: 1,
        explanation: 'Move fast k steps ahead, then move both at same speed. When fast reaches end, slow is at kth from end. Single pass O(n), O(1) space.'
      },
      {
        id: 'fs-q13',
        question: 'For "Reorder List" (L0→Ln→L1→Ln-1...), what are the three main steps?',
        options: ['Sort, split, merge', 'Find middle, reverse second half, interleave merge', 'Use stack, then rebuild', 'Recursively reorder'],
        correctAnswer: 1,
        explanation: 'Use fast-slow to find middle, reverse the second half in-place, then merge the two halves by alternating nodes. All operations are O(n) time, O(1) space.'
      },
      {
        id: 'fs-q14',
        question: 'In "Circular Array Loop", what additional condition must be checked beyond cycle detection?',
        options: ['Array must be sorted', 'All elements in cycle must have same sign direction', 'Cycle must include index 0', 'Array must have duplicates'],
        correctAnswer: 1,
        explanation: 'A valid cycle requires all elements to move in the same direction (all positive or all negative). Also, the cycle length must be > 1 (no self-loops).'
      },
      {
        id: 'fs-q15',
        question: 'Why is a dummy node essential when deleting the head of a linked list?',
        options: ['It\'s faster', 'It eliminates the special case of deleting head', 'It uses less memory', 'It\'s required by the algorithm'],
        correctAnswer: 1,
        explanation: 'Without a dummy node, deleting the head requires special handling since there\'s no previous node. A dummy node before head makes all deletions uniform: prev.next = curr.next.'
      },
      {
        id: 'fs-q16',
        question: 'For "Maximum Twin Sum", what defines a twin in a linked list of length n?',
        options: ['Adjacent nodes', 'Node i and node n-1-i', 'Nodes with same value', 'First and last nodes only'],
        correctAnswer: 1,
        explanation: 'Twin of node at index i is node at index n-1-i. Find middle with fast-slow, reverse second half, then add pairs from start and reversed second half.'
      },
      {
        id: 'fs-q17',
        question: 'What\'s the time complexity of sorting a linked list using merge sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 1,
        explanation: 'Merge sort on linked list: find middle with fast-slow O(n), recursively sort halves O(log n levels), merge O(n). Total: O(n log n), and O(log n) space for recursion stack.'
      },
      {
        id: 'fs-q18',
        question: 'In "Odd Even Linked List", how do you separate odd and even positioned nodes?',
        options: ['Check node values', 'Use two pointers for odd and even positions, relink, join lists', 'Sort by position', 'Use recursion'],
        correctAnswer: 1,
        explanation: 'Use odd and even pointers. Traverse linking odd nodes together and even nodes together. Finally, connect odd list tail to even list head. O(n) time, O(1) space.'
      },
      {
        id: 'fs-q19',
        question: 'For "Delete Middle Node", why might you need a pointer one step behind slow?',
        options: ['To check for cycles', 'To maintain reference to node before the one to delete', 'To count nodes', 'It\'s not needed'],
        correctAnswer: 1,
        explanation: 'To delete slow, you need the previous node. Either use a prev pointer, or start slow one step behind (with different initialization) so you can delete slow.next.'
      },
      {
        id: 'fs-q20',
        question: 'Why is the fast-slow pattern on arrays limited to specific value ranges?',
        options: ['Arrays are not linked lists', 'Values must be valid indices to create the implicit linked structure', 'Performance reasons', 'Memory constraints'],
        correctAnswer: 1,
        explanation: 'For fast-slow on arrays (like Find Duplicate), values must be 1 to n so they can act as "next pointers" to valid indices. This creates an implicit linked list structure.'
      }
    ]
  },
  {
    id: 'merge-intervals',
    name: 'Merge Intervals',
    slug: 'merge-intervals',
    description: 'Handle overlapping intervals efficiently with sorting and merging techniques.',
    icon: 'GitMerge',
    color: '#96CEB4',
    colorDark: '#7FB89E',
    learnContent: [
      {
        id: 'mi-intro',
        title: 'Understanding Interval Problems',
        content: 'Intervals are ranges with [start, end]. Key operations: merge overlapping, find intersections, insert new intervals, count conflicts.\n\nAlmost all interval problems require sorting first - the question is: by start or by end?',
      },
      {
        id: 'mi-overlap',
        title: 'The Overlap Condition',
        content: 'Two intervals [a, b] and [c, d] overlap when:\na <= d AND c <= b\n\nEquivalently, they DON\'T overlap when:\nb < c OR d < a (one ends before other starts)\n\nMaster this condition - it appears everywhere!',
      },
      {
        id: 'mi-merge',
        title: 'Merge Intervals Pattern',
        content: 'Sort by start. Compare each interval with the last merged one. If overlap, extend the end. Otherwise, add as new.',
        codeExample: 'function merge(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (const curr of intervals) {\n    const last = result[result.length - 1];\n    if (curr[0] <= last[1]) {\n      // Overlap: extend end\n      last[1] = Math.max(last[1], curr[1]);\n    } else {\n      // No overlap: add new\n      result.push(curr);\n    }\n  }\n  return result;\n}'
      },
      {
        id: 'mi-insert',
        title: 'Insert Interval Pattern',
        content: 'Three phases:\n1. Add all intervals BEFORE new (end < newStart)\n2. Merge all OVERLAPPING intervals\n3. Add all intervals AFTER new (start > newEnd)',
        codeExample: 'function insert(intervals, newInterval) {\n  const result = [];\n  let i = 0, n = intervals.length;\n  // Add all before\n  while (i < n && intervals[i][1] < newInterval[0]) {\n    result.push(intervals[i++]);\n  }\n  // Merge overlapping\n  while (i < n && intervals[i][0] <= newInterval[1]) {\n    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);\n    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);\n    i++;\n  }\n  result.push(newInterval);\n  // Add all after\n  while (i < n) result.push(intervals[i++]);\n  return result;\n}'
      },
      {
        id: 'mi-rooms',
        title: 'Meeting Rooms II (Min Rooms)',
        content: 'Track concurrent meetings. Two approaches:\n\n1. Min Heap: Store end times. If meeting starts after min end, reuse room (pop). Heap size = rooms needed.\n\n2. Events: Create +1 at start, -1 at end. Sort, sweep. Max running count = rooms.',
        codeExample: '// Event-based approach\nfunction minMeetingRooms(intervals) {\n  const events = [];\n  for (const [s, e] of intervals) {\n    events.push([s, 1]);  // +1 at start\n    events.push([e, -1]); // -1 at end\n  }\n  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n  let rooms = 0, maxRooms = 0;\n  for (const [time, delta] of events) {\n    rooms += delta;\n    maxRooms = Math.max(maxRooms, rooms);\n  }\n  return maxRooms;\n}'
      },
      {
        id: 'mi-greedy',
        title: 'Greedy Interval Selection',
        content: 'To maximize non-overlapping intervals (or minimize removals):\n\nSort by END time, not start! Always pick the one that ends earliest - leaves most room for others.\n\nThis is the Activity Selection problem from greedy algorithms.'
      }
    ],
    flashcards: [
      { id: 'mi-1', front: 'Merge Intervals\n\nGiven an array of intervals, merge all overlapping intervals and return an array of non-overlapping intervals.', back: 'Sort by start. If curr.start <= last.end → overlap → extend end.\n\nTime: O(n log n)\nSpace: O(n) for result' },
      { id: 'mi-2', front: 'Insert Interval\n\nGiven a sorted array of non-overlapping intervals and a new interval, insert the new interval and merge if necessary.', back: 'Three phases:\n1. Add all before (end < new.start)\n2. Merge overlapping (update new)\n3. Add new + all after\n\nO(n) if already sorted' },
      { id: 'mi-3', front: 'Interval List Intersections\n\nGiven two lists of closed intervals (both sorted), return the intersection of these two interval lists.', back: 'Two pointers. Intersection = [max(starts), min(ends)].\nValid if max(starts) <= min(ends).\n\nAdvance pointer with smaller end.' },
      { id: 'mi-4', front: 'Meeting Rooms (Can Attend All?)\n\nGiven an array of meeting time intervals, determine if a person could attend all meetings (no overlaps).', back: 'Sort by start. Check if any meeting starts before previous ends.\n\nintervals[i].start < intervals[i-1].end → conflict!' },
      { id: 'mi-5', front: 'Meeting Rooms II (Min Rooms)\n\nGiven an array of meeting time intervals, find the minimum number of conference rooms required.', back: 'Min heap of end times.\n\nFor each meeting: if start >= heap.top, pop (reuse room). Push new end. Return heap size.\n\nAlternative: Event sweep +1/-1' },
      { id: 'mi-6', front: 'Non-overlapping Intervals (Min Removals)\n\nGiven an array of intervals, find the minimum number of intervals to remove to make the rest non-overlapping.', back: 'Sort by END time. Greedily keep earliest ending.\n\nCount = total - kept intervals.\n\nWhy end? Earliest end leaves room for more!' },
      { id: 'mi-7', front: 'Two intervals overlap when...', back: 'a.start <= b.end AND b.start <= a.end\n\nThink: neither ends before the other starts.\n\nFor touching: use < instead of <=' },
      { id: 'mi-8', front: 'Employee Free Time\n\nGiven a list of employee schedules (each employee has a list of non-overlapping intervals), return the finite list of intervals representing common free time for all employees.', back: 'Merge ALL employees\' intervals into one list. Sort and merge.\n\nGaps between merged intervals = free time.' },
      { id: 'mi-9', front: 'Sort by START vs END?', back: 'By START: merging, detecting overlaps\nBy END: greedy selection (max non-overlapping)\n\nKnow which to use!' },
      { id: 'mi-10', front: 'Minimum Platforms (Trains)\n\nGiven arrival and departure times of trains, find the minimum number of platforms required so that no train waits.', back: 'Same as Meeting Rooms II. Track concurrent trains.\n\nEvent sweep: +1 arrival, -1 departure. Max concurrent = platforms.' },
      { id: 'mi-11', front: 'Interval Intersection Pattern', back: 'For [a,b] and [c,d]:\nIntersection: [max(a,c), min(b,d)]\nValid only if max(a,c) <= min(b,d)' },
      { id: 'mi-12', front: 'Merge Overlapping vs Insert Single', back: 'Merge: compare each to LAST merged.\nInsert: three-phase scan (before/overlap/after).\n\nBoth O(n) after sorting.' },
      { id: 'mi-13', front: 'Minimum Number of Arrows to Burst Balloons\n\nGiven an array of balloons with start and end coordinates (representing diameter), find the minimum number of arrows needed to burst all balloons (one arrow can burst all balloons its x-coordinate touches).', back: 'Same as "max non-overlapping intervals"!\n\nSort by end. One arrow per group of overlapping balloons.' },
      { id: 'mi-14', front: 'Find Right Interval\n\nGiven an array of intervals, for each interval find the smallest interval that starts after or at the end of the current interval.', back: 'Sort by start. For each interval, binary search for smallest start >= current end.\n\nO(n log n) with preprocessing.' },
      { id: 'mi-15', front: 'Event Sweep Technique', back: 'Create events: (time, +1 or -1).\nSort by time. Walk through, track running count.\n\nUseful for: room count, coverage, overlaps.' },
      { id: 'mi-16', front: 'Employee Free Time\n\nGiven a list of employee schedules, return the common free time intervals for all employees.', back: 'Merge all schedules into one sorted list. Find gaps between consecutive intervals.\n\nGap = free time for everyone.\n\nTime: O(n log n)' },
      { id: 'mi-17', front: 'Data Stream as Disjoint Intervals\n\nGiven a stream of integers, maintain disjoint intervals that cover all numbers seen so far. Support addNum() and getIntervals().', back: 'TreeMap/BST of intervals. On add: find neighbors, merge if adjacent/overlapping.\n\ngetIntervals() returns all values in order.' },
      { id: 'mi-18', front: 'Remove Covered Intervals\n\nGiven an array of intervals, remove all intervals that are covered by another interval in the list. Return the count of remaining intervals.', back: 'Sort by start ASC, then end DESC. Track max end seen.\n\nInterval covered if end <= maxEnd. Count uncovered.' },
      { id: 'mi-19', front: 'Car Pooling\n\nGiven trips array where trips[i] = [numPassengers, from, to], and car capacity, return true if it\'s possible to pick up and drop off all passengers.', back: 'Sweep line: +passengers at pickup, -passengers at dropoff.\n\nAt any point, if total > capacity, return false.' },
      { id: 'mi-20', front: 'My Calendar I/II/III\n\nImplement a calendar booking system: I (no overlaps), II (at most double booking), III (count max overlapping bookings at any time).', back: 'I: No overlaps allowed (BST or sorted list)\nII: At most 2 overlaps (track double bookings)\nIII: Count max overlaps (sweep line)' },
      { id: 'mi-21', front: 'Range Module\n\nImplement a data structure that tracks ranges of numbers. Support addRange, queryRange (check if fully tracked), removeRange.', back: 'Maintain sorted disjoint intervals. AddRange: merge overlaps. RemoveRange: split affected intervals.\n\nQueryRange: check coverage.' },
      { id: 'mi-22', front: 'Video Stitching\n\nGiven video clips array where clips[i] = [start, end], find minimum number of clips needed to cover entire sporting event [0, time].', back: 'Sort by start. Greedy: always pick interval extending farthest while connected.\n\nMinimum clips to cover [0, time].' },
      { id: 'mi-23', front: 'Merge Intervals with Labels\n\nGiven intervals with associated labels, merge overlapping intervals and track which labels apply to each resulting segment.', back: 'When intervals have labels: split at overlap points, track which labels cover each segment.\n\nUsed in calendar/timeline problems.' },
      { id: 'mi-24', front: 'Interval Overlap Check', back: 'Two intervals [a,b], [c,d] overlap if: a < d AND c < b.\n\nOr equivalently: max(a,c) < min(b,d)' },
      { id: 'mi-25', front: 'Maximum Length of Pair Chain\n\nGiven pairs where you can form a chain if b_i < a_j, find the longest chain you can form.', back: 'Like activity selection. Sort by END time.\n\nGreedy: pick earliest ending, skip overlaps.\n\nAlternative: DP O(n²)' },
      { id: 'mi-26', front: 'Teemo Attacking\n\nAshe is attacking Teemo. Given attack times array and poison duration, calculate total time Teemo is poisoned (poison durations don\'t stack).', back: 'Merge poison intervals. Total duration = sum of merged lengths.\n\nOverlapping attacks don\'t stack.' },
      { id: 'mi-27', front: 'Summary Ranges\n\nGiven a sorted unique integer array, return the smallest sorted list of ranges that cover all numbers in the array exactly.', back: 'One pass: track start of current range. When gap found, close range and start new.\n\nOutput ranges as strings.' },
      { id: 'mi-28', front: 'Partition Labels\n\nGiven a string, partition it into as many parts as possible so that each letter appears in at most one part. Return the size of each part.', back: 'Find last occurrence of each char. Extend partition end to include all chars in current partition.\n\nGreedy interval extension.' },
      { id: 'mi-29', front: 'Points That Intersect With Cars\n\nGiven an array of intervals representing cars, return the number of distinct integer points on the number line that are covered by at least one car.', back: 'Merge overlapping car intervals. Count total covered points.\n\nOr: sweep line marking coverage.' },
      { id: 'mi-30', front: 'Interval Priority Queue Pattern', back: 'Min-heap by end time tracks "active" intervals.\n\nUsed in: Meeting Rooms II, Task Scheduler with cooldown.' }
    ],
    quizQuestions: [
      {
        id: 'mi-q1',
        question: 'When merging intervals, why sort by start time?',
        options: ['Arbitrary choice', 'So we can compare each interval with just the last merged one', 'It\'s faster', 'To handle edge cases'],
        correctAnswer: 1,
        explanation: 'Sorting by start ensures that if interval A comes after B in sorted order, A cannot overlap with anything before B. We only need to check against the last interval.'
      },
      {
        id: 'mi-q2',
        question: 'Two intervals [1,5] and [4,8] merge into:',
        options: ['[1,8]', '[4,5]', '[1,5] and [4,8] separately', '[1,4]'],
        correctAnswer: 0,
        explanation: 'They overlap (4 <= 5). Merged = [min(1,4), max(5,8)] = [1,8]. The merged interval spans from earliest start to latest end.'
      },
      {
        id: 'mi-q3',
        question: 'For "Non-overlapping Intervals" (minimize removals), why sort by end time?',
        options: ['Arbitrary convention', 'Earliest ending interval leaves most room for others', 'End times are smaller numbers', 'It handles duplicates'],
        correctAnswer: 1,
        explanation: 'Greedy insight: picking intervals that end earliest leaves maximum room for subsequent intervals, maximizing the count we can keep.'
      },
      {
        id: 'mi-q4',
        question: 'In Meeting Rooms II, what does the min heap store?',
        options: ['Start times', 'End times of ongoing meetings', 'Room numbers', 'Meeting durations'],
        correctAnswer: 1,
        explanation: 'The min heap stores end times. When a new meeting starts, we check if it can reuse the room of the earliest-ending meeting (heap top).'
      },
      {
        id: 'mi-q5',
        question: 'What\'s the time complexity of merging n intervals?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 1,
        explanation: 'Sorting takes O(n log n). The merge pass is O(n). Sorting dominates, so overall O(n log n).'
      },
      {
        id: 'mi-q6',
        question: 'For interval intersection, given [1,5] and [3,7], what\'s the intersection?',
        options: ['[1,7]', '[3,5]', '[1,3]', 'No intersection'],
        correctAnswer: 1,
        explanation: 'Intersection = [max(1,3), min(5,7)] = [3,5]. This is where both intervals overlap.'
      },
      {
        id: 'mi-q7',
        question: 'In the event sweep technique for room counting, if events are (10,+1), (10,-1), how should they be ordered?',
        options: ['Doesn\'t matter', '-1 before +1 (departures first)', '+1 before -1 (arrivals first)', 'Randomly'],
        correctAnswer: 1,
        explanation: 'Process departures before arrivals at the same time. A room freed at time 10 can be used by a meeting starting at time 10. This avoids overcounting.'
      },
      {
        id: 'mi-q8',
        question: 'What makes "Minimum Arrows to Burst Balloons" an interval problem?',
        options: ['Balloons are circles', 'Each balloon has an x-range that is an interval', 'It involves sorting', 'It uses a heap'],
        correctAnswer: 1,
        explanation: 'Each balloon spans an x-range [xstart, xend]. Overlapping balloons can be burst with one arrow. Finding minimum arrows = finding minimum groups of overlapping intervals.'
      },
      {
        id: 'mi-q9',
        question: 'For Employee Free Time (multiple employees with busy intervals), what\'s the approach?',
        options: ['Check each pair of employees', 'Merge all intervals, gaps are free time', 'Use a priority queue sorted by employee', 'Binary search each time slot'],
        correctAnswer: 1,
        explanation: 'Flatten all employee schedules into one list, sort by start, merge overlapping. Gaps between merged intervals are the common free time slots.'
      },
      {
        id: 'mi-q10',
        question: 'Given two sorted interval lists, what\'s the optimal way to find all intersections?',
        options: ['Merge then scan', 'Two pointers, advance smaller end', 'Binary search for each', 'Nested loops O(n×m)'],
        correctAnswer: 1,
        explanation: 'Two pointers: compute intersection [max(starts), min(ends)]. If valid, add it. Advance the pointer with smaller end since that interval can\'t produce more intersections. O(n+m) time.'
      },
      {
        id: 'mi-q11',
        question: 'What\'s the key insight for "Remove Covered Intervals"?',
        options: ['Sort by end time only', 'Sort by start ASC, then end DESC', 'Use a heap', 'Binary search for coverage'],
        correctAnswer: 1,
        explanation: 'Sort by start ascending. For same starts, longer (larger end) comes first. Then scan: if current end > max_end seen, it\'s not covered. This groups potential covering intervals together.'
      },
      {
        id: 'mi-q12',
        question: 'For "Meeting Rooms" (can attend all?), what\'s the most efficient approach?',
        options: ['Check all pairs O(n²)', 'Sort by start, check adjacent pairs', 'Use a heap', 'Use interval tree'],
        correctAnswer: 1,
        explanation: 'Sort by start time, then check if any meeting starts before the previous one ends: if intervals[i].start < intervals[i-1].end, there\'s a conflict. O(n log n) time.'
      },
      {
        id: 'mi-q13',
        question: 'In "Meeting Rooms II", what does the heap contain?',
        options: ['All meetings', 'Meeting start times', 'Meeting end times of active meetings', 'Room numbers'],
        correctAnswer: 2,
        explanation: 'The min heap stores end times of currently active meetings. For each new meeting, if its start >= min end time, we can reuse that room (pop and push new end). Heap size = rooms needed.'
      },
      {
        id: 'mi-q14',
        question: 'For "Employee Free Time", what\'s the approach when employees have multiple intervals each?',
        options: ['Process each employee separately', 'Flatten all intervals, merge, find gaps', 'Use multiple heaps', 'Dynamic programming'],
        correctAnswer: 1,
        explanation: 'Combine all intervals from all employees into one list, sort by start time, merge overlapping intervals, then find gaps between merged intervals. Gaps = common free time.'
      },
      {
        id: 'mi-q15',
        question: 'What\'s the event sweep technique for interval problems?',
        options: ['Sort events', 'Create +1 at starts, -1 at ends, sort all events, sweep through tracking running count', 'Use recursion', 'Binary search'],
        correctAnswer: 1,
        explanation: 'Convert intervals to events: +1 at start, -1 at end. Sort events by time (break ties: end before start). Sweep through, tracking active count. Maximum count = answer for "max concurrent".'
      },
      {
        id: 'mi-q16',
        question: 'For "Minimum Arrows to Burst Balloons", why sort by end position?',
        options: ['It\'s arbitrary', 'Shooting at earliest end point maximizes chances of hitting overlapping balloons', 'End points are unique', 'Start positions might be negative'],
        correctAnswer: 1,
        explanation: 'Greedy: shoot arrow at first balloon\'s end. This arrow bursts all balloons that overlap with this point. Sort by end ensures we maximize overlap coverage. Same as max non-overlapping intervals.'
      },
      {
        id: 'mi-q17',
        question: 'In "Insert Interval", during the merge phase, how do you update the new interval?',
        options: ['Replace it entirely', 'Extend start = min, end = max with each overlapping interval', 'Add to list', 'Split it'],
        correctAnswer: 1,
        explanation: 'For each overlapping interval: newInterval.start = min(newInterval.start, curr.start), newInterval.end = max(newInterval.end, curr.end). This merges all overlapping into one.'
      },
      {
        id: 'mi-q18',
        question: 'What\'s the time complexity of "Merge Intervals"?',
        options: ['O(n)', 'O(n log n) due to sorting', 'O(n²)', 'O(n log n) due to heap'],
        correctAnswer: 1,
        explanation: 'Sorting takes O(n log n), then a single O(n) pass to merge. Overall: O(n log n). The merging step is linear because we process each interval exactly once.'
      },
      {
        id: 'mi-q19',
        question: 'For intervals that "touch" but don\'t overlap (e.g., [1,2] and [2,3]), how do you handle them?',
        options: ['Always merge them', 'Never merge them', 'Depends on problem: check if condition is < or <=', 'They are invalid intervals'],
        correctAnswer: 2,
        explanation: 'Some problems consider touching intervals as overlapping (merge [1,2] and [2,3]), others don\'t. Check if the overlap condition uses curr.start <= prev.end (merge touching) or < (don\'t merge).'
      },
      {
        id: 'mi-q20',
        question: 'For "Non-overlapping Intervals", what do you return after finding max non-overlapping count?',
        options: ['The count itself', 'Total intervals minus non-overlapping count', 'The intervals themselves', 'Nothing, just the boolean'],
        correctAnswer: 1,
        explanation: 'The problem asks for minimum removals. If you can keep K non-overlapping intervals, you must remove (total - K) intervals. Greedy by end time finds the maximum K.'
      }
    ]
  },
  {
    id: 'cyclic-sort',
    name: 'Cyclic Sort',
    slug: 'cyclic-sort',
    description: 'Sort arrays containing numbers in a given range using the cyclic sort pattern.',
    icon: 'RefreshCw',
    color: '#17A2B8',
    premium: true,
    colorDark: '#138496',
    learnContent: [
      {
        id: 'cs-intro',
        title: 'What is Cyclic Sort?',
        content: 'When an array contains numbers from 1 to n (or 0 to n-1), each number has exactly one "correct" position. Cyclic sort places each number at its correct index in O(n) time and O(1) space - no extra array needed!',
      },
      {
        id: 'cs-pattern',
        title: 'The Core Pattern',
        content: 'For number x in range [1, n]: correct index = x - 1\nFor number x in range [0, n-1]: correct index = x\n\nKeep swapping until current position has correct element. Then move to next position.',
        codeExample: 'function cyclicSort(nums) {\n  let i = 0;\n  while (i < nums.length) {\n    const correctIdx = nums[i] - 1; // For [1,n]\n    if (nums[i] !== nums[correctIdx]) {\n      // Swap to correct position\n      [nums[i], nums[correctIdx]] = [nums[correctIdx], nums[i]];\n      // Don\'t increment i - check new swapped value\n    } else {\n      i++; // Already correct, move on\n    }\n  }\n  return nums;\n}'
      },
      {
        id: 'cs-why',
        title: 'Why O(n) Time?',
        content: 'The nested while loop looks like O(n²), but each swap places exactly one element in its final position. With n elements and at most n swaps total, it\'s O(n).\n\nThis is amortized analysis - same concept as sliding window!',
      },
      {
        id: 'cs-missing',
        title: 'Finding Missing Numbers',
        content: 'After cyclic sort, scan for mismatches:\n• nums[i] ≠ i + 1 → (i + 1) is missing\n\nWorks because every correct number is in place; only missing numbers leave gaps.',
        codeExample: 'function findMissing(nums) {\n  // Cyclic sort first\n  let i = 0;\n  while (i < nums.length) {\n    const j = nums[i] - 1;\n    if (nums[i] > 0 && nums[i] <= nums.length && nums[i] !== nums[j]) {\n      [nums[i], nums[j]] = [nums[j], nums[i]];\n    } else {\n      i++;\n    }\n  }\n  // Find mismatch\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== i + 1) return i + 1;\n  }\n  return nums.length + 1;\n}'
      },
      {
        id: 'cs-duplicates',
        title: 'Finding Duplicates',
        content: 'During cyclic sort: if target position already has the correct value, we found a duplicate!\n\nAfter sort: values at wrong positions are duplicates (they couldn\'t find an empty correct spot).',
        codeExample: 'function findDuplicates(nums) {\n  let i = 0;\n  while (i < nums.length) {\n    const j = nums[i] - 1;\n    if (nums[i] !== nums[j]) {\n      [nums[i], nums[j]] = [nums[j], nums[i]];\n    } else {\n      i++;\n    }\n  }\n  const duplicates = [];\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== i + 1) {\n      duplicates.push(nums[i]);\n    }\n  }\n  return duplicates;\n}'
      },
      {
        id: 'cs-first-positive',
        title: 'First Missing Positive',
        content: 'The hardest cyclic sort problem! Array can have negatives, zeros, and numbers > n.\n\nKey insight: answer is in range [1, n+1]. Ignore invalid numbers during sort. First mismatch = answer.',
      }
    ],
    flashcards: [
      { id: 'cs-1', front: 'Cyclic Sort Pattern', back: 'For [1,n]: correctIdx = num - 1\nFor [0,n-1]: correctIdx = num\n\nSwap until correct, then advance.\nO(n) time, O(1) space.' },
      { id: 'cs-2', front: 'Find the Missing Number\n\nGiven an array containing n distinct numbers in the range [0, n], find the one number that is missing from the array.', back: 'Array [0, n-1] with one missing.\n\nCyclic sort, find mismatch.\nOr: XOR all indices and values (XOR approach).\nOr: Sum formula n(n+1)/2 - sum.' },
      { id: 'cs-3', front: 'Find All Missing Numbers\n\nGiven an array of n integers where nums[i] is in the range [1, n], find all the numbers in the range [1, n] that do not appear in the array.', back: 'After cyclic sort, scan for nums[i] ≠ i + 1.\n\nMissing numbers = i + 1 for each mismatch.' },
      { id: 'cs-4', front: 'Find the Duplicate Number\n\nGiven an array of n+1 integers where each integer is in the range [1, n], find the one number that appears more than once.', back: 'Array [1, n] with one duplicate, one missing.\n\nCyclic sort: if target already correct → duplicate!\nOr: Fast-slow pointers (Floyd\'s cycle).' },
      { id: 'cs-5', front: 'Find All Duplicates\n\nGiven an array of n integers where nums[i] is in the range [1, n], find all the integers that appear twice in the array.', back: 'After cyclic sort, values at wrong positions are duplicates.\n\nThey couldn\'t find their correct spot (already taken).' },
      { id: 'cs-6', front: 'First Missing Positive\n\nGiven an unsorted integer array (which may contain negative numbers and zeros), find the smallest missing positive integer.', back: 'Array can have ANY integers. Answer in [1, n+1].\n\nCyclic sort positives 1 to n only. Ignore rest.\nFirst mismatch = answer.' },
      { id: 'cs-7', front: 'Corrupt Pair (Missing + Duplicate)\n\nGiven an array where one number appears twice and one number from [1, n] is missing, find both the duplicate and the missing number.', back: 'After cyclic sort, find position where nums[i] ≠ i + 1.\n\nDuplicate = nums[i]\nMissing = i + 1' },
      { id: 'cs-8', front: 'Why not increment i after swap?', back: 'The swapped-in value might also be wrong!\n\nMust check new value before moving on.\nOnly advance when nums[i] is correct.' },
      { id: 'cs-9', front: 'Cyclic Sort vs Counting Sort', back: 'Both O(n) for range [1,n].\n\nCounting: O(n) extra space.\nCyclic: O(1) space, in-place!' },
      { id: 'cs-10', front: 'When to skip during cyclic sort?', back: 'Skip when:\n• Already correct (nums[i] == nums[correctIdx])\n• Out of range (for First Missing Positive)\n• Negative or zero (for positive-only problems)' },
      { id: 'cs-11', front: 'Find K Missing Positive Integers\n\nGiven an unsorted array and an integer k, find the first k missing positive integers from the array.', back: 'Cyclic sort, then collect missing. If < k found, continue with n+1, n+2, etc.\n\nOr: Binary search approach O(log n).' },
      { id: 'cs-12', front: 'Cyclic Sort on [0, n-1] range', back: 'CorrectIdx = nums[i] (not num - 1)\n\nSame pattern, different index mapping.' },
      { id: 'cs-13', front: 'Why is time O(n) with nested loop?', back: 'Each swap places one element permanently.\nMax n swaps total, not per iteration.\n\nAmortized: total work / n iterations = O(1) per.' },
      { id: 'cs-14', front: 'Set Mismatch\n\nGiven an array representing a set which should contain numbers 1 to n, but one number appears twice and one is missing, find both numbers.', back: 'One duplicate, one missing.\n\nCyclic sort → find wrong position.\nDuplicate = value there, Missing = expected value.' },
      { id: 'cs-15', front: 'Cyclic Sort Key Recognition', back: 'Keywords: "range 1 to n", "find missing", "find duplicate", "continuous integers"\n\nO(1) space requirement is a hint!' },
      { id: 'cs-16', front: 'First Missing Positive O(1) Space', back: 'Use array as hash map. Place each positive in its correct index.\n\nFirst index where value != index+1 is answer.\n\nRange: only care about [1, n]' },
      { id: 'cs-17', front: 'Couples Holding Hands\n\nGiven n couples sitting in 2n seats where each couple should sit together, find the minimum number of swaps to arrange all couples next to each other.', back: 'Cyclic sort variant. Couple i should be at positions 2i, 2i+1.\n\nSwap misplaced people to their partner\'s position.\n\nMinimum swaps = cycles.' },
      { id: 'cs-18', front: 'Find All Numbers Disappeared in Array\n\nGiven an array of n integers in the range [1, n] with some numbers appearing multiple times, find all numbers in [1, n] that don\'t appear in the array.', back: 'Cyclic sort to place nums. Then scan: if nums[i] != i+1, then i+1 is missing.\n\nCollect all missing in one pass.' },
      { id: 'cs-19', front: 'Duplicate Number Without Modifying Array\n\nGiven an array of n+1 integers in range [1, n], find the duplicate number without modifying the array and using only constant extra space.', back: 'Can\'t use cyclic sort directly. Use Floyd\'s cycle detection!\n\nTreat values as next pointers. Duplicate creates cycle.' },
      { id: 'cs-20', front: 'Index as Hash Key Trick', back: 'Mark visited by negating: nums[abs(num)-1] *= -1.\n\nSecond visit to same index = duplicate.\n\nPositive indices = missing numbers.' },
      { id: 'cs-21', front: 'Array Nesting (Longest Set Size)\n\nGiven an array where nums[i] represents the next index to visit, find the longest set you can form by following the indices until you return to the starting index.', back: 'Related to cyclic structure. Each start forms a cycle.\n\nCycle length = set size. Mark visited to avoid recount.' },
      { id: 'cs-22', front: 'Minimum Swaps to Sort\n\nGiven an unsorted array of distinct elements, find the minimum number of swaps required to sort the array in ascending order.', back: 'Build position map. Cyclic sort logic: count swaps needed.\n\nEach cycle of length k needs k-1 swaps.' },
      { id: 'cs-23', front: 'Smallest Missing Positive Integer\n\nGiven an unsorted array of integers, find the smallest positive integer (starting from 1) that does not appear in the array.', back: 'Ignore negatives, zeros, and > n. Place valid nums in correct spots.\n\nFirst empty/wrong slot = answer.' },
      { id: 'cs-24', front: 'Cyclic Sort vs Counting Sort', back: 'Cyclic: O(1) space, in-place rearrangement.\nCounting: O(k) space, separate count array.\n\nCyclic when you need the rearranged array.' },
      { id: 'cs-25', front: 'Find Corrupt Pair\n\nGiven an array that should contain numbers 1 to n but has one duplicate and one missing number, identify both the duplicate and missing values.', back: 'After cyclic sort: position with wrong value reveals both.\n\nDuplicate = actual value there.\nMissing = expected value (i+1).' },
      { id: 'cs-26', front: 'Handling Duplicates in Cyclic Sort', back: 'When nums[i] == nums[correctIdx], skip (already have one there).\n\nAvoids infinite loop on duplicates.' },
      { id: 'cs-27', front: 'Cycle Detection via Cyclic Sort', back: 'Values form implicit graph: i → nums[i].\n\nCyclic sort reveals cycle structure.\n\nUseful for permutation cycle problems.' },
      { id: 'cs-28', front: 'Range [0, n] with One Missing\n\nGiven an array containing n numbers taken from the range [0, n], find the one number that is missing.', back: 'XOR all values and indices. Result = missing number.\n\nOr: sum formula n(n+1)/2 - actualSum.' },
      { id: 'cs-29', front: 'In-Place Array Shuffle\n\nGiven an array with elements arranged as [a1,a2,...,an,b1,b2,...,bn], rearrange it to [a1,b1,a2,b2,...,an,bn] in-place.', back: 'Cyclic sort variant for specific arrangements.\n\nShuffle [a1,a2,a3,b1,b2,b3] → [a1,b1,a2,b2,a3,b3]\n\nFormula maps old index to new.' },
      { id: 'cs-30', front: 'Find Duplicate and Missing Together\n\nGiven an array that should contain numbers 1 to n but one number is duplicated and one is missing, find both numbers simultaneously.', back: 'Use sign marking or math:\n\nsum_diff = expected - actual = missing - duplicate\nsum_sq_diff gives second equation.\n\nSolve for both.' }
    ],
    quizQuestions: [
      {
        id: 'cs-q1',
        question: 'When should you use cyclic sort?',
        options: ['Any sorting problem', 'Arrays with numbers in range [1, n] or [0, n-1]', 'Linked lists', 'Strings'],
        correctAnswer: 1,
        explanation: 'Cyclic sort requires a known range where each number has a predictable "correct" position. It\'s O(n) time, O(1) space for this specific case.'
      },
      {
        id: 'cs-q2',
        question: 'For number 5 in a [1, n] array, what is its correct index?',
        options: ['5', '4', '6', '0'],
        correctAnswer: 1,
        explanation: 'In a [1, n] array placed in 0-indexed positions, number x belongs at index x - 1. So 5 belongs at index 4.'
      },
      {
        id: 'cs-q3',
        question: 'Why don\'t we increment i after a swap?',
        options: ['It\'s a bug', 'The swapped-in value might also be in the wrong position', 'To make it O(n)', 'It doesn\'t matter'],
        correctAnswer: 1,
        explanation: 'After swapping, the new value at position i might also need to be swapped. We must check it before moving to i+1.'
      },
      {
        id: 'cs-q4',
        question: 'Why is cyclic sort O(n) despite the nested while loop?',
        options: ['The inner loop runs at most n times total', 'The compiler optimizes it', 'It\'s actually O(n²)', 'The array is already nearly sorted'],
        correctAnswer: 0,
        explanation: 'Each swap places exactly one element in its final position. With n elements, at most n swaps total. This is amortized O(n).'
      },
      {
        id: 'cs-q5',
        question: 'In "First Missing Positive", why is the answer guaranteed to be in [1, n+1]?',
        options: ['By definition', 'If 1 to n are all present, answer is n+1; otherwise, some number in [1,n] is missing', 'It\'s an assumption', 'The array is sorted'],
        correctAnswer: 1,
        explanation: 'With n positions, we can hold at most n distinct positive integers. If [1,n] are all present, answer is n+1. Otherwise, something in [1,n] is missing.'
      },
      {
        id: 'cs-q6',
        question: 'After cyclic sort, if nums[3] = 7, what does this tell us?',
        options: ['7 is missing', '4 is missing', '4 is the duplicate, 7 is misplaced', '7 is a duplicate (couldn\'t go to its correct position 6)'],
        correctAnswer: 3,
        explanation: 'If nums[3] should be 4 but contains 7, it means 7 couldn\'t go to index 6 (already had 7 there) - so 7 is a duplicate.'
      },
      {
        id: 'cs-q7',
        question: 'What\'s the space complexity of cyclic sort?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'Cyclic sort works in-place, only using a few variables for swapping. This O(1) space is its key advantage over counting sort.'
      },
      {
        id: 'cs-q8',
        question: 'For the "Set Mismatch" problem, after cyclic sort, what\'s at the wrong position?',
        options: ['The missing number', 'The duplicate number', 'Both', 'Neither'],
        correctAnswer: 1,
        explanation: 'The duplicate is at the position where the missing number should be. nums[i] = duplicate, and i+1 = missing.'
      },
      {
        id: 'cs-q9',
        question: 'In "Find All Numbers Disappeared in Array", how do you handle duplicates during cyclic sort?',
        options: ['Throw an error', 'Skip if target position already has the correct value', 'Replace anyway', 'Use a hash set'],
        correctAnswer: 1,
        explanation: 'If nums[correctIdx] already equals nums[i], don\'t swap (would be infinite loop). Just move on. These positions with wrong values after sort indicate which numbers are missing.'
      },
      {
        id: 'cs-q10',
        question: 'For "Find the Duplicate Number" with O(1) space constraint and can\'t modify array, what pattern works?',
        options: ['Cyclic sort', 'Binary search on value range', 'Two pointers (Floyd\'s cycle)', 'Bit manipulation'],
        correctAnswer: 2,
        explanation: 'Floyd\'s cycle detection: treat nums[i] as pointer to next index. There\'s a cycle because of the duplicate. Fast-slow pointers find the duplicate like finding cycle start in linked list.'
      },
      {
        id: 'cs-q11',
        question: 'What makes "First Missing Positive" harder than other cyclic sort problems?',
        options: ['Array is larger', 'Numbers can be negative, zero, or > n', 'Numbers aren\'t integers', 'Array is sorted'],
        correctAnswer: 1,
        explanation: 'The array can contain any integer. Key insight: answer must be in [1, n+1]. Ignore values outside [1, n] during cyclic sort since they can\'t be the answer (or block a correct answer).'
      },
      {
        id: 'cs-q12',
        question: 'Cyclic sort swaps each element at most how many times?',
        options: ['log n times', 'Once', 'n times', 'Twice'],
        correctAnswer: 1,
        explanation: 'Each element is swapped at most once into its correct position. Once there, it\'s never moved again. This is why total swaps ≤ n, giving O(n) time despite nested loop.'
      },
      {
        id: 'cs-q13',
        question: 'For "Find All Missing Numbers", after cyclic sort, which positions reveal the missing numbers?',
        options: ['Positions with zero values', 'Positions where nums[i] != i + 1', 'First and last positions', 'Even positions only'],
        correctAnswer: 1,
        explanation: 'After cyclic sort, each number should be at index (number - 1). If nums[i] != i + 1, then (i + 1) is missing. The value at that position is a duplicate that took a missing number\'s spot.'
      },
      {
        id: 'cs-q14',
        question: 'In "Find the Duplicate Number", why does cyclic sort work when there are values 1 to n in array of size n+1?',
        options: ['It doesn\'t work', 'One value appears twice so one position will have a conflict', 'Extra space is used', 'Array is sorted first'],
        correctAnswer: 1,
        explanation: 'With n+1 positions but only n distinct correct positions (for 1 to n), the duplicate has nowhere unique to go. When we try to place it, target already has the same value = duplicate found!'
      },
      {
        id: 'cs-q15',
        question: 'What\'s the key insight for "First Missing Positive" using cyclic sort?',
        options: ['Use a hash set instead', 'Answer must be in range [1, n+1], so ignore values outside this range', 'Sort then binary search', 'Count all positives'],
        correctAnswer: 1,
        explanation: 'First missing positive is at most n+1 (if 1 to n all present). Ignore values ≤ 0 or > n during cyclic sort. After sort, first position where nums[i] != i+1 gives the answer, or n+1 if all match.'
      },
      {
        id: 'cs-q16',
        question: 'How does "Set Mismatch" (find duplicate and missing) differ from standard cyclic sort problems?',
        options: ['Uses different algorithm', 'After sort, wrong position reveals both: position+1 is missing, value there is duplicate', 'Requires two passes', 'Can\'t use cyclic sort'],
        correctAnswer: 1,
        explanation: 'After cyclic sort, find position i where nums[i] != i+1. The missing number is (i+1), and the duplicate is nums[i]. Both found with a single mismatch!'
      },
      {
        id: 'cs-q17',
        question: 'Why doesn\'t cyclic sort work for general sorting (arbitrary values)?',
        options: ['Too slow', 'Values must map to valid array indices (bounded range)', 'Requires extra space', 'Only works on linked lists'],
        correctAnswer: 1,
        explanation: 'Cyclic sort places value x at index x-1 (or similar mapping). This only works when values are in a bounded range like [1,n]. Arbitrary values would map to invalid or conflicting indices.'
      },
      {
        id: 'cs-q18',
        question: 'For "Find All Duplicates in Array", what tells us a value is a duplicate during cyclic sort?',
        options: ['Value is negative', 'Target position already has the correct value (nums[i] == nums[nums[i]-1] but i != nums[i]-1)', 'Value is zero', 'Position is even'],
        correctAnswer: 1,
        explanation: 'When we try to swap value x to position x-1, if that position already holds x (and we\'re not at position x-1), then x is a duplicate. One copy is already correctly placed.'
      },
      {
        id: 'cs-q19',
        question: 'What\'s the space complexity of finding missing/duplicate numbers using cyclic sort?',
        options: ['O(n)', 'O(log n)', 'O(1) - in-place modification', 'O(k) where k is count of missing'],
        correctAnswer: 2,
        explanation: 'Cyclic sort modifies the array in-place. No additional data structures needed except a few pointers/counters. This is the main advantage over hash-based approaches.'
      },
      {
        id: 'cs-q20',
        question: 'In the cyclic sort loop, when do you increment i vs stay at the same position?',
        options: ['Always increment', 'Stay when swap happens (new value needs checking), increment when already correct', 'Random', 'Increment when swap happens'],
        correctAnswer: 1,
        explanation: 'After a swap, the new value at position i might also need to be swapped. Stay at i to check it. Only increment when nums[i] is already at the correct position or can\'t be placed (duplicate/out of range).'
      }
    ]
  },
  {
    id: 'linked-list-reversal',
    name: 'In-Place Linked List Reversal',
    slug: 'linked-list-reversal',
    description: 'Reverse linked lists and sublists in-place without extra memory.',
    icon: 'Undo2',
    color: '#DDA0DD',
    premium: true,
    colorDark: '#C890C8',
    learnContent: [
      {
        id: 'llr-intro',
        title: 'In-Place Reversal',
        content: 'Reversing a linked list means changing each node\'s next pointer to point to its previous node. The challenge: once you change a pointer, you lose access to the rest of the list!\n\nSolution: Save next pointer before overwriting.',
      },
      {
        id: 'llr-iterative',
        title: 'Iterative Approach',
        content: 'Three pointers working together:\n• prev: what current should point to\n• curr: node we\'re processing\n• next: saved reference to continue\n\n4 steps per iteration: save → reverse → advance prev → advance curr',
        codeExample: 'function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next; // 1. Save next\n    curr.next = prev;       // 2. Reverse pointer\n    prev = curr;            // 3. Advance prev\n    curr = next;            // 4. Advance curr\n  }\n  return prev; // New head\n}'
      },
      {
        id: 'llr-recursive',
        title: 'Recursive Approach',
        content: 'Think backwards! Reverse the rest of the list, then fix the connection.\n\nBase case: empty or single node.\nRecursive case: reverse rest, then node.next.next = node (make next point back to me).',
        codeExample: 'function reverseList(head) {\n  // Base case\n  if (!head || !head.next) return head;\n  \n  // Recursively reverse the rest\n  const newHead = reverseList(head.next);\n  \n  // Fix the connection\n  head.next.next = head; // Next node points back to me\n  head.next = null;      // I point to null (for now)\n  \n  return newHead; // New head is from deepest call\n}'
      },
      {
        id: 'llr-sublist',
        title: 'Reverse Sublist [left, right]',
        content: 'Harder variation! Need to:\n1. Traverse to node before left\n2. Reverse nodes from left to right\n3. Reconnect: before → new first, old first → after\n\nUse a dummy node to handle edge case when left = 1.',
        codeExample: 'function reverseBetween(head, left, right) {\n  const dummy = { next: head };\n  let before = dummy;\n  \n  // Move to node before left\n  for (let i = 1; i < left; i++) before = before.next;\n  \n  // Reverse from left to right\n  let prev = before.next; // Will be last after reverse\n  let curr = prev.next;\n  for (let i = 0; i < right - left; i++) {\n    prev.next = curr.next;\n    curr.next = before.next;\n    before.next = curr;\n    curr = prev.next;\n  }\n  \n  return dummy.next;\n}'
      },
      {
        id: 'llr-kgroup',
        title: 'Reverse Nodes in K-Group',
        content: 'Reverse every k consecutive nodes. Key challenges:\n• Check if k nodes remain before reversing\n• Connect reversed groups properly\n• Handle remaining nodes (< k) without reversing\n\nUse helper function to count and reverse.',
      },
      {
        id: 'llr-tips',
        title: 'Pro Tips',
        content: '• Always use a dummy node for edge cases (reversing from head)\n• Draw the state before and after each operation\n• Track both the original head (becomes tail) and new head\n• For sublist reversal: save references to "before" and "after" nodes'
      }
    ],
    flashcards: [
      { id: 'llr-1', front: 'Reverse Entire Linked List\n\nGiven the head of a singly linked list, reverse the list and return the new head.', back: 'Iterative: prev=null, curr=head. Save next, point to prev, advance both.\n\nRecursive: Reverse rest, then head.next.next = head.\n\nO(n) time, O(1) or O(n) space.' },
      { id: 'llr-2', front: 'Why save next before reversing?', back: 'Once you set curr.next = prev, you lose the pointer to the rest of the list!\n\nMust save curr.next first to continue traversal.' },
      { id: 'llr-3', front: 'After iterative reversal, what\'s the new head?', back: 'prev (not curr!)\n\nWhen loop ends, curr is null, prev points to last processed node = new head.' },
      { id: 'llr-4', front: 'Reverse Sublist [left, right]\n\nGiven a linked list and two positions left and right, reverse the nodes from position left to position right (1-indexed).', back: '1. Find node before left\n2. Reverse right-left+1 nodes\n3. Reconnect ends\n\nUse dummy node for left=1 case.' },
      { id: 'llr-5', front: 'Reverse Nodes in K-Group\n\nGiven a linked list and an integer k, reverse the nodes of the list k at a time, leaving any remaining nodes (fewer than k) unchanged.', back: 'Check if k nodes exist. Reverse k nodes. Connect to next group\'s result.\n\nLeave last group (< k) as-is.\n\nO(n) time, O(1) space.' },
      { id: 'llr-6', front: 'Reverse Alternating K Nodes\n\nGiven a linked list and integer k, reverse every alternating k-node group (reverse first k, skip next k, reverse next k, etc.).', back: 'Reverse k nodes, skip k nodes, repeat.\n\nTrack tail of reversed section to connect to skipped section.' },
      { id: 'llr-7', front: 'Rotate List Right by K\n\nGiven a linked list and integer k, rotate the list to the right by k places.', back: '1. Find length and tail\n2. K = K % length\n3. Make circular (tail.next = head)\n4. Break at length - K\n\nNew head is at length - K.' },
      { id: 'llr-8', front: 'Why use a dummy node?', back: 'Handles edge cases where head changes:\n• Reverse from position 1\n• Delete head node\n• Any operation that might return a new head\n\nReturn dummy.next as new head.' },
      { id: 'llr-9', front: 'Recursive vs Iterative Reversal', back: 'Iterative: O(1) space, faster\nRecursive: O(n) stack space, elegant\n\nFor interviews, know both. Iterative is usually preferred.' },
      { id: 'llr-10', front: 'Swap Nodes in Pairs\n\nGiven a linked list, swap every two adjacent nodes and return the new head.', back: 'Special case of K-group with K=2.\n\nFor each pair: save next pair, reverse pair, connect to result of recursion.' },
      { id: 'llr-11', front: 'Reverse and Clone', back: 'Sometimes you need reversed copy without modifying original.\n\nBuild new list while traversing, inserting at front.' },
      { id: 'llr-12', front: 'Common mistake in reversal', back: 'Forgetting to set old head\'s next to null!\n\nIn iterative: happens naturally (prev starts as null).\nIn recursive: must explicitly set head.next = null.' },
      { id: 'llr-13', front: 'Palindrome Linked List\n\nGiven a singly linked list, determine if it is a palindrome (reads the same forward and backward).', back: '1. Find middle (fast-slow)\n2. Reverse second half\n3. Compare halves\n4. (Optional) Restore\n\nCombines reversal with other patterns!' },
      { id: 'llr-14', front: 'Reverse using stack', back: 'O(n) space alternative: push all nodes to stack, pop to rebuild.\n\nEasier to implement but wastes space.\n\nGood for understanding, not for interviews.' },
      { id: 'llr-15', front: 'Sublist reversal pointer dance', back: 'For left to right reversal:\n• before.next changes each iteration\n• prev (original left) slowly moves right\n• curr gets inserted after before repeatedly' },
      { id: 'llr-16', front: 'Reverse Linked List II (positions m to n)\n\nGiven a linked list and two 1-indexed positions m and n, reverse the nodes from position m to position n.', back: 'Find node before m. Reverse m to n using iterative method.\n\nReconnect: before → reversed_head, reversed_tail → after.' },
      { id: 'llr-17', front: 'Reverse Alternating K Nodes\n\nGiven a linked list and an integer k, reverse every other group of k nodes (reverse first k, skip next k, reverse next k, and so on).', back: 'Reverse K, skip K, repeat. Track previous tail to connect segments.\n\nUse counter to switch between modes.' },
      { id: 'llr-18', front: 'Add Two Numbers (Reversed)\n\nGiven two non-empty linked lists representing two non-negative integers stored in reverse order (least significant digit first), add the two numbers and return the sum as a linked list.', back: 'Numbers stored in reverse (LSD first). Add digit by digit with carry.\n\nCreate new nodes for result. Handle final carry!' },
      { id: 'llr-19', front: 'Plus One Linked List\n\nGiven a non-negative integer represented as a linked list of digits (most significant digit first), add one to the number.', back: 'Find rightmost non-9. Increment it, set all following to 0.\n\nOr: reverse, add, reverse back. Handle carry overflow.' },
      { id: 'llr-20', front: 'Reverse Every Other Group', back: 'Odd groups: reverse. Even groups: keep order.\n\nTrack group number, apply reversal conditionally.' },
      { id: 'llr-21', front: 'Iterative vs Recursive Trade-offs', back: 'Iterative: O(1) space, slightly faster.\nRecursive: cleaner code, O(n) stack space.\n\nChoose based on constraints and preference.' },
      { id: 'llr-22', front: 'Reverse Doubly Linked List\n\nGiven the head of a doubly linked list, reverse the list and return the new head.', back: 'Swap prev and next for each node. Update head pointer.\n\nSimpler than singly linked: no need for third pointer.' },
      { id: 'llr-23', front: 'Insertion Sort on Linked List\n\nGiven a linked list, sort it using insertion sort algorithm in-place.', back: 'Build sorted portion. For each node, find correct position by traversal.\n\nO(n²) time, O(1) space.' },
      { id: 'llr-24', front: 'Reverse Print without Reversing', back: 'Use recursion: print after recursive call.\n\nOr: use stack. Doesn\'t modify original list.' },
      { id: 'llr-25', front: 'Partial Reverse Reconnection', back: 'Key pointers for m-to-n reversal:\n• before: node at position m-1\n• tail: original node at m (becomes tail of reversed)\n• Connect correctly after reversal.' },
      { id: 'llr-26', front: 'Reverse Words in Linked List\n\nGiven a linked list where each node represents a character and words are separated by spaces, reverse each word while maintaining the word order.', back: 'Each word is a segment. Reverse each segment, maintain word order.\n\nOr: reverse all, then reverse each word.' },
      { id: 'llr-27', front: 'Why Dummy Nodes for Reversal', back: 'Head might change during reversal. Dummy simplifies reconnection.\n\nreturn dummy.next as new head.\n\nEspecially useful for partial reversals.' },
      { id: 'llr-28', front: 'Reverse Nodes in Even Length Groups\n\nGiven a linked list, reverse nodes in groups where each group\'s length increases (1, 2, 3, ...), but only reverse groups with even length.', back: 'Track group lengths. Reverse only groups with even count.\n\nCombines counting with conditional reversal.' },
      { id: 'llr-29', front: 'In-Place Reversal Edge Cases', back: '• Empty list: return null\n• Single node: return as-is\n• Two nodes: swap and return\n\nAlways test these cases!' },
      { id: 'llr-30', front: 'K-Group Reversal Non-Recursive', back: 'Count K nodes ahead. If available, reverse them. Connect to previous segment.\n\nRepeat until remaining < K.' }
    ],
    quizQuestions: [
      {
        id: 'llr-q1',
        question: 'How many pointers are needed for iterative linked list reversal?',
        options: ['One', 'Two', 'Three', 'Four'],
        correctAnswer: 2,
        explanation: 'Three pointers: prev (previous node), curr (current node), next (temporary to save curr.next before overwriting).'
      },
      {
        id: 'llr-q2',
        question: 'After reversing 1->2->3->4->5, what is the new head?',
        options: ['1', '3', '5', 'null'],
        correctAnswer: 2,
        explanation: 'The last element (5) becomes the new head: 5->4->3->2->1. In code, this is the final value of prev.'
      },
      {
        id: 'llr-q3',
        question: 'What is the space complexity of recursive reversal?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'Recursive reversal uses O(n) stack space due to n recursive calls. Iterative approach is O(1).'
      },
      {
        id: 'llr-q4',
        question: 'Why use a dummy node when reversing a sublist?',
        options: ['It\'s faster', 'It handles the case when left=1 (head changes)', 'It uses less memory', 'It\'s required by the algorithm'],
        correctAnswer: 1,
        explanation: 'When left=1, the head itself changes. A dummy node before head lets us handle this uniformly without special cases.'
      },
      {
        id: 'llr-q5',
        question: 'In "Reverse Nodes in K-Group", what happens to a group with fewer than K nodes?',
        options: ['It\'s reversed anyway', 'It\'s left as-is', 'It\'s deleted', 'It causes an error'],
        correctAnswer: 1,
        explanation: 'Groups with fewer than K nodes at the end are left unchanged. We must check group size before reversing.'
      },
      {
        id: 'llr-q6',
        question: 'In recursive reversal, what does head.next.next = head do?',
        options: ['Creates a loop', 'Makes the next node point back to current node', 'Deletes the next node', 'Nothing'],
        correctAnswer: 1,
        explanation: 'It makes current node\'s next node point back to current node, reversing the direction of that link.'
      },
      {
        id: 'llr-q7',
        question: 'For "Rotate List Right by K", if K > length, what should you do?',
        options: ['Return null', 'K = K % length', 'Reverse K times', 'Error'],
        correctAnswer: 1,
        explanation: 'Rotating by the list length gives the same list. Use K % length to handle K > length efficiently.'
      },
      {
        id: 'llr-q8',
        question: 'What\'s the key insight for reversing a sublist efficiently?',
        options: ['Use recursion', 'Keep inserting nodes after the "before" node', 'Build a new list', 'Use two stacks'],
        correctAnswer: 1,
        explanation: 'Instead of traditional reversal, repeatedly take the next node and insert it right after "before". This elegantly reverses the sublist in one pass.'
      },
      {
        id: 'llr-q9',
        question: 'For "Palindrome Linked List" in O(1) space, what\'s the approach?',
        options: ['Use recursion', 'Copy to array and two pointers', 'Find middle, reverse second half, compare', 'Use a hash set'],
        correctAnswer: 2,
        explanation: 'Find middle using slow-fast pointers. Reverse the second half in place. Compare first and second halves. Optionally restore the list. O(n) time, O(1) space.'
      },
      {
        id: 'llr-q10',
        question: 'In "Swap Nodes in Pairs", what happens to 1->2->3->4?',
        options: ['4->3->2->1', '2->1->4->3', '1->3->2->4', '3->4->1->2'],
        correctAnswer: 1,
        explanation: 'Swap every two adjacent nodes: (1,2) becomes (2,1), (3,4) becomes (4,3). Result: 2->1->4->3. It\'s K-group reversal with K=2.'
      },
      {
        id: 'llr-q11',
        question: 'What common mistake breaks recursive list reversal?',
        options: ['Not returning the new head', 'Forgetting to set the old head\'s next to null', 'Using iteration instead', 'Processing nodes in wrong order'],
        correctAnswer: 1,
        explanation: 'In recursive reversal, if you don\'t set head.next = null, the original head still points forward, creating a cycle or broken list.'
      },
      {
        id: 'llr-q12',
        question: 'For "Add Two Numbers" represented as reversed linked lists, which digit is at the head?',
        options: ['Most significant digit', 'Least significant digit', 'Middle digit', 'Random'],
        correctAnswer: 1,
        explanation: 'Numbers stored in reverse: 342 is 2->4->3. This makes addition easier - just traverse left to right, handling carry. No reversal needed!'
      },
      {
        id: 'llr-q13',
        question: 'In "Swap Nodes in Pairs", why do you need access to the node before the pair?',
        options: ['To count nodes', 'To update the pointer that leads into the swapped pair', 'To check for cycles', 'You don\'t need it'],
        correctAnswer: 1,
        explanation: 'After swapping A->B to B->A, the previous node\'s next must point to B (new first). Without this, the list becomes disconnected from earlier nodes. Use dummy node for the first pair.'
      },
      {
        id: 'llr-q14',
        question: 'What\'s the time complexity of reversing a linked list in groups of k?',
        options: ['O(n)', 'O(n*k)', 'O(n²)', 'O(k)'],
        correctAnswer: 0,
        explanation: 'Each node is visited and its pointer changed exactly once, regardless of k. We process n nodes total, so O(n) time. The k value affects how many pointers change per group, not total work.'
      },
      {
        id: 'llr-q15',
        question: 'For "Rotate List by k", what\'s the key optimization when k >= length?',
        options: ['Return null', 'Use k % length since rotating by length gives original list', 'Reverse twice', 'Double the list'],
        correctAnswer: 1,
        explanation: 'Rotating by the list length returns the original list. So effective rotation is k % length. First find length, then compute actual rotation needed. Avoids unnecessary work for large k.'
      },
      {
        id: 'llr-q16',
        question: 'In recursive reversal, what does head.next.next = head accomplish?',
        options: ['Deletes a node', 'Makes the next node point back to current node', 'Skips a node', 'Finds the tail'],
        correctAnswer: 1,
        explanation: 'If we have A->B, then A.next is B, so A.next.next is B.next. Setting A.next.next = A means B.next = A, reversing the link. This is the core of recursive reversal.'
      },
      {
        id: 'llr-q17',
        question: 'Why is iterative reversal often preferred over recursive for linked lists?',
        options: ['Faster', 'O(1) space vs O(n) call stack space', 'Easier to understand', 'Works on more problems'],
        correctAnswer: 1,
        explanation: 'Recursive reversal uses O(n) stack space for the call stack. Iterative uses only O(1) extra space (just a few pointers). For very long lists, recursive might cause stack overflow.'
      },
      {
        id: 'llr-q18',
        question: 'For "Reverse Nodes in Even Length Groups", what\'s the challenge?',
        options: ['Finding even groups', 'Group sizes increase (1,2,3,...) and only even-sized groups are reversed', 'All groups are even', 'List is doubly linked'],
        correctAnswer: 1,
        explanation: 'Group 1 has 1 node, group 2 has 2 nodes, etc. Only even-sized groups get reversed. Last group might be smaller than expected. Need to track group sizes and handle partial last group.'
      },
      {
        id: 'llr-q19',
        question: 'When reversing between positions left and right, what\'s the "insertion" technique?',
        options: ['Insert new nodes', 'Repeatedly move the node after first to before first, building reversed section', 'Delete and re-add', 'Use a stack'],
        correctAnswer: 1,
        explanation: 'Keep \'first\' fixed at position left. Repeatedly take the node after first and insert it at the front of the reversed section. After (right-left) iterations, the section is reversed.'
      },
      {
        id: 'llr-q20',
        question: 'For "Palindrome Linked List" check, after finding middle and reversing second half, what must you remember?',
        options: ['Restore the list if needed', 'Count total nodes', 'Check for null', 'Sort the list'],
        correctAnswer: 0,
        explanation: 'Reversing the second half modifies the original list. If the problem requires the list to remain intact (or for debugging), reverse the second half again after comparison to restore it.'
      }
    ]
  },
  {
    id: 'tree-bfs',
    name: 'Tree BFS',
    slug: 'tree-bfs',
    description: 'Traverse trees level by level using Breadth-First Search with queues.',
    icon: 'Network',
    color: '#98D8C8',
    premium: true,
    colorDark: '#7DC5B4',
    learnContent: [
      {
        id: 'tbfs-intro',
        title: 'Breadth-First Search on Trees',
        content: 'BFS visits nodes level by level, from left to right. Uses a queue (FIFO) to ensure we process all nodes at depth d before any at depth d+1.\n\nPerfect for: level-order problems, shortest path in unweighted graphs, and "closest" queries.',
      },
      {
        id: 'tbfs-pattern',
        title: 'The Level-by-Level Pattern',
        content: 'Key trick: capture queue size at the start of each level. This tells you exactly how many nodes belong to the current level.',
        codeExample: 'function levelOrder(root) {\n  if (!root) return [];\n  const result = [], queue = [root];\n  while (queue.length) {\n    const levelSize = queue.length; // Capture size!\n    const level = [];\n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}'
      },
      {
        id: 'tbfs-min-depth',
        title: 'Minimum Depth (BFS Shines!)',
        content: 'BFS finds minimum depth optimally by returning at the FIRST leaf encountered. No need to explore deeper levels.\n\nDFS must check all paths - BFS stops early!',
        codeExample: 'function minDepth(root) {\n  if (!root) return 0;\n  const queue = [[root, 1]]; // [node, depth]\n  while (queue.length) {\n    const [node, depth] = queue.shift();\n    // First leaf found = minimum depth!\n    if (!node.left && !node.right) return depth;\n    if (node.left) queue.push([node.left, depth + 1]);\n    if (node.right) queue.push([node.right, depth + 1]);\n  }\n}'
      },
      {
        id: 'tbfs-connect',
        title: 'Connect Level Siblings',
        content: 'Add a "next" pointer from each node to its right sibling. BFS naturally processes left-to-right, so just connect as you go!',
        codeExample: 'function connect(root) {\n  if (!root) return null;\n  const queue = [root];\n  while (queue.length) {\n    const size = queue.length;\n    for (let i = 0; i < size; i++) {\n      const node = queue.shift();\n      // Connect to next in queue (if same level)\n      node.next = (i < size - 1) ? queue[0] : null;\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n  }\n  return root;\n}'
      },
      {
        id: 'tbfs-variations',
        title: 'Common Variations',
        content: '• Zigzag: Alternate left→right and right→left using a direction flag\n• Right View: Take the last node of each level\n• Level Averages: Sum nodes per level, divide by count\n• Bottom-Up: Build result from last level up (reverse at end or insert at front)',
      },
      {
        id: 'tbfs-vs-dfs',
        title: 'BFS vs DFS for Trees',
        content: 'BFS wins for:\n• Level-order operations\n• Minimum depth / shortest path\n• "Closest" queries\n\nDFS wins for:\n• Path finding (root to leaf)\n• Maximum depth\n• Tree serialization\n• Lower space on deep, narrow trees'
      }
    ],
    flashcards: [
      { id: 'tbfs-1', front: 'Level Order Traversal\n\nGiven a binary tree, return the level order traversal of its nodes\' values (grouped by level from left to right).', back: 'Queue-based BFS. Capture level size before inner loop.\n\nTime: O(n)\nSpace: O(n) for queue (widest level)' },
      { id: 'tbfs-2', front: 'Reverse Level Order Traversal\n\nGiven a binary tree, return the bottom-up level order traversal of its nodes\' values (from leaf level to root level, left to right).', back: 'Standard BFS, then reverse result.\n\nOr: insert each level at front of result.\n\nOr: use a stack at the end.' },
      { id: 'tbfs-3', front: 'Zigzag Level Order Traversal\n\nGiven a binary tree, return the zigzag level order traversal (alternating left-to-right and right-to-left between levels).', back: 'BFS + direction flag.\n\nEven levels: left to right (push to array)\nOdd levels: right to left (unshift to array)\n\nAlternate each level.' },
      { id: 'tbfs-4', front: 'Average of Levels in Binary Tree\n\nGiven a binary tree, return the average value of the nodes on each level as an array.', back: 'BFS, track sum and count per level.\nPush sum/count to result.\n\nBeware of integer overflow on large sums!' },
      { id: 'tbfs-5', front: 'Minimum Depth of Binary Tree\n\nGiven a binary tree, find the minimum depth (the number of nodes along the shortest path from root to any leaf).', back: 'BFS wins over DFS! Return immediately at first leaf node.\n\nDFS must check ALL paths to find minimum.' },
      { id: 'tbfs-6', front: 'Maximum Depth of Binary Tree (BFS)\n\nGiven a binary tree, find the maximum depth using breadth-first search.', back: 'BFS, count levels until queue empty.\n\nBut DFS is often simpler:\nmax(left, right) + 1' },
      { id: 'tbfs-7', front: 'Level Order Successor\n\nGiven a binary tree and a target node, find the node that appears immediately after the target in level order traversal.', back: 'BFS until target found. Return queue[0] immediately after.\n\nThe next node in queue is the successor!' },
      { id: 'tbfs-8', front: 'Populating Next Right Pointers in Each Node\n\nGiven a perfect binary tree where each node has a next pointer, populate it to point to the next right node in the same level.', back: 'For each node, connect to queue[0] if not last in level.\n\nLast in level: connect to null.\n\nPerfect binary tree: can use next pointers to traverse!' },
      { id: 'tbfs-9', front: 'Binary Tree Right Side View\n\nGiven a binary tree, return the values of the nodes you can see when looking at the tree from the right side (top to bottom).', back: 'BFS, take LAST node of each level.\n\nOr process right-to-left, take first.\n\nAlternative: DFS with level tracking.' },
      { id: 'tbfs-10', front: 'Binary Tree Left Side View\n\nGiven a binary tree, return the values of the nodes visible when looking at the tree from the left side.', back: 'BFS, take FIRST node of each level.\n\nOr: DFS, only record first node seen at each depth.' },
      { id: 'tbfs-11', front: 'BFS Space Complexity', back: 'O(w) where w is max width of tree.\n\nComplete tree: w ≈ n/2\nSkewed tree: w = 1\n\nWorst case: O(n)' },
      { id: 'tbfs-12', front: 'Binary Tree Right Side View', back: 'Level order, take last element.\n\nOr DFS preorder right-first, track depth.\n\nResult size = tree height.' },
      { id: 'tbfs-13', front: 'Find Largest Value in Each Tree Row\n\nGiven a binary tree, return the largest value in each level of the tree.', back: 'BFS, track max per level.\n\nOr DFS with depth tracking, update max array.' },
      { id: 'tbfs-14', front: 'Check Completeness of Binary Tree\n\nGiven a binary tree, determine if it is a complete binary tree (all levels fully filled except possibly the last, which is filled left to right).', back: 'BFS. Once null seen, all remaining must be null.\n\nFlag approach: once gap found, no more nodes allowed.' },
      { id: 'tbfs-15', front: 'Cousins in Binary Tree\n\nGiven a binary tree and two node values, determine if the nodes are cousins (same depth but different parents).', back: 'BFS tracking parent and depth.\n\nTwo nodes are cousins if: same depth AND different parents.' },
      { id: 'tbfs-16', front: 'Even Odd Tree\n\nGiven a binary tree, return true if it is an even-odd tree (even levels have strictly increasing odd values, odd levels have strictly decreasing even values).', back: 'BFS with level tracking. Even levels: strictly increasing odd values.\nOdd levels: strictly decreasing even values.' },
      { id: 'tbfs-17', front: 'Add One Row to Tree\n\nGiven a binary tree, a value v, and a depth d, add a row of nodes with value v at depth d.', back: 'BFS to find level depth-1. Insert new nodes with value v.\n\nSpecial case: depth=1 creates new root.' },
      { id: 'tbfs-18', front: 'Maximum Width of Binary Tree\n\nGiven a binary tree, return the maximum width of any level (the number of nodes between the leftmost and rightmost non-null nodes, including nulls in between).', back: 'BFS with position tracking. Width = rightmost_pos - leftmost_pos + 1.\n\nUse position: left=2*pos, right=2*pos+1.\n\nHandle overflow by normalizing.' },
      { id: 'tbfs-19', front: 'Deepest Leaves Sum\n\nGiven a binary tree, return the sum of values of the deepest leaves.', back: 'BFS, replace sum each level. Final sum = deepest level sum.\n\nOr DFS tracking max depth.' },
      { id: 'tbfs-20', front: 'N-ary Tree Level Order Traversal\n\nGiven an n-ary tree, return the level order traversal of its nodes\' values.', back: 'Same as binary: queue + level size. Add all children instead of left/right.\n\nfor (child of node.children) queue.push(child)' },
      { id: 'tbfs-21', front: 'Symmetric Tree\n\nGiven a binary tree, determine if it is a mirror of itself (symmetric around its center).', back: 'BFS with paired nodes. Compare left.left with right.right, left.right with right.left.\n\nOr recursive mirror comparison.' },
      { id: 'tbfs-22', front: 'Populating Next Right Pointers in Each Node II\n\nGiven a binary tree (not necessarily perfect), populate the next pointer to point to the next right node in the same level.', back: 'BFS to connect level siblings. Or: use existing next pointers for O(1) space.\n\nPerfect tree: can traverse via next to find children.' },
      { id: 'tbfs-23', front: 'All Nodes Distance K in Binary Tree\n\nGiven a binary tree, a target node, and an integer k, return all nodes that are distance k from the target.', back: 'Build parent map. BFS from target, tracking distance.\n\nVisit children and parent, stop at distance K.' },
      { id: 'tbfs-24', front: 'Univalued Binary Tree\n\nGiven a binary tree, return true if every node in the tree has the same value.', back: 'BFS comparing each node to root value.\n\nAll nodes must equal root.val.\n\nReturn false on first mismatch.' },
      { id: 'tbfs-25', front: 'Sum of Nodes with Even-Valued Grandparent\n\nGiven a binary tree, return the sum of values of nodes with an even-valued grandparent.', back: 'BFS tracking grandparent. If grandparent even, add node to sum.\n\nOr DFS passing parent and grandparent values.' },
      { id: 'tbfs-26', front: 'Vertical Order Traversal of Binary Tree\n\nGiven a binary tree, return the vertical order traversal of its nodes (nodes in the same column from top to bottom, sorted by row and value).', back: 'BFS with column index. Group by column, sort by row then value.\n\nMap: column → list of (row, value).' },
      { id: 'tbfs-27', front: 'Boundary of Binary Tree\n\nGiven a binary tree, return the boundary traversal: left boundary (top-down), leaves (left-to-right), and right boundary (bottom-up).', back: 'Left boundary (top-down) + leaves (left-to-right) + right boundary (bottom-up).\n\nAvoid duplicating corners.' },
      { id: 'tbfs-28', front: 'Find Bottom Left Tree Value\n\nGiven a binary tree, find the leftmost value in the last row of the tree.', back: 'BFS right-to-left: last node processed is bottom-left.\n\nOr BFS left-to-right: first node of last level.' },
      { id: 'tbfs-29', front: 'BFS with Multiple Starting Points', back: 'Initialize queue with all sources. Used in multi-source BFS problems.\n\nExample: rotting oranges, walls and gates.' },
      { id: 'tbfs-30', front: 'Serialize and Deserialize Binary Tree (BFS)\n\nDesign an algorithm to serialize and deserialize a binary tree using level-order traversal.', back: 'Level-order with null markers. Deserialize by reading level-by-level.\n\nQueue children for next level.' }
    ],
    quizQuestions: [
      {
        id: 'tbfs-q1',
        question: 'What data structure is essential for BFS?',
        options: ['Stack', 'Queue', 'Heap', 'HashMap'],
        correctAnswer: 1,
        explanation: 'BFS uses a queue (FIFO) to ensure nodes are processed in the order they were discovered, level by level.'
      },
      {
        id: 'tbfs-q2',
        question: 'What is the space complexity of tree BFS?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(h) where h is height'],
        correctAnswer: 2,
        explanation: 'The queue can hold up to the widest level. In a complete tree, the last level has ~n/2 nodes, so O(n) worst case.'
      },
      {
        id: 'tbfs-q3',
        question: 'How do you track when a level ends in BFS?',
        options: ['Count nodes as you go', 'Store queue.length BEFORE the inner loop', 'Use a sentinel null value', 'Both B and C work'],
        correctAnswer: 3,
        explanation: 'Both techniques work: capturing queue size at level start, or using null as a level separator. Size capture is more common.'
      },
      {
        id: 'tbfs-q4',
        question: 'For which problem is BFS better than DFS?',
        options: ['Finding all root-to-leaf paths', 'Finding minimum depth', 'Serializing a tree', 'Computing tree diameter'],
        correctAnswer: 1,
        explanation: 'BFS finds the first leaf (minimum depth) without exploring deeper levels. DFS would need to check all paths.'
      },
      {
        id: 'tbfs-q5',
        question: 'In "Connect Level Order Siblings", how do you find the next sibling?',
        options: ['It\'s always node.right', 'It\'s queue[0] after processing current node', 'It requires a HashMap', 'It requires two traversals'],
        correctAnswer: 1,
        explanation: 'After adding current node\'s children to queue, queue[0] is the next node in level order - the sibling (if not last in level).'
      },
      {
        id: 'tbfs-q6',
        question: 'For zigzag traversal, what changes each level?',
        options: ['Queue type', 'Direction of adding to result array', 'Tree structure', 'Nothing'],
        correctAnswer: 1,
        explanation: 'We alternate between adding elements normally (left-to-right) and in reverse (right-to-left) for each level.'
      },
      {
        id: 'tbfs-q7',
        question: 'What is the time complexity of level order traversal?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 0,
        explanation: 'We visit each node exactly once, performing O(1) work per node. Total: O(n).'
      },
      {
        id: 'tbfs-q8',
        question: 'To check if a binary tree is complete, using BFS:',
        options: ['Count nodes at each level', 'Once null is seen, all remaining must be null', 'Check if left child always exists', 'Compare node count to 2^h - 1'],
        correctAnswer: 1,
        explanation: 'In a complete tree, nodes fill left-to-right. BFS encounters nulls only after all nodes. If null appears but more nodes follow, it\'s incomplete.'
      },
      {
        id: 'tbfs-q9',
        question: 'For "Binary Tree Right Side View", what do you collect at each level?',
        options: ['First node', 'Last node', 'All nodes', 'Middle node'],
        correctAnswer: 1,
        explanation: 'Right side view shows the rightmost node at each level. In BFS, this is the last node processed in each level (highest index in level).'
      },
      {
        id: 'tbfs-q10',
        question: 'In "Cousins in Binary Tree", what two conditions make nodes cousins?',
        options: ['Same value and same depth', 'Same depth and different parents', 'Same parent and same depth', 'Different depth and same parent'],
        correctAnswer: 1,
        explanation: 'Cousins are at the same depth but have different parents. BFS can track both depth and parent for each node easily during traversal.'
      },
      {
        id: 'tbfs-q11',
        question: 'Why is queue.shift() O(n) in JavaScript, and how do you work around it?',
        options: ['It\'s actually O(1)', 'Use an index pointer instead of shift', 'Use a stack', 'Use recursion'],
        correctAnswer: 1,
        explanation: 'Array.shift() is O(n) because it reindexes all elements. For BFS, use a front pointer to simulate dequeue, or use a proper Deque implementation.'
      },
      {
        id: 'tbfs-q12',
        question: 'For "Populating Next Right Pointers in Each Node II" (non-perfect tree), what\'s the challenge?',
        options: ['Tree is too deep', 'Can\'t find rightmost node', 'Must handle missing children when finding next pointer', 'Need more space'],
        correctAnswer: 2,
        explanation: 'In non-perfect trees, a node\'s next sibling might be in a different subtree. Use the already-built next pointers at the current level to traverse and find the next valid child.'
      },
      {
        id: 'tbfs-q13',
        question: 'In "Binary Tree Level Order Traversal", how do you know when a level ends?',
        options: ['Check node values', 'Track queue size at start of each level iteration', 'Use a special marker node', 'Count total nodes'],
        correctAnswer: 1,
        explanation: 'At the start of processing a level, queue.size() equals nodes in that level. Process exactly that many nodes, and all children added will be the next level. Classic level-tracking technique.'
      },
      {
        id: 'tbfs-q14',
        question: 'For "Zigzag Level Order Traversal", what determines the order of adding values?',
        options: ['Node values', 'Level number - even levels left-to-right, odd levels right-to-left', 'Tree structure', 'Random'],
        correctAnswer: 1,
        explanation: 'Process nodes in normal BFS order, but add to level array differently: push to end for even levels (0, 2, ...), push to front for odd levels (1, 3, ...). Or just reverse odd level arrays.'
      },
      {
        id: 'tbfs-q15',
        question: 'What\'s the space complexity of BFS on a binary tree?',
        options: ['O(1)', 'O(h) where h is height', 'O(w) where w is max width', 'O(n)'],
        correctAnswer: 2,
        explanation: 'BFS queue holds at most one level at a time. Max width of a binary tree is at most n/2 (bottom level of complete tree), so O(n). For perfectly balanced tree, it\'s O(n/2) = O(n).'
      },
      {
        id: 'tbfs-q16',
        question: 'In "Average of Levels in Binary Tree", how do you handle the sum calculation?',
        options: ['Use floating point throughout', 'Sum all nodes in level (using level size), then divide by level size', 'Approximate', 'Use integers only'],
        correctAnswer: 1,
        explanation: 'Process level with BFS, sum all values, divide by level size. Be careful with integer overflow for large values - use long or double for the sum if needed.'
      },
      {
        id: 'tbfs-q17',
        question: 'For "Binary Tree Right Side View", why is BFS a natural fit?',
        options: ['Faster than DFS', 'Process each level, last node of each level is visible from right', 'Uses less memory', 'Easier to code'],
        correctAnswer: 1,
        explanation: 'BFS processes level by level. The rightmost node at each level is what you see from the right side. Simply take the last node processed at each level.'
      },
      {
        id: 'tbfs-q18',
        question: 'In "Minimum Depth of Binary Tree", when should you return early in BFS?',
        options: ['At every node', 'When you find a leaf node (node with no children)', 'At the root', 'Never return early'],
        correctAnswer: 1,
        explanation: 'Minimum depth is depth of nearest leaf. BFS visits nodes level by level, so the first leaf found is at minimum depth. Return immediately - no need to continue processing.'
      },
      {
        id: 'tbfs-q19',
        question: 'For "Cousins in Binary Tree", what do you need to track during BFS?',
        options: ['Just depth', 'Depth and parent of each target node', 'Node values', 'Tree structure'],
        correctAnswer: 1,
        explanation: 'Cousins have same depth but different parents. Track both depth and parent for x and y. They\'re cousins if depths match and parents differ. BFS naturally tracks depth by level.'
      },
      {
        id: 'tbfs-q20',
        question: 'When would you prefer BFS over DFS for tree problems?',
        options: ['When tree is deep', 'When answer is near root or problem is level-based', 'When tree is wide', 'Always prefer DFS'],
        correctAnswer: 1,
        explanation: 'BFS is ideal for: level-order problems, finding shortest path, when answer is likely near root (finds it faster). DFS is better for: path problems, leaf-to-root, when answer might be deep.'
      }
    ]
  },
  {
    id: 'tree-dfs',
    name: 'Tree DFS',
    slug: 'tree-dfs',
    description: 'Explore tree depths with pre-order, in-order, and post-order traversals.',
    icon: 'TreeDeciduous',
    color: '#27AE60',
    premium: true,
    colorDark: '#1E8449',
    learnContent: [
      {
        id: 'tdfs-intro',
        title: 'Depth-First Search on Trees',
        content: 'DFS explores one path completely before backtracking. Recursion naturally implements DFS using the call stack. Three traversal orders define WHEN you process each node.',
      },
      {
        id: 'tdfs-orders',
        title: 'Three Traversal Orders',
        content: 'Pre-order: Process node BEFORE children (Root→Left→Right)\nIn-order: Process BETWEEN children (Left→Root→Right)\nPost-order: Process AFTER children (Left→Right→Root)\n\nIn-order on BST gives sorted order!',
        codeExample: '// All three orders in one function\nfunction traverse(node) {\n  if (!node) return;\n  // PRE-ORDER: process here\n  console.log(node.val);\n  \n  traverse(node.left);\n  // IN-ORDER: process here\n  \n  traverse(node.right);\n  // POST-ORDER: process here\n}'
      },
      {
        id: 'tdfs-pathsum',
        title: 'Path Sum Pattern',
        content: 'Track running sum from root. At each node, subtract value. At leaf, check if remaining equals zero.',
        codeExample: 'function hasPathSum(root, target) {\n  if (!root) return false;\n  \n  // Leaf node: check if sum matches\n  if (!root.left && !root.right) {\n    return root.val === target;\n  }\n  \n  // Recurse with reduced target\n  const remaining = target - root.val;\n  return hasPathSum(root.left, remaining) ||\n         hasPathSum(root.right, remaining);\n}'
      },
      {
        id: 'tdfs-prefix',
        title: 'Prefix Sum for Any Path',
        content: 'For paths starting anywhere (not just root), use prefix sum + HashMap. Track how many times each prefix sum occurred above us.',
        codeExample: 'function pathSum(root, target) {\n  const prefixSums = new Map([[0, 1]]); // sum -> count\n  function dfs(node, currSum) {\n    if (!node) return 0;\n    currSum += node.val;\n    // Paths ending here with target sum\n    let count = prefixSums.get(currSum - target) || 0;\n    // Add current sum to map\n    prefixSums.set(currSum, (prefixSums.get(currSum) || 0) + 1);\n    // Recurse\n    count += dfs(node.left, currSum) + dfs(node.right, currSum);\n    // Backtrack: remove current sum\n    prefixSums.set(currSum, prefixSums.get(currSum) - 1);\n    return count;\n  }\n  return dfs(root, 0);\n}'
      },
      {
        id: 'tdfs-diameter',
        title: 'Tree Diameter (Max Path)',
        content: 'Diameter might not go through root! At each node, max path through it = leftHeight + rightHeight. Track global max while returning single-side height.',
        codeExample: 'function diameterOfBinaryTree(root) {\n  let maxDiameter = 0;\n  \n  function height(node) {\n    if (!node) return 0;\n    const left = height(node.left);\n    const right = height(node.right);\n    // Update diameter (path through this node)\n    maxDiameter = Math.max(maxDiameter, left + right);\n    // Return height for parent\n    return Math.max(left, right) + 1;\n  }\n  \n  height(root);\n  return maxDiameter;\n}'
      },
      {
        id: 'tdfs-lca',
        title: 'Lowest Common Ancestor',
        content: 'Post-order DFS. A node is LCA if:\n• It\'s one target and other is in subtree\n• Both targets are in different subtrees\n\nReturn node if target found, null otherwise. LCA is where both sides return non-null.',
      }
    ],
    flashcards: [
      { id: 'tdfs-1', front: 'Path Sum (Root to Leaf)\n\nGiven a binary tree and a target sum, determine if there exists a root-to-leaf path whose values sum to the target.', back: 'DFS, subtract node value from target.\nAt leaf: check if remaining == 0.\n\nReturn true if any path works (use OR).' },
      { id: 'tdfs-2', front: 'Path Sum II (All Paths)\n\nGiven a binary tree and a target sum, return all root-to-leaf paths where the sum equals the target.', back: 'DFS with path array. At leaf with sum == 0, add path COPY to result.\n\nBacktrack: pop from path after recursion.' },
      { id: 'tdfs-3', front: 'Sum Root to Leaf Numbers\n\nGiven a binary tree where each node contains a digit, return the sum of all numbers formed by root-to-leaf paths.', back: 'DFS passing current number.\nnewNum = num * 10 + node.val\n\nAt leaves, add to total.' },
      { id: 'tdfs-4', front: 'Path With Given Sequence\n\nGiven a binary tree and a sequence of numbers, determine if there exists a root-to-leaf path that matches the sequence.', back: 'DFS with sequence index.\nMatch node.val with sequence[i].\n\nTrue if leaf AND i == sequence.length.' },
      { id: 'tdfs-5', front: 'Path Sum III (Paths Starting Anywhere)\n\nGiven a binary tree and a target sum, count the number of paths (not necessarily starting at root) that sum to the target.', back: 'Prefix sum + HashMap!\n\nTrack prefix sums above. Count = map[currSum - target].\n\nBacktrack: decrement map after recursion.' },
      { id: 'tdfs-6', front: 'Binary Tree Maximum Path Sum\n\nGiven a binary tree, find the maximum path sum where a path can start and end at any node.', back: 'At each node, max path through it = left + right + node.val.\n\nUpdate global max.\nReturn max one-sided path to parent.' },
      { id: 'tdfs-7', front: 'Diameter of Binary Tree\n\nGiven a binary tree, find the diameter (the length of the longest path between any two nodes, which may or may not pass through the root).', back: 'At each node: diameter = leftHeight + rightHeight.\n\nTrack global max.\nReturn height = max(left, right) + 1.' },
      { id: 'tdfs-8', front: 'Pre vs In vs Post Order', back: 'Pre: Root first → copy tree, serialize\nIn: Root between → BST sorted order\nPost: Root last → delete tree, evaluate expression' },
      { id: 'tdfs-9', front: 'Lowest Common Ancestor of a Binary Tree\n\nGiven a binary tree and two nodes, find their lowest common ancestor (the deepest node that has both as descendants).', back: 'Post-order. Return node if target.\nLCA where both subtrees return non-null.\n\nOr where node is target AND subtree has other.' },
      { id: 'tdfs-10', front: 'Validate Binary Search Tree\n\nGiven a binary tree, determine if it is a valid binary search tree.', back: 'In-order gives sorted. Or pass min/max range down.\n\nnode.val must be in (min, max) exclusive!' },
      { id: 'tdfs-11', front: 'Maximum Depth of Binary Tree\n\nGiven a binary tree, find its maximum depth (the number of nodes along the longest path from root to leaf).', back: 'DFS: return max(left, right) + 1\nBase: null → 0\n\nSimplest DFS problem!' },
      { id: 'tdfs-12', front: 'Same Tree and Symmetric Tree\n\nGiven two binary trees, check if they are identical. Or given one tree, check if it is symmetric.', back: 'Simultaneous DFS on both trees.\nCompare node values and structure.\n\nSymmetric: compare left vs right recursively.' },
      { id: 'tdfs-13', front: 'Invert Binary Tree\n\nGiven a binary tree, invert it (swap left and right children of every node).', back: 'Post-order (or pre-order).\nSwap left and right children.\n\nOne of the famous interview problems!' },
      { id: 'tdfs-14', front: 'Flatten Binary Tree to Linked List\n\nGiven a binary tree, flatten it to a linked list in-place following pre-order traversal.', back: 'Pre-order: root, left, right.\nSave right, flatten left, find tail, connect right subtree.\n\nOr use Morris traversal.' },
      { id: 'tdfs-15', front: 'DFS Space Complexity', back: 'O(h) where h is height.\n\nBalanced tree: O(log n)\nSkewed tree: O(n)\n\nRecursion stack or explicit stack.' },
      { id: 'tdfs-16', front: 'Construct Binary Tree from Preorder and Inorder Traversal\n\nGiven preorder and inorder traversal arrays, construct the binary tree.', back: 'Pre+In or Post+In: O(n) with HashMap.\n\nPre first = root. Find in In-order to split.\n\nPost last = root. Same splitting logic.' },
      { id: 'tdfs-17', front: 'Kth Smallest Element in BST\n\nGiven a BST and an integer k, find the kth smallest element.', back: 'In-order traversal with counter. Stop at kth node.\n\nOr: augment nodes with left subtree size.\n\nTime: O(h + k) average.' },
      { id: 'tdfs-18', front: 'Binary Search Tree Iterator\n\nImplement an iterator over a BST that supports next() and hasNext() operations in O(h) space.', back: 'Controlled in-order using stack. Push all left nodes.\n\nnext(): pop, push all left of right child.\nhasNext(): stack not empty.' },
      { id: 'tdfs-19', front: 'Serialize and Deserialize Binary Tree\n\nDesign an algorithm to serialize and deserialize a binary tree using DFS.', back: 'Pre-order with null markers. Serialize: root, left, right.\n\nDeserialize: read value, recurse for children.\n\nQueue for order tracking.' },
      { id: 'tdfs-20', front: 'Binary Tree Maximum Path Sum\n\nGiven a binary tree, find the maximum path sum where a path can start and end at any node.', back: 'Post-order. At each node: max through node = left + right + val.\n\nReturn max one-arm to parent. Global tracks best.' },
      { id: 'tdfs-21', front: 'Subtree of Another Tree\n\nGiven two binary trees, check if one tree is a subtree of the other.', back: 'For each node, check if identical to subtree.\n\nOr: serialize both, check substring.\n\nTime: O(m*n) naive, O(m+n) with KMP.' },
      { id: 'tdfs-22', front: 'House Robber III\n\nGiven a binary tree where each node has a value, find the maximum sum you can rob without robbing two directly-linked nodes.', back: 'DP on tree. Each node returns [robbed, not_robbed].\n\nrobbed = val + left[not] + right[not]\nnot_robbed = max(left) + max(right)' },
      { id: 'tdfs-23', front: 'Delete Node in BST\n\nGiven a BST and a key, delete the node with the given key and return the new root.', back: 'Find node. No children: delete. One child: replace with child.\n\nTwo children: replace with successor (min of right subtree).' },
      { id: 'tdfs-24', front: 'Trim a Binary Search Tree\n\nGiven a BST and a range [low, high], trim the tree so all nodes are within the range.', back: 'DFS with range [low, high]. Node outside: return appropriate subtree.\n\nNode inside: recurse on children.' },
      { id: 'tdfs-25', front: 'Range Sum of BST\n\nGiven a BST and a range [low, high], return the sum of all node values in the range.', back: 'DFS. Skip left if val <= low. Skip right if val >= high.\n\nPrune subtrees outside range.\n\nSum nodes in range.' },
      { id: 'tdfs-26', front: 'Count Good Nodes in Binary Tree\n\nGiven a binary tree, count nodes where the value is greater than or equal to all values on the path from root to that node.', back: 'DFS passing max value from root to current.\n\nGood if node.val >= max. Update max = max(max, val).' },
      { id: 'tdfs-27', front: 'Leaf-Similar Trees\n\nGiven two binary trees, return true if their leaf value sequences are the same.', back: 'DFS to collect leaves. Compare leaf sequences.\n\nOr: use generators/iterators for O(1) space.' },
      { id: 'tdfs-28', front: 'Distribute Coins in Binary Tree\n\nGiven a binary tree with n nodes and n coins distributed among them, find the minimum moves to make every node have exactly one coin.', back: 'Post-order. Each node returns excess coins.\n\nMoves += |left_excess| + |right_excess|.\n\nExcess = coins + left + right - 1.' },
      { id: 'tdfs-29', front: 'Binary Tree Pruning\n\nGiven a binary tree, prune the tree so that subtrees containing all 0s are removed.', back: 'Post-order: prune children first. If node is 0 and no children, return null.\n\nReturn node otherwise.' },
      { id: 'tdfs-30', front: 'Step-By-Step Directions From a Binary Tree Node to Another\n\nGiven a binary tree and two nodes, return the shortest path directions from one node to another.', back: 'Find LCA of start and dest. Path = up from start to LCA + down from LCA to dest.\n\nU for up, L/R for down.' }
    ],
    quizQuestions: [
      {
        id: 'tdfs-q1',
        question: 'Which traversal gives sorted output for a BST?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        correctAnswer: 1,
        explanation: 'In-order (Left, Root, Right) visits BST nodes in ascending order because all left descendants < node < all right descendants.'
      },
      {
        id: 'tdfs-q2',
        question: 'What data structure does recursive DFS implicitly use?',
        options: ['Queue', 'Stack (call stack)', 'Heap', 'HashMap'],
        correctAnswer: 1,
        explanation: 'Recursive calls use the program\'s call stack, providing LIFO behavior that naturally implements DFS backtracking.'
      },
      {
        id: 'tdfs-q3',
        question: 'Which traversal is best for safely deleting a tree?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Any order works'],
        correctAnswer: 2,
        explanation: 'Post-order processes children before parent. This ensures we delete children before the parent, avoiding dangling pointers.'
      },
      {
        id: 'tdfs-q4',
        question: 'For "Path Sum Any Path", what data structure enables O(n) solution?',
        options: ['Queue', 'Stack', 'HashMap for prefix sums', 'Array'],
        correctAnswer: 2,
        explanation: 'HashMap stores prefix sums seen above. If currSum - target exists in map, we have a valid path ending here.'
      },
      {
        id: 'tdfs-q5',
        question: 'In "Tree Diameter", what does each node return to its parent?',
        options: ['Diameter through itself', 'Max single-side height', 'Total node count', 'Sum of values'],
        correctAnswer: 1,
        explanation: 'We track diameter globally. Each node returns max one-sided height so parent can calculate its own diameter.'
      },
      {
        id: 'tdfs-q6',
        question: 'For "Lowest Common Ancestor", when is a node the LCA?',
        options: ['When it\'s the root', 'When both subtrees return non-null (or node is one target)', 'When it has two children', 'When it\'s a leaf'],
        correctAnswer: 1,
        explanation: 'A node is LCA if: (1) both targets are in different subtrees, or (2) node is one target and the other is in its subtree.'
      },
      {
        id: 'tdfs-q7',
        question: 'What is the space complexity of recursive DFS?',
        options: ['O(1)', 'O(log n)', 'O(h) where h is height', 'O(n)'],
        correctAnswer: 2,
        explanation: 'DFS uses O(h) stack space. For balanced trees h = O(log n). For skewed trees h = O(n).'
      },
      {
        id: 'tdfs-q8',
        question: 'To validate a BST, what range must each node\'s value be in?',
        options: ['Greater than parent', 'Between min and max passed from ancestors', 'Between siblings', 'Any range'],
        correctAnswer: 1,
        explanation: 'Each node must be within (min, max) where min/max are updated based on path from root. Left child: update max. Right child: update min.'
      },
      {
        id: 'tdfs-q9',
        question: 'For "Serialize and Deserialize Binary Tree", which traversal is commonly used?',
        options: ['In-order only', 'Pre-order with null markers', 'Post-order only', 'Level-order only'],
        correctAnswer: 1,
        explanation: 'Pre-order with null markers uniquely represents a tree. Each null helps identify missing children. Format: "1,2,null,null,3,4,null,null,5,null,null".'
      },
      {
        id: 'tdfs-q10',
        question: 'In "Binary Tree Maximum Path Sum", why can\'t you always use both children\'s paths?',
        options: ['It\'s not allowed', 'A path can\'t split at multiple nodes', 'Children might be null', 'It would be too slow'],
        correctAnswer: 1,
        explanation: 'A path goes through consecutive nodes. If you take left+node+right, you can\'t extend further up. Return only max one-side to parent, but track full path globally.'
      },
      {
        id: 'tdfs-q11',
        question: 'What makes "Construct Binary Tree from Preorder and Inorder" work?',
        options: ['Arrays are sorted', 'Preorder gives root, inorder gives left/right split', 'They have same length', 'All values are unique'],
        correctAnswer: 1,
        explanation: 'Preorder\'s first element is root. Find root in inorder - everything left is left subtree, everything right is right subtree. Recurse with subarrays.'
      },
      {
        id: 'tdfs-q12',
        question: 'For "Count Good Nodes in Binary Tree", a node is good if:',
        options: ['It has two children', 'Its value is max on path from root', 'It\'s a leaf', 'It\'s balanced'],
        correctAnswer: 1,
        explanation: 'A node is good if no node on the path from root has a greater value. DFS while tracking max value seen so far on current path.'
      },
      {
        id: 'tdfs-q13',
        question: 'For "Serialize and Deserialize Binary Tree", what marker represents null nodes?',
        options: ['Empty string', 'A special character like # or null keyword', '-1', 'Skip them'],
        correctAnswer: 1,
        explanation: 'Use a marker like "#" or "null" for missing children. This preserves tree structure during serialization. Without null markers, you can\'t reconstruct the original tree shape.'
      },
      {
        id: 'tdfs-q14',
        question: 'In "Path Sum III", why is prefix sum combined with DFS?',
        options: ['For speed', 'To count paths with target sum starting anywhere (not just root)', 'For memory', 'It\'s optional'],
        correctAnswer: 1,
        explanation: 'Prefix sum at each node = sum from root. If prefixSum - target exists in our map, there\'s a path with target sum. DFS traverses paths while map tracks prefix sums on current path.'
      },
      {
        id: 'tdfs-q15',
        question: 'What\'s returned up the recursion in "Lowest Common Ancestor"?',
        options: ['The LCA always', 'The node if it\'s p or q, or LCA if both found in subtrees, or found node otherwise', 'Always null', 'Tree height'],
        correctAnswer: 1,
        explanation: 'Return p or q if found, null if not. If both left and right return non-null, current is LCA. Otherwise, return whichever is non-null (that subtree contains both).'
      },
      {
        id: 'tdfs-q16',
        question: 'For "Binary Tree Maximum Path Sum", why track both max path through node AND max ending at node?',
        options: ['For debugging', 'Max path can include both children, but return value can only include one branch', 'Same thing', 'Order matters'],
        correctAnswer: 1,
        explanation: 'Global max can go left-node-right. But when returning to parent, path can only continue through one child (no forking). Return max(leftGain, rightGain) + node.val to parent.'
      },
      {
        id: 'tdfs-q17',
        question: 'In "Flatten Binary Tree to Linked List", what order should nodes appear?',
        options: ['Level order', 'Pre-order traversal order', 'In-order', 'Post-order'],
        correctAnswer: 1,
        explanation: 'Pre-order: root, left subtree, right subtree. Flatten in this order, converting tree to a right-skewed "linked list" structure using only right pointers.'
      },
      {
        id: 'tdfs-q18',
        question: 'For "Construct Binary Tree from Preorder and Inorder", what does inorder tell you?',
        options: ['Root position', 'Which nodes are in left vs right subtree', 'Tree height', 'Node count'],
        correctAnswer: 1,
        explanation: 'First element of preorder is root. Find root in inorder - everything left is left subtree, everything right is right subtree. Recursively build with these partitions.'
      },
      {
        id: 'tdfs-q19',
        question: 'Why is DFS space complexity O(h) while BFS is O(w)?',
        options: ['DFS is faster', 'DFS uses recursion stack (height), BFS uses queue (width)', 'Same complexity', 'Depends on tree'],
        correctAnswer: 1,
        explanation: 'DFS recursion stack holds nodes on current root-to-leaf path = O(height). BFS queue holds nodes at current level = O(width). For balanced trees, both are O(n), but for skewed trees they differ.'
      },
      {
        id: 'tdfs-q20',
        question: 'In "Sum Root to Leaf Numbers", how do you build the number as you traverse?',
        options: ['Add digits', 'currentSum = currentSum * 10 + node.val', 'String concatenation', 'Use a stack'],
        correctAnswer: 1,
        explanation: 'Each level shifts the number left (multiply by 10) and adds the new digit. At leaves, add this path number to total. Pass currentSum down in DFS parameters.'
      }
    ]
  },
  {
    id: 'two-heaps',
    name: 'Two Heaps',
    slug: 'two-heaps',
    description: 'Use min and max heaps together to efficiently track medians and extremes.',
    icon: 'Triangle',
    color: '#BB8FCE',
    premium: true,
    colorDark: '#A77BB8',
    learnContent: [
      {
        id: 'th-intro',
        title: 'The Two Heaps Pattern',
        content: 'Split elements into two halves. Max heap holds smaller half (gives largest of smalls). Min heap holds larger half (gives smallest of larges).\n\nMedian is always at the boundary between heaps!',
      },
      {
        id: 'th-invariant',
        title: 'The Key Invariant',
        content: '1. maxHeap.size >= minHeap.size (difference at most 1)\n2. maxHeap.top <= minHeap.top (all smalls < all larges)\n\nMaintain these after every operation!',
      },
      {
        id: 'th-insert',
        title: 'Insert Algorithm',
        content: 'Multiple valid approaches. Simplest:\n1. Add to maxHeap\n2. Move maxHeap.top to minHeap\n3. If minHeap larger, move back\n\nThis always maintains invariant!',
        codeExample: 'class MedianFinder {\n  constructor() {\n    this.small = new MaxHeap(); // smaller half\n    this.large = new MinHeap(); // larger half\n  }\n  \n  addNum(num) {\n    // Always add to maxHeap first\n    this.small.push(num);\n    // Balance: move largest of small to large\n    this.large.push(this.small.pop());\n    // Size invariant: small can have 1 more\n    if (this.large.size() > this.small.size()) {\n      this.small.push(this.large.pop());\n    }\n  }\n  \n  findMedian() {\n    if (this.small.size() > this.large.size()) {\n      return this.small.top();\n    }\n    return (this.small.top() + this.large.top()) / 2;\n  }\n}'
      },
      {
        id: 'th-sliding',
        title: 'Sliding Window Median',
        content: 'Harder! Need to remove old elements too.\n\nLazy deletion: Don\'t remove immediately. Track "to be removed" in HashMap. Clean up when element reaches heap top.',
        codeExample: '// Lazy deletion concept\nconst toRemove = new Map(); // val -> count\n\nfunction remove(num) {\n  toRemove.set(num, (toRemove.get(num) || 0) + 1);\n  // Don\'t actually remove yet!\n  rebalance();\n}\n\nfunction cleanTop(heap) {\n  while (heap.size() && toRemove.get(heap.top())) {\n    toRemove.set(heap.top(), toRemove.get(heap.top()) - 1);\n    heap.pop();\n  }\n}'
      },
      {
        id: 'th-ipo',
        title: 'IPO Problem (Greedy + Two Heaps)',
        content: 'Different twist: Min heap by capital requirement, Max heap by profit.\n\n1. Move all affordable projects to profit heap\n2. Pick highest profit\n3. Update capital\n4. Repeat',
      },
      {
        id: 'th-when',
        title: 'When to Use Two Heaps',
        content: '• Finding median dynamically\n• Tracking both smallest and largest of a set\n• Partitioning into two balanced groups\n• Problems requiring quick access to "middle" elements'
      }
    ],
    flashcards: [
      { id: 'th-1', front: 'Find Median from Data Stream\n\nDesign a data structure that supports adding numbers and finding the median in O(1) time.', back: 'Max heap (small half) + Min heap (large half).\n\nOdd count: maxHeap.top\nEven count: average of tops\n\nO(log n) insert, O(1) median' },
      { id: 'th-2', front: 'Sliding Window Median\n\nGiven an array and window size k, find the median of each sliding window.', back: 'Two heaps + lazy deletion.\n\nTrack removed elements in HashMap. Clean heap tops before using.\n\nO(n log n) total.' },
      { id: 'th-3', front: 'IPO (Maximize Capital)\n\nGiven initial capital, project profits and capital requirements, and k (max projects), maximize final capital.', back: 'Min heap by capital, Max heap by profit.\n\n1. Move affordable projects to profit heap\n2. Take highest profit\n3. Repeat k times' },
      { id: 'th-4', front: 'Why max heap for smaller half?', back: 'We need the LARGEST of the small elements.\n\nMax heap gives O(1) access to max = boundary element.' },
      { id: 'th-5', front: 'Why min heap for larger half?', back: 'We need the SMALLEST of the large elements.\n\nMin heap gives O(1) access to min = boundary element.' },
      { id: 'th-6', front: 'Two Heaps Size Invariant', back: 'maxHeap.size >= minHeap.size\nDifference at most 1.\n\nIf odd count: maxHeap has extra.' },
      { id: 'th-7', front: 'Insert and Rebalance Strategy', back: '1. Add to maxHeap\n2. Move max to minHeap\n3. If minHeap larger, move min back\n\nGuarantees invariant!' },
      { id: 'th-8', front: 'Find Median: Even Count', back: 'Average of maxHeap.top() and minHeap.top().\n\nBoth heaps have equal size.' },
      { id: 'th-9', front: 'Find Median: Odd Count', back: 'maxHeap.top() (the extra element).\n\nmaxHeap has one more than minHeap.' },
      { id: 'th-10', front: 'Lazy Deletion Trick', back: 'Don\'t remove immediately from heap.\nTrack in HashMap: val → count to remove.\n\nClean up when element reaches top.' },
      { id: 'th-11', front: 'Why lazy deletion for sliding window?', back: 'Heaps don\'t support O(log n) arbitrary removal!\n\nLazy deletion defers removal to when element reaches top.' },
      { id: 'th-12', front: 'Two Heaps vs Balanced BST', back: 'BST can also find median in O(log n).\n\nTwo heaps: simpler, O(1) median.\nBST: can find any k-th element.' },
      { id: 'th-13', front: 'Rebalance After Deletion', back: 'After removing, sizes might be wrong.\nMove elements between heaps to restore invariant.\n\nAlways clean tops first!' },
      { id: 'th-14', front: 'Space Complexity', back: 'O(n) for n elements.\n\nWith lazy deletion: can temporarily exceed n (removed elements still in heap).' },
      { id: 'th-15', front: 'Alternative Insert Strategy', back: 'Compare with maxHeap.top first:\n• If smaller: add to maxHeap\n• If larger: add to minHeap\n• Then rebalance\n\nAlso works!' },
      { id: 'th-16', front: 'IPO Problem (Maximize Capital)\n\nGiven projects with capital requirements and profits, and a limit k on number of projects, maximize your final capital starting from initial capital w.', back: 'Max heap for profits, min heap for capital requirements.\n\nRepeatedly pick best affordable project. Increase capital, unlock more projects.' },
      { id: 'th-17', front: 'Find Right Interval\n\nGiven an array of intervals, for each interval find the interval with the smallest start time that is >= current interval\'s end time.', back: 'Min heap by start time. For each interval, find smallest start >= end.\n\nOr: sort + binary search.' },
      { id: 'th-18', front: 'Meeting Rooms II\n\nGiven an array of meeting time intervals, find the minimum number of conference rooms required.', back: 'Min heap by end time. For each meeting: if start >= heap.top, pop.\n\nPush current end. Heap size = rooms needed.' },
      { id: 'th-19', front: 'Task Scheduler\n\nGiven tasks and a cooldown period n, find the minimum time needed to complete all tasks.', back: 'Max heap by remaining count. Cycle through n+1 tasks.\n\nPop task, decrement, re-add if remaining. Idle when heap empty but cycle incomplete.' },
      { id: 'th-20', front: 'Merge K Sorted Arrays\n\nGiven k sorted arrays, merge them into one sorted array.', back: 'Min heap of (value, array_idx, element_idx).\n\nPop min, push next from same array.\n\nTime: O(n log k) where k = number of arrays.' },
      { id: 'th-21', front: 'Reorganize String\n\nGiven a string, rearrange it so no two adjacent characters are the same. Return empty string if impossible.', back: 'Max heap by character frequency. Pop two most frequent, interleave.\n\nImpossible if maxFreq > (n+1)/2.' },
      { id: 'th-22', front: 'Smallest Range Covering Elements from K Lists\n\nGiven k sorted lists, find the smallest range that includes at least one number from each list.', back: 'Min heap + track max. Range = [heap.top, max].\n\nPop min, push next from same list. Update range if smaller.' },
      { id: 'th-23', front: 'Process Tasks Using Servers\n\nGiven servers with weights and tasks arriving at different times, assign tasks to available servers optimally.', back: 'Two heaps: available servers (by weight, index), busy servers (by free time).\n\nAt each time, release finished servers, assign to waiting tasks.' },
      { id: 'th-24', front: 'Two Heaps for Percentiles', back: 'Generalize median: k-th percentile divides at k:100-k ratio.\n\nKeep heaps at that ratio instead of 1:1.' },
      { id: 'th-25', front: 'Maximize Array Sum After K Negations\n\nGiven an array and integer k, negate exactly k elements to maximize the sum.', back: 'Min heap to always negate smallest. If smallest >= 0 and k is odd, negate smallest once.\n\nSum remaining elements.' },
      { id: 'th-26', front: 'Kth Largest Element in a Stream\n\nDesign a class to find the kth largest element in a stream of numbers.', back: 'Min heap of size k. Each add: push, pop if size > k.\n\nTop is always kth largest.' },
      { id: 'th-27', front: 'Heap Invariant Maintenance', back: 'After every operation, verify:\n• Size difference <= 1\n• maxHeap.top <= minHeap.top\n\nFix by moving elements.' },
      { id: 'th-28', front: 'Median of Two Sorted Arrays\n\nGiven two sorted arrays, find the median of the combined sorted array.', back: 'Merge mentally, find middle. Two heaps can track as you merge.\n\nOr: binary search O(log min(m,n)).' },
      { id: 'th-29', front: 'Seat Reservation System\n\nDesign a system that manages seat reservations, always allocating the smallest-numbered unreserved seat.', back: 'Min heap of available seats. reserve(): pop min. unreserve(n): push n.\n\nAlways gives smallest available.' },
      { id: 'th-30', front: 'Heap Memory Patterns', back: 'JS: array-based, custom comparator.\nPython: heapq (min only), negate for max.\nJava: PriorityQueue with Comparator.' }
    ],
    quizQuestions: [
      {
        id: 'th-q1',
        question: 'In the two heaps pattern, the max heap contains:',
        options: ['All elements', 'Larger half', 'Smaller half', 'Middle element only'],
        correctAnswer: 2,
        explanation: 'Max heap stores the smaller half. Its top (maximum of smalls) is at the median boundary.'
      },
      {
        id: 'th-q2',
        question: 'What is the time complexity to find the median using two heaps?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
        correctAnswer: 2,
        explanation: 'Median is always at the top of one or both heaps, accessible in O(1) time.'
      },
      {
        id: 'th-q3',
        question: 'If both heaps have equal size (even total count), the median is:',
        options: ['Top of max heap', 'Top of min heap', 'Average of both tops', 'Undefined'],
        correctAnswer: 2,
        explanation: 'With equal sizes, median is the average: (maxHeap.top + minHeap.top) / 2.'
      },
      {
        id: 'th-q4',
        question: 'Time complexity to add an element:',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1,
        explanation: 'Adding to a heap is O(log n). Rebalancing involves at most 2 more heap operations, still O(log n).'
      },
      {
        id: 'th-q5',
        question: 'Why can\'t we directly remove arbitrary elements from a heap?',
        options: ['It\'s not allowed', 'It would take O(n) to find the element', 'Heaps only support root removal', 'It breaks the invariant'],
        correctAnswer: 1,
        explanation: 'Finding an arbitrary element in a heap takes O(n). Only the root is accessible in O(1), so only root removal is O(log n).'
      },
      {
        id: 'th-q6',
        question: 'What is lazy deletion?',
        options: ['Deleting slowly', 'Marking elements for removal but only removing when they reach the top', 'Using a slower algorithm', 'Deleting from the bottom'],
        correctAnswer: 1,
        explanation: 'Lazy deletion tracks elements to remove in a HashMap. Actual removal happens when the element reaches the heap top.'
      },
      {
        id: 'th-q7',
        question: 'For the IPO problem, what determines which heap a project goes to?',
        options: ['Profit only', 'Capital requirement and current available capital', 'Random choice', 'Project ID'],
        correctAnswer: 1,
        explanation: 'Projects start in min heap by capital. When affordable (capital <= available), they move to max heap by profit for selection.'
      },
      {
        id: 'th-q8',
        question: 'After inserting, if minHeap has more elements than maxHeap:',
        options: ['It\'s fine, no action needed', 'Move minHeap top to maxHeap', 'Delete from minHeap', 'Error occurred'],
        correctAnswer: 1,
        explanation: 'Invariant requires maxHeap.size >= minHeap.size. If violated, move minHeap\'s minimum to maxHeap.'
      },
      {
        id: 'th-q9',
        question: 'For "Sliding Window Median", why is lazy deletion needed instead of regular heap removal?',
        options: ['It\'s faster', 'Standard heaps only support O(n) arbitrary element removal', 'To save memory', 'It\'s required by the problem'],
        correctAnswer: 1,
        explanation: 'Heaps don\'t support efficient arbitrary removal - finding an element is O(n). Lazy deletion marks elements as removed and only actually removes when they reach the top.'
      },
      {
        id: 'th-q10',
        question: 'In the "maximize capital" (IPO) problem, what\'s the greedy strategy?',
        options: ['Always pick cheapest project', 'Pick highest profit among affordable projects', 'Pick random project', 'Pick project with best profit/capital ratio'],
        correctAnswer: 1,
        explanation: 'Among all projects you can afford (capital <= available), always pick the one with highest profit. Move affordable projects from capital min-heap to profit max-heap.'
      },
      {
        id: 'th-q11',
        question: 'What problem does tracking valid counts solve in sliding window median?',
        options: ['Faster insertion', 'Knowing actual heap sizes after lazy deletions', 'Better median accuracy', 'Memory efficiency'],
        correctAnswer: 1,
        explanation: 'With lazy deletion, heap.size() includes marked-for-removal elements. Track valid counts separately to know actual elements for rebalancing and median calculation.'
      },
      {
        id: 'th-q12',
        question: 'Why use two heaps instead of a single sorted array for streaming median?',
        options: ['Two heaps use less memory', 'Insert is O(log n) vs O(n) for sorted array', 'Easier to implement', 'Better precision'],
        correctAnswer: 1,
        explanation: 'Sorted array insertion is O(n) due to shifting. Two heaps give O(log n) insertion while maintaining O(1) median access - much better for streaming data.'
      },
      {
        id: 'th-q13',
        question: 'In "IPO" (maximize capital for k projects), why use two heaps?',
        options: ['One for profits, one for capitals', 'Max heap for available project profits, min heap to release projects as capital grows', 'Speed optimization', 'Random choice'],
        correctAnswer: 1,
        explanation: 'Min heap stores projects by capital requirement. As capital grows, transfer affordable projects to max heap (by profit). Always pick highest profit available.'
      },
      {
        id: 'th-q14',
        question: 'For "Sliding Window Median", what\'s the challenge with the basic two-heap approach?',
        options: ['Too slow', 'Need to remove arbitrary elements, not just min/max', 'Not enough memory', 'Window is too large'],
        correctAnswer: 1,
        explanation: 'Standard heaps only support remove-min/max. Removing arbitrary elements requires: lazy deletion (mark as removed, skip when popping) or balanced BST (like TreeMap).'
      },
      {
        id: 'th-q15',
        question: 'What invariant must be maintained when rebalancing two heaps for median?',
        options: ['Equal sizes', 'MaxHeap size equals MinHeap size, or is one more', 'MinHeap is larger', 'Total is even'],
        correctAnswer: 1,
        explanation: 'For median: |maxHeap| == |minHeap| or |maxHeap| == |minHeap| + 1. Median is maxHeap.peek() if sizes differ, else average of both peaks.'
      },
      {
        id: 'th-q16',
        question: 'In "Find Right Interval", how do two data structures help?',
        options: ['Use min heap by start time to find smallest start >= end', 'Use two arrays', 'Hash map only', 'Sorting only'],
        correctAnswer: 0,
        explanation: 'For each interval\'s end, find the smallest start that is >= end. Min heap by start times allows efficient finding. Alternatively, binary search on sorted starts works too.'
      },
      {
        id: 'th-q17',
        question: 'What\'s the time complexity of finding median in a stream of n numbers using two heaps?',
        options: ['O(1)', 'O(log n) per insertion, O(1) per median query', 'O(n)', 'O(n log n)'],
        correctAnswer: 1,
        explanation: 'Each insertion: add to heap O(log n), possibly rebalance O(log n). Total per insert: O(log n). Median query: O(1) - just peek the tops.'
      },
      {
        id: 'th-q18',
        question: 'For "Maximize Sum of Array After K Negations", what approach uses a heap?',
        options: ['Max heap of absolute values', 'Min heap to always negate the smallest element', 'Two heaps', 'No heap needed'],
        correctAnswer: 1,
        explanation: 'Use min heap. Negate smallest k times (or until all positive). For negative numbers, negating increases sum. Once all positive, negate smallest repeatedly if k remains.'
      },
      {
        id: 'th-q19',
        question: 'In the two-heap median pattern, which heap contains larger elements?',
        options: ['Max heap', 'Min heap contains the larger half', 'Doesn\'t matter', 'They share elements'],
        correctAnswer: 1,
        explanation: 'Max heap has smaller half (peek gives largest of small). Min heap has larger half (peek gives smallest of large). Median is between these two boundary values.'
      },
      {
        id: 'th-q20',
        question: 'For "Kth Largest Element in a Stream", which heap type and what size?',
        options: ['Max heap of size n', 'Min heap of size k - keeps k largest, top is kth largest', 'Max heap of size k', 'Two heaps'],
        correctAnswer: 1,
        explanation: 'Min heap of size k maintains the k largest elements. The minimum of these (heap top) is the kth largest. Add new element, pop if size > k. O(log k) per operation.'
      }
    ]
  },
  {
    id: 'subsets',
    name: 'Subsets',
    slug: 'subsets',
    description: 'Generate all possible combinations and permutations using BFS or backtracking.',
    icon: 'Boxes',
    color: '#85C1E9',
    premium: true,
    colorDark: '#6BADD4',
    learnContent: [
      {
        id: 'sub-intro',
        title: 'The Subsets Pattern',
        content: 'Generate all combinations. Each element: include or exclude → 2^n subsets.\n\nTwo approaches:\n• Iterative (BFS): Build layer by layer\n• Backtracking: Explore decision tree',
      },
      {
        id: 'sub-iterative',
        title: 'Iterative Approach',
        content: 'Start with [[]]. For each element, clone all existing subsets and add the element.',
        codeExample: 'function subsets(nums) {\n  const result = [[]];\n  for (const num of nums) {\n    const newSubsets = result.map(s => [...s, num]);\n    result.push(...newSubsets);\n  }\n  return result;\n}\n// [1,2] → [[]] → [[],[1]] → [[],[1],[2],[1,2]]'
      },
      {
        id: 'sub-backtrack',
        title: 'Backtracking Approach',
        content: 'At each index, branch: include current element or skip it. Collect at every node (for subsets) or at leaves (for combinations of fixed size).',
        codeExample: 'function subsets(nums) {\n  const result = [];\n  function backtrack(index, current) {\n    result.push([...current]); // Collect\n    for (let i = index; i < nums.length; i++) {\n      current.push(nums[i]);     // Choose\n      backtrack(i + 1, current); // Explore\n      current.pop();             // Unchoose\n    }\n  }\n  backtrack(0, []);\n  return result;\n}'
      },
      {
        id: 'sub-duplicates',
        title: 'Handling Duplicates',
        content: 'Sort first! Then skip when nums[i] === nums[i-1] at the same decision level.\n\nThis ensures we only use each duplicate value once per position in the recursion.',
        codeExample: 'function subsetsWithDup(nums) {\n  nums.sort((a, b) => a - b);\n  const result = [];\n  function backtrack(index, current) {\n    result.push([...current]);\n    for (let i = index; i < nums.length; i++) {\n      if (i > index && nums[i] === nums[i-1]) continue;\n      current.push(nums[i]);\n      backtrack(i + 1, current);\n      current.pop();\n    }\n  }\n  backtrack(0, []);\n  return result;\n}'
      },
      {
        id: 'sub-permutations',
        title: 'Permutations',
        content: 'Unlike subsets, ORDER matters. Use "used" array to track which elements are already in the current permutation.',
        codeExample: 'function permute(nums) {\n  const result = [], used = Array(nums.length).fill(false);\n  function backtrack(current) {\n    if (current.length === nums.length) {\n      result.push([...current]);\n      return;\n    }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      current.push(nums[i]);\n      backtrack(current);\n      current.pop();\n      used[i] = false;\n    }\n  }\n  backtrack([]);\n  return result;\n}'
      },
      {
        id: 'sub-template',
        title: 'Backtracking Template',
        content: '1. Base case: collect result if valid\n2. For each choice:\n   • Make the choice (push/mark)\n   • Recurse\n   • Undo the choice (pop/unmark)\n\nThis "choose-explore-unchoose" pattern is universal!'
      }
    ],
    flashcards: [
      { id: 'sub-1', front: 'Subsets (no duplicates)\n\nGiven an array of distinct integers, generate all possible subsets (the power set).', back: 'Iterative: Clone and extend.\nBacktracking: include/exclude at each index.\n\n2^n subsets. O(n × 2^n) time.' },
      { id: 'sub-2', front: 'Subsets with Duplicates\n\nGiven an array that may contain duplicates, generate all possible unique subsets.', back: 'Sort first!\nSkip: if (i > index && nums[i] === nums[i-1]) continue;\n\nPrevents duplicate subsets.' },
      { id: 'sub-3', front: 'Permutations\n\nGiven an array of distinct integers, generate all possible permutations (all orderings).', back: 'Order matters! Use "used" array.\nTry all unused elements at each position.\n\nn! permutations.' },
      { id: 'sub-4', front: 'Permutations with Duplicates\n\nGiven an array that may contain duplicates, generate all unique permutations.', back: 'Sort + skip: if (nums[i] === nums[i-1] && !used[i-1]) continue;\n\nForces duplicates to be used left-to-right.' },
      { id: 'sub-5', front: 'Combinations (n choose k)\n\nGiven n elements, generate all ways to choose exactly k elements.', back: 'Like subsets, but only collect when length == k.\n\nPrune: if remaining < k - current.length, return.' },
      { id: 'sub-6', front: 'Combination Sum (reuse allowed)\n\nFind all unique combinations that sum to a target, where numbers can be reused unlimited times.', back: 'Recurse from SAME index (not i+1).\nAllows element reuse.\n\nStop when sum > target.' },
      { id: 'sub-7', front: 'Combination Sum II (no reuse)\n\nFind all unique combinations that sum to a target, where each number can be used only once.', back: 'Recurse from i+1. Sort + skip duplicates.\n\nEach element used at most once.' },
      { id: 'sub-8', front: 'Generate Parentheses\n\nGenerate all combinations of n pairs of valid (well-formed) parentheses.', back: 'Backtrack with open/close counts.\nAdd "(" if open < n.\nAdd ")" if close < open.\n\nCatalan number results.' },
      { id: 'sub-9', front: 'Letter Combinations of Phone\n\nGiven a string of digits 2-9, return all possible letter combinations they could represent on a phone keypad.', back: 'Map: 2→"abc", 3→"def"...\nBacktrack through digits, try each letter.\n\n3^n or 4^n results.' },
      { id: 'sub-10', front: 'Palindrome Partitioning\n\nPartition a string into substrings such that every substring is a palindrome. Return all possible partitions.', back: 'Try each prefix that\'s palindrome.\nRecurse on remainder.\n\nCollect when end reached.' },
      { id: 'sub-11', front: 'N-Queens\n\nPlace n queens on an n×n chessboard such that no two queens attack each other.', back: 'Backtrack row by row.\nTrack: columns, diagonals (row±col).\n\nPrune invalid placements.' },
      { id: 'sub-12', front: 'Word Search\n\nGiven a 2D board and a word, find if the word exists in the grid formed by adjacent cells.', back: 'Backtrack on grid. Mark cell visited.\n4 directions. Unmark on backtrack.\n\nO(m×n×4^L) worst case.' },
      { id: 'sub-13', front: 'Subsets Count', back: '2^n for n elements.\nEach element: 2 choices (in/out).\n\nIncludes empty set.' },
      { id: 'sub-14', front: 'Permutations Count', back: 'n! for n distinct elements.\nn choices × (n-1) × ... × 1.' },
      { id: 'sub-15', front: 'Backtracking Template', back: '1. Choose (push/mark)\n2. Explore (recurse)\n3. Unchoose (pop/unmark)\n\nBase case collects or validates.' },
      { id: 'sub-16', front: 'Combination Sum II (no reuse)\n\nFind all unique combinations that sum to a target, where each number can be used only once.', back: 'Sort + skip duplicates at same level.\nRecurse from i+1 (no reuse).\n\nif (i > idx && nums[i] === nums[i-1]) skip' },
      { id: 'sub-17', front: 'Combination Sum III\n\nFind all valid combinations of k numbers that sum to n, using only numbers 1-9.', back: 'K numbers that sum to n, using 1-9.\nBacktrack with count and sum constraints.\n\nPrune when sum exceeds n.' },
      { id: 'sub-18', front: 'Sudoku Solver\n\nFill empty cells in a 9x9 Sudoku puzzle with digits 1-9 such that all constraints are satisfied.', back: 'Backtrack cell by cell. Try 1-9, validate row/col/box.\n\nReturn true on success, backtrack on failure.\n\nPrune: precompute valid digits.' },
      { id: 'sub-19', front: 'Restore IP Addresses\n\nGiven a string containing only digits, return all possible valid IP addresses that can be formed.', back: 'Backtrack with 4 segments. Each segment: 1-3 digits, value 0-255.\n\nNo leading zeros (except "0").' },
      { id: 'sub-20', front: 'Expression Add Operators\n\nGiven a string of digits and a target, add operators (+, -, *) between digits to evaluate to target.', back: 'Backtrack inserting +, -, *. Track current value and last operand.\n\nMultiply: subtract last, add last*new.' },
      { id: 'sub-21', front: 'Factor Combinations\n\nFind all possible combinations of a number\'s factors (excluding the number itself and 1).', back: 'Backtrack with factors from 2 to sqrt(n).\n\nStart from last factor to avoid duplicates.\n\n12 = 2×6 = 2×2×3 = 3×4' },
      { id: 'sub-22', front: 'Generalized Abbreviations\n\nGenerate all possible abbreviations of a word by replacing any number of non-adjacent substrings with their lengths.', back: 'For each char: keep it or count it.\nTrack consecutive abbreviated count.\n\nE.g., "word" → "w3", "1o1d", "4"' },
      { id: 'sub-23', front: 'Beautiful Arrangement\n\nFind the count of beautiful arrangements where perm[i] is divisible by i or i is divisible by perm[i].', back: 'Permutation with constraints. At position i, num[i] must divide i or i divides num[i].\n\nBacktrack, count valid arrangements.' },
      { id: 'sub-24', front: 'Lexicographical Numbers\n\nGenerate numbers from 1 to n in lexicographical order.', back: 'DFS with next digit choices. Start from 1-9, append 0-9.\n\nOr: iterate next lexicographical directly.' },
      { id: 'sub-25', front: 'Splitting a String Into Descending Values\n\nSplit a string into consecutive values where each value is exactly 1 less than the previous value.', back: 'Backtrack trying each prefix. Each value must be 1 less than previous.\n\nHandle leading zeros and overflow.' },
      { id: 'sub-26', front: 'All Paths from Source to Target\n\nFind all paths from node 0 to node n-1 in a directed acyclic graph.', back: 'Backtrack/DFS from 0 to n-1. No cycles in DAG.\n\nCollect path when reaching destination.' },
      { id: 'sub-27', front: 'Maximum Length of Concatenated String\n\nFind the maximum length of a concatenated string with unique characters from a list of strings.', back: 'Backtrack: include or exclude each string.\n\nPrune strings with duplicate chars.\n\nTrack max length with unique chars.' },
      { id: 'sub-28', front: 'Matchsticks to Square\n\nDetermine if you can form a square using all matchsticks (no breaking allowed).', back: 'Backtrack assigning sticks to 4 sides.\n\nSort descending for early pruning.\n\nSkip consecutive equal lengths.' },
      { id: 'sub-29', front: 'Target Sum (+/- Assignment)\n\nFind the number of ways to assign + or - to each number in an array to reach a target sum.', back: 'Backtrack: each number gets + or -.\n\nOr: DP subset sum with target (S+T)/2.\n\nCount ways to reach target.' },
      { id: 'sub-30', front: 'Iterative vs Recursive Subsets', back: 'Iterative: start empty, clone+extend each existing subset.\n\nRecursive: include/exclude at each index.\n\nSame O(2^n) results.' }
    ],
    quizQuestions: [
      {
        id: 'sub-q1',
        question: 'How many subsets does a set of n elements have?',
        options: ['n', 'n!', '2^n', 'n²'],
        correctAnswer: 2,
        explanation: 'Each element has 2 choices: include or exclude. With n elements: 2×2×...×2 = 2^n subsets.'
      },
      {
        id: 'sub-q2',
        question: 'What is the time complexity of generating all subsets?',
        options: ['O(n)', 'O(n²)', 'O(2^n)', 'O(n × 2^n)'],
        correctAnswer: 3,
        explanation: '2^n subsets to generate, each taking O(n) to copy. Total: O(n × 2^n).'
      },
      {
        id: 'sub-q3',
        question: 'To handle duplicates in subsets, the key technique is:',
        options: ['Use a HashSet', 'Sort and skip nums[i] === nums[i-1] at same level', 'Remove after generation', 'Use DP'],
        correctAnswer: 1,
        explanation: 'Sorting groups duplicates. Skip when current equals previous at the same recursion level (i > index).'
      },
      {
        id: 'sub-q4',
        question: 'How many permutations of n distinct elements?',
        options: ['n', '2^n', 'n!', 'n²'],
        correctAnswer: 2,
        explanation: 'n choices for first position × (n-1) for second × ... × 1 for last = n! permutations.'
      },
      {
        id: 'sub-q5',
        question: 'In Combination Sum with reuse, how do you allow reusing elements?',
        options: ['Use a flag', 'Start from same index, not i+1', 'Add element twice', 'Use a set'],
        correctAnswer: 1,
        explanation: 'Recursing from the same index allows choosing the same element again. Using i+1 prevents reuse.'
      },
      {
        id: 'sub-q6',
        question: 'The "unchoose" step in backtracking is used to:',
        options: ['Delete results', 'Restore state before trying next option', 'Mark as invalid', 'Speed up'],
        correctAnswer: 1,
        explanation: 'Unchoose (pop/unmark) restores state so we can explore other branches from the same point.'
      },
      {
        id: 'sub-q7',
        question: 'For permutations with duplicates, when do we skip?',
        options: ['Always skip duplicates', 'Skip if nums[i] === nums[i-1] AND !used[i-1]', 'Skip if used[i]', 'Never skip'],
        correctAnswer: 1,
        explanation: 'Skip when current equals previous AND previous not used. This ensures duplicates are used in order.'
      },
      {
        id: 'sub-q8',
        question: 'What\'s the key difference between subsets and permutations?',
        options: ['Size', 'Order matters in permutations', 'Permutations are faster', 'Subsets use more memory'],
        correctAnswer: 1,
        explanation: '[1,2] and [2,1] are the same subset but different permutations. Subsets: order irrelevant. Permutations: order matters.'
      },
      {
        id: 'sub-q9',
        question: 'For "Generate Parentheses", what conditions must be checked before adding a parenthesis?',
        options: ['Just count total', 'Open < n for "(", close < open for ")"', 'Open == close always', 'Alternate open and close'],
        correctAnswer: 1,
        explanation: 'Add "(" only if open count < n. Add ")" only if close count < open count (can\'t close what isn\'t opened). This ensures valid sequences.'
      },
      {
        id: 'sub-q10',
        question: 'In "Word Search" on a grid, how do you prevent revisiting cells in the same path?',
        options: ['Use a visited set', 'Mark cell temporarily, backtrack after', 'Only go forward', 'Use a queue'],
        correctAnswer: 1,
        explanation: 'Mark the current cell (e.g., change to "#") before exploring, restore it after backtracking. This prevents using the same cell twice in one path while allowing reuse across different paths.'
      },
      {
        id: 'sub-q11',
        question: 'For N-Queens, which structures efficiently track attacked positions?',
        options: ['2D board only', 'Sets for columns and both diagonals', 'Array of queen positions', 'Linked list'],
        correctAnswer: 1,
        explanation: 'Use sets: one for columns, one for diagonals (row-col), one for anti-diagonals (row+col). O(1) lookup for conflicts instead of checking the whole board.'
      },
      {
        id: 'sub-q12',
        question: 'What\'s the time complexity of generating all permutations?',
        options: ['O(n)', 'O(n²)', 'O(n! × n)', 'O(2^n)'],
        correctAnswer: 2,
        explanation: 'There are n! permutations, and each takes O(n) to copy to the result. Total: O(n! × n). Much larger than 2^n for subsets.'
      },
      {
        id: 'sub-q13',
        question: 'In "Letter Combinations of a Phone Number", what type of problem is this?',
        options: ['Subset generation', 'Combinations with different choices at each position', 'Permutation', 'Graph traversal'],
        correctAnswer: 1,
        explanation: 'Each digit maps to 3-4 letters. Choose one letter per digit, creating all combinations. Backtracking tries each letter choice at each position.'
      },
      {
        id: 'sub-q14',
        question: 'For "Palindrome Partitioning", what makes a valid partition?',
        options: ['Equal length parts', 'Every substring in the partition is a palindrome', 'Sorted parts', 'Maximum parts'],
        correctAnswer: 1,
        explanation: 'Generate all ways to split string where each part is palindrome. Backtrack: at each position, try extending current palindrome substring, recurse on rest.'
      },
      {
        id: 'sub-q15',
        question: 'What\'s the relationship between n-choose-k and Pascal\'s triangle?',
        options: ['No relationship', 'C(n,k) is the entry at row n, position k in Pascal\'s triangle', 'They\'re opposites', 'Only for small n'],
        correctAnswer: 1,
        explanation: 'Pascal\'s triangle entry at row n, position k equals C(n,k). Each entry is sum of two above it, matching C(n,k) = C(n-1,k-1) + C(n-1,k).'
      },
      {
        id: 'sub-q16',
        question: 'In "Generate Parentheses", what constraints must be satisfied?',
        options: ['Equal open and close', 'At any point: open count >= close count, and both limited by n', 'Open before close', 'Alphabetical order'],
        correctAnswer: 1,
        explanation: 'Track open and close counts. Can add open if open < n. Can add close if close < open. This ensures we never have unmatched close parenthesis.'
      },
      {
        id: 'sub-q17',
        question: 'For "Combinations" (choosing k from n), how do you avoid duplicates without extra space?',
        options: ['Sort first', 'Only choose elements at indices >= start parameter', 'Use a set', 'Check each combination'],
        correctAnswer: 1,
        explanation: 'Pass start index to recursion. Only consider elements from start onwards. This ensures we pick in increasing index order, avoiding duplicates like [1,2] and [2,1].'
      },
      {
        id: 'sub-q18',
        question: 'What\'s the difference between subsets and combinations?',
        options: ['Same thing', 'Subsets is all possible, combinations is choosing exactly k elements', 'Order matters in one', 'Size constraints differ'],
        correctAnswer: 1,
        explanation: 'Subsets: generate all 2^n subsets of any size. Combinations: generate all C(n,k) ways to choose exactly k elements. Combinations is a constrained subset problem.'
      },
      {
        id: 'sub-q19',
        question: 'In backtracking, what does "pruning" mean?',
        options: ['Removing elements', 'Skipping branches that can\'t lead to valid solutions early', 'Sorting the input', 'Reducing duplicates'],
        correctAnswer: 1,
        explanation: 'Pruning cuts off exploration of invalid branches early. Example: in combination sum, if current sum exceeds target, don\'t continue. Dramatically improves performance.'
      },
      {
        id: 'sub-q20',
        question: 'For "Subsets II" (with duplicates), what prevents duplicate subsets?',
        options: ['Use a hash set', 'Sort first, skip consecutive duplicates at same recursion level', 'Remove duplicates from input', 'Use different algorithm'],
        correctAnswer: 1,
        explanation: 'Sort array first. In recursion, if current element equals previous AND we didn\'t include previous (skipped it), skip current too. This avoids choosing same element in different orders.'
      }
    ]
  },
  {
    id: 'binary-search',
    name: 'Modified Binary Search',
    slug: 'binary-search',
    description: 'Apply binary search to sorted arrays, rotated arrays, and search spaces.',
    icon: 'Search',
    color: '#F8B500',
    premium: true,
    colorDark: '#E0A300',
    learnContent: [
      {
        id: 'bs-intro',
        title: 'Binary Search Fundamentals',
        content: 'Binary search eliminates half the search space each iteration. The key insight: if one half can\'t contain the answer, search the other half.\n\nRequires: Sorted data or monotonic property.\nTime: O(log n) - very fast!',
      },
      {
        id: 'bs-template',
        title: 'The Template',
        content: 'Most bugs come from boundary conditions. Use this safe template:\n• mid = start + (end - start) / 2 (avoids overflow)\n• start <= end (inclusive bounds)\n• Return -1 if not found',
        codeExample: 'function binarySearch(arr, target) {\n  let start = 0, end = arr.length - 1;\n  while (start <= end) {\n    const mid = start + Math.floor((end - start) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) start = mid + 1;\n    else end = mid - 1;\n  }\n  return -1; // Not found\n}'
      },
      {
        id: 'bs-first-last',
        title: 'First/Last Occurrence',
        content: 'Don\'t return immediately when found! Save result and continue searching left (first) or right (last).',
        codeExample: 'function findFirst(arr, target) {\n  let start = 0, end = arr.length - 1, result = -1;\n  while (start <= end) {\n    const mid = start + Math.floor((end - start) / 2);\n    if (arr[mid] === target) {\n      result = mid;      // Save it\n      end = mid - 1;     // Keep searching left\n    } else if (arr[mid] < target) {\n      start = mid + 1;\n    } else {\n      end = mid - 1;\n    }\n  }\n  return result;\n}'
      },
      {
        id: 'bs-rotated',
        title: 'Search in Rotated Array',
        content: 'One half is ALWAYS sorted! Check which half is sorted, then check if target is in that half.\n\nKey: Compare arr[start] with arr[mid] to determine which half is sorted.',
        codeExample: 'function search(nums, target) {\n  let start = 0, end = nums.length - 1;\n  while (start <= end) {\n    const mid = start + Math.floor((end - start) / 2);\n    if (nums[mid] === target) return mid;\n    // Left half sorted?\n    if (nums[start] <= nums[mid]) {\n      if (target >= nums[start] && target < nums[mid]) {\n        end = mid - 1;\n      } else {\n        start = mid + 1;\n      }\n    } else { // Right half sorted\n      if (target > nums[mid] && target <= nums[end]) {\n        start = mid + 1;\n      } else {\n        end = mid - 1;\n      }\n    }\n  }\n  return -1;\n}'
      },
      {
        id: 'bs-answer',
        title: 'Binary Search on Answer Space',
        content: 'Many problems aren\'t about searching arrays, but finding an optimal value!\n\nPattern: Binary search on possible answers, check if each candidate works.\n\nExamples: Koko eating bananas, split array largest sum.',
      },
      {
        id: 'bs-tips',
        title: 'Common Pitfalls',
        content: '• Off-by-one errors: Carefully consider inclusive vs exclusive bounds\n• Infinite loops: Make sure start or end changes each iteration\n• Overflow: Use start + (end-start)/2\n• Wrong half: Double-check which condition goes with which half'
      }
    ],
    flashcards: [
      { id: 'bs-1', front: 'Standard Binary Search\n\nFind the index of a target value in a sorted array, or return -1 if not found.', back: 'while (start <= end)\nmid = start + (end-start)/2\nCompare, move bounds.\n\nO(log n) time, O(1) space.' },
      { id: 'bs-2', front: 'Search in Rotated Array\n\nFind a target in a sorted array that has been rotated at an unknown pivot point.', back: 'One half is always sorted!\nCheck nums[start] <= nums[mid].\n\nIf target in sorted half, search there. Else other half.' },
      { id: 'bs-3', front: 'Find First Occurrence\n\nFind the first (leftmost) occurrence of a target value in a sorted array.', back: 'When found: save result, search LEFT (end = mid-1).\n\nDon\'t return immediately!' },
      { id: 'bs-4', front: 'Find Last Occurrence\n\nFind the last (rightmost) occurrence of a target value in a sorted array.', back: 'When found: save result, search RIGHT (start = mid+1).\n\nMirror of first occurrence.' },
      { id: 'bs-5', front: 'Search Insert Position\n\nFind the index where a target would be inserted in a sorted array to maintain order.', back: 'Standard binary search.\nReturn START when loop ends.\n\nstart = first position >= target.' },
      { id: 'bs-6', front: 'Find Peak Element\n\nFind any peak element in an array where a peak is greater than its neighbors.', back: 'If mid > mid+1: peak on left (include mid).\nElse: peak on right.\n\nCompare with neighbor, not target!' },
      { id: 'bs-7', front: 'Minimum in Rotated Array\n\nFind the minimum element in a sorted array that has been rotated.', back: 'Compare mid with END (not start!).\nmid > end: min on right.\nmid <= end: min on left (include mid).' },
      { id: 'bs-8', front: 'Search in Infinite Array\n\nSearch for a target in a sorted array of unknown size.', back: 'Exponentially expand bounds (1,2,4,8...).\nWhen target in range, binary search.\n\nO(log n) to find bounds + O(log n) search.' },
      { id: 'bs-9', front: 'Binary Search on Answer\n\nFind the optimal value by binary searching on possible answer values rather than indices.', back: 'Search possible answer values.\nFor each, check if achievable.\n\nKoko\'s bananas, capacity to ship, etc.' },
      { id: 'bs-10', front: 'Sqrt(x) without library\n\nCompute and return the square root of x, rounded down to the nearest integer.', back: 'Binary search 1 to x.\nCheck if mid*mid <= x.\n\nFind largest mid where mid² <= x.' },
      { id: 'bs-11', front: 'Find in 2D Sorted Matrix\n\nSearch for a value in a 2D matrix where each row and column is sorted.', back: 'Treat as 1D array: idx → (idx/cols, idx%cols).\n\nOr start from top-right corner.' },
      { id: 'bs-12', front: 'Median of Two Sorted Arrays\n\nFind the median of two sorted arrays in O(log(min(m,n))) time.', back: 'Binary search on partition point.\nFind where left sides equal right sides.\n\nO(log(min(m,n))).' },
      { id: 'bs-13', front: 'First Bad Version\n\nFind the first bad version in a sequence where all versions after a bad version are also bad.', back: 'Binary search. If bad(mid), search left.\nElse search right.\n\nFirst true in [false, false, true, true].' },
      { id: 'bs-14', front: 'Koko Eating Bananas\n\nFind the minimum eating speed to finish all banana piles within H hours.', back: 'Binary search on eating speed.\nFor each speed, check if can finish in H hours.\n\nFind minimum valid speed.' },
      { id: 'bs-15', front: 'Why start + (end-start)/2?', back: 'Avoids integer overflow!\n(start+end) can overflow.\nstart + (end-start)/2 cannot.' },
      { id: 'bs-16', front: 'Split Array Largest Sum\n\nSplit an array into m subarrays such that the largest sum among the subarrays is minimized.', back: 'Binary search on answer: min possible largest sum.\n\nCheck: can we split into ≤m subarrays with max sum ≤ mid?\n\nGreedy counting.' },
      { id: 'bs-17', front: 'Capacity To Ship Packages\n\nFind the minimum ship capacity to ship all packages within D days.', back: 'Binary search on capacity. For each capacity, simulate loading.\n\nFind minimum capacity to ship in D days.' },
      { id: 'bs-18', front: 'Find Peak Element\n\nFind any peak element in an array where a peak is greater than its neighbors.', back: 'If mid > mid+1, peak is left (including mid).\nElse peak is right.\n\nWorks because edges are -∞.' },
      { id: 'bs-19', front: 'Search in Rotated Array II (with dups)\n\nSearch for a target in a rotated sorted array that may contain duplicates.', back: 'When nums[start] == nums[mid] == nums[end], can\'t determine side.\n\nShrink both ends: start++, end--.\n\nWorst case O(n).' },
      { id: 'bs-20', front: 'Find Minimum in Rotated Array\n\nFind the minimum element in a sorted array that has been rotated.', back: 'Compare mid with end. If mid > end, min is right. Else min is left.\n\nWith dups: shrink when equal.' },
      { id: 'bs-21', front: 'Binary Search Template 1 vs 2', back: 'Template 1: start <= end, check mid directly.\nTemplate 2: start < end, end = mid (not mid-1).\n\nChoose based on what you\'re finding.' },
      { id: 'bs-22', front: 'Sqrt(x) Implementation\n\nCompute and return the square root of x, rounded down to the nearest integer.', back: 'Binary search for largest n where n² <= x.\n\nend = mid when mid² > x.\nstart = mid when mid² <= x.\n\nHandle overflow: compare mid with x/mid.' },
      { id: 'bs-23', front: 'Guess Number Higher or Lower\n\nGuess a number between 1 and n using a binary search approach with a guess API.', back: 'Classic binary search with API. guess(n) returns -1, 0, or 1.\n\nAdjust search range based on response.' },
      { id: 'bs-24', front: 'Magnetic Force Between Balls\n\nPlace m balls in baskets to maximize the minimum magnetic force between any two balls.', back: 'Binary search on minimum distance. For each distance, greedily place balls.\n\nMaximize minimum distance.' },
      { id: 'bs-25', front: 'Minimum Speed to Arrive on Time\n\nFind the minimum speed needed to arrive at a destination on time given train schedules.', back: 'Binary search on speed. Calculate total time for each speed.\n\nCeiling for each trip except last.\n\nFind minimum valid speed.' },
      { id: 'bs-26', front: 'Minimize Maximum of Array\n\nMinimize the maximum value in an array by performing allowed operations.', back: 'Binary search on answer. Check if can redistribute to keep all ≤ mid.\n\nPrefix sum tracking excess.' },
      { id: 'bs-27', front: 'H-Index II (Sorted)\n\nFind the h-index from a sorted array of citations in O(log n) time.', back: 'Binary search. At mid: n-mid papers have ≥ citations[mid].\n\nFind first where citations[mid] >= n-mid.' },
      { id: 'bs-28', front: 'Single Element in Sorted Array\n\nFind the single element that appears once in a sorted array where every other element appears twice.', back: 'Pairs before single: even-odd indices match.\nPairs after: odd-even indices match.\n\nBinary search on pair alignment.' },
      { id: 'bs-29', front: 'Random Pick with Weight\n\nRandomly pick an index based on weights, where higher weights have higher probability.', back: 'Prefix sum array. Binary search for target in prefix sums.\n\nHigher weight = larger range = more likely picked.' },
      { id: 'bs-30', front: 'Count Negative Numbers in Matrix\n\nCount the number of negative numbers in a matrix sorted in non-increasing order.', back: 'Matrix sorted row/col. Start from bottom-left or top-right.\n\nOr: binary search each row.\n\nO(m + n) optimal.' }
    ],
    quizQuestions: [
      {
        id: 'bs-q1',
        question: 'Why use start + (end - start) / 2 instead of (start + end) / 2?',
        options: ['It\'s faster', 'Avoids integer overflow', 'Gives different result', 'More readable'],
        correctAnswer: 1,
        explanation: 'If start and end are both large integers, their sum can overflow. The alternative formula avoids this.'
      },
      {
        id: 'bs-q2',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'Each iteration halves the search space. After log₂(n) iterations, we reach 1 element. Total: O(log n).'
      },
      {
        id: 'bs-q3',
        question: 'In a rotated sorted array, how do you find which half is sorted?',
        options: ['Count elements', 'Compare arr[start] with arr[mid]', 'Compare arr[mid] with target', 'Always guess left'],
        correctAnswer: 1,
        explanation: 'If arr[start] <= arr[mid], left half is sorted (no rotation point there). Otherwise, right half is sorted.'
      },
      {
        id: 'bs-q4',
        question: 'To find the first occurrence, after finding target you should:',
        options: ['Return immediately', 'Save result and search left', 'Save result and search right', 'Start over'],
        correctAnswer: 1,
        explanation: 'Save the result (in case it\'s the only occurrence) and continue searching left (end = mid - 1) for earlier occurrences.'
      },
      {
        id: 'bs-q5',
        question: 'For finding minimum in rotated sorted array, compare mid with:',
        options: ['Target', 'arr[start]', 'arr[end]', 'arr[0]'],
        correctAnswer: 2,
        explanation: 'Compare with arr[end]. If mid > end, minimum is on the right (rotation point). If mid <= end, minimum is on the left.'
      },
      {
        id: 'bs-q6',
        question: 'What does "binary search on answer space" mean?',
        options: ['Search for the answer in an array', 'Binary search possible answer values and check feasibility', 'Use two binary searches', 'Search bidirectionally'],
        correctAnswer: 1,
        explanation: 'Instead of searching in an array, we search through possible answer values. For each candidate, we check if it\'s feasible.'
      },
      {
        id: 'bs-q7',
        question: 'In Search Insert Position, what should you return if target not found?',
        options: ['-1', 'start', 'end', 'mid'],
        correctAnswer: 1,
        explanation: 'When the loop ends, start points to the first position >= target, which is the correct insertion point.'
      },
      {
        id: 'bs-q8',
        question: 'For Peak Element, if arr[mid] < arr[mid+1], where is the peak?',
        options: ['At mid', 'On the left', 'On the right', 'Doesn\'t exist'],
        correctAnswer: 2,
        explanation: 'If mid is smaller than its right neighbor, we\'re on an ascending slope. A peak must exist to the right.'
      },
      {
        id: 'bs-q9',
        question: 'For "Koko Eating Bananas", what are you binary searching on?',
        options: ['Pile indices', 'Eating speed (bananas per hour)', 'Number of piles', 'Time'],
        correctAnswer: 1,
        explanation: 'Binary search on possible eating speeds (1 to max pile size). For each speed, check if Koko can finish all piles within H hours. Find minimum valid speed.'
      },
      {
        id: 'bs-q10',
        question: 'In "Search in 2D Matrix" (rows and cols sorted), the optimal starting position is:',
        options: ['Top-left corner', 'Center', 'Top-right or bottom-left corner', 'Random'],
        correctAnswer: 2,
        explanation: 'From top-right: if target smaller, go left; if larger, go down. Each step eliminates a row or column. O(m+n) time without binary search.'
      },
      {
        id: 'bs-q11',
        question: 'For "Median of Two Sorted Arrays", what\'s the time complexity?',
        options: ['O(m+n)', 'O(log(m+n))', 'O(log(min(m,n)))', 'O(m×n)'],
        correctAnswer: 2,
        explanation: 'Binary search on the smaller array to find the partition point. Check if partitions create valid left/right halves. O(log(min(m,n))) time.'
      },
      {
        id: 'bs-q12',
        question: 'In "Split Array Largest Sum", you\'re binary searching on:',
        options: ['Array indices', 'Number of subarrays', 'The maximum subarray sum', 'Element values'],
        correctAnswer: 2,
        explanation: 'Binary search on the answer: possible max sums range from max(arr) to sum(arr). For each candidate, check if you can split into ≤m subarrays with sum ≤ candidate.'
      },
      {
        id: 'bs-q13',
        question: 'What makes "Search in Rotated Sorted Array" tricky?',
        options: ['Array is unsorted', 'One half is always sorted, determine which and search accordingly', 'Elements repeat', 'Array is too large'],
        correctAnswer: 1,
        explanation: 'After rotation, either left or right half is sorted. Check which half is sorted, then determine if target is in that half. Binary search the correct half, recurse.'
      },
      {
        id: 'bs-q14',
        question: 'For "Find Minimum in Rotated Sorted Array", what do you compare mid to?',
        options: ['Target value', 'Left element', 'Right element to determine which half contains minimum', 'Both left and right'],
        correctAnswer: 2,
        explanation: 'If arr[mid] > arr[right], minimum is in right half. If arr[mid] < arr[right], minimum is in left half (including mid). Minimum is where sorted order breaks.'
      },
      {
        id: 'bs-q15',
        question: 'In "Search a 2D Matrix" (sorted rows and columns), what\'s the O(m+n) approach?',
        options: ['Binary search each row', 'Start from top-right or bottom-left corner', 'Sort first', 'Use hash map'],
        correctAnswer: 1,
        explanation: 'From top-right: if target < current, move left; if target > current, move down. Each step eliminates a row or column. Max m+n steps.'
      },
      {
        id: 'bs-q16',
        question: 'For "Koko Eating Bananas", what is being binary searched?',
        options: ['Pile indices', 'Number of bananas', 'Eating speed k - find minimum k to finish in h hours', 'Time in hours'],
        correctAnswer: 2,
        explanation: 'Binary search on speed k from 1 to max(piles). For each k, calculate hours needed (sum of ceil(pile/k)). Find minimum k where hours <= h.'
      },
      {
        id: 'bs-q17',
        question: 'What\'s the key insight for "Find Peak Element"?',
        options: ['Peak is always in middle', 'If arr[mid] < arr[mid+1], peak is to the right', 'Linear scan needed', 'Peak is at boundaries'],
        correctAnswer: 1,
        explanation: 'If mid < mid+1, there must be a peak to the right (either arr keeps increasing to boundary or drops somewhere). Similarly, if mid < mid-1, peak is to left.'
      },
      {
        id: 'bs-q18',
        question: 'For "Capacity to Ship Packages Within D Days", what\'s the search range?',
        options: ['1 to sum', 'max(weights) to sum(weights) - minimum possible to maximum needed', '0 to n', 'Random range'],
        correctAnswer: 1,
        explanation: 'Ship capacity must be at least max(weights) to carry heaviest package. At most sum(weights) ships everything in one day. Binary search this range.'
      },
      {
        id: 'bs-q19',
        question: 'In "Find First and Last Position", why might you need two binary searches?',
        options: ['One search is enough', 'One finds leftmost occurrence, another finds rightmost', 'For sorted check', 'Different algorithms'],
        correctAnswer: 1,
        explanation: 'Standard binary search finds any occurrence. Modify to find leftmost: when found, continue searching left. Similarly for rightmost. Two O(log n) searches.'
      },
      {
        id: 'bs-q20',
        question: 'What\'s the "binary search on answer" pattern?',
        options: ['Search in array', 'When answer has monotonic property, binary search the answer space', 'Random guessing', 'Linear search then binary'],
        correctAnswer: 1,
        explanation: 'Instead of searching in data, search the range of possible answers. If canAchieve(x) is monotonic (true after some point), binary search finds the boundary. Common in optimization.'
      }
    ]
  },
  {
    id: 'top-k-elements',
    name: 'Top K Elements',
    slug: 'top-k-elements',
    description: 'Find the top, smallest, or most frequent K elements using heaps.',
    icon: 'Trophy',
    color: '#00CEC9',
    premium: true,
    colorDark: '#00B5B0',
    learnContent: [
      {
        id: 'topk-intro',
        title: 'The Top K Pattern',
        content: 'For K largest: use MIN heap of size K (counterintuitive!)\nFor K smallest: use MAX heap of size K\n\nThe smallest element in "K largest" = Kth largest. Keep it at heap top for easy comparison!',
      },
      {
        id: 'topk-why',
        title: 'Why Opposite Heap?',
        content: 'We want to keep the "borderline" element accessible.\n\nMin heap of size K: top = Kth largest (smallest of the K best)\nNew element > top? Replace! Otherwise discard.',
      },
      {
        id: 'topk-pattern',
        title: 'The Pattern',
        content: 'For each element: add to heap. If size > K, remove top. Final heap = top K.',
        codeExample: 'function findKthLargest(nums, k) {\n  const minHeap = new MinHeap();\n  for (const num of nums) {\n    minHeap.push(num);\n    if (minHeap.size() > k) {\n      minHeap.pop(); // Evict smallest\n    }\n  }\n  return minHeap.top(); // Kth largest\n}'
      },
      {
        id: 'topk-frequency',
        title: 'Top K Frequent',
        content: 'Two steps:\n1. Count frequencies (HashMap)\n2. Top K by frequency (heap)\n\nAlternative: Bucket sort by frequency for O(n)!',
        codeExample: 'function topKFrequent(nums, k) {\n  const freq = new Map();\n  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);\n  \n  const minHeap = new MinHeap((a, b) => a[1] - b[1]);\n  for (const [num, count] of freq) {\n    minHeap.push([num, count]);\n    if (minHeap.size() > k) minHeap.pop();\n  }\n  return minHeap.toArray().map(x => x[0]);\n}'
      },
      {
        id: 'topk-quickselect',
        title: 'QuickSelect Alternative',
        content: 'Average O(n) using partition like QuickSort.\nPartition around pivot. If pivot position = k, done!\nOtherwise recurse on correct half.\n\nBest for single Kth element (not all K).',
      },
      {
        id: 'topk-scheduler',
        title: 'Task Scheduler Pattern',
        content: 'Greedy with max heap: always schedule highest frequency task.\nAfter scheduling, task goes to "cooldown" queue for n cycles.\nIdle only when no tasks available.'
      }
    ],
    flashcards: [
      { id: 'topk-1', front: 'Kth Largest Element\n\nFind the kth largest element in an unsorted array.', back: 'Min heap of size K.\nHeap top = Kth largest.\n\nO(n log k) time, O(k) space.' },
      { id: 'topk-2', front: 'Kth Smallest Element\n\nFind the kth smallest element in an unsorted array.', back: 'Max heap of size K.\nHeap top = Kth smallest.\n\nMirror of Kth largest.' },
      { id: 'topk-3', front: 'Top K Frequent Elements\n\nFind the k most frequently occurring elements in an array.', back: 'Count frequencies (HashMap).\nMin heap by frequency, size K.\n\nOr bucket sort O(n)!' },
      { id: 'topk-4', front: 'K Closest Points to Origin\n\nFind the k closest points to the origin (0, 0) in a 2D plane.', back: 'Max heap by distance, size K.\nIf closer than max, replace.\n\nDistance: x² + y² (skip sqrt!)' },
      { id: 'topk-5', front: 'Why min heap for K largest?', back: 'Top of min heap = smallest of the K largest = Kth largest.\n\nEasy to compare: new > top? Replace!' },
      { id: 'topk-6', front: 'Sort Array by Frequency\n\nSort an array by element frequency (descending), then by value if frequencies are equal.', back: 'Count frequencies.\nSort by frequency (descending), then value.\n\nBucket sort for O(n).' },
      { id: 'topk-7', front: 'Reorganize String (no adjacent same)\n\nRearrange a string so no two adjacent characters are the same.', back: 'Max heap by frequency.\nGreedily place highest freq, then next highest.\n\nImpossible if maxFreq > (n+1)/2.' },
      { id: 'topk-8', front: 'Task Scheduler\n\nFind minimum time to complete all tasks with a cooling period n between same tasks.', back: 'Max heap by frequency.\nProcess n+1 tasks per cycle.\n\nIdle = n+1 - tasks available.' },
      { id: 'topk-9', front: 'K Closest Numbers to X\n\nFind k numbers in a sorted array that are closest to a target value x.', back: 'Two pointers from closest, expand outward.\nOr min heap by |num - X|.\n\nReturn sorted result.' },
      { id: 'topk-10', front: 'QuickSelect for Kth\n\nFind the kth element using QuickSelect algorithm in average O(n) time.', back: 'Partition like QuickSort.\nPivot at position K? Done!\nElse recurse on correct half.\n\nAverage O(n), worst O(n²).' },
      { id: 'topk-11', front: 'Top K vs Kth Element', back: 'Top K: need all K elements.\nKth: need just one element.\n\nQuickSelect better for single Kth.' },
      { id: 'topk-12', front: 'Bucket Sort for Frequency', back: 'Bucket[i] = elements with freq i.\nWalk buckets backwards.\n\nO(n) time and space!' },
      { id: 'topk-13', front: 'Sum of K Largest After Removal\n\nFind the sum of the k largest elements after removing some elements.', back: 'Max heap for all, pop until k left.\nOr sort descending, sum first K.\n\nHandle edge cases!' },
      { id: 'topk-14', front: 'Maximum Distinct Elements\n\nMaximize the number of distinct elements after removing k elements.', back: 'Min heap by frequency.\nRemove low-frequency elements first.\n\nMinimize distinct elements lost.' },
      { id: 'topk-15', front: 'Why O(n log k) beats O(n log n)?', back: 'When k << n, log k << log n.\nHeap of size K saves time!\n\nFor k near n, similar performance.' },
      { id: 'topk-16', front: 'Find K Pairs with Smallest Sums\n\nFind k pairs with the smallest sums from two sorted arrays.', back: 'Min heap: (sum, i, j). Start with (nums1[0]+nums2[0], 0, 0).\n\nPop min, push (i+1,j) and (i,j+1). Use set to avoid dups.' },
      { id: 'topk-17', front: 'Sort Characters By Frequency\n\nSort characters in a string by decreasing frequency.', back: 'Count frequencies. Max heap by freq. Pop and build result.\n\nOr bucket sort: bucket[freq] = chars.' },
      { id: 'topk-18', front: 'Kth Largest Element (QuickSelect)\n\nFind the kth largest element using QuickSelect algorithm.', back: 'Partition around pivot. If pivot at k-1, done.\nElse recurse on correct side.\n\nAvg O(n), worst O(n²).' },
      { id: 'topk-19', front: 'Top K Frequent Words\n\nFind the k most frequent words, sorted by frequency (desc) then lexicographically (asc).', back: 'Count + heap. Sort by freq desc, then lexicographically asc.\n\nCustom comparator needed!' },
      { id: 'topk-20', front: 'Least Number of Unique Integers\n\nFind the minimum number of unique integers after removing exactly k elements.', back: 'Count frequencies. Min heap by freq.\n\nRemove lowest freq elements until k exhausted.' },
      { id: 'topk-21', front: 'K Closest Points to Origin\n\nFind the k closest points to the origin (0, 0) in a 2D plane.', back: 'Max heap of size k by distance. If new point closer than top, replace.\n\nOr: QuickSelect for O(n) avg.' },
      { id: 'topk-22', front: 'Reduce Array Size to Half\n\nFind the minimum set size to remove so that at least half the array is removed.', back: 'Count frequencies. Max heap by freq.\n\nGreedily remove most frequent until removed >= n/2.' },
      { id: 'topk-23', front: 'Distant Barcodes\n\nRearrange barcodes so no two adjacent barcodes are equal.', back: 'Max heap by frequency. Place most frequent, skip one position.\n\nSimilar to Reorganize String.' },
      { id: 'topk-24', front: 'Minimum Cost to Connect Sticks\n\nConnect sticks with minimum cost where the cost is the sum of stick lengths.', back: 'Min heap. Always combine two smallest.\n\nTotal cost = sum of all combinations.\n\nGreedy: smaller sticks combined first.' },
      { id: 'topk-25', front: 'Top K Competitors\n\nFind top k competitors based on mention frequency in reviews.', back: 'Count mentions in reviews. Min heap of size k by count.\n\nTie-breaker: lexicographical order.' },
      { id: 'topk-26', front: 'Kth Smallest Prime Fraction\n\nFind the kth smallest fraction formed by dividing primes from a sorted array.', back: 'Binary search on answer, or min heap of fractions.\n\nHeap: push (arr[0]/arr[j], 0, j) for all j.' },
      { id: 'topk-27', front: 'Maximum Performance of Team\n\nSelect at most k engineers to maximize team performance (sum of speeds * min efficiency).', back: 'Sort by efficiency desc. Max heap for speeds.\n\nFor each efficiency, track top k speeds.' },
      { id: 'topk-28', front: 'Furthest Building You Can Reach\n\nReach the furthest building using k ladders and b bricks optimally.', back: 'Min heap of ladder usage. Use ladder for k biggest climbs.\n\nBricks for rest. Greedy allocation.' },
      { id: 'topk-29', front: 'Minimum Number of Refueling Stops\n\nFind minimum refueling stops to reach a destination.', back: 'Max heap of passed stations. When out of fuel, take best passed station.\n\nGreedy: always take most fuel available.' },
      { id: 'topk-30', front: 'Stock Price Fluctuation\n\nTrack current, maximum, and minimum stock prices with price updates.', back: 'HashMap for prices, max/min heaps for extremes.\n\nLazy deletion: verify current price on heap top.' }
    ],
    quizQuestions: [
      {
        id: 'topk-q1',
        question: 'To find the K largest elements, you should use:',
        options: ['Max heap of size K', 'Min heap of size K', 'Max heap of size n', 'Sorted array'],
        correctAnswer: 1,
        explanation: 'Min heap of size K keeps the K largest. The top (smallest of K) is the Kth largest, easy to compare with new elements.'
      },
      {
        id: 'topk-q2',
        question: 'What is the time complexity of finding top K from n elements using a heap?',
        options: ['O(n)', 'O(k)', 'O(n log k)', 'O(n log n)'],
        correctAnswer: 2,
        explanation: 'Each of n elements: O(log k) heap operation. Total: O(n log k). Better than sorting O(n log n) when k is small!'
      },
      {
        id: 'topk-q3',
        question: 'For K closest points to origin, why use max heap instead of min?',
        options: ['To find farthest points', 'To keep the farthest of K closest at top for easy eviction', 'Max heap is faster', 'It doesn\'t matter'],
        correctAnswer: 1,
        explanation: 'Max heap of size K: top = farthest of the K closest. If new point is closer than top, evict top. Easy comparison!'
      },
      {
        id: 'topk-q4',
        question: 'What is the space complexity of the top K pattern?',
        options: ['O(1)', 'O(k)', 'O(n)', 'O(n log k)'],
        correctAnswer: 1,
        explanation: 'We only keep K elements in the heap at any time, so space is O(k).'
      },
      {
        id: 'topk-q5',
        question: 'What is QuickSelect\'s average time complexity for finding Kth largest?',
        options: ['O(log n)', 'O(n)', 'O(n log k)', 'O(n log n)'],
        correctAnswer: 1,
        explanation: 'QuickSelect averages O(n) by only recursing on one half. But worst case is O(n²) with bad pivots.'
      },
      {
        id: 'topk-q6',
        question: 'For "Top K Frequent", what\'s the O(n) solution?',
        options: ['Use heap', 'QuickSelect', 'Bucket sort by frequency', 'Counting sort'],
        correctAnswer: 2,
        explanation: 'Create buckets 0 to n (max possible frequency). Put elements in freq buckets. Walk backwards to get top K.'
      },
      {
        id: 'topk-q7',
        question: 'In Task Scheduler, when do we add idle time?',
        options: ['Every cycle', 'When fewer than n+1 tasks available', 'Never', 'After each task'],
        correctAnswer: 1,
        explanation: 'We process up to n+1 tasks per cycle (to maintain cooldown n). If fewer tasks available, we idle.'
      },
      {
        id: 'topk-q8',
        question: 'For "Reorganize String", when is it impossible?',
        options: ['String too long', 'When max frequency > (length + 1) / 2', 'All same characters', 'Odd length'],
        correctAnswer: 1,
        explanation: 'If one character appears more than ceil(n/2) times, we can\'t avoid placing it adjacent to itself.'
      },
      {
        id: 'topk-q9',
        question: 'For "Find K Pairs with Smallest Sums" from two arrays, how do you avoid visiting same pair twice?',
        options: ['Use a HashSet of visited indices', 'Only advance one pointer at a time systematically', 'Sort pairs first', 'Use two heaps'],
        correctAnswer: 1,
        explanation: 'Start with (0,0). When popping (i,j), push (i+1,j) and (i,j+1) but use a set to avoid duplicates. Or only push (i,j+1) when i==0 to avoid (i+1,j) overlap.'
      },
      {
        id: 'topk-q10',
        question: 'What\'s the difference between Kth largest element and top K largest elements?',
        options: ['No difference', 'Kth needs one value, top K needs all K values returned', 'Top K is faster', 'Kth is harder'],
        correctAnswer: 1,
        explanation: 'Kth largest returns just one value (can use QuickSelect O(n) avg). Top K returns all K values (need heap or sorted result).'
      },
      {
        id: 'topk-q11',
        question: 'In "Sort Characters by Frequency", after counting frequencies, what\'s the optimal approach?',
        options: ['QuickSort by frequency', 'Use a max heap or bucket sort', 'Radix sort', 'Bubble sort'],
        correctAnswer: 1,
        explanation: 'Max heap by frequency lets you build result greedily. Or bucket sort: buckets[freq] holds chars with that frequency. Both work well.'
      },
      {
        id: 'topk-q12',
        question: 'When would you choose QuickSelect over heap for Kth element?',
        options: ['When K is large', 'When you need guaranteed O(n log k)', 'When you want average O(n) and only need one element', 'When data is sorted'],
        correctAnswer: 2,
        explanation: 'QuickSelect averages O(n) but has O(n²) worst case. Use it when you need just the Kth element (not all K), and can tolerate worst-case risk.'
      },
      {
        id: 'topk-q13',
        question: 'For "Top K Frequent Elements", what\'s the bucket sort optimization?',
        options: ['Sort by value', 'Use buckets where index = frequency, elements with that frequency go in bucket', 'Binary search', 'Hash all elements'],
        correctAnswer: 1,
        explanation: 'Create buckets 0 to n. For each number, put it in bucket[frequency]. Iterate from highest bucket down, collect elements until you have K. O(n) time!'
      },
      {
        id: 'topk-q14',
        question: 'In "K Closest Points to Origin", what distance formula is used?',
        options: ['Manhattan distance', 'Euclidean distance squared (skip sqrt for comparison)', 'Chebyshev distance', 'Hamming distance'],
        correctAnswer: 1,
        explanation: 'Use x² + y² (squared Euclidean). Skip the square root since we only compare distances - sqrt is monotonic so ranking is preserved. Saves computation.'
      },
      {
        id: 'topk-q15',
        question: 'For "Sort Characters By Frequency", after counting, what\'s the sorting approach?',
        options: ['QuickSort characters', 'Use max heap or bucket sort by frequency', 'Radix sort', 'No sorting needed'],
        correctAnswer: 1,
        explanation: 'Count frequencies with HashMap. Then either: max heap to get highest frequency chars, or bucket sort where bucket[freq] contains chars with that frequency. Build result string.'
      },
      {
        id: 'topk-q16',
        question: 'What\'s the space-time tradeoff when finding Kth largest?',
        options: ['No tradeoff exists', 'Min heap O(k) space O(n log k) vs QuickSelect O(1) space O(n) average', 'Always use O(n) space', 'Space is always O(1)'],
        correctAnswer: 1,
        explanation: 'Min heap of size k uses O(k) space with guaranteed O(n log k) time. QuickSelect uses O(1) extra space with O(n) average but O(n²) worst case. Choose based on constraints.'
      },
      {
        id: 'topk-q17',
        question: 'In "Reorganize String", how does frequency help?',
        options: ['Sort alphabetically', 'Max frequency char should go in alternate positions - use max heap', 'Count total chars', 'Find duplicates'],
        correctAnswer: 1,
        explanation: 'Greedily place most frequent char, then second most frequent, alternating. Max heap gives highest frequency each time. Impossible if maxFreq > (n+1)/2.'
      },
      {
        id: 'topk-q18',
        question: 'For "Task Scheduler", what determines minimum time with cooling period n?',
        options: ['Total tasks', 'Most frequent task determines idle slots needed between its occurrences', 'Random', 'Cooling period only'],
        correctAnswer: 1,
        explanation: 'Most frequent task needs (freq-1) cooling gaps of size n. Other tasks fill gaps. Time = max(total tasks, (maxFreq-1)*(n+1) + countOfMaxFreq).'
      },
      {
        id: 'topk-q19',
        question: 'What\'s the difference between Kth largest and Kth smallest in heap choice?',
        options: ['Same heap', 'Kth largest uses min heap, Kth smallest uses max heap', 'Both use max heap', 'Both use min heap'],
        correctAnswer: 1,
        explanation: 'Counterintuitive: for Kth largest, use min heap (smallest of top K is the answer). For Kth smallest, use max heap (largest of bottom K is the answer).'
      },
      {
        id: 'topk-q20',
        question: 'For "Least Number of Unique Integers after K Removals", what\'s the strategy?',
        options: ['Remove most frequent', 'Remove least frequent elements first to maximize eliminations', 'Random removal', 'Remove largest values'],
        correctAnswer: 1,
        explanation: 'To minimize unique integers remaining, fully eliminate as many as possible. Remove least frequent first - they take fewer removals to fully eliminate. Use min heap by frequency.'
      }
    ]
  },
  {
    id: 'k-way-merge',
    name: 'K-Way Merge',
    slug: 'k-way-merge',
    description: 'Efficiently merge K sorted arrays or lists using a min heap.',
    icon: 'Combine',
    color: '#FD79A8',
    premium: true,
    colorDark: '#E86995',
    learnContent: [
      {
        id: 'kwm-intro',
        title: 'The K-Way Merge Pattern',
        content: 'Given K sorted arrays/lists, we need to merge them or find elements across them. Key insight: always pick the minimum among K current elements!\n\nMin heap: tracks K elements (one per array). O(log K) to get/update minimum.',
      },
      {
        id: 'kwm-algorithm',
        title: 'The Algorithm',
        content: '1. Push first element from each array (with source info)\n2. Pop minimum → add to result\n3. Push next element from SAME source\n4. Repeat until heap empty\n\nHeap always has at most K elements!',
        codeExample: 'function mergeKLists(lists) {\n  const heap = new MinHeap((a, b) => a.val - b.val);\n  // Add head of each list\n  for (const head of lists) {\n    if (head) heap.push({ val: head.val, node: head });\n  }\n  const dummy = { next: null };\n  let tail = dummy;\n  while (heap.size() > 0) {\n    const { node } = heap.pop();\n    tail.next = node;\n    tail = tail.next;\n    if (node.next) {\n      heap.push({ val: node.next.val, node: node.next });\n    }\n  }\n  return dummy.next;\n}'
      },
      {
        id: 'kwm-matrix',
        title: 'Sorted Matrix Pattern',
        content: 'Matrix sorted in rows AND columns. Treat each row as a sorted array.\n\nFor Kth smallest: pop K times from heap of first column, pushing element to the right each time.',
        codeExample: 'function kthSmallest(matrix, k) {\n  const n = matrix.length;\n  const heap = new MinHeap((a, b) => a[0] - b[0]);\n  // Push first column\n  for (let i = 0; i < n; i++) {\n    heap.push([matrix[i][0], i, 0]); // [val, row, col]\n  }\n  for (let i = 0; i < k - 1; i++) {\n    const [val, row, col] = heap.pop();\n    if (col + 1 < n) {\n      heap.push([matrix[row][col + 1], row, col + 1]);\n    }\n  }\n  return heap.pop()[0];\n}'
      },
      {
        id: 'kwm-range',
        title: 'Smallest Range Covering K Lists',
        content: 'Track current element from each list. Range = [min, max] of current elements.\n\nMin heap gives min. Track max separately.\nWhen advancing min, check if max changes.',
      },
      {
        id: 'kwm-complexity',
        title: 'Why O(N log K)?',
        content: 'N = total elements across all arrays.\nEach element: one push O(log K) + one pop O(log K).\nTotal: O(N log K).\n\nCompare to merge-all-then-sort: O(N log N). When K << N, K-way is faster!'
      },
      {
        id: 'kwm-pairs',
        title: 'K Pairs with Smallest Sums',
        content: 'nums1[i] + nums2[j] pairs. Think of it as K sorted lists where list i = nums1[i] + all of nums2.\n\nStart with (nums1[0], nums2[j]) for j = 0 to min(k, len2). Expand systematically.'
      }
    ],
    flashcards: [
      { id: 'kwm-1', front: 'Merge K Sorted Lists\n\nMerge k sorted linked lists into one sorted linked list.', back: 'Min heap with head from each list.\nPop min → result, push its next.\n\nO(N log K) time, O(K) space.' },
      { id: 'kwm-2', front: 'Kth Smallest in Sorted Matrix\n\nFind the kth smallest element in an n×n matrix where rows and columns are sorted.', back: 'Min heap with first column.\nPop K times, push element to the right.\n\nO(K log n) time.' },
      { id: 'kwm-3', front: 'Smallest Range Covering K Lists\n\nFind the smallest range that includes at least one number from each of k sorted lists.', back: 'Min heap + track max.\nRange = [heap.top, max].\n\nAdvance min pointer, update range.' },
      { id: 'kwm-4', front: 'Heap Entry Structure', back: 'Store: (value, source index, position in source).\n\nNeeded to know where to get next element!' },
      { id: 'kwm-5', front: 'Time: N elements, K lists', back: 'O(N log K).\n\nEach element: push + pop = O(log K).\nN elements total.' },
      { id: 'kwm-6', front: 'K Pairs with Smallest Sums\n\nFind k pairs with the smallest sums from two sorted arrays.', back: 'Think as K sorted lists.\nList i = nums1[i] + nums2[0], nums1[i] + nums2[1], ...\n\nMin heap, pop K times.' },
      { id: 'kwm-7', front: 'Kth Smallest in M Sorted Arrays\n\nFind the kth smallest element across m sorted arrays.', back: 'Same as merge: min heap with first of each.\nPop K times.\n\nO(K log M).' },
      { id: 'kwm-8', front: 'Why better than sort all?', back: 'Merge all + sort: O(N log N).\nK-way merge: O(N log K).\n\nWhen K << N, big savings!' },
      { id: 'kwm-9', front: 'Merge Two Sorted Lists\n\nMerge two sorted linked lists into one sorted list.', back: 'Special case K=2. No heap needed!\nTwo pointers, compare and advance.\n\nO(n + m) time.' },
      { id: 'kwm-10', front: 'Divide and Conquer Merge', back: 'Alternative to heap: pair-wise merge.\nMerge lists 1&2, 3&4, ... then merge results.\n\nAlso O(N log K).' },
      { id: 'kwm-11', front: 'Sorted Matrix: Binary Search Alternative', back: 'Binary search on value range.\nCount elements <= mid.\n\nO(n log(max-min)).' },
      { id: 'kwm-12', front: 'Heap contains at most K elements', back: 'One element per source (array/list).\nSpace: O(K).\n\nNot O(N)!' },
      { id: 'kwm-13', front: 'External Merge Sort', back: 'Real-world application!\nMerge K sorted chunks that don\'t fit in memory.\n\nSame K-way merge pattern.' },
      { id: 'kwm-14', front: 'Median of K Sorted Arrays\n\nFind the median of k sorted arrays.', back: 'Use K-way merge to get Nth element.\nN = total/2.\n\nOr binary search approach.' },
      { id: 'kwm-15', front: 'Ugly Number II\n\nFind the nth ugly number (positive number whose prime factors are only 2, 3, and 5).', back: 'Merge three sequences: ugly×2, ugly×3, ugly×5.\nAvoid duplicates (use set or skip).\n\nN-th ugly number.' },
      { id: 'kwm-16', front: 'Super Ugly Number\n\nFind the nth super ugly number whose prime factors are in a given array of primes.', back: 'Generalize ugly number with K primes.\n\nK pointers or min heap approach.\n\nTrack indices for each prime.' },
      { id: 'kwm-17', front: 'Merge K Sorted Arrays\n\nMerge k sorted arrays into one sorted array.', back: 'Same as lists: min heap with (val, array_idx, elem_idx).\n\nPop min, push next from same array.' },
      { id: 'kwm-18', front: 'Find K-th Smallest Pair Distance\n\nFind the kth smallest distance among all pairs in an array.', back: 'Binary search on distance + two pointers.\n\nOr: heap approach but O(n²) space.\n\nBinary search preferred.' },
      { id: 'kwm-19', front: 'Merge Sorted Array In-Place\n\nMerge two sorted arrays in-place, where one array has enough space at the end.', back: 'Two pointers from END. Fill from back.\n\nNo extra space needed.\n\nK=2 special case.' },
      { id: 'kwm-20', front: 'IPO Problem with K-Way Merge\n\nMaximize capital by completing at most k projects.', back: 'Two heaps: projects by capital, projects by profit.\n\nRelease affordable projects, pick most profitable.' },
      { id: 'kwm-21', front: 'Find Median from Data Stream\n\nFind the median of a stream of numbers.', back: 'Related: two heaps maintain sorted halves.\n\nK=2 merge concept: track boundary.' },
      { id: 'kwm-22', front: 'Trapping Rain Water II (3D)\n\nCalculate how much water can be trapped in a 3D elevation map.', back: 'Multi-source BFS + min heap for boundaries.\n\nProcess lowest boundary first.\n\nK-way merge on boundary heights.' },
      { id: 'kwm-23', front: 'Swim in Rising Water\n\nFind minimum time to swim from top-left to bottom-right as water level rises.', back: 'Min heap BFS. Always expand lowest water level.\n\nK-way merge of neighbors by height.' },
      { id: 'kwm-24', front: 'Minimum Cost to Reach Destination\n\nFind minimum cost path using Dijkstra\'s algorithm.', back: 'Dijkstra = K-way merge of paths.\n\nMin heap by cost, pop minimum cost path.\n\nExpand from current node.' },
      { id: 'kwm-25', front: 'Kth Smallest Number in M Sorted Rows\n\nFind the kth smallest number across m sorted rows of a matrix.', back: 'Min heap with first element of each row.\n\nPop K times, pushing next from same row.' },
      { id: 'kwm-26', front: 'Merge Intervals After Insertions\n\nMerge overlapping intervals after inserting a new interval.', back: 'Maintain sorted intervals. On insert, merge overlaps.\n\nK-way concept: merge multiple at once.' },
      { id: 'kwm-27', front: 'Employee Free Time\n\nFind the common free time intervals for all employees.', back: 'Merge all schedules. Gaps = free time.\n\nMin heap by start time from each employee.' },
      { id: 'kwm-28', front: 'Heap vs Divide-and-Conquer', back: 'Heap: online, O(K) space\nD&C: batch, O(n) space for recursion\n\nSame O(N log K) time.' },
      { id: 'kwm-29', front: 'Super Soup for N³ Pairs', back: 'Elements from 3 arrays. Min heap generalization.\n\nThink of it as merging N² sorted lists.' },
      { id: 'kwm-30', front: 'K-Way Merge Recognition', back: 'Keywords: "K sorted", "merge", "kth smallest from multiple sources"\n\nThink: min heap with one element per source.' }
    ],
    quizQuestions: [
      {
        id: 'kwm-q1',
        question: 'What is the time complexity of merging K sorted lists with N total elements?',
        options: ['O(N)', 'O(N log N)', 'O(N log K)', 'O(K log N)'],
        correctAnswer: 2,
        explanation: 'Each of N elements is pushed/popped once from a heap of size K. Each operation is O(log K). Total: O(N log K).'
      },
      {
        id: 'kwm-q2',
        question: 'In K-way merge, the heap size is always at most:',
        options: ['N', 'K', 'N × K', 'log K'],
        correctAnswer: 1,
        explanation: 'The heap contains one element from each of the K sources at most, so maximum size is K.'
      },
      {
        id: 'kwm-q3',
        question: 'What should be stored in the heap for K-way merge?',
        options: ['Just the value', 'Value and source information', 'All elements from each source', 'Only indices'],
        correctAnswer: 1,
        explanation: 'We need to know which source the minimum came from to get the next element from that source.'
      },
      {
        id: 'kwm-q4',
        question: 'After popping the minimum, what do you push?',
        options: ['Maximum from any source', 'Nothing', 'Next element from the same source', 'All remaining elements'],
        correctAnswer: 2,
        explanation: 'Push the next element from the same source that provided the minimum. This maintains one element per source.'
      },
      {
        id: 'kwm-q5',
        question: 'For "Smallest Range Covering K Lists", besides min heap, what else do we track?',
        options: ['Sum', 'Maximum current element', 'Count', 'Median'],
        correctAnswer: 1,
        explanation: 'We track the current maximum separately. Range = [heap.min, current_max]. This avoids O(K) scan for max.'
      },
      {
        id: 'kwm-q6',
        question: 'When is K-way merge better than merge-all-then-sort?',
        options: ['Always', 'When K << N', 'When K > N', 'Never'],
        correctAnswer: 1,
        explanation: 'K-way is O(N log K) vs O(N log N). When K is much smaller than N, log K << log N, giving significant speedup.'
      },
      {
        id: 'kwm-q7',
        question: 'Space complexity of K-way merge:',
        options: ['O(1)', 'O(K)', 'O(N)', 'O(N log K)'],
        correctAnswer: 1,
        explanation: 'The heap contains at most K elements (one from each source). Additional space is O(K).'
      },
      {
        id: 'kwm-q8',
        question: 'For Kth smallest in sorted matrix, how many times do we pop?',
        options: ['1', 'K', 'N', 'N²'],
        correctAnswer: 1,
        explanation: 'Pop K times. After K pops, we\'ve extracted the K smallest elements. The Kth pop is our answer.'
      },
      {
        id: 'kwm-q9',
        question: 'For "Merge K Sorted Linked Lists", what\'s stored in each heap entry?',
        options: ['Just the value', 'The entire list', 'The node (with value and next pointer)', 'Index only'],
        correctAnswer: 2,
        explanation: 'Store the node itself. We need its value for comparison, and after popping, we need node.next to push the next element from that list.'
      },
      {
        id: 'kwm-q10',
        question: 'What happens if one of the K lists becomes empty during merge?',
        options: ['Algorithm fails', 'Push null to heap', 'Simply don\'t push anything from that list', 'Restart from beginning'],
        correctAnswer: 2,
        explanation: 'When a list is exhausted (node.next is null), we don\'t push anything. The heap naturally handles this - it just has fewer elements until all lists are exhausted.'
      },
      {
        id: 'kwm-q11',
        question: 'For "Ugly Number II" using K-way merge concept, what are the K sequences?',
        options: ['Random sequences', 'Sequences of multiples: ugly×2, ugly×3, ugly×5', 'Prime number sequences', 'Fibonacci sequences'],
        correctAnswer: 1,
        explanation: 'Ugly numbers only have 2, 3, 5 as prime factors. Generate three sequences by multiplying existing ugly numbers by 2, 3, and 5. Merge them, skipping duplicates.'
      },
      {
        id: 'kwm-q12',
        question: 'What\'s an alternative to heap-based K-way merge that has the same complexity?',
        options: ['Merge sort', 'Divide and conquer: pairwise merge', 'Quick sort', 'Bubble sort'],
        correctAnswer: 1,
        explanation: 'Merge lists in pairs: 1&2, 3&4, etc. Then merge results. Like merge sort but on lists. Still O(N log K) because we do log K rounds of merging, each touching N elements.'
      },
      {
        id: 'kwm-q13',
        question: 'For "Smallest Range Covering Elements from K Lists", what does the heap track?',
        options: ['All elements', 'Current smallest from each list, while tracking global max', 'Sorted elements', 'List lengths'],
        correctAnswer: 1,
        explanation: 'Min heap holds one element per list. Range is [heapMin, currentMax]. Move min forward (add its list\'s next element), update max. Track smallest range seen.'
      },
      {
        id: 'kwm-q14',
        question: 'In "Find K Pairs with Smallest Sums", why start with (nums1[0], nums2[j]) pairs?',
        options: ['Random choice', 'First row of the virtual matrix has smallest potential sums', 'Last row is better', 'Middle row'],
        correctAnswer: 1,
        explanation: 'Think of pairs as a matrix. Row i, col j has sum nums1[i]+nums2[j]. First row has smallest nums1[0], so smallest sums. Start there, expand to next row as needed.'
      },
      {
        id: 'kwm-q15',
        question: 'What makes "Merge K Sorted Lists" different from merging K sorted arrays?',
        options: ['No difference', 'Lists require pointer manipulation, can\'t index directly', 'Arrays are faster', 'Lists need more memory'],
        correctAnswer: 1,
        explanation: 'With linked lists, you can\'t access element i directly - must traverse. But you can rewire pointers instead of copying elements. Heap still holds list nodes.'
      },
      {
        id: 'kwm-q16',
        question: 'For "Kth Smallest Element in a Sorted Matrix", why is binary search on value an option?',
        options: ['Matrix is always square', 'Can count elements ≤ mid in O(n+m), binary search to find Kth value', 'Rows are sorted', 'Columns are sorted'],
        correctAnswer: 1,
        explanation: 'Binary search on answer space [min, max]. For each mid, count elements ≤ mid using the sorted property (O(n+m) per count). Find smallest value with count >= K.'
      },
      {
        id: 'kwm-q17',
        question: 'In K-way merge, what information is stored with each heap element?',
        options: ['Just the value', 'Value plus which list it came from and position in that list', 'List index only', 'Value and timestamp'],
        correctAnswer: 1,
        explanation: 'Heap stores (value, listIndex, elementIndex). After popping min, need listIndex to add next element from that list, and elementIndex to know which element is next.'
      },
      {
        id: 'kwm-q18',
        question: 'For "Merge Intervals" with streams of intervals, how does K-way merge help?',
        options: ['Sort by end', 'Merge K streams of sorted intervals using min heap by start time', 'Random merge', 'No heap needed'],
        correctAnswer: 1,
        explanation: 'Each stream is sorted by start time. Use min heap to process intervals in global sorted order. As intervals arrive, merge overlapping ones. Classic streaming merge.'
      },
      {
        id: 'kwm-q19',
        question: 'What\'s the space complexity of K-way merge using a heap?',
        options: ['O(1)', 'O(K) for the heap', 'O(N) for all elements', 'O(N*K)'],
        correctAnswer: 1,
        explanation: 'Heap holds at most K elements (one per list). Output takes O(N) but that\'s output, not auxiliary space. The algorithm itself uses O(K) extra space.'
      },
      {
        id: 'kwm-q20',
        question: 'For "Smallest Number in Infinite Lists", how do you handle potentially infinite data?',
        options: ['Load everything first', 'Lazily fetch: heap holds current element per list, only fetch next when needed', 'Random sampling', 'Ignore some lists'],
        correctAnswer: 1,
        explanation: 'Can\'t load infinite data. Instead, heap stores current smallest from each list. When you pop from list i, fetch list i\'s next element and add to heap. Process on-demand.'
      }
    ]
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    slug: 'topological-sort',
    description: 'Order elements with dependencies using graph-based topological sorting.',
    icon: 'GitGraph',
    color: '#A29BFE',
    premium: true,
    colorDark: '#8B84E8',
    learnContent: [
      {
        id: 'topo-intro',
        title: 'What is Topological Sort?',
        content: 'Topological Sort orders vertices of a Directed Acyclic Graph (DAG) such that for every edge (u, v), u appears before v in the ordering. Think of it as scheduling tasks where some tasks depend on others - you need to complete prerequisites first.\n\nKey insight: A valid topological ordering exists if and only if the graph has no cycles. If A depends on B and B depends on A, no valid ordering exists.\n\nCommon applications:\n• Build systems (compile dependencies in order)\n• Course scheduling (prerequisites before advanced courses)\n• Package managers (install dependencies first)\n• Spreadsheet cell evaluation (compute referenced cells first)',
      },
      {
        id: 'topo-algo',
        title: 'Kahn\'s Algorithm (BFS Approach)',
        content: 'Kahn\'s algorithm is the intuitive BFS-based approach:\n\n1. Calculate in-degree (incoming edges) for every vertex\n2. Add all vertices with in-degree 0 to a queue (no dependencies)\n3. While queue is not empty:\n   • Remove vertex from queue, add to result\n   • For each neighbor, decrement its in-degree\n   • If neighbor\'s in-degree becomes 0, add to queue\n4. If result has all vertices, return it; otherwise cycle exists\n\nWhy it works: Vertices with in-degree 0 have all dependencies satisfied. Removing them "unlocks" their dependents by reducing their in-degrees.',
        codeExample: 'function kahnTopologicalSort(n, edges) {\n  const inDegree = Array(n).fill(0);\n  const graph = Array(n).fill(null).map(() => []);\n  \n  // Build graph and count in-degrees\n  for (const [u, v] of edges) {\n    graph[u].push(v);  // u -> v (u must come before v)\n    inDegree[v]++;\n  }\n  \n  // Start with nodes that have no prerequisites\n  const queue = [];\n  for (let i = 0; i < n; i++) {\n    if (inDegree[i] === 0) queue.push(i);\n  }\n  \n  const result = [];\n  while (queue.length) {\n    const node = queue.shift();\n    result.push(node);\n    \n    // "Complete" this node, unlocking dependents\n    for (const neighbor of graph[node]) {\n      inDegree[neighbor]--;\n      if (inDegree[neighbor] === 0) {\n        queue.push(neighbor);  // All prereqs done!\n      }\n    }\n  }\n  \n  // If we processed all nodes, no cycle exists\n  return result.length === n ? result : [];\n}'
      },
      {
        id: 'topo-dfs',
        title: 'DFS-Based Topological Sort',
        content: 'Alternative approach using DFS with post-order traversal:\n\n1. Mark nodes as: unvisited (0), visiting (1), visited (2)\n2. For each unvisited node, run DFS\n3. After exploring all descendants, add node to result\n4. Reverse the result at the end\n\nWhy it works: In DFS, a node is added after all its dependents are processed. Reversing gives us the correct order.\n\nCycle detection: If we encounter a node in "visiting" state during DFS, we found a back edge (cycle).',
        codeExample: 'function dfsTopologicalSort(n, edges) {\n  const graph = Array(n).fill(null).map(() => []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n  }\n  \n  const state = Array(n).fill(0); // 0=unvisited, 1=visiting, 2=visited\n  const result = [];\n  let hasCycle = false;\n  \n  function dfs(node) {\n    if (state[node] === 1) {\n      hasCycle = true;  // Back edge found!\n      return;\n    }\n    if (state[node] === 2) return; // Already processed\n    \n    state[node] = 1;  // Mark as visiting\n    \n    for (const neighbor of graph[node]) {\n      dfs(neighbor);\n      if (hasCycle) return;\n    }\n    \n    state[node] = 2;  // Mark as visited\n    result.push(node);  // Post-order: add after descendants\n  }\n  \n  for (let i = 0; i < n && !hasCycle; i++) {\n    if (state[i] === 0) dfs(i);\n  }\n  \n  return hasCycle ? [] : result.reverse();\n}'
      },
      {
        id: 'topo-parallel',
        title: 'Parallel Processing & Minimum Time',
        content: 'A powerful variant: find minimum time when tasks can run in parallel.\n\n"Minimum Semesters to Graduate": Given courses and prerequisites, find minimum semesters if you can take unlimited courses per semester (as long as prereqs are met).\n\nSolution: This is the longest path in the DAG, or equivalently, the maximum "depth" of any node.\n\nApproach using Kahn\'s:\n• Process level by level (all nodes with in-degree 0 simultaneously)\n• Each level is one time unit\n• Track maximum levels processed',
        codeExample: 'function minimumSemesters(n, relations) {\n  const inDegree = Array(n + 1).fill(0);\n  const graph = Array(n + 1).fill(null).map(() => []);\n  \n  for (const [prev, next] of relations) {\n    graph[prev].push(next);\n    inDegree[next]++;\n  }\n  \n  // Start with all courses with no prerequisites\n  let queue = [];\n  for (let i = 1; i <= n; i++) {\n    if (inDegree[i] === 0) queue.push(i);\n  }\n  \n  let semesters = 0;\n  let coursesCompleted = 0;\n  \n  while (queue.length) {\n    semesters++;  // One semester for this batch\n    const nextQueue = [];\n    \n    // Take all available courses this semester\n    for (const course of queue) {\n      coursesCompleted++;\n      for (const next of graph[course]) {\n        inDegree[next]--;\n        if (inDegree[next] === 0) {\n          nextQueue.push(next);\n        }\n      }\n    }\n    queue = nextQueue;\n  }\n  \n  // -1 if cycle (couldn\'t complete all courses)\n  return coursesCompleted === n ? semesters : -1;\n}'
      },
      {
        id: 'topo-alien',
        title: 'Alien Dictionary Pattern',
        content: 'Classic problem: Given sorted words in an alien language, derive the alphabet order.\n\nKey insight: Compare adjacent words to find ordering relationships:\n• "abc" before "abd" → c comes before d\n• "ab" before "abc" → valid (prefix)\n• "abc" before "ab" → INVALID (longer word can\'t come first)\n\nApproach:\n1. Compare adjacent words character by character\n2. First difference gives an edge: char1 → char2\n3. Build graph from all edges\n4. Topological sort gives alphabet order\n\nEdge cases:\n• Invalid input (prefix comes after word)\n• Disconnected letters (multiple valid orderings)',
        codeExample: 'function alienOrder(words) {\n  // Initialize graph with all unique characters\n  const graph = new Map();\n  for (const word of words) {\n    for (const char of word) {\n      if (!graph.has(char)) graph.set(char, new Set());\n    }\n  }\n  \n  // Build edges from adjacent word comparisons\n  for (let i = 0; i < words.length - 1; i++) {\n    const w1 = words[i], w2 = words[i + 1];\n    \n    // Check for invalid case: "abc" before "ab"\n    if (w1.length > w2.length && w1.startsWith(w2)) {\n      return "";  // Invalid ordering\n    }\n    \n    // Find first differing character\n    for (let j = 0; j < Math.min(w1.length, w2.length); j++) {\n      if (w1[j] !== w2[j]) {\n        graph.get(w1[j]).add(w2[j]);  // w1[j] -> w2[j]\n        break;  // Only first difference matters!\n      }\n    }\n  }\n  \n  // Kahn\'s algorithm\n  const inDegree = new Map();\n  for (const char of graph.keys()) inDegree.set(char, 0);\n  for (const neighbors of graph.values()) {\n    for (const n of neighbors) {\n      inDegree.set(n, inDegree.get(n) + 1);\n    }\n  }\n  \n  const queue = [];\n  for (const [char, deg] of inDegree) {\n    if (deg === 0) queue.push(char);\n  }\n  \n  let result = "";\n  while (queue.length) {\n    const char = queue.shift();\n    result += char;\n    for (const neighbor of graph.get(char)) {\n      inDegree.set(neighbor, inDegree.get(neighbor) - 1);\n      if (inDegree.get(neighbor) === 0) queue.push(neighbor);\n    }\n  }\n  \n  return result.length === graph.size ? result : "";\n}'
      },
      {
        id: 'topo-variations',
        title: 'All Topological Orders & Sequence Reconstruction',
        content: 'All Topological Orders: Find all valid orderings (backtracking).\n\nApproach:\n• At each step, any node with in-degree 0 can be chosen\n• Use backtracking: choose one, recurse, restore state\n• Exponential complexity - many valid orderings possible\n\nSequence Reconstruction: Verify if original sequence is the ONLY valid topological order given subsequences.\n\nKey insight: At each step, only ONE choice should have in-degree 0. If multiple choices exist, original isn\'t uniquely determined.\n\nThis is equivalent to checking if the topological order is unique.',
        codeExample: 'function allTopologicalOrders(n, edges) {\n  const graph = Array(n).fill(null).map(() => []);\n  const inDegree = Array(n).fill(0);\n  \n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    inDegree[v]++;\n  }\n  \n  const result = [];\n  const current = [];\n  const visited = new Set();\n  \n  function backtrack() {\n    if (current.length === n) {\n      result.push([...current]);\n      return;\n    }\n    \n    // Try each node with in-degree 0\n    for (let i = 0; i < n; i++) {\n      if (!visited.has(i) && inDegree[i] === 0) {\n        // Choose\n        visited.add(i);\n        current.push(i);\n        for (const neighbor of graph[i]) {\n          inDegree[neighbor]--;\n        }\n        \n        // Recurse\n        backtrack();\n        \n        // Unchoose (restore state)\n        visited.delete(i);\n        current.pop();\n        for (const neighbor of graph[i]) {\n          inDegree[neighbor]++;\n        }\n      }\n    }\n  }\n  \n  backtrack();\n  return result;\n}\n\n// Check if topological order is unique\nfunction isUniqueOrder(n, edges) {\n  // ... build graph and inDegree ...\n  const queue = [];\n  for (let i = 0; i < n; i++) {\n    if (inDegree[i] === 0) queue.push(i);\n  }\n  \n  while (queue.length) {\n    if (queue.length > 1) return false; // Multiple choices!\n    // ... rest of Kahn\'s ...\n  }\n  return true;\n}'
      }
    ],
    flashcards: [
      { id: 'topo-1', front: 'What is topological sort?', back: 'Linear ordering of vertices in a DAG such that for every edge (u,v), u comes before v. Used for dependency resolution - tasks with prerequisites, build orders, course scheduling. Only works on Directed Acyclic Graphs (no cycles).' },
      { id: 'topo-2', front: 'Kahn\'s Algorithm (BFS approach)\n\nPerform topological sort using an iterative BFS-based approach.', back: '1. Compute in-degree for all vertices\n2. Add vertices with in-degree 0 to queue\n3. Process queue: remove vertex, add to result, decrement neighbors\' in-degrees\n4. If neighbor reaches in-degree 0, add to queue\n5. If result has all vertices → valid order; otherwise → cycle exists\nTime: O(V + E)' },
      { id: 'topo-3', front: 'DFS-based topological sort\n\nPerform topological sort using a recursive DFS-based approach.', back: 'Use post-order traversal: after exploring all descendants of a node, add it to result. Reverse result at end. Cycle detection: if we visit a node currently in the recursion stack (visiting state), cycle found. Uses 3 states: unvisited, visiting, visited.' },
      { id: 'topo-4', front: 'In-degree vs out-degree', back: 'In-degree: number of incoming edges (dependencies). Out-degree: number of outgoing edges (dependents). In topological sort, process nodes with in-degree 0 first - they have no unmet dependencies.' },
      { id: 'topo-5', front: 'Detecting cycles with topological sort', back: 'After running Kahn\'s algorithm, if result contains fewer vertices than the graph, a cycle exists. Vertices in the cycle never reach in-degree 0 because they depend on each other circularly.' },
      { id: 'topo-6', front: 'Course Schedule problem\n\nDetermine if it\'s possible to finish all courses given prerequisite constraints.', back: 'Given n courses and prerequisites pairs [a, b] (must take b before a):\n• Build directed graph: b → a\n• Run topological sort\n• If all courses processed → possible\n• If cycle detected → impossible\nReturn order or detect impossibility.' },
      { id: 'topo-7', front: 'Alien Dictionary problem\n\nDerive the order of characters in an alien language from a sorted word list.', back: 'Given sorted words in alien language, find alphabet order:\n1. Compare adjacent words\n2. First differing char gives edge: earlier_char → later_char\n3. Build graph from all edges\n4. Topological sort = alphabet order\nEdge case: if longer word is prefix of and appears before shorter word → invalid.' },
      { id: 'topo-8', front: 'Minimum semesters/time with dependencies\n\nFind minimum time to complete all tasks when tasks with no dependencies can run in parallel.', back: 'Process tasks in parallel when prereqs met. This is finding the longest path in DAG.\nApproach: Level-order Kahn\'s - process all in-degree 0 nodes as one "level" (one time unit). Count levels until done. Also solvable with DP: dist[v] = 1 + max(dist[u]) for all predecessors u.' },
      { id: 'topo-9', front: 'All topological orderings\n\nGenerate all possible valid topological orderings of a DAG.', back: 'Use backtracking: at each step, any node with in-degree 0 is a valid choice. Try each, recurse, restore state. Can have many valid orderings - O(n!) worst case. Unique order only when exactly one node has in-degree 0 at each step.' },
      { id: 'topo-10', front: 'Sequence reconstruction\n\nVerify if a given sequence is the unique topological order from a set of subsequences.', back: 'Verify if original sequence is the ONLY valid topological order given subsequences. At each step in Kahn\'s, if more than one node has in-degree 0, multiple orderings exist. Also check that consecutive elements in original are connected by edges.' },
      { id: 'topo-11', front: 'Task scheduling with dependencies\n\nSchedule tasks respecting dependency constraints.', back: 'Tasks represented as nodes, dependencies as edges. Topological sort gives valid execution order. For parallel execution, level-order processing. Each "level" of nodes with in-degree 0 can run simultaneously.' },
      { id: 'topo-12', front: 'Build order problem\n\nFind a valid build order for projects with dependencies.', back: 'Given projects and dependencies, find build order. Same as topological sort - build projects with no dependencies first, then projects whose dependencies are built. Return error if circular dependency.' },
      { id: 'topo-13', front: 'DFS three-color cycle detection', back: 'WHITE (0): unvisited\nGRAY (1): currently in recursion stack (visiting)\nBLACK (2): completely processed (visited)\nCycle exists if we encounter a GRAY node during DFS - it means we found a back edge to an ancestor.' },
      { id: 'topo-14', front: 'Reconstruct itinerary problem\n\nReconstruct an itinerary from a list of flight tickets starting from a specific airport.', back: 'Given flight tickets, reconstruct itinerary starting from JFK. Variation of topological sort using Hierholzer\'s algorithm for Eulerian path. Visit edges in sorted order, add to result in post-order (reverse at end).' },
      { id: 'topo-15', front: 'When is topological order unique?', back: 'When at every step of Kahn\'s algorithm, exactly one vertex has in-degree 0. If multiple vertices have in-degree 0 simultaneously, they can be ordered differently. This is called a "totally ordered" DAG or a "chain".' },
      { id: 'topo-16', front: 'Parallel Courses Problem\n\nFind the minimum number of semesters needed to complete all courses.', back: 'Courses with dependencies, limited per semester. BFS topological sort by levels.\n\nEach level = one semester. Count levels = minimum semesters.' },
      { id: 'topo-17', front: 'Longest Path in DAG\n\nFind the longest path in a directed acyclic graph.', back: 'Topological sort, then DP. For each node in order:\ndist[v] = max(dist[u] + 1) for all predecessors u.\n\nNo negative edges needed (unlike Bellman-Ford).' },
      { id: 'topo-18', front: 'Find All Ancestors in DAG\n\nFind all ancestors of each node in a directed acyclic graph.', back: 'Reverse edges, then BFS/DFS from each node.\n\nOr: topological sort, propagate ancestors forward.' },
      { id: 'topo-19', front: 'Safe States in Graph\n\nFind all nodes from which all paths lead to terminal nodes.', back: 'Node is safe if all paths from it lead to terminal nodes.\n\nReverse topological sort: start from terminals, work backwards.' },
      { id: 'topo-20', front: 'Minimum Height Trees\n\nFind the roots that minimize tree height.', back: 'Find centroids of tree. BFS from leaves inward.\n\nRemove leaves, repeat until 1-2 nodes remain.\n\nRelated to topological sort (in-degree = 1 for leaves).' },
      { id: 'topo-21', front: 'Course Schedule II Return Order\n\nReturn a valid ordering to finish all courses, or indicate if impossible.', back: 'Return one valid topological order. Kahn\'s naturally produces order.\n\nDFS: reverse post-order.' },
      { id: 'topo-22', front: 'Evaluate Division with Variables\n\nEvaluate division equations given variable relationships.', back: 'Build graph: a/b=2 means edge a→b with weight 2.\n\nBFS/DFS to find path and multiply weights.\n\nUnion-Find also works.' },
      { id: 'topo-23', front: 'Sort Items by Dependencies\n\nSort items by group and item dependencies.', back: 'Two-level topological sort: between groups and within groups.\n\nSort groups topologically, then items within each group.' },
      { id: 'topo-24', front: 'Redundant Connection II\n\nFind the edge that creates a cycle in a directed graph.', back: 'Find edge causing cycle in directed graph with n nodes, n edges.\n\nCases: no node has 2 parents, or one node has 2 parents.\n\nCombine cycle detection with parent tracking.' },
      { id: 'topo-25', front: 'Loud and Rich\n\nFind the quietest person among those who are richer for each person.', back: 'Topological sort on richness graph.\n\nFor each person, find quietest person who is richer.\n\nPropagate answers along edges.' },
      { id: 'topo-26', front: 'Kahn\'s vs DFS Trade-offs', back: 'Kahn\'s: explicit queue, easy to understand, detects cycle by count.\n\nDFS: implicit stack, natural recursion, cycle via back edges.' },
      { id: 'topo-27', front: 'Time Needed to Inform All Employees\n\nFind the time needed to inform all employees in a hierarchy.', back: 'Tree rooted at headID. DFS from root, accumulate time.\n\nMax depth in time-weighted tree.' },
      { id: 'topo-28', front: 'Number of Restricted Paths\n\nCount paths from source to destination where distances strictly decrease.', back: 'Dijkstra from target to get distances.\n\nTopological sort by distance. DP: count paths where distance decreases.' },
      { id: 'topo-29', front: 'Keys and Rooms\n\nDetermine if you can visit all rooms starting from room 0.', back: 'BFS/DFS from room 0 with available keys.\n\nCan visit all rooms? Check if all visited.' },
      { id: 'topo-30', front: 'Topological Sort Applications', back: 'Build systems (make, npm), course prerequisites, spreadsheet cell evaluation, task scheduling, symbol resolution in linkers, data serialization.' }
    ],
    quizQuestions: [
      {
        id: 'topo-q1',
        question: 'Topological sort only works on:',
        options: ['Any graph', 'Undirected graphs', 'Directed Acyclic Graphs (DAGs)', 'Complete graphs'],
        correctAnswer: 2,
        explanation: 'Topological sort requires a Directed Acyclic Graph. Cycles make it impossible to create a consistent linear ordering - if A depends on B and B depends on A, neither can come first.'
      },
      {
        id: 'topo-q2',
        question: 'In Kahn\'s algorithm, which vertices are added to the queue initially?',
        options: ['Vertices with highest in-degree', 'Vertices with in-degree 0', 'Vertices with highest out-degree', 'Random vertices'],
        correctAnswer: 1,
        explanation: 'Vertices with in-degree 0 have no incoming edges, meaning no dependencies. They can be processed first since nothing needs to come before them.'
      },
      {
        id: 'topo-q3',
        question: 'What is the time complexity of topological sort?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V × E)'],
        correctAnswer: 2,
        explanation: 'Both Kahn\'s (BFS) and DFS approaches process each vertex once and examine each edge once, giving O(V + E) time complexity.'
      },
      {
        id: 'topo-q4',
        question: 'How does DFS-based topological sort differ from Kahn\'s algorithm?',
        options: ['DFS uses in-degree counting', 'DFS adds nodes in post-order then reverses', 'DFS is slower', 'DFS cannot detect cycles'],
        correctAnswer: 1,
        explanation: 'DFS-based topological sort adds nodes to the result after all their descendants are processed (post-order), then reverses the result. Kahn\'s uses in-degree counting and BFS.'
      },
      {
        id: 'topo-q5',
        question: 'In the Alien Dictionary problem, comparing "abc" and "abd" tells us:',
        options: ['a comes before b', 'c comes before d', 'The words are equal', 'Nothing useful'],
        correctAnswer: 1,
        explanation: 'We compare character by character until we find the first difference. "abc" vs "abd" differ at index 2: c vs d. Since "abc" comes before "abd" in the sorted order, c must come before d in the alien alphabet.'
      },
      {
        id: 'topo-q6',
        question: 'To find the minimum number of semesters to complete all courses with prerequisites:',
        options: ['Count total courses', 'Find shortest path', 'Process level by level in Kahn\'s', 'Use DFS post-order'],
        correctAnswer: 2,
        explanation: 'Process nodes in "levels" - all nodes with in-degree 0 form one level (one semester). Each level represents courses that can be taken simultaneously. The number of levels is the minimum semesters needed.'
      },
      {
        id: 'topo-q7',
        question: 'A cycle in a directed graph during DFS is detected when:',
        options: ['We visit a fully processed (black) node', 'We visit a node currently in the recursion stack (gray)', 'We find a node with no outgoing edges', 'We run out of unvisited nodes'],
        correctAnswer: 1,
        explanation: 'A gray node is currently being processed (in the recursion stack). Encountering it again means we found a path from this node back to itself - a cycle (back edge).'
      },
      {
        id: 'topo-q8',
        question: 'When is the topological ordering of a DAG unique?',
        options: ['Always unique', 'When the graph is a tree', 'When exactly one node has in-degree 0 at each step', 'When all nodes have the same in-degree'],
        correctAnswer: 2,
        explanation: 'If multiple nodes have in-degree 0 simultaneously, any of them could come next, leading to multiple valid orderings. Unique ordering exists only when at each step exactly one choice is available.'
      },
      {
        id: 'topo-q9',
        question: 'In "Course Schedule II", what should you return if it\'s impossible to finish all courses?',
        options: ['Partial order', 'Empty array', 'Null', 'Exception'],
        correctAnswer: 1,
        explanation: 'If a cycle exists (courses depend on each other circularly), return an empty array to indicate no valid ordering exists. The cycle means prerequisites can never be satisfied.'
      },
      {
        id: 'topo-q10',
        question: 'For "Alien Dictionary", what does it mean if the result length is less than the unique character count?',
        options: ['Answer found', 'There\'s a cycle in the character ordering', 'Input is invalid', 'Multiple valid orderings'],
        correctAnswer: 1,
        explanation: 'If Kahn\'s algorithm processes fewer characters than exist, some characters are stuck in a cycle (never reach in-degree 0). This means the input is inconsistent - no valid alphabet ordering exists.'
      },
      {
        id: 'topo-q11',
        question: 'What does the "Parallel Courses" problem represent in graph terms?',
        options: ['Shortest path', 'Longest path in DAG / maximum depth', 'Minimum spanning tree', 'Graph coloring'],
        correctAnswer: 1,
        explanation: 'Minimum semesters = longest path in the prerequisite DAG, or the maximum "depth" when processing level by level. This represents the critical path - the sequence of dependencies that determines minimum time.'
      },
      {
        id: 'topo-q12',
        question: 'Why can\'t topological sort be done on a graph with cycles?',
        options: ['It would be too slow', 'Cycles create circular dependencies with no valid first element', 'The algorithm needs sorted input', 'Cycles increase memory usage'],
        correctAnswer: 1,
        explanation: 'In a cycle A→B→C→A, each node depends on another in the cycle. None can go first because each has unmet dependencies. This violates the fundamental property that topological order requires: all dependencies of X come before X.'
      },
      {
        id: 'topo-q13',
        question: 'For "Alien Dictionary", what does each edge in the graph represent?',
        options: ['Character frequency', 'Character c1 comes before c2 in alien alphabet', 'Character equality', 'Word length'],
        correctAnswer: 1,
        explanation: 'Compare adjacent words to find character ordering. First differing character gives edge: char from word1 → char from word2. Build graph, topological sort gives alphabet order.'
      },
      {
        id: 'topo-q14',
        question: 'In "Course Schedule II", what does the output represent?',
        options: ['Course difficulties', 'A valid order to take all courses', 'Number of semesters', 'Course credits'],
        correctAnswer: 1,
        explanation: 'Output is a topological ordering of courses. Taking courses in this order ensures all prerequisites are completed before each course. Empty array if cycle exists (impossible).'
      },
      {
        id: 'topo-q15',
        question: 'What\'s the time complexity of Kahn\'s algorithm for topological sort?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V × E)'],
        correctAnswer: 2,
        explanation: 'Process each vertex once (add to queue when indegree hits 0). For each vertex, process its outgoing edges (decrement neighbor indegrees). Total: O(V + E).'
      },
      {
        id: 'topo-q16',
        question: 'For "Minimum Height Trees", what\'s the connection to topological sort?',
        options: ['No connection', 'Leaf removal is like topological sort, removing nodes with degree 1', 'Need DFS only', 'BFS only'],
        correctAnswer: 1,
        explanation: 'Start with leaves (degree 1). Remove them, update neighbors. New leaves emerge. Continue until 1-2 nodes remain - these are the centroids/MHT roots. Similar to Kahn\'s indegree reduction.'
      },
      {
        id: 'topo-q17',
        question: 'In "Parallel Courses", what does the answer represent?',
        options: ['Total courses', 'Minimum semesters to complete all courses taking max parallel courses', 'Number of prerequisites', 'Longest course'],
        correctAnswer: 1,
        explanation: 'Find minimum semesters when you can take all available courses each semester. This is the longest path in DAG (critical path). BFS levels = semesters needed.'
      },
      {
        id: 'topo-q18',
        question: 'How does DFS-based topological sort differ from BFS (Kahn\'s)?',
        options: ['Different results', 'DFS uses recursion and adds nodes after visiting all descendants', 'DFS is slower', 'Same implementation'],
        correctAnswer: 1,
        explanation: 'DFS: recursively visit all descendants, then add current node to result. Reverse at end. Node added only after all its dependencies (descendants) are added. Both give valid orderings.'
      },
      {
        id: 'topo-q19',
        question: 'For "Sequence Reconstruction", what are you verifying?',
        options: ['Sequence is sorted', 'Original sequence is the unique topological order from subsequences', 'Subsequences are valid', 'Length matches'],
        correctAnswer: 1,
        explanation: 'Build graph from subsequence constraints. Check if topological sort gives exactly the original sequence AND it\'s unique (only one valid order). Queue should never have >1 element.'
      },
      {
        id: 'topo-q20',
        question: 'What indicates a cycle during topological sort with Kahn\'s algorithm?',
        options: ['Queue becomes too large', 'Not all nodes are processed (some never reach indegree 0)', 'Stack overflow', 'Negative indegree'],
        correctAnswer: 1,
        explanation: 'If cycle exists, nodes in cycle never reach indegree 0 (always waiting on each other). After algorithm, if processed count < total nodes, a cycle exists.'
      }
    ]
  },
  {
    id: 'island-matrix',
    name: 'Island (Matrix Traversal)',
    slug: 'island-matrix',
    description: 'Master traversing 2D matrices to find islands and connected components.',
    icon: 'Boxes',
    color: '#00B894',
    colorDark: '#00A381',
    premium: true,
    learnContent: [
      {
        id: 'island-intro',
        title: 'What is the Island Pattern?',
        content: 'The Island pattern involves traversing a 2D matrix (grid) to identify connected groups of elements, typically called "islands". An island is formed by connecting adjacent cells horizontally or vertically (sometimes diagonally). This pattern uses DFS or BFS to explore all connected cells.',
      },
      {
        id: 'island-when',
        title: 'When to Use',
        content: 'Use the Island pattern when:\n• Working with 2D grids/matrices\n• Need to find connected components\n• Counting distinct regions\n• Finding perimeters or areas\n• Flood fill type problems\n• Keywords: "island", "region", "connected", "adjacent"',
      },
      {
        id: 'island-dfs',
        title: 'DFS Approach',
        content: 'The most common approach uses Depth-First Search. When we find an unvisited land cell (\'1\'), we start DFS to mark all connected land cells as visited. Each DFS call explores one complete island.',
        codeExample: 'function numIslands(grid) {\n  if (!grid || !grid.length) return 0;\n  let count = 0;\n  const rows = grid.length, cols = grid[0].length;\n  \n  function dfs(r, c) {\n    if (r < 0 || r >= rows || c < 0 || c >= cols) return;\n    if (grid[r][c] !== "1") return;\n    grid[r][c] = "0"; // Mark visited\n    dfs(r + 1, c); dfs(r - 1, c);\n    dfs(r, c + 1); dfs(r, c - 1);\n  }\n  \n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === "1") {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}'
      },
      {
        id: 'island-bfs',
        title: 'BFS Approach',
        content: 'BFS uses a queue to explore level by level. Start from a land cell, add all adjacent land cells to the queue, and continue until the queue is empty. BFS is preferred when finding shortest paths in unweighted grids.',
        codeExample: 'function numIslandsBFS(grid) {\n  const rows = grid.length, cols = grid[0].length;\n  let count = 0;\n  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];\n  \n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === "1") {\n        count++;\n        const queue = [[r, c]];\n        grid[r][c] = "0";\n        while (queue.length) {\n          const [cr, cc] = queue.shift();\n          for (const [dr, dc] of dirs) {\n            const nr = cr + dr, nc = cc + dc;\n            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {\n              queue.push([nr, nc]);\n              grid[nr][nc] = "0";\n            }\n          }\n        }\n      }\n    }\n  }\n  return count;\n}'
      },
      {
        id: 'island-variations',
        title: 'Common Variations',
        content: 'Key variations include:\n• 4-directional vs 8-directional connectivity\n• Finding max area instead of count\n• Island perimeter calculation\n• Distinct islands (by shape)\n• Surrounded regions (border detection)\n• Making islands using minimum operations',
      },
      {
        id: 'island-tips',
        title: 'Tips & Tricks',
        content: 'Important techniques:\n• Modify grid in-place to mark visited (or use separate visited set)\n• Direction arrays: [[0,1],[0,-1],[1,0],[-1,0]] for cleaner code\n• For perimeter: count edges adjacent to water or boundary\n• For distinct shapes: normalize coordinates relative to start\n• Union-Find is alternative for dynamic connectivity\n\nTime: O(m×n), Space: O(m×n) for recursion stack'
      }
    ],
    flashcards: [
      { id: 'isl-1', front: 'Number of Islands\n\nGiven a 2D grid of \'1\'s (land) and \'0\'s (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.', back: 'DFS/BFS from each unvisited "1". Mark visited cells. Count DFS/BFS calls.\n\nTime: O(m×n), Space: O(m×n)' },
      { id: 'isl-2', front: 'Max Area of Island\n\nGiven a 2D grid of 0s and 1s, find the maximum area of an island in the grid. An island is a group of connected 1s (4-directionally).', back: 'DFS returns area of current island. Track maximum across all islands.\n\nreturn 1 + dfs(up) + dfs(down) + dfs(left) + dfs(right)' },
      { id: 'isl-3', front: 'Island Perimeter\n\nGiven a 2D grid with one island (no lakes), calculate the perimeter of the island. The grid has 1s (land) and 0s (water).', back: 'For each land cell, add 4 minus number of adjacent land cells. Or count edges touching water/boundary.\n\nTime: O(m×n), Space: O(1)' },
      { id: 'isl-4', front: 'Flood Fill\n\nGiven a 2D image, a starting pixel, and a new color, perform a flood fill. Change the color of the starting pixel and all connected pixels with the same original color.', back: 'DFS from starting cell, change color of all connected same-color cells. Handle case where new color equals old color!\n\nTime: O(m×n), Space: O(m×n)' },
      { id: 'isl-5', front: 'Surrounded Regions\n\nGiven a 2D board of \'X\'s and \'O\'s, capture all regions that are surrounded by \'X\'. A region is captured by flipping all \'O\'s into \'X\'s in that surrounded region.', back: 'Mark O\'s connected to border (safe). Then flip remaining O\'s to X.\n\nTrick: Start DFS from border cells, not interior!' },
      { id: 'isl-6', front: 'Number of Distinct Islands\n\nGiven a 2D grid, count the number of distinct islands. Two islands are distinct if they have different shapes (considering rotation/reflection as different).', back: 'Normalize each island shape by translating to origin. Store shapes in Set. Use relative coordinates from first cell.\n\nTime: O(m×n), Space: O(m×n)' },
      { id: 'isl-7', front: 'Number of Closed Islands\n\nGiven a 2D grid of 0s and 1s, count the number of closed islands. A closed island is completely surrounded by water (0s) and doesn\'t touch the grid boundary.', back: 'An island is closed if completely surrounded by water (not touching boundary). Mark boundary-connected land first, then count remaining.\n\nSame trick as Surrounded Regions!' },
      { id: 'isl-8', front: 'Making A Large Island\n\nGiven a 2D grid of 0s and 1s, you can change at most one 0 to a 1. Return the size of the largest island you can create.', back: 'Color each island with unique ID, store sizes. For each 0, sum adjacent island sizes + 1.\n\nUse Set to avoid counting same island twice!' },
      { id: 'isl-9', front: 'Shortest Bridge\n\nGiven a 2D grid with exactly two islands, find the smallest number of 0s you must flip to connect the two islands.', back: 'Find first island (DFS), add all its cells to queue. BFS to expand until hitting second island. BFS level = bridge length.\n\nCombines DFS + BFS!' },
      { id: 'isl-10', front: 'Rotting Oranges\n\nGiven a grid with fresh oranges (1), rotten oranges (2), and empty cells (0), every minute a rotten orange makes adjacent fresh oranges rotten. Return minimum minutes until no fresh oranges remain.', back: 'Multi-source BFS from all rotten oranges. Each BFS level = 1 minute. Return levels when no fresh remain, or -1 if unreachable.\n\nTime: O(m×n)' },
      { id: 'isl-11', front: 'Walls and Gates\n\nGiven a 2D grid with walls (-1), gates (0), and empty rooms (INF), fill each empty room with the distance to its nearest gate.', back: 'Multi-source BFS from all gates (0). Update INF cells with distance. BFS ensures shortest distance.\n\nStart from destinations, not sources!' },
      { id: 'isl-12', front: 'Pacific Atlantic Water Flow\n\nGiven a grid of heights, find cells where water can flow to both the Pacific (top/left edges) and Atlantic (bottom/right edges) oceans. Water flows from higher or equal height cells.', back: 'Two DFS/BFS: one from Pacific edges, one from Atlantic. Return cells reachable by both.\n\nReverse thinking: flow UP from ocean, not down from cell.' },
      { id: 'isl-13', front: 'Word Search in Grid\n\nGiven a 2D board of letters and a word, determine if the word exists in the grid. The word can be constructed from adjacent cells (horizontally or vertically), and each cell can only be used once per word.', back: 'DFS with backtracking. Mark cell visited during path, unmark when backtracking. Match character by character.\n\nTime: O(m×n×4^L) where L = word length' },
      { id: 'isl-14', front: 'Shortest Path in Binary Matrix\n\nGiven an n×n binary matrix, find the shortest path from top-left to bottom-right. You can move in 8 directions and only traverse through 0s.', back: 'BFS from (0,0) to (n-1,n-1). Use 8-directional movement. Return path length or -1.\n\nBFS guarantees shortest path in unweighted graph!' },
      { id: 'isl-15', front: '4-directional vs 8-directional', back: '4-dir: [[0,1],[0,-1],[1,0],[-1,0]]\n8-dir: Add [[1,1],[1,-1],[-1,1],[-1,-1]]\n\nRead problem carefully for which to use!' },
      { id: 'isl-16', front: 'As Far from Land as Possible\n\nGiven a grid containing land (1) and water (0), find the water cell that is furthest from any land cell. Return the maximum distance.', back: 'Multi-source BFS from all land cells. Last cell reached by BFS is furthest from any land.\n\nReturn max distance, or -1 if all land or all water.' },
      { id: 'isl-17', front: 'Count Sub Islands\n\nGiven two grids, count islands in grid2 that are also islands in grid1. An island in grid2 is a sub-island if all of its cells are also land in grid1.', back: 'Island in grid2 is sub-island if all its cells are also 1 in grid1. DFS grid2, check all cells exist in grid1.\n\nReturn false if any cell is 0 in grid1.' },
      { id: 'isl-18', front: 'Number of Enclaves\n\nGiven a 2D grid, count the number of land cells (1s) that cannot walk off the boundary of the grid. A cell can walk off if it reaches the grid edge.', back: 'Count land cells not reachable from boundary. Mark boundary-connected cells, count remaining.\n\nSame pattern as Closed Islands!' },
      { id: 'isl-19', front: 'Coloring A Border\n\nGiven a grid and a starting cell, color the border of the connected component containing that cell. A border cell is on the grid edge or adjacent to a cell with a different color.', back: 'Find connected component from start. A cell is border if on grid edge OR adjacent to different color.\n\nTwo-pass: find component, then identify borders.' },
      { id: 'isl-20', front: 'DFS vs BFS for Grids', back: 'DFS: Simpler, uses recursion (or stack), good for exploring/counting\nBFS: Uses queue, finds shortest path, better for level-by-level\n\nBoth O(m×n) time and space.' },
      { id: 'isl-21', front: 'Union-Find for Islands', back: 'Alternative to DFS/BFS. Union adjacent land cells. Count unique parents = number of islands.\n\nBetter for dynamic connectivity (adding cells over time).' },
      { id: 'isl-22', front: 'Number of Islands II\n\nGiven an empty 2D grid, land positions are added one by one. After each addition, return the number of islands. Use an efficient data structure for dynamic updates.', back: 'Positions added one by one. Use Union-Find with path compression. After each add, check if new island or merges existing.\n\nDFS would be O(k×m×n), Union-Find is O(k×α(m×n))' },
      { id: 'isl-23', front: 'Minimum Days to Disconnect Island\n\nGiven a grid with one island, find the minimum number of days to disconnect the island. Each day you can change one land cell to water.', back: 'Answer is always 0, 1, or 2. Check if already disconnected (0). Try removing each cell (1). Otherwise 2 (remove corner).\n\nKey insight: Never need more than 2!' },
      { id: 'isl-24', front: 'Where Will the Ball Fall\n\nGiven a grid representing a box with diagonal boards, determine where each ball dropped from the top will exit. Balls get stuck in V-shapes.', back: 'Simulate each ball. At each cell, check if ball can continue based on current and adjacent cell patterns.\n\nV-shape blocks, \\ or / allows passing.' },
      { id: 'isl-25', front: 'Grid In-Place Modification', back: 'Common trick: Use different values to mark visited (e.g., "1" → "2" or "1" → "0").\n\nAvoid separate visited array when possible!' },
      { id: 'isl-26', front: 'Boundary Condition Handling', back: 'Always check: r >= 0 && r < rows && c >= 0 && c < cols\n\nCheck bounds BEFORE accessing grid[r][c] to avoid errors!' },
      { id: 'isl-27', front: 'Land and Water Cells', back: 'Land = 1, Water = 0 (usually). Some problems flip this or use different characters like "X" and "O".\n\nAlways verify from problem statement!' },
      { id: 'isl-28', front: 'Multi-Source BFS Pattern', back: 'Add ALL sources to queue initially. BFS expands from all simultaneously. Perfect for "minimum distance to nearest X" problems.\n\nExamples: Rotting Oranges, Walls and Gates' },
      { id: 'isl-29', front: 'Matrix DFS Stack Overflow', back: 'Very large grids may cause stack overflow with recursion. Convert to iterative DFS with explicit stack.\n\nOr use BFS which is naturally iterative.' },
      { id: 'isl-30', front: 'Time/Space Complexity', back: 'Most matrix traversal:\nTime: O(m×n) - visit each cell once\nSpace: O(m×n) - recursion stack or queue\n\nWith in-place marking, space can be O(1) extra.' }
    ],
    quizQuestions: [
      {
        id: 'isl-q1',
        question: 'What is the time complexity of counting islands in an m×n grid?',
        options: ['O(m + n)', 'O(m × n)', 'O(m × n × log(m×n))', 'O((m × n)²)'],
        correctAnswer: 1,
        explanation: 'Each cell is visited at most once during the traversal, giving O(m × n) time complexity.'
      },
      {
        id: 'isl-q2',
        question: 'In the "Surrounded Regions" problem, why do we start DFS from the border?',
        options: ['Border cells are easier to find', 'To mark cells that should NOT be flipped', 'Border cells have fewer neighbors', 'It\'s more efficient'],
        correctAnswer: 1,
        explanation: 'O\'s connected to the border cannot be surrounded, so we mark them safe first, then flip the remaining O\'s.'
      },
      {
        id: 'isl-q3',
        question: 'What data structure is typically used for BFS in matrix traversal?',
        options: ['Stack', 'Queue', 'Heap', 'Linked List'],
        correctAnswer: 1,
        explanation: 'BFS uses a queue to process cells level by level, ensuring we explore all cells at distance d before distance d+1.'
      },
      {
        id: 'isl-q4',
        question: 'How do you handle the "Rotting Oranges" problem optimally?',
        options: ['DFS from each rotten orange', 'BFS from fresh oranges to rotten', 'Multi-source BFS from all rotten oranges', 'Union-Find'],
        correctAnswer: 2,
        explanation: 'Multi-source BFS starts from ALL rotten oranges simultaneously. Each level represents one minute of rotting spread.'
      },
      {
        id: 'isl-q5',
        question: 'What is the direction array for 4-directional movement?',
        options: ['[[1,1],[-1,-1],[1,-1],[-1,1]]', '[[0,1],[0,-1],[1,0],[-1,0]]', '[[1,0],[0,1]]', '[[0,0],[1,1]]'],
        correctAnswer: 1,
        explanation: '[[0,1],[0,-1],[1,0],[-1,0]] represents right, left, down, up movements respectively.'
      },
      {
        id: 'isl-q6',
        question: 'In "Shortest Bridge", what technique is used?',
        options: ['Only DFS', 'Only BFS', 'DFS to find first island, then BFS to reach second', 'Binary Search'],
        correctAnswer: 2,
        explanation: 'Use DFS to find and mark the first island, add all its cells to queue, then BFS expand until reaching the second island.'
      },
      {
        id: 'isl-q7',
        question: 'Why might you prefer Union-Find over DFS for island problems?',
        options: ['It\'s always faster', 'For dynamic problems where cells are added over time', 'It uses less memory', 'It\'s easier to implement'],
        correctAnswer: 1,
        explanation: 'Union-Find excels when the grid changes dynamically (cells added/removed). For static grids, DFS/BFS is simpler.'
      },
      {
        id: 'isl-q8',
        question: 'How do you find distinct islands (by shape)?',
        options: ['Count total cells', 'Store island coordinates as strings in a Set', 'Use BFS only', 'Compare areas'],
        correctAnswer: 1,
        explanation: 'Normalize each island\'s coordinates relative to its starting cell, convert to string, store in Set. Equal strings = same shape.'
      },
      {
        id: 'isl-q9',
        question: 'What is the space complexity of recursive DFS on an m×n grid?',
        options: ['O(1)', 'O(m + n)', 'O(m × n)', 'O(log(m × n))'],
        correctAnswer: 2,
        explanation: 'In worst case (e.g., snake-like path), recursion depth can be m×n, so space complexity is O(m × n).'
      },
      {
        id: 'isl-q10',
        question: 'How do you calculate island perimeter?',
        options: ['Count all land cells × 4', 'For each land cell, count edges touching water or boundary', 'Use BFS only', 'Count diagonal neighbors'],
        correctAnswer: 1,
        explanation: 'Each land cell contributes edges not shared with other land cells. Count edges adjacent to water (0) or grid boundary.'
      },
      {
        id: 'isl-q11',
        question: 'What does "Pacific Atlantic Water Flow" require?',
        options: ['Single DFS from center', 'BFS from Pacific only', 'Two separate traversals from each ocean, find intersection', 'Dijkstra\'s algorithm'],
        correctAnswer: 2,
        explanation: 'Run DFS/BFS from Pacific border cells and separately from Atlantic border cells. Return cells reachable by both.'
      },
      {
        id: 'isl-q12',
        question: 'In "Word Search", why do we need backtracking?',
        options: ['To improve time complexity', 'To unmark visited cells when path doesn\'t lead to solution', 'To handle duplicates', 'It\'s optional'],
        correctAnswer: 1,
        explanation: 'We mark cells visited to avoid reuse in same path. When a path fails, we must unmark (backtrack) to try other paths.'
      },
      {
        id: 'isl-q13',
        question: 'What is the key insight for "Minimum Days to Disconnect Island"?',
        options: ['Use binary search', 'Answer is always 0, 1, or 2', 'Need dynamic programming', 'Use Union-Find'],
        correctAnswer: 1,
        explanation: 'Removing at most 2 cells at a corner always disconnects. So we only check 0 (already disconnected), 1 (try each cell), or return 2.'
      },
      {
        id: 'isl-q14',
        question: 'When should you use 8-directional instead of 4-directional connectivity?',
        options: ['Always for efficiency', 'When diagonally adjacent cells are considered connected', 'Never in interviews', 'Only for BFS'],
        correctAnswer: 1,
        explanation: 'Problem statement specifies connectivity. Some problems (like shortest path in binary matrix) allow diagonal movement.'
      },
      {
        id: 'isl-q15',
        question: 'How do you avoid revisiting cells in matrix DFS?',
        options: ['Use a stack', 'Modify the grid in-place or use a visited set', 'Use recursion', 'Sort the cells first'],
        correctAnswer: 1,
        explanation: 'Either modify grid values (e.g., "1" to "0") or maintain a separate visited set to track processed cells.'
      },
      {
        id: 'isl-q16',
        question: 'In "Making A Large Island", what\'s the trick to avoid counting same island twice?',
        options: ['Use BFS instead of DFS', 'Use a Set to store unique island IDs when checking neighbors', 'Count all neighbors', 'Use Union-Find only'],
        correctAnswer: 1,
        explanation: 'When checking what happens if we flip a 0, adjacent cells might belong to same island. Use Set of island IDs to avoid double counting.'
      },
      {
        id: 'isl-q17',
        question: 'What is the typical return value when there\'s no valid path in BFS?',
        options: ['0', '-1', 'null', 'Infinity'],
        correctAnswer: 1,
        explanation: 'By convention, -1 indicates no valid path exists (e.g., Shortest Path in Binary Matrix returns -1 if destination unreachable).'
      },
      {
        id: 'isl-q18',
        question: 'For "Flood Fill", what edge case must be handled?',
        options: ['Empty grid', 'Single cell', 'New color equals original color', 'All cells same color'],
        correctAnswer: 2,
        explanation: 'If new color equals original color, DFS would loop forever (already colored cells look unvisited). Check and return early.'
      },
      {
        id: 'isl-q19',
        question: 'What does multi-source BFS guarantee about distances?',
        options: ['Maximum distance', 'Minimum distance from nearest source', 'Average distance', 'Random distance'],
        correctAnswer: 1,
        explanation: 'Starting BFS from all sources simultaneously, when a cell is first reached, it\'s at minimum distance from nearest source.'
      },
      {
        id: 'isl-q20',
        question: 'What is the advantage of iterative DFS over recursive DFS?',
        options: ['Faster execution', 'Avoids stack overflow for very large grids', 'Uses less memory', 'Simpler code'],
        correctAnswer: 1,
        explanation: 'Recursive DFS can cause stack overflow on very large grids. Iterative DFS with explicit stack has same logic but no recursion limit.'
      }
    ]
  },
  {
    id: 'bitwise-xor',
    name: 'Bitwise XOR',
    slug: 'bitwise-xor',
    description: 'Learn bit manipulation techniques to solve array and number problems efficiently.',
    icon: 'Code-slash',
    color: '#6C5CE7',
    colorDark: '#5B4BC4',
    premium: true,
    learnContent: [
      {
        id: 'xor-intro',
        title: 'What is Bitwise XOR?',
        content: 'XOR (exclusive OR) is a bitwise operation that returns 1 when bits are different, 0 when same. Key properties:\n• a ^ a = 0 (same values cancel)\n• a ^ 0 = a (identity)\n• XOR is commutative and associative\n• XOR is its own inverse: (a ^ b) ^ b = a',
      },
      {
        id: 'xor-properties',
        title: 'Essential XOR Properties',
        content: 'Critical properties for interviews:\n• Self-inverse: x ^ x = 0\n• Identity: x ^ 0 = x\n• Commutative: a ^ b = b ^ a\n• Associative: (a ^ b) ^ c = a ^ (b ^ c)\n• If a ^ b = c, then a ^ c = b and b ^ c = a\n\nThese properties let us "cancel out" paired values!',
      },
      {
        id: 'xor-single',
        title: 'Finding Single Number',
        content: 'The classic XOR problem: find the element that appears once when all others appear twice. XOR all numbers together - pairs cancel to 0, leaving the single number.',
        codeExample: 'function singleNumber(nums) {\n  let result = 0;\n  for (const num of nums) {\n    result ^= num;\n  }\n  return result;\n}\n\n// Example: [4,1,2,1,2]\n// 4^1^2^1^2 = 4^(1^1)^(2^2) = 4^0^0 = 4'
      },
      {
        id: 'xor-two-single',
        title: 'Two Single Numbers',
        content: 'When two numbers appear once, XOR gives their combined result. Use a set bit to separate numbers into two groups, then XOR each group.',
        codeExample: 'function singleNumberIII(nums) {\n  let xor = 0;\n  for (const n of nums) xor ^= n;\n  \n  // Find rightmost set bit (differs between a and b)\n  const rightmostBit = xor & (-xor);\n  \n  let a = 0, b = 0;\n  for (const n of nums) {\n    if (n & rightmostBit) a ^= n;\n    else b ^= n;\n  }\n  return [a, b];\n}'
      },
      {
        id: 'xor-tricks',
        title: 'Common XOR Tricks',
        content: 'Useful bit manipulation tricks:\n• Swap without temp: a ^= b; b ^= a; a ^= b;\n• Check if bit is set: (n >> i) & 1\n• Set bit: n | (1 << i)\n• Clear bit: n & ~(1 << i)\n• Toggle bit: n ^ (1 << i)\n• Clear rightmost set bit: n & (n-1)\n• Get rightmost set bit: n & (-n)',
      },
      {
        id: 'xor-advanced',
        title: 'Advanced Applications',
        content: 'XOR beyond finding singles:\n• Find missing number: XOR indices with values\n• Find duplicate: Similar to missing\n• Complement of number: XOR with all 1s mask\n• Check if power of 2: n & (n-1) == 0\n• Count set bits: Loop with n &= (n-1)\n\nTime: O(n), Space: O(1) for most XOR solutions!'
      }
    ],
    flashcards: [
      { id: 'xor-1', front: 'Single Number\n\nGiven an array where every element appears twice except for one, find the single element that appears only once.', back: 'XOR all elements. Pairs cancel (a^a=0), single remains.\n\nTime: O(n), Space: O(1)' },
      { id: 'xor-2', front: 'XOR Properties', back: '• a ^ a = 0\n• a ^ 0 = a\n• Commutative: a ^ b = b ^ a\n• Associative: (a^b)^c = a^(b^c)' },
      { id: 'xor-3', front: 'Two Single Numbers\n\nGiven an array where every element appears twice except for two elements, find these two elements that appear only once.', back: 'XOR all → xor of two singles. Use rightmost set bit to split into groups. XOR each group.\n\nTime: O(n), Space: O(1)' },
      { id: 'xor-4', front: 'Single Number II\n\nGiven an array where every element appears three times except for one element, find the single element that appears only once.', back: 'Count bits at each position mod 3. Can use "ones" and "twos" bitmasks.\n\nTime: O(n), Space: O(1)' },
      { id: 'xor-5', front: 'Missing Number\n\nGiven an array containing n distinct numbers from 0 to n, find the one number that is missing from the array.', back: 'XOR all indices (0 to n) with all values. Missing number remains.\n\nAlternative: sum formula n(n+1)/2 - sum' },
      { id: 'xor-6', front: 'Find the Duplicate Number', back: 'Floyd\'s cycle detection (not XOR) for O(1) space.\n\nXOR approach needs modification since range differs from indices.' },
      { id: 'xor-7', front: 'Complement of Base 10 Number\n\nGiven a positive integer, output its complement number. The complement is the number you get by flipping all bits in its binary representation.', back: 'XOR with all 1s of same length. Find mask: (1 << bitLength) - 1, then num ^ mask.\n\nExample: 5 (101) ^ 7 (111) = 2 (010)' },
      { id: 'xor-8', front: 'Swap Two Numbers', back: 'a ^= b; b ^= a; a ^= b;\n\nWorks because (a^b)^b = a\n\nNote: Fails if a and b are same variable!' },
      { id: 'xor-9', front: 'Check if Bit is Set', back: '(num >> position) & 1\nor\n(num & (1 << position)) != 0' },
      { id: 'xor-10', front: 'Set a Bit', back: 'num | (1 << position)\n\nSets bit at position to 1, leaves others unchanged.' },
      { id: 'xor-11', front: 'Clear a Bit', back: 'num & ~(1 << position)\n\nClears bit at position to 0, leaves others unchanged.' },
      { id: 'xor-12', front: 'Toggle a Bit', back: 'num ^ (1 << position)\n\nFlips the bit at position.' },
      { id: 'xor-13', front: 'Clear Rightmost Set Bit', back: 'n & (n - 1)\n\nUseful for counting set bits or checking power of 2.' },
      { id: 'xor-14', front: 'Get Rightmost Set Bit', back: 'n & (-n)\n\nIsolates the lowest set bit.\n-n is two\'s complement (flip bits + 1)' },
      { id: 'xor-15', front: 'Check Power of 2', back: 'n > 0 && (n & (n-1)) == 0\n\nPower of 2 has exactly one set bit.' },
      { id: 'xor-16', front: 'Count Set Bits (Hamming Weight)', back: 'Loop: count++, n &= (n-1)\nOr: n.toString(2).split("1").length - 1\n\nTime: O(number of set bits)' },
      { id: 'xor-17', front: 'Hamming Distance\n\nGiven two integers, calculate the Hamming distance between them (the number of positions at which the corresponding bits are different).', back: 'Count set bits in x ^ y.\n\nXOR gives 1 where bits differ.' },
      { id: 'xor-18', front: 'Total Hamming Distance', back: 'For each bit position, count 0s and 1s. Add count0 × count1.\n\nTime: O(32n) = O(n)' },
      { id: 'xor-19', front: 'Reverse Bits', back: 'Loop through 32 bits, build result:\nresult = (result << 1) | (n & 1); n >>= 1;' },
      { id: 'xor-20', front: 'Power of Four', back: '1. Check power of 2: n & (n-1) == 0\n2. Check bit in odd position: n & 0x55555555\n\n0x55555555 = 0101...0101 in binary' },
      { id: 'xor-21', front: 'Sum of Two Integers (no + or -)', back: 'XOR gives sum without carry.\nAND gives carry bits (shift left).\nRepeat until carry is 0.\n\na ^ b, (a & b) << 1' },
      { id: 'xor-22', front: 'Maximum XOR of Two Numbers', back: 'Build answer bit by bit from MSB. Use trie or greedy with HashSet.\n\nTime: O(32n) = O(n)' },
      { id: 'xor-23', front: 'XOR Queries of a Subarray', back: 'Build prefix XOR array. Query [L,R] = prefix[R+1] ^ prefix[L].\n\nSimilar to prefix sum but with XOR.' },
      { id: 'xor-24', front: 'Decode XORed Array', back: 'Given encoded[i] = arr[i] ^ arr[i+1] and first element.\narr[i+1] = encoded[i] ^ arr[i]\n\nXOR both sides by arr[i]' },
      { id: 'xor-25', front: 'Find XOR of Numbers in Range', back: 'XOR 1 to n follows pattern based on n % 4:\n0→n, 1→1, 2→n+1, 3→0\n\nUse: xor(1,R) ^ xor(1,L-1)' },
      { id: 'xor-26', front: 'Counting Bits (all numbers 0 to n)', back: 'DP: bits[i] = bits[i >> 1] + (i & 1)\nor: bits[i] = bits[i & (i-1)] + 1\n\nTime: O(n)' },
      { id: 'xor-27', front: 'Binary Number with Alternating Bits', back: 'Check if n ^ (n >> 1) has all bits set.\nOr check consecutive bits differ.' },
      { id: 'xor-28', front: 'Number Complement', back: 'XOR with mask of all 1s. Mask = (1 << bitLength) - 1\nor ~num & mask' },
      { id: 'xor-29', front: 'Prime Number of Set Bits', back: 'Count set bits for each number in range. Check if count is prime.\n\nPrimes to 32: 2,3,5,7,11,13,17,19,23,29,31' },
      { id: 'xor-30', front: 'XOR vs AND vs OR', back: 'XOR: Different bits → 1\nAND: Both 1 → 1\nOR: Either 1 → 1\n\nXOR unique: reversible, pairs cancel' }
    ],
    quizQuestions: [
      {
        id: 'xor-q1',
        question: 'What is the result of a ^ a?',
        options: ['a', '0', '1', '-a'],
        correctAnswer: 1,
        explanation: 'XOR of any number with itself is 0. This is the self-inverse property that makes XOR useful for finding single numbers.'
      },
      {
        id: 'xor-q2',
        question: 'What is the result of a ^ 0?',
        options: ['0', 'a', '1', '-a'],
        correctAnswer: 1,
        explanation: 'XOR with 0 is the identity operation - it returns the original number unchanged.'
      },
      {
        id: 'xor-q3',
        question: 'How does the Single Number problem work?',
        options: ['Sort and compare', 'XOR all elements together', 'Use HashMap', 'Binary search'],
        correctAnswer: 1,
        explanation: 'XOR all elements. Numbers appearing twice cancel out (a^a=0), leaving only the single number.'
      },
      {
        id: 'xor-q4',
        question: 'What expression clears the rightmost set bit of n?',
        options: ['n | (n-1)', 'n & (n-1)', 'n ^ (n-1)', 'n - 1'],
        correctAnswer: 1,
        explanation: 'n & (n-1) clears the rightmost set bit. This is used for counting set bits and checking power of 2.'
      },
      {
        id: 'xor-q5',
        question: 'How do you check if n is a power of 2?',
        options: ['n % 2 == 0', 'n & (n-1) == 0 && n > 0', 'n ^ n == 0', 'n | n == n'],
        correctAnswer: 1,
        explanation: 'Powers of 2 have exactly one set bit. n & (n-1) clears that bit, resulting in 0. Must also check n > 0.'
      },
      {
        id: 'xor-q6',
        question: 'What does n & (-n) give?',
        options: ['All bits cleared', 'The rightmost set bit isolated', 'All bits set', 'The sign bit'],
        correctAnswer: 1,
        explanation: 'n & (-n) isolates the rightmost set bit. -n is two\'s complement, which flips bits and adds 1.'
      },
      {
        id: 'xor-q7',
        question: 'In Two Single Numbers problem, why do we use the rightmost set bit?',
        options: ['It\'s the easiest to compute', 'To separate the two numbers into different groups', 'To find the larger number', 'It\'s not necessary'],
        correctAnswer: 1,
        explanation: 'The rightmost set bit in XOR result means the two numbers differ at that bit. This separates them into groups where one XORs to a, other to b.'
      },
      {
        id: 'xor-q8',
        question: 'What is the Hamming Distance between two numbers?',
        options: ['Their sum', 'Their difference', 'Number of bits where they differ', 'Number of bits where they\'re same'],
        correctAnswer: 2,
        explanation: 'Hamming distance counts positions where bits differ. Calculate as number of set bits in x ^ y.'
      },
      {
        id: 'xor-q9',
        question: 'How do you set the bit at position i?',
        options: ['n | (1 << i)', 'n & (1 << i)', 'n ^ (1 << i)', 'n & ~(1 << i)'],
        correctAnswer: 0,
        explanation: 'OR with a mask that has 1 at position i (1 << i) sets that bit to 1, leaving others unchanged.'
      },
      {
        id: 'xor-q10',
        question: 'How do you toggle the bit at position i?',
        options: ['n | (1 << i)', 'n & (1 << i)', 'n ^ (1 << i)', 'n & ~(1 << i)'],
        correctAnswer: 2,
        explanation: 'XOR with a mask that has 1 at position i toggles that bit (0→1, 1→0), leaving others unchanged.'
      },
      {
        id: 'xor-q11',
        question: 'What is the time complexity of finding a single number using XOR?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 2,
        explanation: 'We need to XOR all n elements once, giving O(n) time with O(1) space.'
      },
      {
        id: 'xor-q12',
        question: 'For the Missing Number problem (array of 0 to n with one missing), what do we XOR?',
        options: ['Only array elements', 'Only indices', 'All indices (0 to n) and all array elements', 'Nothing, use sum formula'],
        correctAnswer: 2,
        explanation: 'XOR indices 0 to n with all array elements. Pairs cancel, missing number remains. Both approaches work!'
      },
      {
        id: 'xor-q13',
        question: 'What is 0x55555555 in binary?',
        options: ['All 1s', 'All 0s', '0101...0101 (alternating)', '1010...1010 (alternating)'],
        correctAnswer: 2,
        explanation: '0x55555555 = 0101 0101... Used to check if set bits are at odd positions (for Power of Four).'
      },
      {
        id: 'xor-q14',
        question: 'How do you add two numbers without + or -?',
        options: ['Use multiplication', 'XOR for sum without carry, AND shifted left for carry, repeat', 'Use division', 'Not possible'],
        correctAnswer: 1,
        explanation: 'XOR gives sum ignoring carry. AND gives carry positions (shift left to add). Repeat until carry is 0.'
      },
      {
        id: 'xor-q15',
        question: 'What\'s wrong with XOR swap when a and b are same variable?',
        options: ['Nothing, it works', 'It sets the variable to 0', 'It doubles the value', 'Compilation error'],
        correctAnswer: 1,
        explanation: 'If a and b point to same memory location: a^=a makes a=0, then b^=0=0, then a^=0=0. Both become 0!'
      },
      {
        id: 'xor-q16',
        question: 'How do you find complement of a number?',
        options: ['~num', 'num ^ 0xFFFFFFFF', 'num ^ ((1 << bitLength) - 1)', 'All work but (c) is most precise'],
        correctAnswer: 3,
        explanation: '~num flips all 32 bits. For complement of actual binary representation, XOR with mask of same length.'
      },
      {
        id: 'xor-q17',
        question: 'What is the Brian Kernighan algorithm used for?',
        options: ['Sorting', 'Counting set bits efficiently', 'Finding duplicates', 'String matching'],
        correctAnswer: 1,
        explanation: 'Brian Kernighan: repeatedly do n &= (n-1) and count. Only iterates once per set bit, very efficient.'
      },
      {
        id: 'xor-q18',
        question: 'In XOR queries on subarray, what\'s the formula for range [L, R]?',
        options: ['prefix[R] - prefix[L]', 'prefix[R] ^ prefix[L-1]', 'prefix[R] + prefix[L]', 'prefix[R+1] ^ prefix[L]'],
        correctAnswer: 3,
        explanation: 'Similar to prefix sum but with XOR. prefix[R+1] ^ prefix[L] gives XOR of elements from L to R.'
      },
      {
        id: 'xor-q19',
        question: 'What pattern does XOR from 1 to n follow based on n%4?',
        options: ['Always n', 'Always 0', '0→n, 1→1, 2→n+1, 3→0', 'Random'],
        correctAnswer: 2,
        explanation: 'XOR 1 to n: if n%4==0 return n, if n%4==1 return 1, if n%4==2 return n+1, if n%4==3 return 0.'
      },
      {
        id: 'xor-q20',
        question: 'Why is XOR useful for cryptography?',
        options: ['It\'s slow', 'It\'s reversible: (a ^ key) ^ key = a', 'It\'s one-way', 'It\'s not used in cryptography'],
        correctAnswer: 1,
        explanation: 'XOR is its own inverse, making it perfect for simple encryption. Encrypt: data ^ key, Decrypt: encrypted ^ key.'
      }
    ]
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    slug: 'backtracking',
    description: 'Explore all possibilities systematically by building solutions incrementally and abandoning invalid paths.',
    icon: 'GitBranch',
    color: '#E17055',
    colorDark: '#D35E48',
    premium: true,
    learnContent: [
      {
        id: 'bt-intro',
        title: 'What is Backtracking?',
        content: 'Backtracking is an algorithmic technique that builds solutions incrementally, abandoning a path ("backtracking") when it determines the path cannot lead to a valid solution. It\'s essentially DFS with pruning.\n\nKey idea: Try → Check → Backtrack if invalid',
      },
      {
        id: 'bt-template',
        title: 'Backtracking Template',
        content: 'The general pattern:\n1. Choose: Select an option\n2. Explore: Recursively explore with this choice\n3. Unchoose: Remove the choice (backtrack)\n\nBase case: Add to result when complete solution found.',
        codeExample: 'function backtrack(result, current, choices) {\n  if (isComplete(current)) {\n    result.push([...current]); // Copy!\n    return;\n  }\n  \n  for (const choice of choices) {\n    if (isValid(choice, current)) {\n      current.push(choice);      // Choose\n      backtrack(result, current, remainingChoices);\n      current.pop();             // Unchoose\n    }\n  }\n}'
      },
      {
        id: 'bt-subsets',
        title: 'Subsets & Combinations',
        content: 'For subsets: at each element, choose to include or exclude.\nFor combinations: select k elements from n.\n\nKey difference from permutations: order doesn\'t matter, so we use a start index to avoid duplicates.',
        codeExample: 'function subsets(nums) {\n  const result = [];\n  function backtrack(start, current) {\n    result.push([...current]);\n    for (let i = start; i < nums.length; i++) {\n      current.push(nums[i]);\n      backtrack(i + 1, current);\n      current.pop();\n    }\n  }\n  backtrack(0, []);\n  return result;\n}'
      },
      {
        id: 'bt-permutations',
        title: 'Permutations',
        content: 'For permutations: order matters, so we can pick any unused element at each step. Use a "used" array or swap elements.\n\nWith duplicates: sort first, skip same values at same level.',
        codeExample: 'function permute(nums) {\n  const result = [];\n  const used = new Array(nums.length).fill(false);\n  \n  function backtrack(current) {\n    if (current.length === nums.length) {\n      result.push([...current]);\n      return;\n    }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      current.push(nums[i]);\n      backtrack(current);\n      current.pop();\n      used[i] = false;\n    }\n  }\n  backtrack([]);\n  return result;\n}'
      },
      {
        id: 'bt-pruning',
        title: 'Pruning Techniques',
        content: 'Pruning eliminates branches early:\n• Skip duplicates: if nums[i] == nums[i-1] and i-1 not used\n• Bound checking: stop if sum exceeds target\n• Constraint validation: check before recursing\n• Sorting: enables efficient duplicate skipping\n\nGood pruning can dramatically improve performance!',
      },
      {
        id: 'bt-problems',
        title: 'Classic Problems',
        content: 'Common backtracking problems:\n• N-Queens: Place queens, check conflicts\n• Sudoku Solver: Fill cells, validate rows/cols/boxes\n• Word Search: Find word in grid\n• Generate Parentheses: Track open/close counts\n• Combination Sum: Allow repeated use\n• Palindrome Partitioning: Check palindrome validity\n\nTime: Usually O(n!) or O(2^n), Space: O(n) for recursion'
      }
    ],
    flashcards: [
      { id: 'bt-1', front: 'Backtracking Template', back: '1. Choose: make a decision\n2. Explore: recurse\n3. Unchoose: undo decision (backtrack)\n\nBase case: solution complete' },
      { id: 'bt-2', front: 'Subsets\n\nGiven an array of unique integers, return all possible subsets (the power set). The solution must not contain duplicate subsets.', back: 'At each element: include or exclude. Use start index.\n\nTime: O(n × 2^n), Space: O(n)' },
      { id: 'bt-3', front: 'Permutations\n\nGiven an array of distinct integers, return all possible permutations in any order.', back: 'Pick any unused element. Use "used" array or swap.\n\nTime: O(n × n!), Space: O(n)' },
      { id: 'bt-4', front: 'Combinations\n\nGiven two integers n and k, return all possible combinations of k numbers chosen from the range [1, n].', back: 'Select k from n. Use start index like subsets but stop at size k.\n\nTime: O(k × C(n,k))' },
      { id: 'bt-5', front: 'Subsets with Duplicates', back: 'Sort first. Skip if nums[i] == nums[i-1] AND i > start.\n\nThe "i > start" is crucial!' },
      { id: 'bt-6', front: 'Permutations with Duplicates', back: 'Sort. Skip if nums[i] == nums[i-1] AND !used[i-1].\n\nEnsures same values used left-to-right.' },
      { id: 'bt-7', front: 'Combination Sum\n\nGiven an array of distinct integers and a target, find all unique combinations where the chosen numbers sum to target. You may use the same number unlimited times.', back: 'Don\'t increment start index on recurse. Same element can be picked again.\n\nbacktrack(i, ...) not backtrack(i+1, ...)' },
      { id: 'bt-8', front: 'Combination Sum II (no reuse)', back: 'Increment start index. Skip duplicates at same level.\n\nif (i > start && nums[i] == nums[i-1]) continue;' },
      { id: 'bt-9', front: 'Generate Parentheses\n\nGiven n pairs of parentheses, generate all combinations of well-formed parentheses.', back: 'Track open and close counts. Add ( if open < n. Add ) if close < open.\n\nValid when open == close == n' },
      { id: 'bt-10', front: 'N-Queens\n\nPlace n queens on an n×n chessboard so that no two queens attack each other. Return all distinct solutions.', back: 'Place row by row. Track columns, diagonals (r-c), anti-diagonals (r+c).\n\nTime: O(n!), Space: O(n)' },
      { id: 'bt-11', front: 'Sudoku Solver\n\nWrite a program to solve a Sudoku puzzle by filling the empty cells. A valid Sudoku has unique numbers 1-9 in each row, column, and 3×3 sub-box.', back: 'Try 1-9 in each empty cell. Validate row, column, 3x3 box. Backtrack if invalid.\n\nReturn true/false to stop early.' },
      { id: 'bt-12', front: 'Word Search', back: 'DFS in grid. Mark visited, backtrack (unmark) after.\n\nTime: O(m×n×4^L) where L = word length' },
      { id: 'bt-13', front: 'Letter Combinations of Phone Number\n\nGiven a string of digits (2-9), return all possible letter combinations that the number could represent (like on a phone keypad).', back: 'Map digits to letters. For each digit, try each letter.\n\nTime: O(4^n) where n = digits length' },
      { id: 'bt-14', front: 'Palindrome Partitioning\n\nGiven a string, partition it such that every substring is a palindrome. Return all possible palindrome partitioning.', back: 'Partition string into palindromes. At each position, try all valid palindrome substrings.\n\nCheck isPalindrome before recursing.' },
      { id: 'bt-15', front: 'Restore IP Addresses\n\nGiven a string of digits, return all possible valid IP addresses that can be formed by inserting dots. A valid IP has four integers (0-255) separated by dots.', back: 'Split into 4 parts. Each part: 1-3 digits, value 0-255, no leading zeros.\n\nBacktrack with segment count.' },
      { id: 'bt-16', front: 'Expression Add Operators', back: 'Insert +, -, * between digits. Track previous operand for * precedence.\n\nComplex: handle multi-digit numbers too.' },
      { id: 'bt-17', front: 'Factor Combinations', back: 'Find all factor combinations. Start from 2, multiply accumulated.\n\nSkip 1 and n itself as factors.' },
      { id: 'bt-18', front: 'Splitting a String Into Descending Values', back: 'Try all prefix lengths. Each part must be less than previous.\n\nHandle leading zeros carefully.' },
      { id: 'bt-19', front: 'Why copy array in base case?', back: 'result.push([...current]) not result.push(current).\n\nOtherwise all results point to same mutated array!' },
      { id: 'bt-20', front: 'Path Sum II', back: 'DFS tree, track path. Add copy when leaf and sum matches.\n\nPop after recursing (backtrack).' },
      { id: 'bt-21', front: 'Backtracking vs DP', back: 'Backtracking: explores all paths, prunes invalid\nDP: stores subproblem results\n\nDP for optimization, backtracking for enumeration.' },
      { id: 'bt-22', front: 'Time Complexity Pattern', back: 'Subsets: O(2^n)\nPermutations: O(n!)\nCombinations C(n,k): O(n!/(k!(n-k)!))\n\nExponential/factorial is typical.' },
      { id: 'bt-23', front: 'Space Complexity', back: 'Usually O(n) for recursion depth + current path.\n\nOutput not counted (can be O(2^n) or O(n!)).' },
      { id: 'bt-24', front: 'Pruning vs No Pruning', back: 'Pruning: check validity BEFORE recursing\nNo pruning: check after recursing\n\nPruning can exponentially reduce branches!' },
      { id: 'bt-25', front: 'Gray Code', back: 'n-bit codes where adjacent differ by 1 bit.\n\nRecursive: prefix 0 to n-1 bit, reverse and prefix 1.' },
      { id: 'bt-26', front: 'Beautiful Arrangement', back: 'Permutation where perm[i] divisible by i or vice versa.\n\nBacktrack with validity check.' },
      { id: 'bt-27', front: 'Matchsticks to Square', back: 'Partition matches into 4 equal groups (square sides).\n\nSort descending, prune when sum exceeds side.' },
      { id: 'bt-28', front: 'Partition to K Equal Sum Subsets', back: 'Generalization: k equal subsets. Start new bucket when current full.\n\nSort descending for better pruning.' },
      { id: 'bt-29', front: 'Remove Invalid Parentheses', back: 'Find minimum removals needed. BFS by levels (removal count) or backtrack with pruning.\n\nGenerate all valid results.' },
      { id: 'bt-30', front: 'Word Squares', back: 'Build word by word. Each word\'s i-th char = i-th word\'s position char.\n\nUse trie for prefix lookup.' }
    ],
    quizQuestions: [
      {
        id: 'bt-q1',
        question: 'What are the three steps in backtracking?',
        options: ['Sort, Search, Return', 'Choose, Explore, Unchoose', 'Push, Pop, Return', 'Initialize, Process, Finalize'],
        correctAnswer: 1,
        explanation: 'Backtracking follows: Choose (make a decision), Explore (recurse), Unchoose (undo the decision to try other options).'
      },
      {
        id: 'bt-q2',
        question: 'What is the time complexity of generating all subsets?',
        options: ['O(n)', 'O(n²)', 'O(2^n)', 'O(n!)'],
        correctAnswer: 2,
        explanation: 'There are 2^n subsets (each element included or not). Generating each takes O(n) to copy, so O(n × 2^n) total.'
      },
      {
        id: 'bt-q3',
        question: 'What is the time complexity of generating all permutations?',
        options: ['O(n)', 'O(2^n)', 'O(n!)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'There are n! permutations. Each takes O(n) to generate, giving O(n × n!) total time complexity.'
      },
      {
        id: 'bt-q4',
        question: 'In Subsets with Duplicates, when do we skip an element?',
        options: ['When it equals the next element', 'When nums[i] == nums[i-1] and i > start', 'Always for duplicates', 'When array is sorted'],
        correctAnswer: 1,
        explanation: 'Skip when nums[i] == nums[i-1] AND i > start. The i > start condition ensures we can still use the first occurrence.'
      },
      {
        id: 'bt-q5',
        question: 'Why do we use result.push([...current]) instead of result.push(current)?',
        options: ['For performance', 'Because current will be mutated, we need a copy', 'It doesn\'t matter', 'To avoid memory leaks'],
        correctAnswer: 1,
        explanation: 'current array is modified during backtracking. Without copying, all results would point to the same (eventually empty) array.'
      },
      {
        id: 'bt-q6',
        question: 'In Generate Parentheses, when can we add a closing parenthesis?',
        options: ['Anytime', 'When close count < open count', 'When close count < n', 'Only at the end'],
        correctAnswer: 1,
        explanation: 'We can add ) only when close < open, ensuring we don\'t have more closing than opening at any point.'
      },
      {
        id: 'bt-q7',
        question: 'What data structures track queen placements in N-Queens?',
        options: ['Just the board', 'Columns, diagonals (r-c), anti-diagonals (r+c)', 'Only rows', 'A 2D matrix'],
        correctAnswer: 1,
        explanation: 'Track columns (same c), diagonals (same r-c), anti-diagonals (same r+c). Row is implicit from recursion level.'
      },
      {
        id: 'bt-q8',
        question: 'In Combination Sum where reuse is allowed, what changes in recursion?',
        options: ['Nothing', 'Use start index', 'Pass same index i instead of i+1', 'Use a used array'],
        correctAnswer: 2,
        explanation: 'Pass i (not i+1) to allow picking the same element again. For no reuse, pass i+1.'
      },
      {
        id: 'bt-q9',
        question: 'What is pruning in backtracking?',
        options: ['Removing elements from array', 'Eliminating branches early that cannot lead to valid solutions', 'Sorting the array', 'Using memoization'],
        correctAnswer: 1,
        explanation: 'Pruning stops exploring a branch as soon as we know it cannot produce a valid solution, saving time.'
      },
      {
        id: 'bt-q10',
        question: 'For Permutations with Duplicates, when do we skip?',
        options: ['nums[i] == nums[i-1]', 'nums[i] == nums[i-1] and used[i-1] is false', 'nums[i] == nums[i+1]', 'Always skip duplicates'],
        correctAnswer: 1,
        explanation: 'Skip when same as previous AND previous not used. This ensures duplicates are used in order (left to right).'
      },
      {
        id: 'bt-q11',
        question: 'What\'s the key insight for Palindrome Partitioning?',
        options: ['Use dynamic programming', 'At each position, try all valid palindrome substrings', 'Check if entire string is palindrome', 'Use two pointers'],
        correctAnswer: 1,
        explanation: 'At each position, try extending to form palindrome substrings. Only recurse when current substring is palindrome.'
      },
      {
        id: 'bt-q12',
        question: 'In Word Search, why do we backtrack (unmark visited)?',
        options: ['To save memory', 'Cell might be needed for a different path', 'It\'s not necessary', 'To handle duplicates'],
        correctAnswer: 1,
        explanation: 'A cell might be part of a different valid path. Unmarking allows it to be used in subsequent explorations.'
      },
      {
        id: 'bt-q13',
        question: 'How does Sudoku Solver use backtracking?',
        options: ['Solve each row independently', 'Try numbers 1-9, backtrack if invalid, return on success', 'Use greedy approach', 'Solve diagonals first'],
        correctAnswer: 1,
        explanation: 'For each empty cell, try 1-9. If valid (row, column, box), recurse. Backtrack if stuck, return true when solved.'
      },
      {
        id: 'bt-q14',
        question: 'What\'s the difference between backtracking and DFS?',
        options: ['They are the same', 'Backtracking has explicit undo step and prunes invalid paths', 'DFS is faster', 'Backtracking uses BFS'],
        correctAnswer: 1,
        explanation: 'Backtracking is DFS with pruning and explicit state restoration. DFS just explores; backtracking builds/abandons solutions.'
      },
      {
        id: 'bt-q15',
        question: 'In Letter Combinations of Phone Number, what\'s the time complexity?',
        options: ['O(n)', 'O(3^n) to O(4^n)', 'O(n!)', 'O(2^n)'],
        correctAnswer: 1,
        explanation: 'Each digit maps to 3-4 letters. With n digits, we have 3^n to 4^n combinations.'
      },
      {
        id: 'bt-q16',
        question: 'How do you restore IP addresses using backtracking?',
        options: ['Split at every position', 'Try 1-3 digit segments, validate range 0-255, ensure 4 parts', 'Use regex', 'Greedy selection'],
        correctAnswer: 1,
        explanation: 'Try taking 1, 2, or 3 digits. Validate: no leading zeros (except "0"), value 0-255, exactly 4 segments total.'
      },
      {
        id: 'bt-q17',
        question: 'Why sort the array before backtracking with duplicates?',
        options: ['For efficiency', 'To bring duplicates adjacent for easy skipping', 'Not necessary', 'To use binary search'],
        correctAnswer: 1,
        explanation: 'Sorting groups duplicates together, making it easy to skip subsequent duplicates at the same recursion level.'
      },
      {
        id: 'bt-q18',
        question: 'In Partition to K Equal Sum Subsets, why sort descending?',
        options: ['No reason', 'Larger elements fail faster, providing better pruning', 'Required by the algorithm', 'To handle duplicates'],
        correctAnswer: 1,
        explanation: 'Placing large elements first fails faster when they exceed target, pruning more branches early.'
      },
      {
        id: 'bt-q19',
        question: 'What\'s the space complexity of backtracking?',
        options: ['O(1)', 'O(n) for recursion depth', 'O(n²)', 'O(2^n)'],
        correctAnswer: 1,
        explanation: 'Space is O(n) for recursion stack and current path. Output space (all solutions) is additional but usually not counted.'
      },
      {
        id: 'bt-q20',
        question: 'When should you use backtracking vs dynamic programming?',
        options: ['They\'re interchangeable', 'Backtracking for finding all solutions, DP for optimization', 'DP for all solutions, backtracking for optimization', 'Based on input size only'],
        correctAnswer: 1,
        explanation: 'Backtracking enumerates all solutions. DP finds optimal value. If you need ALL solutions, use backtracking.'
      }
    ]
  },
  {
    id: 'knapsack-dp',
    name: '0/1 Knapsack (Dynamic Programming)',
    slug: 'knapsack-dp',
    description: 'Master the foundational DP pattern for optimization problems with constraints.',
    icon: 'Archive',
    color: '#FDCB6E',
    colorDark: '#F9BF3B',
    premium: true,
    learnContent: [
      {
        id: 'dp-intro',
        title: 'What is 0/1 Knapsack?',
        content: 'The 0/1 Knapsack problem: given items with weights and values, maximize value while keeping total weight under capacity. "0/1" means each item is either taken (1) or not (0) - no fractions.\n\nThis pattern applies to many optimization problems with constraints!',
      },
      {
        id: 'dp-approach',
        title: 'DP Approach',
        content: 'Define dp[i][w] = max value using first i items with capacity w.\n\nRecurrence:\n• Don\'t take item i: dp[i][w] = dp[i-1][w]\n• Take item i (if fits): dp[i][w] = dp[i-1][w-weight[i]] + value[i]\n• dp[i][w] = max of both options\n\nBase case: dp[0][w] = 0 (no items)',
        codeExample: 'function knapsack(weights, values, capacity) {\n  const n = weights.length;\n  const dp = Array(n + 1).fill(null)\n    .map(() => Array(capacity + 1).fill(0));\n  \n  for (let i = 1; i <= n; i++) {\n    for (let w = 0; w <= capacity; w++) {\n      dp[i][w] = dp[i-1][w]; // Don\'t take\n      if (weights[i-1] <= w) {\n        dp[i][w] = Math.max(\n          dp[i][w],\n          dp[i-1][w - weights[i-1]] + values[i-1]\n        );\n      }\n    }\n  }\n  return dp[n][capacity];\n}'
      },
      {
        id: 'dp-space',
        title: 'Space Optimization',
        content: 'Since dp[i] only depends on dp[i-1], use 1D array!\n\nKey: iterate capacity in REVERSE to avoid using updated values from same row.',
        codeExample: 'function knapsackOptimized(weights, values, capacity) {\n  const dp = Array(capacity + 1).fill(0);\n  \n  for (let i = 0; i < weights.length; i++) {\n    // Reverse order prevents using same item twice!\n    for (let w = capacity; w >= weights[i]; w--) {\n      dp[w] = Math.max(\n        dp[w],\n        dp[w - weights[i]] + values[i]\n      );\n    }\n  }\n  return dp[capacity];\n}'
      },
      {
        id: 'dp-subset',
        title: 'Subset Sum Variations',
        content: 'Classic variations:\n• Subset Sum: Can we make exact target?\n• Equal Partition: Can we split into two equal subsets?\n• Target Sum: Assign +/- to make target\n• Count subsets with given sum\n\nAll use similar dp[i][sum] approach!',
        codeExample: 'function canPartition(nums) {\n  const total = nums.reduce((a, b) => a + b, 0);\n  if (total % 2 !== 0) return false;\n  const target = total / 2;\n  \n  const dp = Array(target + 1).fill(false);\n  dp[0] = true;\n  \n  for (const num of nums) {\n    for (let j = target; j >= num; j--) {\n      dp[j] = dp[j] || dp[j - num];\n    }\n  }\n  return dp[target];\n}'
      },
      {
        id: 'dp-unbounded',
        title: 'Unbounded Knapsack',
        content: 'If items can be used multiple times (unbounded), iterate capacity FORWARD.\n\nExamples: Coin Change, Rod Cutting\n\nForward iteration allows same item to be used again in same row.',
        codeExample: 'function coinChange(coins, amount) {\n  const dp = Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  \n  for (const coin of coins) {\n    // Forward: allows reusing same coin\n    for (let j = coin; j <= amount; j++) {\n      dp[j] = Math.min(dp[j], dp[j - coin] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}'
      },
      {
        id: 'dp-tips',
        title: 'Tips & Patterns',
        content: 'Recognizing knapsack problems:\n• "Maximum/minimum with constraint"\n• "Can we achieve exactly X?"\n• "How many ways to achieve X?"\n\nKey decisions:\n• 0/1 (reverse) vs unbounded (forward)\n• Boolean (||) vs counting (+) vs optimization (max/min)\n• Space: 2D vs 1D optimization\n\nTime: O(n × W), Space: O(W) optimized'
      }
    ],
    flashcards: [
      { id: 'dp-1', front: '0/1 Knapsack\n\nGiven items with weights and values, and a knapsack capacity, maximize the total value while keeping total weight ≤ capacity. Each item can be taken at most once.', back: 'dp[i][w] = max of:\n• dp[i-1][w] (skip)\n• dp[i-1][w-wt[i]] + val[i] (take)\n\nTime: O(nW), Space: O(nW) or O(W)' },
      { id: 'dp-2', front: 'Why reverse iteration in 0/1?', back: 'Prevents using same item twice. Forward would use updated dp[w-wt] from same row.\n\nReverse ensures we read from "previous row".' },
      { id: 'dp-3', front: 'Unbounded Knapsack\n\nGiven items with weights and values, and a knapsack capacity, maximize the total value. Each item can be used unlimited times.', back: 'Items reusable → forward iteration.\n\ndp[j] = max(dp[j], dp[j-wt] + val)\n\nForward reads updated values = reuse allowed' },
      { id: 'dp-4', front: 'Subset Sum\n\nGiven an array of integers and a target sum, determine if there is a subset of the array with sum equal to the target.', back: 'Can subset sum to target?\n\ndp[j] = dp[j] || dp[j - num]\n\nBoolean DP, reverse iteration.' },
      { id: 'dp-5', front: 'Partition Equal Subset Sum\n\nGiven an array of integers, determine if the array can be partitioned into two subsets with equal sum.', back: 'Partition into two equal halves?\n\nSum must be even. Target = sum/2. Subset sum to target.\n\nTime: O(n × sum)' },
      { id: 'dp-6', front: 'Target Sum\n\nGiven an array and a target, assign + or - to each number to reach the target. Count the number of ways to do this.', back: 'Assign + or - to reach target.\n\nTransform: P - N = target, P + N = sum\n→ P = (sum + target) / 2\n\nCount subsets summing to P.' },
      { id: 'dp-7', front: 'Count Subsets with Sum', back: 'dp[j] += dp[j - num]\n\nAddition instead of OR for counting.\n\nInitialize dp[0] = 1 (empty set).' },
      { id: 'dp-8', front: 'Coin Change\n\nGiven coins of different denominations and a total amount, find the minimum number of coins needed to make up that amount. Return -1 if impossible.', back: 'Unbounded: forward iteration.\n\ndp[j] = min(dp[j], dp[j-coin] + 1)\n\ndp[0] = 0, others = Infinity' },
      { id: 'dp-9', front: 'Coin Change 2\n\nGiven coins of different denominations and an amount, count the number of combinations that make up that amount.', back: 'Count combinations (not permutations).\n\nOuter: coins, Inner: amounts\n\ndp[j] += dp[j - coin]' },
      { id: 'dp-10', front: 'Rod Cutting', back: 'Unbounded knapsack: cut rod for max profit.\n\ndp[i] = max(price[j] + dp[i-j-1])' },
      { id: 'dp-11', front: 'Minimum Subset Sum Difference', back: 'Find subset closest to sum/2.\n\nPartition DP, find max achievable ≤ sum/2.\n\nDiff = sum - 2 × maxAchievable' },
      { id: 'dp-12', front: 'Perfect Squares', back: 'Min squares summing to n. Unbounded.\n\ndp[j] = min(dp[j], dp[j - i²] + 1)\n\nTry all squares ≤ j.' },
      { id: 'dp-13', front: 'Combination Sum IV', back: 'Count permutations (order matters!).\n\nOuter: amounts, Inner: nums\n\ndp[j] += dp[j - num]' },
      { id: 'dp-14', front: 'Last Stone Weight II', back: 'Split stones into two groups, minimize |diff|.\n\nSame as minimum subset sum difference!' },
      { id: 'dp-15', front: 'Ones and Zeroes', back: '2D knapsack: capacity is (m zeros, n ones).\n\ndp[i][j] = max strings using ≤i zeros, ≤j ones.' },
      { id: 'dp-16', front: 'Profitable Schemes', back: 'Count schemes with ≥ minProfit using ≤ n members.\n\n3D DP or optimized 2D.' },
      { id: 'dp-17', front: 'Integer Break', back: 'Break n into sum, maximize product.\n\ndp[i] = max(j × (i-j), j × dp[i-j])\n\nOr math: use 3s as much as possible.' },
      { id: 'dp-18', front: 'Word Break', back: 'Can string be segmented into dictionary words?\n\ndp[i] = any dp[j] && s[j:i] in dict\n\nBoolean DP.' },
      { id: 'dp-19', front: 'DP State Definition', back: 'dp[i][w] typically means:\n"Best result using first i items with capacity/sum w"\n\nClearly define what indices represent!' },
      { id: 'dp-20', front: '2D to 1D Optimization', back: 'If dp[i] only depends on dp[i-1]:\n\nUse single array, iterate correctly:\n• 0/1: reverse\n• Unbounded: forward' },
      { id: 'dp-21', front: 'Bounded Knapsack', back: 'Each item has limited quantity k.\n\nOption 1: Treat as k separate items\nOption 2: Binary representation optimization' },
      { id: 'dp-22', front: 'Counting vs Optimization', back: 'Counting: dp[j] += dp[j - x]\nOptimization: dp[j] = max/min(...)\n\nInitialization differs too!' },
      { id: 'dp-23', front: 'Boolean vs Count Initialization', back: 'Boolean: dp[0] = true, rest false\nCount: dp[0] = 1, rest 0\nMin: dp[0] = 0, rest Infinity\nMax: dp[0] = 0, rest 0 or -Infinity' },
      { id: 'dp-24', front: 'Why O(nW) not polynomial?', back: 'W is value, not input size. If W = 2^bits, it\'s exponential in input size.\n\nCalled "pseudo-polynomial".' },
      { id: 'dp-25', front: 'Reconstructing Solution', back: 'To find which items selected:\n\nBacktrack from dp[n][W]. If dp[i][w] ≠ dp[i-1][w], item i was taken.' },
      { id: 'dp-26', front: 'Multiple Knapsacks', back: 'Multiple bags with capacities.\n\nGreedy assignment or DP with state for each bag.' },
      { id: 'dp-27', front: 'Fractional Knapsack', back: 'Can take fractions → Greedy works!\n\nSort by value/weight ratio, take greedily.\n\nNot DP, O(n log n).' },
      { id: 'dp-28', front: 'House Robber', back: 'Can\'t rob adjacent houses.\n\ndp[i] = max(dp[i-1], dp[i-2] + nums[i])\n\nNot exactly knapsack but similar pattern.' },
      { id: 'dp-29', front: 'House Robber II (circular)', back: 'First and last are adjacent.\n\nSolve twice: exclude first OR exclude last.\n\nTake max of both.' },
      { id: 'dp-30', front: 'DP Problem Recognition', back: 'Knapsack signs:\n• Maximize/minimize with constraint\n• "Can we achieve exactly X?"\n• "How many ways?"\n• Choices: take or skip each item' }
    ],
    quizQuestions: [
      {
        id: 'dp-q1',
        question: 'In 0/1 Knapsack with 1D DP, why do we iterate capacity in reverse?',
        options: ['For efficiency', 'To prevent using same item twice', 'To handle negative values', 'No specific reason'],
        correctAnswer: 1,
        explanation: 'Reverse iteration ensures we use values from the "previous row" (before current item was considered), preventing duplicate item usage.'
      },
      {
        id: 'dp-q2',
        question: 'In Unbounded Knapsack, how does iteration direction differ?',
        options: ['Also reverse', 'Forward (normal order)', 'Both work the same', 'Random order'],
        correctAnswer: 1,
        explanation: 'Forward iteration allows using updated values from same row, which represents reusing the same item multiple times.'
      },
      {
        id: 'dp-q3',
        question: 'What is the time complexity of 0/1 Knapsack?',
        options: ['O(n)', 'O(W)', 'O(n × W)', 'O(2^n)'],
        correctAnswer: 2,
        explanation: 'We fill an n × W table (or process n items for W capacities), giving O(n × W) time.'
      },
      {
        id: 'dp-q4',
        question: 'For Equal Partition problem, what must be true about the sum?',
        options: ['Must be odd', 'Must be even', 'Must be prime', 'No requirement'],
        correctAnswer: 1,
        explanation: 'To partition into two equal halves, total sum must be even. If odd, immediately return false.'
      },
      {
        id: 'dp-q5',
        question: 'In Target Sum (+/-), how do we transform the problem?',
        options: ['No transformation needed', 'Find subset summing to (sum + target) / 2', 'Use BFS', 'Sort first'],
        correctAnswer: 1,
        explanation: 'If P = positive subset, N = negative: P - N = target and P + N = sum. So P = (sum + target) / 2.'
      },
      {
        id: 'dp-q6',
        question: 'What\'s the initialization for counting subsets with a given sum?',
        options: ['dp[0] = 0', 'dp[0] = 1, rest = 0', 'All dp = 1', 'All dp = Infinity'],
        correctAnswer: 1,
        explanation: 'dp[0] = 1 represents one way to achieve sum 0 (empty subset). All other sums start with 0 ways.'
      },
      {
        id: 'dp-q7',
        question: 'In Coin Change (minimum coins), what should dp[0] be?',
        options: ['Infinity', '0', '1', '-1'],
        correctAnswer: 1,
        explanation: 'dp[0] = 0 because 0 coins are needed to make amount 0. Other amounts start at Infinity (impossible until proven).'
      },
      {
        id: 'dp-q8',
        question: 'What\'s the difference between Coin Change 2 and Combination Sum IV?',
        options: ['No difference', 'Coin Change 2 counts combinations, Combination Sum IV counts permutations', 'Coin Change 2 is harder', 'Different time complexity'],
        correctAnswer: 1,
        explanation: 'Coin Change 2: order doesn\'t matter (outer: coins). Combination Sum IV: order matters (outer: amounts).'
      },
      {
        id: 'dp-q9',
        question: 'What type of knapsack is Perfect Squares?',
        options: ['0/1 Knapsack', 'Unbounded Knapsack', 'Fractional Knapsack', 'Not a knapsack problem'],
        correctAnswer: 1,
        explanation: 'Squares can be used multiple times, so it\'s unbounded knapsack. Minimize count to reach n.'
      },
      {
        id: 'dp-q10',
        question: 'How do you find minimum subset sum difference?',
        options: ['Greedy approach', 'Find max sum achievable ≤ total/2, answer = total - 2×max', 'BFS', 'Sort and split'],
        correctAnswer: 1,
        explanation: 'Run subset sum DP up to sum/2. Find largest achievable sum. Difference = sum - 2 × largestAchievable.'
      },
      {
        id: 'dp-q11',
        question: 'Ones and Zeroes is which type of problem?',
        options: ['1D Knapsack', '2D Knapsack (two constraints)', 'Not knapsack', 'Graph problem'],
        correctAnswer: 1,
        explanation: 'Two constraints: max zeros (m) and max ones (n). It\'s a 2D knapsack where capacity has two dimensions.'
      },
      {
        id: 'dp-q12',
        question: 'In Word Break, what does dp[i] represent?',
        options: ['Number of words', 'Whether s[0:i] can be segmented', 'Minimum cuts needed', 'Maximum words'],
        correctAnswer: 1,
        explanation: 'dp[i] is boolean: true if substring s[0:i] can be segmented into dictionary words.'
      },
      {
        id: 'dp-q13',
        question: 'Why is 0/1 Knapsack called "pseudo-polynomial"?',
        options: ['It\'s actually polynomial', 'W is a value, not input size; exponential in bits of W', 'It\'s approximation', 'Historical reasons'],
        correctAnswer: 1,
        explanation: 'Complexity O(nW) seems polynomial but W is a number value. If W needs k bits, W = O(2^k), making it exponential in input size.'
      },
      {
        id: 'dp-q14',
        question: 'How do you reconstruct which items were selected?',
        options: ['Not possible', 'Backtrack: if dp[i][w] ≠ dp[i-1][w], item i was taken', 'Run again', 'Use BFS'],
        correctAnswer: 1,
        explanation: 'Start from dp[n][W]. If value differs from dp[i-1][w], item i contributed. Move to dp[i-1][w-wt[i]]. Repeat.'
      },
      {
        id: 'dp-q15',
        question: 'For Fractional Knapsack, what approach is optimal?',
        options: ['Dynamic Programming', 'Greedy by value/weight ratio', 'Backtracking', 'BFS'],
        correctAnswer: 1,
        explanation: 'When fractions allowed, greedy works: sort by value/weight, take items greedily. No DP needed.'
      },
      {
        id: 'dp-q16',
        question: 'In House Robber, what is the recurrence?',
        options: ['dp[i] = dp[i-1] + nums[i]', 'dp[i] = max(dp[i-1], dp[i-2] + nums[i])', 'dp[i] = min(dp[i-1], dp[i-2])', 'dp[i] = dp[i-2] + nums[i]'],
        correctAnswer: 1,
        explanation: 'Either skip house i (take dp[i-1]) or rob house i (dp[i-2] + nums[i], skipping adjacent). Take max.'
      },
      {
        id: 'dp-q17',
        question: 'Integer Break: break n into sum, maximize product. What\'s the math insight?',
        options: ['Use only 2s', 'Use as many 3s as possible', 'Use only 1s', 'Alternate 2s and 3s'],
        correctAnswer: 1,
        explanation: '3s maximize product. Use 3s until remainder is 0, 1, or 2. If remainder 1, use one less 3 and add a 4 (2×2).'
      },
      {
        id: 'dp-q18',
        question: 'Last Stone Weight II transforms to which problem?',
        options: ['Longest Increasing Subsequence', 'Minimum Subset Sum Difference', 'Maximum Subarray', 'Coin Change'],
        correctAnswer: 1,
        explanation: 'Smashing stones is like partitioning into two groups. Minimize |groupA - groupB| = minimum subset sum difference.'
      },
      {
        id: 'dp-q19',
        question: 'What is the space-optimized complexity for most knapsack problems?',
        options: ['O(1)', 'O(n)', 'O(W)', 'O(n × W)'],
        correctAnswer: 2,
        explanation: 'Using 1D DP array, space is O(W) where W is the capacity/target sum.'
      },
      {
        id: 'dp-q20',
        question: 'How to handle bounded knapsack (each item has quantity limit k)?',
        options: ['Same as 0/1', 'Same as unbounded', 'Treat as k separate 0/1 items or use binary representation', 'Not solvable with DP'],
        correctAnswer: 2,
        explanation: 'Option 1: Create k copies of each item, run 0/1 knapsack. Option 2: Binary representation (1,2,4,...) for efficiency.'
      }
    ]
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    slug: 'monotonic-stack',
    description: 'Use stacks maintaining sorted order to efficiently solve next greater/smaller element problems.',
    icon: 'BarChart',
    color: '#00CEC9',
    colorDark: '#00B5AD',
    premium: true,
    learnContent: [
      {
        id: 'ms-intro',
        title: 'What is a Monotonic Stack?',
        content: 'A monotonic stack maintains elements in sorted order (either increasing or decreasing). When a new element breaks the order, we pop elements until order is restored.\n\nPerfect for "next greater/smaller element" problems!',
      },
      {
        id: 'ms-types',
        title: 'Types of Monotonic Stacks',
        content: 'Two main types:\n• Monotonic Increasing: stack[i] < stack[i+1]\n  Pop when new element is smaller\n  Used for: next smaller element\n\n• Monotonic Decreasing: stack[i] > stack[i+1]\n  Pop when new element is larger\n  Used for: next greater element',
      },
      {
        id: 'ms-nge',
        title: 'Next Greater Element',
        content: 'For each element, find the next greater element to its right. Use monotonic decreasing stack.',
        codeExample: 'function nextGreaterElements(nums) {\n  const result = new Array(nums.length).fill(-1);\n  const stack = []; // Store indices\n  \n  for (let i = 0; i < nums.length; i++) {\n    // Pop smaller elements - current is their NGE\n    while (stack.length && nums[i] > nums[stack.at(-1)]) {\n      const idx = stack.pop();\n      result[idx] = nums[i];\n    }\n    stack.push(i);\n  }\n  return result;\n}\n// [2,1,2,4,3] → [4,2,4,-1,-1]'
      },
      {
        id: 'ms-nse',
        title: 'Next Smaller Element',
        content: 'Use monotonic increasing stack. When current element is smaller than stack top, it\'s the next smaller for popped elements.',
        codeExample: 'function nextSmallerElements(nums) {\n  const result = new Array(nums.length).fill(-1);\n  const stack = [];\n  \n  for (let i = 0; i < nums.length; i++) {\n    while (stack.length && nums[i] < nums[stack.at(-1)]) {\n      const idx = stack.pop();\n      result[idx] = nums[i];\n    }\n    stack.push(i);\n  }\n  return result;\n}'
      },
      {
        id: 'ms-histogram',
        title: 'Largest Rectangle in Histogram',
        content: 'Classic monotonic stack problem. For each bar, find the largest rectangle with that bar as the shortest.\n\nNeed both previous and next smaller elements to determine width.',
        codeExample: 'function largestRectangle(heights) {\n  const stack = [];\n  let maxArea = 0;\n  heights.push(0); // Sentinel to empty stack\n  \n  for (let i = 0; i < heights.length; i++) {\n    while (stack.length && heights[i] < heights[stack.at(-1)]) {\n      const h = heights[stack.pop()];\n      const w = stack.length ? i - stack.at(-1) - 1 : i;\n      maxArea = Math.max(maxArea, h * w);\n    }\n    stack.push(i);\n  }\n  return maxArea;\n}'
      },
      {
        id: 'ms-tips',
        title: 'Tips & Applications',
        content: 'Common applications:\n• Next/Previous Greater/Smaller Element\n• Largest Rectangle in Histogram\n• Maximal Rectangle in Matrix\n• Trapping Rain Water\n• Stock Span Problem\n• Sum of Subarray Minimums\n\nTime: O(n) - each element pushed/popped once\nSpace: O(n) for the stack'
      }
    ],
    flashcards: [
      { id: 'ms-1', front: 'Monotonic Stack', back: 'Stack maintaining sorted order. Pop when new element breaks order.\n\nTime: O(n), each element pushed/popped once.' },
      { id: 'ms-2', front: 'Monotonic Decreasing Stack', back: 'Stack[i] > stack[i+1]. Pop when new element is LARGER.\n\nUsed for: Next Greater Element' },
      { id: 'ms-3', front: 'Monotonic Increasing Stack', back: 'Stack[i] < stack[i+1]. Pop when new element is SMALLER.\n\nUsed for: Next Smaller Element' },
      { id: 'ms-4', front: 'Next Greater Element I\n\nGiven two arrays nums1 and nums2 where nums1 is a subset of nums2, find the next greater element for each element of nums1 in nums2.', back: 'Use HashMap for nums1→index. Process nums2 with decreasing stack.\n\nTime: O(n + m)' },
      { id: 'ms-5', front: 'Next Greater Element II\n\nGiven a circular array, find the next greater element for every element. The next greater element is the first greater element traversing circularly.', back: 'Process array twice (2n iterations). Use i % n for circular access.\n\nStack finds NGE considering wrap-around.' },
      { id: 'ms-6', front: 'Daily Temperatures\n\nGiven an array of daily temperatures, return an array where each element is the number of days you have to wait until a warmer temperature. If there is no future warmer day, use 0.', back: 'Find days until warmer temperature. Decreasing stack of indices.\n\nresult[idx] = i - idx' },
      { id: 'ms-7', front: 'Largest Rectangle in Histogram\n\nGiven an array of bar heights, find the largest rectangle that can be formed in the histogram.', back: 'For each bar, find width using previous and next smaller.\n\nAdd sentinel 0 at end to empty stack.\n\nTime: O(n)' },
      { id: 'ms-8', front: 'Maximal Rectangle\n\nGiven a 2D binary matrix filled with 0s and 1s, find the largest rectangle containing only 1s and return its area.', back: 'Build histogram for each row. Apply largest rectangle for each.\n\nhistogram[j] = matrix[i][j] == 1 ? histogram[j]+1 : 0' },
      { id: 'ms-9', front: 'Trapping Rain Water\n\nGiven an array of bar heights representing an elevation map, compute how much water can be trapped after raining.', back: 'Method 1: Monotonic decreasing stack.\nMethod 2: Two pointers with leftMax/rightMax.\n\nWater at i = min(leftMax, rightMax) - height[i]' },
      { id: 'ms-10', front: 'Stock Span Problem\n\nGiven daily stock prices, for each day calculate the span (number of consecutive days before the current day where the price was less than or equal to today\'s price).', back: 'Days since price was higher. Decreasing stack.\n\nSpan = current index - stack top (or all days if empty).' },
      { id: 'ms-11', front: 'Sum of Subarray Minimums\n\nGiven an array of integers, find the sum of minimum values of all possible subarrays. Return the answer modulo 10^9 + 7.', back: 'For each element, count subarrays where it\'s minimum.\n\nUse previous smaller and next smaller distances.\n\nContribution = nums[i] × left × right' },
      { id: 'ms-12', front: 'Sum of Subarray Ranges', back: 'Range = max - min. For each subarray.\n\n= (sum of maximums) - (sum of minimums)\n\nUse both increasing and decreasing stacks.' },
      { id: 'ms-13', front: 'Online Stock Span', back: 'Real-time span calculation. Maintain stack of (price, span).\n\nPop and sum spans while current ≥ top.' },
      { id: 'ms-14', front: 'Remove K Digits\n\nGiven a number as a string and an integer k, remove k digits from the number to get the smallest possible number.', back: 'Remove k digits for smallest number. Increasing stack.\n\nRemove larger digits before smaller ones.\n\nHandle leading zeros.' },
      { id: 'ms-15', front: 'Remove Duplicate Letters\n\nGiven a string, remove duplicate letters so that every letter appears once. Return the lexicographically smallest result.', back: 'Smallest lexicographic result using each char once.\n\nMonotonic increasing + visited set + last occurrence.' },
      { id: 'ms-16', front: 'Previous Greater Element', back: 'Process left to right, check stack top before pushing.\n\nPGE[i] = stack.top() if stack not empty, else -1.' },
      { id: 'ms-17', front: '132 Pattern\n\nGiven an array, find if there exists a subsequence of indices i < j < k such that nums[i] < nums[k] < nums[j].', back: 'Find i < j < k where nums[i] < nums[k] < nums[j].\n\nProcess right to left. Track "third" (potential nums[k]).\n\nDecreasing stack for potential nums[j].' },
      { id: 'ms-18', front: 'Sliding Window Maximum\n\nGiven an array and a window size k, find the maximum value in each sliding window as it moves from left to right.', back: 'Monotonic DECREASING deque. Front = max.\n\nRemove smaller from back, expired from front.\n\nTime: O(n)' },
      { id: 'ms-19', front: 'Shortest Unsorted Subarray', back: 'Find min in "wrong" suffix, max in "wrong" prefix.\n\nOr use monotonic stack to find boundaries.\n\nSimpler: sort and compare.' },
      { id: 'ms-20', front: 'Maximum Width Ramp', back: 'Find max j - i where nums[i] ≤ nums[j].\n\nBuild decreasing stack from left. Scan from right.' },
      { id: 'ms-21', front: 'Stack vs Deque', back: 'Stack: one end access, LIFO\nDeque: both ends access\n\nSliding window max needs deque (remove from both ends).' },
      { id: 'ms-22', front: 'Why O(n) with while loop?', back: 'Each element pushed once, popped once.\n\nTotal operations: 2n = O(n).\n\nAmortized analysis!' },
      { id: 'ms-23', front: 'Store Index vs Value', back: 'Usually store indices in stack.\n\nAllows computing distances AND accessing values.\n\nnums[stack.top()] for value.' },
      { id: 'ms-24', front: 'Sentinel Values', back: 'Add boundary values (0, Infinity) to handle edge cases.\n\nLargest Rectangle: add 0 at end to flush stack.' },
      { id: 'ms-25', front: 'Next Greater with Wrap', back: 'Circular array: process 2n elements, i % n for index.\n\nOnly update result in first pass (i < n).' },
      { id: 'ms-26', front: 'Maximum Score of Good Array', back: 'Expand from index k. Track min while expanding.\n\nScore = min × (right - left + 1). Greedy expansion.' },
      { id: 'ms-27', front: 'Asteroid Collision', back: 'Stack for surviving asteroids. Right-moving (+) vs left-moving (-).\n\nCollision when stack.top > 0 and current < 0.' },
      { id: 'ms-28', front: 'Car Fleet', back: 'Sort by position descending. Stack for arrival times.\n\nIf current arrives after/same as top, it joins fleet (don\'t push).' },
      { id: 'ms-29', front: 'Buildings with Ocean View', back: 'Right to left, track max height seen.\n\nOr left to right with decreasing stack.' },
      { id: 'ms-30', front: 'Steps to Make Array Non-decreasing', back: 'Count "rounds" until array is non-decreasing.\n\nMonotonic stack tracking removal rounds.' }
    ],
    quizQuestions: [
      {
        id: 'ms-q1',
        question: 'What is the time complexity of finding next greater element for all elements?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'Each element is pushed and popped at most once, giving O(n) total operations.'
      },
      {
        id: 'ms-q2',
        question: 'For Next Greater Element, which type of monotonic stack is used?',
        options: ['Increasing', 'Decreasing', 'Either works', 'Neither'],
        correctAnswer: 1,
        explanation: 'Monotonic decreasing stack: when a larger element comes, it becomes the NGE for popped smaller elements.'
      },
      {
        id: 'ms-q3',
        question: 'For Next Smaller Element, which type of monotonic stack is used?',
        options: ['Increasing', 'Decreasing', 'Either works', 'Neither'],
        correctAnswer: 0,
        explanation: 'Monotonic increasing stack: when a smaller element comes, it becomes the NSE for popped larger elements.'
      },
      {
        id: 'ms-q4',
        question: 'In Largest Rectangle in Histogram, why do we add a sentinel 0 at the end?',
        options: ['For efficiency', 'To ensure all elements are processed and popped', 'To handle empty arrays', 'Not necessary'],
        correctAnswer: 1,
        explanation: 'The sentinel 0 is smaller than all heights, causing all remaining stack elements to be popped and processed.'
      },
      {
        id: 'ms-q5',
        question: 'What should we store in the stack for most monotonic stack problems?',
        options: ['Values', 'Indices', 'Both', 'Neither'],
        correctAnswer: 1,
        explanation: 'Storing indices allows us to compute distances AND access values via nums[index]. More flexible than storing values only.'
      },
      {
        id: 'ms-q6',
        question: 'How do we handle circular arrays in Next Greater Element II?',
        options: ['Copy array twice', 'Process 2n elements using i % n', 'Use recursion', 'Not possible'],
        correctAnswer: 1,
        explanation: 'Process 2n elements. Use i % n to wrap around. Only update result for indices in first n elements.'
      },
      {
        id: 'ms-q7',
        question: 'In Daily Temperatures, what does the result represent?',
        options: ['The warmer temperature', 'Days until a warmer day', 'Index of warmer day', 'Maximum temperature'],
        correctAnswer: 1,
        explanation: 'Result[i] = number of days until a warmer temperature. Calculate as (current index - popped index).'
      },
      {
        id: 'ms-q8',
        question: 'What is Stock Span?',
        options: ['Days until price increases', 'Consecutive days with price ≤ current (including today)', 'Maximum price in window', 'Minimum price in window'],
        correctAnswer: 1,
        explanation: 'Span is the count of consecutive days (starting from today, going backward) where price was ≤ today\'s price.'
      },
      {
        id: 'ms-q9',
        question: 'In Sum of Subarray Minimums, how is each element\'s contribution calculated?',
        options: ['Just the element value', 'element × count of subarrays where it\'s minimum', 'element × array length', 'element × index'],
        correctAnswer: 1,
        explanation: 'If element is minimum in k subarrays, its contribution is element × k. Use NSE distances to find k.'
      },
      {
        id: 'ms-q10',
        question: 'What\'s the difference between stack and deque for monotonic problems?',
        options: ['No difference', 'Deque allows removal from both ends, needed for sliding window', 'Stack is faster', 'Deque uses less space'],
        correctAnswer: 1,
        explanation: 'Sliding window maximum needs to remove expired elements from front and smaller elements from back. Deque supports both.'
      },
      {
        id: 'ms-q11',
        question: 'In Remove K Digits, what type of stack is used?',
        options: ['Decreasing', 'Increasing', 'Random', 'No stack needed'],
        correctAnswer: 1,
        explanation: 'Monotonic increasing stack keeps smaller digits. Remove larger digits (on left of smaller) to minimize the number.'
      },
      {
        id: 'ms-q12',
        question: 'How does Maximal Rectangle use Largest Rectangle in Histogram?',
        options: ['They\'re unrelated', 'Build histogram for each row, apply histogram algorithm', 'Use only on last row', 'Use BFS'],
        correctAnswer: 1,
        explanation: 'For each row, compute histogram heights (consecutive 1s above). Apply largest rectangle algorithm. Take maximum.'
      },
      {
        id: 'ms-q13',
        question: 'In the 132 Pattern problem, what do we track?',
        options: ['Maximum element', 'The "third" element (potential nums[k]) and decreasing stack', 'Minimum element', 'All pairs'],
        correctAnswer: 1,
        explanation: 'Process right to left. Decreasing stack holds potential nums[j]. "third" variable holds best nums[k] candidate.'
      },
      {
        id: 'ms-q14',
        question: 'Why is monotonic stack O(n) despite having a while loop inside a for loop?',
        options: ['While loop is O(1)', 'Each element is pushed and popped at most once total', 'The loops are parallel', 'It\'s actually O(n²)'],
        correctAnswer: 1,
        explanation: 'Amortized analysis: across all iterations, each element enters stack once (push) and leaves once (pop). Total: 2n operations.'
      },
      {
        id: 'ms-q15',
        question: 'For Asteroid Collision, when does a collision occur?',
        options: ['Always', 'When both asteroids move right', 'When stack top is positive and current is negative', 'When both are negative'],
        correctAnswer: 2,
        explanation: 'Collision happens when a right-moving asteroid (positive) meets a left-moving asteroid (negative coming from right).'
      },
      {
        id: 'ms-q16',
        question: 'In Trapping Rain Water, what determines water level at position i?',
        options: ['height[i]', 'max(height)', 'min(leftMax, rightMax) - height[i]', 'leftMax + rightMax'],
        correctAnswer: 2,
        explanation: 'Water above position i is bounded by minimum of max heights on both sides, minus the bar\'s own height.'
      },
      {
        id: 'ms-q17',
        question: 'Remove Duplicate Letters requires which additional data structures?',
        options: ['Just stack', 'Stack + visited set + last occurrence map', 'Stack + queue', 'Two stacks'],
        correctAnswer: 1,
        explanation: 'Need: monotonic stack, visited set (track what\'s in stack), last occurrence (know if char appears later).'
      },
      {
        id: 'ms-q18',
        question: 'In Car Fleet, what do we push onto the stack?',
        options: ['Car positions', 'Car speeds', 'Arrival times at destination', 'Car indices'],
        correctAnswer: 2,
        explanation: 'Calculate arrival time for each car. If car arrives before/same as fleet ahead, it joins that fleet.'
      },
      {
        id: 'ms-q19',
        question: 'What is the space complexity of monotonic stack solutions?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'In worst case, all elements are pushed onto stack before any are popped, giving O(n) space.'
      },
      {
        id: 'ms-q20',
        question: 'Maximum Width Ramp uses monotonic stack how?',
        options: ['Increasing stack only', 'Build decreasing stack from left, scan from right', 'Decreasing stack only', 'No stack needed'],
        correctAnswer: 1,
        explanation: 'Build decreasing stack of potential "i" values (left to right). Scan from right to find valid "j" maximizing j-i.'
      }
    ]
  },
  {
    id: 'system-design',
    name: 'System Design',
    slug: 'system-design',
    description: 'Master distributed systems, scalability, and architecture fundamentals.',
    icon: 'Server',
    color: '#636E72',
    premium: true,
    colorDark: '#4D5659',
    learnContent: [
      {
        id: 'sd-intro',
        title: 'System Design Fundamentals',
        content: 'System design involves architecting large-scale distributed systems that can handle millions of users. Key qualities to optimize:\n\n• Scalability - Handle growing load\n• Reliability - Continue working despite failures\n• Availability - Uptime percentage (99.9% = 8.76 hrs downtime/year)\n• Consistency - All users see same data\n• Latency - Response time\n\nThese qualities often conflict - designing systems means making informed trade-offs. Understanding when to sacrifice one quality for another is the core skill.',
      },
      {
        id: 'sd-approach',
        title: 'Interview Framework (RESHADED)',
        content: 'A systematic approach for system design interviews:\n\n1. Requirements - Clarify functional & non-functional requirements\n   • What features? (functional)\n   • How many users? What latency? (non-functional)\n\n2. Estimation - Back-of-envelope calculations\n   • DAU, QPS, storage needs, bandwidth\n   • Use powers of 2: 1M users × 1KB = 1GB\n\n3. Storage - Choose database(s)\n   • SQL vs NoSQL? Sharding strategy?\n\n4. High-level Design - Draw architecture diagram\n   • Client → Load Balancer → Services → Database\n\n5. API Design - Define key endpoints\n   • POST /tweet, GET /timeline\n\n6. Detailed Design - Deep dive into 2-3 components\n   • Focus on most challenging aspects\n\n7. Edge cases & bottlenecks\n   • What breaks at 10× scale? How to handle failures?\n\n8. Discussion - Trade-offs, alternatives considered',
      },
      {
        id: 'sd-scaling',
        title: 'Scalability & Load Balancing',
        content: 'Vertical Scaling (Scale Up): Add more resources to single machine (CPU, RAM). Simple but has limits and creates single point of failure.\n\nHorizontal Scaling (Scale Out): Add more machines. More complex but practically unlimited and provides redundancy.\n\nLoad Balancing Algorithms:\n• Round Robin - Simple, equal distribution\n• Weighted Round Robin - More traffic to stronger servers\n• Least Connections - Route to least busy server\n• IP Hash - Same client always hits same server (session persistence)\n• Consistent Hashing - Minimize remapping when servers change\n\nLoad Balancer Types:\n• L4 (Transport) - Routes based on IP/port, very fast\n• L7 (Application) - Routes based on content (URL, headers), more flexible\n\nFor high availability: Use multiple load balancers with failover.',
      },
      {
        id: 'sd-caching',
        title: 'Caching Strategies',
        content: 'Caching dramatically improves read performance by storing frequently accessed data in fast storage (memory).\n\nCache Placement:\n• Client-side (browser cache)\n• CDN (static content near users)\n• Application-level (Redis, Memcached)\n• Database query cache\n\nCaching Patterns:\n• Cache-Aside (Lazy Loading): App checks cache first, loads from DB on miss, stores in cache\n• Write-Through: Write to cache and DB simultaneously\n• Write-Behind: Write to cache, async write to DB\n• Read-Through: Cache handles DB reads\n\nEviction Policies:\n• LRU (Least Recently Used) - Most common, works well\n• LFU (Least Frequently Used) - For stable popularity\n• FIFO - Simple but naive\n• TTL-based - Expire after time\n\nCache Invalidation: Hardest part of caching! Options: TTL, event-driven invalidation, versioning.',
      },
      {
        id: 'sd-database',
        title: 'Database Design & Storage',
        content: 'SQL (Relational):\n• ACID guarantees (Atomicity, Consistency, Isolation, Durability)\n• Structured schema, JOINs, complex queries\n• Vertical scaling primarily\n• Use for: transactions, complex relationships\n• Examples: PostgreSQL, MySQL\n\nNoSQL:\n• Flexible schema, horizontal scaling\n• BASE (Basically Available, Soft state, Eventually consistent)\n• Types: Document (MongoDB), Key-Value (Redis), Wide-column (Cassandra), Graph (Neo4j)\n• Use for: high scale, flexible data, specific access patterns\n\nSharding (Horizontal Partitioning):\n• Split data across multiple databases\n• Shard key determines distribution (user_id, geographic region)\n• Challenges: cross-shard queries, hotspots, rebalancing\n\nReplication:\n• Master-Slave: Master handles writes, slaves handle reads (read scaling)\n• Master-Master: Both handle reads/writes (write scaling, more complex)\n• Synchronous vs Async replication (consistency vs performance)',
      },
      {
        id: 'sd-patterns',
        title: 'Common Patterns & Components',
        content: 'Message Queues (Kafka, RabbitMQ, SQS):\n• Decouple services, async processing, handle traffic spikes\n• Producer → Queue → Consumer pattern\n• Enables retry logic, multiple consumers\n\nMicroservices vs Monolith:\n• Monolith: Single deployable unit, simpler, good for small teams\n• Microservices: Independent services, complex but scalable, team autonomy\n\nAPI Gateway:\n• Single entry point for all clients\n• Handles auth, rate limiting, routing, SSL termination\n\nCDN (Content Delivery Network):\n• Caches static content at edge locations\n• Reduces latency for geographically distributed users\n\nService Discovery:\n• How services find each other in dynamic environments\n• Client-side vs Server-side discovery\n\nCircuit Breaker:\n• Prevents cascading failures\n• Open (fail fast) → Half-open (test) → Closed (normal)',
      }
    ],
    flashcards: [
      { id: 'sd-1', front: 'CAP Theorem\n\nWhat are the three guarantees in distributed systems and why can you only achieve two at once?', back: 'Distributed systems can guarantee only 2 of 3:\n• Consistency - All nodes see same data\n• Availability - Every request gets response\n• Partition tolerance - Works despite network splits\n\nP is mandatory in distributed systems, so choose:\n• CP (Consistency): Banking, inventory (accept downtime)\n• AP (Availability): Social media, caching (accept stale data)' },
      { id: 'sd-2', front: 'Horizontal vs Vertical Scaling\n\nWhat are the two approaches to scaling systems and when should you use each?', back: 'Vertical (Scale Up): Add resources to one machine. Simple but limited (can\'t exceed hardware limits), single point of failure.\n\nHorizontal (Scale Out): Add more machines. Complex (need load balancing, distributed data) but practically unlimited, provides redundancy.\n\nRule: Scale up until you can\'t, then scale out.' },
      { id: 'sd-3', front: 'Load Balancer Types & Algorithms\n\nHow do different load balancers distribute traffic across servers?', back: 'Types:\n• L4: Routes by IP/port (fast, no content inspection)\n• L7: Routes by content (URLs, headers, cookies)\n\nAlgorithms:\n• Round Robin: Equal distribution\n• Weighted RR: More to stronger servers\n• Least Connections: To least busy\n• IP Hash: Client affinity\n• Consistent Hashing: Minimal remapping' },
      { id: 'sd-4', front: 'Database Sharding\n\nHow do you split data across multiple databases and what are the tradeoffs?', back: 'Horizontal partitioning across multiple databases.\n\nShard key selection critical:\n• User ID: Even distribution, but user data spread\n• Geographic: Good for localized data\n• Hash-based: Even distribution, random lookups\n\nChallenges:\n• Cross-shard queries (expensive)\n• Hotspots (uneven load)\n• Rebalancing when adding shards\n• No cross-shard transactions' },
      { id: 'sd-5', front: 'Caching Patterns\n\nWhat are the different strategies for reading and writing data with a cache?', back: 'Cache-Aside: App checks cache, reads DB on miss, populates cache. Most common.\n\nWrite-Through: Write to cache + DB together. Consistent but slower writes.\n\nWrite-Behind: Write to cache, async DB write. Fast writes, risk of data loss.\n\nRead-Through: Cache handles DB reads transparently.\n\nEviction: LRU (most common), LFU, TTL' },
      { id: 'sd-6', front: 'SQL vs NoSQL\n\nWhat are the key differences between relational and NoSQL databases?', back: 'SQL: ACID, strict schema, JOINs, complex queries. Vertical scaling. PostgreSQL, MySQL.\n\nNoSQL: BASE, flexible schema, horizontal scaling.\n• Document: MongoDB (JSON-like docs)\n• Key-Value: Redis (simple, fast)\n• Wide-column: Cassandra (time-series)\n• Graph: Neo4j (relationships)\n\nChoose SQL for transactions, NoSQL for scale/flexibility.' },
      { id: 'sd-7', front: 'Consistent Hashing\n\nHow does consistent hashing improve distributed system scalability?', back: 'Distributes keys across nodes using a hash ring.\n\nBenefits:\n• Only K/N keys remapped when node changes (vs all keys in modulo hashing)\n• Smooth scaling up/down\n\nVirtual nodes: Each physical node maps to multiple ring positions for even distribution.\n\nUsed in: Cassandra, DynamoDB, distributed caches.' },
      { id: 'sd-8', front: 'Rate Limiting Algorithms\n\nWhat are the different approaches to limiting request rates in APIs?', back: 'Token Bucket: Tokens added at fixed rate, request consumes token. Allows bursts.\n\nLeaky Bucket: Fixed output rate, queue incoming. Smooths traffic.\n\nFixed Window: Count requests per time window. Simple but edge case (2× at boundary).\n\nSliding Window Log: Store timestamps, count in window. Accurate but memory heavy.\n\nSliding Window Counter: Weighted average of current + previous window.' },
      { id: 'sd-9', front: 'Message Queue Benefits\n\nWhy use message queues for async communication between services?', back: '• Decoupling: Producer/consumer independent\n• Async Processing: Don\'t wait for slow operations\n• Load Leveling: Smooth traffic spikes\n• Fault Tolerance: Retry failed jobs\n• Multiple Consumers: Fan-out processing\n\nExamples: Kafka (high throughput, persistent), RabbitMQ (flexible routing), SQS (managed AWS).' },
      { id: 'sd-10', front: 'Database Replication\n\nHow do you replicate data across databases for high availability and read scaling?', back: 'Master-Slave:\n• Master: handles writes\n• Slaves: handle reads (read scaling)\n• Async replication (lag risk)\n\nMaster-Master:\n• Both handle reads + writes\n• Conflict resolution needed\n• Good for multi-region\n\nSync vs Async:\n• Sync: Consistent but slow\n• Async: Fast but stale reads possible' },
      { id: 'sd-11', front: 'ACID vs BASE\n\nWhat are the consistency guarantees in SQL vs NoSQL databases?', back: 'ACID (SQL):\n• Atomic: All or nothing\n• Consistent: Valid state to valid state\n• Isolated: Concurrent transactions don\'t interfere\n• Durable: Committed = permanent\n\nBASE (NoSQL):\n• Basically Available: May return stale data\n• Soft state: State may change over time\n• Eventually consistent: Will converge' },
      { id: 'sd-12', front: 'CDN (Content Delivery Network)\n\nHow do CDNs improve content delivery and reduce latency globally?', back: 'Caches static content at edge servers worldwide.\n\nBenefits:\n• Reduced latency (physically closer)\n• Less origin server load\n• DDoS protection\n• SSL termination\n\nTypes:\n• Push CDN: Upload content proactively\n• Pull CDN: Cache on first request\n\nExamples: CloudFront, Cloudflare, Akamai' },
      { id: 'sd-13', front: 'Microservices vs Monolith\n\nWhat are the tradeoffs between monolithic and microservices architectures?', back: 'Monolith:\n• Single deployable unit\n• Simpler development/deployment\n• Can become unwieldy at scale\n\nMicroservices:\n• Independent services, own DB\n• Team autonomy, tech flexibility\n• Complex: networking, debugging, transactions\n\nStart monolith, extract services when needed. Don\'t premature microservice!' },
      { id: 'sd-14', front: 'Back-of-Envelope Estimation\n\nWhat are the essential numbers for estimating system capacity in interviews?', back: 'Key numbers to know:\n• 1 day = 86,400 seconds ≈ 100K\n• 1 month ≈ 2.5M seconds\n• 1 million requests/day ≈ 12 req/sec\n• Read latency: Memory ~100ns, SSD ~100μs, HDD ~10ms, Network ~1-100ms\n\nStorage: Text ~1KB, Image ~200KB, Video ~1-10MB/min\n\n1M users × 1KB/user = 1GB' },
      { id: 'sd-15', front: 'Circuit Breaker Pattern\n\nHow do you prevent cascading failures when a service becomes unavailable?', back: 'Prevents cascading failures in distributed systems.\n\nStates:\n• Closed: Normal operation, count failures\n• Open: Failures exceeded threshold, fail fast\n• Half-Open: Allow test request, close if success\n\nBenefits:\n• Fail fast vs waiting for timeout\n• Give failing service time to recover\n• Prevent resource exhaustion' },
      { id: 'sd-16', front: 'API Gateway\n\nWhat role does an API Gateway play in microservices architecture?', back: 'Single entry point for clients.\n\nResponsibilities:\n• Authentication/Authorization\n• Rate limiting\n• Request routing\n• SSL termination\n• Response caching\n• Request/response transformation\n\nExamples: Kong, AWS API Gateway, Nginx.' },
      { id: 'sd-17', front: 'Service Discovery\n\nHow do microservices locate and communicate with each other dynamically?', back: 'How services find each other dynamically.\n\nClient-side: Client queries registry, chooses instance.\nServer-side: Load balancer queries registry, routes.\n\nRegistry: Consul, etcd, ZooKeeper, AWS Cloud Map.' },
      { id: 'sd-18', front: 'Event-Driven Architecture\n\nHow do systems communicate through events instead of direct calls?', back: 'Services communicate via events, not direct calls.\n\n• Event Sourcing: Store events, not state\n• CQRS: Separate read/write models\n• Saga Pattern: Distributed transactions via events\n\nLoose coupling, eventual consistency.' },
      { id: 'sd-19', front: 'Bloom Filter\n\nWhat is a space-efficient way to test set membership with acceptable false positives?', back: 'Probabilistic data structure for membership testing.\n\n• "Maybe in set" or "Definitely not in set"\n• False positives possible, no false negatives\n• Very space efficient\n\nUse: Caches, spell checkers, distributed systems.' },
      { id: 'sd-20', front: 'URL Shortener Design\n\nHow would you design a service like bit.ly to shorten URLs?', back: 'Components: URL generation, storage, redirect.\n\nID generation: Counter, hash, pre-generated.\nBase62 encoding for short URLs.\n\nScale: Cache popular URLs, partition by hash.' },
      { id: 'sd-21', front: 'Twitter Feed Design\n\nHow do you deliver millions of tweets to followers in real-time?', back: 'Fan-out approaches:\n• On write: Push to follower feeds (fast reads, slow writes)\n• On read: Pull from followees (slow reads, fast writes)\n• Hybrid: Push for regular users, pull for celebrities.' },
      { id: 'sd-22', front: 'Chat System Design\n\nWhat are the key components for building a scalable messaging system?', back: 'WebSockets for real-time.\nMessage broker for delivery.\n\nOffline: Store messages, deliver on reconnect.\nGroup chats: Fan-out to members.\n\nScale: Partition by user/room.' },
      { id: 'sd-23', front: 'Distributed ID Generation\n\nHow do you generate unique IDs across distributed systems without coordination?', back: 'Requirements: Unique, sortable, scalable.\n\n• UUID: Simple but not sortable, 128-bit\n• Twitter Snowflake: Timestamp + machine + sequence\n• Database tickets: Multiple servers, different ranges\n\nSnowflake most common.' },
      { id: 'sd-24', front: 'Search Autocomplete Design\n\nHow do you implement instant search suggestions as users type?', back: 'Trie data structure for prefix matching.\n\nOptimizations:\n• Store frequency at nodes\n• Limit depth\n• Cache popular prefixes\n\nScale: Partition by prefix range.' },
      { id: 'sd-25', front: 'Notification System Design\n\nHow do you build a system to send notifications across multiple channels?', back: 'Types: Push, SMS, Email, In-app.\n\nComponents: Message queue, device registry, delivery services.\n\nChallenges: Rate limiting, user preferences, retries, analytics.' },
      { id: 'sd-26', front: 'File Storage (Dropbox) Design\n\nHow do you design a cloud file storage and synchronization service?', back: 'Chunking: Split files into blocks, deduplicate.\n\nMetadata: Files, versions, sharing permissions.\n\nSync: Track changes, merge conflicts.\n\nStorage: Object store (S3), replicated.' },
      { id: 'sd-27', front: 'Video Streaming Design\n\nHow do you build a service like YouTube or Netflix for streaming videos?', back: 'Transcoding: Multiple resolutions/formats.\nCDN: Edge caching for delivery.\n\nAdaptive bitrate: Client adjusts based on bandwidth.\n\nChunked delivery: Small segments for seeking.' },
      { id: 'sd-28', front: 'Payment System Design\n\nHow do you build a secure and reliable payment processing system?', back: 'Idempotency keys: Prevent duplicate charges.\n\nTwo-phase: Hold → Capture.\n\nLedger: Immutable transaction log.\n\nReconciliation: Match with payment providers.' },
      { id: 'sd-29', front: 'Geolocation Service Design\n\nHow do you implement nearby search for location-based applications?', back: 'Geohashing: Encode lat/long into string.\n\nNearby search: Common prefix = nearby.\n\nQuadtree: Hierarchical spatial partitioning.\n\nUse: Uber, Yelp, delivery apps.' },
      { id: 'sd-30', front: 'Metrics/Monitoring System\n\nHow do you collect, store, and visualize system metrics at scale?', back: 'Time-series data: Timestamp + value.\n\nAggregation: Roll up old data.\n\nStorage: Time-series DB (InfluxDB, Prometheus).\n\nAlerting: Threshold-based, anomaly detection.' }
    ],
    quizQuestions: [
      {
        id: 'sd-q1',
        question: 'According to CAP theorem, what can\'t be guaranteed during a network partition?',
        options: ['Either Consistency or Availability', 'Both Consistency and Availability', 'Only Partition Tolerance', 'None of them'],
        correctAnswer: 0,
        explanation: 'During a network partition, you must choose: Consistency (refuse requests to ensure all nodes agree) or Availability (respond with potentially stale data). You can\'t have both. Partition tolerance is mandatory in distributed systems.'
      },
      {
        id: 'sd-q2',
        question: 'Which caching strategy is best for read-heavy workloads with infrequent updates?',
        options: ['Write-through', 'Write-behind', 'Cache-aside', 'Write-around'],
        correctAnswer: 2,
        explanation: 'Cache-aside (lazy loading) is ideal for read-heavy workloads. Data is loaded into cache only when requested, avoiding caching rarely-accessed data. Write-through adds latency to all writes, which isn\'t worth it for infrequent updates.'
      },
      {
        id: 'sd-q3',
        question: 'What is the main benefit of database sharding over replication?',
        options: ['Better read performance', 'Horizontal write scalability', 'Simpler queries', 'Lower cost'],
        correctAnswer: 1,
        explanation: 'Sharding distributes data across multiple databases, allowing writes to scale horizontally. Replication copies the same data and helps with read scaling, but all writes still go to the master.'
      },
      {
        id: 'sd-q4',
        question: 'When would you choose a CP system over an AP system?',
        options: ['Social media feeds', 'Banking transactions', 'Shopping cart', 'User sessions'],
        correctAnswer: 1,
        explanation: 'Banking transactions require strong consistency - you can\'t have two ATMs showing different balances. It\'s acceptable to be temporarily unavailable rather than risk incorrect data. Social feeds, carts, and sessions can tolerate eventual consistency.'
      },
      {
        id: 'sd-q5',
        question: 'What problem does consistent hashing solve?',
        options: ['Encryption of data', 'Minimizing key redistribution when nodes change', 'Sorting distributed data', 'Compressing network traffic'],
        correctAnswer: 1,
        explanation: 'With modulo hashing, adding/removing a node remaps almost all keys. Consistent hashing uses a ring structure where only K/N keys need to move when a node changes, making scaling much smoother.'
      },
      {
        id: 'sd-q6',
        question: 'Which rate limiting algorithm allows traffic bursts while maintaining average rate?',
        options: ['Leaky Bucket', 'Token Bucket', 'Fixed Window', 'Sliding Window Counter'],
        correctAnswer: 1,
        explanation: 'Token Bucket allows bursts - if you haven\'t used your quota recently, tokens accumulate. You can use them in a burst. Leaky Bucket enforces a constant output rate, smoothing traffic but preventing bursts.'
      },
      {
        id: 'sd-q7',
        question: 'In a Master-Slave database replication setup, what happens during a slave read immediately after a master write?',
        options: ['Read returns latest data', 'Read may return stale data', 'Read fails', 'Write is replicated first'],
        correctAnswer: 1,
        explanation: 'With async replication (common for performance), there\'s replication lag. A read from a slave immediately after a master write may return stale data. This is eventual consistency - the slave will catch up, but not instantly.'
      },
      {
        id: 'sd-q8',
        question: 'What is the purpose of an API Gateway?',
        options: ['Store data in memory', 'Single entry point handling auth, routing, rate limiting', 'Distribute traffic across servers', 'Cache database queries'],
        correctAnswer: 1,
        explanation: 'API Gateway is a single entry point for all clients. It handles cross-cutting concerns: authentication, authorization, rate limiting, request routing, SSL termination, and protocol translation. It\'s different from a load balancer, which just distributes traffic.'
      },
      {
        id: 'sd-q9',
        question: 'In designing a URL shortener, why is a NoSQL database often preferred for the URL mappings?',
        options: ['Better security', 'Simple key-value access pattern, horizontal scaling', 'NoSQL is always faster', 'Required for short URLs'],
        correctAnswer: 1,
        explanation: 'URL shortener is a simple key-value lookup (short code → long URL). No complex queries or JOINs needed. NoSQL databases like Redis or DynamoDB excel at this pattern and scale horizontally with ease.'
      },
      {
        id: 'sd-q10',
        question: 'For a news feed system like Twitter, what technique delivers new posts to followers\' feeds?',
        options: ['Pull model only', 'Push model (fan-out on write)', 'Push for normal users, pull for celebrities', 'Real-time only'],
        correctAnswer: 2,
        explanation: 'Hybrid approach: Push (fan-out on write) for normal users - write to all followers\' feeds immediately. Pull for celebrities with millions of followers - merging at read time is more efficient than writing to millions of feeds.'
      },
      {
        id: 'sd-q11',
        question: 'What is the purpose of a write-ahead log (WAL) in databases?',
        options: ['Speed up reads', 'Ensure durability - recover from crashes', 'Compress data', 'Enable sharding'],
        correctAnswer: 1,
        explanation: 'WAL writes changes to a log file before applying them to the main database. If system crashes, the log can replay uncommitted changes, ensuring durability (the D in ACID). Used by PostgreSQL, MySQL, and many others.'
      },
      {
        id: 'sd-q12',
        question: 'For a real-time chat application, which protocol is most appropriate?',
        options: ['HTTP polling', 'WebSockets', 'REST API', 'FTP'],
        correctAnswer: 1,
        explanation: 'WebSockets provide full-duplex, persistent connections - perfect for real-time chat where messages need instant delivery both ways. HTTP polling wastes bandwidth and has latency. Server-Sent Events (SSE) could work for one-way updates.'
      },
      {
        id: 'sd-q13',
        question: 'What is database sharding?',
        options: ['Backup strategy', 'Splitting data across multiple databases by a shard key', 'Encrypting data', 'Compressing tables'],
        correctAnswer: 1,
        explanation: 'Sharding partitions data across multiple databases. Each shard holds a subset of data (e.g., users A-M, N-Z). Allows horizontal scaling but adds complexity: cross-shard queries, rebalancing, maintaining consistency.'
      },
      {
        id: 'sd-q14',
        question: 'What is the CAP theorem?',
        options: ['Coding standard', 'Distributed system can only guarantee 2 of: Consistency, Availability, Partition tolerance', 'Caching protocol', 'API guideline'],
        correctAnswer: 1,
        explanation: 'During network partition, must choose: CP (consistent but some unavailable) or AP (available but possibly stale data). CA is only possible without partitions. Most systems choose eventual consistency (AP) for better availability.'
      },
      {
        id: 'sd-q15',
        question: 'What is a message queue used for?',
        options: ['Direct communication', 'Async communication, decoupling services, handling traffic spikes', 'Database queries', 'User authentication'],
        correctAnswer: 1,
        explanation: 'Message queues (Kafka, RabbitMQ, SQS) decouple producers and consumers. Enable async processing, handle traffic spikes (buffer), and allow independent scaling. Essential for microservices.'
      },
      {
        id: 'sd-q16',
        question: 'For URL shortening service, what\'s a key design consideration?',
        options: ['Color scheme', 'Short code generation: sequential vs random, collision handling, encoding', 'Font selection', 'Button placement'],
        correctAnswer: 1,
        explanation: 'Must generate unique short codes. Options: sequential IDs (predictable), random (check collisions), hash (deterministic). Base62 encoding gives compact codes. Handle: custom URLs, analytics, expiration.'
      },
      {
        id: 'sd-q17',
        question: 'What is rate limiting and why is it important?',
        options: ['Speed optimization', 'Limiting requests per user/IP to prevent abuse and ensure fair usage', 'Database tuning', 'Memory management'],
        correctAnswer: 1,
        explanation: 'Rate limiting prevents abuse (DoS attacks), ensures fair resource distribution, and protects backend services. Implement with token bucket or sliding window algorithms. Return 429 Too Many Requests when exceeded.'
      },
      {
        id: 'sd-q18',
        question: 'In microservices, what is service discovery?',
        options: ['Finding bugs', 'Mechanism for services to find and communicate with each other dynamically', 'Code review', 'Testing framework'],
        correctAnswer: 1,
        explanation: 'In dynamic environments (containers, auto-scaling), service locations change. Service discovery (Consul, etcd, Kubernetes DNS) maintains registry of healthy instances. Services query to find others.'
      },
      {
        id: 'sd-q19',
        question: 'What is a CDN and when would you use it?',
        options: ['Database type', 'Content Delivery Network - caches content at edge locations globally for faster delivery', 'Code repository', 'CPU optimizer'],
        correctAnswer: 1,
        explanation: 'CDNs cache static content (images, videos, JS/CSS) at servers worldwide. Users fetch from nearest edge, reducing latency and origin server load. Essential for global applications and media-heavy sites.'
      },
      {
        id: 'sd-q20',
        question: 'What is eventual consistency vs strong consistency?',
        options: ['Same thing', 'Eventual: updates propagate over time; Strong: all reads see latest write immediately', 'Eventual is always better', 'Strong is always faster'],
        correctAnswer: 1,
        explanation: 'Strong: every read returns most recent write (expensive, requires coordination). Eventual: updates propagate asynchronously, temporary inconsistency okay (better performance/availability). Choose based on use case.'
      }
    ]
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    slug: 'web-dev',
    description: 'Frontend and backend web development concepts and best practices.',
    icon: 'Globe',
    color: '#E17055',
    premium: true,
    colorDark: '#C96248',
    learnContent: [
      {
        id: 'wd-intro',
        title: 'Web Development Fundamentals',
        content: 'Modern web development encompasses:\n\nFrontend: What users see and interact with\n• HTML - Structure\n• CSS - Styling\n• JavaScript - Interactivity\n• Frameworks: React, Vue, Angular\n\nBackend: Server-side logic and data\n• Runtime: Node.js, Python, Go, Java\n• Frameworks: Express, Django, Spring\n• APIs: REST, GraphQL\n• Databases: SQL (PostgreSQL), NoSQL (MongoDB)\n\nKey concepts for interviews:\n• How browsers render pages (critical rendering path)\n• HTTP protocol (request/response, methods, headers)\n• Client-server architecture\n• State management (client vs server state)',
      },
      {
        id: 'wd-react',
        title: 'React & Virtual DOM',
        content: 'React\'s core innovation: Virtual DOM\n\n1. Component renders → creates Virtual DOM tree (JS objects)\n2. State changes → new Virtual DOM created\n3. Diffing: React compares old vs new Virtual DOM\n4. Reconciliation: Only changed nodes updated in real DOM\n\nKey React Concepts:\n• Components: Functional (modern) vs Class (legacy)\n• Props: Data passed down (immutable)\n• State: Component\'s internal data (useState)\n• Hooks: useEffect (side effects), useContext, useMemo, useCallback\n• Keys: Help React identify which items changed in lists\n\nComponent Lifecycle (useEffect):\n• Mount: useEffect(() => {}, [])\n• Update: useEffect(() => {}, [dep])\n• Unmount: return cleanup function',
        codeExample: '// useEffect lifecycle\nuseEffect(() => {\n  // Runs on mount and when deps change\n  const subscription = api.subscribe();\n  \n  return () => {\n    // Cleanup: runs before re-run and on unmount\n    subscription.unsubscribe();\n  };\n}, [dependency]); // Empty array = mount only\n\n// Memoization\nconst memoizedValue = useMemo(() => expensive(a, b), [a, b]);\nconst memoizedCallback = useCallback(() => doSomething(a), [a]);'
      },
      {
        id: 'wd-state',
        title: 'State Management',
        content: 'Managing state is one of frontend\'s hardest problems.\n\nLocal State (useState):\n• Owned by single component\n• Simple, prefer when possible\n\nLifted State:\n• Move state to common ancestor\n• Pass down via props\n\nContext (useContext):\n• Avoid prop drilling\n• Good for: theme, auth, locale\n• Not for frequent updates (re-renders entire tree)\n\nGlobal State Libraries:\n• Redux: Predictable, verbose, great devtools\n• Zustand: Minimal, hooks-based\n• Recoil/Jotai: Atomic state\n• React Query/TanStack: Server state management\n\nServer State vs Client State:\n• Server state: Data from API (users, posts)\n• Client state: UI state (modals, forms)\n• Don\'t mix them! Use React Query for server state.',
      },
      {
        id: 'wd-api',
        title: 'APIs: REST & GraphQL',
        content: 'REST (Representational State Transfer):\n• Resources identified by URLs: /users/123\n• HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE\n• Stateless: Each request contains all info needed\n• Multiple endpoints, fixed responses\n\nGraphQL:\n• Single endpoint, client specifies exact data\n• Query language for APIs\n• Solves over-fetching and under-fetching\n• Schema defines types and relationships\n\nWhen to use:\n• REST: Simple CRUD, caching important, team familiarity\n• GraphQL: Complex data relationships, mobile (bandwidth), rapid iteration\n\nHTTP Methods:\n• GET: Read (idempotent, cacheable)\n• POST: Create (not idempotent)\n• PUT: Replace entire resource\n• PATCH: Partial update\n• DELETE: Remove resource',
        codeExample: '// REST\nGET /api/users/123\nPOST /api/users { "name": "John" }\nPUT /api/users/123 { "name": "Jane" }\nDELETE /api/users/123\n\n// GraphQL\nquery {\n  user(id: "123") {\n    name\n    posts {\n      title\n    }\n  }\n}\n\nmutation {\n  createUser(input: { name: "John" }) {\n    id\n    name\n  }\n}'
      },
      {
        id: 'wd-security',
        title: 'Web Security Essentials',
        content: 'XSS (Cross-Site Scripting):\n• Attacker injects malicious scripts\n• Prevention: Sanitize input, escape output, CSP headers, HttpOnly cookies\n• React auto-escapes by default (but not dangerouslySetInnerHTML!)\n\nCSRF (Cross-Site Request Forgery):\n• Tricks user into making unwanted request\n• Prevention: CSRF tokens, SameSite cookies, check Origin header\n\nCORS (Cross-Origin Resource Sharing):\n• Browser blocks cross-origin requests by default\n• Server must set Access-Control-Allow-Origin header\n• Preflight OPTIONS request for complex requests\n\nAuthentication:\n• Session-based: Server stores session, cookie holds session ID\n• Token-based (JWT): Stateless, token contains user info + signature\n• OAuth: Delegate auth to third party (Google, GitHub)\n\nJWT Structure: header.payload.signature\n• Header: Algorithm, type\n• Payload: Claims (user data, expiry)\n• Signature: Verify token wasn\'t tampered',
      },
      {
        id: 'wd-perf',
        title: 'Web Performance Optimization',
        content: 'Core Web Vitals (Google ranking factors):\n• LCP (Largest Contentful Paint): < 2.5s\n• FID (First Input Delay): < 100ms\n• CLS (Cumulative Layout Shift): < 0.1\n\nOptimization Strategies:\n\n1. Reduce Bundle Size:\n• Code splitting (lazy load routes)\n• Tree shaking (remove unused code)\n• Minification, compression (gzip/brotli)\n\n2. Optimize Images:\n• Modern formats (WebP, AVIF)\n• Responsive images (srcset)\n• Lazy loading\n\n3. Caching:\n• Browser cache (Cache-Control headers)\n• Service workers (offline support)\n• CDN for static assets\n\n4. Reduce Render Blocking:\n• Defer non-critical JS/CSS\n• Inline critical CSS\n• Preload important resources\n\n5. React Specific:\n• Memoization (useMemo, useCallback, React.memo)\n• Virtualization for long lists\n• Avoid unnecessary re-renders',
      }
    ],
    flashcards: [
      { id: 'wd-1', front: 'Virtual DOM & Reconciliation\n\nHow does React efficiently update the UI without rerendering everything?', back: 'Virtual DOM: Lightweight JS representation of real DOM.\n\nProcess:\n1. State change → new Virtual DOM tree\n2. Diffing: Compare old vs new\n3. Reconciliation: Batch update only changed real DOM nodes\n\nWhy: Real DOM operations are slow. Batching minimizes them.' },
      { id: 'wd-2', front: 'REST vs GraphQL\n\nWhat are the tradeoffs between REST and GraphQL APIs?', back: 'REST:\n• Multiple endpoints (/users, /posts)\n• Fixed response structure\n• HTTP caching built-in\n• Over-fetching/under-fetching issues\n\nGraphQL:\n• Single endpoint, query specifies data\n• Fetch exactly what you need\n• Strong typing, introspection\n• More complex caching' },
      { id: 'wd-3', front: 'JWT (JSON Web Token)\n\nHow do JWTs enable stateless authentication in web applications?', back: 'Structure: header.payload.signature (base64 encoded)\n\n• Header: Algorithm, token type\n• Payload: Claims (user ID, expiry, roles)\n• Signature: HMAC or RSA signed\n\nStateless auth: Server validates signature without DB lookup.\nStore: HttpOnly cookie (XSS safe) or localStorage (convenient).' },
      { id: 'wd-4', front: 'CORS\n\nWhat browser security mechanism restricts cross-origin requests?', back: 'Cross-Origin Resource Sharing - browser security policy.\n\nSame-origin: Same protocol + domain + port\nCross-origin requests blocked unless server allows via headers:\n• Access-Control-Allow-Origin\n• Access-Control-Allow-Methods\n• Access-Control-Allow-Headers\n\nPreflight (OPTIONS) for "complex" requests.' },
      { id: 'wd-5', front: 'XSS Prevention\n\nHow do you protect your web app from script injection attacks?', back: 'Cross-Site Scripting: Attacker injects malicious scripts.\n\nTypes:\n• Stored: Script saved in DB, served to users\n• Reflected: Script in URL, reflected back\n• DOM-based: Script manipulates DOM directly\n\nPrevention:\n• Sanitize/escape user input\n• Content Security Policy headers\n• HttpOnly cookies (JS can\'t access)\n• React escapes by default' },
      { id: 'wd-6', front: 'CSRF Prevention\n\nHow do you prevent unauthorized actions using a user\'s authenticated session?', back: 'Cross-Site Request Forgery: Tricks authenticated user into unwanted action.\n\nAttack: User visits evil site, which sends request to bank.com using user\'s cookies.\n\nPrevention:\n• CSRF tokens (server validates)\n• SameSite cookie attribute\n• Check Origin/Referer headers\n• Don\'t use GET for state changes' },
      { id: 'wd-7', front: 'CSS Flexbox vs Grid\n\nWhen should you use Flexbox vs CSS Grid for layouts?', back: 'Flexbox (1D):\n• Single axis (row OR column)\n• Content-based sizing\n• Good for: navbars, card layouts, centering\n\nGrid (2D):\n• Rows AND columns simultaneously\n• Layout-based sizing\n• Good for: page layouts, dashboards\n\nUse together: Grid for page layout, Flexbox for components.' },
      { id: 'wd-8', front: 'React useEffect\n\nHow do you handle side effects in React functional components?', back: 'Side effects in functional components.\n\nuseEffect(() => {\n  // Effect runs after render\n  return () => { /* cleanup */ };\n}, [deps]);\n\n• [] empty: Mount only\n• [dep]: Run when dep changes\n• No array: Every render (usually wrong)\n• Cleanup: Before re-run and unmount\n\nCommon uses: API calls, subscriptions, timers' },
      { id: 'wd-9', front: 'HTTP Status Codes\n\nWhat do different HTTP status code ranges indicate?', back: '2xx Success:\n• 200 OK, 201 Created, 204 No Content\n\n3xx Redirect:\n• 301 Permanent, 302 Temporary, 304 Not Modified\n\n4xx Client Error:\n• 400 Bad Request, 401 Unauthorized\n• 403 Forbidden, 404 Not Found, 429 Rate Limited\n\n5xx Server Error:\n• 500 Internal, 502 Bad Gateway, 503 Unavailable' },
      { id: 'wd-10', front: 'Webpack/Bundlers\n\nWhat do module bundlers do to prepare JavaScript for production?', back: 'Transform and bundle modules for browser.\n\nFeatures:\n• Bundle: Combine files into fewer files\n• Transpile: ES6+ → ES5 (Babel)\n• Minify: Remove whitespace, shorten names\n• Tree shaking: Remove unused exports\n• Code splitting: Load chunks on demand\n• HMR: Hot Module Replacement for dev\n\nAlternatives: Vite (faster), esbuild, Rollup' },
      { id: 'wd-11', front: 'React State Management\n\nWhat are the different approaches to managing state in React applications?', back: 'Local: useState (single component)\n\nLifted: Move to common ancestor, pass via props\n\nContext: useContext (avoid prop drilling, not for frequent updates)\n\nGlobal libraries:\n• Redux: Predictable, single store, verbose\n• Zustand: Minimal, hooks-based\n• React Query: Server state (caching, sync)\n\nRule: Start local, lift/globalize only when needed.' },
      { id: 'wd-12', front: 'Event Loop & Async JS\n\nHow does JavaScript handle asynchronous operations with a single thread?', back: 'JavaScript is single-threaded but non-blocking.\n\nCall Stack: Synchronous code execution\nTask Queue: setTimeout, setInterval callbacks\nMicrotask Queue: Promises, async/await (higher priority)\n\nOrder:\n1. Execute sync code\n2. Clear microtask queue\n3. One task from task queue\n4. Repeat\n\nasync/await: Syntactic sugar over Promises' },
      { id: 'wd-13', front: 'Core Web Vitals\n\nWhat metrics does Google use to measure web performance and user experience?', back: 'Google ranking factors:\n\n• LCP (Largest Contentful Paint): < 2.5s\n  Main content visible\n\n• FID (First Input Delay): < 100ms\n  Time to interactive\n\n• CLS (Cumulative Layout Shift): < 0.1\n  Visual stability (no jumping content)\n\nImprove: Optimize images, lazy load, minimize JS, reserve space for dynamic content.' },
      { id: 'wd-14', front: 'useMemo vs useCallback\n\nWhat is the difference between these React hooks for optimization?', back: 'Both: Memoization to prevent expensive recalculations.\n\nuseMemo: Memoize computed VALUE\nconst sorted = useMemo(() => sort(items), [items]);\n\nuseCallback: Memoize FUNCTION reference\nconst handler = useCallback(() => onClick(id), [id]);\n\nUse useCallback when passing callbacks to optimized children (React.memo).\n\nDon\'t overuse - memoization has overhead too!' },
      { id: 'wd-15', front: 'SSR vs CSR vs SSG\n\nWhat are the different rendering strategies for web applications?', back: 'CSR (Client-Side Rendering):\n• JS builds page in browser\n• Slower initial load, faster navigation\n• Poor SEO\n\nSSR (Server-Side Rendering):\n• Server renders HTML per request\n• Fast initial load, good SEO\n• Higher server load\n\nSSG (Static Site Generation):\n• HTML built at build time\n• Fastest, cacheable\n• Only for static content\n\nNext.js: Can mix all three!' },
      { id: 'wd-16', front: 'React Server Components\n\nHow do React Server Components reduce JavaScript bundle size?', back: 'Render on server, send HTML to client. Zero JS shipped.\n\nBenefits: Smaller bundles, direct DB access, faster initial load.\n\nUse for: Static content, data fetching. Client components for interactivity.' },
      { id: 'wd-17', front: 'TypeScript Benefits\n\nWhy use TypeScript instead of plain JavaScript?', back: '• Catch errors at compile time\n• Better IDE support (autocomplete, refactoring)\n• Self-documenting code\n• Easier large-scale refactoring\n\nTypes: string, number, boolean, array, object, any, unknown, never, void.' },
      { id: 'wd-18', front: 'CSS-in-JS vs Tailwind\n\nWhat are the tradeoffs between CSS-in-JS and utility-first CSS?', back: 'CSS-in-JS (styled-components, Emotion):\n• Scoped styles, dynamic styling\n• Runtime overhead, larger bundle\n\nTailwind:\n• Utility classes, fast development\n• No runtime, smaller bundles\n• Learning curve for class names\n\nBoth: Solve CSS maintainability at scale.' },
      { id: 'wd-19', front: 'Web Accessibility (a11y)', back: 'WCAG guidelines for inclusive web.\n\n• Semantic HTML (button, nav, main)\n• ARIA attributes when needed\n• Keyboard navigation\n• Color contrast ratios\n• Alt text for images\n• Focus management\n\nTools: axe, Lighthouse, screen readers.' },
      { id: 'wd-20', front: 'WebSockets vs HTTP', back: 'HTTP: Request-response, client initiates.\n\nWebSockets: Full-duplex, persistent connection.\n\nUse WebSockets for:\n• Real-time updates\n• Chat applications\n• Live collaboration\n• Gaming\n\nSSE (Server-Sent Events): One-way server push.' },
      { id: 'wd-21', front: 'Next.js App Router', back: 'File-based routing with features:\n\n• layout.tsx: Shared UI, preserved state\n• page.tsx: Route UI\n• loading.tsx: Suspense boundary\n• error.tsx: Error boundary\n\nServer Components default. "use client" for client.' },
      { id: 'wd-22', front: 'React Query / TanStack Query', back: 'Server state management.\n\n• Caching and deduplication\n• Background refetching\n• Stale-while-revalidate\n• Optimistic updates\n• Pagination support\n\nSeparates server state from client state.' },
      { id: 'wd-23', front: 'Service Workers & PWA', back: 'Service Worker: Background script for offline, caching, push notifications.\n\nPWA (Progressive Web App):\n• Works offline\n• Installable\n• Push notifications\n• Manifest file for app metadata' },
      { id: 'wd-24', front: 'SQL Injection Prevention', back: 'Attack: Malicious SQL in user input.\n\nPrevention:\n• Parameterized queries / prepared statements\n• ORM (abstracts SQL)\n• Input validation\n• Least privilege DB users\n\nNEVER concatenate user input into SQL.' },
      { id: 'wd-25', front: 'OAuth 2.0 Flow', back: 'Third-party authentication.\n\n1. User clicks "Login with Google"\n2. Redirect to Google with client_id\n3. User authorizes\n4. Google redirects back with code\n5. Server exchanges code for access token\n6. Use token for API calls' },
      { id: 'wd-26', front: 'Docker Basics', back: 'Container: Isolated environment with all dependencies.\n\nDockerfile: Recipe to build image.\nImage: Built snapshot.\nContainer: Running instance.\n\ndocker build, docker run, docker-compose.\n\nBenefits: Consistent environments, easy deployment.' },
      { id: 'wd-27', front: 'CI/CD Pipeline', back: 'CI (Continuous Integration): Auto build/test on push.\n\nCD (Continuous Deployment): Auto deploy to production.\n\nSteps: Lint → Test → Build → Deploy\n\nTools: GitHub Actions, Jenkins, CircleCI, GitLab CI.' },
      { id: 'wd-28', front: 'IndexedDB vs localStorage', back: 'localStorage:\n• Simple key-value, string only\n• Synchronous, 5-10MB limit\n\nIndexedDB:\n• Structured data, indexes\n• Asynchronous, larger storage\n• Transactions\n\nUse localStorage for simple data, IndexedDB for complex/large.' },
      { id: 'wd-29', front: 'Browser Rendering Pipeline', back: '1. Parse HTML → DOM tree\n2. Parse CSS → CSSOM\n3. Combine → Render tree\n4. Layout: Calculate positions\n5. Paint: Draw pixels\n6. Composite: Layer management\n\nReflow (layout) is expensive. Prefer transform/opacity.' },
      { id: 'wd-30', front: 'Lazy Loading Strategies', back: 'React: React.lazy() + Suspense\nImages: loading="lazy" attribute\nRoutes: Dynamic imports\n\nIntersection Observer for custom lazy loading.\n\nBenefits: Faster initial load, reduced bandwidth.' }
    ],
    quizQuestions: [
      {
        id: 'wd-q1',
        question: 'What is the main benefit of the Virtual DOM?',
        options: ['Larger file size', 'Minimizes expensive real DOM operations', 'Works without JavaScript', 'Improves SEO'],
        correctAnswer: 1,
        explanation: 'Virtual DOM allows React to batch and minimize actual DOM updates. Real DOM operations are expensive, so comparing lightweight JS objects first and only updating what changed improves performance significantly.'
      },
      {
        id: 'wd-q2',
        question: 'Which HTTP status code indicates a resource was created successfully?',
        options: ['200', '201', '204', '301'],
        correctAnswer: 1,
        explanation: '201 Created indicates a resource was successfully created, typically returned after POST requests. 200 is OK (general success), 204 is No Content, 301 is Moved Permanently (redirect).'
      },
      {
        id: 'wd-q3',
        question: 'What attack does a CSRF token prevent?',
        options: ['SQL Injection', 'Cross-Site Scripting', 'Cross-Site Request Forgery', 'Man-in-the-Middle'],
        correctAnswer: 2,
        explanation: 'CSRF tokens prevent Cross-Site Request Forgery attacks where a malicious site tricks a user\'s browser into making unwanted requests to a site where the user is authenticated.'
      },
      {
        id: 'wd-q4',
        question: 'When should you use useCallback in React?',
        options: ['For all functions', 'When passing callbacks to memoized child components', 'Only in class components', 'To replace useState'],
        correctAnswer: 1,
        explanation: 'useCallback memoizes function references. It\'s useful when passing callbacks to child components wrapped in React.memo, preventing unnecessary re-renders when the parent re-renders.'
      },
      {
        id: 'wd-q5',
        question: 'In the JavaScript event loop, which queue has higher priority?',
        options: ['Task Queue', 'Microtask Queue', 'Both equal', 'Callback Queue'],
        correctAnswer: 1,
        explanation: 'Microtask Queue (Promises, async/await) has higher priority than the Task Queue (setTimeout, setInterval). All microtasks are processed before the next task.'
      },
      {
        id: 'wd-q6',
        question: 'What is the benefit of GraphQL over REST for mobile applications?',
        options: ['Better security', 'Fetch exactly the data needed (no over-fetching)', 'Faster server processing', 'Built-in caching'],
        correctAnswer: 1,
        explanation: 'GraphQL lets clients specify exactly what data they need, reducing bandwidth usage. This is especially valuable for mobile where bandwidth is limited and over-fetching wastes data.'
      },
      {
        id: 'wd-q7',
        question: 'Which is NOT a Core Web Vital metric?',
        options: ['LCP (Largest Contentful Paint)', 'TTI (Time to Interactive)', 'FID (First Input Delay)', 'CLS (Cumulative Layout Shift)'],
        correctAnswer: 1,
        explanation: 'The three Core Web Vitals are LCP, FID (being replaced by INP), and CLS. TTI (Time to Interactive) is a useful metric but not one of the official Core Web Vitals used for Google ranking.'
      },
      {
        id: 'wd-q8',
        question: 'What\'s the main advantage of SSR (Server-Side Rendering) over CSR?',
        options: ['Simpler implementation', 'Better initial load time and SEO', 'Lower server costs', 'Faster client-side navigation'],
        correctAnswer: 1,
        explanation: 'SSR sends fully rendered HTML from the server, providing faster initial page load (content visible immediately) and better SEO since crawlers see the full content without running JavaScript.'
      },
      {
        id: 'wd-q9',
        question: 'What is the purpose of the "key" prop in React lists?',
        options: ['Styling elements', 'Helps React identify which items changed/added/removed', 'Required for all elements', 'Improves SEO'],
        correctAnswer: 1,
        explanation: 'Keys help React\'s reconciliation algorithm identify which items in a list have changed, been added, or removed. Without proper keys, React may rerender more than necessary or have bugs with component state.'
      },
      {
        id: 'wd-q10',
        question: 'What is tree shaking in JavaScript bundlers?',
        options: ['Reordering code', 'Removing unused exports/code from the bundle', 'Compressing images', 'Sorting dependencies'],
        correctAnswer: 1,
        explanation: 'Tree shaking is dead code elimination - the bundler analyzes imports/exports and removes code that\'s never imported anywhere. Requires ES6 modules (static imports) to work effectively.'
      },
      {
        id: 'wd-q11',
        question: 'Why should you use HttpOnly cookies for storing authentication tokens?',
        options: ['They\'re faster', 'JavaScript cannot access them, preventing XSS token theft', 'They\'re larger', 'Required by browsers'],
        correctAnswer: 1,
        explanation: 'HttpOnly cookies cannot be accessed by JavaScript (document.cookie). If an XSS attack occurs, the attacker\'s script cannot steal the authentication token, adding an important security layer.'
      },
      {
        id: 'wd-q12',
        question: 'What does the useEffect cleanup function do?',
        options: ['Deletes the component', 'Runs before re-running effect and on unmount', 'Clears the cache', 'Resets state'],
        correctAnswer: 1,
        explanation: 'The cleanup function (returned from useEffect) runs before the effect re-runs (when dependencies change) and when the component unmounts. Use it to unsubscribe, clear timers, or cancel requests to prevent memory leaks.'
      },
      {
        id: 'wd-q13',
        question: 'What is the Virtual DOM and why does React use it?',
        options: ['A separate browser', 'In-memory representation of UI for efficient diffing and minimal real DOM updates', 'A CSS framework', 'A testing tool'],
        correctAnswer: 1,
        explanation: 'Virtual DOM is a lightweight copy of the real DOM. React computes changes on virtual DOM first (fast), diffs with previous version, then batch-updates only changed parts of real DOM (slow). Minimizes expensive DOM operations.'
      },
      {
        id: 'wd-q14',
        question: 'What is the difference between localStorage and sessionStorage?',
        options: ['Same thing', 'localStorage persists until cleared; sessionStorage clears when tab closes', 'sessionStorage is larger', 'localStorage is faster'],
        correctAnswer: 1,
        explanation: 'Both store key-value strings in browser. localStorage persists indefinitely (until explicitly cleared). sessionStorage is cleared when the browser tab closes. Both have ~5MB limit per origin.'
      },
      {
        id: 'wd-q15',
        question: 'What is CORS and when does it apply?',
        options: ['CSS framework', 'Cross-Origin Resource Sharing - browser security for cross-domain requests', 'JavaScript library', 'HTML tag'],
        correctAnswer: 1,
        explanation: 'CORS restricts web pages from making requests to different domains. Server must send Access-Control-Allow-Origin headers to permit cross-origin requests. Prevents malicious scripts from accessing data on other sites.'
      },
      {
        id: 'wd-q16',
        question: 'In React, what is the purpose of useMemo?',
        options: ['State management', 'Memoizes expensive calculations - recomputes only when dependencies change', 'Side effects', 'Context creation'],
        correctAnswer: 1,
        explanation: 'useMemo caches computed values. Only recalculates when dependencies change, avoiding expensive recalculations on every render. Use for computationally heavy operations, not simple values.'
      },
      {
        id: 'wd-q17',
        question: 'What is SSR (Server-Side Rendering) vs CSR (Client-Side Rendering)?',
        options: ['Same approach', 'SSR: server generates HTML; CSR: browser generates HTML via JavaScript', 'SSR is deprecated', 'CSR is server-based'],
        correctAnswer: 1,
        explanation: 'SSR sends fully rendered HTML from server (better SEO, faster first paint). CSR sends minimal HTML + JS that renders in browser (better interactivity after load). Next.js supports both.'
      },
      {
        id: 'wd-q18',
        question: 'What is the purpose of the key prop in React lists?',
        options: ['Styling', 'Helps React identify which items changed, added, or removed for efficient updates', 'Sorting', 'Filtering'],
        correctAnswer: 1,
        explanation: 'Keys help React\'s reconciliation algorithm identify elements. Without stable keys, React may re-render all items. Use unique, stable identifiers (not array indices) for optimal performance.'
      },
      {
        id: 'wd-q19',
        question: 'What is a REST API?',
        options: ['Database type', 'Architectural style using HTTP methods (GET, POST, PUT, DELETE) on resources', 'Frontend framework', 'Testing library'],
        correctAnswer: 1,
        explanation: 'REST (Representational State Transfer) uses standard HTTP methods on resource URLs. Stateless, cacheable, uniform interface. GET /users, POST /users, PUT /users/1, DELETE /users/1.'
      },
      {
        id: 'wd-q20',
        question: 'What is the difference between == and === in JavaScript?',
        options: ['Same behavior', '== coerces types before comparing; === compares value and type strictly', '=== is deprecated', '== is for strings only'],
        correctAnswer: 1,
        explanation: '== performs type coercion (1 == "1" is true). === compares without coercion (1 === "1" is false). Always prefer === to avoid unexpected type coercion bugs.'
      }
    ]
  },
  {
    id: 'ios',
    name: 'iOS Development',
    slug: 'ios',
    description: 'Swift, UIKit, SwiftUI, and iOS platform fundamentals.',
    icon: 'Smartphone',
    color: '#0984E3',
    premium: true,
    colorDark: '#0870C4',
    learnContent: [
      {
        id: 'ios-intro',
        title: 'iOS Development Overview',
        content: 'iOS development ecosystem:\n\nLanguages:\n• Swift (modern, safe, fast) - preferred\n• Objective-C (legacy, C superset)\n\nUI Frameworks:\n• UIKit: Imperative, mature, extensive\n• SwiftUI: Declarative, modern, cross-platform\n\nKey Concepts for Interviews:\n• Memory management (ARC, retain cycles)\n• App lifecycle (background, foreground states)\n• Concurrency (GCD, async/await)\n• Architecture patterns (MVC, MVVM, VIPER)\n\nImportant Frameworks:\n• Foundation (core utilities)\n• UIKit/SwiftUI (UI)\n• Combine (reactive programming)\n• Core Data (persistence)\n• URLSession (networking)',
      },
      {
        id: 'ios-swift',
        title: 'Swift Language Essentials',
        content: 'Optionals - Null Safety:\n• Optional<T> or T? - may contain value or nil\n• Unwrapping: if let, guard let, ?? (nil coalescing)\n• Optional chaining: user?.address?.street\n• Force unwrap: value! (crashes if nil - avoid!)\n\nValue vs Reference Types:\n• Struct: Value type, copied on assignment, no inheritance\n• Class: Reference type, shared, supports inheritance\n• Enum: Value type, powerful with associated values\n\nProtocols & Generics:\n• Protocol: Define interface (like interface in Java)\n• Protocol extensions: Default implementations\n• Generics: Type-safe reusable code\n\nClosures:\n• First-class functions, capture surrounding context\n• Capture list: [weak self], [unowned self]',
        codeExample: '// Optionals\nlet name: String? = "Swift"\nif let unwrapped = name {\n  print(unwrapped)  // "Swift"\n}\nlet display = name ?? "Unknown"  // Nil coalescing\n\n// Value vs Reference\nstruct Point { var x: Int }  // Copied\nclass Person { var name: String }  // Shared\n\n// Closures with capture list\nfetchData { [weak self] result in\n  self?.updateUI(result)  // Safe - self is optional\n}'
      },
      {
        id: 'ios-memory',
        title: 'Memory Management & ARC',
        content: 'ARC (Automatic Reference Counting):\n• Each object has a reference count\n• +1 when new strong reference created\n• -1 when strong reference removed\n• Deallocated when count reaches 0\n\nRetain Cycles:\n• Two objects strongly reference each other\n• Neither can be deallocated (memory leak)\n• Common with closures capturing self\n\nSolution - Weak/Unowned References:\n• weak: Optional, becomes nil on dealloc\n  Use when: Reference may outlive owner\n• unowned: Non-optional, crashes if accessed after dealloc\n  Use when: Reference lifetime <= owner lifetime\n\nCapture Lists in Closures:\n• [weak self] - most common, safe\n• [unowned self] - when closure can\'t outlive self',
        codeExample: 'class ViewController {\n  var completion: (() -> Void)?\n  \n  func setup() {\n    // BAD: Retain cycle!\n    completion = {\n      self.doSomething()  // Strong reference to self\n    }\n    \n    // GOOD: Break cycle with weak\n    completion = { [weak self] in\n      guard let self = self else { return }\n      self.doSomething()\n    }\n  }\n}\n\n// Delegate pattern - always weak!\nweak var delegate: MyDelegate?'
      },
      {
        id: 'ios-concurrency',
        title: 'Concurrency: GCD & Swift Concurrency',
        content: 'Grand Central Dispatch (GCD):\n• Queues: Main (UI), Global (background), Custom\n• async: Non-blocking, returns immediately\n• sync: Blocking, waits for completion\n\nDispatch Queue Types:\n• Serial: One task at a time, in order\n• Concurrent: Multiple tasks simultaneously\n\nSwift Concurrency (async/await):\n• async: Function can suspend\n• await: Wait for async result\n• Task: Unit of async work\n• Actor: Thread-safe data access\n\nMain Thread Rule:\n• UI updates MUST be on main thread\n• DispatchQueue.main.async { }\n• @MainActor in Swift concurrency',
        codeExample: '// GCD\nDispatchQueue.global(qos: .userInitiated).async {\n  let data = fetchData()  // Background\n  DispatchQueue.main.async {\n    self.updateUI(data)  // Main thread for UI\n  }\n}\n\n// Swift Concurrency\nfunc fetchUser() async throws -> User {\n  let data = try await URLSession.shared.data(from: url)\n  return try JSONDecoder().decode(User.self, from: data)\n}\n\n// Actor for thread-safe access\nactor Counter {\n  var count = 0\n  func increment() { count += 1 }\n}'
      },
      {
        id: 'ios-swiftui',
        title: 'SwiftUI State Management',
        content: 'Property Wrappers for State:\n\n@State:\n• Local state owned by view\n• For simple value types (Int, String, Bool)\n• View re-renders when changed\n\n@Binding:\n• Two-way connection to parent\'s state\n• Child can read and write parent\'s @State\n\n@StateObject:\n• Creates and owns ObservableObject\n• Survives view re-creation\n• Use when view creates the object\n\n@ObservedObject:\n• References ObservableObject from elsewhere\n• Doesn\'t own it - can be recreated\n• Use when receiving object from parent\n\n@EnvironmentObject:\n• Shared across view hierarchy\n• Injected via .environmentObject()\n\n@Published:\n• Inside ObservableObject\n• Triggers view updates when changed',
        codeExample: 'class UserViewModel: ObservableObject {\n  @Published var name = ""  // Triggers updates\n}\n\nstruct ParentView: View {\n  @StateObject var viewModel = UserViewModel()  // Creates\n  @State private var count = 0  // Local state\n  \n  var body: some View {\n    ChildView(count: $count)  // Pass binding\n      .environmentObject(viewModel)\n  }\n}\n\nstruct ChildView: View {\n  @Binding var count: Int  // Two-way binding\n  @EnvironmentObject var viewModel: UserViewModel\n  \n  var body: some View {\n    Button("\\(count)") { count += 1 }\n  }\n}'
      },
      {
        id: 'ios-arch',
        title: 'Architecture Patterns',
        content: 'MVC (Model-View-Controller):\n• Apple\'s default pattern\n• Model: Data and business logic\n• View: UI presentation\n• Controller: Mediates between Model and View\n• Problem: "Massive View Controller"\n\nMVVM (Model-View-ViewModel):\n• Popular with SwiftUI\n• ViewModel: Prepares data for View\n• View binds to ViewModel (reactive)\n• Better separation, testability\n\nCoordinator Pattern:\n• Handles navigation logic\n• ViewControllers don\'t know about each other\n• Coordinators manage flow\n\nClean Architecture / VIPER:\n• Strict layer separation\n• View - Interactor - Presenter - Entity - Router\n• High testability, but verbose\n\nChoose based on:\n• Team size and experience\n• Project complexity\n• Testing requirements',
      }
    ],
    flashcards: [
      { id: 'ios-1', front: 'Swift Optionals\n\nHow does Swift handle null safety and prevent null pointer crashes?', back: 'Type that can hold value or nil. Safe null handling.\n\nUnwrapping:\n• if let value = optional { }\n• guard let value = optional else { return }\n• optional?.property (chaining)\n• optional ?? default (nil coalescing)\n• optional! (force unwrap - dangerous!)\n\nUse guard for early exit, if let for conditional execution.' },
      { id: 'ios-2', front: 'ARC (Automatic Reference Counting)\n\nHow does iOS manage memory automatically without garbage collection?', back: 'Swift\'s memory management.\n\n• Each object has reference count\n• Strong reference: +1 count\n• Reference removed: -1 count\n• Count = 0: Object deallocated\n\nNot garbage collection - deterministic deallocation.\n\nWatch for: Retain cycles with closures and delegates.' },
      { id: 'ios-3', front: 'Retain Cycles\n\nWhat causes memory leaks in iOS and how do you fix them?', back: 'Memory leak when two objects strongly reference each other.\n\nCommon cases:\n• Closures capturing self strongly\n• Delegate properties not marked weak\n• Parent-child bidirectional references\n\nFix:\n• [weak self] in closures\n• weak var delegate: MyDelegate?\n• Break cycle with weak/unowned' },
      { id: 'ios-4', front: 'weak vs unowned\n\nWhat is the difference between weak and unowned references in Swift?', back: 'weak:\n• Optional reference (Type?)\n• Becomes nil when object deallocated\n• Safe - check before using\n• Use when: Reference may outlive owner\n\nunowned:\n• Non-optional reference\n• CRASHES if accessed after deallocation\n• Slightly faster than weak\n• Use when: Reference can\'t outlive owner\n\nDefault to weak - safer.' },
      { id: 'ios-5', front: 'struct vs class in Swift\n\nWhen should you use value types vs reference types?', back: 'struct (Value Type):\n• Copied on assignment\n• No inheritance\n• Mutating keyword for methods that modify\n• Thread-safe by default\n\nclass (Reference Type):\n• Shared reference on assignment\n• Supports inheritance\n• Reference counting (ARC)\n• Can have deinitializers\n\nPrefer structs - simpler, safer. Use class for identity, inheritance, or Objective-C interop.' },
      { id: 'ios-6', front: 'iOS App Lifecycle\n\nWhat are the different states an iOS app goes through?', back: 'States:\n• Not Running: App not launched\n• Inactive: Transitioning, not receiving events\n• Active: Running in foreground\n• Background: Executing code, not visible\n• Suspended: In memory, not executing\n\nKey Callbacks:\n• applicationDidBecomeActive\n• applicationWillResignActive\n• applicationDidEnterBackground\n• applicationWillEnterForeground\n\nSwiftUI: .onAppear, scenePhase' },
      { id: 'ios-7', front: 'GCD (Grand Central Dispatch)\n\nHow do you perform background tasks and update the UI in iOS?', back: 'Concurrency API for iOS.\n\nQueues:\n• DispatchQueue.main: UI updates (serial)\n• DispatchQueue.global(): Background work (concurrent)\n\nQoS (Quality of Service):\n.userInteractive > .userInitiated > .default > .utility > .background\n\nUsage:\nDispatchQueue.global().async { /* background */ }\nDispatchQueue.main.async { /* UI update */ }' },
      { id: 'ios-8', front: 'SwiftUI @State vs @Binding\n\nHow do you manage local vs shared state in SwiftUI?', back: '@State:\n• Source of truth, owned by view\n• For local, simple values (Int, String)\n• View re-renders when changed\n• Private to view (mark private)\n\n@Binding:\n• Two-way connection to external state\n• Child can read AND write parent\'s @State\n• Created with $: $parentState\n• No ownership - just reference\n\nUse @State in parent, pass @Binding to children.' },
      { id: 'ios-9', front: '@StateObject vs @ObservedObject\n\nWhen should you create vs observe an ObservableObject in SwiftUI?', back: '@StateObject:\n• Creates AND owns the ObservableObject\n• Object survives view re-creation\n• Use when view is source of truth\n• Only recreated when view identity changes\n\n@ObservedObject:\n• References object from elsewhere\n• Doesn\'t own - can be recreated\n• Use when receiving from parent\n\nRule: @StateObject for creation, @ObservedObject for passing.' },
      { id: 'ios-10', front: 'Protocol-Oriented Programming', back: 'Swift favors composition over inheritance.\n\nProtocols define interface:\nprotocol Drawable { func draw() }\n\nProtocol Extensions provide defaults:\nextension Drawable { func draw() { /*default*/ } }\n\nBenefits:\n• Multiple protocol conformance\n• Structs can adopt protocols\n• Loose coupling\n• Better testability (mock protocols)\n\nPrefer protocols + extensions over class inheritance.' },
      { id: 'ios-11', front: 'Swift async/await', back: 'Modern concurrency (iOS 15+).\n\nasync: Function can suspend\nawait: Wait for async result\n\nfunc fetch() async throws -> Data\nlet data = try await fetch()\n\nBenefits:\n• Cleaner than callbacks\n• Structured concurrency\n• Automatic cancellation\n\nActors: Thread-safe data isolation\n@MainActor: Ensures main thread execution' },
      { id: 'ios-12', front: '@EnvironmentObject', back: 'Shared data across view hierarchy.\n\nSetup:\n.environmentObject(viewModel)\n\nAccess in any child:\n@EnvironmentObject var vm: MyViewModel\n\nUse for:\n• App-wide state (user, settings)\n• Avoiding prop drilling\n\nCrashes if not provided!\nAlternative: @Environment for system values.' },
      { id: 'ios-13', front: 'URLSession networking', back: 'Native iOS networking.\n\nShared session:\nURLSession.shared.dataTask(with: url)\n\nAsync/await (modern):\nlet (data, response) = try await URLSession.shared.data(from: url)\n\nConfiguration:\n• default: Disk caching\n• ephemeral: No caching\n• background: Downloads continue when app suspended\n\nAlternatives: Alamofire (wrapper), Combine publishers' },
      { id: 'ios-14', front: 'Core Data vs Realm', back: 'Core Data (Apple):\n• Built-in, no dependencies\n• NSManagedObject, NSFetchRequest\n• Complex setup, steep learning curve\n• iCloud sync support\n\nRealm:\n• Third-party, simpler API\n• Objects extend Object class\n• Live objects (auto-update)\n• Cross-platform\n\nModern alternative: SwiftData (iOS 17+) - Swift-native, macro-based, simpler Core Data.' },
      { id: 'ios-15', front: 'Auto Layout', back: 'Constraint-based layout system.\n\nConstraints define:\n• Position (leading, trailing, top, bottom)\n• Size (width, height)\n• Relationships between views\n\nPriorities: Required (1000), High (750), Low (250)\n\nIntrinsic Content Size: Natural size of content\nContent Hugging: Resist growing\nCompression Resistance: Resist shrinking\n\nSwiftUI uses different layout system (stacks, frames, alignment).' },
      { id: 'ios-16', front: 'Combine Framework', back: 'Reactive programming in Swift.\n\nPublisher: Emits values over time\nSubscriber: Receives values\nOperators: Transform, filter, combine\n\nCommon: map, filter, flatMap, combineLatest, merge\n\nUsed with SwiftUI for data binding. Alternative: RxSwift.' },
      { id: 'ios-17', front: 'Swift Concurrency', back: 'Modern async programming.\n\nasync/await: Sequential async code\nTask: Unit of async work\nActor: Thread-safe reference type\n@MainActor: UI thread safety\n\nTaskGroup: Concurrent child tasks\nAsyncSequence: Async for-in loops' },
      { id: 'ios-18', front: 'Protocol-Oriented Programming', back: 'Swift favors protocols over inheritance.\n\nProtocol: Contract (methods, properties)\nExtension: Default implementations\nProtocol composition: Type & Protocol\n\nBenefits: Multiple conformance, value type support, flexibility.' },
      { id: 'ios-19', front: 'App Lifecycle (UIKit)', back: 'AppDelegate states:\n• Not Running\n• Inactive (transitioning)\n• Active (foreground)\n• Background\n• Suspended\n\nMethods: didFinishLaunching, willEnterForeground, didBecomeActive, willResignActive, didEnterBackground' },
      { id: 'ios-20', front: 'SwiftUI vs UIKit', back: 'UIKit:\n• Imperative, class-based\n• More control, mature\n• Storyboards or programmatic\n\nSwiftUI:\n• Declarative, struct-based\n• Less code, live previews\n• iOS 13+ required\n\nCan combine both with UIHostingController/UIViewRepresentable.' },
      { id: 'ios-21', front: 'Codable Protocol', back: 'Encoding and decoding types.\n\nStruct conforms: Codable = Encodable & Decodable\n\nCodingKeys enum for custom mapping.\nJSONEncoder/JSONDecoder for JSON.\n\nNested types, date strategies, custom coding.' },
      { id: 'ios-22', front: 'Keychain vs UserDefaults', back: 'UserDefaults:\n• Simple preferences\n• Not secure\n• Fast access\n\nKeychain:\n• Sensitive data (tokens, passwords)\n• Encrypted, secure\n• Survives app reinstall\n\nUse KeychainAccess library for simpler API.' },
      { id: 'ios-23', front: 'Push Notifications Setup', back: 'Steps:\n1. Enable capability in Xcode\n2. Request permission (UNUserNotificationCenter)\n3. Register for remote notifications\n4. Get device token → send to server\n5. APNs delivers notifications\n\nPayload: alert, badge, sound, data.' },
      { id: 'ios-24', front: 'Memory Management (ARC)', back: 'Automatic Reference Counting.\n\nStrong: Default, increments count\nWeak: Optional, doesn\'t increment\nUnowned: Non-optional, doesn\'t increment\n\nRetain cycle: Two objects strongly reference each other.\nFix: weak or unowned for delegate, closure captures.' },
      { id: 'ios-25', front: 'Grand Central Dispatch', back: 'Concurrency API.\n\nQueues:\n• Main: UI updates\n• Global: Background work (QoS levels)\n• Custom: Serial or concurrent\n\nDispatchQueue.main.async { }\nDispatchQueue.global().async { }\n\nDispatchGroup for waiting on multiple tasks.' },
      { id: 'ios-26', front: 'Table vs Collection View', back: 'UITableView:\n• Single column, vertical scroll\n• Sections and rows\n• Built-in styles\n\nUICollectionView:\n• Custom layouts (grid, horizontal)\n• More flexible\n• UICollectionViewFlowLayout default\n\nBoth use data source and delegate patterns.' },
      { id: 'ios-27', front: 'Navigation in SwiftUI', back: 'NavigationStack (iOS 16+):\n• .navigationDestination(for:)\n• Programmatic: path.append(value)\n\nNavigationLink: Declarative navigation\n\nSheets: .sheet(isPresented:)\nFullscreen: .fullScreenCover()' },
      { id: 'ios-28', front: 'Unit Testing in iOS', back: 'XCTest framework.\n\nsetUp() / tearDown() for each test.\nXCTAssertEqual, XCTAssertTrue, XCTAssertNil\n\nAsync: expectation.fulfill()\n\nMocking: Protocols + mock implementations.\nUI Testing: XCUIApplication, XCUIElement.' },
      { id: 'ios-29', front: 'App Store Guidelines', back: 'Key rules:\n• No private APIs\n• Proper permissions usage\n• Privacy policy for data collection\n• No misleading metadata\n• In-app purchases for digital goods\n\nReview time: Usually 24-48 hours.' },
      { id: 'ios-30', front: 'Instruments Profiling', back: 'Performance debugging tools.\n\n• Time Profiler: CPU usage\n• Allocations: Memory usage\n• Leaks: Memory leaks\n• Core Animation: UI performance\n• Network: HTTP traffic\n\nAccess via Xcode Product → Profile.' }
    ],
    quizQuestions: [
      {
        id: 'ios-q1',
        question: 'How do you prevent retain cycles when using closures in Swift?',
        options: ['Use strong references', 'Use [weak self] or [unowned self]', 'Avoid closures entirely', 'Use global variables'],
        correctAnswer: 1,
        explanation: 'Capture lists like [weak self] or [unowned self] prevent closures from strongly capturing self, breaking potential retain cycles. weak makes self optional (safer), unowned assumes self won\'t be nil.'
      },
      {
        id: 'ios-q2',
        question: 'What is the difference between struct and class in Swift?',
        options: ['No difference', 'Structs are reference types', 'Classes are value types', 'Structs are value types, classes are reference types'],
        correctAnswer: 3,
        explanation: 'Structs are value types (copied on assignment), classes are reference types (shared reference). Swift prefers structs for most data types because they\'re simpler and thread-safe.'
      },
      {
        id: 'ios-q3',
        question: 'Which queue should UI updates be performed on?',
        options: ['Any global queue', 'Background queue', 'Main queue', 'Custom serial queue'],
        correctAnswer: 2,
        explanation: 'UI updates must be performed on the main queue. UIKit is not thread-safe, and updating UI from background threads causes crashes or undefined behavior.'
      },
      {
        id: 'ios-q4',
        question: 'In SwiftUI, @StateObject is used when:',
        options: ['Receiving an object from parent', 'Creating and owning an observable object', 'Binding to a primitive value', 'Storing environment values'],
        correctAnswer: 1,
        explanation: '@StateObject creates and owns an ObservableObject, ensuring it survives view re-creation. Use @ObservedObject when receiving an object from elsewhere.'
      },
      {
        id: 'ios-q5',
        question: 'What happens if you access an unowned reference after the object is deallocated?',
        options: ['Returns nil', 'Returns default value', 'App crashes', 'Compiler error'],
        correctAnswer: 2,
        explanation: 'unowned references are non-optional and assume the object exists. Accessing after deallocation causes a runtime crash. Use weak (optional) when uncertain about lifetime.'
      },
      {
        id: 'ios-q6',
        question: 'Which Swift concurrency feature ensures code runs on the main thread?',
        options: ['async keyword', '@MainActor', 'await keyword', 'Task { }'],
        correctAnswer: 1,
        explanation: '@MainActor is a global actor that ensures annotated code runs on the main thread. It\'s part of Swift\'s structured concurrency and replaces DispatchQueue.main.async patterns.'
      },
      {
        id: 'ios-q7',
        question: 'What is the purpose of guard let in Swift?',
        options: ['Create a loop', 'Early exit if optional is nil', 'Define a constant', 'Handle errors'],
        correctAnswer: 1,
        explanation: 'guard let safely unwraps optionals and requires early exit (return, break, continue, throw) if the condition fails. The unwrapped value is available after the guard statement.'
      },
      {
        id: 'ios-q8',
        question: 'In the MVVM pattern, what is the ViewModel responsible for?',
        options: ['Rendering UI', 'Database operations', 'Preparing data for the View and handling presentation logic', 'Managing navigation'],
        correctAnswer: 2,
        explanation: 'ViewModel prepares and transforms data from the Model for display in the View. It handles presentation logic, state management, and user input, keeping the View simple and testable.'
      },
      {
        id: 'ios-q9',
        question: 'What is the difference between frame and bounds in UIKit?',
        options: ['No difference', 'frame is in superview coordinates, bounds is in own coordinates', 'bounds includes rotation', 'frame is for size only'],
        correctAnswer: 1,
        explanation: 'frame is the view\'s rectangle in its superview\'s coordinate system. bounds is in the view\'s own coordinate system (origin usually 0,0). After rotation, frame changes (bounding box) but bounds doesn\'t.'
      },
      {
        id: 'ios-q10',
        question: 'Which SwiftUI property wrapper should you use to observe an external ObservableObject?',
        options: ['@State', '@StateObject', '@ObservedObject', '@Published'],
        correctAnswer: 2,
        explanation: '@ObservedObject is used when you receive an ObservableObject from outside (parent view, environment). @StateObject is for when the view creates and owns the object. @Published is for properties inside the object.'
      },
      {
        id: 'ios-q11',
        question: 'What happens when you call DispatchQueue.main.sync from the main thread?',
        options: ['Code runs normally', 'Deadlock occurs', 'Code runs async', 'Compiler error'],
        correctAnswer: 1,
        explanation: 'Calling sync on the main queue from the main thread causes a deadlock. The main thread waits for the sync block to complete, but the block can\'t start because it\'s waiting for the main thread. Use async instead.'
      },
      {
        id: 'ios-q12',
        question: 'What is the purpose of Codable in Swift?',
        options: ['UI animations', 'Encoding/decoding data (JSON, etc.)', 'Memory management', 'Networking'],
        correctAnswer: 1,
        explanation: 'Codable (Encodable + Decodable) enables easy conversion between Swift types and external formats like JSON. Just conform to Codable and use JSONEncoder/JSONDecoder for automatic serialization.'
      },
      {
        id: 'ios-q13',
        question: 'What is the difference between frame and bounds in UIKit?',
        options: ['Same thing', 'Frame: position/size in superview coords; Bounds: position/size in own coords', 'Frame is for rotation', 'Bounds is deprecated'],
        correctAnswer: 1,
        explanation: 'Frame is relative to superview\'s coordinate system (where the view is). Bounds is relative to view\'s own coordinate system (origin usually 0,0). Bounds.size usually equals frame.size unless transformed.'
      },
      {
        id: 'ios-q14',
        question: 'In SwiftUI, what is the purpose of @State?',
        options: ['Global state', 'Local mutable state owned by a view that triggers re-render when changed', 'Network state', 'Navigation state'],
        correctAnswer: 1,
        explanation: '@State creates mutable state owned by the view. When @State changes, SwiftUI re-renders the view. Use for simple, local state. For shared state, use @ObservedObject or @EnvironmentObject.'
      },
      {
        id: 'ios-q15',
        question: 'What is the app lifecycle in iOS?',
        options: ['Linear progression', 'Not Running → Inactive → Active → Background → Suspended', 'Single state only', 'Random transitions'],
        correctAnswer: 1,
        explanation: 'Apps transition through states: Not Running, Inactive (transitioning), Active (foreground), Background (limited execution), Suspended (in memory, not executing). Handle in SceneDelegate or AppDelegate.'
      },
      {
        id: 'ios-q16',
        question: 'What is Core Data used for?',
        options: ['Networking', 'Object graph and persistence framework (local database)', 'UI rendering', 'Push notifications'],
        correctAnswer: 1,
        explanation: 'Core Data is Apple\'s framework for managing object graphs and persisting data. It\'s an ORM over SQLite (or other stores). Handles relationships, caching, undo/redo. More than just a database.'
      },
      {
        id: 'ios-q17',
        question: 'What is the difference between weak and unowned references?',
        options: ['Same behavior', 'Weak becomes nil when deallocated; unowned assumes always valid (crashes if nil)', 'Unowned is safer', 'Weak is faster'],
        correctAnswer: 1,
        explanation: 'Both prevent retain cycles. Weak is optional, becomes nil when object deallocates (safe). Unowned is non-optional, crashes if accessed after deallocation. Use unowned when lifetime is guaranteed equal/longer.'
      },
      {
        id: 'ios-q18',
        question: 'What is the purpose of DispatchQueue.main?',
        options: ['Background processing', 'UI updates must happen on main queue', 'File I/O', 'Network requests'],
        correctAnswer: 1,
        explanation: 'All UI updates in iOS must happen on the main (UI) thread. DispatchQueue.main.async { } ensures code runs on main thread. Updating UI from background thread causes crashes or undefined behavior.'
      },
      {
        id: 'ios-q19',
        question: 'In SwiftUI, what is @Binding?',
        options: ['Data model', 'Two-way connection to state owned by parent view', 'Network binding', 'Database connection'],
        correctAnswer: 1,
        explanation: '@Binding creates a reference to state owned elsewhere (usually parent). Changes to binding update the source. Use to let child views modify parent\'s @State. Example: TextField needs $text binding.'
      },
      {
        id: 'ios-q20',
        question: 'What is the purpose of protocols in Swift?',
        options: ['Network protocols', 'Define interface/contract that types must implement', 'Security protocols', 'Communication protocols'],
        correctAnswer: 1,
        explanation: 'Protocols define requirements (methods, properties) that conforming types must implement. Enable abstraction, polymorphism, and dependency injection. Swift protocols support extensions, associated types, and protocol-oriented programming.'
      }
    ]
  },
  {
    id: 'android',
    name: 'Android Development',
    slug: 'android',
    description: 'Kotlin, Android SDK, Jetpack Compose, and platform essentials.',
    icon: 'TabletSmartphone',
    color: '#00B894',
    premium: true,
    colorDark: '#009B7D',
    learnContent: [
      {
        id: 'and-intro',
        title: 'Android Development Overview',
        content: 'Android development ecosystem:\n\nLanguages:\n• Kotlin (modern, preferred, null-safe)\n• Java (legacy, still supported)\n\nUI Frameworks:\n• XML Views (traditional, imperative)\n• Jetpack Compose (modern, declarative)\n\nApp Components:\n• Activity: Entry point, single screen with UI\n• Fragment: Modular UI portion within Activity\n• Service: Background operations\n• Broadcast Receiver: System-wide event listener\n• Content Provider: Data sharing between apps\n\nKey Interview Concepts:\n• Activity/Fragment lifecycle\n• ViewModel and state management\n• Coroutines for async operations\n• Dependency injection (Hilt)\n• Architecture patterns (MVVM, MVI)',
      },
      {
        id: 'and-lifecycle',
        title: 'Activity & Fragment Lifecycle',
        content: 'Activity Lifecycle States:\n\nonCreate() → onStart() → onResume() → RUNNING\n→ onPause() → onStop() → onDestroy()\n\nKey Callbacks:\n• onCreate: Initialize UI, setup (called once)\n• onStart: Activity becoming visible\n• onResume: Activity in foreground, interactive\n• onPause: Losing focus (partially visible)\n• onStop: No longer visible\n• onDestroy: Final cleanup\n\nConfiguration Changes (rotation, locale):\n• Default: Activity destroyed and recreated\n• Save state: onSaveInstanceState(Bundle)\n• Restore: onCreate(bundle) or onRestoreInstanceState\n• Better approach: Use ViewModel (survives config changes)\n\nFragment Lifecycle:\n• Similar to Activity but with additional callbacks\n• onCreateView, onViewCreated, onDestroyView\n• Managed by FragmentManager',
        codeExample: 'class MainActivity : AppCompatActivity() {\n  private lateinit var viewModel: MainViewModel\n  \n  override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    setContentView(R.layout.activity_main)\n    \n    // ViewModel survives configuration changes\n    viewModel = ViewModelProvider(this)[MainViewModel::class.java]\n    \n    // Restore saved state if available\n    savedInstanceState?.getString("key")?.let { /* restore */ }\n  }\n  \n  override fun onSaveInstanceState(outState: Bundle) {\n    super.onSaveInstanceState(outState)\n    outState.putString("key", "value")  // Save UI state\n  }\n}'
      },
      {
        id: 'and-kotlin',
        title: 'Kotlin for Android',
        content: 'Null Safety:\n• Type? is nullable, Type is non-null\n• Safe call: user?.name\n• Elvis operator: name ?: "default"\n• Not-null assertion: name!! (use sparingly)\n\nData Classes:\n• Automatic equals, hashCode, toString, copy\n• data class User(val name: String, val age: Int)\n\nSealed Classes:\n• Restricted class hierarchies\n• Great for representing state (Loading, Success, Error)\n\nExtension Functions:\n• Add functions to existing classes\n• fun String.isEmail() = contains("@")\n\nCoroutines:\n• suspend functions for async code\n• Structured concurrency with scopes\n• Flow for reactive streams',
        codeExample: '// Null safety\nval name: String? = null\nval length = name?.length ?: 0  // 0 if null\n\n// Sealed class for UI state\nsealed class UiState {\n  object Loading : UiState()\n  data class Success(val data: List<Item>) : UiState()\n  data class Error(val message: String) : UiState()\n}\n\n// Extension function\nfun List<Int>.secondOrNull(): Int? = getOrNull(1)\n\n// Data class with copy\nval user = User("John", 25)\nval updated = user.copy(age = 26)'
      },
      {
        id: 'and-coroutines',
        title: 'Coroutines & Async',
        content: 'Coroutines: Lightweight threads for async code.\n\nKey Concepts:\n• suspend: Function can pause without blocking\n• CoroutineScope: Lifecycle for coroutines\n• Job: Cancellable unit of work\n• Dispatcher: Thread pool (Main, IO, Default)\n\nDispatchers:\n• Main: UI updates (main thread)\n• IO: Network, disk operations\n• Default: CPU-intensive work\n\nScopes:\n• viewModelScope: Tied to ViewModel lifecycle\n• lifecycleScope: Tied to Activity/Fragment\n• GlobalScope: Avoid! No lifecycle awareness\n\nFlow: Reactive streams\n• Cold stream (emits when collected)\n• StateFlow: Hot, always has value\n• SharedFlow: Hot, for events',
        codeExample: 'class UserViewModel : ViewModel() {\n  private val _users = MutableStateFlow<UiState>(UiState.Loading)\n  val users: StateFlow<UiState> = _users\n  \n  fun loadUsers() {\n    viewModelScope.launch {  // Auto-cancelled when ViewModel cleared\n      _users.value = UiState.Loading\n      try {\n        val result = withContext(Dispatchers.IO) {\n          repository.getUsers()  // suspend function\n        }\n        _users.value = UiState.Success(result)\n      } catch (e: Exception) {\n        _users.value = UiState.Error(e.message ?: "Error")\n      }\n    }\n  }\n}\n\n// Collect Flow in Activity\nlifecycleScope.launch {\n  viewModel.users.collect { state -> updateUI(state) }\n}'
      },
      {
        id: 'and-compose',
        title: 'Jetpack Compose',
        content: 'Declarative UI framework - describe what, not how.\n\n@Composable Functions:\n• Building blocks of UI\n• Called during composition\n• Re-executed (recomposed) when inputs change\n\nState Management:\n• remember { }: Survive recomposition\n• rememberSaveable { }: Survive config changes\n• mutableStateOf(): Observable state\n• State hoisting: Lift state to caller\n\nRecomposition:\n• Only runs when state changes\n• Compose tracks which state each composable reads\n• Smart recomposition: Only affected parts re-run\n\nSide Effects:\n• LaunchedEffect: Run suspend function\n• DisposableEffect: Cleanup on leave\n• SideEffect: Every recomposition\n• derivedStateOf: Computed state',
        codeExample: '@Composable\nfun Counter() {\n  // remember survives recomposition\n  var count by remember { mutableStateOf(0) }\n  \n  Column {\n    Text("Count: $count")\n    Button(onClick = { count++ }) {\n      Text("Increment")\n    }\n  }\n}\n\n// State hoisting pattern\n@Composable\nfun StatefulCounter() {\n  var count by rememberSaveable { mutableStateOf(0) }  // Survives rotation\n  StatelessCounter(count = count, onIncrement = { count++ })\n}\n\n@Composable\nfun StatelessCounter(count: Int, onIncrement: () -> Unit) {\n  Button(onClick = onIncrement) { Text("Count: $count") }\n}\n\n// Side effect\nLaunchedEffect(userId) {  // Re-runs when userId changes\n  viewModel.loadUser(userId)\n}'
      },
      {
        id: 'and-arch',
        title: 'Architecture & Jetpack',
        content: 'MVVM (Model-View-ViewModel):\n• View: UI (Activity/Fragment/Composable)\n• ViewModel: UI state, survives config changes\n• Model: Data layer (Repository, data sources)\n\nRepository Pattern:\n• Single source of truth\n• Abstracts data sources (network, DB, cache)\n• ViewModel talks to Repository, not directly to network\n\nJetpack Libraries:\n• ViewModel: Lifecycle-aware UI state holder\n• LiveData/StateFlow: Observable data holders\n• Room: SQLite ORM with compile-time verification\n• Navigation: Fragment/Composable navigation\n• WorkManager: Guaranteed background work\n• DataStore: Modern SharedPreferences replacement\n• Hilt: Dependency injection\n\nDependency Injection (Hilt):\n• @HiltAndroidApp on Application\n• @AndroidEntryPoint on Activity/Fragment\n• @Inject constructor for dependencies\n• @Module + @Provides for complex dependencies',
        codeExample: '// Repository pattern\nclass UserRepository @Inject constructor(\n  private val api: UserApi,\n  private val dao: UserDao\n) {\n  fun getUsers(): Flow<List<User>> = flow {\n    emit(dao.getAll())  // Cache first\n    try {\n      val fresh = api.getUsers()\n      dao.insertAll(fresh)\n      emit(fresh)\n    } catch (e: Exception) { /* Use cache */ }\n  }\n}\n\n// ViewModel with Hilt\n@HiltViewModel\nclass UserViewModel @Inject constructor(\n  private val repository: UserRepository\n) : ViewModel() {\n  val users = repository.getUsers()\n    .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())\n}\n\n// Room Entity\n@Entity\ndata class User(\n  @PrimaryKey val id: Int,\n  val name: String\n)'
      }
    ],
    flashcards: [
      { id: 'and-1', front: 'Activity Lifecycle\n\nWhat are the lifecycle methods of an Android Activity?', back: 'onCreate → onStart → onResume → RUNNING → onPause → onStop → onDestroy\n\nKey points:\n• onCreate: One-time setup (setContentView)\n• onResume/onPause: Foreground status\n• onStop: Not visible (save heavy state)\n• onDestroy: Final cleanup\n\nConfig change: Destroys + recreates Activity\nSolution: ViewModel survives config changes' },
      { id: 'and-2', front: 'ViewModel\n\nHow does ViewModel survive configuration changes in Android?', back: 'Jetpack component that survives configuration changes.\n\nPurpose:\n• Hold UI state\n• Survive rotation/config changes\n• Communicate with Repository\n• Lifecycle-aware (cleared when Activity finished)\n\nScoping:\n• ViewModelProvider(this): Activity-scoped\n• By activity: activityViewModels()\n• By fragment: viewModels()\n\nWith Hilt: @HiltViewModel + @Inject constructor' },
      { id: 'and-3', front: 'LiveData vs StateFlow\n\nWhat are the differences between LiveData and StateFlow for state management?', back: 'LiveData:\n• Android-specific\n• Lifecycle-aware (auto-unsubscribes)\n• No initial value required\n• setValue (main thread), postValue (any)\n\nStateFlow:\n• Kotlin (platform-agnostic)\n• Always has value (initial required)\n• Not lifecycle-aware by default\n• Use with lifecycleScope + repeatOnLifecycle\n\nPrefer StateFlow for new code - more flexible, works with Compose.' },
      { id: 'and-4', front: 'Coroutines\n\nHow do you handle asynchronous operations in Kotlin for Android?', back: 'Lightweight async programming.\n\nKey concepts:\n• suspend: Function can pause\n• CoroutineScope: Lifecycle container\n• Dispatcher: Thread pool (Main, IO, Default)\n\nScopes:\n• viewModelScope: ViewModel lifecycle\n• lifecycleScope: Activity/Fragment lifecycle\n\nBuilders:\n• launch: Fire and forget\n• async/await: Return result\n• withContext: Switch dispatcher\n\nFlow: Cold reactive streams' },
      { id: 'and-5', front: 'Jetpack Compose @Composable\n\nWhat are the rules for writing Composable functions in Jetpack Compose?', back: 'Declarative UI functions.\n\nRules:\n• Can only call other @Composable functions\n• Can\'t have return values (describe UI, don\'t return it)\n• Should be idempotent (same inputs = same output)\n• Should be side-effect free (use effects APIs)\n\nRecomposition:\n• Triggered by state changes\n• Only re-runs affected composables\n• Track state with mutableStateOf' },
      { id: 'and-6', front: 'remember vs rememberSaveable\n\nWhat is the difference between remember and rememberSaveable in Compose?', back: 'remember { }:\n• Survives recomposition\n• Lost on configuration change (rotation)\n• Use for computed values, non-UI state\n\nrememberSaveable { }:\n• Survives recomposition AND config changes\n• Saved to Bundle (must be Parcelable/primitive)\n• Use for important UI state\n\nFor ViewModel-backed state, use collectAsState() instead.' },
      { id: 'and-7', front: 'Hilt Dependency Injection\n\nHow do you implement dependency injection in Android with Hilt?', back: 'Android DI library built on Dagger.\n\nSetup:\n• @HiltAndroidApp on Application class\n• @AndroidEntryPoint on Activity/Fragment\n\nInjection:\n• @Inject constructor: Constructor injection\n• @Inject lateinit var: Field injection\n\nProviding:\n• @Module + @Provides: Complex objects\n• @Binds: Interface → Implementation\n• @Singleton, @ViewModelScoped: Scopes' },
      { id: 'and-8', front: 'Fragment vs Activity\n\nWhen should you use a Fragment instead of an Activity?', back: 'Activity:\n• Entry point, full screen\n• Has own lifecycle\n• Registered in manifest\n• Heavier to create\n\nFragment:\n• Modular UI within Activity\n• Reusable across Activities\n• Own lifecycle (tied to host)\n• Supports backstack navigation\n• Lighter, preferred for most screens\n\nModern: Single Activity + multiple Fragments (or Compose screens)' },
      { id: 'and-9', front: 'Room Database\n\nHow does Room simplify SQLite database access in Android?', back: 'SQLite abstraction with compile-time verification.\n\nComponents:\n• @Entity: Data class = table\n• @Dao: Interface with SQL queries\n• @Database: Abstract class, creates DB\n\nFeatures:\n• Compile-time SQL verification\n• Flow/LiveData support\n• Migration support\n• Type converters for complex types\n\n@Query("SELECT * FROM users")\nfun getAll(): Flow<List<User>>' },
      { id: 'and-10', front: 'Intent Types', back: 'Explicit Intent:\n• Specify exact component (class name)\n• Used within your app\nIntent(this, DetailActivity::class.java)\n\nImplicit Intent:\n• Specify action, system finds handler\n• Used for system actions, sharing\nIntent(Intent.ACTION_VIEW, uri)\n\nPending Intent:\n• Wrapped intent for future execution\n• Used by notifications, alarms, widgets' },
      { id: 'and-11', front: 'LaunchedEffect & Side Effects', back: 'Compose side effect APIs:\n\nLaunchedEffect(key):\n• Runs suspend function\n• Re-runs when key changes\n• Cancelled on leave/key change\n\nDisposableEffect(key):\n• Setup + cleanup pattern\n• Returns onDispose { }\n\nSideEffect:\n• Runs after every successful recomposition\n• For non-suspend side effects\n\nrememberCoroutineScope:\n• Get scope for event handlers' },
      { id: 'and-12', front: 'WorkManager', back: 'Guaranteed background work (survives app restart).\n\nUse cases:\n• Sync data to server\n• Process images\n• Periodic cleanup\n\nConstraints:\n• Network required\n• Battery not low\n• Device idle\n\nTypes:\n• OneTimeWorkRequest\n• PeriodicWorkRequest\n\nFeatures: Chaining, retry policy, expedited work' },
      { id: 'and-13', front: 'Navigation Component', back: 'Jetpack navigation library.\n\nComponents:\n• NavGraph: XML/Kotlin DSL defining destinations\n• NavHost: Container displaying current destination\n• NavController: Navigate between destinations\n\nFeatures:\n• Safe Args: Type-safe argument passing\n• Deep links support\n• Back stack management\n• Animations\n\nCompose: NavHost + composable() destinations' },
      { id: 'and-14', front: 'Kotlin Sealed Classes', back: 'Restricted class hierarchies - all subclasses known at compile time.\n\nsealed class Result {\n  data class Success(val data: T) : Result()\n  data class Error(val e: Exception) : Result()\n  object Loading : Result()\n}\n\nBenefits:\n• Exhaustive when expressions\n• Type-safe state handling\n• Great for UI states, API responses\n\nSimilar to enum but subclasses can have different properties.' },
      { id: 'and-15', front: 'State Hoisting', back: 'Pattern: Move state up, pass down state + events.\n\nStateful (owns state):\nvar text by remember { mutableStateOf("") }\nTextField(value = text, onValueChange = { text = it })\n\nStateless (receives state):\nfun MyTextField(value: String, onValueChange: (String) -> Unit)\n\nBenefits:\n• Reusable composables\n• Single source of truth\n• Easier testing\n• State lives at appropriate level' },
      { id: 'and-16', front: 'Service Types', back: 'Foreground Service:\n• Visible notification required\n• User-aware tasks (music, fitness)\n• Survives low memory\n\nBackground Service:\n• No notification needed\n• Heavily restricted since Android 8+\n• Use WorkManager instead\n\nBound Service:\n• Client-server interface (bindService)\n• Destroyed when all clients unbind\n• Returns IBinder for communication\n\nStarted Service:\n• startService() / startForegroundService()\n• Runs until stopSelf() or stopService()' },
      { id: 'and-17', front: 'Broadcast Receivers', back: 'System-wide event listeners.\n\nRegistration:\n• Manifest (static): Limited receivers allowed\n• registerReceiver() (dynamic): Runtime registration\n\nCommon broadcasts:\n• BOOT_COMPLETED: Device started\n• BATTERY_LOW: Battery status\n• CONNECTIVITY_CHANGE: Network changes\n• PACKAGE_ADDED: App installed\n\nLocal broadcasts:\n• LocalBroadcastManager (deprecated)\n• Use LiveData/Flow instead\n\nOrdered broadcasts: Priority-based delivery, can abort chain' },
      { id: 'and-18', front: 'Content Providers', back: 'Share data between apps securely.\n\nComponents:\n• URI: content://authority/path\n• ContentResolver: Client queries provider\n• Cursor: Query results\n\nCRUD operations:\n• query(), insert(), update(), delete()\n\nPermissions:\n• Read/write permissions in manifest\n• URI permissions for temporary access\n\nCommon providers:\n• Contacts, MediaStore, Calendar\n\nCustom provider: Extend ContentProvider, implement 6 methods' },
      { id: 'and-19', front: 'ProGuard / R8', back: 'Code shrinking and obfuscation.\n\nR8 (default):\n• Shrinking: Remove unused code\n• Optimization: Inline, merge classes\n• Obfuscation: Rename to a, b, c\n• Reduces APK size significantly\n\nKeep rules:\n• -keep class Foo { *; }\n• -keepclassmembers: Keep members only\n• @Keep annotation\n\nCommon issues:\n• Reflection breaks (add keep rules)\n• JSON parsing (keep model classes)\n• JNI methods (native name matching)' },
      { id: 'and-20', front: 'App Bundles (AAB)', back: 'Modern distribution format (required for Play Store).\n\nBenefits:\n• Dynamic delivery: Download only needed resources\n• Smaller downloads per device (density, ABI, language)\n• Up to 150MB base, can use dynamic feature modules\n\nDynamic Features:\n• On-demand modules downloaded when needed\n• SplitInstallManager API\n\nvs APK:\n• APK: Universal, larger, direct install\n• AAB: Google generates optimized APKs per device\n\nBuild: bundleRelease task' },
      { id: 'and-21', front: 'Deep Links', back: 'Open specific screens via URLs.\n\nTypes:\n• Deep link: Any URL (needs user choice)\n• App link: Verified domain ownership (direct open)\n• Web link: Standard browser URL\n\nSetup:\n1. Intent filter in manifest with scheme/host\n2. assetlinks.json on domain (App Links)\n3. Handle intent in Activity\n\nNavigation Component:\n• navDeepLink { uriPattern = "..." }\n• Auto-handled by NavController\n\nVerification: adb shell am start -d "scheme://..."' },
      { id: 'and-22', front: 'RecyclerView', back: 'Efficient scrolling list/grid.\n\nComponents:\n• Adapter: Binds data to ViewHolders\n• ViewHolder: Caches view references\n• LayoutManager: Linear, Grid, StaggeredGrid\n\nAdapter methods:\n• onCreateViewHolder: Inflate layout\n• onBindViewHolder: Bind data to views\n• getItemCount: Return list size\n\nOptimizations:\n• DiffUtil: Calculate minimal changes\n• ListAdapter: DiffUtil built-in\n• setHasFixedSize(true)\n• ViewHolder reuse prevents inflation' },
      { id: 'and-23', front: 'Custom Views', back: 'Extend View or ViewGroup.\n\nKey methods:\n• onMeasure: Determine size\n• onLayout: Position children (ViewGroup)\n• onDraw: Draw with Canvas\n\nMeasureSpec modes:\n• EXACTLY: Exact size given\n• AT_MOST: Max size limit\n• UNSPECIFIED: No constraints\n\nCustom attributes:\n• res/values/attrs.xml define\n• obtainStyledAttributes in init\n\nonDraw:\n• Canvas: Drawing surface\n• Paint: Style (color, stroke, anti-alias)' },
      { id: 'and-24', front: 'Material Design & Theming', back: 'Google\'s design system.\n\nMaterial 3:\n• Dynamic color from wallpaper\n• Updated components\n• New typography scale\n\nTheming:\n• Theme.Material3.DayNight: Light/dark\n• colorPrimary, colorSecondary, colorTertiary\n• AppCompatDelegate.setDefaultNightMode()\n\nCompose theming:\n• MaterialTheme { }\n• Colors, Typography, Shapes\n• isSystemInDarkTheme()\n\nComponents: TopAppBar, FloatingActionButton, Cards, BottomSheet' },
      { id: 'and-25', front: 'Android Testing', back: 'Unit Tests (test/):\n• Run on JVM (fast)\n• JUnit, Mockito, MockK\n• Test ViewModels, Repositories, Utils\n\nInstrumented Tests (androidTest/):\n• Run on device/emulator\n• Espresso: UI testing\n• Compose testing: createComposeRule()\n\nMocking:\n• Mockito: mock(), when(), verify()\n• Coroutines: runTest, TestDispatcher\n\nCompose testing:\n• onNodeWithText().performClick()\n• assertIsDisplayed()' },
      { id: 'and-26', front: 'Memory Leaks', back: 'Object held when should be garbage collected.\n\nCommon causes:\n• Static reference to Context/View\n• Inner class holding outer reference\n• Unregistered listeners/callbacks\n• Long-running operations with context\n\nSolutions:\n• Use applicationContext when possible\n• WeakReference for callbacks\n• Unregister in onStop/onDestroy\n• viewModelScope/lifecycleScope\n\nDetection:\n• LeakCanary library\n• Android Studio Profiler\n• Memory dumps analysis' },
      { id: 'and-27', front: 'ANR (Application Not Responding)', back: 'App blocked main thread too long.\n\nThresholds:\n• Input event: 5 seconds\n• BroadcastReceiver: 10 seconds\n• Service: 20 seconds (foreground)\n\nCommon causes:\n• Network/disk on main thread\n• Heavy computation on main thread\n• Deadlock\n• Slow BroadcastReceiver\n\nSolutions:\n• Move work to background (coroutines)\n• Use Dispatchers.IO for I/O\n• StrictMode for detection\n• Avoid synchronized blocks on main thread' },
      { id: 'and-28', front: 'Flow Operators', back: 'Transform and combine Flows.\n\nTransformation:\n• map { }: Transform each value\n• filter { }: Keep matching values\n• flatMapLatest { }: Switch to new flow\n\nCombination:\n• combine(): Latest from multiple flows\n• zip(): Pair values from flows\n• merge(): Combine into single stream\n\nTerminal:\n• collect { }: Receive values\n• first(), single(): Single value\n• toList(): Collect to list\n\nContext:\n• flowOn(Dispatcher): Upstream context\n• catch { }: Handle errors' },
      { id: 'and-29', front: 'Compose Modifiers', back: 'Decorate/augment composables.\n\nOrder matters:\n• Applied top to bottom\n• padding then background ≠ background then padding\n\nCommon modifiers:\n• size, fillMaxSize, fillMaxWidth\n• padding, offset\n• background, border, clip\n• clickable, combinedClickable\n• scrollable, verticalScroll\n\nChaining:\nModifier\n  .fillMaxWidth()\n  .padding(16.dp)\n  .background(Color.Gray)\n  .clickable { }\n\nCustom: composed { } or layout { }' },
      { id: 'and-30', front: 'View Binding vs Data Binding', back: 'View Binding:\n• Type-safe view access\n• Generates binding class per layout\n• No expression language\n• Faster compilation\n• binding.textView.text = "Hello"\n\nData Binding:\n• View Binding features +\n• Expression language in XML\n• Two-way binding support\n• Observable data\n• android:text="@{viewModel.name}"\n\nRecommendation:\n• Use View Binding for simple cases\n• Data Binding for complex UI bindings\n• Compose eliminates both' },
    ],
    quizQuestions: [
      {
        id: 'and-q1',
        question: 'Which lifecycle callback is called when an Activity is no longer visible?',
        options: ['onPause', 'onStop', 'onDestroy', 'onHidden'],
        correctAnswer: 1,
        explanation: 'onStop is called when the Activity is no longer visible. onPause is called when it loses focus but may still be partially visible (e.g., dialog overlay).'
      },
      {
        id: 'and-q2',
        question: 'What is the main purpose of ViewModel?',
        options: ['Replace Activities', 'Handle network calls directly', 'Survive configuration changes and hold UI state', 'Manage database connections'],
        correctAnswer: 2,
        explanation: 'ViewModel survives configuration changes (like rotation) and is designed to hold and manage UI-related data. It\'s scoped to an Activity/Fragment lifecycle and cleared when the host is finished.'
      },
      {
        id: 'and-q3',
        question: 'In Jetpack Compose, what triggers recomposition?',
        options: ['Activity recreation', 'State changes', 'Screen rotation', 'Memory pressure'],
        correctAnswer: 1,
        explanation: 'Recomposition occurs when state that a Composable reads changes. Compose automatically tracks state reads and only recomposes affected composables when that state changes.'
      },
      {
        id: 'and-q4',
        question: 'Which Kotlin feature is recommended for asynchronous programming on Android?',
        options: ['Threads', 'AsyncTask (deprecated)', 'Coroutines', 'Handlers'],
        correctAnswer: 2,
        explanation: 'Coroutines are the modern, recommended approach. They\'re lightweight, support structured concurrency with scopes, and integrate seamlessly with Jetpack libraries like ViewModel and Room.'
      },
      {
        id: 'and-q5',
        question: 'What is the difference between remember and rememberSaveable in Compose?',
        options: ['No difference', 'remember survives configuration changes', 'rememberSaveable survives configuration changes', 'rememberSaveable is for animations'],
        correctAnswer: 2,
        explanation: 'remember survives recomposition but is lost on configuration changes (rotation). rememberSaveable survives both recomposition AND configuration changes by saving to Bundle.'
      },
      {
        id: 'and-q6',
        question: 'Which Dispatcher should be used for UI updates in Coroutines?',
        options: ['Dispatchers.IO', 'Dispatchers.Default', 'Dispatchers.Main', 'Dispatchers.Unconfined'],
        correctAnswer: 2,
        explanation: 'Dispatchers.Main runs code on the main/UI thread, which is required for UI updates. IO is for disk/network operations, Default is for CPU-intensive work.'
      },
      {
        id: 'and-q7',
        question: 'What annotation is needed on a ViewModel class when using Hilt?',
        options: ['@Inject', '@AndroidEntryPoint', '@HiltViewModel', '@BindsViewModel'],
        correctAnswer: 2,
        explanation: '@HiltViewModel annotation tells Hilt this is a ViewModel that can be injected. The ViewModel also needs @Inject on its constructor for dependencies.'
      },
      {
        id: 'and-q8',
        question: 'In the Repository pattern, what is the Repository\'s primary responsibility?',
        options: ['Render UI', 'Abstract data sources and provide single source of truth', 'Handle user input', 'Manage navigation'],
        correctAnswer: 1,
        explanation: 'Repository abstracts data sources (network, database, cache) and provides a clean API to the ViewModel. It acts as the single source of truth for data, deciding when to fetch from network vs cache.'
      },
      {
        id: 'and-q9',
        question: 'What is the purpose of sealed classes in Kotlin?',
        options: ['Encryption', 'Restrict subclasses to compile-time known types', 'Better performance', 'Required for data classes'],
        correctAnswer: 1,
        explanation: 'Sealed classes restrict inheritance - all subclasses must be declared in the same file. This enables exhaustive when expressions, making them perfect for representing states (Loading, Success, Error).'
      },
      {
        id: 'and-q10',
        question: 'What happens to a coroutine launched in viewModelScope when the ViewModel is cleared?',
        options: ['Continues running', 'Automatically cancelled', 'Throws exception', 'Moves to GlobalScope'],
        correctAnswer: 1,
        explanation: 'viewModelScope is tied to the ViewModel lifecycle. When the ViewModel is cleared (Activity finished), all coroutines in viewModelScope are automatically cancelled, preventing memory leaks.'
      },
      {
        id: 'and-q11',
        question: 'In Compose, what is the purpose of LaunchedEffect?',
        options: ['Create animations', 'Run suspend functions when composition enters or keys change', 'Handle clicks', 'Define layouts'],
        correctAnswer: 1,
        explanation: 'LaunchedEffect runs a suspend function when the composable enters composition and re-runs when its key changes. It\'s used for side effects like API calls, animations, or one-time events.'
      },
      {
        id: 'and-q12',
        question: 'What is the difference between StateFlow and SharedFlow?',
        options: ['No difference', 'StateFlow always has a current value, SharedFlow doesn\'t require one', 'SharedFlow is faster', 'StateFlow is deprecated'],
        correctAnswer: 1,
        explanation: 'StateFlow always holds a current value (must provide initial value) and only emits when value changes. SharedFlow can emit without a current value, supports replay, and emits every value including duplicates.'
      },
      {
        id: 'and-q13',
        question: 'What is the purpose of a ContentProvider?',
        options: ['UI rendering', 'Share data between apps securely through a standard interface', 'Background tasks', 'Push notifications'],
        correctAnswer: 1,
        explanation: 'ContentProvider exposes app data to other apps via a standard URI-based interface. System content providers give access to contacts, media, etc. Use ContentResolver to query/modify. Includes permission controls.'
      },
      {
        id: 'and-q14',
        question: 'In Jetpack Compose, what is recomposition?',
        options: ['App restart', 'Re-executing composable functions when their state inputs change', 'Memory cleanup', 'Layout recalculation'],
        correctAnswer: 1,
        explanation: 'Compose tracks which state each composable reads. When state changes, only affected composables re-execute. This is smart recomposition - efficient partial UI updates without rebuilding everything.'
      },
      {
        id: 'and-q15',
        question: 'What is the difference between apply and let scope functions?',
        options: ['Same behavior', 'Apply: context is this, returns object; Let: context is it, returns lambda result', 'Let returns nothing', 'Apply is deprecated'],
        correctAnswer: 1,
        explanation: 'Apply uses this as context and returns the receiver (builder pattern). Let uses it as context and returns lambda\'s result (null checks, transformations). Also: run (this, returns lambda), with (this, non-extension).'
      },
      {
        id: 'and-q16',
        question: 'What is ProGuard/R8 used for?',
        options: ['Testing', 'Code shrinking, optimization, and obfuscation for release builds', 'Debugging', 'Building UI'],
        correctAnswer: 1,
        explanation: 'R8 (replacement for ProGuard) removes unused code, optimizes bytecode, and obfuscates names (a, b, c). Significantly reduces APK size. Requires keep rules for reflection, serialization, and JNI.'
      },
      {
        id: 'and-q17',
        question: 'What triggers a configuration change in Android?',
        options: ['User input only', 'Screen rotation, locale change, keyboard availability - recreates Activity', 'App updates', 'Network changes'],
        correctAnswer: 1,
        explanation: 'Configuration changes (rotation, language, screen size) destroy and recreate the Activity by default. Use ViewModel to survive this. Or handle manually with configChanges in manifest (not recommended).'
      },
      {
        id: 'and-q18',
        question: 'In Compose, what is the purpose of derivedStateOf?',
        options: ['Create new state', 'Create computed state that only updates when calculation result changes', 'Delete state', 'Share state'],
        correctAnswer: 1,
        explanation: 'derivedStateOf creates state derived from other state. It only triggers recomposition when the computed result actually changes, not when source states change. Useful for filtering, sorting, complex calculations.'
      },
      {
        id: 'and-q19',
        question: 'What is WorkManager used for?',
        options: ['UI updates', 'Guaranteed background work that survives app restarts and device reboots', 'Database operations', 'Animations'],
        correctAnswer: 1,
        explanation: 'WorkManager handles deferrable, guaranteed background tasks. Works with constraints (network, charging). Persists tasks across app/device restarts. Use for sync, upload, cleanup - not for immediate tasks.'
      },
      {
        id: 'and-q20',
        question: 'What is the purpose of sealed classes in Kotlin for Android development?',
        options: ['Security', 'Represent restricted hierarchies like UI states (Loading, Success, Error)', 'Performance', 'Networking'],
        correctAnswer: 1,
        explanation: 'Sealed classes restrict inheritance to known subclasses. Perfect for UI state: sealed class UiState { object Loading, data class Success(val data), data class Error(val msg) }. When expressions are exhaustive.'
      }
    ]
  }
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(cat => cat.slug === slug);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};
