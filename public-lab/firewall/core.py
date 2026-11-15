"""Small, explainable output gate; deliberately not a semantic or clinical oracle."""
from dataclasses import dataclass, asdict
import json, re

@dataclass
class Decision:
    allowed: bool
    cards: list[str]
    reasons: list[dict]
    normalized: bool = False
    def to_dict(self): return asdict(self)

def _clean(text):
    s=(text or '').strip(); changed=False
    if s.startswith('```'):
        parts=s.split('\n',1); s=parts[1] if len(parts)==2 else s; s=s.rsplit('```',1)[0].strip(); changed=True
    return s,changed

def inspect(raw, *, word_limit=8, expected_cards=6, forbidden_topics=()):
    reasons=[]; s,normalized=_clean(raw)
    try: obj=json.loads(s)
    except Exception: return Decision(False,[],[{'code':'invalid_json','message':'Output is not a JSON object.'}],normalized)
    if not isinstance(obj,dict) or set(obj)!={'cards'}: return Decision(False,[],[{'code':'schema','message':'Expected only a cards key.'}],normalized)
    cards=obj.get('cards')
    if not isinstance(cards,list) or len(cards)!=expected_cards: return Decision(False,[],[{'code':'card_count','message':f'Expected exactly {expected_cards} cards.'}],normalized)
    if any(not isinstance(c,str) or not c.strip() for c in cards): return Decision(False,[],[{'code':'empty_card','message':'Every card must be nonempty text.'}],normalized)
    seen=set()
    for i,c in enumerate(cards):
        words=len(re.findall(r"\b[\w]+(?:['’][\w]+)?\b",c))
        if words>word_limit: reasons.append({'code':'word_limit','index':i,'message':f'Card has {words} words; maximum is {word_limit}.'})
        key=' '.join(c.casefold().split())
        if key in seen: reasons.append({'code':'duplicate','index':i,'message':'Card repeats an earlier card.'})
        seen.add(key)
        low=c.casefold()
        for topic in forbidden_topics:
            if re.search(r'\b'+re.escape(topic.casefold())+r'\b',low): reasons.append({'code':'forbidden_topic','index':i,'topic':topic,'message':'Card contains a topic excluded by this case.'})
    return Decision(not reasons,cards,reasons,normalized)
