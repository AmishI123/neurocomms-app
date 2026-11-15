"""Validate Reading Lab exports without assessing reading ability."""
from pathlib import Path
import argparse, json, sys
CHOICES={'clear','hard-to-read','unsure'}
def validate(data):
    errors=[]
    if not isinstance(data,dict): return ['session must be an object']
    if data.get('fictional') is not True: errors.append('fictional must be true')
    events=data.get('events');
    if not isinstance(events,list): return errors+['events must be a list']
    for i,e in enumerate(events):
        if not isinstance(e,dict): errors.append(f'event {i+1} must be an object');continue
        if e.get('choice') not in CHOICES: errors.append(f'event {i+1} has unknown choice')
        for key,lo,hi in (('font_px',14,34),('line_height',1,2.4),('measure_chars',30,80)):
            x=e.get(key)
            if not isinstance(x,(int,float)) or not lo<=x<=hi: errors.append(f'event {i+1} {key} out of range')
    return errors
def main():
    p=argparse.ArgumentParser();p.add_argument('session');a=p.parse_args();data=json.loads(Path(a.session).read_text());errors=validate(data)
    if errors: print('\n'.join(errors));return 1
    print(json.dumps({'valid':True,'events':len(data['events'])}));return 0
if __name__=='__main__':sys.exit(main())
