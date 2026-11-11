// Python debug problems 101-125. Generated from an authoring script; expected values
// come from running the reference fixes through scripts/py-harness.py.
import type { BugFixProblem } from '../bugFixes';

export const problems: BugFixProblem[] = [
  {
    "id": "py-dict-copy-shares-nested",
    "number": 101,
    "language": "python",
    "title": "Copied Template, Shared Tags",
    "difficulty": "Medium",
    "topic": "Aliasing",
    "statement": "Build one profile per username from a template dict such as {\"theme\": \"dark\", \"tags\": [\"new\"]}. The template always has a \"tags\" list; its other values are plain strings or numbers. Each profile holds everything in the template, plus a \"user\" key with the username, and has that username appended to its own \"tags\" list. Return the profiles in the order of `names` (an empty list for no names). For names [\"ann\", \"bob\"] ann's tags should be [\"new\", \"ann\"] and bob's [\"new\", \"bob\"], but every profile comes back with the tags [\"new\", \"ann\", \"bob\"].",
    "functionName": "make_profiles",
    "functionSignature": "def make_profiles(template: dict, names: list[str]) -> list[dict]:",
    "buggyCode": "def make_profiles(template: dict, names: list[str]) -> list[dict]:\n    profiles = []\n    for name in names:\n        profile = template.copy()\n        profile[\"user\"] = name\n        profile[\"tags\"].append(name)\n        profiles.append(profile)\n    return profiles\n",
    "hint": "dict.copy() makes a new outer dict. What does the new dict's \"tags\" key point at?",
    "explanation": "template.copy() is a shallow copy: it creates a new dict, but each value is the same object the template holds. The \"theme\" string is harmless to share because strings cannot change, but the \"tags\" list is mutable, so every profile (and the template itself) points at one list and each append lands in all of them. Assigning profile[\"user\"] works because that rebinds a key in the new outer dict; .append mutates the shared inner object. Give each profile its own list, either with copy.deepcopy(template), which copies nested containers too, or by building a new list: profile[\"tags\"] = template[\"tags\"] + [name]. dict(template) and {**template} are shallow as well, so they do not help. Cost is O(names x template size) either way.",
    "examples": [
      {
        "input": [
          {
            "theme": "dark",
            "tags": [
              "new"
            ]
          },
          [
            "ann",
            "bob"
          ]
        ],
        "expected": [
          {
            "theme": "dark",
            "tags": [
              "new",
              "ann"
            ],
            "user": "ann"
          },
          {
            "theme": "dark",
            "tags": [
              "new",
              "bob"
            ],
            "user": "bob"
          }
        ]
      },
      {
        "input": [
          {
            "plan": "free",
            "tags": []
          },
          [
            "kai"
          ]
        ],
        "expected": [
          {
            "plan": "free",
            "tags": [
              "kai"
            ],
            "user": "kai"
          }
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          {
            "tags": [
              "a",
              "b"
            ]
          },
          [
            "x",
            "y",
            "z"
          ]
        ],
        "expected": [
          {
            "tags": [
              "a",
              "b",
              "x"
            ],
            "user": "x"
          },
          {
            "tags": [
              "a",
              "b",
              "y"
            ],
            "user": "y"
          },
          {
            "tags": [
              "a",
              "b",
              "z"
            ],
            "user": "z"
          }
        ]
      },
      {
        "input": [
          {
            "theme": "light",
            "tags": [
              "new"
            ]
          },
          []
        ],
        "expected": []
      },
      {
        "input": [
          {
            "level": 3,
            "tags": []
          },
          [
            "p",
            "q"
          ]
        ],
        "expected": [
          {
            "level": 3,
            "tags": [
              "p"
            ],
            "user": "p"
          },
          {
            "level": 3,
            "tags": [
              "q"
            ],
            "user": "q"
          }
        ]
      },
      {
        "input": [
          {
            "tags": [
              "vip"
            ],
            "theme": "dark",
            "lang": "en"
          },
          [
            "zoe",
            "zoe"
          ]
        ],
        "expected": [
          {
            "tags": [
              "vip",
              "zoe"
            ],
            "theme": "dark",
            "lang": "en",
            "user": "zoe"
          },
          {
            "tags": [
              "vip",
              "zoe"
            ],
            "theme": "dark",
            "lang": "en",
            "user": "zoe"
          }
        ]
      }
    ]
  },
  {
    "id": "py-money-rounding-float",
    "number": 102,
    "language": "python",
    "title": "Tax Rounds the Wrong Way",
    "difficulty": "Hard",
    "topic": "Floats",
    "statement": "Add sales tax to a price and return the total as a string with exactly two digits after the decimal point. `price` is a non-negative decimal string that always has exactly two digits after the point (like \"1.15\"), and `tax_percent` is a whole number from 0 to 100. The exact total is price x (100 + tax_percent) / 100; when it falls exactly halfway between two cents it rounds up. \"1.15\" with 10 percent tax is exactly 1.265, so the answer is \"1.27\", but the code returns \"1.26\".",
    "functionName": "price_with_tax",
    "functionSignature": "def price_with_tax(price: str, tax_percent: int) -> str:",
    "buggyCode": "def price_with_tax(price: str, tax_percent: int) -> str:\n    total = float(price) * (100 + tax_percent) / 100\n    return f\"{round(total, 2):.2f}\"\n",
    "hint": "Print float(\"1.15\") * 110 / 100 with 20 digits. Is it really 1.265? And which way does round() send an exact half?",
    "explanation": "Two things go wrong, and both come from doing money in binary floats. First, most decimal fractions have no exact binary form: float(\"1.15\") is slightly below 1.15, so the product that should be exactly 1.265 is stored as 1.26499999..., and no rounding rule can recover the lost half cent. Second, even for a value that is stored exactly, round() uses round-half-to-even, not the round-half-up the task asks for. The fix is to keep the amount exact. Decimal(price) built from the string (never from a float) represents 1.15 exactly, the multiplication and division stay exact, and quantize(Decimal(\"0.01\"), rounding=ROUND_HALF_UP) applies the stated rule; note that quantize defaults to half-even, so the rounding mode has to be passed. Integer arithmetic in cents works equally well: cents x (100 + tax) is in hundredths of a cent, and adding 50 before floor-dividing by 100 rounds halves up. Both are O(1).",
    "examples": [
      {
        "input": [
          "1.15",
          10
        ],
        "expected": "1.27"
      },
      {
        "input": [
          "20.00",
          5
        ],
        "expected": "21.00"
      },
      {
        "input": [
          "0.25",
          50
        ],
        "expected": "0.38"
      }
    ],
    "hiddenTests": [
      {
        "input": [
          "0.00",
          20
        ],
        "expected": "0.00"
      },
      {
        "input": [
          "19.99",
          0
        ],
        "expected": "19.99"
      },
      {
        "input": [
          "2.35",
          10
        ],
        "expected": "2.59"
      },
      {
        "input": [
          "0.05",
          10
        ],
        "expected": "0.06"
      },
      {
        "input": [
          "1234.56",
          8
        ],
        "expected": "1333.32"
      },
      {
        "input": [
          "0.15",
          50
        ],
        "expected": "0.23"
      },
      {
        "input": [
          "10.10",
          25
        ],
        "expected": "12.63"
      }
    ]
  },
  {
    "id": "py-chained-not-equal",
    "number": 103,
    "language": "python",
    "title": "Three Different Values",
    "difficulty": "Easy",
    "topic": "Comparison",
    "statement": "Return True only when the three values are all different from one another, and False if any two of them are equal. For 1, 2, 1 the answer should be False because the first and last match, but the code returns True.",
    "functionName": "all_different",
    "functionSignature": "def all_different(a: int, b: int, c: int) -> bool:",
    "buggyCode": "def all_different(a: int, b: int, c: int) -> bool:\n    return a != b != c\n",
    "hint": "A chained comparison only compares neighbours. Write out the pairs that a != b != c actually checks.",
    "explanation": "Python expands a chained comparison into its adjacent pairs joined by \"and\": a != b != c means (a != b) and (b != c). Nothing compares a with c, so 1, 2, 1 slips through. Chaining is transitive for <, <= and ==, which is why it reads so naturally there, but \"not equal\" is not transitive: a differs from b and b differs from c says nothing about a and c. Check all three pairs explicitly (a != b and b != c and a != c), or let a set do the work: len({a, b, c}) == 3 is True only when no value repeats, and it scales to any number of values in O(n).",
    "examples": [
      {
        "input": [
          1,
          2,
          1
        ],
        "expected": false
      },
      {
        "input": [
          1,
          2,
          3
        ],
        "expected": true
      },
      {
        "input": [
          4,
          4,
          5
        ],
        "expected": false
      }
    ],
    "hiddenTests": [
      {
        "input": [
          7,
          7,
          7
        ],
        "expected": false
      },
      {
        "input": [
          0,
          5,
          0
        ],
        "expected": false
      },
      {
        "input": [
          3,
          8,
          8
        ],
        "expected": false
      },
      {
        "input": [
          -1,
          0,
          1
        ],
        "expected": true
      },
      {
        "input": [
          9,
          2,
          9
        ],
        "expected": false
      }
    ]
  },
  {
    "id": "py-heap-tuple-tie",
    "number": 104,
    "language": "python",
    "title": "Equal Priorities Crash the Queue",
    "difficulty": "Hard",
    "topic": "Heaps",
    "statement": "Each job arrives as [priority, job], where job is a dict such as {\"name\": \"backup\"}. Return the job names in the order they should run: lowest priority number first, and jobs with the same priority in the order they arrived. An empty input gives an empty list. For [[2, {\"name\": \"email\"}], [1, {\"name\": \"backup\"}], [2, {\"name\": \"report\"}]] the answer is [\"backup\", \"email\", \"report\"], but the code raises TypeError: '<' not supported between instances of 'dict' and 'dict'.",
    "functionName": "run_order",
    "functionSignature": "def run_order(jobs: list[list]) -> list[str]:",
    "buggyCode": "import heapq\n\ndef run_order(jobs: list[list]) -> list[str]:\n    heap = []\n    for priority, job in jobs:\n        heapq.heappush(heap, (priority, job))\n    order = []\n    while heap:\n        priority, job = heapq.heappop(heap)\n        order.append(job[\"name\"])\n    return order\n",
    "hint": "Tuples compare element by element. What does Python compare when two priorities are equal?",
    "explanation": "heapq orders its items with <, and tuples compare lexicographically: the first elements decide unless they are equal, in which case Python moves on to the second elements. With (priority, job) a tie on priority therefore asks whether one dict is less than another, which dicts do not support, so the push or pop raises TypeError. It only shows up once two jobs share a priority, which is why it survives light testing. The standard remedy is a tie-breaker that is always comparable and always unique, placed before the payload: push (priority, index, job) using the arrival index. The index settles every tie before the dict is ever looked at, and it also delivers the required first-come order (a heap is not stable on its own). Breaking ties with the job name instead would order equal priorities alphabetically, and would still crash on two jobs with the same name. A stable sorted(jobs, key=lambda e: e[0]) is an equally good answer here; both are O(n log n).",
    "examples": [
      {
        "input": [
          [
            [
              2,
              {
                "name": "email"
              }
            ],
            [
              1,
              {
                "name": "backup"
              }
            ],
            [
              2,
              {
                "name": "report"
              }
            ]
          ]
        ],
        "expected": [
          "backup",
          "email",
          "report"
        ]
      },
      {
        "input": [
          [
            [
              3,
              {
                "name": "c"
              }
            ],
            [
              1,
              {
                "name": "a"
              }
            ],
            [
              2,
              {
                "name": "b"
              }
            ]
          ]
        ],
        "expected": [
          "a",
          "b",
          "c"
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          [
            [
              1,
              {
                "name": "zeta"
              }
            ],
            [
              1,
              {
                "name": "alpha"
              }
            ],
            [
              1,
              {
                "name": "mid"
              }
            ]
          ]
        ],
        "expected": [
          "zeta",
          "alpha",
          "mid"
        ]
      },
      {
        "input": [
          []
        ],
        "expected": []
      },
      {
        "input": [
          [
            [
              5,
              {
                "name": "solo"
              }
            ]
          ]
        ],
        "expected": [
          "solo"
        ]
      },
      {
        "input": [
          [
            [
              2,
              {
                "name": "dup"
              }
            ],
            [
              1,
              {
                "name": "x"
              }
            ],
            [
              2,
              {
                "name": "dup"
              }
            ],
            [
              0,
              {
                "name": "first"
              }
            ]
          ]
        ],
        "expected": [
          "first",
          "x",
          "dup",
          "dup"
        ]
      },
      {
        "input": [
          [
            [
              4,
              {
                "name": "w"
              }
            ],
            [
              4,
              {
                "name": "b"
              }
            ],
            [
              2,
              {
                "name": "y"
              }
            ],
            [
              4,
              {
                "name": "a"
              }
            ],
            [
              2,
              {
                "name": "c"
              }
            ],
            [
              9,
              {
                "name": "k"
              }
            ],
            [
              2,
              {
                "name": "a"
              }
            ]
          ]
        ],
        "expected": [
          "y",
          "c",
          "a",
          "w",
          "b",
          "a",
          "k"
        ]
      }
    ]
  },
  {
    "id": "py-bisect-boundary-side",
    "number": 105,
    "language": "python",
    "title": "Score Lands on the Cutoff",
    "difficulty": "Medium",
    "topic": "Binary Search",
    "statement": "`cutoffs` is a strictly increasing list of minimum scores, and `labels` has exactly one more entry than `cutoffs`. A score below cutoffs[0] gets labels[0]; a score that has reached cutoffs[i] (greater than OR equal to it) but not the next cutoff gets labels[i + 1]. With cutoffs [60, 70, 80, 90] and labels [\"F\", \"D\", \"C\", \"B\", \"A\"], a score of 70 has reached the 70 cutoff and should get \"C\", but the code returns \"D\".",
    "functionName": "tier_for",
    "functionSignature": "def tier_for(score: int, cutoffs: list[int], labels: list[str]) -> str:",
    "buggyCode": "from bisect import bisect_left\n\ndef tier_for(score: int, cutoffs: list[int], labels: list[str]) -> str:\n    return labels[bisect_left(cutoffs, score)]\n",
    "hint": "The two bisect functions differ only when the value is already in the list. Which side of an equal element does each one return?",
    "explanation": "Both bisect functions return an insertion point that keeps the list sorted; they differ only when the value is already present. bisect_left returns the position before the equal element, so it counts the cutoffs strictly below the score. bisect_right returns the position after it, so it counts the cutoffs less than or equal to the score, which is exactly \"how many cutoffs has this score reached\". The label index is that count, so bisect_right is the right call, and every score that is not exactly on a cutoff gives the same answer either way, which is why the bug hides. Adding 1 to the bisect_left result is the tempting patch, but it shifts every non-boundary score up a tier as well. A linear count of cutoffs with score >= c is also correct at O(n); bisect does it in O(log n).",
    "examples": [
      {
        "input": [
          70,
          [
            60,
            70,
            80,
            90
          ],
          [
            "F",
            "D",
            "C",
            "B",
            "A"
          ]
        ],
        "expected": "C"
      },
      {
        "input": [
          85,
          [
            60,
            70,
            80,
            90
          ],
          [
            "F",
            "D",
            "C",
            "B",
            "A"
          ]
        ],
        "expected": "B"
      },
      {
        "input": [
          59,
          [
            60,
            70,
            80,
            90
          ],
          [
            "F",
            "D",
            "C",
            "B",
            "A"
          ]
        ],
        "expected": "F"
      }
    ],
    "hiddenTests": [
      {
        "input": [
          90,
          [
            60,
            70,
            80,
            90
          ],
          [
            "F",
            "D",
            "C",
            "B",
            "A"
          ]
        ],
        "expected": "A"
      },
      {
        "input": [
          60,
          [
            60,
            70,
            80,
            90
          ],
          [
            "F",
            "D",
            "C",
            "B",
            "A"
          ]
        ],
        "expected": "D"
      },
      {
        "input": [
          100,
          [
            60,
            70,
            80,
            90
          ],
          [
            "F",
            "D",
            "C",
            "B",
            "A"
          ]
        ],
        "expected": "A"
      },
      {
        "input": [
          0,
          [
            1
          ],
          [
            "none",
            "some"
          ]
        ],
        "expected": "none"
      },
      {
        "input": [
          1,
          [
            1
          ],
          [
            "none",
            "some"
          ]
        ],
        "expected": "some"
      },
      {
        "input": [
          500,
          [
            100,
            500,
            1000
          ],
          [
            "bronze",
            "silver",
            "gold",
            "platinum"
          ]
        ],
        "expected": "gold"
      },
      {
        "input": [
          999,
          [
            100,
            500,
            1000
          ],
          [
            "bronze",
            "silver",
            "gold",
            "platinum"
          ]
        ],
        "expected": "gold"
      },
      {
        "input": [
          7,
          [],
          [
            "only"
          ]
        ],
        "expected": "only"
      }
    ]
  },
  {
    "id": "py-except-order-shadowed",
    "number": 106,
    "language": "python",
    "title": "The Handler That Never Runs",
    "difficulty": "Easy",
    "topic": "Exceptions",
    "statement": "A bill-splitting form sends both fields as text. Return the whole-number share each person pays: int(total) // int(people). If either field is not a valid integer, return the string \"invalid\". If both are valid integers but `people` is zero, return the string \"nobody\". Valid totals are never negative. For \"90\" and \"0\" the answer should be \"nobody\", but the code returns \"invalid\".",
    "functionName": "share_each",
    "functionSignature": "def share_each(total: str, people: str):",
    "buggyCode": "def share_each(total: str, people: str):\n    try:\n        return int(total) // int(people)\n    except Exception:\n        return \"invalid\"\n    except ZeroDivisionError:\n        return \"nobody\"\n",
    "hint": "Python tries the except clauses from top to bottom and runs the first one that matches. Is ZeroDivisionError an Exception?",
    "explanation": "When an exception is raised, Python walks the except clauses in the order they are written and runs the first whose class matches the exception or is one of its base classes. ZeroDivisionError inherits from ArithmeticError and then Exception, so \"except Exception\" matches it first and the dedicated handler below is unreachable. Python does not warn about this. Order handlers from most specific to most general: put except ZeroDivisionError first, then the broad fallback. Better still, catch only what you expect (ValueError from int()) and test for zero explicitly, so an unrelated bug is not silently reported as \"invalid\". Note that the zero check must come after both fields have been validated: \"abc\" and \"0\" is invalid, not nobody, and int() accepts spellings of zero such as \"00\".",
    "examples": [
      {
        "input": [
          "90",
          "0"
        ],
        "expected": "nobody"
      },
      {
        "input": [
          "90",
          "4"
        ],
        "expected": 22
      },
      {
        "input": [
          "ninety",
          "3"
        ],
        "expected": "invalid"
      }
    ],
    "hiddenTests": [
      {
        "input": [
          "0",
          "5"
        ],
        "expected": 0
      },
      {
        "input": [
          "100",
          "x"
        ],
        "expected": "invalid"
      },
      {
        "input": [
          "abc",
          "0"
        ],
        "expected": "invalid"
      },
      {
        "input": [
          "7",
          "00"
        ],
        "expected": "nobody"
      },
      {
        "input": [
          "12.5",
          "2"
        ],
        "expected": "invalid"
      },
      {
        "input": [
          "41",
          "41"
        ],
        "expected": 1
      },
      {
        "input": [
          "",
          "2"
        ],
        "expected": "invalid"
      }
    ]
  },
  {
    "id": "py-negative-slice-start",
    "number": 107,
    "language": "python",
    "title": "Context Before the Match",
    "difficulty": "Medium",
    "topic": "Slicing",
    "statement": "A log viewer shows the lines leading up to a match. Return up to `k` items that come immediately before position `index` in `lines`, in their original order. If fewer than `k` items exist before `index`, return just those (possibly none). `index` is between 0 and len(lines) inclusive and `k` is zero or more. For lines [\"a\", \"b\", \"c\", \"d\", \"e\"], index 1 and k 3, only \"a\" comes before, so the answer is [\"a\"], but the code returns [].",
    "functionName": "context_before",
    "functionSignature": "def context_before(lines: list[str], index: int, k: int) -> list[str]:",
    "buggyCode": "def context_before(lines: list[str], index: int, k: int) -> list[str]:\n    return lines[index - k:index]\n",
    "hint": "What does a negative start index mean in a slice? Work out index - k for the failing example.",
    "explanation": "Slices never raise for out-of-range bounds, which makes them feel safe, but a negative bound is not \"before the start\": it counts from the end. With index 1 and k 3 the slice is lines[-2:1], which starts at the second-to-last item and stops at position 1, so it is empty (and with other values it can return items from the wrong part of the list). The start has to be clamped: lines[max(0, index - k):index]. Slicing lines[:index] first and then taking [-k:] also works, but it needs its own guard because [-0:] is the whole list, not an empty one. The clamp version is O(k) and has no special cases.",
    "examples": [
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          1,
          3
        ],
        "expected": [
          "a"
        ]
      },
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          4,
          2
        ],
        "expected": [
          "c",
          "d"
        ]
      },
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          3,
          3
        ],
        "expected": [
          "a",
          "b",
          "c"
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          0,
          2
        ],
        "expected": []
      },
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          5,
          2
        ],
        "expected": [
          "d",
          "e"
        ]
      },
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          2,
          0
        ],
        "expected": []
      },
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          2,
          4
        ],
        "expected": [
          "a",
          "b"
        ]
      },
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ],
          4,
          5
        ],
        "expected": [
          "a",
          "b",
          "c",
          "d"
        ]
      },
      {
        "input": [
          [
            "x"
          ],
          1,
          10
        ],
        "expected": [
          "x"
        ]
      },
      {
        "input": [
          [],
          0,
          3
        ],
        "expected": []
      },
      {
        "input": [
          [
            "p",
            "q",
            "r",
            "s"
          ],
          3,
          4
        ],
        "expected": [
          "p",
          "q",
          "r"
        ]
      }
    ]
  },
  {
    "id": "py-sort-ignores-case",
    "number": 108,
    "language": "python",
    "title": "Uppercase Sorts First",
    "difficulty": "Easy",
    "topic": "Sort Keys",
    "statement": "Return the names in alphabetical order ignoring upper/lower case, as a new list. Each name keeps its original spelling, and names that differ only by case stay in the order they were given. For [\"bob\", \"Alice\", \"carol\", \"Dave\"] the answer is [\"Alice\", \"bob\", \"carol\", \"Dave\"], but the code puts every capitalised name ahead of the lowercase ones.",
    "functionName": "sort_names",
    "functionSignature": "def sort_names(names: list[str]) -> list[str]:",
    "buggyCode": "def sort_names(names: list[str]) -> list[str]:\n    return sorted(names)\n",
    "hint": "Strings compare by character code. Where do \"A\" to \"Z\" sit relative to \"a\" to \"z\"?",
    "explanation": "String comparison goes character by character using code points, and every uppercase ASCII letter (65 to 90) comes before every lowercase one (97 to 122). So \"Dave\" < \"bob\" and a plain sorted() groups all capitalised names first. The key= argument fixes this without changing the data: sorted(names, key=str.lower) compares the lowercased form but returns the original strings. Lowercasing the names before sorting would get the order right and the spelling wrong. Because Python's sort is stable, names whose keys are equal (\"al\" and \"AL\") keep their input order automatically, which is the tie rule the task asks for; adding the original string as a second key would break that. str.casefold is the more thorough choice for non-English text. The sort is O(n log n) and the key function is called once per element.",
    "examples": [
      {
        "input": [
          [
            "bob",
            "Alice",
            "carol",
            "Dave"
          ]
        ],
        "expected": [
          "Alice",
          "bob",
          "carol",
          "Dave"
        ]
      },
      {
        "input": [
          [
            "b",
            "B",
            "a"
          ]
        ],
        "expected": [
          "a",
          "b",
          "B"
        ]
      },
      {
        "input": [
          [
            "Zed",
            "amy"
          ]
        ],
        "expected": [
          "amy",
          "Zed"
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          []
        ],
        "expected": []
      },
      {
        "input": [
          [
            "al",
            "AL",
            "Al",
            "aL"
          ]
        ],
        "expected": [
          "al",
          "AL",
          "Al",
          "aL"
        ]
      },
      {
        "input": [
          [
            "delta",
            "Charlie",
            "bravo",
            "Alpha"
          ]
        ],
        "expected": [
          "Alpha",
          "bravo",
          "Charlie",
          "delta"
        ]
      },
      {
        "input": [
          [
            "x"
          ]
        ],
        "expected": [
          "x"
        ]
      },
      {
        "input": [
          [
            "Mia",
            "mia",
            "MIA",
            "Lee",
            "lee"
          ]
        ],
        "expected": [
          "Lee",
          "lee",
          "Mia",
          "mia",
          "MIA"
        ]
      },
      {
        "input": [
          [
            "apple",
            "Banana",
            "APPLE",
            "banana",
            "cherry"
          ]
        ],
        "expected": [
          "apple",
          "APPLE",
          "Banana",
          "banana",
          "cherry"
        ]
      }
    ]
  },
  {
    "id": "py-defaultdict-lookup-inserts",
    "number": 109,
    "language": "python",
    "title": "Looking Creates Keys",
    "difficulty": "Medium",
    "topic": "Dictionaries",
    "statement": "Return a two-item list [counts, missing]. `counts` is a dict mapping each word that occurs in `words` to how many times it occurs; it must contain only words that actually occur. `missing` lists the entries of `watch` that never occur in `words`, in `watch` order (`watch` has no duplicates). For words [\"a\", \"b\", \"a\"] and watch [\"b\", \"z\"] the answer is [{\"a\": 2, \"b\": 1}, [\"z\"]], but the returned counts also contain \"z\": 0.",
    "functionName": "audit_words",
    "functionSignature": "def audit_words(words: list[str], watch: list[str]) -> list:",
    "buggyCode": "from collections import defaultdict\n\ndef audit_words(words: list[str], watch: list[str]) -> list:\n    counts = defaultdict(int)\n    for word in words:\n        counts[word] += 1\n    missing = [w for w in watch if counts[w] == 0]\n    return [dict(counts), missing]\n",
    "hint": "Reading counts[w] on a defaultdict is not a pure read when w is absent. What does the dict look like afterwards?",
    "explanation": "A defaultdict calls its factory and STORES the result whenever a missing key is read with square brackets. That is what makes counts[word] += 1 work without a setup step, but it also means the innocent-looking test counts[w] == 0 inserts w with the value 0. The check itself gives the right answer; the damage is the side effect, which shows up later as phantom zero entries in the result (and, in real code, as a dict that grows with every lookup). Ask about membership without triggering the factory: \"w not in counts\" or counts.get(w, 0) never insert. Counter is the better tool for counting anyway: it also returns 0 for a missing key, but without storing it. Everything is O(len(words) + len(watch)).",
    "examples": [
      {
        "input": [
          [
            "a",
            "b",
            "a"
          ],
          [
            "b",
            "z"
          ]
        ],
        "expected": [
          {
            "a": 2,
            "b": 1
          },
          [
            "z"
          ]
        ]
      },
      {
        "input": [
          [
            "x"
          ],
          [
            "x"
          ]
        ],
        "expected": [
          {
            "x": 1
          },
          []
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          [],
          [
            "q",
            "r"
          ]
        ],
        "expected": [
          {},
          [
            "q",
            "r"
          ]
        ]
      },
      {
        "input": [
          [
            "m",
            "m",
            "m"
          ],
          []
        ],
        "expected": [
          {
            "m": 3
          },
          []
        ]
      },
      {
        "input": [
          [
            "red",
            "blue",
            "red",
            "green"
          ],
          [
            "green",
            "pink",
            "red",
            "teal"
          ]
        ],
        "expected": [
          {
            "red": 2,
            "blue": 1,
            "green": 1
          },
          [
            "pink",
            "teal"
          ]
        ]
      },
      {
        "input": [
          [
            "k"
          ],
          [
            "j"
          ]
        ],
        "expected": [
          {
            "k": 1
          },
          [
            "j"
          ]
        ]
      },
      {
        "input": [
          [
            "a",
            "b"
          ],
          [
            "a",
            "b"
          ]
        ],
        "expected": [
          {
            "a": 1,
            "b": 1
          },
          []
        ]
      }
    ]
  },
  {
    "id": "py-counter-subtract-drops",
    "number": 110,
    "language": "python",
    "title": "Sold-Out Items Vanish",
    "difficulty": "Medium",
    "topic": "Counting",
    "statement": "`stock` maps each item to the number of units on the shelf, and `sold` has one entry per unit sold (every sold item is a key of `stock`). Return a dict with every item from `stock` and the units left. An item that sold out stays in the result with 0, and an item that sold more than was on the shelf goes negative (a backorder). For stock {\"pen\": 2, \"ink\": 1} and sold [\"ink\", \"pen\"] the answer is {\"pen\": 1, \"ink\": 0}, but \"ink\" is missing from the result.",
    "functionName": "remaining_stock",
    "functionSignature": "def remaining_stock(stock: dict, sold: list[str]) -> dict:",
    "buggyCode": "from collections import Counter\n\ndef remaining_stock(stock: dict, sold: list[str]) -> dict:\n    left = Counter(stock) - Counter(sold)\n    return dict(left)\n",
    "hint": "Counter has two ways to take counts away: the - operator and the .subtract() method. They treat zero and negative results differently.",
    "explanation": "Counter's arithmetic operators (+, -, &, |) are multiset operations, and a multiset cannot hold zero or negative counts, so they silently drop every entry whose result is 0 or less. That is right for \"which items are left over\" and wrong for an inventory, where 0 and -2 are meaningful values. The .subtract() method is the plain arithmetic version: it updates the counter in place and keeps zeros and negatives. Putting the dropped keys back with 0 is not enough, because it also turns backorders into 0. A plain dict copy with one decrement per sale is just as good and makes the intent obvious. Either way the cost is O(len(stock) + len(sold)).",
    "examples": [
      {
        "input": [
          {
            "pen": 2,
            "ink": 1
          },
          [
            "ink",
            "pen"
          ]
        ],
        "expected": {
          "pen": 1,
          "ink": 0
        }
      },
      {
        "input": [
          {
            "cup": 1
          },
          [
            "cup",
            "cup",
            "cup"
          ]
        ],
        "expected": {
          "cup": -2
        }
      },
      {
        "input": [
          {
            "a": 5,
            "b": 3
          },
          [
            "a",
            "a"
          ]
        ],
        "expected": {
          "a": 3,
          "b": 3
        }
      }
    ],
    "hiddenTests": [
      {
        "input": [
          {
            "x": 0
          },
          []
        ],
        "expected": {
          "x": 0
        }
      },
      {
        "input": [
          {},
          []
        ],
        "expected": {}
      },
      {
        "input": [
          {
            "nut": 3,
            "bolt": 3,
            "gear": 1
          },
          [
            "nut",
            "bolt",
            "nut",
            "nut",
            "gear",
            "gear"
          ]
        ],
        "expected": {
          "nut": 0,
          "bolt": 2,
          "gear": -1
        }
      },
      {
        "input": [
          {
            "tea": 4
          },
          [
            "tea",
            "tea",
            "tea",
            "tea"
          ]
        ],
        "expected": {
          "tea": 0
        }
      },
      {
        "input": [
          {
            "m": 1,
            "n": 0
          },
          [
            "n"
          ]
        ],
        "expected": {
          "m": 1,
          "n": -1
        }
      }
    ]
  },
  {
    "id": "py-backtracking-aliased-path",
    "number": 111,
    "language": "python",
    "title": "Every Combination Comes Back Empty",
    "difficulty": "Hard",
    "topic": "Recursion",
    "statement": "Return every way to pick exactly `k` of the given distinct items. Inside a combination the items keep their original relative order, and the combinations are listed in the order a left-to-right search finds them: all combinations that start with the first item come first, then those that start with the second, and so on (the same rule applies to the second pick, etc.). For [\"a\", \"b\", \"c\"] and k = 2 the answer is [[\"a\", \"b\"], [\"a\", \"c\"], [\"b\", \"c\"]]. k = 0 gives [[]] and k larger than the number of items gives []. The code finds the right number of combinations, but every one of them comes back as an empty list.",
    "functionName": "choose",
    "functionSignature": "def choose(items: list[str], k: int) -> list[list[str]]:",
    "buggyCode": "def choose(items: list[str], k: int) -> list[list[str]]:\n    result = []\n    current = []\n\n    def walk(start: int) -> None:\n        if len(current) == k:\n            result.append(current)\n            return\n        for i in range(start, len(items)):\n            current.append(items[i])\n            walk(i + 1)\n            current.pop()\n\n    walk(0)\n    return result\n",
    "hint": "How many different list objects does result hold when the search finishes? Check with id().",
    "explanation": "Backtracking reuses one working list: append a choice, recurse, pop it off again. result.append(current) does not store the contents of that list at that moment; it stores a reference to the list itself. Every entry in result is therefore the same object, and by the time the search has unwound, every append has been matched by a pop, so that one shared list is empty and the answer is the right number of empty lists. The pops are correct and must stay: they are what lets the next branch start clean. What has to change is what gets saved: a snapshot, result.append(current[:]) (or list(current), or tuple(current)). The same rule applies whenever a mutable accumulator is stored and then kept in use. There are C(n, k) combinations and each snapshot costs O(k), so the total is O(k * C(n, k)); itertools.combinations yields them in this same order.",
    "examples": [
      {
        "input": [
          [
            "a",
            "b",
            "c"
          ],
          2
        ],
        "expected": [
          [
            "a",
            "b"
          ],
          [
            "a",
            "c"
          ],
          [
            "b",
            "c"
          ]
        ]
      },
      {
        "input": [
          [
            "x",
            "y"
          ],
          1
        ],
        "expected": [
          [
            "x"
          ],
          [
            "y"
          ]
        ]
      },
      {
        "input": [
          [
            "p",
            "q",
            "r",
            "s"
          ],
          3
        ],
        "expected": [
          [
            "p",
            "q",
            "r"
          ],
          [
            "p",
            "q",
            "s"
          ],
          [
            "p",
            "r",
            "s"
          ],
          [
            "q",
            "r",
            "s"
          ]
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          [
            "a",
            "b",
            "c"
          ],
          0
        ],
        "expected": [
          []
        ]
      },
      {
        "input": [
          [
            "a",
            "b"
          ],
          3
        ],
        "expected": []
      },
      {
        "input": [
          [
            "a",
            "b",
            "c"
          ],
          3
        ],
        "expected": [
          [
            "a",
            "b",
            "c"
          ]
        ]
      },
      {
        "input": [
          [],
          0
        ],
        "expected": [
          []
        ]
      },
      {
        "input": [
          [
            "w",
            "x",
            "y",
            "z"
          ],
          2
        ],
        "expected": [
          [
            "w",
            "x"
          ],
          [
            "w",
            "y"
          ],
          [
            "w",
            "z"
          ],
          [
            "x",
            "y"
          ],
          [
            "x",
            "z"
          ],
          [
            "y",
            "z"
          ]
        ]
      },
      {
        "input": [
          [
            "m"
          ],
          1
        ],
        "expected": [
          [
            "m"
          ]
        ]
      },
      {
        "input": [
          [
            "e",
            "d",
            "c",
            "b",
            "a"
          ],
          4
        ],
        "expected": [
          [
            "e",
            "d",
            "c",
            "b"
          ],
          [
            "e",
            "d",
            "c",
            "a"
          ],
          [
            "e",
            "d",
            "b",
            "a"
          ],
          [
            "e",
            "c",
            "b",
            "a"
          ],
          [
            "d",
            "c",
            "b",
            "a"
          ]
        ]
      }
    ]
  },
  {
    "id": "py-page-count-ceiling",
    "number": 112,
    "language": "python",
    "title": "The Last Page Goes Missing",
    "difficulty": "Easy",
    "topic": "Arithmetic",
    "statement": "Return how many pages are needed to show `total_items` results at `per_page` results per page (per_page is at least 1). A final page that is only partly full still counts as a page, and zero items need zero pages. 21 items at 10 per page need 3 pages, but the code returns 2.",
    "functionName": "page_count",
    "functionSignature": "def page_count(total_items: int, per_page: int) -> int:",
    "buggyCode": "def page_count(total_items: int, per_page: int) -> int:\n    return total_items // per_page\n",
    "hint": "// throws the remainder away. What should happen to the items that are left over after the last full page?",
    "explanation": "Floor division answers \"how many FULL pages are there\", so any leftover items are dropped and the last, partly filled page is never counted. Page counts need the ceiling of the division. Always adding 1 over-corrects: it is wrong exactly when the items divide evenly (20 items at 10 per page would become 3) and it invents a page for zero items. Rounding to nearest is wrong as well, since 21 / 10 rounds down. The usual integer idiom is (total + per_page - 1) // per_page, which bumps the total past the next multiple only when there is a remainder; -(-total // per_page) and math.ceil(total / per_page) are equivalent for sizes like these, and divmod with an \"if leftover\" check spells the logic out. All are O(1).",
    "examples": [
      {
        "input": [
          21,
          10
        ],
        "expected": 3
      },
      {
        "input": [
          20,
          10
        ],
        "expected": 2
      },
      {
        "input": [
          5,
          10
        ],
        "expected": 1
      }
    ],
    "hiddenTests": [
      {
        "input": [
          0,
          10
        ],
        "expected": 0
      },
      {
        "input": [
          1,
          1
        ],
        "expected": 1
      },
      {
        "input": [
          10,
          3
        ],
        "expected": 4
      },
      {
        "input": [
          9,
          3
        ],
        "expected": 3
      },
      {
        "input": [
          100,
          7
        ],
        "expected": 15
      },
      {
        "input": [
          99,
          100
        ],
        "expected": 1
      },
      {
        "input": [
          15,
          10
        ],
        "expected": 2
      },
      {
        "input": [
          14,
          10
        ],
        "expected": 2
      }
    ]
  },
  {
    "id": "py-timedelta-seconds-drops-days",
    "number": 113,
    "language": "python",
    "title": "Long Shifts Come Up Short",
    "difficulty": "Medium",
    "topic": "Dates",
    "statement": "Return the number of hours between two timestamps as a float. Both are ISO-8601 strings without a time zone (like \"2024-03-01T08:00:00\") and `end` is never earlier than `start`. From \"2024-03-01T08:00:00\" to \"2024-03-02T10:30:00\" is 26.5 hours, but the code returns 2.5.",
    "functionName": "hours_between",
    "functionSignature": "def hours_between(start: str, end: str) -> float:",
    "buggyCode": "from datetime import datetime\n\ndef hours_between(start: str, end: str) -> float:\n    elapsed = datetime.fromisoformat(end) - datetime.fromisoformat(start)\n    return elapsed.seconds / 3600\n",
    "hint": "A timedelta stores days, seconds and microseconds as three separate fields. Which of them does .seconds give you?",
    "explanation": "Subtracting two datetimes gives a timedelta, which is stored as three normalised fields: days, seconds (0 to 86399) and microseconds. The .seconds attribute is only the middle field, the part of the duration left over after whole days are removed, so anything of 24 hours or more loses its days and a 26.5 hour gap reads as 2.5. Nothing fails; short durations are simply correct and long ones are not, which is why this bug usually reaches production. Use elapsed.total_seconds(), which folds all three fields into one number, or divide by a unit: elapsed / timedelta(hours=1). Rebuilding the answer from calendar fields such as day and hour breaks at month boundaries and is never worth it. The work is O(1).",
    "examples": [
      {
        "input": [
          "2024-03-01T08:00:00",
          "2024-03-02T10:30:00"
        ],
        "expected": 26.5
      },
      {
        "input": [
          "2024-03-01T08:00:00",
          "2024-03-01T17:15:00"
        ],
        "expected": 9.25
      },
      {
        "input": [
          "2024-01-31T22:00:00",
          "2024-02-02T22:00:00"
        ],
        "expected": 48.0
      }
    ],
    "hiddenTests": [
      {
        "input": [
          "2024-05-05T05:05:05",
          "2024-05-05T05:05:05"
        ],
        "expected": 0.0
      },
      {
        "input": [
          "2024-02-28T12:00:00",
          "2024-03-01T12:00:00"
        ],
        "expected": 48.0
      },
      {
        "input": [
          "2023-12-31T23:30:00",
          "2024-01-01T00:15:00"
        ],
        "expected": 0.75
      },
      {
        "input": [
          "2024-06-01T00:00:00",
          "2024-06-08T06:45:00"
        ],
        "expected": 174.75
      },
      {
        "input": [
          "2024-06-01T09:00:00",
          "2024-06-01T09:20:00"
        ],
        "expected": 0.3333333333333333
      }
    ]
  },
  {
    "id": "py-regex-greedy-quotes",
    "number": 114,
    "language": "python",
    "title": "One Giant Quote",
    "difficulty": "Medium",
    "topic": "Regex",
    "statement": "Return the text found inside each pair of double quotes, in order of appearance, without the quote marks. The input is a single line, quote marks always come in pairs, and there is no escaping; an empty pair \"\" contributes an empty string, and a line with no quotes gives an empty list. For the line: say \"hi\" then \"bye\" the answer is [\"hi\", \"bye\"], but the code returns one long string, [\"hi\\\" then \\\"bye\"].",
    "functionName": "quoted",
    "functionSignature": "def quoted(text: str) -> list[str]:",
    "buggyCode": "import re\n\ndef quoted(text: str) -> list[str]:\n    return re.findall(r'\"(.*)\"', text)\n",
    "hint": "By default * takes as much as it can and only gives characters back if the rest of the pattern fails. Where is the last quote mark on the line?",
    "explanation": "Regex quantifiers are greedy: .* first runs to the end of the line, then backs up one character at a time until the closing quote in the pattern can match. The first place that works is the LAST quote mark on the line, so everything between the first and last quote is captured as one match. Two standard fixes exist. Make the quantifier lazy with .*?, which grows the match one character at a time and stops at the first closing quote. Or say what you actually mean and exclude the delimiter: \"([^\"]*)\" cannot run past a quote at all, and it is usually faster because it never backtracks. Keep * rather than +, otherwise an empty pair \"\" is skipped and the quotes pair up wrongly from then on. Splitting on the quote mark and taking every second piece is a regex-free alternative. All are O(n).",
    "examples": [
      {
        "input": [
          "say \"hi\" then \"bye\""
        ],
        "expected": [
          "hi",
          "bye"
        ]
      },
      {
        "input": [
          "a \"\" b \"x\""
        ],
        "expected": [
          "",
          "x"
        ]
      },
      {
        "input": [
          "no quotes here"
        ],
        "expected": []
      }
    ],
    "hiddenTests": [
      {
        "input": [
          "\"only\""
        ],
        "expected": [
          "only"
        ]
      },
      {
        "input": [
          "\"a b, c!\" and \"d-e\" and \"f\""
        ],
        "expected": [
          "a b, c!",
          "d-e",
          "f"
        ]
      },
      {
        "input": [
          ""
        ],
        "expected": []
      },
      {
        "input": [
          "\"\""
        ],
        "expected": [
          ""
        ]
      },
      {
        "input": [
          "x \"1\" y \"\" z \"2 3\""
        ],
        "expected": [
          "1",
          "",
          "2 3"
        ]
      },
      {
        "input": [
          "\"one\"\"two\""
        ],
        "expected": [
          "one",
          "two"
        ]
      }
    ]
  },
  {
    "id": "py-regex-unescaped-token",
    "number": 115,
    "language": "python",
    "title": "Dots Match Anything",
    "difficulty": "Medium",
    "topic": "Regex",
    "statement": "Count how many times `token` occurs in `text`, matching the token literally (character for character) but ignoring upper/lower case. Occurrences are counted left to right without overlapping, and `token` is never empty. For the text \"v1.2 and v1x2\" and the token \"1.2\" the answer is 1, but the code counts 2; for the token \"c++\" it crashes.",
    "functionName": "count_token",
    "functionSignature": "def count_token(text: str, token: str) -> int:",
    "buggyCode": "import re\n\ndef count_token(text: str, token: str) -> int:\n    return len(re.findall(token, text, re.IGNORECASE))\n",
    "hint": "The token is being used as a pattern. Which characters in \"1.2\" or \"c++\" mean something special to the regex engine?",
    "explanation": "Passing a plain string to re.findall makes it a pattern, and many ordinary characters are operators there: \".\" matches any character, \"+\" and \"*\" repeat the previous item, \"(\" opens a group, \"[\" opens a set, \"$\" anchors. So \"1.2\" also matches \"1x2\", and \"c++\" is not even a valid pattern (a repeat of a repeat). When the string comes from a user or a config file this is also a security issue, because a crafted pattern can make matching extremely slow. Any text that should be matched literally must go through re.escape, which backslash-escapes every special character. Escaping only the dot fixes the first example and leaves every other metacharacter broken. If no regex feature is needed, skip the regex: text.lower().count(token.lower()) counts non-overlapping literal occurrences directly. Both are O(n * m) in the worst case.",
    "examples": [
      {
        "input": [
          "v1.2 and v1x2",
          "1.2"
        ],
        "expected": 1
      },
      {
        "input": [
          "C++ and c++ beat c",
          "c++"
        ],
        "expected": 2
      },
      {
        "input": [
          "Hello hello HELLO",
          "hello"
        ],
        "expected": 3
      }
    ],
    "hiddenTests": [
      {
        "input": [
          "a(b) a(b)",
          "a(b)"
        ],
        "expected": 2
      },
      {
        "input": [
          "what? what!",
          "what?"
        ],
        "expected": 1
      },
      {
        "input": [
          "aaaa",
          "aa"
        ],
        "expected": 2
      },
      {
        "input": [
          "price $5 or $50",
          "$5"
        ],
        "expected": 2
      },
      {
        "input": [
          "nothing here",
          "xyz"
        ],
        "expected": 0
      },
      {
        "input": [
          "[x] [X] x",
          "[x]"
        ],
        "expected": 2
      },
      {
        "input": [
          "a*b ab aab",
          "a*b"
        ],
        "expected": 1
      },
      {
        "input": [
          "",
          "q"
        ],
        "expected": 0
      }
    ]
  },
  {
    "id": "py-conditional-expression-precedence",
    "number": 116,
    "language": "python",
    "title": "The Bonus Swallows the Salary",
    "difficulty": "Medium",
    "topic": "Operators",
    "statement": "Return an employee's pay for the month: the base salary, plus the bonus only when the employee is eligible for it. An employee who is not eligible still receives the full base salary. For base 3000, bonus 500 and eligible False the answer is 3000, but the code returns 0.",
    "functionName": "monthly_pay",
    "functionSignature": "def monthly_pay(base: int, bonus: int, eligible: bool) -> int:",
    "buggyCode": "def monthly_pay(base: int, bonus: int, eligible: bool) -> int:\n    return base + bonus if eligible else 0\n",
    "hint": "Add parentheses to show how Python groups \"base + bonus if eligible else 0\". Which binds tighter, + or if/else?",
    "explanation": "The conditional expression \"x if cond else y\" has almost the lowest precedence in Python, lower than every arithmetic and comparison operator. So base + bonus if eligible else 0 is grouped as (base + bonus) if eligible else 0: the whole sum is one branch and a bare 0 is the other, and an ineligible employee is paid nothing. The author meant the choice to apply to the bonus alone, which needs explicit parentheses: base + (bonus if eligible else 0). A plain if statement that adds the bonus to a running total says the same thing with no precedence to remember. The general habit: whenever a conditional expression is part of a larger expression, parenthesise it.",
    "examples": [
      {
        "input": [
          3000,
          500,
          false
        ],
        "expected": 3000
      },
      {
        "input": [
          3000,
          500,
          true
        ],
        "expected": 3500
      },
      {
        "input": [
          1200,
          0,
          false
        ],
        "expected": 1200
      }
    ],
    "hiddenTests": [
      {
        "input": [
          0,
          250,
          true
        ],
        "expected": 250
      },
      {
        "input": [
          0,
          250,
          false
        ],
        "expected": 0
      },
      {
        "input": [
          4100,
          900,
          true
        ],
        "expected": 5000
      },
      {
        "input": [
          1,
          1,
          false
        ],
        "expected": 1
      },
      {
        "input": [
          2500,
          0,
          true
        ],
        "expected": 2500
      }
    ]
  },
  {
    "id": "py-find-minus-one-truthy",
    "number": 117,
    "language": "python",
    "title": "Missing Marker Looks Found",
    "difficulty": "Easy",
    "topic": "Strings",
    "statement": "Return everything in `text` that comes after the first occurrence of `marker` (a non-empty string). If the marker does not occur at all, return an empty string. For \"id=42\" with marker \"id=\" the answer is \"42\", but the code returns \"\"; for \"hello\" with marker \"=\" the answer is \"\", but the code returns \"hello\".",
    "functionName": "after_marker",
    "functionSignature": "def after_marker(text: str, marker: str) -> str:",
    "buggyCode": "def after_marker(text: str, marker: str) -> str:\n    pos = text.find(marker)\n    if not pos:\n        return \"\"\n    return text[pos + len(marker):]\n",
    "hint": "str.find returns an index. Which index is falsy, and what does find return when there is no match?",
    "explanation": "str.find returns the index of the first match, or -1 when there is none. Neither value plays well with a truthiness test: a match at the very start is index 0, which is falsy, and \"not found\" is -1, which is truthy. So \"if not pos\" gets both ends wrong: a marker at position 0 is treated as missing, and a missing marker is treated as found, after which the slice starts from -1 + len(marker) and returns leftover text. Compare with the sentinel explicitly: if pos == -1. Often a better tool avoids the index altogether: \"marker in text\" for a yes/no question, or text.partition(marker), which returns (before, marker, after) and gives an empty \"after\" when the marker is absent. Everything here is O(n).",
    "examples": [
      {
        "input": [
          "id=42",
          "id="
        ],
        "expected": "42"
      },
      {
        "input": [
          "hello",
          "="
        ],
        "expected": ""
      },
      {
        "input": [
          "name: Ada",
          ": "
        ],
        "expected": "Ada"
      }
    ],
    "hiddenTests": [
      {
        "input": [
          "a=b=c",
          "="
        ],
        "expected": "b=c"
      },
      {
        "input": [
          "key=",
          "="
        ],
        "expected": ""
      },
      {
        "input": [
          "",
          "x"
        ],
        "expected": ""
      },
      {
        "input": [
          "xx",
          "x"
        ],
        "expected": "x"
      },
      {
        "input": [
          "path/to/file",
          "/"
        ],
        "expected": "to/file"
      },
      {
        "input": [
          "abc",
          "abcd"
        ],
        "expected": ""
      },
      {
        "input": [
          "=start",
          "="
        ],
        "expected": "start"
      }
    ]
  },
  {
    "id": "py-max-of-dict-keys",
    "number": 118,
    "language": "python",
    "title": "Best Seller by Name",
    "difficulty": "Easy",
    "topic": "Built-ins",
    "statement": "`sales` maps each product name to the number of units sold and is never empty. Return the name of the product with the most units sold. If several products tie for the most, return the one that appears first in the dict. For {\"pear\": 3, \"apple\": 9, \"kiwi\": 2} the answer is \"apple\", but the code returns \"pear\".",
    "functionName": "best_seller",
    "functionSignature": "def best_seller(sales: dict) -> str:",
    "buggyCode": "def best_seller(sales: dict) -> str:\n    return max(sales)\n",
    "hint": "Iterating over a dict yields its keys. What is max() comparing here?",
    "explanation": "A dict iterates over its keys, so max(sales) compares the product NAMES and returns the alphabetically last one; the unit counts are never looked at. max(sales.values()) finds the right number but loses the name. What is needed is \"the key whose value is largest\", and max has a key= argument for exactly that: max(sales, key=sales.get) still walks the names but ranks each one by sales.get(name). When several items share the largest key, max returns the first one it met, and dicts iterate in insertion order, which gives the required tie rule for free. Sorting and taking the last element costs O(n log n) and returns the LAST of the tied names; max is a single O(n) pass.",
    "examples": [
      {
        "input": [
          {
            "pear": 3,
            "apple": 9,
            "kiwi": 2
          }
        ],
        "expected": "apple"
      },
      {
        "input": [
          {
            "tea": 5,
            "milk": 5,
            "jam": 1
          }
        ],
        "expected": "tea"
      },
      {
        "input": [
          {
            "zip": 1
          }
        ],
        "expected": "zip"
      }
    ],
    "hiddenTests": [
      {
        "input": [
          {
            "b": 2,
            "a": 2
          }
        ],
        "expected": "b"
      },
      {
        "input": [
          {
            "a": 2,
            "b": 2
          }
        ],
        "expected": "a"
      },
      {
        "input": [
          {
            "x": 0,
            "y": -1
          }
        ],
        "expected": "x"
      },
      {
        "input": [
          {
            "low": 1,
            "mid": 4,
            "top": 7
          }
        ],
        "expected": "top"
      },
      {
        "input": [
          {
            "zed": 3,
            "amy": 8,
            "bob": 8,
            "cat": 8
          }
        ],
        "expected": "amy"
      },
      {
        "input": [
          {
            "w": 10,
            "v": 9,
            "u": 10
          }
        ],
        "expected": "w"
      }
    ]
  },
  {
    "id": "py-lru-cache-mutable-result",
    "number": 119,
    "language": "python",
    "title": "Cached List Keeps Growing",
    "difficulty": "Hard",
    "topic": "Memoization",
    "statement": "Each member is a [role, extras] pair. A member's permissions are the base permissions of the role (\"admin\": read, write, delete; \"editor\": read, write; any other role: read) followed by that member's own extras, in the order given. Return one permission list per member, in input order. For [[\"editor\", [\"publish\"]], [\"editor\", []]] the answer is [[\"read\", \"write\", \"publish\"], [\"read\", \"write\"]], but the second editor also comes back with \"publish\".",
    "functionName": "member_permissions",
    "functionSignature": "def member_permissions(members: list[list]) -> list[list[str]]:",
    "buggyCode": "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef base_permissions(role: str) -> list[str]:\n    if role == \"admin\":\n        return [\"read\", \"write\", \"delete\"]\n    if role == \"editor\":\n        return [\"read\", \"write\"]\n    return [\"read\"]\n\ndef member_permissions(members: list[list]) -> list[list[str]]:\n    result = []\n    for role, extras in members:\n        perms = base_permissions(role)\n        perms.extend(extras)\n        result.append(perms)\n    return result\n",
    "hint": "lru_cache returns the very same object on every hit. What happens to the cached value when a caller changes that object?",
    "explanation": "A cache stores the object a function returned and hands that same object back on every later call with the same arguments. base_permissions builds a fresh list only on the first call per role; after that, every caller receives a reference to the one list sitting in the cache. extend (and +=, which is the same in-place operation for lists) therefore edits the cached value, so each member's extras are permanently added to the role, both for later members in this call and for every later call in the program. The rule is that a cached value must never be mutated. Either make a new list at the call site, base_permissions(role) + extras or list(base_permissions(role)), or better, make the cached value immutable by returning a tuple so the mistake cannot be made. Clearing the cache at the top of the function only hides the leak between calls; two members with the same role in one call still share a list. Removing the cache works too, at the cost of recomputing. The work is O(total permissions).",
    "examples": [
      {
        "input": [
          [
            [
              "editor",
              [
                "publish"
              ]
            ],
            [
              "editor",
              []
            ]
          ]
        ],
        "expected": [
          [
            "read",
            "write",
            "publish"
          ],
          [
            "read",
            "write"
          ]
        ]
      },
      {
        "input": [
          [
            [
              "admin",
              []
            ],
            [
              "viewer",
              [
                "comment"
              ]
            ]
          ]
        ],
        "expected": [
          [
            "read",
            "write",
            "delete"
          ],
          [
            "read",
            "comment"
          ]
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          [
            [
              "viewer",
              []
            ],
            [
              "viewer",
              [
                "export"
              ]
            ],
            [
              "viewer",
              []
            ]
          ]
        ],
        "expected": [
          [
            "read"
          ],
          [
            "read",
            "export"
          ],
          [
            "read"
          ]
        ]
      },
      {
        "input": [
          []
        ],
        "expected": []
      },
      {
        "input": [
          [
            [
              "admin",
              [
                "audit"
              ]
            ],
            [
              "editor",
              [
                "publish"
              ]
            ],
            [
              "admin",
              [
                "billing"
              ]
            ]
          ]
        ],
        "expected": [
          [
            "read",
            "write",
            "delete",
            "audit"
          ],
          [
            "read",
            "write",
            "publish"
          ],
          [
            "read",
            "write",
            "delete",
            "billing"
          ]
        ]
      },
      {
        "input": [
          [
            [
              "editor",
              []
            ]
          ]
        ],
        "expected": [
          [
            "read",
            "write"
          ]
        ]
      },
      {
        "input": [
          [
            [
              "guest",
              [
                "a",
                "b"
              ]
            ],
            [
              "guest",
              [
                "c"
              ]
            ],
            [
              "editor",
              []
            ],
            [
              "admin",
              []
            ]
          ]
        ],
        "expected": [
          [
            "read",
            "a",
            "b"
          ],
          [
            "read",
            "c"
          ],
          [
            "read",
            "write"
          ],
          [
            "read",
            "write",
            "delete"
          ]
        ]
      }
    ]
  },
  {
    "id": "py-filter-always-truthy",
    "number": 120,
    "language": "python",
    "title": "The Empty Filter Is Truthy",
    "difficulty": "Medium",
    "topic": "Generators",
    "statement": "Given the HTTP status codes from a batch of requests, return the string \"ok\" when none of them is a server error (500 or above). Otherwise return the server-error codes, in their original order and including repeats, joined with \", \". For [200, 404] the answer is \"ok\", but the code returns an empty string.",
    "functionName": "server_errors",
    "functionSignature": "def server_errors(codes: list[int]) -> str:",
    "buggyCode": "def server_errors(codes: list[int]) -> str:\n    bad = filter(lambda code: code >= 500, codes)\n    if not bad:\n        return \"ok\"\n    return \", \".join(str(code) for code in bad)\n",
    "hint": "Print bool(filter(None, [])). Does a filter object know whether it will produce anything?",
    "explanation": "In Python 3, filter (like map, zip and generator expressions) returns a lazy iterator, not a list. An iterator has no length and does not define truthiness, so it falls back to the default for objects: always True, even when it will produce nothing. \"if not bad\" can therefore never fire, and the function goes on to join zero items into an empty string. Testing with any(bad) is not a repair either: it has to pull items out of the iterator to look at them, and those items are gone when the join runs. If you need to ask \"is it empty\" and then use the items, materialise them once, with a list comprehension or list(filter(...)); a list is falsy exactly when it is empty. Alternatively build the joined string first and fall back with: text or \"ok\". One pass, O(n).",
    "examples": [
      {
        "input": [
          [
            200,
            404
          ]
        ],
        "expected": "ok"
      },
      {
        "input": [
          [
            200,
            503,
            404,
            500
          ]
        ],
        "expected": "503, 500"
      },
      {
        "input": [
          [
            502
          ]
        ],
        "expected": "502"
      }
    ],
    "hiddenTests": [
      {
        "input": [
          []
        ],
        "expected": "ok"
      },
      {
        "input": [
          [
            500,
            500
          ]
        ],
        "expected": "500, 500"
      },
      {
        "input": [
          [
            499,
            500,
            501
          ]
        ],
        "expected": "500, 501"
      },
      {
        "input": [
          [
            504,
            200,
            503,
            502
          ]
        ],
        "expected": "504, 503, 502"
      },
      {
        "input": [
          [
            301,
            302
          ]
        ],
        "expected": "ok"
      },
      {
        "input": [
          [
            599,
            503,
            599
          ]
        ],
        "expected": "599, 503, 599"
      }
    ]
  },
  {
    "id": "py-single-element-tuple",
    "number": 121,
    "language": "python",
    "title": "A Tuple of One",
    "difficulty": "Easy",
    "topic": "Types",
    "statement": "An exporter keeps its allowed formats in a constant; at the moment the only allowed format is \"json\". Return True when `fmt` is exactly one of the allowed formats and False otherwise. \"json\" is accepted correctly, but \"js\", \"son\" and even the empty string are accepted too.",
    "functionName": "is_supported",
    "functionSignature": "def is_supported(fmt: str) -> bool:",
    "buggyCode": "ALLOWED_FORMATS = (\"json\")\n\ndef is_supported(fmt: str) -> bool:\n    return fmt in ALLOWED_FORMATS\n",
    "hint": "Check type(ALLOWED_FORMATS). What makes something a tuple: the parentheses or something else?",
    "explanation": "Parentheses do not create a tuple; the comma does. (\"json\") is just the string \"json\" in grouping parentheses, the same as (2 + 3) is just 5. So ALLOWED_FORMATS is a string, and \"in\" on a string is a SUBSTRING test: \"js\", \"son\", \"o\" and \"\" are all inside \"json\". The bug typically appears when a longer tuple is trimmed down to one entry. A one-element tuple needs a trailing comma, (\"json\",), after which \"in\" compares whole elements. A list [\"json\"] or a set {\"json\"} avoids the trap entirely, since their brackets are unambiguous. Membership is O(number of formats) for a tuple or list and O(1) for a set.",
    "examples": [
      {
        "input": [
          "json"
        ],
        "expected": true
      },
      {
        "input": [
          "js"
        ],
        "expected": false
      },
      {
        "input": [
          "xml"
        ],
        "expected": false
      }
    ],
    "hiddenTests": [
      {
        "input": [
          ""
        ],
        "expected": false
      },
      {
        "input": [
          "son"
        ],
        "expected": false
      },
      {
        "input": [
          "jsonl"
        ],
        "expected": false
      },
      {
        "input": [
          "o"
        ],
        "expected": false
      },
      {
        "input": [
          "JSON"
        ],
        "expected": false
      },
      {
        "input": [
          "json "
        ],
        "expected": false
      }
    ]
  },
  {
    "id": "py-sequential-swap-gcd",
    "number": 122,
    "language": "python",
    "title": "Overwritten Before It Was Used",
    "difficulty": "Easy",
    "topic": "Loops",
    "statement": "A floor of `width` by `height` centimetres (both positive whole numbers) is to be covered with identical square tiles, with no cutting. Return the side length of the largest square tile that fits both dimensions exactly, i.e. the largest whole number that divides both `width` and `height`. For 12 and 18 the answer is 6, but the code returns 18.",
    "functionName": "shared_tile",
    "functionSignature": "def shared_tile(width: int, height: int) -> int:",
    "buggyCode": "def shared_tile(width: int, height: int) -> int:\n    a, b = width, height\n    while b != 0:\n        a = b\n        b = a % b\n    return a\n",
    "hint": "Trace one pass of the loop by hand for a = 12, b = 18. What is a when the second assignment runs?",
    "explanation": "The loop is the Euclidean algorithm: replace (a, b) with (b, a mod b) until b is 0, and a is then the greatest common divisor. Both new values must be computed from the OLD pair. Written as two statements, a = b runs first and destroys the old a, so b = a % b is really b % b, which is always 0; the loop stops after one pass and returns the original height. Swapping the two lines does not help, it just destroys the old b instead. Python's tuple assignment evaluates the whole right-hand side before storing anything, so a, b = b, a % b updates both from the old values; the alternative is to hold one of them in a temporary variable. The algorithm takes O(log min(a, b)) steps; math.gcd does the same job in the standard library.",
    "examples": [
      {
        "input": [
          12,
          18
        ],
        "expected": 6
      },
      {
        "input": [
          100,
          75
        ],
        "expected": 25
      },
      {
        "input": [
          7,
          7
        ],
        "expected": 7
      }
    ],
    "hiddenTests": [
      {
        "input": [
          1,
          9
        ],
        "expected": 1
      },
      {
        "input": [
          17,
          5
        ],
        "expected": 1
      },
      {
        "input": [
          48,
          36
        ],
        "expected": 12
      },
      {
        "input": [
          9,
          3
        ],
        "expected": 3
      },
      {
        "input": [
          3,
          9
        ],
        "expected": 3
      },
      {
        "input": [
          270,
          192
        ],
        "expected": 6
      },
      {
        "input": [
          10,
          4
        ],
        "expected": 2
      }
    ]
  },
  {
    "id": "py-caesar-no-wraparound",
    "number": 123,
    "language": "python",
    "title": "Shift Falls Off the Alphabet",
    "difficulty": "Medium",
    "topic": "Strings",
    "statement": "Shift every lowercase letter a to z in `text` forward by `k` places in the alphabet, wrapping around after z (so shifting \"y\" by 3 gives \"b\"). `k` is zero or more and may be larger than 26. Every other character (spaces, digits, punctuation, uppercase letters) is left unchanged. For \"xyz\" and k = 3 the answer is \"abc\", but the code returns \"{|}\".",
    "functionName": "shift_text",
    "functionSignature": "def shift_text(text: str, k: int) -> str:",
    "buggyCode": "def shift_text(text: str, k: int) -> str:\n    out = []\n    for ch in text:\n        if \"a\" <= ch <= \"z\":\n            out.append(chr(ord(ch) + k))\n        else:\n            out.append(ch)\n    return \"\".join(out)\n",
    "hint": "ord(\"z\") + 1 is not ord(\"a\"). The letters need to be treated as positions 0 to 25 before any wrap-around can happen.",
    "explanation": "Character codes are a straight line, not a circle: after \"z\" (122) come \"{\", \"|\" and \"}\", so adding k to the code runs off the end of the alphabet. Wrap-around is modular arithmetic, and the modulo only works on a range that starts at zero. Convert the letter to its position 0 to 25 with ord(ch) - ord(\"a\"), add k, reduce with % 26, then convert back by adding ord(\"a\"). Each of the three steps matters. Taking % 26 of the raw character code gives a meaningless position, because 97 is not a multiple of 26. Subtracting 26 once when the result passes \"z\" handles small shifts but not k of 27 or more applied to late letters, where the result is still past \"z\" after one subtraction. The work is O(n).",
    "examples": [
      {
        "input": [
          "xyz",
          3
        ],
        "expected": "abc"
      },
      {
        "input": [
          "hello, world",
          1
        ],
        "expected": "ifmmp, xpsme"
      },
      {
        "input": [
          "abc",
          26
        ],
        "expected": "abc"
      }
    ],
    "hiddenTests": [
      {
        "input": [
          "",
          5
        ],
        "expected": ""
      },
      {
        "input": [
          "a",
          53
        ],
        "expected": "b"
      },
      {
        "input": [
          "zebra-9 Zoo",
          30
        ],
        "expected": "difve-9 Zss"
      },
      {
        "input": [
          "az",
          0
        ],
        "expected": "az"
      },
      {
        "input": [
          "wxyz",
          52
        ],
        "expected": "wxyz"
      },
      {
        "input": [
          "m n o",
          13
        ],
        "expected": "z a b"
      },
      {
        "input": [
          "xyz",
          60
        ],
        "expected": "fgh"
      },
      {
        "input": [
          "Tea time!",
          7
        ],
        "expected": "Tlh aptl!"
      }
    ]
  },
  {
    "id": "py-class-counter-via-self",
    "number": 124,
    "language": "python",
    "title": "Every Ticket Is Number One",
    "difficulty": "Hard",
    "topic": "Classes",
    "statement": "Create one Ticket per name, in order. Tickets issued by a single call are numbered 1, 2, 3, ... in the order they are created, and the numbering starts again at 1 on every call. Return a [name, id] pair for each ticket. For [\"ann\", \"bob\", \"cy\"] the answer is [[\"ann\", 1], [\"bob\", 2], [\"cy\", 3]], but every ticket comes back with id 1.",
    "functionName": "issue_tickets",
    "functionSignature": "def issue_tickets(names: list[str]) -> list[list]:",
    "buggyCode": "class Ticket:\n    next_id = 1\n\n    def __init__(self, name: str):\n        self.name = name\n        self.id = self.next_id\n        self.next_id += 1\n\ndef issue_tickets(names: list[str]) -> list[list]:\n    Ticket.next_id = 1\n    tickets = [Ticket(name) for name in names]\n    return [[t.name, t.id] for t in tickets]\n",
    "hint": "self.next_id += 1 is a read followed by an assignment. Where does the read find next_id, and where does the assignment store it?",
    "explanation": "Attribute lookup and attribute assignment follow different rules. Reading self.next_id looks on the instance first and, finding nothing there, falls back to the class, so it sees Ticket.next_id. Assigning to self.next_id never falls back: it always creates or updates an attribute on that one instance. self.next_id += 1 does both in turn, so it reads 1 from the class and stores 2 on the new ticket, where nobody will ever look at it. The class attribute stays at 1 and every ticket gets id 1. State that is shared by all instances has to be written through the class: Ticket.next_id += 1 (or type(self).next_id += 1). The increment must also come after the id is taken, or numbering starts at 2. A design with no shared mutable state, such as passing the number in from enumerate(names, start=1) or drawing from itertools.count, avoids the question entirely. O(n) either way.",
    "examples": [
      {
        "input": [
          [
            "ann",
            "bob",
            "cy"
          ]
        ],
        "expected": [
          [
            "ann",
            1
          ],
          [
            "bob",
            2
          ],
          [
            "cy",
            3
          ]
        ]
      },
      {
        "input": [
          [
            "zed"
          ]
        ],
        "expected": [
          [
            "zed",
            1
          ]
        ]
      },
      {
        "input": [
          [
            "p",
            "q"
          ]
        ],
        "expected": [
          [
            "p",
            1
          ],
          [
            "q",
            2
          ]
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          []
        ],
        "expected": []
      },
      {
        "input": [
          [
            "a",
            "b",
            "c",
            "d",
            "e"
          ]
        ],
        "expected": [
          [
            "a",
            1
          ],
          [
            "b",
            2
          ],
          [
            "c",
            3
          ],
          [
            "d",
            4
          ],
          [
            "e",
            5
          ]
        ]
      },
      {
        "input": [
          [
            "same",
            "same"
          ]
        ],
        "expected": [
          [
            "same",
            1
          ],
          [
            "same",
            2
          ]
        ]
      },
      {
        "input": [
          [
            "solo"
          ]
        ],
        "expected": [
          [
            "solo",
            1
          ]
        ]
      },
      {
        "input": [
          [
            "x",
            "y",
            "z"
          ]
        ],
        "expected": [
          [
            "x",
            1
          ],
          [
            "y",
            2
          ],
          [
            "z",
            3
          ]
        ]
      }
    ]
  },
  {
    "id": "py-in-place-update-reads-new",
    "number": 125,
    "language": "python",
    "title": "Neighbours Already Changed",
    "difficulty": "Medium",
    "topic": "Lists",
    "statement": "`cells` is a row of 0s and 1s. Return the next generation of the row as a list of the same length: a cell becomes 1 when exactly one of its two neighbours (left and right) is 1 in the CURRENT row, and 0 otherwise. A position beyond either end of the row counts as a neighbour holding 0, and the cell's own value does not matter. Every cell must be decided from the current row, not from cells already updated. For [0, 1, 0] the answer is [1, 0, 1], but the code returns [1, 1, 1].",
    "functionName": "next_generation",
    "functionSignature": "def next_generation(cells: list[int]) -> list[int]:",
    "buggyCode": "def next_generation(cells: list[int]) -> list[int]:\n    n = len(cells)\n    for i in range(n):\n        left = cells[i - 1] if i > 0 else 0\n        right = cells[i + 1] if i < n - 1 else 0\n        cells[i] = 1 if left != right else 0\n    return cells\n",
    "hint": "When the loop reaches index 1, is cells[0] still the value from the current generation?",
    "explanation": "The rule defines the whole new row in terms of the old row, a simultaneous update. Writing each result straight back into cells breaks that: by the time the loop reaches index i, cells[i - 1] already holds the NEW value, so the \"left neighbour\" comes from the next generation while the \"right neighbour\" still comes from the current one. The first cell is right and the error spreads from there. Looping right to left only moves the problem to the other neighbour, and result = cells does not make a second list, just a second name for the same one. Read from the untouched input and write to a separate output list (or build it with a comprehension). The same care is needed in any simulation, image filter, or dynamic-programming row update where new values depend on old neighbours. Time and extra space are both O(n).",
    "examples": [
      {
        "input": [
          [
            0,
            1,
            0
          ]
        ],
        "expected": [
          1,
          0,
          1
        ]
      },
      {
        "input": [
          [
            1,
            1,
            0,
            1
          ]
        ],
        "expected": [
          1,
          1,
          0,
          0
        ]
      },
      {
        "input": [
          [
            0,
            0,
            0
          ]
        ],
        "expected": [
          0,
          0,
          0
        ]
      }
    ],
    "hiddenTests": [
      {
        "input": [
          []
        ],
        "expected": []
      },
      {
        "input": [
          [
            1
          ]
        ],
        "expected": [
          0
        ]
      },
      {
        "input": [
          [
            1,
            1
          ]
        ],
        "expected": [
          1,
          1
        ]
      },
      {
        "input": [
          [
            1,
            0,
            1
          ]
        ],
        "expected": [
          0,
          0,
          0
        ]
      },
      {
        "input": [
          [
            0,
            0,
            1,
            0,
            0
          ]
        ],
        "expected": [
          0,
          1,
          0,
          1,
          0
        ]
      },
      {
        "input": [
          [
            1,
            1,
            1,
            1,
            1
          ]
        ],
        "expected": [
          1,
          0,
          0,
          0,
          1
        ]
      },
      {
        "input": [
          [
            1,
            0,
            0,
            1,
            0,
            1,
            1
          ]
        ],
        "expected": [
          0,
          1,
          1,
          0,
          0,
          1,
          1
        ]
      },
      {
        "input": [
          [
            0,
            1,
            1,
            0,
            1,
            0,
            0,
            1
          ]
        ],
        "expected": [
          1,
          1,
          1,
          0,
          0,
          1,
          1,
          0
        ]
      }
    ]
  }
];
