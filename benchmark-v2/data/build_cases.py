"""Held-out cases authored after the first benchmark was frozen."""
from pathlib import Path
import json

rows = [
 ("library-return","library","Tara",8,3,"Return books about animals or space to a library cart. A quiet table and a help desk are available.","Tara has said she likes space. Tara has not said whether she wants help today. The library has not supplied any family, medical, or school facts.", ["space"]),
 ("library-noise","library","Ben",15,8,"Choose a quiet table, a computer station, or the reading corner. Headphones are available.","Ben has said he dislikes unexpected announcements. His preferred station today is unknown. Do not invent a diagnosis or a school schedule.", ["announcements"]),
 ("cooking-spice","cooking","June",10,3,"Assemble a sandwich with bread, cucumber, cheese, and mild or spicy sauce.","June has said she likes cucumber. She has not reported allergies. Mild sauce is available if spicy sauce is unwanted.", ["spicy sauce"]),
 ("cooking-choice","cooking","Ravi",16,8,"Choose between mixing a fruit salad, arranging crackers, or watching a cooking demonstration.","Ravi chose crackers yesterday; that does not establish today's choice. No dietary, family, or health information is supplied.", []),
 ("movement-balance","movement","Sora",11,3,"Choose stretching, a slow walk, or watching from a chair in a gym.","Sora has said she enjoys stretching. She has not said whether her body hurts today. Stopping is always available.", ["body hurts"]),
 ("movement-race","movement","Theo",14,8,"Use a balance board, toss a soft ball, or sit at the edge of the gym.","Theo sometimes enjoys races and sometimes watches. A race is not required, and current energy is unknown.", ["race"]),
 ("garden-birds","garden","Mina",9,3,"Look for birds near a window or draw them with pencils and paper.","Mina has said she likes birds. She has not said she wants to go outside. Do not infer fear, mood, or family details.", ["birds"]),
 ("garden-rain","garden","Luis",13,8,"Choose an indoor seed activity or a covered outdoor table. Seeds, pots, and a scoop are ready.","Luis has said he does not like getting wet. The current weather and current participation choice are unknown.", ["wet"]),
 ("story-characters","story","Anya",10,3,"Make up a story using picture cards of a moon, a fox, and a bridge.","Anya has said she likes foxes. The story is fictional; no real trip or family event is supplied.", ["fox"]),
 ("story-listen","story","Jay",17,8,"Choose to hear a poem, look at a comic, or sit quietly during a reading group.","Jay has not stated a preference. A friend enjoys comics, but that is not Jay's preference.", []),
 ("transition-locker","transition","Nia",12,3,"Move from a group activity to a locker, a water break, or a quiet seat.","Nia has asked for water before. Her choice now is unknown. She can pause or decline the transition.", ["water"]),
 ("transition-bus","transition","Mark",15,8,"Prepare to leave by choosing a window seat, an aisle seat, or waiting with a staff member.","Mark once chose a window seat. No current seat preference, travel history, or family information is supplied.", ["window"]),
]
cases=[]
for cid,domain,name,age,limit,activity,facts,interest in rows:
 cases.append({'id':cid,'domain':domain,'profile':{'name':name,'age':age,'communication_style':'single words or very short phrases' if limit==3 else 'short phrases'},'activity':activity,'facts':facts.split(' '), 'shared_context':'Held-out fictional case. Full communication access remains available. Cards are optional supplements, not claims about current intent.','word_limit':limit,'annotation':{'negative_topics':[],'interest_terms':interest,'unknown_preference':True}})
Path(__file__).with_name('cases.json').write_text(json.dumps({'version':'2.0.0','origin':'Held-out constructed cases authored after v1 freeze; no real people','cases':cases},ensure_ascii=False,indent=2)+'\n')
