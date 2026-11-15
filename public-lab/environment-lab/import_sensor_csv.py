"""Convert a generic, user-owned sensor CSV into an Environment Lab session."""
from pathlib import Path
import argparse, csv, json, sys
from validate_session import validate

def convert(path):
    events=[]
    with Path(path).open(newline='') as f:
        for n,row in enumerate(csv.DictReader(f),1):
            try:
                events.append({'timestamp':row.get('timestamp',''),'preset':row.get('preset','sensor-import'),
                    'sound_db_simulated':float(row['sound_db']),'light_pct_simulated':float(row['light_pct']),
                    'choice':row['choice']})
            except (KeyError,ValueError) as e: raise ValueError(f'row {n}: missing or invalid field') from e
    return {'schema_version':'1.0','fictional':True,'source':'user-supplied CSV; values are not verified','events':events}
def main():
    p=argparse.ArgumentParser();p.add_argument('csv_file');p.add_argument('-o','--output',default='environment-session.json');a=p.parse_args()
    try: data=convert(a.csv_file); errors=validate(data)
    except ValueError as e: print(e);return 1
    if errors: print('\n'.join(errors));return 1
    Path(a.output).write_text(json.dumps(data,indent=2)+'\n');print(json.dumps({'valid':True,'events':len(data['events'])}));return 0
if __name__=='__main__':sys.exit(main())
