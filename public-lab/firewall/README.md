# PhraseLab Safety Firewall

The firewall accepts a candidate JSON object and returns an explainable decision. It checks structure, card count, empty cards, word limits, duplicates, and case-specific forbidden topics. It does not claim to understand intent, safety, diagnosis, or clinical usefulness.

```python
from firewall import inspect
decision = inspect('{"cards":["one","two","three","four","five","six"]}')
print(decision.allowed, decision.reasons)
```
