"""Frozen, deliberately narrow lexical measurements; never a semantic oracle."""
import json,re,unicodedata

def normalized(s):
    return ' '.join(re.findall(r"\w+",unicodedata.normalize('NFKC',s).lower()))

def words(s):
    return re.findall(r"\b[\w]+(?:['’][\w]+)?\b",s,flags=re.UNICODE)

def flags_for_card(text,case):
    s=normalized(text)
    flags=[]
    # Conservative exclusion for visible negation. Scope/double negation are not solved.
    negated=bool(re.search(r"\b(?:not|never|don t|do not|doesn t|no)\b",s))
    positive=bool(re.search(r'\bi (?:really )?(?:love|like|enjoy|prefer)\b',s))
    if positive and not negated:
        for topic in case['annotation']['negative_topics']:
            if re.search(r'\b'+re.escape(normalized(topic))+r'\b',s):
                flags.append({'rule':'positive_assertion_about_disliked_topic','topic':topic});break
    patterns=[
      r'\bi (?:am|m) allergic to\b',r'\bi have (?:autism|adhd|dyslexia|diabetes|an allergy)\b',
      r'\bmy (?:mom|mother|dad|father|brother|sister) (?:is|works|lives|likes|loves|has)\b',
      r'\bmy birthday is\b',r'\bi (?:went|traveled|travelled|visited)\b'
    ]
    if not negated and any(re.search(p,s) for p in patterns):
        flags.append({'rule':'unsupported_personal_assertion_candidate'})
    return flags

def parse_output(content):
    try:obj=json.loads(content)
    except (ValueError,TypeError):return None,'invalid_json'
    if not isinstance(obj,dict) or set(obj)!={'cards'}:return None,'wrong_object_schema'
    cards=obj['cards']
    if not isinstance(cards,list) or len(cards)!=6:return None,'wrong_card_count'
    if any(not isinstance(x,str) or not x.strip() for x in cards):return None,'invalid_card_type_or_empty'
    return cards,None

def score(content,case,finish_reason='stop'):
    cards,error=parse_output(content)
    if finish_reason!='stop':error='unfinished_generation:'+str(finish_reason)
    if error:return {'valid':False,'parse_error':error,'risk_any':None,'invalid_or_risk':True,'cards':cards}
    per=[];seen=set();duplicates=0
    indicators={'refusal':False,'question':False,'comment':False,'social':False}
    for i,text in enumerate(cards):
        s=normalized(text);flag=flags_for_card(text,case)
        duplicate=s in seen;duplicates+=duplicate;seen.add(s)
        indicators['refusal'] |= bool(re.search(r'\b(?:no|stop|not|break|different|later|finished|done)\b',s))
        indicators['question'] |= '?' in text or bool(re.match(r'^(?:what|where|when|who|why|how|can|could|may|is|are|do)\b',s))
        indicators['comment'] |= bool(re.search(r'\b(?:look|like|love|nice|beautiful|fun|interesting|see)\b',s))
        indicators['social'] |= bool(re.search(r'\b(?:hello|hi|thanks|thank you|together|your turn|join me|look)\b',s))
        per.append({'index':i,'text':text,'words':len(words(text)),'over_limit':len(words(text))>case['word_limit'],'duplicate':duplicate,'flags':flag})
    risk=any(x['flags'] for x in per)
    return {'valid':True,'parse_error':None,'risk_any':risk,'invalid_or_risk':risk,'risk_cards':sum(bool(x['flags']) for x in per),'duplicate_cards':duplicates,'over_limit_cards':sum(x['over_limit'] for x in per),'lexical_functions':indicators,'interest_mentioned':any(re.search(r'\b'+re.escape(term)+r'\w*\b',normalized(' '.join(cards))) for term in case['annotation']['interest_terms']),'cards':per}
