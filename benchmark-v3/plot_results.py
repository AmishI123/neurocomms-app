"""Standalone scientific figures from archived measurements (no model calls)."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parent

def plot():
 d=json.loads((ROOT/'results/analysis.json').read_text());out=ROOT/'figures';out.mkdir(exist_ok=True)
 conditions=['basic','context','review'];labels=['Basic','Context-aware','Review'];colors=['#8b9b84','#4f806a','#244e43']
 fig,axes=plt.subplots(1,3,figsize=(11,3.8),layout='constrained')
 panels=[('Invalid or risk-flagged\n(% of all outputs)',lambda s:100*s['invalid_or_risk']/s['outputs']),('Invalid format\n(% of all outputs)',lambda s:100*s['invalid']/s['outputs']),('Over word limit\n(% of cards in valid outputs)',lambda s:100*s['over_limit_cards']/(6*s['valid']) if s['valid'] else 0)]
 for ax,(title,fn) in zip(axes,panels):
  values=[fn(d['summaries'][c]) for c in conditions];bars=ax.bar(labels,values,color=colors,width=.6)
  ax.set_title(title,fontsize=10);ax.set_ylim(0,110);ax.set_yticks([0,25,50,75,100]);ax.grid(axis='y',alpha=.18);ax.set_axisbelow(True);ax.spines[['top','right']].set_visible(False);ax.tick_params(axis='x',labelsize=9)
  for bar,value,c in zip(bars,values,conditions):
   label=f'{value:.1f}%' if d['summaries'][c]['valid'] or 'cards' not in title else 'N/A'
   ax.text(bar.get_x()+bar.get_width()/2,value+2,label,ha='center',fontsize=9)
 fig.suptitle('PhraseBench: 12 constructed cases × 3 seeds per workflow',fontsize=12)
 for ext in ['png','svg','pdf']:fig.savefig(out/f'measurements.{ext}',dpi=180)
 plt.close(fig)
 fig,ax=plt.subplots(figsize=(8,3.5),layout='constrained')
 labels=[];i=0
 for key in ['context_minus_basic','review_minus_context']:
  for metric in ['invalid_or_risk','risk_any']:
   r=d['comparisons'][key][metric];label=key.replace('_',' ')+' / '+('all-output composite' if metric=='invalid_or_risk' else 'flags among valid')
   labels.append(label)
   if r['difference'] is not None:
    point=100*r['difference'];lo,hi=[100*x for x in r['ci95']];ax.errorbar(point,i,xerr=[[max(0,point-lo)],[max(0,hi-point)]],fmt='o',color='#285e4c',capsize=4);ax.annotate(f'n={r["cases"]} cases',(point,i),xytext=(7,8),textcoords='offset points',fontsize=8)
   else:ax.text(0,i,'No defined pairs',fontsize=9)
   i+=1
 ax.set_yticks(range(i),labels,fontsize=9);ax.axvline(0,color='#aaa',linestyle='--',linewidth=1);ax.set_xlabel('Paired difference (percentage points)');ax.set_title('Exploratory case-bootstrap 95% intervals',fontsize=12);ax.set_xlim(-105,105);ax.spines[['top','right']].set_visible(False);ax.grid(axis='x',alpha=.15);ax.invert_yaxis()
 for ext in ['png','svg','pdf']:fig.savefig(out/f'paired-differences.{ext}',dpi=180)
 plt.close(fig);print('Wrote six figure artifacts')
if __name__=='__main__':plot()
