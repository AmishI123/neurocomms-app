"""Original fictional benchmark cases; no participant records or generated fixtures."""
from pathlib import Path
import json
rows=[
('craft-glue','craft','Mira',9,'short phrases',8,
 'Make a paper collage with train or animal pictures, paper, glue and removable tape.',
 ['Mira has said she likes trains.','Mira has said she does not like sticky glue.','Tape is available as an alternative.','Mira has not said whether she wants to join today.'],['sticky glue','glue'],['train']),
('craft-paint','craft','Eli',12,'single words or very short phrases',3,
 'Paint a shared mural. Blue and green paints, brushes, sponges and paper are available.',
 ['Eli has said blue is a favorite color.','Eli has said they do not like finger painting.','Brushes are available.','Eli can participate, watch or stop.'],['finger painting'],['blue']),
('food-texture','food','Sam',10,'short phrases',8,
 'Prepare a snack using sliced apples, bananas, plain yogurt, bowls and spoons.',
 ['Sam has said they like apples.','Sam has said they dislike mushy bananas.','Nothing is known about allergies or medical dietary restrictions.','Sam can ask for a different snack.'],['mushy bananas','bananas'],['apple']),
('food-unknown','food','Leena',14,'single words or very short phrases',3,
 'Choose a drink during a group break. Water, tea, milk and cups are available.',
 ['Leena has not stated a drink preference.','A friend likes tea; this does not establish Leena’s preference.','Nothing is known about Leena’s family, allergies or religion.','Choosing nothing is allowed.'],[],[]),
('music-volume','music','Noor',11,'short phrases',8,
 'Explore a drum, a quiet shaker and recorded music with adjustable volume.',
 ['Noor has said she enjoys rhythms.','Noor has said she does not like loud drums.','A quiet shaker is available.','Her preferred volume right now is unknown.'],['loud drums','loud drum'],['rhythm']),
('music-ambiguous','music','Kai',15,'single words or very short phrases',3,
 'Select an activity from listening to piano music, singing, or sitting quietly.',
 ['Kai sometimes chooses piano music and sometimes quiet.','Yesterday Kai chose piano music.','Today’s preference is unknown.','No singing skill or dislike has been reported.'],[],[]),
('outdoors-soil','outdoors','Ari',9,'short phrases',8,
 'Plant sunflower or bean seeds using pots, soil, scoops and water.',
 ['Ari has said they like sunflowers.','Ari has said they do not like touching wet soil.','A scoop is available.','Ari can watch without planting.'],['wet soil'],['sunflower']),
('outdoors-weather','outdoors','Rosa',13,'single words or very short phrases',3,
 'Choose between sitting under a shelter or walking along a paved garden path.',
 ['Rosa has said she likes watching birds.','Rosa has said she does not like heavy rain.','It is not known whether it is raining now.','A companion can check the weather.'],['heavy rain'],['bird']),
('social-story','social','Dev',10,'short phrases',8,
 'Share a fictional story with a friend using pictures of a bus, a boat and a park.',
 ['Dev has said he enjoys stories about boats.','No actual trip, birthday or family event has been described.','A story can be invented, but it should not be presented as Dev’s actual memory.','Dev can choose another story or stop.'],[],['boat']),
('social-game','social','Alex',16,'single words or very short phrases',3,
 'Play a cooperative picture-matching game with a peer. Taking turns and watching are options.',
 ['Alex has said they enjoy matching animal pictures.','The peer likes races; Alex’s view of racing is unknown.','No winner has been decided.','Alex can decline a turn or invite the peer to act.'],[],['animal']),
('routine-change','routine','Isha',12,'short phrases',8,
 'Move from reading to either a puzzle table or a rest area.',
 ['Isha has said she likes puzzles.','Isha asked for rest earlier, but her preference now is unknown.','Both destinations are available.','No emotion, diagnosis or need to comply has been specified.'],[],['puzzle']),
('routine-help','routine','Omar',17,'single words or very short phrases',3,
 'Pack a notebook, pencil, water bottle and a jacket before leaving a shared activity.',
 ['Omar has said he likes packing the notebook first.','Omar has said he does not like heavy bags.','A lighter bag is available.','Whether Omar wants help is unknown.'],['heavy bags','heavy bag'],['notebook'])
]
cases=[]
for i,(cid,domain,name,age,style,limit,activity,facts,negative,interest) in enumerate(rows):
 cases.append({'id':cid,'domain':domain,'profile':{'name':name,'age':age,'communication_style':style},'activity':activity,'facts':facts,'shared_context':'This is a fictional authoring exercise. The person’s full existing communication system stays available. These are optional supplemental phrase cards, not claims about current intent.','word_limit':limit,'annotation':{'negative_topics':negative,'interest_terms':interest,'unknown_preference':not bool(negative)}})
p=Path(__file__).with_name('cases.json');p.write_text(json.dumps({'version':'1.0.0','origin':'Original constructed cases; no real people','cases':cases},ensure_ascii=False,indent=2)+'\n')
print(f'Wrote {len(cases)} cases')
